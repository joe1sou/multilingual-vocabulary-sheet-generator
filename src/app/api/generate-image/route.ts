import { generateIllustration } from "@/lib/openrouter";
import { checkRateLimit, getRequestIdentifier } from "@/lib/rate-limit";
import { generateImageRequestSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const rateLimit = checkRateLimit("image", getRequestIdentifier(request), 48);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "The public illustration limit has been reached. Please wait before retrying." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  try {
    const input = generateImageRequestSchema.parse(await request.json());
    return Response.json(await generateIllustration(input));
  } catch (error) {
    const message = error instanceof Error ? error.message : "The illustration could not be generated.";
    const status = message.includes("OPENROUTER_API_KEY") ? 503 : 502;
    return Response.json(
      {
        error:
          status === 503
            ? "The AI service is not configured yet. Add OPENROUTER_API_KEY in Vercel to generate illustrations."
            : message,
      },
      { status },
    );
  }
}
