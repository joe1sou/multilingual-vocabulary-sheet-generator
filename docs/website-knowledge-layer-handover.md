# Vocabulary Studio — Website Knowledge-Layer Handover

**Document purpose:** Canonical product context for a website-writing or website-building agent

**Product:** Vocabulary Studio / Multilingual Vocabulary Sheet Generator

**Owner and builder:** Joe Ramses

**Status:** Live working recruiter-facing portfolio prototype; Phase 4 excluded

**Last verified:** 14 July 2026

**Live product:** https://multilingual-vocabulary-sheet-gener.vercel.app

**Public repository:** https://github.com/joe1sou/multilingual-vocabulary-sheet-generator

## 1. Instructions for the receiving website agent

Use this document to amend existing website copy about Vocabulary Studio.

For the first-person product story—including ideation, the first image-model failure, quality benchmarks, model cost decisions, image concurrency, and next-version thinking—use website-case-study-handover.md alongside this factual layer.

Treat the following sections as the source of truth:

1. **Verified product facts** describes what is working now.
2. **How it fits into lesson generation** defines the correct place in the wider workflow.
3. **Messaging guidance** provides copy that can be reused or adapted.
4. **Claim boundaries** lists statements the website must not make.
5. **Future opportunities** must remain clearly labelled as future work.

Do not describe the original PRD as if every future idea has been delivered. Prefer the live implementation and repository over older planning language if they differ.

## 2. Product in one sentence

Vocabulary Studio turns an existing primary lesson into a structured, illustrated multilingual vocabulary sheet that teachers can review, print, or continue editing in PowerPoint.

## 3. The context and problem

Primary teachers supporting multilingual learners often need a visual vocabulary resource alongside a lesson. Producing one manually can require the teacher to:

- read through the lesson and decide which language creates barriers;
- distinguish important task language from merely visible nouns;
- translate each term in the correct lesson context;
- find or create a suitable image for every term;
- build and align a consistent printable layout;
- repeat the work when the lesson changes.

Generic AI image tools do not fully solve this problem. Asking a model to generate an entire worksheet as one image can embed spelling or translation errors inside pixels, produce inconsistent layouts, and make individual cards difficult to replace or edit.

Vocabulary Studio uses a different product principle:

> AI interprets the lesson and creates structured educational content; the application protects the worksheet structure.

The AI selects vocabulary, translates it in context, and plans or generates illustrations. The application controls the card grid, typography, progress, failure recovery, and exports.

## 4. Intended users

### Primary user

A classroom teacher who:

- teaches children approximately 5–8 years old;
- supports pupils who are learning through an additional language;
- already has lesson slides, a worksheet, a PDF, or lesson text;
- needs a clear visual vocabulary scaffold quickly;
- wants a resource that can be printed or adapted.

### Portfolio audience

Recruiters, founders, product leaders, and hiring managers evaluating Joe Ramses's product thinking and implementation work. The prepared example is deliberately runnable without uploading a new lesson so this audience can understand the value quickly.

## 5. How it fits into lesson generation

Vocabulary Studio is a **downstream lesson-adaptation tool**, not a full lesson generator.

Its natural position in a wider teaching workflow is:

    Teacher plans or generates a lesson
            ↓
    Lesson materials exist as slides, PDF, worksheet, or text
            ↓
    Teacher chooses “Create vocabulary sheet”
            ↓
    Vocabulary Studio reads the complete lesson material
            ↓
    AI selects learner-critical language and translates it in context
            ↓
    Teacher optionally reviews the proposed vocabulary
            ↓
    One illustration is generated for each approved term
            ↓
    The application assembles a fixed, structured worksheet
            ↓
    Teacher exports PDF or editable PowerPoint
            ↓
    The vocabulary support returns to the lesson resource bundle

In a future integrated lesson-planning platform, a teacher should not need to re-upload files. The lesson's existing structured content could be passed directly into this workflow. The current standalone upload step demonstrates the same capability without depending on a platform Joe does not control.

The value inside a broader lesson-generation product is therefore not “generate another lesson.” It is:

- adapt an existing lesson for multilingual access;
- turn the lesson into an additional classroom resource;
- preserve a clear connection between the support sheet and the task pupils will complete;
- reduce the manual work between lesson creation and inclusive delivery.

