import { RATE_LIMIT, type ChatErrorCode } from "@/lib/chat/limits";
import { isProviderConfigured, streamAnswer } from "@/lib/chat/provider";
import { clientIp, createRateLimiter } from "@/lib/chat/rate-limit";
import { chatRequestSchema, recentMessages } from "@/lib/chat/schema";
import { systemPrompt } from "@/lib/chat/system-prompt";

/**
 * POST /api/chat (PLAN.md §6.2): validates the conversation, checks the per-IP limit, then
 * streams the assistant's answer back as plain text. Every failure is a small JSON error code
 * the UI turns into a friendly message; details are logged here and never sent to the visitor.
 */

/** Room for a slow first token plus a full answer (Vercel Hobby allows this). */
export const maxDuration = 30;

const limiter = createRateLimiter(RATE_LIMIT);

function error(code: ChatErrorCode, status: number, headers?: HeadersInit) {
  return Response.json(
    { error: code },
    { status, headers: { "Cache-Control": "no-store", ...headers } },
  );
}

/** Logs what went wrong without the visitor's messages. */
function logFailure(stage: string, cause: unknown) {
  const status =
    cause && typeof cause === "object" && "status" in cause ? ` (${String(cause.status)})` : "";
  const message = cause instanceof Error ? cause.message : String(cause);
  console.error(`[chat] ${stage} failed${status}: ${message}`);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("invalid_request", 400);
  }
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) return error("invalid_request", 400);

  if (!isProviderConfigured()) return error("offline", 503);

  const allowance = limiter.check(clientIp(request.headers));
  if (!allowance.ok) {
    return error("rate_limited", 429, { "Retry-After": String(allowance.retryAfterSeconds) });
  }

  const answer = streamAnswer(systemPrompt, recentMessages(parsed.data.messages), request.signal);

  // Wait for the first chunk before replying, so a failed call (bad key, quota used up, model
  // down) still gets a proper error status instead of an empty 200.
  let first: IteratorResult<string>;
  try {
    first = await answer.next();
  } catch (cause) {
    logFailure("model call", cause);
    return error("offline", 503);
  }
  if (first.done) {
    logFailure("model call", "empty answer");
    return error("offline", 503);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(first.value));
    },
    async pull(controller) {
      try {
        const next = await answer.next();
        if (next.done) controller.close();
        else controller.enqueue(encoder.encode(next.value));
      } catch (cause) {
        // Mid-answer failure: erroring the stream makes the client's reader reject.
        logFailure("stream", cause);
        controller.error(cause);
      }
    },
    async cancel() {
      await answer.return(undefined);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
