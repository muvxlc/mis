import { eq } from 'drizzle-orm';
import { tables } from '#imports'; // Auto-imported or explicitly imported from utils/drizzle

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code as string;
  const state = query.state as string;
  const error = query.error as string;
  
  if (error || !code) {
    return sendRedirect(event, '/login?error=thaid_denied');
  }

  const savedState = getCookie(event, 'thaid_oauth_state');
  if (!state || state !== savedState) {
    return sendRedirect(event, '/login?error=invalid_state');
  }

  const config = useRuntimeConfig();

  try {
    // 1. Exchange auth code for access token
    const basicAuth = Buffer.from(`${config.thaidClientId}:${config.thaidClientSecret}`).toString('base64');
    
    const tokenResponse = await $fetch<any>('https://imauth.bora.dopa.go.th/api/v2/oauth2/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.thaidCallbackUrl
      })
    });

    const accessToken = tokenResponse.access_token;
    
    // Quick Debug Dump
    import('fs').then(fs => {
       fs.writeFileSync('thaid_token_debug.log', JSON.stringify(tokenResponse, null, 2));
    });

    // 2. Fetch User Info (PID, Name, Birthdate)
    let cid = '';
    let name_en = '';
    let birthdate = '';

    // First, check if the token response has the fields directly
    if (tokenResponse.pid) {
       cid = tokenResponse.pid;
       name_en = tokenResponse.name_en || tokenResponse.name || 'ThaiD User';
       birthdate = tokenResponse.birthdate || '';
    } else if (tokenResponse.id_token || (accessToken && accessToken.includes('.'))) {
       // Attempt to decode id_token OR access_token as JWT because ThaiD often puts data in the access_token directly
       const tokenToDecode = tokenResponse.id_token || accessToken;
       const payloadBase64 = tokenToDecode.split('.')[1];
       try {
         const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
         cid = payload.pid || payload.cid || payload.sub; 
         name_en = payload.name_en || payload.name || 'ThaiD User';
         birthdate = payload.birthdate || '';
       } catch (e) {
         console.error('Failed to parse JWT payload', e);
       }
    } 
    
    // Fallback if data is still missing (which we know might throw a 400 Bad Request error currently)
    if (!cid) {
       const userInfo = await $fetch<any>('https://imauth.bora.dopa.go.th/api/v2/oauth2/userinfo', {
         headers: { 'Authorization': `Bearer ${accessToken}` },
         params: { access_token: accessToken } // Some old APIs require it in query
       });
       cid = userInfo.pid || userInfo.cid || userInfo.sub;
       name_en = userInfo.name_en || userInfo.name || 'ThaiD User';
       birthdate = userInfo.birthdate || '';
    }

    if (!cid) {
      throw new Error('ThaiD did not return a valid Citizen ID');
    }

    const db = useDrizzle();
    
    // 3. Database check and insert
    let user = await db.query.users.findFirst({
      where: eq(tables.users.cid, cid)
    });

    if (!user) {
      const [insertResult] = await db.insert(tables.users).values({
         cid,
         email: `${cid}@thaid.com`,
         name: name_en,
         nameEn: name_en,
         birthdate,
         role: 'user',
      });
      
      user = await db.query.users.findFirst({
        where: eq(tables.users.id, insertResult.insertId)
      });
    } else if (!user.email) {
      // Update legacy users with no email
      await db.update(tables.users)
        .set({ email: `${cid}@thaid.com` })
        .where(eq(tables.users.id, user.id));
      user.email = `${cid}@thaid.com`;
    }

    // 4. Log them in (create session)
    await setUserSession(event, {
      user: {
        id: user!.id,
        email: user!.email || `${cid}@thaid.com`,
        name: user!.nameEn || user!.name || `ThaiD: ${cid}`,
        role: user!.role,
      },
    });

    return sendRedirect(event, '/dashboard');

  } catch (err: any) {
    console.error('ThaiD OAuth Error:', err);
    
    // Quick debug: Write error explicitly to a file so Antigravity can read it
    import('fs').then(fs => {
       fs.writeFileSync('thaid_debug.log', JSON.stringify({
         message: err.message,
         data: err.data,
         response: err.response?.data
       }, null, 2));
    });

    return sendRedirect(event, '/login?error=thaid_failed');
  }
});
