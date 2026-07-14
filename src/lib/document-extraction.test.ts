import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { extractPdf, extractPptx } from "@/lib/document-extraction";

const demoDirectory = join(process.cwd(), "public", "demo");

describe("prepared lesson document extraction", () => {
  it("reads the complete scaffold PDF", async () => {
    const buffer = await readFile(join(demoDirectory, "mll-scaffold-pack.pdf"));
    const result = await extractPdf(new Uint8Array(buffer));

    expect(result.pageCount).toBe(5);
    expect(result.text).toContain("Story Problems Vocabulary");
    expect(result.text).toContain("Differentiation Notes");
  });

  it("reads visible text from all PowerPoint slides", async () => {
    const buffer = await readFile(join(demoDirectory, "represent-story-problems.pptx"));
    const result = await extractPptx(new Uint8Array(buffer));

    expect(result.pageCount).toBe(10);
    expect(result.text).toContain("Slide 1");
    expect(result.text).toContain("Story Problems");
    expect(result.text).toContain("Key Words to Know");
    expect(result.text).toContain("Let's Get Started");
  });
});
