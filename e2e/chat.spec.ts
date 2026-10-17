import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/** Below Tailwind's `sm` the chat is a full-screen sheet. */
const isSheet = (page: Page) => (page.viewportSize()?.width ?? 0) < 640;

const ANSWER =
  "Pro is $12 a month for one person, with unlimited clients and reminders. Team is $29 a month and adds:\n- 5 team members\n- Multi-currency";

/**
 * Every test answers /api/chat itself (PLAN.md §8), so the suite never calls the real AI.
 * Returns the bodies the page sent.
 */
async function mockChat(page: Page, reply: { status: number; body: string; contentType?: string }) {
  const sent: unknown[] = [];
  await page.route("**/api/chat", async (route) => {
    sent.push(route.request().postDataJSON());
    await route.fulfill({
      status: reply.status,
      contentType: reply.contentType ?? "text/plain; charset=utf-8",
      body: reply.body,
    });
  });
  return sent;
}

const answerWith = (body: string) => ({ status: 200, body });
const errorWith = (status: number, code: string) => ({
  status,
  body: JSON.stringify({ error: code }),
  contentType: "application/json",
});

const launcher = (page: Page) => page.getByRole("button", { name: "Ask Quillo" });
const panel = (page: Page) => page.getByRole("dialog", { name: "Quillo assistant" });
const input = (page: Page) => panel(page).getByRole("textbox", { name: "Your question" });
const conversation = (page: Page) => panel(page).getByRole("region", { name: "Conversation" });

