# Vocabulary Studio — Website Case-Study Handover

**Purpose:** First-person product narrative for Joe Ramses's portfolio website

**Use alongside:** website-knowledge-layer-handover.md

**Narrative status:** Ready for a website-writing or website-building agent

**Last updated:** 14 July 2026

## 1. Instructions for the website agent

This document supplies the story behind Vocabulary Studio: the idea, the product decisions, what failed, what changed, and what Joe would build next.

Use website-knowledge-layer-handover.md for definitive current features, scope, privacy boundaries, and claims. Use this document for the first-person case-study narrative.

The central framing is:

> I wanted to showcase a focused feature that could fit naturally into the CoTeach lesson-planning workflow: after a lesson has been created, a teacher can turn it into a multilingual visual vocabulary resource.

Do not imply that Vocabulary Studio is integrated into, endorsed by, or officially affiliated with CoTeach. Use phrases such as “designed to fit into a workflow like CoTeach,” “CoTeach-adjacent feature concept,” or “a standalone demonstration of how the feature could work.”

## 2. The case study in one paragraph

I wanted to build something that felt like a credible part of an existing lesson-planning workflow rather than a standalone AI novelty. I focused on the point after a teacher has created a lesson but before it is delivered: adapting that lesson for multilingual learners. The first version could read the lesson, choose useful vocabulary, translate it, and create a structured worksheet, but the low-cost image model produced pictures that were technically valid and visually acceptable without reliably representing the vocabulary. That failed the most important quality benchmark. I changed the image model, selected a lower-cost Gemini image option that produced more relevant educational visuals, and designed the generation flow so up to four illustrations run concurrently instead of making the teacher wait for them one at a time. The finished prototype demonstrates not only the feature, but the product decisions behind quality, cost, latency, failure recovery, and future integration.

## 3. Why I chose this problem

I did not want to build another general-purpose chatbot or a disconnected worksheet generator.

I wanted to show how I think about:

- an existing product and its surrounding workflow;
- a genuine teacher problem;
- the point at which AI adds useful judgement;
- the parts of the experience that should remain deterministic;
- quality benchmarks beyond “the API returned something”;
- the cost and latency implications of generation;
- what belongs in a first version and what should wait.

The starting question was:

> If a teacher has already created a lesson in a platform such as CoTeach, what useful classroom adaptation could the product create next?

Multilingual vocabulary support was a strong fit because it depends on the actual lesson. The teacher should not have to re-enter every word manually. The product should understand the task, identify the language pupils need to participate, and turn that analysis into a usable resource.

## 4. Where it fits in the lesson workflow

The intended workflow is:

    A teacher creates or generates a lesson
            ↓
    The lesson already contains slides, questions, examples, or worksheets
            ↓
    The teacher chooses “Create vocabulary sheet”
            ↓
    The feature analyses the complete lesson
            ↓
    It identifies and translates learner-critical vocabulary
            ↓
    It generates one relevant visual for each concept
            ↓
    It returns a printable and editable support resource

The current prototype is standalone because I do not control CoTeach's product or data model. PDF, PowerPoint, and text upload stand in for the lesson data that an integrated version could receive directly.

This distinction matters. Vocabulary Studio is not trying to replace the lesson generator. It is an adaptation layer between lesson creation and classroom delivery.

## 5. My initial product hypothesis

My hypothesis was that the useful AI workflow was not:

> “Generate a pretty vocabulary worksheet.”

It was:

> “Read this lesson, decide which language creates barriers for multilingual pupils, translate those terms in context, and create the structured content needed for a reliable worksheet.”

That led to an early architectural decision: the image model would not create the entire page.

The AI would be responsible for:

- interpreting the lesson;
- selecting vocabulary;
- translating vocabulary in context;
- describing the meaning each image needed to communicate;
- generating one illustration per concept.

The application would be responsible for:

- the fixed worksheet layout;
- displaying English and translated text accurately;
- progress and loading states;
- concurrency;
- retries and partial failures;
- PDF and PowerPoint exports.

This separation meant a weak image could be retried without losing the whole worksheet, and text remained editable rather than being embedded inside generated pixels.

### Process at a glance

| Stage | Question I was answering | Decision or learning |
| --- | --- | --- |
| Workflow exploration | What useful feature belongs after lesson creation? | Focus on multilingual lesson adaptation. |
| Scope | What proves the concept without rebuilding a lesson platform? | Use a standalone app with real PDF, PowerPoint, and text inputs. |
| Architecture | Which work should AI own? | Let AI interpret and generate; let application code control the resource. |
| First build | Can the complete flow work end to end? | Implement structured vocabulary, translation, independent images, and exports. |
| Quality review | Are technically valid images educationally relevant? | No; the first image model failed the semantic benchmark. |
| Model iteration | Can relevance improve without abandoning cost discipline? | Move to the Lite Gemini image route and validate a lesson-specific concept. |
| Experience review | How can eight images arrive without eight sequential waits? | Use four concurrent workers, progressive cards, and individual retry. |
| Next-version planning | What would move the prototype towards classroom readiness? | Add formal evaluation, stronger teacher control, reuse, integration, and governance. |

