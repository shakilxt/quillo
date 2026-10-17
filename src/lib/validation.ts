// zod/mini: the same rules, but tree-shakable. This file runs in the browser (EmailForm), where
// the full zod build added about 36 KB of gzipped JavaScript to the page.
import * as z from "zod/mini";

/**
 * Email sign-up schema (PLAN.md §5.12). Errors are codes rather than messages, so this file
 * stays free of copy and the client bundle doesn't pull in all of product.ts; the form maps
 * each code to `emailForm.errors` from the data file.
 */
export type EmailError = "required" | "invalid";

/** RFC 5321 caps a forward path at 256 octets, which leaves 254 for the address itself. */
const MAX_EMAIL_LENGTH = 254;

export const emailSchema = z.pipe(
  z
    .string()
    .check(
      z.trim(),
      z.minLength(1, { error: "required" satisfies EmailError }),
      z.maxLength(MAX_EMAIL_LENGTH, { error: "invalid" satisfies EmailError }),
    ),
  z.email({ error: "invalid" satisfies EmailError }),
);

export type EmailResult = { ok: true; email: string } | { ok: false; error: EmailError };

export function validateEmail(value: string): EmailResult {
  const result = emailSchema.safeParse(value);
  if (result.success) return { ok: true, email: result.data };
  // The first issue wins: an empty field reports "required", not "invalid" as well.
  const message = result.error.issues[0]?.message;
  return { ok: false, error: message === "required" ? "required" : "invalid" };
}
