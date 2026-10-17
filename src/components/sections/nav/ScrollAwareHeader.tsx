"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const SCROLLED_AFTER_PX = 8;

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const isScrolled = () => window.scrollY > SCROLLED_AFTER_PX;
const isScrolledOnServer = () => false;

/** Sticky header: transparent at the top, paper with a blur and a border once scrolled. */
export function ScrollAwareHeader({ children }: { children: ReactNode }) {
  const scrolled = useSyncExternalStore(subscribe, isScrolled, isScrolledOnServer);

  return (
    <header
      data-scrolled={scrolled || undefined}
      className="sticky top-0 z-40 border-b border-transparent transition-[background-color,border-color] duration-300 data-scrolled:border-line data-scrolled:bg-paper/85 data-scrolled:backdrop-blur-md motion-reduce:transition-none"
    >
      {children}
    </header>
  );
}
