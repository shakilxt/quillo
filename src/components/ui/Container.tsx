import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type ContainerElement = "div" | "section" | "header" | "footer" | "nav";

interface ContainerProps {
  as?: ContainerElement;
  className?: string;
  children: ReactNode;
}

/** Centres content at 1200px wide, with 20 / 32 / 40px side padding (PLAN.md §4.3). */
export function Container({ as: Element = "div", className, children }: ContainerProps) {
  return (
    <Element className={cx("mx-auto w-full max-w-site px-5 sm:px-8 lg:px-10", className)}>
      {children}
    </Element>
  );
}
