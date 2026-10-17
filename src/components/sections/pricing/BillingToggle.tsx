"use client";

import { useState, type ReactNode } from "react";
import type { Billing } from "@/lib/pricing";

interface BillingToggleProps {
  copy: { label: string; monthly: string; yearly: string; yearlyBadge: string };
  children: ReactNode;
}

const periods: readonly Billing[] = ["monthly", "yearly"];

/**
 * The Monthly / Yearly switch (PLAN.md §5.8). The cards render both prices on the server; this
 * only sets `data-billing` on the wrapper, and the `yearly:` variant in globals.css picks which
 * price shows.
 */
export function BillingToggle({ copy, children }: BillingToggleProps) {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <div data-billing={billing}>
      <div
        role="group"
        aria-label={copy.label}
        className="mx-auto flex w-fit items-center gap-1 rounded-full border border-line bg-surface p-1 shadow-card"
      >
        {periods.map((period) => (
          <button
            key={period}
            type="button"
            aria-pressed={billing === period}
            onClick={() => setBilling(period)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-small font-semibold text-ink-muted transition-colors hover:text-ink aria-pressed:bg-ink aria-pressed:text-paper motion-reduce:transition-none"
          >
            {copy[period]}
            {period === "yearly" && (
              <span className="rounded-full bg-mint px-2 py-0.5 text-xs/4 font-semibold text-ink">
                {copy.yearlyBadge}
              </span>
            )}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
