import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 0) < 1024;

test.describe("nav (desktop)", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(isMobile(page), "desktop nav only");
    await page.goto("/");
  });

  test("each link scrolls to its section and becomes the active link", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Main" });
    for (const name of ["Features", "How it works", "Pricing", "FAQ"]) {
      const link = nav.getByRole("link", { name });
      await link.click();
      const id = (await link.getAttribute("href"))?.slice(1) ?? "";
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`)).toBeInViewport();
      await expect(link).toHaveAttribute("aria-current", "true");
    }
  });

  test("the header gets a background once the page scrolls", async ({ page }) => {
    const header = page.locator("header").first();
    await expect(header).not.toHaveAttribute("data-scrolled");
    await page.mouse.wheel(0, 400);
    await expect(header).toHaveAttribute("data-scrolled", "true");
  });

  test("Log in opens a demo-only note that Esc closes", async ({ page }) => {
    const note = page.locator("#login-desktop");
    await expect(note).toBeHidden();
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(note).toBeVisible();
    await expect(note).toContainText("This is a demo product");
    await page.keyboard.press("Escape");
    await expect(note).toBeHidden();
  });
});

test.describe("mobile menu", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isMobile(page), "mobile menu only");
    await page.goto("/");
  });

  test("opens and closes by keyboard, keeping focus inside", async ({ page }) => {
    const openButton = page.getByRole("button", { name: "Open menu" });
    const menu = page.getByRole("dialog", { name: "Menu" });

    await openButton.focus();
    await page.keyboard.press("Enter");
    await expect(menu).toBeVisible();
    await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();

    // Tab through everything: focus never leaves the menu (the rest of the page is inert).
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(
        () =>
          document.activeElement === document.body ||
          !!document.activeElement?.closest("#mobile-menu"),
      );
      expect(inside).toBe(true);
    }

    // The page behind can't scroll while the menu is open.
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
      "hidden",
    );

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(openButton).toBeFocused();
  });

  test("a link closes the menu and scrolls to its section", async ({ page }) => {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Pricing" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
    await expect(page.locator("#pricing")).toBeInViewport();
  });

  test("Log in inside the menu shows the demo-only note", async ({ page }) => {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .getByRole("dialog", { name: "Menu" })
      .getByRole("button", { name: "Log in" })
      .click();
    await expect(page.locator("#login-mobile")).toContainText("This is a demo product");
    await expect(page.locator("#login-mobile")).toBeVisible();
  });
});

test.describe("hero email form", () => {
  test("shows inline errors, then success, without sending anything", async ({ page }) => {
    await page.goto("/");
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));

    const hero = page.locator("section", { has: page.getByRole("heading", { level: 1 }) });
    const field = hero.getByRole("textbox", { name: "Email address" });
    const submit = hero.getByRole("button", { name: "Start free" });

    await submit.click();
    await expect(hero.getByRole("alert")).toHaveText("Enter your email address.");
    await expect(field).toHaveAttribute("aria-invalid", "true");
    await expect(field).toBeFocused();

    await field.fill("maya@wren");
    await page.keyboard.press("Enter");
    await expect(hero.getByRole("alert")).toContainText("doesn't look like an email address");

    await field.fill("maya@wren.studio");
    await expect(field).not.toHaveAttribute("aria-invalid");
    await page.keyboard.press("Enter");
    await expect(hero.getByRole("status")).toHaveText(
      "You're on the list! (Demo only, nothing was sent.)",
    );
    await expect(field).toHaveValue("");

    // PLAN.md §0.6 and §5.12: the form sends and stores nothing.
    expect(requests).toEqual([]);
  });
});

test("axe finds no violations with the menu or the Log in note open", async ({ page }) => {
  await page.goto("/");
  if (isMobile(page)) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
  } else {
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.locator("#login-desktop")).toBeVisible();
  }
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
