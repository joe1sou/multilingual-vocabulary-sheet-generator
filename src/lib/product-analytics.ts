"use client";

import posthog from "posthog-js";
import { track as vercelTrack } from "@vercel/analytics";

type SafeValue = string | number | boolean | null | undefined;
type SafeProperties = Record<string, SafeValue>;
type VocabularyEventName =
  | "preset_demo_selected"
  | "custom_request_started"
  | "file_type_uploaded"
  | "preset_demo_started"
  | "vocabulary_selected"
  | "generation_failed"
  | "worksheet_completed"
  | "image_retry_used"
  | "pdf_exported"
  | "powerpoint_exported"
  | "target_language_selected"
  | "vocabulary_review_toggled";
type PrototypeEventName = VocabularyEventName | "prototype session started" | "prototype action performed" | "prototype outcome completed";

const outcomes = new Set(["worksheet_completed", "pdf_exported", "powerpoint_exported"]);

function environment() {
  if (process.env.NODE_ENV !== "production") return "development";
  return process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ? "preview" : "production";
}

function attribution(): SafeProperties {
  if (typeof window === "undefined") return {};
  const query = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    ["utm_source", "utm_medium", "utm_campaign", "utm_content"]
      .map((key) => [key, query.get(key)?.slice(0, 120)] as const)
      .filter((entry): entry is readonly [string, string] => Boolean(entry[1])),
  );
}

function capture(event: PrototypeEventName, properties: SafeProperties = {}) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(event, {
    app_key: "vocabulary-studio",
    prototype_key: "vocabulary-studio",
    environment: environment(),
    ...attribution(),
    ...properties,
  });
}

export function trackProductEvent(event: VocabularyEventName, properties: SafeProperties = {}) {
  vercelTrack(event, properties);
  capture(event, properties);
  capture(outcomes.has(event) ? "prototype outcome completed" : "prototype action performed", {
    action_key: event,
    outcome_key: outcomes.has(event) ? event : undefined,
    ...properties,
  });
}

export function startPrototypeSession() {
  capture("prototype session started", { source_page: document.referrer ? "referrer-present" : "direct" });
}
