# Vocabulary Studio — Product Walkthrough and Reflection Script

**Audience:** Recruiter, hiring manager, founder, or product leader

**Intended length:** 10–12 minutes for the full version, followed by questions

**Voice:** First person, product-lead perspective

## How to use this script

- The main bullets are written as words you can say.
- Stage directions appear in italics and are not spoken.
- Product-lead vocabulary is bolded the first time it is especially useful.
- Keep the product terms, but speak conversationally. The goal is clear product judgement, not jargon density.
- Do not imply that this is currently integrated with or endorsed by CoTeach. Say that it is designed to fit into a CoTeach-style workflow.

### If you only have 7–8 minutes

- Keep Sections 1–8 and the closing in Section 13.
- In Section 12, mention only the formal evaluation set, stronger teacher control, direct platform integration, and the final prioritisation sentence.
- Hold the text-model detail, privacy boundaries, metrics, and full roadmap for questions.
- Sections 14–17 are preparation notes and are not part of the timed walkthrough.

## 1. Opening and positioning — 30–45 seconds

*Open the live app with the prepared World Cup example visible.*

- “I’ll walk you through Vocabulary Studio, a standalone feature concept I designed and built to explore how multilingual lesson adaptation could fit into a workflow like CoTeach.”
- “I deliberately did not build another general-purpose chatbot. I started with a specific **workflow opportunity**: what happens after a teacher has already created a lesson, but still needs to adapt it for the pupils in front of them?”
- “The **value proposition** is simple: take an existing lesson, identify the language multilingual pupils need to participate, translate it in context, and produce a classroom-ready visual support resource.”
- “What I want to show is not only the finished interface. I also want to explain the **product hypothesis**, the quality bar, the model decisions, and the trade-offs I made.”

### Product-lead phrases to land

- Workflow opportunity
- Value proposition
- Product hypothesis
- Classroom-ready outcome

## 2. User problem and job to be done — 45–60 seconds

- “The **user problem** is that the main lesson may already exist, but the adaptation work is still manual.”
- “A teacher may need to read through the lesson, identify difficult task language, translate each term, find a relevant picture, and format everything consistently.”
- “The **job to be done** is not simply ‘make a worksheet.’ It is: ‘Help me turn this specific lesson into a useful multilingual scaffold without recreating the content manually.’”
- “That distinction shaped the product. The system needs to understand the lesson context, not just extract frequent words or generate attractive pictures.”
- “The intended user outcome is less preparation time and a resource that remains closely aligned with the lesson pupils are about to complete.”

### Product-lead phrases to land

- User problem
- Job to be done
- User outcome
- Workflow friction
- Lesson alignment

## 3. Product hypothesis, principles, and MVP scope — 45–60 seconds

- “My core **product hypothesis** was that AI adds the most value in the judgement layer: reading the lesson, selecting learner-critical vocabulary, translating it in context, and planning the visual meaning.”
- “I made a clear **product principle** that AI would not generate the entire worksheet as one flattened image.”
- “The AI owns interpretation and generation. The application owns text accuracy, layout, progress, retries, and export.”
- “That separation gives me a more reliable and editable product surface. If one picture is weak, I can regenerate one card rather than lose the entire worksheet.”
- “For the **MVP**, I scoped the experience to Grades 1–3, four target languages, three input formats, and a maximum of eight vocabulary cards.”
- “The main **non-goals** were accounts, cloud project history, a full lesson generator, and a general worksheet editor. I wanted the smallest scope that could test the end-to-end value proposition.”

### Product-lead phrases to land

- Product principle
- Judgement layer
- MVP
- Scope
- Non-goals
- End-to-end value proposition

## 4. Prepared example and activation — 30–45 seconds

*Point to the three prepared lesson attachments and the editable prompt.*

- “To reduce **activation friction**, the product opens with a prepared Grade 1 World Cup mathematics example.”
- “The example contains a scaffold PDF, the original PowerPoint, and a student worksheet, so a recruiter or teacher can experience the complete flow without first finding a file.”
- “The request is editable, Spanish is selected by default, and the teacher can choose whether to review the vocabulary before image generation.”
- “The important point here is that the app analyses the complete extracted lesson within the prototype limits, rather than making a claim from the title or first slide.”
- “For this walkthrough I’ll keep the optional review step off so you can see the fastest path to value.”

