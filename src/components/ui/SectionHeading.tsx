import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

interface SectionHeadingProps {
  /** Used by the section's `aria-labelledby`. */
  id: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "start" | "center";
  /** `dark` for the ink sections (How it works, Final CTA). */
  tone?: "light" | "dark";
  className?: string;
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  align = "start",
  tone = "light",
  className,
}: SectionHeadingProps) {
  const dark = tone === "dark";

  return (
    <div
      className={cx(
        "flex max-w-2xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className={cx("text-eyebrow uppercase", dark ? "text-mint" : "text-primary")}>
          {eyebrow}
        </p>
      )}
      <h2 id={id} className={cx("text-h2 text-balance", dark ? "text-paper" : "text-ink")}>
        {title}
      </h2>
      {intro && (
        <p className={cx("text-lead text-pretty", dark ? "text-paper/75" : "text-ink-muted")}>
          {intro}
        </p>
      )}
    </div>
  );
}
