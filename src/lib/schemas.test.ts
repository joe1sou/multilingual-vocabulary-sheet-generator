import { describe, expect, it } from "vitest";
import { analysisResponseSchema, analyseRequestSchema } from "@/lib/schemas";

describe("structured lesson analysis contracts", () => {
  it("accepts a valid multilingual vocabulary result", () => {
    const result = analysisResponseSchema.parse({
      title: "World Cup Story Problems Vocabulary",
      detectedGrade: 1,
      items: [
        {
          english: "altogether",
          translation: "en total",
          category: "mathematical",
          selectionReason: "Pupils need it to combine two groups.",
          sourceEvidence: "How many fans are cheering altogether?",
          visualDescription: "Two groups of footballs joining into one group.",
        },
      ],
    });

    expect(result.items).toHaveLength(1);
    expect(result.detectedGrade).toBe(1);
  });

  it("rejects more than eight items and unsupported languages", () => {
    const item = {
      english: "word",
      translation: "palabra",
      category: "context",
      selectionReason: "Relevant to the lesson.",
      sourceEvidence: "word",
      visualDescription: "A simple classroom-safe concept.",
    };

    expect(() =>
      analysisResponseSchema.parse({
        title: "Too many",
        detectedGrade: 1,
        items: Array.from({ length: 9 }, () => item),
      }),
    ).toThrow();

    expect(() =>
      analyseRequestSchema.parse({
        prompt: "Create a sheet",
        targetLanguage: "german",
        sources: [{ name: "lesson.txt", extractedText: "Lesson text" }],
      }),
    ).toThrow();
  });
});
