"use client";

import { useState } from "react";
import { Check, LoaderCircle, Pencil, Trash2, X } from "lucide-react";
import type { VocabularySheet } from "@/lib/types";

export function ReviewPanel({
  sheet,
  onApprove,
  onCancel,
  onRemove,
  onReplace,
}: {
  sheet: VocabularySheet;
  onApprove: () => void;
  onCancel: () => void;
  onRemove: (index: number) => void;
  onReplace: (index: number, english: string) => Promise<void>;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [replacement, setReplacement] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function saveReplacement(index: number) {
    if (!replacement.trim()) return;
    setSaving(true);
    setError("");
    try {
      await onReplace(index, replacement.trim());
      setEditingIndex(null);
      setReplacement("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The replacement could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="review-panel" aria-labelledby="review-title">
      <div className="review-heading">
        <div>
          <p className="section-kicker">Teacher checkpoint</p>
          <h2 id="review-title">Review vocabulary</h2>
          <p>Approve the list, remove a word, or replace one before illustrations begin.</p>
        </div>
        <button className="icon-button" type="button" onClick={onCancel} aria-label="Cancel review">
          <X size={18} />
        </button>
      </div>

      <div className="review-list">
        {sheet.items.map((item, index) => (
          <article className="review-item" key={item.id}>
            <div className="review-item-copy">
              <div className="review-item-title">
                <strong>{item.english}</strong>
                <span>{item.translation}</span>
                <small>{item.category}</small>
              </div>
              <p>{item.selectionReason}</p>
              {item.sourceEvidence ? <blockquote>“{item.sourceEvidence}”</blockquote> : null}
            </div>
            <div className="review-actions">
              <button
                type="button"
                className="small-button"
                onClick={() => {
                  setEditingIndex(index);
                  setReplacement(item.english);
                  setError("");
                }}
              >
                <Pencil size={13} /> Replace
              </button>
              <button type="button" className="small-button danger" onClick={() => onRemove(index)}>
                <Trash2 size={13} /> Remove
              </button>
            </div>
            {editingIndex === index ? (
              <div className="replacement-row">
                <label htmlFor={`replacement-${item.id}`} className="sr-only">
                  Replacement English term
                </label>
                <input
                  id={`replacement-${item.id}`}
                  value={replacement}
                  onChange={(event) => setReplacement(event.target.value)}
                  maxLength={80}
                  autoFocus
                />
                <button type="button" onClick={() => saveReplacement(index)} disabled={saving || !replacement.trim()}>
                  {saving ? <LoaderCircle className="spin" size={14} /> : <Check size={14} />} Save
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {error ? <div className="inline-error" role="alert">{error}</div> : null}
      <div className="review-footer">
        <button type="button" className="secondary-button" onClick={onCancel}>Cancel</button>
        <button type="button" className="primary-button" onClick={onApprove} disabled={!sheet.items.length}>
          <Check size={17} /> Create worksheet
        </button>
      </div>
    </section>
  );
}
