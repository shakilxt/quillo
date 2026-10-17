"use client";

import { Pause, Play } from "lucide-react";
import { useState, type ReactNode } from "react";

interface LogoMarqueeProps {
  pauseLabel: string;
  children: ReactNode;
}

/**
 * The moving track for the logo strip, which only moves on small screens with motion allowed
 * (the `marquee:` variant). Moving content needs a way to stop it (WCAG 2.2.2), so there's a
 * pause toggle beside it.
 */
export function LogoMarquee({ pauseLabel, children }: LogoMarqueeProps) {
  const [paused, setPaused] = useState(false);

  return (
    <div className="group flex items-center gap-3 marquee:pr-5" data-paused={paused || undefined}>
      <div className="min-w-0 flex-1 marquee:overflow-hidden marquee:[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="group-data-paused:[animation-play-state:paused] marquee:flex marquee:w-max marquee:animate-marquee">
          {children}
        </div>
      </div>
      <button
        type="button"
        aria-pressed={paused}
        aria-label={pauseLabel}
        onClick={() => setPaused((value) => !value)}
        className="hidden size-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-muted transition-colors hover:text-ink marquee:flex"
      >
        {paused ? (
          <Play aria-hidden="true" className="size-4" strokeWidth={2.25} />
        ) : (
          <Pause aria-hidden="true" className="size-4" strokeWidth={2.25} />
        )}
      </button>
    </div>
  );
}
