import { describe, expect, it } from "vitest";
import { formatCardFee, formatPrice, planPrice, YEARLY_DISCOUNT_PERCENT } from "@/lib/pricing";

describe("planPrice", () => {
  it("returns the list price on monthly billing, with no yearly charge", () => {
    expect(planPrice(1_200, "monthly")).toEqual({ perMonth: 1_200, billedYearly: null });
  });

  it(`takes ${YEARLY_DISCOUNT_PERCENT}% off on yearly billing`, () => {
    expect(planPrice(1_200, "yearly")).toEqual({ perMonth: 960, billedYearly: 11_520 });
    expect(planPrice(2_900, "yearly")).toEqual({ perMonth: 2_320, billedYearly: 27_840 });
  });

  it("keeps the free plan free, with nothing billed on either period", () => {
    expect(planPrice(0, "monthly")).toEqual({ perMonth: 0, billedYearly: null });
    expect(planPrice(0, "yearly")).toEqual({ perMonth: 0, billedYearly: null });
  });

  it("rounds the discounted price to the nearest cent", () => {
    // 999 × 0.8 = 799.2 → 799; 1 × 0.8 = 0.8 → 1
    expect(planPrice(999, "yearly").perMonth).toBe(799);
    expect(planPrice(1, "yearly").perMonth).toBe(1);
  });

  it("bills the yearly total from the rounded monthly figure, so the card never disagrees", () => {
    const { perMonth, billedYearly } = planPrice(999, "yearly");
    expect(billedYearly).toBe(perMonth * 12);
  });

  it("rejects negative and fractional cents", () => {
    expect(() => planPrice(-100, "monthly")).toThrow(RangeError);
    expect(() => planPrice(12.5, "yearly")).toThrow(RangeError);
  });
});

describe("formatPrice", () => {
  it("drops .00 on whole dollars", () => {
    expect(formatPrice(0)).toBe("$0");
    expect(formatPrice(1_200)).toBe("$12");
    expect(formatPrice(125_000)).toBe("$1,250");
  });

  it("shows cents otherwise", () => {
    expect(formatPrice(960)).toBe("$9.60");
    expect(formatPrice(2_320)).toBe("$23.20");
    expect(formatPrice(11_520)).toBe("$115.20");
  });
});

describe("formatCardFee", () => {
  it("writes cents under a dollar with the ¢ sign", () => {
    expect(formatCardFee({ percent: 2.9, fixedCents: 30 })).toBe("2.9% + 30¢");
  });

  it("writes a dollar or more as dollars", () => {
    expect(formatCardFee({ percent: 1.5, fixedCents: 100 })).toBe("1.5% + $1.00");
  });
});