### Product-lead phrases to land

- Activation friction
- Prepared path
- Fastest path to value
- Complete-input analysis

## 5. Start generation and explain the orchestration — 45–60 seconds

*Click “Create vocabulary sheet.”*

- “When I start generation, the interface exposes the main operational stages: reading the files, understanding the lesson, selecting and translating vocabulary, planning illustrations, generating images, and building the worksheet.”
- “These stages improve **perceived latency** and make the system state understandable without exposing private chain-of-thought.”
- “The text model returns a structured, schema-validated result rather than free-form copy. Each term includes the English word, contextual translation, category, selection reason, source evidence, and visual description.”
- “The selection criteria prioritise instructional and mathematical language as well as lesson context. The model is allowed to return fewer than eight words because filling the grid is not more important than pedagogical relevance.”
- “This is an example of a **quality guardrail** implemented in the product contract, not left entirely to the model.”

### Product-lead phrases to land

- Perceived latency
- Structured output
- Product contract
- Quality guardrail
- System state

## 6. Explain image concurrency while generation runs — 60–75 seconds

*Move attention to the worksheet preview as cards begin appearing.*

- “Image generation is the slowest part of the workflow, so I treated latency as a product problem rather than only an engineering detail.”
- “A sheet may require up to eight illustrations. Generating them one at a time would create eight sequential waits.”
- “I implemented **bounded concurrency** with four active image requests.”
- “The first four begin together. As one finishes, the next queued image starts. This reduces total elapsed time without sending every request simultaneously.”
- “I chose four as a trade-off between speed, provider reliability, and rate-limit pressure.”
- “The worksheet uses **progressive rendering**, so the user sees completed cards immediately rather than waiting for the slowest request.”
- “Each image is also an isolated unit of work. If one fails, the seven successful cards remain available and the user can retry only the failed card.”
- “That is the product's **graceful-degradation strategy**: preserve completed value and contain the failure.”

### Product-lead phrases to land

- Bounded concurrency
- Progressive rendering
- Time to first value
- Trade-off
- Graceful degradation
- Isolated failure

## 7. Walk through the completed worksheet — 45–60 seconds

*Point to one or two vocabulary cards, the layout, and the export buttons.*

- “The completed result is a deterministic A4 landscape worksheet with up to eight structured cards.”
- “The model generated the educational content, but application code controls the image frame, English term, translation, spacing, and typography.”
- “That gives the product a consistent output regardless of generative variation.”
- “The teacher can export a PDF that matches the preview or an editable PowerPoint where text, card shapes, and images remain separate objects.”
- “PowerPoint export is important because the **user need** does not end at generation. Teachers often need to adapt a resource before using it.”
- “If review is enabled earlier, the teacher can approve, remove, or replace vocabulary before paying the image-generation cost.”
- “That is a lightweight **human-in-the-loop** checkpoint rather than a mandatory interruption to every request.”

### Product-lead phrases to land

- Deterministic output
- Generative variation
- User need
- Editable downstream workflow
- Human in the loop

## 8. Reflection: the first image model failed the quality bar — 60–75 seconds

- “The most useful product learning came from the first image-model iteration.”
- “I initially used Flux 2 Klein because it was a very low-cost way to prove the technical image pipeline.”
- “Technically, it passed: the API returned images, concurrency worked, and the worksheet could display and export them.”
- “But it failed the primary **quality benchmark**. The pictures did not reliably communicate the meaning of the vocabulary.”
- “For example, an image can contain footballs and still fail to explain ‘add’ if it does not show groups joining.”
- “That was a good reminder that a technically successful output can still be a product failure.”
- “My success criterion was not ‘did the API return an image?’ It was ‘would this help a multilingual Grade 1 pupil understand the concept in this lesson?’”
- “I rejected the first model for this use case and moved to Gemini 3.1 Flash Lite Image.”
- “The live comparison produced a clearer ‘add’ visual showing two groups of footballs joining into one group.”
- “I chose the Lite route because I still wanted cost discipline. The decision was based on **cost per usable result**, not simply cost per request.”

### Product-lead phrases to land

- Quality benchmark
- Success criterion
- Product failure
- Cost per usable result
- Evidence-based iteration
- Cost discipline

## 9. Reflection: choosing the text model — 30–45 seconds

