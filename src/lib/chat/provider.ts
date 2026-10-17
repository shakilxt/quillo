import { GoogleGenAI } from "@google/genai";
import type { ChatMessage } from "./schema";

/**
 * The ONLY file that talks to an AI SDK (PLAN.md §2). Swapping Gemini for Claude or OpenAI
 * means rewriting `streamAnswer` here; the route, the prompt and the UI don't change.
 *
 * Gemini via its Interactions API (ai.google.dev, checked 2026-10-17). `store: false` keeps
 * every conversation off Google's servers, so each request carries its own short history.
 *
 * Models, all stable and on the free tier, ordered by free allowance (AI Studio's rate-limit
 * page, 2026-10-17): the two Flash-Lite models allow 15 requests a minute and 500 a day each,
 * gemini-3.6-flash only 5 a minute and 20 a day. Together that's about 1,000 questions a day
 * before visitors see the offline message. Measured live: first words in about 1-1.5s with
 * minimal thinking. (gemini-3.8-flash was left out: 4-8s, frequent "high demand" errors, and it
 * doesn't allow minimal thinking.)
 */
export const CHAT_MODELS = [
  { model: "gemini-3.5-flash-lite", thinking: "minimal" },
  { model: "gemini-3.1-flash-lite", thinking: "minimal" },
  { model: "gemini-3.6-flash", thinking: "minimal" },
] as const;

type ModelConfig = (typeof CHAT_MODELS)[number];

/** Thinking counts towards this, which is one more reason to keep it minimal. */
const MAX_OUTPUT_TOKENS = 400;
/** Per model, so all three can be tried within the route's 30s. */
const TIMEOUT_MS = 8_000;

/**
 * After a model fails, it goes to the back of the queue for a while, so visitors don't wait
 * through the same refusal on every question. Out of quota (429) waits a minute, which matches
 * the per-minute limit and re-checks a used-up daily quota once a minute; anything else
 * (busy, timed out) waits 20s. Kept per server instance, like the rate limiter.
 */
const QUOTA_COOLDOWN_MS = 60_000;
const FAILURE_COOLDOWN_MS = 20_000;
const coolingUntil = new Map<string, number>();

function statusOf(cause: unknown): number | undefined {
  return cause && typeof cause === "object" && "status" in cause && typeof cause.status === "number"
    ? cause.status
    : undefined;
}

/** Models that aren't cooling down first, in their usual order; then the rest, soonest first. */
function modelsToTry(now: number): ModelConfig[] {
  const until = (config: ModelConfig) => coolingUntil.get(config.model) ?? 0;
  const ready = CHAT_MODELS.filter((config) => until(config) <= now);
  const cooling = CHAT_MODELS.filter((config) => until(config) > now).sort(
    (a, b) => until(a) - until(b),
  );
  return [...ready, ...cooling];
}

/** No key configured (local dev without `.env.local`): the route answers 503 straight away. */
export function isProviderConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

let client: GoogleGenAI | undefined;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

/** "503 high demand"; SDK messages often start with the status already, so it isn't doubled. */
function describe(cause: unknown): string {
  const message = cause instanceof Error ? cause.message : String(cause);
  const status =
    cause && typeof cause === "object" && "status" in cause ? String(cause.status) : "";
  return status && !message.startsWith(status) ? `${status} ${message}` : message;
}

async function* streamFrom(
  { model, thinking }: ModelConfig,
  system: string,
  messages: readonly ChatMessage[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const stream = await getClient().interactions.create(
    {
      model,
      system_instruction: system,
      input: messages.map((message) =>
        message.role === "user"
          ? { type: "user_input", content: [{ type: "text", text: message.content }] }
          : { type: "model_output", content: [{ type: "text", text: message.content }] },
      ),
      generation_config: { max_output_tokens: MAX_OUTPUT_TOKENS, thinking_level: thinking },
      store: false,
      stream: true,
    },
    // No SDK retries: the fallback model is a faster way past a busy or exhausted model.
    { signal, timeout_ms: TIMEOUT_MS, retries: { strategy: "none" } },
  );

  for await (const event of stream) {
    if (event.event_type === "error") {
      throw new Error(`Gemini stream error: ${event.error?.message ?? "unknown"}`);
    }
    if (event.event_type === "step.delta" && event.delta.type === "text" && event.delta.text) {
      yield event.delta.text;
    }
  }
}

/**
 * Streams the answer to the last message as plain text chunks. If a model fails before its
 * first words (busy, quota used up, timed out), the next one gets the same question, and the
 * failed one cools down. Once words have been sent, a failure is final: the visitor has seen
 * part of the answer. The route turns a final failure into the friendly offline message.
 */
export async function* streamAnswer(
  system: string,
  messages: readonly ChatMessage[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  let lastError: unknown;
  for (const config of modelsToTry(Date.now())) {
    let started = false;
    try {
      for await (const text of streamFrom(config, system, messages, signal)) {
        started = true;
        yield text;
      }
      if (started) {
        coolingUntil.delete(config.model);
        return;
      }
      lastError = new Error(`${config.model} returned an empty answer`);
    } catch (cause) {
      if (started || signal?.aborted) throw cause;
      lastError = cause;
    }
    const cooldown = statusOf(lastError) === 429 ? QUOTA_COOLDOWN_MS : FAILURE_COOLDOWN_MS;
    coolingUntil.set(config.model, Date.now() + cooldown);
    console.warn(`[chat] ${config.model} unavailable (${describe(lastError)})`);
  }
  throw lastError;
}
