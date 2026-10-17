import { describe, expect, it } from "vitest";
import { siteUrl } from "@/lib/site";

describe("siteUrl (lib/site.ts)", () => {
  it("uses Vercel's production domain on Vercel", () => {
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "quillo-demo.vercel.app" }).href).toBe(
      "https://quillo-demo.vercel.app/",
    );
  });

  it("prefers SITE_URL, for a custom domain", () => {
    expect(
      siteUrl({
        SITE_URL: "https://quillo.example",
        VERCEL_PROJECT_PRODUCTION_URL: "quillo-demo.vercel.app",
      }).href,
    ).toBe("https://quillo.example/");
  });

  it("falls back to localhost for local builds", () => {
    expect(siteUrl({}).href).toBe("http://localhost:3000/");
  });
});
