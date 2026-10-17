import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import type { InvoiceStatus } from "@/data/product";

/**
 * Pill label. Every tone keeps ink-level text on its fill (PLAN.md §4.1): mint, amber and
 * coral are fills only, never text on paper.
 */
export type BadgeTone = "mint" | "amber" | "coral" | "neutral" | "primary";

const tones: Record<BadgeTone, string> = {
  mint: "bg-mint/70 text-ink",
  amber: "bg-amber/80 text-ink",
  coral: "bg-coral/90 text-ink",
  neutral: "bg-ink/6 text-ink-muted",
  primary: "bg-primary-soft text-primary",
};

/** The status colours from the plan: Paid mint, Due soon amber, Overdue coral, Draft grey. */
export const statusTone: Record<InvoiceStatus, BadgeTone> = {
  paid: "mint",
  "due-soon": "amber",
  overdue: "coral",
  draft: "neutral",
};

interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs/5 font-semibold whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
