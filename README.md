# Vocabulary Studio

Vocabulary Studio is a standalone recruiter-ready prototype by Joe Ramses. It turns complete primary lesson materials into structured, illustrated multilingual vocabulary sheets.

The prepared demo uses a Grade 1 World Cup mathematics lesson. A teacher can also upload PDF, PowerPoint, or plain-text materials, choose Spanish, Arabic, French, or Simplified Chinese, optionally review the selected vocabulary, and export the finished A4 landscape sheet as PDF or editable PowerPoint.

## Product behaviour

- Analyses complete lesson text rather than selecting words from a title or first page.
- Uses an EAL-aware structured prompt to select up to eight learner-critical terms.
- Translates terms in lesson context through OpenRouter.
- Generates one text-free illustration per term through OpenRouter, with up to four requests active concurrently.
- Preserves successful cards when an illustration fails and supports individual retries.
- Produces deterministic HTML, PDF, and editable PowerPoint layouts rather than one flattened AI worksheet image.
- Keeps project state in the browser with IndexedDB. No application database is required.

## AI defaults

The text model defaults to `google/gemini-2.5-flash-lite`.

The image model defaults to `google/gemini-3.1-flash-lite-image` (Nano Banana 2 Lite) for child-friendly educational illustrations. It can be replaced through `OPENROUTER_IMAGE_MODEL` without changing the application code.

Every API credential remains server-side. The image and text models are environment-variable choices, not hard-coded product dependencies.

## Local setup

Use Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add an OpenRouter key to `.env.local` as `OPENROUTER_API_KEY`.

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Server-only OpenRouter credential | required for live AI |
| `OPENROUTER_TEXT_MODEL` | Vocabulary selection and translation model | `google/gemini-2.5-flash-lite` |
| `OPENROUTER_IMAGE_MODEL` | Illustration model | `google/gemini-3.1-flash-lite-image` |
| `GENERATION_ENABLED` | Emergency AI kill switch | `true` |
| `NEXT_PUBLIC_IMAGE_CONCURRENCY` | Active illustration requests, clamped to 1-4 | `4` |
| `NEXT_PUBLIC_APP_URL` | OpenRouter attribution URL | `http://localhost:3000` |

## Privacy model

- Uploaded files are processed by stateless route handlers and are not written to a project database.
- Active project state, including generated image data, is stored only in the current browser's IndexedDB.
- The **Clear project** action removes that local state.
- Raw lesson content, filenames, translations, and generated images are excluded from analytics events.
- Lesson content is sent to OpenRouter and its routed providers for processing; the interface states this clearly.
- This prototype does not claim school-production compliance, GDPR certification, certified translation, or a completed safeguarding review.

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The extraction tests use the bundled prepared PDF and PowerPoint files to verify complete-file processing.

## Website knowledge layer

Use these two documents together:

- [docs/website-knowledge-layer-handover.md](docs/website-knowledge-layer-handover.md) is the canonical factual layer for the product, lesson-generation context, current scope, claims, and future opportunities.
- [docs/website-case-study-handover.md](docs/website-case-study-handover.md) is the first-person product story covering ideation, quality benchmarks, the failed first image-model iteration, model and cost decisions, concurrent generation, and next-version thinking.
- [docs/product-walkthrough-and-reflection-script.md](docs/product-walkthrough-and-reflection-script.md) is the timed spoken walkthrough, reflection, live-demo fallback script, and product-lead vocabulary guide.
