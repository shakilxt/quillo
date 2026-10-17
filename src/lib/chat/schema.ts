import { z } from "zod";
import { CONTEXT_MESSAGES, MAX_ANSWER_LENGTH, MAX_MESSAGES, MAX_QUESTION_LENGTH } from "./limits";

/** The chat API's request body (PLAN.md §6.2). Anything else gets a 400. */
const userMessage = z.object({
  role: z.literal("user"),
  content: z.string().trim().min(1).max(MAX_QUESTION_LENGTH),
});

const assistantMessage = z.object({
  role: z.literal("assistant"),
  content: z.string().trim().min(1).max(MAX_ANSWER_LENGTH),
});

export const chatMessageSchema = z.discriminatedUnion("role", [userMessage, assistantMessage]);

export const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1)
    .max(MAX_MESSAGES)
    .refine((messages) => messages.at(-1)?.role === "user", {
      error: "The last message must be from the user.",
    }),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;

/**
 * The latest messages the model sees: at most `CONTEXT_MESSAGES`, always starting with a
 * question, so the history never opens on an answer to something the model can't see.
 */
export function recentMessages(
  messages: readonly ChatMessage[],
  count = CONTEXT_MESSAGES,
): ChatMessage[] {
  const recent = messages.slice(-count);
  const firstQuestion = recent.findIndex((message) => message.role === "user");
  return firstQuestion === -1 ? [] : recent.slice(firstQuestion);
}
