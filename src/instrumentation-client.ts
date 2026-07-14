import posthog, { type CaptureResult } from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

function sanitize(event: CaptureResult | null): CaptureResult | null {
  if (!event) return null;
  const properties = { ...event.properties };
  for (const property of ["$current_url", "$pathname", "$referrer"]) {
    const value = properties[property];
    if (typeof value !== "string") continue;
    try {
      const url = new URL(value, window.location.origin);
      const safe = new URL(url.pathname, url.origin);
      for (const utm of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
        const param = url.searchParams.get(utm);
        if (param) safe.searchParams.set(utm, param.slice(0, 120));
      }
      properties[property] = safe.toString();
    } catch {
      properties[property] = value.split("?")[0];
    }
  }
  for (const property of ["$el_text", "$element_text", "text", "value", "filename", "prompt", "translation"]) {
    delete properties[property];
  }
  properties.app_key = "vocabulary-studio";
  properties.environment = process.env.NODE_ENV !== "production" ? "development" : process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ? "preview" : "production";
  return { ...event, properties };
}

if (key) {
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_UI_HOST || "https://eu.posthog.com",
    defaults: "2025-05-24",
    cookieless_mode: "always",
    person_profiles: "never",
    persistence: "memory",
    disable_persistence: true,
    disable_session_recording: true,
    capture_pageview: "history_change",
    capture_pageleave: true,
    capture_heatmaps: true,
    autocapture: { dom_event_allowlist: ["click"], element_allowlist: ["a", "button"] },
    mask_all_text: true,
    mask_all_element_attributes: true,
    before_send: sanitize,
    loaded: (client) => client.register({
      app_key: "vocabulary-studio",
      environment: process.env.NODE_ENV !== "production" ? "development" : process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ? "preview" : "production",
    }),
  });
}