## 6. Quality benchmarks

Before treating the prototype as successful, I needed more than a technically valid API response.

### Core benchmark 1: semantic relevance

The picture must communicate the meaning of the vocabulary in the context of the lesson.

For example, “add” should show groups joining. An attractive picture of footballs is not enough if it does not communicate addition.

This is the primary gate. An image that fails semantic relevance is not usable, even if it is visually polished or cheap to generate.

### Core benchmark 2: pupil suitability

The visual should be understandable by children aged approximately 5–8. It should have one clear concept, high contrast, friendly colours, and limited background detail.

### Core benchmark 3: clean educational output

The image should avoid text, labels, numerals, logos, brands, copyrighted characters, and inappropriate content. The application owns the text.

### Core benchmark 4: lesson grounding

Vocabulary choices and images should reflect the uploaded lesson rather than generic word associations. The prepared World Cup lesson provides a concrete test for this.

### Core benchmark 5: structured usability

The result needs to work as a classroom resource:

- consistent A4 layout;
- readable vocabulary and translation;
- stable card dimensions;
- PDF export;
- editable PowerPoint export;
- right-to-left handling for Arabic.

### Core benchmark 6: acceptable waiting time

Generating up to eight illustrations should not feel like eight sequential waits. The first useful result should appear early, and the worksheet should populate progressively.

### Core benchmark 7: cost per usable result

The cheapest request is not necessarily the lowest-cost product choice. If a cheap model generates irrelevant images that need repeated retries, its cost per accepted image can be worse than a more capable model.

### Core benchmark 8: recoverability

One failed image should not discard the vocabulary analysis or seven successful cards. Teachers should be able to retry only the failed item.

## 7. What happened in the first iteration

The first live illustration model was black-forest-labs/flux.2-klein-4b through OpenRouter.

I selected it because it offered a low-cost route for testing the full image workflow. Technically, it worked:

- the API returned image data;
- the application could display the image;
- concurrent requests could run;
- the worksheet and export pipeline could consume the result.

However, qualitative testing exposed the more important problem: the generated pictures did not reliably relate to the vocabulary meaning.

This was a useful failure. The system had passed the technical benchmark but failed the product benchmark.

The question was not “Did the model generate an image?” It was:

> “Would this image help a multilingual Grade 1 pupil understand the word in this lesson?”

When the answer was no, the model was not suitable for the experience, regardless of its low price.

## 8. The model decision

I changed the illustration model to google/gemini-3.1-flash-lite-image through OpenRouter.

I chose the Lite image model rather than automatically selecting the largest or most expensive Gemini option. At the time of testing, this preserved the cost discipline of the prototype while improving the quality that mattered.

The comparison was based on usable output:

| Decision area | First image route | Current image route |
| --- | --- | --- |
| Model | Flux 2 Klein 4B | Gemini 3.1 Flash Lite Image |
| Reason for trying | Very low-cost starting point | Lower-cost Gemini image option |
| Technical response | Successful | Successful |
| Semantic relevance | Did not reliably meet the benchmark | Produced a clear lesson-relevant visual in live testing |
| Product decision | Reject despite low request cost | Keep and continue evaluating |

In the live comparison, the Gemini route produced an “add” illustration showing two groups of footballs joining into one group. That communicated the mathematical concept instead of merely depicting the lesson theme.

This changed how I thought about model cost:

> I should optimise for cost per usable classroom asset, not simply cost per API request.

The model remains an environment-variable choice, so the product can compare or replace providers without rebuilding the application architecture.

## 9. A second model and cost decision

I originally considered Claude Sonnet 4 for vocabulary selection and translation. It was capable, but this task is constrained: select a small number of terms, translate them in context, and return validated structured fields.

I moved the text workflow to google/gemini-2.5-flash-lite through OpenRouter. At the time of testing, it met the live quality check for contextual Spanish vocabulary at a substantially lower token cost.

For example, it correctly treated “altogether” as “en total” in an addition story problem rather than translating the word without context.

The lesson from both model decisions was the same:

- begin with a quality benchmark;
- use the smallest model that reliably meets it;
- keep the provider replaceable;
- validate live output rather than choosing from model reputation alone.

## 10. Designing around image-generation time

Even with the right model, image generation takes noticeably longer than returning text.

A vocabulary sheet may contain up to eight illustrations. Sending one request, waiting for it to finish, and then starting the next would make the experience feel slow.

I implemented a bounded queue with a concurrency limit of four:

