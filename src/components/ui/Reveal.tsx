import type { CSSProperties, ReactNode } from "react";

interface RevealProps {
  as?: "div" | "li";
  /** Stagger within a group, in ms. */
  delay?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Fades its content up 12px over 400ms the first time it scrolls into view (PLAN.md §4.4).
 *
 * A server component: it only marks the element. One `RevealObserver` on the page watches every
 * marked element, and globals.css does the motion. The content is only hidden when scripting is
 * on and reduced motion is off, so it never stays invisible.
 */
export function Reveal({ as: Element = "div", delay = 0, className, children }: RevealProps) {
  const style = delay > 0 ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined;
  return (
    <Element data-reveal="" className={className} style={style}>
      {children}
    </Element>
  );
}
