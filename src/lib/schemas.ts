import { z } from "zod";

export const targetLanguageSchema = z.enum([
  "spanish",
  "arabic",
  "french",
  "simplified_chinese",
]);

export const vocabularyItemSchema = z.object({
  english: z.string().trim().min(1).max(80),
  translation: z.string().trim().min(1).max(120),
  category: z.enum(["instructional", "mathematical", "subject", "context"]),
  selectionReason: z.string().trim().min(1).max(400),
  sourceEvidence: z.string().trim().max(300).optional(),
  visualDescription: z.string().trim().min(1).max(600),
});

export const analysisResponseSchema = z.object({
  title: z.string().trim().min(1).max(100),
  detectedGrade: z.number().int().min(1).max(3),
  items: z.array(vocabularyItemSchema).min(1).max(8),
});

export const analyseRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(2_000),
  targetLanguage: targetLanguageSchema,
  sources: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(240),
        extractedText: z.string().trim().min(1).max(40_000),
      }),
    )
    .min(1)
    .max(3),
});

export const reviseItemRequestSchema = z.object({
  english: z.string().trim().min(1).max(80),
  targetLanguage: targetLanguageSchema,
  lessonContext: z.string().trim().min(1).max(12_000),
});

export const generateImageRequestSchema = z.object({
  english: z.string().trim().min(1).max(80),
  visualDescription: z.string().trim().min(1).max(600),
  lessonContext: z.string().trim().min(1).max(1_500),
});
