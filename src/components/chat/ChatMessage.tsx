"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { formatAnswer, nextRevealLength } from "@/lib/chat/format";
import { cx } from "@/lib/cx";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  /** Screen-reader prefix: "You:" or "Assistant:". */
  label: string;
  /** Shown as bouncing dots until the first words arrive. */
  typingLabel?: string;
  /** Reveal the text a few words at a time as it streams in (not for the static greeting). */
  reveal?: boolean;
}

/** One chat bubble (PLAN.md §6.1): the visitor's on the right in teal, the assistant's on the left. */
export function ChatMessage({
  role,
  content,
  label,
  typingLabel,
  reveal = false,
}: ChatMessageProps) {
  if (role === "user") {
    return (
      <li className="ml-auto max-w-[85%] rounded-card rounded-br-xs bg-primary px-4 py-2.5 text-[0.9375rem] leading-6 break-words whitespace-pre-line text-white">
        <span className="sr-only">{label} </span>
        {content}
      </li>
    );
  }

  return (
    <li className="mr-auto max-w-[90%] rounded-card rounded-bl-xs border border-line bg-surface px-4 py-2.5 text-[0.9375rem] leading-6 break-words text-ink">
      <span className="sr-only">{label} </span>
      {content ? (
        <AnswerText content={content} reveal={reveal} />
      ) : (
        <span className="flex h-6 items-center gap-1" role="img" aria-label={typingLabel}>
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="typing-dot size-1.5 rounded-full bg-ink-faint"
              style={{ animationDelay: `${dot * 160}ms` }}
            />
          ))}
        </span>
      )}
    </li>
  );
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * The part of `text` to show: with `reveal`, words appear a few per frame as the answer streams
 * in. Without it (the greeting), or under reduced motion, everything shows at once.
 */
function useRevealed(text: string, reveal: boolean): string {
  const reduced = useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );
  const [shown, setShown] = useState(reveal ? 0 : text.length);

  useEffect(() => {
    if (reduced || shown >= text.length) return;
    const frame = requestAnimationFrame(() => setShown(nextRevealLength(text, shown)));
    return () => cancelAnimationFrame(frame);
  }, [reduced, shown, text]);

  return reduced ? text : text.slice(0, shown);
}

function AnswerText({ content, reveal }: { content: string; reveal: boolean }) {
  const revealed = useRevealed(content, reveal);
  return (
    <div className="flex flex-col gap-2">
      {formatAnswer(revealed).map((block, i) => {
        if (block.kind === "paragraph") return <p key={i}>{block.text}</p>;
        const List = block.ordered ? "ol" : "ul";
        return (
          <List
            key={i}
            className={cx("flex flex-col gap-1 pl-5", block.ordered ? "list-decimal" : "list-disc")}
          >
            {block.items.map((item, j) => (
              <li key={j} className="pl-0.5 marker:text-primary">
                {item}
              </li>
            ))}
          </List>
        );
      })}
    </div>
  );
}
