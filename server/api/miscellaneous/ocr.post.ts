import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);
  const { imageUrls, model = 'typhoon-ocr' } = body;

  const apiKey = process.env.TYPHOON_API_KEY;
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Typhoon API Key is not configured in .env',
    });
  }

  if (!imageUrls || !Array.isArray(imageUrls)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input: imageUrls must be an array of base64 data URLs',
    });
  }

  try {
    // Typhoon OCR expects messages in a vision-ready format
    // We can send multiple images in one prompt or sequential calls.
    // Usually OCR is one page at a time for best results, or all in one if the model supports it.
    // The subagent said Typhoon OCR is optimized for document parsing.
    
    // Constructing vision content
    const content = [
      {
        type: "text",
        text: "ถอดข้อความจากรูปภาพ (Document OCR) ทั้งหมดให้เป็น Markdown โดยจัดเก็บข้อมูลครบถ้วน 100% ห้ามข้ามส่วนใดทิ้ง:\n- รักษารูปแบบ 'จุดไข่ปลา' (........) สำหรับการเติมคำในช่องว่างอย่างละเอียดที่สุด\n- หากบรรทัดใดมีการจัดกึ่งกลาง ให้ใส่แท็ก <center> ครอบบรรทัดนั้น\n- เก็บรายละเอียดส่วนที่เป็น 'แบบฟอร์ม' เช่น ชื่อ ตำแหน่ง หน่วยงาน พร้อมจุดเติมคำ ให้ครบทั้งหมด\n- จัดรูปหน้าเอกสารทีละส่วนให้เหมือนต้นฉบับมากที่สุด โดยเฉพาะส่วนหัวกระดาษและส่วนชิดขวาหรือกึ่งกลาง"
      },
      ...imageUrls.map(url => ({
        type: "image_url",
        image_url: {
          url: url // Expecting data:image/png;base64,...
        }
      }))
    ];

    const response = await $fetch('https://api.opentyphoon.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract all text from the image for conversion to docx. (ถอดรายละเอียดเอกสาร 1:1 อย่างเคร่งครัด)

Instructions:
- Only return the clean Markdown. (คืนเฉพาะค่า Markdown ห้ามมีคำอธิบายเพิ่มเติม)
- Do not include any explanation or extra text.
- You must include all information on the page. (ห้ามข้ามส่วนชื่อ ตำแหน่ง หรือช่องว่างเติมคำ)

Formatting Rules:
- Alignment: If any line is centered, start the line with [CENTER].
- Dots: Keep all dots (........) exactly as shown for form filling.
- Tables: Render tables using <table>...</table> in clean HTML format.
- Equations: Render equations using LaTeX syntax with inline ($...$) and block ($$...$$).
- Images/Charts/Diagrams: Wrap any clearly defined visual areas (e.g. charts, diagrams, pictures) in:
<figure>
บรรยายองค์ประกอบหลักของรูปภาพ (คน, สิ่งของ, ข้อความ), ระบุเบาะแสเกี่ยวกับบริบท (สถานที่, เหตุการณ์, วัฒนธรรม), กล่าวถึงข้อความที่มองเห็นและความหมาย, ให้การวิเคราะห์เชิงลึกที่เกี่ยวข้อง (โดยเฉพาะสำหรับแผนภูมิทางการเงิน กราฟ หรือเอกสาร), ให้คำแนะนเกี่ยวกับสไตล์หรือสถาปัตยกรรมหากเกี่ยวข้อง จากนั้นสรุปภาพรวมสั้นๆ อธิบายด้วยภาษาไทย
</figure>
- Page Numbers: Wrap page numbers in <page_number>...</page_number> (e.g., <page_number>14</page_number>).
- Checkboxes: Use ☐ for unchecked and ☑ for checked boxes.`
              },
              ...imageUrls.map(url => ({
                type: "image_url",
                image_url: {
                  url: url
                }
              }))
            ]
          }
        ],
        max_tokens: 16384,
        temperature: 0.1,
        top_p: 0.6,
        extra_body: {
          repetition_penalty: 1.1 
        }
      }
    });

    return response;
  } catch (error: any) {
    console.error('Typhoon OCR API Error:', error);
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.response?._data?.error?.message || 'Error communicating with Typhoon API',
    });
  }
});