- “I applied the same evaluation logic to the text workflow.”
- “I considered Claude Sonnet 4, but the task is constrained: select a small vocabulary set, translate it in context, and return validated structured fields.”
- “I moved to Gemini 2.5 Flash Lite because it met the live quality check at a lower cost at the time of testing.”
- “For example, it correctly translated ‘altogether’ as ‘en total’ in the context of an addition problem.”
- “My **model-selection principle** became: use the smallest model that reliably meets the task-specific quality bar, and keep the provider replaceable.”
- “Both model choices are environment variables, so the architecture supports future comparison without product rework.”

### Product-lead phrases to land

- Task-specific quality bar
- Model-selection principle
- Replaceable provider
- Cost-to-serve

## 10. Responsible scope and operational boundaries — 30–45 seconds

- “I also made deliberate scope and privacy decisions.”
- “The prototype does not require accounts or an application database. The active project is stored in the current browser.”
- “API credentials remain server-side, and analytics exclude raw lesson content, filenames, translations, and generated images.”
- “The interface is transparent that lesson content is sent to external AI providers for processing.”
- “I would describe this as **privacy-conscious prototyping**, not school-production compliance.”
- “I am not claiming certified translation, completed safeguarding review, or GDPR certification.”
- “Those are explicit **production-readiness gaps**, not details I would hide behind the demo.”

### Product-lead phrases to land

- Privacy-conscious prototyping
- Production-readiness gap
- Explicit boundary
- Responsible scope

## 11. How I would measure product success — 45–60 seconds

- “If I were taking this beyond the prototype, I would define success around an accepted classroom resource, not generation volume.”
- “My proposed **north-star metric** would be the percentage of vocabulary sheets accepted for use with minimal teacher intervention.”
- “I would support that with several **leading indicators**.”
- “First, activation: the percentage of users who start and complete their first prepared or custom sheet.”
- “Second, **time to first value**: how long until the first relevant card appears.”
- “Third, end-to-end completion time and export rate.”
- “Fourth, vocabulary removal or replacement rate, which tells me whether selection quality is meeting the user need.”
- “Fifth, image retry and rejection rate, segmented by model and vocabulary category.”
- “Finally, **cost-to-serve** per accepted sheet rather than raw API spend.”
- “Those metrics connect model performance to the teacher outcome.”

### Product-lead phrases to land

- North-star metric
- Leading indicators
- Activation
- Time to first value
- Acceptance rate
- Cost-to-serve
- Segmentation

## 12. What I would prioritise next — 60–75 seconds

- “My next step would not be adding more decorative features. I would prioritise the biggest evidence gaps.”
- “Priority one would be a formal illustration evaluation set across instructional, mathematical, and contextual vocabulary.”
- “That would turn the current qualitative benchmark into a repeatable **evaluation framework**.”
- “Priority two would be automatic image-relevance checking, with a revised prompt and retry when the image does not communicate the intended meaning.”
- “Priority three would be stronger teacher control: editing translations and visual concepts, approving each image, reordering cards, and choosing the card count.”
- “Priority four would be an approved illustration library. Reusing accepted images should improve consistency, latency, and unit economics.”
- “Priority five would be direct platform integration, where structured lesson data is passed into this feature and the completed worksheet is saved back into the lesson bundle.”
- “Before school deployment, I would add the required safeguarding, accessibility, privacy, security, translation-review, and audit work.”
- “That prioritisation follows **risk and learning value**: prove educational quality first, then optimise reuse and integration, then expand scope.”

### Product-lead phrases to land

- Prioritisation
- Evidence gap
- Evaluation framework
- Unit economics
- Risk and learning value
- Platform integration
- Product readiness

## 13. Closing reflection — 30–45 seconds

- “What I am showcasing here is not simply that I can connect a text model and an image model.”
- “I started with a workflow hypothesis, defined a constrained MVP, separated generative judgement from deterministic product behaviour, and tested the output against a classroom-relevant quality bar.”
- “When the first image model failed that bar, I changed the approach rather than treating technical completion as success.”
- “I also designed around latency, partial failure, cost-to-serve, teacher control, and future platform fit.”
- “The result is a working prototype, but the stronger output is the product learning: how to move from an interesting AI capability to a feature that has a credible place in a real user workflow.”

### Product-lead phrases to land

