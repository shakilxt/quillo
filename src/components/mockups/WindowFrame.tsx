import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

interface WindowFrameProps {
  /** Shown in the title bar. A window title, not a URL: the site links nowhere. */
  title: string;
  className?: string;
  children: ReactNode;
}

/** A simple app-window frame shared by every mockup. */
export function WindowFrame({ title, className, children }: WindowFrameProps) {
  return (
    <div className={cx("overflow-hidden rounded-window border border-line bg-surface", className)}>
      <div className="relative flex h-10 items-center gap-1.5 border-b border-line bg-paper/70 px-4">
        {/* Neutral dots: coral, amber and mint mean invoice statuses on this site. */}
        <span className="size-2.5 rounded-full bg-ink/12" />
        <span className="size-2.5 rounded-full bg-ink/12" />
        <span className="size-2.5 rounded-full bg-ink/12" />
        <span className="absolute inset-x-0 mx-auto w-fit max-w-[60%] truncate rounded-full border border-line bg-surface px-3 py-0.5 text-[11px] leading-4 text-ink-subtle">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}
