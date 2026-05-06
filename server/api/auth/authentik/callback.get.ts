import { eq } from 'drizzle-orm';
import * as tables from '../../../database/schema'; 

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code as string;
  const state = query.state as string;
  const error = query.error as string;
  
  if (error || !code) {
    return sendRedirect(event, '/login?error=authentik_denied');
  }

  const savedState = getCookie(event, 'authentik_oauth_state');
  if (!state || state !== savedState) {
    return sendRedirect(event, '/login?error=invalid_state');
  }

  const config = useRuntimeConfig();

  try {
    const basicAuth = Buffer.from(`${config.authentikClientId}:${config.authentikClientSecret}`).toString('base64');
    
    const tokenResponse = await $fetch<any>(`${config.authentikBaseUrl}/application/o/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.authentikCallbackUrl
      })
    });

    const accessToken = tokenResponse.access_token;

    const userInfo = await $fetch<any>(`${config.authentikBaseUrl}/application/o/userinfo/`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    // The user mentioned they login with ThaiD via Authentik and have cid or pid
    const cid = userInfo.pid || userInfo.cid || userInfo.preferred_username || userInfo.nickname || userInfo.sub;
    const email = userInfo.email;
    const name = userInfo.name || cid;

    if (!cid) {
      throw new Error('Authentik did not return a valid user identity (cid/pid missing)');
    }

    const db = useDrizzle();
    
    let user = await db.query.users.findFirst({
      where: eq(tables.users.cid, cid)
    });

    if (!user) {
      const [insertResult] = await db.insert(tables.users).values({
         cid,
         email,
         name,
         nameEn: name,
         role: 'user',
      });
      
      user = await db.query.users.findFirst({
        where: eq(tables.users.id, insertResult.insertId)
      });
    }

    await setUserSession(event, {
      user: {
        id: user!.id,
        email: user!.email || email || `${cid}@authentik.local`,
        name: user!.nameEn || user!.name || `CID: ${cid}`,
        role: user!.role,
      },
    });

    return sendRedirect(event, '/dashboard');

  } catch (err: any) {
    console.error('Authentik OAuth Error:', err);
    return sendRedirect(event, '/login?error=authentik_failed');
  }
});
