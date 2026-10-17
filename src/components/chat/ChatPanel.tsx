"use client";

import { ArrowUp, CircleAlert, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { LogoMark } from "@/components/ui/Logo";
import type { chat } from "@/data/product";
import { MAX_ANSWER_LENGTH, MAX_MESSAGES } from "@/lib/chat/limits";
import { cx } from "@/lib/cx";
import { askAssistant, type AskResult, type HistoryMessage } from "./ask";
import { ChatMessage } from "./ChatMessage";
import { SuggestedQuestions } from "./SuggestedQuestions";

export type ChatCopy = typeof chat;

type Notice = Extract<AskResult, { ok: false }>["error"];

type Entry =
  | {
      id: number;
      kind: "message";
      role: "user" | "assistant";
      content: string;
      /** `failed` messages stay on screen but aren't sent as history again. */
      status: "done" | "streaming" | "failed";
    }
  | { id: number; kind: "notice"; notice: Notice };

interface ChatPanelProps {
  copy: ChatCopy;
  /** Opens the dialog when it turns true. Every way of closing reports back via `onClosed`. */
  open: boolean;
  /** `returnFocus` is false when the visitor followed a link out of the chat. */
  onClosed: (returnFocus: boolean) => void;
}

/** Matches Tailwind's `sm`: below it the panel is a full-screen sheet. */
const SHEET_QUERY = "(width < 40rem)";
/** Within this many pixels of the bottom, new text keeps the list scrolled to the end. */
const STICK_THRESHOLD = 80;

/**
 * The chat panel (PLAN.md §6.1), loaded on first open. A <dialog> labelled by its title:
 * modal as a phone sheet (the page behind goes inert and stops scrolling), non-modal in the
 * desktop corner so the page stays usable. Esc closes it either way. The conversation lives in
 * React state only; nothing is stored.
 */
export default function ChatPanel({ copy, open, onClosed }: ChatPanelProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const inputId = `${id}-input`;
  const counterId = `${id}-counter`;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(0);
  const stickToBottom = useRef(true);
  const returnFocus = useRef(true);
  const request = useRef<AbortController | null>(null);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState("");
  const [announcement, setAnnouncement] = useState("");

  const busy = entries.some((entry) => entry.kind === "message" && entry.status === "streaming");
  const asked = entries.some((entry) => entry.kind === "message" && entry.role === "user");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog || dialog.open) return;
    returnFocus.current = true;
    if (window.matchMedia(SHEET_QUERY).matches) dialog.showModal();
    else dialog.show();
    inputRef.current?.focus();
  }, [open]);

  // Stop a streaming answer if the panel ever unmounts.
  useEffect(() => () => request.current?.abort(), []);

  // Follow the conversation as it grows (new messages, words being revealed), unless the
  // visitor has scrolled up to read.
  useEffect(() => {
    const list = listRef.current;
    const content = list?.firstElementChild;
    if (!list || !content) return;
    const observer = new ResizeObserver(() => {
      if (stickToBottom.current) list.scrollTop = list.scrollHeight;
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  function close(withFocusReturn = true) {
    returnFocus.current = withFocusReturn;
    dialogRef.current?.close();
  }

  function update(id: number, change: (entry: Entry) => Entry) {
    setEntries((current) => current.map((entry) => (entry.id === id ? change(entry) : entry)));
  }

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;

    const userId = nextId.current++;
    const answerId = nextId.current++;
    const earlier = entries.flatMap((entry): HistoryMessage[] =>
      entry.kind === "message" && entry.status === "done"
        ? [{ role: entry.role, content: entry.content.slice(0, MAX_ANSWER_LENGTH) }]
        : [],
    );
    const history = [...earlier, { role: "user", content: question } as const].slice(-MAX_MESSAGES);

    stickToBottom.current = true;
    setDraft("");
    setAnnouncement("");
    setEntries((current) => [
      ...current,
      { id: userId, kind: "message", role: "user", content: question, status: "done" },
      { id: answerId, kind: "message", role: "assistant", content: "", status: "streaming" },
    ]);

    const controller = new AbortController();
    request.current = controller;
    let answer = "";
    const result = await askAssistant(
      history,
      (chunk) => {
        answer += chunk;
        update(answerId, (entry) =>
          entry.kind === "message" ? { ...entry, content: answer } : entry,
        );
      },
      controller.signal,
    );
    if (controller.signal.aborted) return;
    request.current = null;

    if (result.ok && answer.trim()) {
      update(answerId, (entry) =>
        entry.kind === "message" ? { ...entry, status: "done" } : entry,
      );
      setAnnouncement(answer);
      return;
    }

    // Failed: keep the question (and any partial answer) on screen, out of future history,
    // then explain what happened.
    const notice: Notice = result.ok ? "offline" : result.error;
    setEntries((current) => [
      ...current.flatMap((entry): Entry[] => {
        if (entry.kind !== "message" || (entry.id !== userId && entry.id !== answerId))
          return [entry];
        if (entry.id === answerId && !entry.content) return [];
        return [{ ...entry, status: "failed" }];
      }),
      { id: nextId.current++, kind: "notice", notice },
    ]);
    setAnnouncement(notice === "rate_limited" ? copy.errors.rateLimited : copy.errors.offline);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(draft);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter adds a line. Leave Enter alone while an IME is composing.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(draft);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      id="chat-panel"
      aria-labelledby={titleId}
      onClose={() => onClosed(returnFocus.current)}
      onKeyDown={(event) => {
        // A non-modal dialog doesn't close on Esc by itself.
        if (event.key === "Escape" && !event.defaultPrevented) {
          event.preventDefault();
          close();
        }
      }}
      className="chat-panel fixed inset-0 z-50 m-0 h-dvh max-h-none w-full max-w-none flex-col overflow-hidden bg-paper text-ink-muted open:flex sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[min(35rem,calc(100dvh-3rem))] sm:w-95 sm:rounded-window sm:border sm:border-line sm:shadow-float"
    >
      {/* A div, not <header>: inside a dialog a header would count as a second page banner. */}
      <div className="flex items-center gap-3 border-b border-line bg-surface py-3 pr-2 pl-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-field bg-primary">
          <LogoMark className="h-6 w-3.5 fill-white" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-[1.0625rem] leading-6 font-semibold">
            {copy.title}
          </h2>
          <p className="flex items-center gap-1.5 text-small text-ink-subtle">
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-primary" />
            {copy.subtitle}
          </p>
        </div>
        <button
          type="button"
          aria-label={copy.close}
          onClick={() => close()}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 motion-reduce:transition-none"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>

      {/* Focusable so keyboard users can scroll back through a long conversation. */}
      <div
        ref={listRef}
        role="region"
        aria-label={copy.conversationLabel}
        tabIndex={0}
        onScroll={(event) => {
          const list = event.currentTarget;
          stickToBottom.current =
            list.scrollHeight - list.scrollTop - list.clientHeight < STICK_THRESHOLD;
        }}
        className="flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-5 focus-visible:-outline-offset-2"
      >
        <ol className="flex flex-col gap-3">
          <ChatMessage role="assistant" content={copy.greeting} label={copy.assistantLabel} />
          {entries.map((entry) =>
            entry.kind === "notice" ? (
              <ChatNotice
                key={entry.id}
                notice={entry.notice}
                copy={copy}
                onLeave={() => close(false)}
              />
            ) : (
              <ChatMessage
                key={entry.id}
                role={entry.role}
                content={entry.content}
                label={entry.role === "user" ? copy.youLabel : copy.assistantLabel}
                typingLabel={copy.typing}
                reveal
              />
            ),
          )}
        </ol>
        {!asked && (
          <SuggestedQuestions
            label={copy.suggestionsLabel}
            questions={copy.suggestions}
            onPick={(question) => {
              // The chips disappear once a question is asked, so keep focus inside the panel:
              // in the box on desktop, on the conversation on phones (no keyboard popping up).
              const sheet = window.matchMedia(SHEET_QUERY).matches;
              (sheet ? listRef.current : inputRef.current)?.focus();
              void send(question);
            }}
          />
        )}
      </div>

      {/* Finished answers and errors are announced once, not word by word as they stream. */}
      <p role="status" className="sr-only">
        {announcement}
      </p>

      <form onSubmit={handleSubmit} className="border-t border-line bg-surface px-4 pt-3 pb-3">
        <label htmlFor={inputId} className="sr-only">
          {copy.inputLabel}
        </label>
        <div className="flex items-end gap-2 rounded-card border border-line bg-paper py-1.5 pr-1.5 pl-3.5 focus-within:border-primary focus-within:outline-2 focus-within:outline-offset-0 focus-within:outline-primary">
          <textarea
            ref={inputRef}
            id={inputId}
            rows={1}
            value={draft}
            maxLength={copy.maxLength}
            placeholder={copy.inputPlaceholder}
            aria-describedby={counterId}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            className="chat-input max-h-32 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-[0.9375rem] leading-6 text-ink outline-none placeholder:text-ink-subtle"
          />
          <button
            type="submit"
            aria-label={copy.send}
            disabled={busy || !draft.trim()}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-45 motion-reduce:transition-none"
          >
            <ArrowUp aria-hidden="true" className="size-4.5" strokeWidth={2.5} />
          </button>
        </div>
        <div className="mt-2 flex items-start justify-between gap-3 text-[0.75rem] leading-4 text-ink-subtle">
          <p>{copy.footerNote}</p>
          <p
            id={counterId}
            className={cx(
              "shrink-0 tabular-nums",
              draft.length >= copy.maxLength && "font-semibold text-ink",
            )}
          >
            {draft.length}/{copy.maxLength}
            <span className="sr-only"> {copy.counterLabel}</span>
          </p>
        </div>
      </form>
    </dialog>
  );
}

function ChatNotice({
  notice,
  copy,
  onLeave,
}: {
  notice: Notice;
  copy: ChatCopy;
  onLeave: () => void;
}) {
  return (
    <li className="flex flex-col items-start gap-3 rounded-card border border-amber/50 bg-amber/10 px-4 py-3 text-small text-ink">
      <p className="flex items-start gap-2">
        <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink" />
        {notice === "rate_limited" ? copy.errors.rateLimited : copy.errors.offline}
      </p>
      {notice === "offline" && (
        <a
          href={copy.errors.offlineHref}
          onClick={onLeave}
          className="inline-flex min-h-9 items-center rounded-full border border-line bg-surface px-4 font-semibold text-ink transition-colors hover:border-ink-faint motion-reduce:transition-none"
        >
          {copy.errors.offlineAction}
        </a>
      )}
    </li>
  );
}
