/**
 * Chat limits and error codes (PLAN.md §6.2), shared by the API route and the chat UI. This file
 * imports nothing, so the UI can use it without pulling zod or the prompt into the browser.
 */

/** The `error` field of every non-200 JSON response from /api/chat. */
export type ChatErrorCode = "invalid_request" | "rate_limited" | "offline";

/** Longest question a visitor can send. */
export const MAX_QUESTION_LENGTH = 500;

/**
 * Longest assistant turn the API accepts back as history. The prompt asks for about 80 words,
 * but 400 output tokens can run to roughly 1,600 characters, so this leaves headroom.
 */
export const MAX_ANSWER_LENGTH = 2_000;

/** Most messages one request may carry; the client sends at most this many. */
export const MAX_MESSAGES = 20;

/** How many of the latest messages reach the model. */
export const CONTEXT_MESSAGES = 8;

/** Per-IP allowance: 15 questions every 10 minutes. */
export const RATE_LIMIT = { limit: 15, windowMs: 10 * 60 * 1000 } as const;
