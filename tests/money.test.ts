import { describe, expect, it } from "vitest";
import { formatUsd, invoiceTotals, percentChange } from "@/lib/money";

describe("formatUsd", () => {
  it("adds thousands separators", () => {
    expect(formatUsd(1_842_000)).toBe("$18,420");
  });

  it("always shows cents when asked, for invoice lines", () => {
    expect(formatUsd(60_000, "always")).toBe("$600.00");
    expect(formatUsd(99_050, "always")).toBe("$990.50");
  });

  it("rejects amounts that aren't whole, non-negative cents", () => {
    expect(() => formatUsd(-1)).toThrow(RangeError);
    expect(() => formatUsd(0.5)).toThrow(RangeError);
    expect(() => formatUsd(Number.NaN)).toThrow(RangeError);
  });
});

describe("invoiceTotals", () => {
  it("adds up line items and tax", () => {
    const items = [
      { description: "Design", quantity: 1, unitCents: 60_000 },
      { description: "Copy", quantity: 3, unitCents: 8_000 },
    ];
    expect(invoiceTotals(items, 10)).toEqual({ subtotal: 84_000, tax: 8_400, total: 92_400 });
  });

  it("rounds tax to the nearest cent", () => {
    // 3333 × 7.5% = 249.975 → 250
    const items = [{ description: "Item", quantity: 1, unitCents: 3_333 }];
    expect(invoiceTotals(items, 7.5)).toEqual({ subtotal: 3_333, tax: 250, total: 3_583 });
  });

  it("handles an empty invoice and zero tax", () => {
    expect(invoiceTotals([], 10)).toEqual({ subtotal: 0, tax: 0, total: 0 });
    const items = [{ description: "Item", quantity: 2, unitCents: 500 }];
    expect(invoiceTotals(items, 0)).toEqual({ subtotal: 1_000, tax: 0, total: 1_000 });
  });

  it("rejects a quantity below 1 or a fractional one", () => {
    expect(() => invoiceTotals([{ description: "x", quantity: 0, unitCents: 100 }], 0)).toThrow(
      RangeError,
    );
    expect(() => invoiceTotals([{ description: "x", quantity: 1.5, unitCents: 100 }], 0)).toThrow(
      RangeError,
    );
  });
});

describe("percentChange", () => {
  it("rounds to a whole percentage", () => {
    expect(percentChange(1_645_000, 1_842_000)).toBe(12);
    expect(percentChange(200, 150)).toBe(-25);
  });

  it("refuses a zero starting value", () => {
    expect(() => percentChange(0, 100)).toThrow(RangeError);
  });
});
