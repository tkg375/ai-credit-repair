import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const PAGE_WIDTH = 612; // 8.5 inches at 72 DPI
const PAGE_HEIGHT = 792; // 11 inches at 72 DPI
const MARGIN = 72; // 1 inch margins
const FONT_SIZE = 11;
const LINE_HEIGHT = 16;
const MAX_TEXT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

/**
 * Convert plain text letter content to a formatted PDF.
 * Returns the PDF as a Uint8Array.
 */
export async function generateLetterPdf(letterContent: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const lines = wrapText(letterContent, font, FONT_SIZE, MAX_TEXT_WIDTH);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  for (const line of lines) {
    // Start a new page if we're running out of space
    if (y < MARGIN + LINE_HEIGHT) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }

    // Detect section headers (all caps lines or lines starting with specific patterns)
    const isHeader =
      line.length > 0 &&
      line.length < 80 &&
      (line === line.toUpperCase() && /[A-Z]/.test(line) && !line.startsWith("---"));

    // Skip separator lines
    if (line.trim() === "---") {
      y -= LINE_HEIGHT;
      continue;
    }

    const currentFont = isHeader ? boldFont : font;
    const currentSize = isHeader ? 12 : FONT_SIZE;

    page.drawText(line, {
      x: MARGIN,
      y,
      size: currentSize,
      font: currentFont,
      color: rgb(0.1, 0.1, 0.1),
    });

    y -= LINE_HEIGHT;
  }

  return pdfDoc.save();
}

/** Word-wrap text to fit within maxWidth at the given font size. */
function wrapText(
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  fontSize: number,
  maxWidth: number
): string[] {
  const paragraphs = text.split("\n");
  const result: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === "") {
      result.push("");
      continue;
    }

    // Don't wrap short lines or header-style lines
    const width = font.widthOfTextAtSize(paragraph, fontSize);
    if (width <= maxWidth) {
      result.push(paragraph);
      continue;
    }

    // Word wrap
    const words = paragraph.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth && currentLine) {
        result.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      result.push(currentLine);
    }
  }

  return result;
}
