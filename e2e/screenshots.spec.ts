import { expect, test, type Locator, type Page } from "@playwright/test";
import { pricing, sectionIds } from "../src/data/product";

/**
 * The portfolio screenshots (PLAN.md §9). Run on demand with `npm run screenshots`, never with
 * the rest of the suite: the two chat shots ask the real assistant, so they need GEMINI_API_KEY
 * in .env.local and use two of the free tier's requests.
 *
 * Reduced motion puts every animation at its last frame: revealed sections, the drawn headline
 * swash, the counted-up revenue, and no launcher pulse.
 */

const DIR = "screenshots";
const QUESTION = "Pro vs Team?";

test.use({ deviceScaleFactor: 2, reducedMotion: "reduce" });

async function open(page: Page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
}

/**
 * The launcher is fixed to the viewport, so on a full-page or band shot it lands mid-page (over
 * the logo strip, or a pricing card). It stays in the hero and chat shots, where it belongs.
 */
async function hideLauncher(page: Page) {
  await page.addStyleTag({ content: ".chat-launcher { visibility: hidden; }" });
}

/** Shoot a band of the page from the top of `from` to the bottom of `to`, plus some air below. */
async function shootBand(page: Page, path: string, from: Locator, to: Locator, below: number) {
  const top = await from.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const bottom = await to.evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY);
  const width = page.viewportSize()?.width ?? 1440;
  // fullPage keeps the sticky nav at the top of the page instead of over the band.
  await page.screenshot({
    path,
    fullPage: true,
    clip: { x: 0, y: top, width, height: bottom - top + below },
  });
}

/** Ask the real assistant one question and wait until the whole answer is on screen. */
async function askForReal(page: Page) {
  await page.getByRole("button", { name: "Ask Quillo" }).click();
  const panel = page.getByRole("dialog", { name: "Quillo assistant" });
  await panel.getByRole("button", { name: QUESTION }).click();
  // The answer is announced once it has finished streaming.
  const status = panel.getByRole("status");
  await expect(status).not.toBeEmpty({ timeout: 30_000 });
  const announced = (await status.textContent()) ?? "";
  expect(announced, "the assistant answered with an error").toMatch(/\bTeam\b/);
  // No focus ring or caret in a portfolio shot.
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  // Start the view at the question, so the greeting isn't a sliver under the header.
  const conversation = panel.getByRole("region", { name: "Conversation" });
  const question = conversation.getByText(QUESTION).first();
  const questionTop = await question.evaluate((el) => el.getBoundingClientRect().top);
  await conversation.evaluate(
    (list, top) => list.scrollBy(0, top - list.getBoundingClientRect().top - 8),
    questionTop,
  );
}

test.describe("desktop, 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("hero, full page, features and pricing", async ({ page }) => {
    await open(page);
    await page.screenshot({ path: `${DIR}/01-hero-desktop.png` });
    await hideLauncher(page);
    await page.screenshot({ path: `${DIR}/02-full-page-desktop.png`, fullPage: true });

    const features = page.locator(`#${sectionIds.features}`);
    const firstDeepDive = features.locator("> div > div:last-child > div").first();
    await shootBand(page, `${DIR}/03-features-deepdive.png`, features, firstDeepDive, 96);

    await page.getByRole("button", { name: pricing.toggle.yearly }).click();
    const pricingSection = page.locator(`#${sectionIds.pricing}`);
    await shootBand(page, `${DIR}/04-pricing.png`, pricingSection, pricingSection, 0);
  });

  test("chat with a real answer", async ({ page }) => {
    await open(page);
    await askForReal(page);
    await page.screenshot({ path: `${DIR}/05-chat-open.png` });
  });
});

test.describe("mobile, 390", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("hero and full page", async ({ page }) => {
    await open(page);
    await page.screenshot({ path: `${DIR}/06-mobile-hero.png` });
    await hideLauncher(page);
    await page.screenshot({ path: `${DIR}/07-mobile-full.png`, fullPage: true });
  });

  test("chat sheet with a real answer", async ({ page }) => {
    await open(page);
    await askForReal(page);
    await page.screenshot({ path: `${DIR}/08-mobile-chat.png` });
  });
});
