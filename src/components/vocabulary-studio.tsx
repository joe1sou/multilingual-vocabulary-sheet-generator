"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { trackProductEvent as track } from "@/lib/product-analytics";
import {
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  ChevronRight,
  Download,
  FilePlus2,
  FileText,
  Globe2,
  Languages,
  LoaderCircle,
  Paperclip,
  Plus,
  Presentation,
  Send,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import {
  IMAGE_CONCURRENCY,
  LANGUAGE_OPTIONS,
  MAX_ATTACHMENTS,
  MAX_FILE_SIZE_BYTES,
  SUGGESTED_PROMPTS,
  SUPPORTED_MIME_TYPES,
} from "@/lib/constants";
import { createDemoProject, createEmptyProject } from "@/lib/demo";
import { exportWorksheetPdf } from "@/lib/export-pdf";
import { exportWorksheetPptx } from "@/lib/export-pptx";
import { clearSavedProject, loadProject, saveProject } from "@/lib/project-storage";
import type {
  AnalyseLessonResponse,
  ProgressStage,
  ProjectState,
  UploadedSource,
  VocabularyItem,
  VocabularySheet,
} from "@/lib/types";
import { ProgressTimeline } from "@/components/progress-timeline";
import { ReviewPanel } from "@/components/review-panel";
import { WorksheetPreview } from "@/components/worksheet-preview";

type ApiError = { error?: string };

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function fileKind(source: UploadedSource) {
  if (source.mimeType.includes("presentation")) return "PowerPoint";
  if (source.mimeType === "application/pdf") return "PDF";
  return "Text";
}

function safeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70) || "vocabulary-sheet";
}

function outOfRangeGrade(prompt: string) {
  const grade = prompt.match(/\bgrade\s*(\d+)\b/i)?.[1];
  if (!grade) return null;
  const value = Number(grade);
  return value < 1 || value > 3 ? value : null;
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & ApiError;
  if (!response.ok) throw new Error(payload.error || "Something went wrong. Please try again.");
  return payload;
}

function normaliseRestoredProject(project: ProjectState): ProjectState {
  if (["idle", "review", "complete", "failed"].includes(project.status)) return project;
  return {
    ...project,
    status: "failed",
    error: "The previous generation was interrupted. Your prompt and completed work are still here.",
    sheet: project.sheet
      ? {
          ...project.sheet,
          items: project.sheet.items.map((item) =>
            item.imageStatus === "generating"
              ? { ...item, imageStatus: "failed", errorMessage: "Generation was interrupted." }
              : item,
          ),
        }
      : undefined,
  };
}

