import { extractUploadedFile } from "@/lib/document-extraction";
import { checkRateLimit, getRequestIdentifier } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const rateLimit = checkRateLimit("extract", getRequestIdentifier(request), 20);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many files have been processed. Please wait and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "Choose a file to process." }, { status: 400 });
    }

    const result = await extractUploadedFile(file);
    return Response.json({
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      pageCount: result.pageCount,
      text: result.text,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "This file could not be read.";
    return Response.json({ error: message }, { status: 422 });
  }
}
