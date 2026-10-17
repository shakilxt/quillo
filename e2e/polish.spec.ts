import { expect, test, type Page } from "@playwright/test";
import { brand, meta } from "../src/data/product";

/** PLAN.md §7: every width the page is checked at. */
const WIDTHS = [375, 390, 768, 1024, 1280, 1440, 1920];

test.describe("metadata and crawler files", () => {
  test("the head has the title, description, share card and icons", async ({ page }) => {
    await page.goto("/");
    const head = page.locator("head");
    const content = (selector: string) => head.locator(selector).getAttribute("content");

    await expect(page).toHaveTitle(meta.title);
    expect(await content('meta[name="description"]')).toBe(meta.description);
    expect(await head.locator('link[rel="canonical"]').getAttribute("href")).toMatch(/^https?:/);
    expect(await content('meta[property="og:title"]')).toBe(meta.title);
    expect(await content('meta[property="og:site_name"]')).toBe(brand.name);
    expect(await content('meta[property="og:image"]')).toMatch(/\/opengraph-image\b/);
    expect(await content('meta[property="og:image:alt"]')).toContain(brand.name);
    expect(await content('meta[name="twitter:card"]')).toBe("summary_large_image");
    expect(await content('meta[name="twitter:image"]')).toMatch(/\/opengraph-image\b/);
    expect(await head.locator('link[rel="icon"]').getAttribute("type")).toBe("image/svg+xml");
    expect(await head.locator('link[rel="apple-touch-icon"]').getAttribute("sizes")).toBe(
      "180x180",
    );
  });

  test("the share image, icons, robots.txt and sitemap are served", async ({ request }) => {
    for (const [path, type] of [
      ["/opengraph-image", "image/png"],
      ["/apple-icon", "image/png"],
      ["/icon.svg", "image/svg+xml"],
    ] as const) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect(response.headers()["content-type"], path).toContain(type);
    }

    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Disallow: /api/");
    expect(robots).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/);

    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap.match(/<loc>/g)).toHaveLength(1);
  });
});

test("there is no horizontal scroll at any of the checked widths", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "Widths are set by hand, so one project is enough",
  );
  await page.goto("/");
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `${width}px wide`).toBe(0);
  }
});

/** What the focused element shows: its own outline, or a wrapper's (inputs inside a pill). */
function focusIndicator(page: Page) {
  return page.evaluate(() => {
    const active = document.activeElement;
    if (!active || active === document.body) return null;
    // Some rings fade in with the element's colour transition; read where they settle.
    for (const animation of document.getAnimations()) {
      if (animation instanceof CSSTransition) animation.finish();
    }
    let el: Element | null = active;
    for (let depth = 0; el && depth < 3; depth++, el = el.parentElement) {
      const style = getComputedStyle(el);
      if (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2) {
        return {
          name:
            active.textContent?.trim().slice(0, 30) ||
            active.getAttribute("aria-label") ||
            active.tagName,
          outline: style.outlineColor,
          boxShadow: style.boxShadow,
          onInk: Boolean(active.closest("#how-it-works, #get-started, footer")),
          launcher: active.classList.contains("chat-launcher"),
        };
      }
    }
    return {
      name: active.outerHTML.slice(0, 80),
      outline: null,
      boxShadow: "",
      onInk: false,
      launcher: false,
    };
  });
}

test("every Tab stop shows a focus ring that stands out from its background", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const mint = "rgb(127, 224, 196)";
  const paper = "rgb(250, 248, 244)";
  let stops = 0;
  let sawLauncher = false;

  for (; stops < 120; stops++) {
    await page.keyboard.press("Tab");
    const focus = await focusIndicator(page);
    if (!focus) break; // past the last stop, back to the browser
    expect(focus.outline, `no focus ring on ${focus.name}`).not.toBeNull();
    // Teal on ink is 2.9:1, under the 3:1 a focus indicator needs, so the dark sections use mint.
    if (focus.onInk) expect(focus.outline, focus.name).toBe(mint);
    // The launcher floats over every section, so a paper ring separates it from its outline.
    if (focus.launcher) {
      sawLauncher = true;
      expect(focus.boxShadow).toContain(paper);
    }
  }
  // The whole page: nav, hero form, pricing, eight FAQ cards, the CTA form, footer and launcher.
  expect(stops).toBeGreaterThan(25);
  expect(sawLauncher).toBe(true);
});

test.describe("motion", () => {
  /** Animations and transitions that are still playing once the page has settled. */
  async function runningAnimations(page: Page) {
    await page.waitForTimeout(500);
    return page.evaluate(() =>
      document
        .getAnimations()
        .filter((animation) => animation.playState === "running")
        .map((animation) =>
          animation instanceof CSSAnimation
            ? animation.animationName
            : `transition of ${(animation as CSSTransition).transitionProperty}`,
        ),
    );
  }

  test("with reduced motion, nothing on the page moves, even with the chat open", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/api/chat", (route) =>
      route.fulfill({ status: 200, contentType: "text/plain", body: "Yes, Starter is free." }),
    );
    await page.goto("/");
    await page.mouse.wheel(0, 3000);
    expect(await runningAnimations(page)).toEqual([]);

    await page.getByRole("button", { name: "Ask Quillo" }).click();
    await page.getByRole("button", { name: "Is there a free plan?" }).click();
    await expect(page.getByRole("dialog")).toContainText("Yes, Starter is free.");
    expect(await runningAnimations(page)).toEqual([]);
  });

  test("with motion allowed, the hero cards drift", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    expect((await runningAnimations(page)).some((name) => name.includes("drift"))).toBe(true);
  });
});
