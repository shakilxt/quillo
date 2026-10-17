import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the page loads with one h1", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Quillo/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
});

test("axe finds no accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("there is no horizontal scroll", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});