1. Images 1–4 begin together.
2. When one finishes, the next queued image begins.
3. No more than four remain active at once.
4. Completed cards appear immediately.
5. A failed card can be retried independently.

This was a deliberate balance:

- **One request at a time** would create unnecessary wall-clock delay.
- **All eight at once** could create avoidable rate-limit and reliability pressure.
- **Four at once** improves speed while keeping the workload bounded.

Concurrency does not make an individual model call cheaper. It improves the teacher's waiting experience by reducing total elapsed time and showing progress earlier.

The interface also exposes meaningful stages:

- reading lesson files;
- understanding the lesson;
- selecting vocabulary;
- translating vocabulary;
- planning illustrations;
- generating illustrations;
- building the worksheet;
- ready to export.

This makes the wait understandable without pretending to show private model reasoning.

## 11. Other product decisions

### Complete lesson analysis

The tool reads the full extracted PDF or PowerPoint within prototype limits. Selecting vocabulary from only the title or first slide would undermine the central lesson-grounding claim.

### Optional review rather than mandatory review

The fastest demo moves directly into image generation, but teachers can enable a review checkpoint to approve, remove, or replace vocabulary first.

This keeps the main flow fast while acknowledging that educational judgement should remain reviewable.

### Fewer than eight is acceptable

The model may return fewer than eight terms. Filling the grid is not more important than selecting useful language.

### Local project state

The active project is kept in browser storage rather than a new application database. This was enough to demonstrate recovery and clearing without expanding the prototype into accounts, cloud history, and collaboration.

### Editable PowerPoint

I included PowerPoint export because teachers often need to adapt resources. Text and card shapes remain editable instead of turning the complete resource into one flattened image.

## 12. What the finished prototype demonstrates

The current product demonstrates an end-to-end feature concept:

- a prepared Grade 1 lesson that can run immediately;
- PDF, PowerPoint, and text ingestion;
- full-lesson vocabulary analysis;
- contextual translation into Spanish, Arabic, French, or Simplified Chinese;
- optional vocabulary review;
- one independently generated image per term;
- four-request image concurrency;
- progressive card rendering;
- partial-failure recovery and individual retry;
- deterministic A4 worksheet layout;
- PDF and editable PowerPoint export;
- browser-local project recovery;
- live deployment with server-side AI credentials.

More importantly, it demonstrates the process of evaluating whether those capabilities create a useful teacher experience.

## 13. What I would include in the next version

### 1. A formal illustration evaluation set

I would create a small benchmark set across instructional, mathematical, and contextual words. Each image model or prompt change would be scored for:

- semantic relevance;
- age appropriateness;
- absence of text;
- simplicity;
- cultural appropriateness;
- consistency;
- teacher acceptance.

This would replace ad hoc model comparison with repeatable evidence.

### 2. Automated relevance checking

After generation, a multimodal model could compare the image with the vocabulary term, visual description, and lesson context.

If the result failed a relevance threshold, the system could revise the prompt and retry before showing the card. This should remain a guardrail, not a substitute for teacher review.

### 3. More teacher control

The next review surface could allow teachers to:

- edit a translation;
- edit the visual concept;
- regenerate one image with a revised instruction;
- reorder cards;
- choose 4, 6, or 8 cards;
- approve or reject each visual.

### 4. An approved illustration bank

Many curriculum concepts recur. Reusing teacher-approved images could:

- improve consistency;
- reduce generation time;
- reduce cost;
- avoid repeatedly testing the same concept;
- provide a safer default before new generation.

### 5. Adaptive concurrency and cost visibility

The queue could respond to provider rate limits and observed latency rather than always using four workers.

I would also add internal measurements for:

- time to first image;
- time to completed worksheet;
- retries per accepted image;
- model cost per sheet;
- teacher replacements and rejections.

The relevant optimisation target is not raw generation speed. It is time and cost to an accepted classroom resource.

### 6. Direct lesson-platform integration

In an integrated CoTeach-like workflow, the feature could receive:

- lesson title;
- grade;
- subject;
- learning objective;
- teacher explanation;
- slide and worksheet content;
- existing language preferences.

The completed vocabulary sheet could then be saved back into the lesson bundle without file upload or download.

### 7. Classroom-production readiness

Before school-wide use, I would add formal work around:

- safeguarding and content moderation;
- privacy and data processing;
- accessibility;
- translation review;
- security;
- distributed rate limits;
- auditability;
- school and teacher administration.

These are future requirements, not claims made by the current prototype.

## 14. Product learnings

### A technically successful output can still be a product failure

The first image model returned valid images, but relevance was weak. Technical completion was not the same as helping the pupil.

### Model choice should follow the task benchmark

I did not keep a larger text model because it was well known, and I did not keep the cheapest image model because it returned something. I used the lowest-cost route that met the relevant quality threshold in live testing.

### AI should not own everything

