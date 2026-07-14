import { ImageOff, LoaderCircle, RotateCcw } from "lucide-react";
import { LANGUAGE_OPTIONS } from "@/lib/constants";
import type { VocabularySheet } from "@/lib/types";

export function WorksheetPreview({
  sheet,
  onRetry,
}: {
  sheet: VocabularySheet;
  onRetry: (index: number) => void;
}) {
  const language = LANGUAGE_OPTIONS.find((option) => option.value === sheet.targetLanguage);

  return (
    <div
      className="worksheet-canvas worksheet-font"
      data-testid="worksheet"
      aria-label={`${sheet.title} worksheet preview`}
    >
      <header className="worksheet-header">
        <div>
          <p className="worksheet-eyebrow">Visual vocabulary sheet</p>
          <h2>{sheet.title}</h2>
        </div>
        <div className="worksheet-language">
          <span>{language?.label}</span>
          <small>Grade {sheet.detectedGrade}</small>
        </div>
      </header>

      <div className="worksheet-grid">
        {Array.from({ length: 8 }, (_, index) => {
          const item = sheet.items[index];
          return (
            <article className={`vocab-card ${item ? "is-populated" : "is-empty"}`} key={item?.id ?? `empty-${index}`}>
              {item ? (
                <>
                  <div className="vocab-image-frame">
                    {item.imageStatus === "complete" && item.imageDataUrl ? (
                      // A generated data URL is intentionally rendered without next/image optimization.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageDataUrl} alt={`Illustration for ${item.english}`} />
                    ) : item.imageStatus === "failed" ? (
                      <div className="image-state image-failed">
                        <ImageOff size={24} aria-hidden="true" />
                        <span>Illustration unavailable</span>
                        <button type="button" onClick={() => onRetry(index)} data-export-hide="true">
                          <RotateCcw size={13} aria-hidden="true" /> Retry
                        </button>
                      </div>
                    ) : (
                      <div className="image-state">
                        <LoaderCircle className={item.imageStatus === "generating" ? "spin" : ""} size={24} aria-hidden="true" />
                        <span>{item.imageStatus === "generating" ? "Creating illustration" : "Waiting to generate"}</span>
                      </div>
                    )}
                  </div>
                  <div className="word-section english-word">{item.english}</div>
                  <div
                    className="word-section translated-word"
                    dir={language?.direction ?? "ltr"}
                    lang={languageCode(sheet.targetLanguage)}
                  >
                    {item.translation}
                  </div>
                </>
              ) : (
                <span className="blank-card-label">Intentionally blank</span>
              )}
            </article>
          );
        })}
      </div>
      <footer className="worksheet-footer">
        <span>Pictures support meaning. Read and discuss each word together.</span>
        <span>Created with Vocabulary Studio</span>
      </footer>
    </div>
  );
}

function languageCode(language: VocabularySheet["targetLanguage"]) {
  return {
    spanish: "es",
    arabic: "ar",
    french: "fr",
    simplified_chinese: "zh-Hans",
  }[language];
}
