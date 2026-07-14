import { reviseVocabularyItem } from "@/lib/openrouter";
import { checkRateLimit, getRequestIdentifier } from "@/lib/rate-limit";
import { reviseItemRequestSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(request: Request) {
  const rateLimit = checkRateLimit("revise", getRequestIdentifier(request), 12);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many vocabulary revisions. Please wait and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  try {
    const input = reviseItemRequestSchema.parse(await request.json());
    return Response.json(await reviseVocabularyItem(input));
  } catch (error) {
    const message = error instanceof Error ? error.message : "The vocabulary item could not be revised.";
    const status = message.includes("OPENROUTER_API_KEY") ? 503 : 422;
    return Response.json({ error: message }, { status });
  }
}