The model interprets and generates. The application controls text, layout, progress, retries, and exports. That division makes the experience more trustworthy and editable.

### Latency is part of product design

Concurrency, progressive rendering, and per-card status are not implementation details hidden from the experience. They determine whether generation feels usable.

### Future integration changes the input, not the core value

The standalone version uses uploads. A platform-integrated version would use lesson data directly, but the central value remains the same: turn a completed lesson into targeted multilingual support.

## 15. Copy-ready website narrative

### Suggested case-study title

**Designing a multilingual lesson-adaptation feature for a CoTeach-style workflow**

### Suggested subtitle

How I moved from an initial AI prototype to a lesson-grounded, quality-led workflow that balances image relevance, generation time, and model cost.

### Suggested opening

I wanted to showcase something that could fit naturally into the CoTeach workflow rather than build a disconnected AI demo. I focused on the moment after a lesson has been created: a teacher still needs to adapt it for the pupils in front of them. Vocabulary Studio reads the lesson, identifies the language multilingual learners need to participate, translates it in context, and creates an illustrated vocabulary resource.

### Suggested process summary

I began by separating AI judgement from deterministic document design. The model would select and translate vocabulary and generate one visual per term; the application would control the worksheet, retries, progress, and exports. That architecture worked technically, but the first low-cost image model did not meet the relevance benchmark. It generated images, but not consistently useful explanations of the vocabulary. I switched to Gemini 3.1 Flash Lite Image, which produced clearer lesson-relevant visuals while retaining a lower-cost model choice.

Because a sheet may need eight illustrations, I also treated latency as a product problem. Four image requests run concurrently, new cards appear as soon as they finish, and a failed image can be retried without rebuilding the sheet. The result is a working prototype, but also a record of the decisions required to make AI output usable rather than merely impressive.

### Suggested outcome

The final prototype turns lesson PDFs, PowerPoints, or text into a multilingual A4 vocabulary sheet with contextual translations, independently generated illustrations, progressive rendering, and PDF or editable PowerPoint export. It is designed as a standalone demonstration of a feature that could sit inside a wider lesson-planning product.

### Suggested reflection

The most important learning was that model evaluation needs to reflect the classroom outcome. The cheapest image was not the cheapest usable result when its meaning was unclear. The next version would formalise those quality benchmarks, add automatic relevance checks and stronger teacher controls, reuse approved imagery, and connect directly to structured lesson data.

## 16. Ninety-second interview talk track

“I wanted to build something that could genuinely fit into the workflow of a product like CoTeach. I looked at what happens after a lesson is generated and chose multilingual adaptation as the problem: teachers often still need to identify vocabulary, translate it, find visuals, and format a resource manually.

I built a standalone prototype that reads the full lesson, selects the language pupils need to complete the task, translates it in context, and generates one illustration per term. The application, rather than the AI, controls the A4 worksheet and editable exports.

The first image model was cheap and worked technically, but the pictures did not reliably represent the vocabulary. That failed my main quality benchmark, so I switched to a lower-cost Gemini image model that produced more relevant educational visuals. I also avoided generating images one at a time. Four requests run concurrently and the cards appear progressively, which reduces the total wait while keeping the load bounded.

The next version would introduce a formal evaluation set, automatic image-relevance checks, an approved image bank, deeper teacher editing, and direct lesson-data integration. The project shows the full build, but more importantly it shows how I think about workflow fit, quality, cost, latency, and iteration.”

## 17. Claim and tone guidance

The tone should be reflective and evidence-led:

- say what I wanted to test;
- explain the decision and its trade-off;
- describe what failed without hiding it;
- show how the failure changed the product;
- distinguish a working prototype from school-production readiness;
- keep the teacher and pupil outcome ahead of the model names.

Do not present CoTeach integration as a current fact. Do not describe the initial image model as broken; it returned valid images but did not meet the semantic-relevance benchmark for this use case.

Do not turn the case study into a catalogue of AI models. The stronger story is the evaluation method:

> What is the smallest and most affordable approach that produces a resource a teacher could actually use?

## 18. Canonical evidence

- Factual handover: docs/website-knowledge-layer-handover.md
- Live app: https://multilingual-vocabulary-sheet-gener.vercel.app
- Public repository: https://github.com/joe1sou/multilingual-vocabulary-sheet-generator
- AI orchestration: src/lib/openrouter.ts
- Concurrent generation workflow: src/components/vocabulary-studio.tsx
- Quality requirements and original scope: multilingual_vocabulary_sheet_generator_PRD.md in the source materials

## 19. Final positioning

The case study should leave readers with this message:

> I did not build Vocabulary Studio simply to show that AI could generate text and pictures. I built it to explore whether a focused adaptation feature could fit into a real lesson-planning workflow, then iterated when the first technically successful version did not meet the quality bar.