## 6. Verified product facts

### Inputs

- Prepared Grade 1 World Cup mathematics example available on first load.
- Custom PDF uploads.
- Custom PowerPoint .pptx uploads.
- Plain-text .txt uploads.
- Pasted or typed lesson text.
- Up to three attachments per request.
- Maximum 20 MB per file.
- Complete-file extraction up to 40 PDF pages or 50 PowerPoint slides.
- Combined lesson text is bounded to approximately 40,000 characters for model processing.

### Supported learning scope

- Designed for Grades 1–3.
- Optimised and demonstrated most fully for Grade 1.
- Spanish, Arabic, French, and Simplified Chinese.
- Spanish is the prepared example's default language.
- Arabic is rendered right-to-left.
- Language direction and font fallback handling are included for Arabic and Simplified Chinese.

### Vocabulary intelligence

- Reads the combined lesson content rather than only a title or first page.
- Selects up to eight learner-critical terms.
- May return fewer than eight when additional words would be filler.
- Prioritises instructional, mathematical, subject, and contextual language.
- Avoids names, isolated numbers, duplicates, navigation text, and irrelevant vocabulary.
- Returns a short selection reason and source evidence for each term.
- Translates terms in lesson context rather than treating them as isolated dictionary entries.
- Produces a visual description for each selected concept.
- Uses structured, schema-validated model output.

### Teacher control

- Vocabulary review is optional and switched off by default for the fastest demo.
- When enabled, a teacher can approve the proposed set, remove a term, or replace a term before image generation.
- Replacing a term triggers a new contextual translation and visual concept.
- Final-sheet freeform editing, reordering, and translation editing are not currently included.

### Illustration generation

- Each vocabulary term receives a separate image request.
- Up to four illustration requests run concurrently.
- Cards populate progressively as their images return.
- A failed illustration does not remove successful cards.
- Individual failed illustrations can be retried.
- Current image model: google/gemini-3.1-flash-lite-image through OpenRouter.
- Image prompts request a square, child-friendly educational illustration with no text, numerals, logos, brands, copyrighted characters, or adult and unsafe content.

### Worksheet and export

- Fixed A4 landscape worksheet.
- Four-column by two-row grid supporting up to eight cards.
- Each card keeps the illustration, English term, and translation as controlled content regions.
- The worksheet is rendered by the application rather than generated as one flattened AI image.
- PDF export matches the structured worksheet preview.
- PowerPoint export keeps text boxes and card shapes editable and illustrations replaceable.
- The worksheet CSS prefers OpenDyslexic and includes language fallbacks. The repository does not currently bundle the OpenDyslexic font files, so the website must not promise that every export uses that typeface.

### Interface and resilience

- Responsive teacher-facing interface with desktop and mobile layouts.
- Three-panel desktop experience: navigation, teacher request, and worksheet preview.
- Named progress stages explain what the system is doing without exposing model chain-of-thought.
- Interrupted work can be recovered as a visible failed state rather than silently disappearing.
- A generation kill switch is available for emergency cost control.
- Prototype rate limits are applied to server routes.

### Deployment and validation

- Standalone Next.js and TypeScript repository.
- Deployed publicly on Vercel.
- Source published on GitHub.
- Production health route reports whether OpenRouter is configured and generation is enabled.
- Validation includes linting, TypeScript checks, automated schema and real-document extraction tests, a production build, responsive browser checks, live text generation, live image generation, and PDF/PowerPoint export inspection.

## 7. Prepared recruiter example

The default example is a Grade 1 mathematics lesson based on World Cup-themed addition and subtraction story problems.

The prepared project includes:

- a multilingual learner scaffold PDF;
- the original “Represent Story Problems” PowerPoint;
- a World Cup story-problems worksheet PDF;
- an editable request asking for a Spanish vocabulary sheet.

The example shows why vocabulary selection is pedagogical rather than cosmetic. Useful terms may include:

- add to;
- take away;
- altogether;
- left;
- team;
- player;
- goal;
- fan.

The result is not hard-coded to return this list. The model must justify its choices from the lesson content.

## 8. Current AI and technical architecture

