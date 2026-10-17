import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatMessage } from "@/lib/chat/schema";

// The route never reaches Gemini in tests: the provider is swapped for these fakes.
const provider = vi.hoisted(() => ({
  configured: true,
  answer: (async function* (): AsyncGenerator<string> {})() as AsyncGenerator<string>,
  calls: [] as { system: string; messages: readonly ChatMessage[] }[],
}));

vi.mock("@/lib/chat/provider", () => ({
  isProviderConfigured: () => provider.configured,
  streamAnswer: (system: string, messages: readonly ChatMessage[]) => {
    provider.calls.push({ system, messages });
    return provider.answer;
  },
}));

const { POST } = await import("@/app/api/chat/route");

let ip = 0;

/** Each request comes from a fresh IP unless one is given, so the rate limit stays out of the way. */
function post(body: unknown, from = `10.0.0.${++ip}`) {
  return POST(
    new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": from },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

const question = { messages: [{ role: "user", content: "Is there a free plan?" }] };

async function* chunks(...parts: string[]) {
  for (const part of parts) yield part;
}

beforeEach(() => {
  provider.configured = true;
  provider.answer = chunks("Yes. ", "Starter is free.");
  provider.calls = [];
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/chat (PLAN.md §6.2)", () => {
  it("streams the answer as plain text", async () => {
    const response = await post(question);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(await response.text()).toBe("Yes. Starter is free.");
  });

  it("sends the system prompt and only the last 8 messages to the model", async () => {
    const messages = Array.from({ length: 13 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `message ${i}`,
    }));
    await (await post({ messages })).text();
    const call = provider.calls[0];
    expect(call?.system).toContain("You are the website assistant for Quillo");
    expect(call?.messages).toHaveLength(7);
    expect(call?.messages[0]).toEqual({ role: "user", content: "message 6" });
    expect(call?.messages.at(-1)).toEqual({ role: "user", content: "message 12" });
  });

  it("answers 400 to a bad body", async () => {
    for (const body of [
      "not json",
      { messages: [] },
      { messages: [{ role: "user", content: "a".repeat(501) }] },
    ]) {
      const response = await post(body);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "invalid_request" });
    }
    expect(provider.calls).toEqual([]);
  });

  it("answers 503 offline when there's no API key", async () => {
    provider.configured = false;
    const response = await post(question);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "offline" });
  });

  it("answers 503 offline when the model fails, and logs it without the question", async () => {
    provider.answer = (async function* (): AsyncGenerator<string> {
      throw Object.assign(new Error("Resource exhausted"), { status: 429 });
    })();
    const response = await post(question);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "offline" });
    expect(console.error).toHaveBeenCalledWith(
      "[chat] model call failed (429): Resource exhausted",
    );
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain("free plan");
  });

  it("answers 503 offline when the model returns nothing", async () => {
    provider.answer = chunks();
    expect((await post(question)).status).toBe(503);
  });

  it("allows 15 questions per IP, then answers 429 with Retry-After", async () => {
    for (let i = 0; i < 15; i++) {
      provider.answer = chunks("ok");
      expect((await post(question, "192.0.2.1")).status).toBe(200);
    }
    const blocked = await post(question, "192.0.2.1");
    expect(blocked.status).toBe(429);
    expect(await blocked.json()).toEqual({ error: "rate_limited" });
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);

    // Someone else is unaffected.
    provider.answer = chunks("ok");
    expect((await post(question, "192.0.2.2")).status).toBe(200);
  });
});
