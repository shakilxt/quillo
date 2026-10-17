"use client";

import { MessageCircle } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { requestOpenChat } from "@/lib/chat-events";

/** Opens the chat assistant (PLAN.md §5.9), wherever on the page its launcher lives. */
export function AskAssistantButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={requestOpenChat}
      aria-haspopup="dialog"
      className={buttonClasses({ variant: "primary" })}
    >
      <MessageCircle aria-hidden="true" className="size-4" strokeWidth={2.25} />
      {label}
    </button>
  );
}
