import "server-only";

import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import { extractText, getDocumentProxy } from "unpdf";
import {
  MAX_FILE_SIZE_BYTES,
  MAX_PDF_PAGES,
  MAX_PPTX_SLIDES,
} from "@/lib/constants";

export type ExtractionResult = {
  text: string;
  pageCount: number;
};

function normaliseText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/[\t ]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function collectTextNodes(value: unknown, result: string[] = []): string[] {
  if (typeof value === "string") {
    if (value.trim()) result.push(value.trim());
    return result;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectTextNodes(item, result);
    return result;
  }

  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (key === "a:t" && typeof item === "string") {
        if (item.trim()) result.push(item.trim());
      } else {
        collectTextNodes(item, result);
      }
    }
  }

  return result;
}

export async function extractPdf(buffer: Uint8Array): Promise<ExtractionResult> {
  const pdf = await getDocumentProxy(buffer);
  if (pdf.numPages > MAX_PDF_PAGES) {
    await pdf.destroy();
    throw new Error(`This PDF has ${pdf.numPages} pages. The prototype limit is ${MAX_PDF_PAGES}.`);
  }

  const { text, totalPages } = await extractText(pdf, { mergePages: true });
  await pdf.destroy();
  const cleaned = normaliseText(text);
  if (!cleaned) throw new Error("No readable text was found in this PDF.");
  return { text: cleaned, pageCount: totalPages };
}

export async function extractPptx(buffer: Uint8Array): Promise<ExtractionResult> {
  const zip = await JSZip.loadAsync(buffer);
  const slidePaths = Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/.test(path))
    .sort((a, b) => {
      const aNumber = Number(a.match(/slide(\d+)\.xml/)?.[1] ?? 0);
      const bNumber = Number(b.match(/slide(\d+)\.xml/)?.[1] ?? 0);
      return aNumber - bNumber;
    });

  if (slidePaths.length > MAX_PPTX_SLIDES) {
    throw new Error(
      `This PowerPoint has ${slidePaths.length} slides. The prototype limit is ${MAX_PPTX_SLIDES}.`,
    );
  }

  const parser = new XMLParser({ ignoreAttributes: false, preserveOrder: false });
  const slides: string[] = [];

  for (const [index, path] of slidePaths.entries()) {
    const xml = await zip.file(path)?.async("string");
    if (!xml) continue;
    const parsed = parser.parse(xml);
    const text = collectTextNodes(parsed).join(" ");
    slides.push(`Slide ${index + 1}\n${text}`);
  }

  const cleaned = normaliseText(slides.join("\n\n"));
  if (!cleaned) throw new Error("No visible text was found in this PowerPoint.");
  return { text: cleaned, pageCount: slidePaths.length };
}

export async function extractUploadedFile(file: File): Promise<ExtractionResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("This file is larger than the 20 MB prototype limit.");
  }

  const buffer = new Uint8Array(await file.arrayBuffer());

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return extractPdf(buffer);
  }

  if (
    file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    file.name.toLowerCase().endsWith(".pptx")
  ) {
    return extractPptx(buffer);
  }

  if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
    const text = normaliseText(new TextDecoder().decode(buffer));
    if (!text) throw new Error("This text file is empty.");
    return { text, pageCount: 1 };
  }

  throw new Error("Unsupported file type. Upload a PDF, PowerPoint, or plain-text file.");
}
