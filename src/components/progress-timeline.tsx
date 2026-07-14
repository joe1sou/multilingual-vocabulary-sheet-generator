import { Check, Circle, LoaderCircle, TriangleAlert } from "lucide-react";
import { STAGE_LABELS } from "@/lib/constants";
import type { ProgressStage, ProjectStatus, VocabularySheet } from "@/lib/types";

export function ProgressTimeline({
  currentStage,
  status,
  sheet,
}: {
  currentStage: ProgressStage;
  status: ProjectStatus;
  sheet?: VocabularySheet;
}) {
  const currentIndex = STAGE_LABELS.findIndex((stage) => stage.id === currentStage);
  const completeImages = sheet?.items.filter((item) => item.imageStatus === "complete").length ?? 0;
  const failedImages = sheet?.items.filter((item) => item.imageStatus === "failed").length ?? 0;

  return (
    <section className="progress-panel" aria-label="Generation progress">
      <div className="section-kicker">Generation progress</div>
      <ol className="progress-list" aria-live="polite">
        {STAGE_LABELS.map((stage, index) => {
          const isFailed = status === "failed" && index === currentIndex;
          const isComplete = index < currentIndex || currentStage === "ready";
          const isActive = index === currentIndex && !isComplete;
          const generatingLabel =
            stage.id === "generating" && sheet
              ? `${stage.label} - ${completeImages}/${sheet.items.length}${failedImages ? `, ${failedImages} failed` : ""}`
              : stage.label;

          return (
            <li
              key={stage.id}
              className={`progress-item ${isComplete ? "is-complete" : ""} ${isActive ? "is-active" : ""} ${isFailed ? "is-failed" : ""}`}
            >
              <span className="progress-icon" aria-hidden="true">
                {isFailed ? (
                  <TriangleAlert size={15} />
                ) : isComplete ? (
                  <Check size={15} />
                ) : isActive ? (
                  <LoaderCircle size={15} className="spin" />
                ) : (
                  <Circle size={11} />
                )}
              </span>
              <span>{generatingLabel}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
