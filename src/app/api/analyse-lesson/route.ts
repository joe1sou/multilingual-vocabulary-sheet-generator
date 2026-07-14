import { MAX_COMBINED_TEXT } from "@/lib/constants";
import { analyseLesson, generationIsEnabled } from "@/lib/openrouter";
import { checkRateLimit, getRequestIdentifier } from "@/lib/rate-limit";
import { analyseRequestSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!generationIsEnabled()) {
    return Response.json(
      { error: "Vocabulary generation is temporarily paused." },
      { status: 503 },
    );
  }

  const rateLimit = checkRateLimit("analyse", getRequestIdentifier(request), 8);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "The public demo has reached its analysis limit. Please wait and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  try {
    const input = analyseRequestSchema.parse(await request.json());
    const lessonText = input.sources
      .map((source) => `SOURCE: ${source.name}\n${source.extractedText}`)
      .join("\n\n")
      .slice(0, MAX_COMBINED_TEXT);

    const result = await analyseLesson({
      prompt: input.prompt,
      targetLanguage: input.targetLanguage,
      lessonText,
    });
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The lesson could not be analysed.";
    const status = message.includes("OPENROUTER_API_KEY") ? 503 : 422;
    return Response.json(
      {
        error:
          status === 503
            ? "The AI service is not configured yet. Add OPENROUTER_API_KEY in Vercel to run the demo."
            : message,
      },
      { status },
    );
  }
}