### AI routing

All generative AI calls go through OpenRouter using server-side credentials.

- Vocabulary selection and contextual translation: google/gemini-2.5-flash-lite.
- Educational illustrations: google/gemini-3.1-flash-lite-image.
- Model identifiers are environment variables and can be replaced without redesigning the product.

The text workflow uses a forced schema tool call followed by server-side Zod validation. Invalid structured output is retried once. This makes the worksheet data predictable before the interface renders it.

### Application responsibilities

The browser application manages:

- the teacher request and attachment state;
- explicit progress states;
- the optional review checkpoint;
- the bounded image queue;
- progressive card updates;
- the deterministic worksheet layout;
- local project recovery;
- PDF and PowerPoint export.

Stateless server routes manage:

- PDF, PowerPoint, and text extraction;
- OpenRouter text requests;
- OpenRouter image requests;
- request validation and prototype rate limits;
- keeping API credentials out of client code.

### Storage

- There is no application database.
- The active project is stored in the current browser using IndexedDB.
- Projects are not synced between browsers or devices.
- The visible **Clear project** action removes the locally stored project.
- Server routes do not intentionally write lesson content to permanent project storage.

## 9. Privacy and responsible-AI framing

The website can accurately say:

- API credentials remain server-side.
- Lesson files and text are sent to external AI providers for processing.
- The application does not require an account or project database.
- Active work is stored locally in the user's browser.
- Analytics exclude raw lesson content, filenames, translations, and generated images.
- The interface gives teachers an optional review point before illustrations are created.
- The app separates AI-generated content from deterministic layout and export code.

The website must not imply that local browser storage means lesson content never leaves the device. Text and illustration context are sent to OpenRouter and routed model providers during generation.

## 10. Claim boundaries

Do not claim that Vocabulary Studio is:

- a full lesson generator;
- a complete lesson-planning platform;
- an autonomous teaching agent;
- production-ready for school-wide deployment;
- GDPR certified;
- safeguarding certified or fully safeguarding reviewed;
- a certified translation service;
- guaranteed to produce error-free translations or images;
- designed for all ages, grades, languages, or document types;
- integrated into CoTeach or officially affiliated with CoTeach;
- storing nothing anywhere during external AI processing;
- using a production-grade distributed rate-limiting system;
- maintaining cloud project history or collaboration features.

Preferred wording is **live working prototype**, **portfolio mini-app**, **teacher-facing prototype**, or **feature concept demonstrated end to end**.

## 11. Website messaging guidance

### Recommended headline

**Turn an existing lesson into a multilingual visual vocabulary sheet.**

### Recommended subheading

Vocabulary Studio reads the complete lesson, identifies the language multilingual pupils need to take part, translates it in context, and creates a printable illustrated resource.

### Short portfolio-card copy

An AI-assisted teacher tool that converts PDFs, PowerPoints, or lesson text into structured multilingual vocabulary sheets. It combines pedagogical vocabulary selection, contextual translation, concurrent illustration generation, and editable PDF and PowerPoint exports.

### Case-study opening

Teachers often create vocabulary scaffolds by hand after the main lesson is finished. Vocabulary Studio explores how that adaptation step could become part of the lesson-planning flow. Rather than asking AI to draw an entire worksheet, the product uses AI for educational judgement and keeps layout, text, progress, and exports under application control.

### Product-value bullets

- Reads the whole lesson instead of asking teachers to enter words individually.
- Selects task-critical language, not just frequent or visually obvious nouns.
- Translates vocabulary in the context in which pupils will use it.
- Generates each illustration independently so failed cards can be retried.
- Produces a consistent printable PDF and an editable PowerPoint.
- Fits after lesson creation as a focused multilingual-access adaptation.

### Technical-case-study copy

The prototype coordinates full-document extraction, schema-validated model output, contextual translation, bounded parallel image generation, progressive UI rendering, browser-local persistence, and deterministic exports. OpenRouter keeps model choice configurable, while stateless server routes protect credentials and avoid a permanent application database.

### Responsible-product copy

The design keeps the teacher in control of the resource. Vocabulary can be reviewed before illustrations are generated, successful cards survive partial failures, and AI content remains separate from the worksheet layout. The prototype is transparent that lesson material is processed by external AI providers and does not make school-production or certified-translation claims.