test.describe("chat assistant", () => {
  test("opens from the launcher, answers a suggested question and closes with Esc", async ({
    page,
  }) => {
    const sent = await mockChat(page, answerWith(ANSWER));
    await page.goto("/");

    await launcher(page).click();
    await expect(panel(page)).toBeVisible();
    await expect(input(page)).toBeFocused();
    await expect(panel(page)).toContainText("AI · answers questions about Quillo");
    await expect(conversation(page)).toContainText("Please don't share personal information.");
    await expect(panel(page)).toContainText(
      "Demo assistant powered by Google Gemini. Answers can be wrong.",
    );

    await panel(page).getByRole("button", { name: "Pro vs Team?" }).click();
    await expect(conversation(page).getByText("Pro vs Team?")).toBeVisible();
    await expect(conversation(page)).toContainText("Team is $29 a month and adds:");
    // "- " lines become a real list inside the answer.
    await expect(
      conversation(page)
        .getByRole("listitem")
        .filter({ hasText: /^Multi-currency$/ }),
    ).toHaveCount(1);
    // The chips go once a question has been asked.
    await expect(panel(page).getByRole("group", { name: "Suggested questions" })).toHaveCount(0);
    expect(sent).toEqual([{ messages: [{ role: "user", content: "Pro vs Team?" }] }]);

    await page.keyboard.press("Escape");
    await expect(panel(page)).toBeHidden();
    await expect(launcher(page)).toBeFocused();
  });

  test("Enter sends, Shift+Enter adds a line, and the history goes with each question", async ({
    page,
  }) => {
    const sent = await mockChat(page, answerWith("Yes, Starter is free forever."));
    await page.goto("/");
    await launcher(page).click();

    const box = input(page);
    await box.fill("Is there");
    await box.press("Shift+Enter");
    await box.pressSequentially("a free plan?");
    await expect(box).toHaveValue("Is there\na free plan?");
    await expect(panel(page).getByText("21/500")).toBeVisible();

    await box.press("Enter");
    await expect(box).toHaveValue("");
    await expect(conversation(page)).toContainText("Yes, Starter is free forever.");
    await expect(panel(page).getByRole("status")).toHaveText("Yes, Starter is free forever.");

    await box.fill("And Pro?");
    await box.press("Enter");
    await expect(conversation(page).getByText("And Pro?")).toBeVisible();
    await expect.poll(() => sent.length).toBe(2);
    expect(sent[1]).toEqual({
      messages: [
        { role: "user", content: "Is there\na free plan?" },
        { role: "assistant", content: "Yes, Starter is free forever." },
        { role: "user", content: "And Pro?" },
      ],
    });
  });

  test("stops a question at 500 characters", async ({ page }) => {
    await mockChat(page, answerWith("ok"));
    await page.goto("/");
    await launcher(page).click();
    await input(page).fill("a".repeat(520));
    await expect(input(page)).toHaveValue("a".repeat(500));
    await expect(panel(page).getByText("500/500")).toBeVisible();
  });

  test("shows the friendly message when the visitor asks too much", async ({ page }) => {
    await mockChat(page, errorWith(429, "rate_limited"));
    await page.goto("/");
    await launcher(page).click();
    await input(page).fill("Can I cancel any time?");
    await input(page).press("Enter");
    await expect(conversation(page)).toContainText(
      "You've asked a lot of questions! Please try again in a few minutes.",
    );
    await expect(panel(page).getByRole("link", { name: "Go to the FAQ" })).toHaveCount(0);
  });

  test("when the assistant is offline, it points to the FAQ", async ({ page }) => {
    const sent = await mockChat(page, errorWith(503, "offline"));
    await page.goto("/");
    await launcher(page).click();
    await input(page).fill("Is my data secure?");
    await input(page).press("Enter");
    await expect(conversation(page)).toContainText(
      "The assistant is offline right now. Most answers are in the FAQ.",
    );

    // A failed question isn't sent again as history.
    await input(page).fill("Hello?");
    await input(page).press("Enter");
    await expect.poll(() => sent.length).toBe(2);
    expect(sent[1]).toEqual({ messages: [{ role: "user", content: "Hello?" }] });

    await panel(page).getByRole("link", { name: "Go to the FAQ" }).first().click();
    await expect(panel(page)).toBeHidden();
    await expect(page.locator("#faq h2")).toBeInViewport();
  });

  test("the FAQ's Ask our assistant opens the chat, and focus returns to it", async ({ page }) => {
    await mockChat(page, answerWith("ok"));
    await page.goto("/");
    const ask = page.locator("#faq").getByRole("button", { name: "Ask our assistant" });
    await ask.click();
    await expect(panel(page)).toBeVisible();
    await expect(input(page)).toBeFocused();
    await panel(page).getByRole("button", { name: "Close chat" }).click();
    await expect(panel(page)).toBeHidden();
    await expect(ask).toBeFocused();
  });

  test("is a full-screen sheet on phones and a corner panel on desktop", async ({ page }) => {
    // No opening slide, so the panel is measured where it settles.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mockChat(page, answerWith("ok"));
    await page.goto("/");
    await launcher(page).click();
    const box = await panel(page).boundingBox();
    const viewport = page.viewportSize();
    if (!box || !viewport) throw new Error("no layout");

    if (isSheet(page)) {
      expect(box).toEqual({ x: 0, y: 0, width: viewport.width, height: viewport.height });
      // The page behind is inert: focus stays in the sheet (or passes through the browser's
      // own controls, which shows up as <body>), and the page can't scroll.
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press("Tab");
        const inside = await page.evaluate(
          () =>
            document.activeElement === document.body ||
            !!document.activeElement?.closest("#chat-panel"),
        );
        expect(inside).toBe(true);
      }
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
        "hidden",
      );
    } else {
      expect(box.width).toBe(380);
      expect(box.height).toBe(560);
      expect(viewport.width - (box.x + box.width)).toBe(24);
      expect(viewport.height - (box.y + box.height)).toBe(24);
    }
  });

  test("axe finds no violations with the chat closed and open", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mockChat(page, answerWith(ANSWER));
    await page.goto("/");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    await launcher(page).click();
    await panel(page).getByRole("button", { name: "Pro vs Team?" }).click();
    await expect(conversation(page)).toContainText("Multi-currency");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
});
