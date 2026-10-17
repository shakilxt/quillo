import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const pricing = (page: Page) => page.locator("#pricing");
const planCard = (page: Page, name: string) =>
  pricing(page).locator("li", { has: page.getByRole("heading", { name, exact: true }) });

test.describe("pricing", () => {
  test("the Monthly / Yearly switch changes every paid price", async ({ page }) => {
    await page.goto("/");
    const monthly = pricing(page).getByRole("button", { name: "Monthly" });
    const yearly = pricing(page).getByRole("button", { name: /Yearly/ });
    // Both prices are in the page; the switch decides which one shows.
    const price = (plan: string, text: string) =>
      planCard(page, plan).getByText(text, { exact: true });

    await expect(monthly).toHaveAttribute("aria-pressed", "true");
    await expect(price("Starter", "$0")).toBeVisible();
    await expect(price("Pro", "$12")).toBeVisible();
    await expect(price("Pro", "$9.60")).toBeHidden();
    await expect(price("Pro", "Billed monthly")).toBeVisible();
    await expect(price("Team", "$29")).toBeVisible();

    // By keyboard: Tab from Monthly to Yearly, then Space.
    await monthly.focus();
    await page.keyboard.press("Tab");
    await expect(yearly).toBeFocused();
    await page.keyboard.press("Space");

    await expect(yearly).toHaveAttribute("aria-pressed", "true");
    await expect(monthly).toHaveAttribute("aria-pressed", "false");
    await expect(price("Starter", "$0")).toBeVisible();
    await expect(price("Pro", "$9.60")).toBeVisible();
    await expect(price("Pro", "$12")).toBeHidden();
    await expect(price("Pro", "Billed yearly: $115.20")).toBeVisible();
    await expect(price("Team", "$23.20")).toBeVisible();
    await expect(price("Team", "Billed yearly: $278.40")).toBeVisible();

    await monthly.click();
    await expect(price("Pro", "$12")).toBeVisible();
    await expect(price("Pro", "$9.60")).toBeHidden();
  });

  test("Pro is the one marked Most popular, and every plan button goes to the sign-up form", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(pricing(page).getByText("Most popular")).toHaveCount(1);
    await expect(planCard(page, "Pro")).toContainText("Most popular");

    const ctas = pricing(page).getByRole("link");
    await expect(ctas).toHaveCount(3);
    for (const href of await ctas.evaluateAll((links) => links.map((a) => a.getAttribute("href"))))
      expect(href).toBe("#get-started");

    await planCard(page, "Pro").getByRole("link", { name: "Start with Pro" }).click();
    await expect(page.locator("#get-started").getByRole("textbox")).toBeInViewport();
  });
});

test.describe("FAQ", () => {
  test("has 8 questions that open and close, by mouse and keyboard", async ({ page }) => {
    await page.goto("/");
    const faq = page.locator("#faq");
    await expect(faq.locator("details")).toHaveCount(8);

    const question = faq.getByText("How do automatic reminders work?");
    const answer = faq.getByText(/3 days before the due date/);
    await expect(answer).toBeHidden();

    await question.click();
    await expect(answer).toBeVisible();
    await question.click();
    await expect(answer).toBeHidden();

    await question.focus();
    await page.keyboard.press("Enter");
    await expect(answer).toBeVisible();
    await page.keyboard.press("Space");
    await expect(answer).toBeHidden();
  });

  test("offers the assistant for anything it doesn't answer", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator("#faq").getByRole("button", { name: "Ask our assistant" }),
    ).toBeVisible();
  });
});

test("the final CTA form shows an error, then success, without sending anything", async ({
  page,
}) => {
  await page.goto("/");
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));

  const cta = page.locator("#get-started");
  await expect(cta.getByRole("heading", { level: 2 })).toHaveText(
    "Start sending better invoices today.",
  );
  const field = cta.getByRole("textbox", { name: "Email address" });
  await field.scrollIntoViewIfNeeded();

  await field.fill("not an email");
  await cta.getByRole("button", { name: "Start free" }).click();
  await expect(cta.getByRole("alert")).toContainText("doesn't look like an email address");

  await field.fill("tom@joinery.works");
  await page.keyboard.press("Enter");
  await expect(cta.getByRole("status")).toHaveText(
    "You're on the list! (Demo only, nothing was sent.)",
  );
  expect(requests).toEqual([]);
});

test.describe("footer", () => {
  test("has the disclaimer, and every link on the page stays on the page", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toContainText(
      "© 2026 Shakil · Quillo is a fictional product made as a portfolio demo.",
    );
    await expect(footer.getByRole("navigation", { name: "Footer" })).toBeVisible();

    // PLAN.md §0.6: no email, phone, social or external links anywhere.
    const hrefs = await page
      .locator("a[href]")
      .evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? ""));
    expect(hrefs.length).toBeGreaterThan(10);
    expect(hrefs.filter((href) => !href.startsWith("#"))).toEqual([]);
  });

  test("the newsletter form shows an error, then success, without sending anything", async ({
    page,
  }) => {
    await page.goto("/");
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));

    const footer = page.getByRole("contentinfo");
    const field = footer.getByRole("textbox", { name: "Email address" });
    await field.scrollIntoViewIfNeeded();

    await footer.getByRole("button", { name: "Subscribe" }).click();
    await expect(footer.getByRole("alert")).toHaveText("Enter your email address.");

    await field.fill("tom@joinery.works");
    await page.keyboard.press("Enter");
    await expect(footer.getByRole("status")).toHaveText(
      "Subscribed! (Demo only, nothing was sent.)",
    );
    expect(requests).toEqual([]);
  });

  test("Back to top returns to the top of the page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Back to top" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  });
});

test("axe finds no violations with yearly prices and an FAQ answer showing", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await pricing(page)
    .getByRole("button", { name: /Yearly/ })
    .click();
  await page.locator("#faq").getByText("Is there a free plan?").click();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
