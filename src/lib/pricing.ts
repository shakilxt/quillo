import { assertCents, formatUsd } from "@/lib/money";

export type Billing = "monthly" | "yearly";

/** Paying yearly takes this much off every paid plan. A whole percentage keeps the maths exact. */
export const YEARLY_DISCOUNT_PERCENT = 20;

export interface PlanPrice {
  /** What the plan costs per month on this billing period, in cents. */
  perMonth: number;
  /** The single yearly charge in cents, or `null` when nothing is billed yearly. */
  billedYearly: number | null;
}

export function planPrice(monthlyCents: number, billing: Billing): PlanPrice {
  assertCents(monthlyCents);
  if (billing === "monthly" || monthlyCents === 0) {
    return { perMonth: monthlyCents, billedYearly: null };
  }
  const perMonth = Math.round((monthlyCents * (100 - YEARLY_DISCOUNT_PERCENT)) / 100);
  // Built from the rounded monthly figure, so the two numbers on the card always agree.
  return { perMonth, billedYearly: perMonth * 12 };
}

/** "$0", "$12", "$9.60": whole dollars stay short, anything else shows cents. */
export function formatPrice(cents: number): string {
  return formatUsd(cents, "auto");
}

export interface CardFee {
  /** Percentage of each card payment, e.g. 2.9. */
  percent: number;
  /** Fixed amount added to each card payment, in cents. */
  fixedCents: number;
}

/** "2.9% + 30¢" */
export function formatCardFee({ percent, fixedCents }: CardFee): string {
  assertCents(fixedCents);
  const fixed = fixedCents < 100 ? `${fixedCents}¢` : formatUsd(fixedCents, "always");
  return `${percent}% + ${fixed}`;
}
