import type { ProgressStage, TargetLanguage } from "@/lib/types";

export const APP_NAME = "Vocabulary Studio";
export const MAX_ATTACHMENTS = 3;
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
export const MAX_PDF_PAGES = 40;
export const MAX_PPTX_SLIDES = 50;
export const MAX_COMBINED_TEXT = 40_000;
export const IMAGE_CONCURRENCY = Math.min(
  4,
  Math.max(1, Number(process.env.NEXT_PUBLIC_IMAGE_CONCURRENCY) || 4),
);

export const LANGUAGE_OPTIONS: Array<{
  value: TargetLanguage;
  label: string;
  nativeLabel: string;
  direction: "ltr" | "rtl";
}> = [
  { value: "spanish", label: "Spanish", nativeLabel: "Espa\u00f1ol", direction: "ltr" },
  { value: "arabic", label: "Arabic", nativeLabel: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629", direction: "rtl" },
  { value: "french", label: "French", nativeLabel: "Fran\u00e7ais", direction: "ltr" },
  {
    value: "simplified_chinese",
    label: "Simplified Chinese",
    nativeLabel: "\u7b80\u4f53\u4e2d\u6587",
    direction: "ltr",
  },
];

export const LANGUAGE_LABELS: Record<TargetLanguage, string> = Object.fromEntries(
  LANGUAGE_OPTIONS.map((language) => [language.value, language.label]),
) as Record<TargetLanguage, string>;

export const STAGE_LABELS: Array<{ id: ProgressStage; label: string }> = [
  { id: "reading", label: "Reading lesson files" },
  { id: "understanding", label: "Understanding the lesson" },
  { id: "selecting", label: "Selecting vocabulary" },
  { id: "translating", label: "Translating vocabulary" },
  { id: "planning", label: "Planning illustrations" },
  { id: "generating", label: "Generating illustrations" },
  { id: "building", label: "Building worksheet" },
  { id: "ready", label: "Ready to export" },
];

export const SUGGESTED_PROMPTS = [
  "Create a Spanish vocabulary sheet for this lesson.",
  "Find the words multilingual learners need to solve these problems.",
  "Create an Arabic vocabulary bank from the attached slides.",
  "Turn this Grade 1 lesson into a visual vocabulary sheet.",
];

export const DEFAULT_PROMPT =
  "Please create a Spanish vocabulary sheet for this Grade 1 lesson. Choose the words multilingual learners need in order to understand and solve the story problems.";

export const SUPPORTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
]);
