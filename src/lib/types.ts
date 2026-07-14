export type TargetLanguage =
  | "spanish"
  | "arabic"
  | "french"
  | "simplified_chinese";

export type VocabularyCategory =
  | "instructional"
  | "mathematical"
  | "subject"
  | "context";

export type ImageStatus = "queued" | "generating" | "complete" | "failed";

export type ProjectStatus =
  | "idle"
  | "extracting"
  | "analysing"
  | "review"
  | "generating_images"
  | "building"
  | "complete"
  | "failed";

export type UploadedSource = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  extractedText?: string;
  pageCount?: number;
  downloadUrl?: string;
  isPreset?: boolean;
};

export type VocabularyItem = {
  id: string;
  english: string;
  translation: string;
  category: VocabularyCategory;
  selectionReason: string;
  sourceEvidence?: string;
  visualDescription: string;
  imageStatus: ImageStatus;
  imageDataUrl?: string;
  errorMessage?: string;
};

export type VocabularySheet = {
  id: string;
  title: string;
  detectedGrade: 1 | 2 | 3;
  targetLanguage: TargetLanguage;
  items: VocabularyItem[];
  createdAt: string;
};

export type ProjectState = {
  id: string;
  prompt: string;
  sources: UploadedSource[];
  targetLanguage: TargetLanguage;
  reviewBeforeGeneration: boolean;
  sheet?: VocabularySheet;
  status: ProjectStatus;
  error?: string;
  isPreset: boolean;
};

export type ProgressStage =
  | "reading"
  | "understanding"
  | "selecting"
  | "translating"
  | "planning"
  | "generating"
  | "building"
  | "ready";

export type AnalyseLessonResponse = {
  title: string;
  detectedGrade: 1 | 2 | 3;
  items: Array<Omit<VocabularyItem, "id" | "imageStatus" | "imageDataUrl">>;
  model: string;
};
