import { DEFAULT_PROMPT } from "@/lib/constants";
import type { ProjectState, UploadedSource } from "@/lib/types";

const scaffoldText = `
MLL Scaffold Pack: Represent Story Problems

Student scaffold - Story Problems Vocabulary and Supports
Story problem / Problema: Math written as a story with numbers and actions.
Add to / Agregar: Put more with what you have, joining two groups.
Take from / Quitar: Remove or take away some, separating a group.
How many / Cu\u00e1ntos: Asking for the total amount.
Altogether / En total: All together as one group.
Left / Quedan: What remains after taking away.
Show / Mostrar: Represent using objects, drawings, or actions.
Represent / Representar: Show your thinking in different ways.

Sentence frames for explaining:
For add-to problems: First, I had ___. Then I added ___. Now I have ___.
I showed ___ and ___ joining together.
For take-from problems: I started with ___. I took away ___. Now I have ___ left.
I showed ___ and removed ___.
For putting-together problems: ___ and ___ altogether is ___.
I have ___ in one group and ___ in the other group. Altogether, I have ___.

Ways to show your thinking: act it out; draw pictures; use objects; write or say the numbers.
Partner prompts ask what pupils noticed first, how they showed the story, and what numbers they used.

Teacher MLR notes recommend processing time, structured turns, read-aloud language, partner talk,
gestures for take away, and explicit contrast between add to and put together. Likely language barriers
include two-step sequencing and the production burden of explaining a representation. Teachers should
look for objects, gestures, drawings, correct action sequencing, identification of starting and changed
amounts, sentence-frame use, and links between representations and numbers. Translations and
code-switching are expected; teachers should revoice in English while validating mathematical thinking.
Differentiation notes recommend a short pre-lesson acted story, sentence-frame cards, peer pairing,
and calling on pupils who used strong representations.
`.trim();

const slidesText = `
Represent Story Problems - PowerPoint Presentation

Story Problems: Let's Make Sense of What's Happening.
What is a story problem? A story problem is math that tells a story with numbers. It describes something
that is happening, gives us numbers to work with, and asks a question to answer.

Let's listen: A soccer team has 7 players on the field. Then 2 more players come onto the field.
How many players are on the field now?

What happened? First, what did we start with? Then, what happened? Now, what is the question asking?
We can show story problems in many ways: act it out with our bodies, draw pictures or circles, use objects
or counters, and write or say the numbers.

Pick one way: There are 10 puppets. We put 5 puppets away. How many puppets are left?
Your turn: show the story in the way that makes sense to you. You can draw, use objects, or act it out.
Share your thinking: show what you did, tell your partner or the class, and explain how you know.

Key words: Add to / Agregar - put together or join more. Take away / Quitar - remove or separate.
Altogether / En total - all together. How many / Cu\u00e1ntos - the question we answer.
`.trim();

const worksheetText = `
Story Problems: World Cup Edition

Key words: Add to / Agregar means putting more together. Take away / Quitar means removing some.
Story problem / Problema means math written as a story.

Problem 1 - World Cup Teams: A soccer team has 7 players on the field. Then 2 more players come onto
the field. How many players are on the field now? Pupils can act it out, draw seven circles and two more,
or use counters and count together.

Problem 2 - Scoring Goals: A team scored 10 goals in the season. Then they took 3 goals away because
they do not count anymore. How many goals do they have now? Sentence starters: First, I had ___ goals.
Then, I took away ___. Now, I have ___ goals.

Problem 3 - Fans in the Stadium: There were 8 fans cheering for the red team and 5 fans cheering for
the blue team. How many fans are cheering altogether? Pupils can make two groups, draw two groups,
count them all together, or act out being fans.

Challenge: A player had 6 soccer balls. She gave away 2 soccer balls to a friend. How many soccer balls
does she have left? Show it two different ways. Extra challenge: make your own World Cup story problem
and ask a friend to solve it using objects or drawings.
`.trim();

export const DEMO_SOURCES: UploadedSource[] = [
  {
    id: "demo-scaffold",
    name: "MLL Scaffold Pack.pdf",
    mimeType: "application/pdf",
    sizeBytes: 55_606,
    pageCount: 5,
    extractedText: scaffoldText,
    downloadUrl: "/demo/mll-scaffold-pack.pdf",
    isPreset: true,
  },
  {
    id: "demo-slides",
    name: "Represent Story Problems.pptx",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    sizeBytes: 173_056,
    pageCount: 10,
    extractedText: slidesText,
    downloadUrl: "/demo/represent-story-problems.pptx",
    isPreset: true,
  },
  {
    id: "demo-worksheet",
    name: "World Cup Story Problems.pdf",
    mimeType: "application/pdf",
    sizeBytes: 36_827,
    pageCount: 4,
    extractedText: worksheetText,
    downloadUrl: "/demo/world-cup-story-problems.pdf",
    isPreset: true,
  },
];

export function createDemoProject(): ProjectState {
  return {
    id: crypto.randomUUID(),
    prompt: DEFAULT_PROMPT,
    sources: DEMO_SOURCES,
    targetLanguage: "spanish",
    reviewBeforeGeneration: false,
    status: "idle",
    isPreset: true,
  };
}

export function createEmptyProject(): ProjectState {
  return {
    id: crypto.randomUUID(),
    prompt: "",
    sources: [],
    targetLanguage: "spanish",
    reviewBeforeGeneration: false,
    status: "idle",
    isPreset: false,
  };
}
