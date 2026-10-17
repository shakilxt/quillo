"use client";

import { MessageCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { OPEN_CHAT_EVENT } from "@/lib/chat-events";
import type { ChatCopy } from "./ChatPanel";

const loadPanel = () => import("./ChatPanel");

/** The panel's code loads on first open (PLAN.md §7), so it's not in the page's first bundle. */
const ChatPanel = dynamic(loadPanel, { ssr: false });

/**
 * "Ask Quillo", bottom right (PLAN.md §6.1). It opens the panel, and so does anything on the
 * page that fires `quillo:open-chat` (the FAQ's "Ask our assistant"). Focus goes back to
 * whatever opened the chat when it closes.
 */
export function ChatLauncher({ copy }: { copy: ChatCopy }) {
  const launcherRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const restoreFocus = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  function openChat() {
    const active = document.activeElement;
    opener.current = active instanceof HTMLElement && active !== document.body ? active : null;
    setLoaded(true);
    setOpen(true);
  }

  const onOpenRequest = useEffectEvent(openChat);
  useEffect(() => {
    const listener = () => onOpenRequest();
    window.addEventListener(OPEN_CHAT_EVENT, listener);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, listener);
  }, []);

  // The launcher is hidden while the panel is open, so focus can only return once it's back.
  useEffect(() => {
    if (open || !restoreFocus.current) return;
    restoreFocus.current = false;
    const target = opener.current?.isConnected ? opener.current : launcherRef.current;
    target?.focus();
  }, [open]);

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        hidden={open}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openChat}
        // Start fetching the panel's code as soon as the visitor shows interest.
        onPointerEnter={() => void loadPanel()}
        onFocus={() => void loadPanel()}
        // It floats over the ink sections too, where a teal ring alone is too faint (2.9:1), so a
        // paper ring sits between the button and its focus outline.
        className="chat-launcher fixed right-4 bottom-4 z-40 inline-flex min-h-13 items-center gap-2 rounded-full bg-primary pr-5 pl-4 font-semibold text-white shadow-float transition duration-200 ease-out-soft hover:-translate-y-px hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-paper motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:right-6 sm:bottom-6"
      >
        <MessageCircle aria-hidden="true" className="size-5" strokeWidth={2.25} />
        {copy.launcher}
      </button>
      {loaded && (
        <ChatPanel
          copy={copy}
          open={open}
          onClosed={(returnFocus) => {
            restoreFocus.current = returnFocus;
            setOpen(false);
          }}
        />
      )}
    </>
  );
}
