export function GET() {
  return Response.json({
    status: "ok",
    openRouterConfigured: Boolean(process.env.OPENROUTER_API_KEY?.trim()),
    generationEnabled: process.env.GENERATION_ENABLED?.trim().toLowerCase() !== "false",
  });
}