### Suggested call to action

**Try the prepared Grade 1 lesson**

Supporting copy:

Open the World Cup story-problem example, keep Spanish selected, and create the complete vocabulary sheet without uploading anything.

## 12. Suggested case-study structure for the website

1. **Challenge** — Teachers manually create multilingual visual scaffolds after planning a lesson.
2. **Product insight** — The most useful automation is lesson-grounded vocabulary judgement, not a single AI-generated worksheet image.
3. **Place in the flow** — The tool sits after lesson creation and before classroom delivery.
4. **Experience** — Upload or reuse lesson content, choose a language, optionally review, generate, and export.
5. **AI orchestration** — Structured vocabulary and translation first; independent images second.
6. **Application control** — Fixed layout, progress, retries, local recovery, and editable exports.
7. **Responsible scope** — Temporary processing, browser-local project state, and explicit limits.
8. **Evidence** — Live demo, public repository, tested source-file extraction, and verified exports.
9. **Future direction** — Integration into a broader lesson-planning workflow.

## 13. Future opportunities — not currently built

These ideas may be presented as future directions only:

- direct integration with an upstream lesson generator;
- passing structured lesson data without file re-upload;
- more grades and languages;
- screenshot or image upload;
- editable translations and image prompts;
- card reordering and selectable card counts;
- portrait and additional worksheet layouts;
- reusable approved illustration bank;
- saved school preferences and branding;
- cloud history, accounts, and collaboration;
- curriculum-aware selection;
- sentence stems, definitions, bilingual posters, and personalised packs;
- formal safeguarding, accessibility, security, privacy, and translation review for school production.

Phase 4 of the original PRD was intentionally excluded from the recruiter-ready build. Do not quietly promote these opportunities into current features.

## 14. Useful terminology

**Multilingual learner:** A pupil learning curriculum content through a language that may not be their first or strongest language.

**EAL-aware selection:** Choosing vocabulary based on what a pupil needs to understand or complete the task, rather than relying only on word frequency.

**Contextual translation:** Translating the meaning used in the lesson, such as “left” meaning “remaining,” instead of choosing an unrelated dictionary sense.

**Structured output:** Model output returned as predictable fields that the application validates before using.

**Deterministic worksheet:** A worksheet whose dimensions, card positions, and text areas are controlled by application code rather than painted into a generated image.

**Progressive rendering:** Showing each completed illustration as it returns instead of waiting for every image before displaying the worksheet.

## 15. Website amendment checklist

Before publishing revised website copy, confirm that it:

- positions the tool after lesson creation;
- uses the name **Vocabulary Studio** consistently;
- mentions the prepared Grade 1 example;
- explains why the application, not the image model, controls the worksheet;
- describes PDF and editable PowerPoint export accurately;
- calls the product a working prototype rather than a school-production platform;
- distinguishes current features from future opportunities;
- does not claim certified translation, safeguarding, privacy, or compliance status;
- links to the live demo and public GitHub repository;
- avoids model pricing claims, which can become stale;
- treats model names as current implementation details rather than the core product value.

## 16. Canonical links and supporting artefacts

- Live app: https://multilingual-vocabulary-sheet-gener.vercel.app
- GitHub repository: https://github.com/joe1sou/multilingual-vocabulary-sheet-generator
- Repository README: README.md
- Product-process narrative: docs/website-case-study-handover.md
- Original implementation PRD: multilingual_vocabulary_sheet_generator_PRD.md in the project source materials
- Prepared demo assets: public/demo/
- AI orchestration: src/lib/openrouter.ts
- Main product workflow: src/components/vocabulary-studio.tsx
- Document extraction: src/lib/document-extraction.ts
- Worksheet rendering: src/components/worksheet-preview.tsx
- PDF export: src/lib/export-pdf.ts
- PowerPoint export: src/lib/export-pptx.ts

## 17. Final positioning principle

The website should leave readers with this understanding:

> Vocabulary Studio is a focused adaptation layer between lesson creation and classroom delivery. It uses AI to understand the lesson and create multilingual support, while application code keeps the resource structured, recoverable, and usable by a teacher.
