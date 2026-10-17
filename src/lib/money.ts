// All money is stored as whole cents (integers), so no maths ever runs on floats.

const wholeDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const withCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function assertCents(cents: number): void {
  if (!Number.isSafeInteger(cents) || cents < 0) {
    throw new RangeError(`Expected a whole, non-negative number of cents, got ${cents}`);
  }
}

/**
 * Formats cents as US dollars. `auto` drops ".00" on whole amounts ($12, $9.60) for prices and
 * headlines; `always` keeps it ($12.00) for invoice line items.
 */
export function formatUsd(cents: number, decimals: "auto" | "always" = "auto"): string {
  assertCents(cents);
  const format = decimals === "auto" && cents % 100 === 0 ? wholeDollars : withCents;
  return format.format(cents / 100);
}

export interface LineItem {
  description: string;
  quantity: number;
  unitCents: number;
}

export interface InvoiceTotals {
  subtotal: number;
  tax: number;
  total: number;
}

/** Subtotal, tax (rounded to the nearest cent) and total for an invoice, all in cents. */
export function invoiceTotals(items: readonly LineItem[], taxPercent: number): InvoiceTotals {
  const subtotal = items.reduce((sum, item) => {
    assertCents(item.unitCents);
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) {
      throw new RangeError(`Expected a whole quantity of at least 1, got ${item.quantity}`);
    }
    return sum + item.quantity * item.unitCents;
  }, 0);
  const tax = Math.round((subtotal * taxPercent) / 100);
  return { subtotal, tax, total: subtotal + tax };
}

/** Whole-number percentage change from `previous` to `current`, e.g. +12. */
export function percentChange(previous: number, current: number): number {
  if (previous <= 0) throw new RangeError("The previous value must be above zero");
  return Math.round(((current - previous) / previous) * 100);
}