export function VocabularyStudio() {
  const [project, setProject] = useState<ProjectState>(() => createDemoProject());
  const [currentStage, setCurrentStage] = useState<ProgressStage>("reading");
  const [hydrated, setHydrated] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "pptx" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const worksheetRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef(project);

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  useEffect(() => {
    let cancelled = false;
    loadProject()
      .then((saved) => {
        if (!cancelled && saved) setProject(normaliseRestoredProject(saved));
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timeout = window.setTimeout(() => {
      saveProject(project).catch(() => undefined);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [hydrated, project]);

  const isBusy = ["extracting", "analysing", "generating_images", "building"].includes(
    project.status,
  );
  const failedImages = project.sheet?.items.filter((item) => item.imageStatus === "failed").length ?? 0;
  const canExport = project.status === "complete" && Boolean(project.sheet);
  const detectedUnsupportedGrade = outOfRangeGrade(project.prompt);
  const language = LANGUAGE_OPTIONS.find((option) => option.value === project.targetLanguage);

  const lessonContext = useMemo(
    () =>
      project.sources
        .map((source) => source.extractedText || "")
        .join("\n\n")
        .slice(0, 12_000),
    [project.sources],
  );

  function updateProject(update: Partial<ProjectState>) {
    setProject((current) => ({ ...current, ...update }));
  }

  function usePreparedExample() {
    setCurrentStage("reading");
    setProject(createDemoProject());
    track("preset_demo_selected");
  }

  function startNewRequest() {
    setCurrentStage("reading");
    setProject(createEmptyProject());
    track("custom_request_started");
  }

  async function clearProject() {
    await clearSavedProject();
    setCurrentStage("reading");
    setProject(createEmptyProject());
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const availableSlots = MAX_ATTACHMENTS - projectRef.current.sources.length;
    const files = Array.from(fileList).slice(0, Math.max(0, availableSlots));
    if (!availableSlots) {
      updateProject({ error: `You can attach up to ${MAX_ATTACHMENTS} files to one request.` });
      return;
    }

    const invalid = files.find(
      (file) =>
        file.size > MAX_FILE_SIZE_BYTES ||
        (!SUPPORTED_MIME_TYPES.has(file.type) && !/\.(pdf|pptx|txt)$/i.test(file.name)),
    );
    if (invalid) {
      updateProject({
        error:
          invalid.size > MAX_FILE_SIZE_BYTES
            ? `${invalid.name} is larger than the 20 MB prototype limit.`
            : `${invalid.name} is not a supported PDF, PowerPoint, or text file.`,
      });
      return;
    }

    updateProject({ status: "extracting", error: undefined });
    setCurrentStage("reading");
    try {
      const extracted = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.set("file", file);
          const result = await readJson<{
            name: string;
            mimeType: string;
            pageCount: number;
            text: string;
          }>(await fetch("/api/extract-document", { method: "POST", body: formData }));

          track("file_type_uploaded", { type: file.name.split(".").pop()?.toLowerCase() || "unknown" });
          return {
            id: crypto.randomUUID(),
            name: result.name,
            mimeType: result.mimeType || file.type,
            sizeBytes: file.size,
            pageCount: result.pageCount,
            extractedText: result.text,
          } satisfies UploadedSource;
        }),
      );

      setProject((current) => ({
        ...current,
        sources: [...current.sources, ...extracted].slice(0, MAX_ATTACHMENTS),
        status: "idle",
        isPreset: false,
        error: undefined,
      }));
    } catch (error) {
      updateProject({
        status: "idle",
        error: error instanceof Error ? error.message : "The selected file could not be read.",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function submitRequest() {
    if (isBusy) return;
    const current = projectRef.current;
    const prompt =
      current.prompt.trim() ||
      `Create a ${language?.label ?? "multilingual"} vocabulary sheet from the attached lesson.`;
    const sources = current.sources.length
      ? current.sources
      : [
          {
            id: "pasted-text",
            name: "Pasted lesson text",
            mimeType: "text/plain",
            sizeBytes: new Blob([prompt]).size,
            extractedText: prompt,
          },
        ];

    updateProject({ status: "analysing", error: undefined, prompt, sources });
    setCurrentStage("reading");
    if (current.isPreset) track("preset_demo_started");

    const timers = [
      window.setTimeout(() => setCurrentStage("understanding"), 500),
      window.setTimeout(() => setCurrentStage("selecting"), 1_800),
      window.setTimeout(() => setCurrentStage("translating"), 4_000),
      window.setTimeout(() => setCurrentStage("planning"), 6_000),
    ];

    try {
      const result = await readJson<AnalyseLessonResponse>(
        await fetch("/api/analyse-lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            targetLanguage: current.targetLanguage,
            sources: sources.map((source) => ({
              name: source.name,
              extractedText: source.extractedText || "",
            })),
          }),
        }),
      );

      const seen = new Set<string>();
      const items: VocabularyItem[] = result.items
        .filter((item) => {
          const key = item.english.trim().toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 8)
        .map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          imageStatus: "queued",
        }));

      const sheet: VocabularySheet = {
        id: crypto.randomUUID(),
        title: result.title,
        detectedGrade: result.detectedGrade,
        targetLanguage: current.targetLanguage,
        items,
        createdAt: new Date().toISOString(),
      };

      track("vocabulary_selected", { item_count: items.length, language: current.targetLanguage });

      if (current.reviewBeforeGeneration) {
        setCurrentStage("planning");
        setProject((active) => ({ ...active, status: "review", sheet, error: undefined }));
      } else {
        await generateAllImages(sheet);
      }
    } catch (error) {
      setProject((active) => ({
        ...active,
        status: "failed",
        error: error instanceof Error ? error.message : "The lesson could not be analysed.",
      }));
      track("generation_failed", { stage: "analysis" });
    } finally {
      timers.forEach((timer) => window.clearTimeout(timer));
    }
  }

  async function requestImage(item: VocabularyItem, sheet: VocabularySheet) {
    return readJson<{ imageDataUrl: string; model: string }>(
      await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          english: item.english,
          visualDescription: item.visualDescription,
          lessonContext: `${sheet.title}. Grade ${sheet.detectedGrade}. ${lessonContext}`.slice(0, 1_500),
        }),
      }),
    );
  }

  async function generateAllImages(baseSheet: VocabularySheet) {
    const items: VocabularyItem[] = baseSheet.items.map((item) => ({
      ...item,
      imageStatus: "queued",
    }));
    const sheet = { ...baseSheet, items };
    setCurrentStage("generating");
    setProject((active) => ({ ...active, status: "generating_images", sheet, error: undefined }));

    let nextIndex = 0;
    const publishItems = () => {
      setProject((active) => ({
        ...active,
        sheet: active.sheet ? { ...active.sheet, items: items.map((item) => ({ ...item })) } : sheet,
      }));
    };

    async function worker() {
      while (nextIndex < items.length) {
        const index = nextIndex;
        nextIndex += 1;
        items[index] = { ...items[index], imageStatus: "generating", errorMessage: undefined };
        publishItems();
        try {
          const result = await requestImage(items[index], sheet);
          items[index] = {
            ...items[index],
            imageStatus: "complete",
            imageDataUrl: result.imageDataUrl,
            errorMessage: undefined,
          };
        } catch (error) {
          items[index] = {
            ...items[index],
            imageStatus: "failed",
            errorMessage: error instanceof Error ? error.message : "Illustration generation failed.",
          };
        }
        publishItems();
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(IMAGE_CONCURRENCY, items.length) }, () => worker()),
    );
    setCurrentStage("building");
    setProject((active) => ({
      ...active,
      status: "building",
      sheet: active.sheet ? { ...active.sheet, items } : { ...sheet, items },
    }));
    await delay(450);
    setCurrentStage("ready");
    setProject((active) => ({ ...active, status: "complete" }));
    track("worksheet_completed", {
      item_count: items.length,
      failed_images: items.filter((item) => item.imageStatus === "failed").length,
    });
  }

  async function retryImage(index: number) {
    const sheet = projectRef.current.sheet;
    if (!sheet?.items[index]) return;
    setCurrentStage("generating");
    setProject((active) => ({
      ...active,
      status: "generating_images",
      sheet: active.sheet
        ? {
            ...active.sheet,
            items: active.sheet.items.map((item, itemIndex) =>
              itemIndex === index
                ? { ...item, imageStatus: "generating", errorMessage: undefined }
                : item,
            ),
          }
        : active.sheet,
    }));
    track("image_retry_used");

    try {
      const result = await requestImage(sheet.items[index], sheet);
      setProject((active) => ({
        ...active,
        status: "complete",
        sheet: active.sheet
          ? {
              ...active.sheet,
              items: active.sheet.items.map((item, itemIndex) =>
                itemIndex === index
                  ? {
                      ...item,
                      imageStatus: "complete",
                      imageDataUrl: result.imageDataUrl,
                      errorMessage: undefined,
                    }
                  : item,
              ),
            }
          : active.sheet,
      }));
      setCurrentStage("ready");
    } catch (error) {
      setProject((active) => ({
        ...active,
        status: "complete",
        sheet: active.sheet
          ? {
              ...active.sheet,
              items: active.sheet.items.map((item, itemIndex) =>
                itemIndex === index
                  ? {
                      ...item,
                      imageStatus: "failed",
                      errorMessage: error instanceof Error ? error.message : "Retry failed.",
                    }
                  : item,
              ),
            }
          : active.sheet,
      }));
      setCurrentStage("ready");
    }
  }

  function removeReviewItem(index: number) {
    setProject((active) => ({
      ...active,
      sheet: active.sheet
        ? { ...active.sheet, items: active.sheet.items.filter((_, itemIndex) => itemIndex !== index) }
        : undefined,
    }));
  }

  async function replaceReviewItem(index: number, english: string) {
    const result = await readJson<{
      item: Omit<VocabularyItem, "id" | "imageStatus" | "imageDataUrl">;
    }>(
      await fetch("/api/revise-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          english,
          targetLanguage: projectRef.current.targetLanguage,
          lessonContext,
        }),
      }),
    );

    setProject((active) => ({
      ...active,
      sheet: active.sheet
        ? {
            ...active.sheet,
            items: active.sheet.items.map((item, itemIndex) =>
              itemIndex === index
                ? { ...result.item, id: item.id, imageStatus: "queued" }
                : item,
            ),
          }
        : active.sheet,
    }));
  }

  async function approveReview() {
    const sheet = projectRef.current.sheet;
    if (sheet?.items.length) await generateAllImages(sheet);
  }

  function cancelReview() {
    setProject((active) => ({ ...active, status: "idle", sheet: undefined }));
    setCurrentStage("reading");
  }

  function confirmPlaceholderExport() {
    if (!failedImages) return true;
    return window.confirm(
      `${failedImages} illustration${failedImages === 1 ? " has" : "s have"} failed. Export with a labelled placeholder?`,
    );
  }

  async function exportPdf() {
    if (!project.sheet || !worksheetRef.current || !confirmPlaceholderExport()) return;
    setExporting("pdf");
    try {
      await exportWorksheetPdf(worksheetRef.current, safeFilename(project.sheet.title));
      track("pdf_exported");
    } catch {
      updateProject({ error: "The PDF could not be created. Please try again." });
    } finally {
      setExporting(null);
    }
  }

  async function exportPptx() {
    if (!project.sheet || !confirmPlaceholderExport()) return;
    setExporting("pptx");
    try {
      await exportWorksheetPptx(project.sheet);
      track("powerpoint_exported");
    } catch {
      updateProject({ error: "The PowerPoint could not be created. Please try again." });
    } finally {
      setExporting(null);
    }
  }

  return (
    <main className="app-shell">
      <aside className="app-sidebar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><Languages size={22} /></div>
          <div>
            <span>Vocabulary Studio</span>
            <small>by Joe Ramses</small>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Requests">
          <p className="sidebar-label">Start here</p>
          <button
            type="button"
            className={`sidebar-card ${project.isPreset ? "is-selected" : ""}`}
            onClick={usePreparedExample}
          >
            <span className="sidebar-card-icon"><BookOpenText size={18} /></span>
            <span>
              <strong>World Cup story problems</strong>
              <small>Prepared Grade 1 example</small>
            </span>
            <ChevronRight size={16} />
          </button>
          <button type="button" className="new-request-button" onClick={startNewRequest}>
            <Plus size={17} /> New request
          </button>
        </nav>

        <div className="sidebar-spacer" />
        <div className="privacy-card">
          <ShieldCheck size={18} aria-hidden="true" />
          <div>
            <strong>Temporary by design</strong>
            <p>Files are processed for this session and are not saved to a project database.</p>
          </div>
        </div>
        <button type="button" className="clear-button" onClick={clearProject}>
          <Trash2 size={15} /> Clear project
        </button>
      </aside>

      <section className="workspace-panel">
        <header className="workspace-header">
          <div>
            <p className="section-kicker">Multilingual learner support</p>
            <h1>Create a visual vocabulary sheet</h1>
            <p>Upload a lesson and let the AI select the language pupils need to take part.</p>
          </div>
          <span className="prototype-badge">Standalone prototype</span>
        </header>

        {project.status === "review" && project.sheet ? (
          <ReviewPanel
            sheet={project.sheet}
            onApprove={approveReview}
            onCancel={cancelReview}
            onRemove={removeReviewItem}
            onReplace={replaceReviewItem}
          />
        ) : (
          <>
            <section className="request-card" aria-labelledby="request-heading">
              <div className="request-card-heading">
                <div>
                  <p className="section-kicker">Teacher request</p>
                  <h2 id="request-heading">What should the sheet support?</h2>
                </div>
                <button type="button" className="text-button" onClick={startNewRequest}>Reset</button>
              </div>

              <div className="attachment-list" aria-label="Attached lesson materials">
                {project.sources.map((source) => (
                  <div className="attachment-row" key={source.id}>
                    <span className={`file-icon ${source.mimeType.includes("presentation") ? "pptx" : ""}`}>
                      {source.mimeType.includes("presentation") ? <Presentation size={17} /> : <FileText size={17} />}
                    </span>
                    <div>
                      {source.downloadUrl ? (
                        <a href={source.downloadUrl} download>{source.name}</a>
                      ) : (
                        <strong>{source.name}</strong>
                      )}
                      <small>{fileKind(source)}{source.pageCount ? ` - ${source.pageCount} ${source.mimeType.includes("presentation") ? "slides" : "pages"}` : ""}</small>
                    </div>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() =>
                        setProject((active) => ({
                          ...active,
                          sources: active.sources.filter((item) => item.id !== source.id),
                          isPreset: false,
                        }))
                      }
                      aria-label={`Remove ${source.name}`}
                      disabled={isBusy}
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
                {project.sources.length < MAX_ATTACHMENTS ? (
                  <button
                    type="button"
                    className="add-file-row"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isBusy}
                  >
                    {project.status === "extracting" ? <LoaderCircle className="spin" size={17} /> : <FilePlus2 size={17} />}
                    {project.status === "extracting" ? "Reading file..." : "Add PDF, PowerPoint, or text"}
                  </button>
                ) : null}
              </div>
              <input
                ref={fileInputRef}
                className="sr-only"
                type="file"
                multiple
                accept=".pdf,.pptx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
                onChange={(event) => handleFiles(event.target.files)}
              />

              <label className="prompt-label" htmlFor="lesson-prompt">Request or paste lesson text</label>
              <textarea
                id="lesson-prompt"
                value={project.prompt}
                onChange={(event) => updateProject({ prompt: event.target.value, isPreset: false, error: undefined })}
                rows={6}
                maxLength={2_000}
                placeholder="Paste lesson content or ask for a vocabulary sheet..."
                disabled={isBusy}
              />
              <div className="prompt-meta"><span>Complete files are analysed, not just the first page.</span><span>{project.prompt.length}/2,000</span></div>

              <div className="suggestion-row" aria-label="Suggested prompts">
                {SUGGESTED_PROMPTS.slice(0, 3).map((prompt) => (
                  <button type="button" key={prompt} onClick={() => updateProject({ prompt, isPreset: false })} disabled={isBusy}>
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="request-settings">
                <label>
                  <span>Target language</span>
                  <select
                    value={project.targetLanguage}
                    onChange={(event) => {
                      const targetLanguage = event.target.value as ProjectState["targetLanguage"];
                      updateProject({ targetLanguage, isPreset: false });
                      track("target_language_selected", { language: targetLanguage });
                    }}
                    disabled={isBusy}
                  >
                    {LANGUAGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label} - {option.nativeLabel}</option>
                    ))}
                  </select>
                </label>
                <label className="review-toggle">
                  <span>
                    <strong>Review vocabulary first</strong>
                    <small>Approve or replace words before images</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={project.reviewBeforeGeneration}
                    onChange={(event) => {
                      updateProject({ reviewBeforeGeneration: event.target.checked });
                      track("vocabulary_review_toggled", { enabled: event.target.checked });
                    }}
                    disabled={isBusy}
                  />
                </label>
              </div>

              {detectedUnsupportedGrade ? (
                <div className="inline-warning" role="status">
                  Version one is designed for Grades 1-3. If you continue with Grade {detectedUnsupportedGrade}, the app will use Grade 1 behaviour.
                </div>
              ) : null}
              {project.error ? <div className="inline-error" role="alert">{project.error}</div> : null}

              <div className="composer-footer">
                <p><ShieldCheck size={14} /> Files are sent to external AI providers for temporary processing.</p>
                <button
                  type="button"
                  className="primary-button send-button"
                  onClick={submitRequest}
                  disabled={isBusy || (!project.prompt.trim() && !project.sources.length)}
                >
                  {isBusy ? <LoaderCircle className="spin" size={18} /> : <Send size={18} />}
                  {isBusy ? "Creating sheet" : "Create vocabulary sheet"}
                </button>
              </div>
            </section>

            {project.status !== "idle" || project.sheet ? (
              <ProgressTimeline currentStage={currentStage} status={project.status} sheet={project.sheet} />
            ) : (
              <section className="workflow-note">
                <Globe2 size={20} aria-hidden="true" />
                <div><strong>What the AI will do</strong><p>Read the lesson, select learner-critical language, translate it in context, then plan one illustration per word.</p></div>
              </section>
            )}
          </>
        )}
      </section>

      <section className="output-panel">
        <header className="output-header">
          <div>
            <p className="section-kicker">A4 landscape output</p>
            <h2>Worksheet preview</h2>
          </div>
          {project.sheet ? <span className="item-count">{project.sheet.items.length} words</span> : null}
        </header>

        {project.sheet ? (
          <>
            <div className="worksheet-stage">
              <div ref={worksheetRef}>
                <WorksheetPreview sheet={project.sheet} onRetry={retryImage} />
              </div>
            </div>
            <div className="output-summary" aria-live="polite">
              {project.status === "complete" ? (
                <><CheckCircle2 size={17} /><span>{failedImages ? `Ready with ${failedImages} placeholder${failedImages === 1 ? "" : "s"}` : "Ready to export"}</span></>
              ) : (
                <><LoaderCircle className="spin" size={17} /><span>Cards will appear as each illustration finishes</span></>
              )}
            </div>
            <div className="export-actions">
              <button type="button" className="secondary-button" disabled={!canExport || Boolean(exporting)} onClick={exportPdf}>
                {exporting === "pdf" ? <LoaderCircle className="spin" size={17} /> : <Download size={17} />} PDF
              </button>
              <button type="button" className="primary-button" disabled={!canExport || Boolean(exporting)} onClick={exportPptx}>
                {exporting === "pptx" ? <LoaderCircle className="spin" size={17} /> : <Presentation size={17} />} Editable PowerPoint
              </button>
            </div>
          </>
        ) : (
          <div className="output-empty-state">
            <div className="empty-illustration" aria-hidden="true">
              <div className="mini-card"><span /><strong>add to</strong><small>agregar</small></div>
              <div className="mini-card"><span /><strong>left</strong><small>quedan</small></div>
              <div className="mini-card"><span /><strong>team</strong><small>equipo</small></div>
              <div className="mini-card"><span /><strong>goal</strong><small>gol</small></div>
            </div>
            <h3>Your worksheet will build here</h3>
            <p>Each card remains structured and editable. The AI creates the content; the app protects the layout.</p>
            <div className="empty-steps">
              <span><Paperclip size={15} /> Add a lesson</span><ArrowRight size={14} /><span><Languages size={15} /> Generate</span><ArrowRight size={14} /><span><Download size={15} /> Export</span>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
