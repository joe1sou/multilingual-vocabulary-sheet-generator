import "client-only";

import type { VocabularySheet } from "@/lib/types";

function safeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70) || "vocabulary-sheet";
}

export async function exportWorksheetPptx(sheet: VocabularySheet) {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "A4_LANDSCAPE", width: 11.6929, height: 8.2677 });
  pptx.layout = "A4_LANDSCAPE";
  pptx.author = "Joe Ramses";
  pptx.company = "Joe Ramses";
  pptx.subject = "Editable multilingual vocabulary worksheet";
  pptx.title = sheet.title;
  pptx.theme = {
    headFontFace: "Arial",
    bodyFontFace: "Arial",
  };

  const slide = pptx.addSlide();
  slide.background = { color: "FAF9FC" };
  slide.addText(sheet.title, {
    x: 0.48,
    y: 0.28,
    w: 8.2,
    h: 0.38,
    fontFace: "Arial",
    fontSize: 20,
    bold: true,
    color: "251B38",
    margin: 0,
    breakLine: false,
    fit: "shrink",
  });
  slide.addText("English + translated vocabulary", {
    x: 8.78,
    y: 0.33,
    w: 2.42,
    h: 0.24,
    fontFace: "Arial",
    fontSize: 8.5,
    color: "6E6579",
    align: "right",
    margin: 0,
  });

  const columns = 4;
  const cardWidth = 2.57;
  const cardHeight = 3.39;
  const gapX = 0.14;
  const gapY = 0.16;
  const startX = 0.48;
  const startY = 0.79;

  for (let index = 0; index < 8; index += 1) {
    const item = sheet.items[index];
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = startX + column * (cardWidth + gapX);
    const y = startY + row * (cardHeight + gapY);

    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: cardWidth,
      h: cardHeight,
      rectRadius: 0.08,
      fill: { color: "FFFFFF" },
      line: { color: "DDD6E6", width: 1.2 },
      shadow: { type: "outer", color: "352748", opacity: 0.08, blur: 1, angle: 45, offset: 1 },
    });

    if (!item) continue;

    if (item.imageDataUrl) {
      slide.addImage({
        data: item.imageDataUrl,
        x: x + 0.12,
        y: y + 0.12,
        w: cardWidth - 0.24,
        h: 2.05,
        transparency: 0,
      });
    } else {
      slide.addShape(pptx.ShapeType.rect, {
        x: x + 0.12,
        y: y + 0.12,
        w: cardWidth - 0.24,
        h: 2.05,
        fill: { color: "F3EFF7" },
        line: { color: "E5DEEB", width: 0.7 },
      });
      slide.addText("Illustration unavailable", {
        x: x + 0.3,
        y: y + 0.99,
        w: cardWidth - 0.6,
        h: 0.25,
        fontFace: "Arial",
        fontSize: 9,
        color: "776C83",
        align: "center",
        margin: 0,
      });
    }

    slide.addText(item.english, {
      x: x + 0.14,
      y: y + 2.33,
      w: cardWidth - 0.28,
      h: 0.34,
      fontFace: "Arial",
      fontSize: 17,
      bold: true,
      color: "2D213B",
      align: "center",
      valign: "middle",
      margin: 0,
      fit: "shrink",
    });
    slide.addShape(pptx.ShapeType.line, {
      x: x + 0.42,
      y: y + 2.79,
      w: cardWidth - 0.84,
      h: 0,
      line: { color: "E6E0EB", width: 0.8 },
    });
    slide.addText(item.translation, {
      x: x + 0.14,
      y: y + 2.89,
      w: cardWidth - 0.28,
      h: 0.34,
      fontFace: "Arial",
      fontSize: 15,
      bold: true,
      color: "6C42A1",
      align: "center",
      valign: "middle",
      rtlMode: sheet.targetLanguage === "arabic",
      margin: 0,
      fit: "shrink",
    });
  }

  await pptx.writeFile({ fileName: `${safeFilename(sheet.title)}.pptx` });
}