- Workflow hypothesis
- Constrained MVP
- Product learning
- Credible user workflow
- Outcome over output

## 14. Lines to use during unpredictable live-demo moments

### If images are still generating

- “This is the highest-latency stage, which is why the product exposes progressive completion rather than blocking the entire worksheet.”
- “The relevant metric here would be time to first accepted image and total time to an exportable sheet.”
- “While that completes, I’ll explain the model-quality iteration that shaped this flow.”

### If one image fails

- “This is one of the failure modes I designed for. The failure is isolated to one card, completed value is preserved, and the user can retry only that request.”
- “In a production version I would measure retry rate by model and vocabulary category and use it as an input to model routing.”

### If a vocabulary choice is questionable

- “Generative variation is expected, which is why the product includes an optional human-review checkpoint.”
- “A replacement here is also a useful product signal. I would track replacement rate to improve the selection prompt and evaluation set.”

### If the image is attractive but semantically weak

- “This is exactly the distinction between visual quality and semantic relevance.”
- “For this product, relevance is the gate. The picture needs to communicate the concept, not merely match the lesson theme.”

### If the AI service returns an error

- “The user input and completed work are preserved, so this remains a recoverable state rather than a destructive failure.”
- “For a production service I would add durable jobs, provider fallback, distributed rate limiting, and clearer operational telemetry.”

### If everything finishes quickly

- “This is the intended benefit of bounded parallel generation: the total wait is closer to two waves of image requests than eight sequential requests.”

## 15. Product-lead vocabulary cheat sheet

Use these terms where they fit naturally:

| Product term | How to use it in this case study |
| --- | --- |
| **User problem** | The adaptation work remains after the lesson is created. |
| **Job to be done** | Turn this lesson into multilingual support without rebuilding it manually. |
| **Value proposition** | Lesson-grounded vocabulary and visuals with editable output. |
| **Product hypothesis** | AI judgement plus deterministic layout creates a more usable resource. |
| **MVP** | Grades 1–3, four languages, three input types, up to eight cards. |
| **Non-goals** | Accounts, full lesson generation, and cloud collaboration. |
| **Success criterion** | A relevant, accepted classroom resource—not merely an API response. |
| **Quality bar** | Semantic relevance, pupil suitability, lesson grounding, and usable export. |
| **Trade-off** | Four concurrent requests balance latency and provider pressure. |
| **Human in the loop** | Optional vocabulary review before image spend. |
| **Graceful degradation** | One failed image does not destroy successful work. |
| **Time to first value** | Time until the first useful illustrated card appears. |
| **North-star metric** | Sheets accepted with minimal teacher intervention. |
| **Leading indicator** | Retry, replacement, completion, and export rates. |
| **Cost-to-serve** | Model cost per accepted sheet. |
| **Unit economics** | Whether reuse and model routing make each accepted resource sustainable. |
| **Evidence gap** | Formal illustration and translation evaluation is not yet complete. |
| **Prioritisation** | Address semantic quality before adding broader scope. |
| **Platform fit** | A downstream adaptation layer in a CoTeach-style lesson workflow. |
| **Production readiness** | Safeguarding, privacy, accessibility, security, and operational controls still required. |

## 16. Phrases to avoid

Avoid saying:

- “The AI knows exactly what every pupil needs.”
- “The translations are accurate.”
- “The images are always relevant.”
- “This is integrated with CoTeach.”
- “The files never leave the browser.”
- “This is ready for schools.”
- “I chose the cheapest model.”
- “Everything happens instantly.”

Use instead:

- “The model selects vocabulary against a defined product contract.”
- “Translations are contextual, AI-generated, and reviewable.”
- “Semantic relevance is the primary image-quality benchmark.”
- “The prototype is designed to demonstrate how the feature could fit into a CoTeach-style workflow.”
- “Files are processed by server routes and external AI providers; active project state is stored locally.”
- “This is a working prototype with explicit production-readiness gaps.”
- “I selected the lowest-cost route that met the tested quality bar.”
- “I reduced total elapsed time through bounded concurrency and progressive rendering.”

## 17. One-sentence final answer if asked, “What does this project say about you as a product lead?”

- “It shows that I start from the user workflow, turn the opportunity into a testable product hypothesis, define the quality bar, make explicit scope and cost trade-offs, and iterate when technically successful output does not deliver the intended user outcome.”
