import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NIB_PATH, NIB_VIEWBOX, nibDataUri } from "@/lib/logo";

describe("the logo mark (lib/logo.ts)", () => {
  it("is the same nib in the favicon, which can't import it", () => {
    const icon = readFileSync(join(process.cwd(), "src/app/icon.svg"), "utf8");
    expect(icon).toContain(`d="${NIB_PATH}"`);
    expect(icon).toContain(`viewBox="${NIB_VIEWBOX}"`);
  });

  it("makes a standalone SVG data URI in the given colour", () => {
    const uri = nibDataUri("#0b6e69");
    expect(uri).toMatch(/^data:image\/svg\+xml;base64,/);
    const svg = Buffer.from(uri.split(",")[1] ?? "", "base64").toString("utf8");
    expect(svg).toContain('fill="#0b6e69"');
    expect(svg).toContain('fill-rule="evenodd"');
    expect(svg).toContain(NIB_PATH);
  });
});
