import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// A fake Gemini SDK: each model name maps to what its stream does.
type Behaviour =
  { chunks: string[]; failAfter?: number } | { error: { status: number; message: string } };

const sdk = vi.hoisted(() => ({
  behaviours: {} as Record<string, Behaviour>,
  requests: [] as { model: string; store: boolean; thinking_level: string }[],
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    interactions = {
      create: async (params: {
        model: string;
        store: boolean;
        generation_config: { thinking_level: string };
      }) => {
        sdk.requests.push({
          model: params.model,
          store: params.store,
          thinking_level: params.generation_config.thinking_level,
        });
        const behaviour = sdk.behaviours[params.model];
        if (!behaviour) throw new Error(`no behaviour for ${params.model}`);
        if ("error" in behaviour) {
          throw Object.assign(new Error(behaviour.error.message), {
            status: behaviour.error.status,
          });
        }
        return (async function* () {
          for (const [i, text] of behaviour.chunks.entries()) {
            if (i === behaviour.failAfter) throw new Error("connection reset");
            yield { event_type: "step.delta", index: 0, delta: { type: "thought_summary" } };
            yield { event_type: "step.delta", index: 0, delta: { type: "text", text } };
          }
        })();
      },
    };
  },
}));

type Provider = typeof import("@/lib/chat/provider");
let provider: Provider;
const models = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.6-flash"];
const [first, second, third] = models as [string, string, string];
const question = [{ role: "user", content: "Pro vs Team?" }] as const;

async function collect(): Promise<string[]> {
  const out: string[] = [];
  for await (const text of provider.streamAnswer("system", question)) out.push(text);
  return out;
}

const tried = () => sdk.requests.map((request) => request.model);
const busy = { error: { status: 503, message: "high demand" } };
const outOfQuota = { error: { status: 429, message: "quota exceeded" } };

beforeEach(async () => {
  vi.stubEnv("GEMINI_API_KEY", "test-key");
  vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  // A fresh module each time, so one test's cooldowns don't leak into the next.
  vi.resetModules();
  provider = await import("@/lib/chat/provider");
  sdk.behaviours = {};
  sdk.requests = [];
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("streamAnswer (lib/chat/provider.ts)", () => {
  it("tries the models with the biggest free allowance first", () => {
    expect(provider.CHAT_MODELS.map((config) => config.model)).toEqual(models);
  });

  it("streams only the text from the first model, with nothing stored", async () => {
    sdk.behaviours[first] = { chunks: ["Pro is ", "$12."] };
    expect(await collect()).toEqual(["Pro is ", "$12."]);
    expect(sdk.requests).toEqual([{ model: first, store: false, thinking_level: "minimal" }]);
  });

  it("asks the next model when one is busy", async () => {
    sdk.behaviours[first] = busy;
    sdk.behaviours[second] = { chunks: ["Team is $29."] };
    expect(await collect()).toEqual(["Team is $29."]);
    expect(tried()).toEqual([first, second]);
    expect(console.warn).toHaveBeenCalledWith(`[chat] ${first} unavailable (503 high demand)`);
  });

  it("asks the next model when one answers with nothing", async () => {
    sdk.behaviours[first] = { chunks: [] };
    sdk.behaviours[second] = { chunks: ["ok"] };
    expect(await collect()).toEqual(["ok"]);
  });

  it("fails with the last error when every model fails", async () => {
    sdk.behaviours[first] = busy;
    sdk.behaviours[second] = busy;
    sdk.behaviours[third] = outOfQuota;
    await expect(collect()).rejects.toMatchObject({ status: 429 });
    expect(tried()).toEqual(models);
  });

  it("skips a model that's out of quota for a minute, then tries it again", async () => {
    sdk.behaviours[first] = outOfQuota;
    sdk.behaviours[second] = { chunks: ["ok"] };
    await collect();
    sdk.requests = [];

    vi.setSystemTime(59_000);
    await collect();
    expect(tried()).toEqual([second]);

    sdk.requests = [];
    sdk.behaviours[first] = { chunks: ["back"] };
    vi.setSystemTime(60_000);
    expect(await collect()).toEqual(["back"]);
    expect(tried()).toEqual([first]);
  });

  it("skips a busy model for 20 seconds", async () => {
    sdk.behaviours[first] = busy;
    sdk.behaviours[second] = { chunks: ["ok"] };
    await collect();
    sdk.requests = [];
    vi.setSystemTime(19_000);
    await collect();
    expect(tried()).toEqual([second]);
    sdk.requests = [];
    vi.setSystemTime(20_000);
    await collect();
    expect(tried()).toEqual([first, second]);
  });

  it("still tries cooling models, soonest first, rather than giving up", async () => {
    sdk.behaviours[first] = outOfQuota;
    sdk.behaviours[second] = busy;
    sdk.behaviours[third] = busy;
    await expect(collect()).rejects.toBeDefined();
    sdk.requests = [];

    sdk.behaviours[first] = { chunks: ["recovered"] };
    vi.setSystemTime(5_000);
    expect(await collect()).toEqual(["recovered"]);
    // All three are cooling: the busy ones (20s) come back before the out-of-quota one (60s).
    expect(tried()).toEqual([second, third, first]);
  });

  it("doesn't switch models once words have been sent", async () => {
    sdk.behaviours[first] = { chunks: ["Pro is ", "$12."], failAfter: 1 };
    sdk.behaviours[second] = { chunks: ["should not appear"] };
    const out: string[] = [];
    await expect(
      (async () => {
        for await (const text of provider.streamAnswer("system", question)) out.push(text);
      })(),
    ).rejects.toThrow("connection reset");
    expect(out).toEqual(["Pro is "]);
    expect(tried()).toEqual([first]);
  });
});
