import type { ChatErrorCode } from "@/lib/chat/limits";

export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export type AskResult =
  { ok: true } | { ok: false; error: Exclude<ChatErrorCode, "invalid_request"> };

/**
 * Posts the conversation to /api/chat and hands each chunk of the streamed answer to `onChunk`.
 * Never throws: every failure (offline, quota, network, a broken stream) comes back as a code
 * the panel turns into a friendly message. An invalid request is our bug, not the visitor's,
 * so it shows the offline message too.
 */
export async function askAssistant(
  messages: readonly HistoryMessage[],
  onChunk: (text: string) => void,
  signal: AbortSignal,
): Promise<AskResult> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal,
    });
    if (response.status === 429) return { ok: false, error: "rate_limited" };
    if (!response.ok || !response.body) return { ok: false, error: "offline" };

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      if (text) onChunk(text);
    }
    const rest = decoder.decode();
    if (rest) onChunk(rest);
    return { ok: true };
  } catch {
    return { ok: false, error: "offline" };
  }
}
