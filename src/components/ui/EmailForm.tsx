"use client";

import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { cx } from "@/lib/cx";
import { validateEmail, type EmailError } from "@/lib/validation";
import { buttonClasses } from "./Button";

export interface EmailFormCopy {
  label: string;
  placeholder: string;
  submit: string;
  submitting: string;
  note: string;
  success: string;
  errors: Record<EmailError, string>;
}

interface EmailFormProps {
  /** Passed in from a server component, so product.ts stays out of the client bundle. */
  copy: EmailFormCopy;
  /** `dark` for the ink final-CTA section. */
  tone?: "light" | "dark";
  className?: string;
}

/** A short pause so the button visibly responds; nothing is sent anywhere (PLAN.md §5.12). */
const FAKE_SUBMIT_MS = 400;

type Status = "idle" | "submitting" | "success";

export function EmailForm({ copy, tone = "light", className }: EmailFormProps) {
  const id = useId();
  const inputId = `${id}-email`;
  const errorId = `${id}-error`;
  const noteId = `${id}-note`;
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<EmailError | null>(null);
  const dark = tone === "dark";

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    const value = new FormData(form).get("email");
    const result = validateEmail(typeof value === "string" ? value : "");
    if (!result.ok) {
      setError(result.error);
      setStatus("idle");
      inputRef.current?.focus();
      return;
    }

    // Demo only: no request, no storage. Show the loading state, then the success message.
    setError(null);
    setStatus("submitting");
    timer.current = setTimeout(() => {
      form.reset();
      setStatus("success");
    }, FAKE_SUBMIT_MS);
  }

  function handleInput(value: string) {
    if (status === "success") setStatus("idle");
    // Clear the error as soon as the address becomes valid, but don't nag while typing.
    if (error && validateEmail(value).ok) setError(null);
  }

  const submitting = status === "submitting";

  return (
    <form noValidate onSubmit={handleSubmit} className={cx("flex flex-col gap-3", className)}>
      <label htmlFor={inputId} className="sr-only">
        {copy.label}
      </label>
      <div
        className={cx(
          "flex items-center gap-2 rounded-full border p-1.5 pl-5 transition-colors focus-within:outline-2 focus-within:outline-offset-2",
          dark
            ? "border-paper/25 bg-paper/5 focus-within:outline-mint"
            : "border-line bg-surface shadow-card focus-within:outline-primary",
          error && "border-coral",
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          maxLength={254}
          placeholder={copy.placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${errorId} ${noteId}` : noteId}
          onChange={(event) => handleInput(event.target.value)}
          className={cx(
            "min-w-0 flex-1 bg-transparent py-2 text-body outline-none",
            dark ? "text-paper placeholder:text-paper/60" : "text-ink placeholder:text-ink-subtle",
          )}
        />
        <button
          type="submit"
          aria-disabled={submitting || undefined}
          className={cx(
            buttonClasses({ variant: dark ? "inverse" : "primary" }),
            "shrink-0 focus-visible:outline-offset-1",
            submitting && "cursor-progress",
          )}
        >
          {submitting && (
            <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />
          )}
          {submitting ? copy.submitting : copy.submit}
        </button>
      </div>

      <div className="min-h-5 pl-5 text-small">
        {/* Both live regions stay mounted (empty, so they take no space) to be announced. */}
        <p
          id={errorId}
          role="alert"
          className={cx("flex items-start gap-2", dark ? "text-paper" : "text-ink")}
        >
          {error && (
            <>
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-coral" />
              {copy.errors[error]}
            </>
          )}
        </p>
        <p role="status" className={cx("flex items-start gap-2", dark ? "text-paper" : "text-ink")}>
          {status === "success" && (
            <>
              <CircleCheck
                aria-hidden="true"
                className={cx("mt-0.5 size-4 shrink-0", dark ? "text-mint" : "text-primary")}
              />
              {copy.success}
            </>
          )}
        </p>
        <p
          id={noteId}
          className={cx(
            (error || status === "success") && "sr-only",
            dark ? "text-paper/70" : "text-ink-subtle",
          )}
        >
          {copy.note}
        </p>
      </div>
    </form>
  );
}
