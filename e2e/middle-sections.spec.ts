import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 0) < 1024;

const featureCard = (page: Page, title: string) =>
  page.locator("#features li", { has: page.getByRole("heading", { name: title }) });

test("the middle sections render in order, with every mockup named for screen readers", async ({
  page,
}) => {
  await page.goto("/");
  const headings = page.getByRole("heading", { level: 2 });
  await expect(headings).toContainText([
    "Trusted by small teams everywhere",
    "Everything you need to get paid",
    "From first invoice to paid in three steps",
    "Less chasing, more doing the work",
  ]);

  await expect(page.locator("#features").getByRole("heading", { level: 3 })).toHaveCount(9);
  await expect(page.locator("#how-it-works ol > li")).toHaveCount(3);
  await expect(page.locator("#testimonials figure")).toHaveCount(3);

  for (const name of [
    "Preview of the Quillo dashboard",
    "Preview of the Quillo invoice editor with three line items, tax and a total",
    "Preview of an invoice pay page with a card form and a pay button",
    "Preview of the Quillo cash flow chart, paid against outstanding over six months",
  ]) {
    await expect(page.getByRole("img", { name })).toHaveCount(1);
  }
});

test.describe("reveal on scroll", () => {
  test("content below the fold fades in once it scrolls into view", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const card = featureCard(page, "Reports and tax export");

    await expect(card).toHaveCSS("opacity", "0");
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveAttribute("data-revealed", "");
    await expect(card).toHaveCSS("opacity", "1");
  });

  test("with reduced motion, everything is visible straight away", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const hidden = await page
      .locator("[data-reveal]")
      .evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity !== "1").length);
    expect(hidden).toBe(0);
  });
});

test.describe("logo strip", () => {
  const strip = (page: Page) => page.locator("section", { has: page.locator("#logos-title") });
  const track = (page: Page) => strip(page).locator("ul").first().locator("..");

  test("scrolls on mobile and the pause button stops it", async ({ page }) => {
    test.skip(!isMobile(page), "the marquee is mobile only");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");

    const pause = strip(page).getByRole("button", { name: "Pause the scrolling logos" });
    await expect(track(page)).toHaveCSS("animation-play-state", "running");
    await expect(pause).toHaveAttribute("aria-pressed", "false");

    await pause.click();
    await expect(pause).toHaveAttribute("aria-pressed", "true");
    await expect(track(page)).toHaveCSS("animation-play-state", "paused");

    await pause.click();
    await expect(track(page)).toHaveCSS("animation-play-state", "running");
  });

  test("is a static row with no pause button on desktop or with reduced motion", async ({
    page,
  }) => {
    if (isMobile(page)) await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(track(page)).toHaveCSS("animation-name", "none");
    await expect(strip(page).getByRole("button")).toBeHidden();
    // The duplicate copy that makes the loop seamless only shows while it moves.
    await expect(strip(page).locator("ul[aria-hidden=true]")).toBeHidden();
    await expect(strip(page).getByRole("listitem")).toHaveCount(6);
  });
});

test("axe finds no violations across the whole page", async ({ page }) => {
  // Reduced motion so nothing is caught mid-fade, which would skew the contrast checks.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
