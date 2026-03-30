import { defineEventHandler, readBody, createError } from 'h3';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType } from 'docx';
import { marked } from 'marked';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  let { markdown, filename = 'OCR_Result.docx' } = body;

  if (!markdown) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No markdown content provided',
    });
  }

  try {
    // 1. Cleaning and Marker Detection
    const cleanLine = (text: string) => {
        return text.replace(/\[CENTER\]/g, '').trim();
    };

    const tokens = marked.lexer(markdown);
    
    // 2. Thai Document Configuration
    const FONT_FAMILY = "TH Sarabun New";
    const BASE_FONT_SIZE = 16 * 2; 
    const HEADING_FONT_SIZE = 18 * 2;
    const LINE_SPACING = 360; // 1.5 line spacing (240 * 1.5)

    const processInlineTokens = (tokens: any[]) => {
      const runs: TextRun[] = [];
      const traverse = (tks: any[]) => {
        for (const token of tks) {
          if (token.type === 'text') {
            runs.push(new TextRun({
              text: cleanLine(token.text),
              font: FONT_FAMILY,
              size: BASE_FONT_SIZE,
            }));
          } else if (token.type === 'strong' || token.type === 'em') {
             runs.push(new TextRun({
               text: cleanLine(token.text || (token.tokens ? "" : token.raw)),
               bold: token.type === 'strong',
               italics: token.type === 'em',
               font: FONT_FAMILY,
               size: BASE_FONT_SIZE,
             }));
             if (token.tokens) traverse(token.tokens);
          } else if (token.raw) {
             runs.push(new TextRun({
               text: cleanLine(token.raw),
               font: FONT_FAMILY,
               size: BASE_FONT_SIZE,
             }));
          }
        }
      };
      traverse(tokens);
      return runs;
    };

    const parseHtmlTable = (html: string) => {
        const rows: TableRow[] = [];
        const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
        const tdRegex = /<(td|th)[^>]*>([\s\S]*?)<\/\1>/gi;
        
        let trMatch;
        while ((trMatch = trRegex.exec(html)) !== null) {
            const cells: TableCell[] = [];
            let tdMatch;
            const rowHtml = trMatch[1] || '';
            while (rowHtml && (tdMatch = tdRegex.exec(rowHtml)) !== null) {
                const isHeader = (tdMatch[1] || '').toLowerCase() === 'th';
                const cellText = (tdMatch[2] || '').replace(/<[^>]*>/g, '').trim();
                cells.push(new TableCell({
                    children: [new Paragraph({ 
                        children: [new TextRun({ text: cellText, bold: isHeader, font: FONT_FAMILY, size: BASE_FONT_SIZE })],
                        alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT
                    })],
                    shading: isHeader ? { fill: "EEEEEE", type: ShadingType.CLEAR } : undefined,
                    verticalAlign: "center"
                }));
            }
            if (cells.length > 0) {
                rows.push(new TableRow({ children: cells }));
            }
        }
        return rows;
    };

    const processTokens = (tokens: any[]) => {
      const children: any[] = [];
      
      for (const token of tokens) {
        const rawContent = token.raw || '';
        const isCentered = rawContent.includes('[CENTER]');
        const alignment = isCentered ? AlignmentType.CENTER : AlignmentType.LEFT;

        if (token.type === 'heading') {
          children.push(new Paragraph({
            children: [new TextRun({ text: cleanLine(token.text), bold: true, font: FONT_FAMILY, size: HEADING_FONT_SIZE })],
            spacing: { before: 240, after: 120, line: LINE_SPACING },
            alignment: alignment
          }));
        } else if (token.type === 'paragraph' || token.type === 'text') {
           // Check for <page_number>
           if (rawContent.includes('<page_number>')) {
              const pageNum = rawContent.match(/<page_number>(.*?)<\/page_number>/)?.[1] || '';
              children.push(new Paragraph({
                 children: [new TextRun({ text: `Page ${pageNum}`, font: FONT_FAMILY, size: 20, italics: true })],
                 alignment: AlignmentType.RIGHT,
                 spacing: { before: 400, after: 100 }
              }));
              continue;
           }

           // Check for <figure>
           if (rawContent.includes('<figure>')) {
              const figureDesc = rawContent.replace(/<figure>|<\/figure>/g, '').trim();
              children.push(new Paragraph({
                 children: [new TextRun({ text: `[ภาพ/แผนภูมิ: ${figureDesc}]`, font: FONT_FAMILY, size: BASE_FONT_SIZE - 4, italics: true, color: "666666" })],
                 alignment: AlignmentType.CENTER,
                 spacing: { before: 200, after: 200 },
                 border: { top: { style: BorderStyle.DASHED, size: 1 }, bottom: { style: BorderStyle.DASHED, size: 1 } }
              }));
              continue;
           }

          const runs = token.tokens ? processInlineTokens(token.tokens) : [new TextRun({ text: cleanLine(token.text || token.raw || ''), font: FONT_FAMILY, size: BASE_FONT_SIZE })];
          if (runs.length === 0) continue;
          children.push(new Paragraph({
            children: runs,
            spacing: { before: 120, after: 120, line: LINE_SPACING },
            alignment: alignment
          }));
        } else if (token.type === 'html') {
           if (rawContent.includes('<table')) {
              const rows = parseHtmlTable(rawContent);
              if (rows.length > 0) {
                 children.push(new Table({
                    rows: rows,
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 2 },
                        bottom: { style: BorderStyle.SINGLE, size: 2 },
                        left: { style: BorderStyle.SINGLE, size: 2 },
                        right: { style: BorderStyle.SINGLE, size: 2 },
                        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                    }
                 }));
              }
           }
        } else if (token.type === 'list') {
          token.items.forEach((item: any) => {
             children.push(new Paragraph({
               children: item.tokens ? processInlineTokens(item.tokens) : [new TextRun({ text: cleanLine(item.text), font: FONT_FAMILY, size: BASE_FONT_SIZE })],
               bullet: { level: 0 },
               spacing: { before: 60, after: 60, line: LINE_SPACING },
               indent: { left: 720, hanging: 360 }
             }));
          });
        } else if (token.type === 'table') {
          // Standard Markdown Table fallback
          const rows = [];
          const headerCells = token.header.map((cell: any) => new TableCell({
            children: [new Paragraph({ 
               children: [new TextRun({ text: cell, bold: true, font: FONT_FAMILY, size: BASE_FONT_SIZE })],
               alignment: AlignmentType.CENTER 
            })],
            shading: { fill: "EEEEEE" },
            verticalAlign: "center"
          }));
          rows.push(new TableRow({ children: headerCells }));
          token.rows.forEach((row: any) => {
            const cells = row.map((cell: any) => new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: cell, font: FONT_FAMILY, size: BASE_FONT_SIZE })] })],
              verticalAlign: "center"
            }));
            rows.push(new TableRow({ children: cells }));
          });
          children.push(new Table({
            rows: rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2 },
              bottom: { style: BorderStyle.SINGLE, size: 2 },
              left: { style: BorderStyle.SINGLE, size: 2 },
              right: { style: BorderStyle.SINGLE, size: 2 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            }
          }));
        } else if (token.type === 'hr') {
           children.push(new Paragraph({
             border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } }
           }));
        }
      }
      return children;
    };

    const docChildren = processTokens(tokens);

    const doc = new Document({
      sections: [{
        properties: {
          page: {
             margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children: docChildren,
      }],
      styles: {
        default: {
            document: {
                run: { font: FONT_FAMILY, size: BASE_FONT_SIZE },
                paragraph: { spacing: { line: LINE_SPACING } }
            },
        },
      }
    });

    const buffer = await Packer.toBuffer(doc);
    
    event.node.res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    event.node.res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    
    return buffer;

  } catch (error: any) {
    console.error('Word Export Error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error generating Word document',
    });
  }
});
