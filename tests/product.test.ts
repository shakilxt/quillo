import { describe, expect, it } from "vitest";
import * as product from "@/data/product";
import { invoiceTotals, percentChange } from "@/lib/money";
import { formatPrice, planPrice } from "@/lib/pricing";

const { pricing, faq, mockups, nav, sectionIds } = product;

/** Every string anywhere in product.ts, with the path it was found at. */
function allStrings(value: unknown, path = "product"): { path: string; text: string }[] {
  if (typeof value === "string") return [{ path, text: value }];
  if (Array.isArray(value)) return value.flatMap((item, i) => allStrings(item, `${path}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => allStrings(item, `${path}.${key}`));
  }
  return [];
}

describe("pricing matches PLAN.md §5.8", () => {
  const expected = {
    starter: { monthly: "$0", yearly: "$0" },
    pro: { monthly: "$12", yearly: "$9.60" },
    team: { monthly: "$29", yearly: "$23.20" },
  };

  it.each(pricing.plans)("$name costs what the plan table says", (plan) => {
    expect(formatPrice(planPrice(plan.monthlyCents, "monthly").perMonth)).toBe(
      expected[plan.id].monthly,
    );
    expect(formatPrice(planPrice(plan.monthlyCents, "yearly").perMonth)).toBe(
      expected[plan.id].yearly,
    );
  });

  it("highlights Pro, and only Pro", () => {
    expect(pricing.plans.filter((plan) => plan.highlighted).map((plan) => plan.id)).toEqual([
      "pro",
    ]);
  });

  it("advertises the same yearly saving the maths gives", () => {
    expect(pricing.toggle.yearlyBadge).toBe("Save 20%");
    expect(planPrice(1_000, "yearly").perMonth).toBe(800);
  });
});

describe("content has the shape the page needs", () => {
  it("has the counts the sections are designed around", () => {
    expect(product.features.items).toHaveLength(6);
    expect(product.deepDives).toHaveLength(3);
    expect(product.howItWorks.steps).toHaveLength(3);
    expect(product.testimonials.items).toHaveLength(3);
    expect(product.logoStrip.companies).toHaveLength(6);
    expect(product.chat.suggestions).toHaveLength(4);
  });

  it("has the 8 FAQ questions from PLAN.md §5.9, in order", () => {
    expect(faq.items.map((item) => item.question)).toEqual([
      "Is there a free plan?",
      "What payment methods can clients use?",
      "How do automatic reminders work?",
      "Can I use my own logo and colours?",
      "Which currencies are supported?",
      "Can I cancel any time?",
      "Is my data secure?",
      "Can I import clients from a spreadsheet?",
    ]);
  });

  it("points every in-page link at a real section id", () => {
    const ids = new Set<string>(Object.values(sectionIds));
    const hrefs = [
      ...nav.links.map((link) => link.href),
      nav.cta.href,
      pricing.ctaHref,
      ...product.footer.columns.flatMap((column) =>
        column.items.flatMap((item) => ("href" in item ? [item.href] : [])),
      ),
    ];
    for (const href of hrefs) expect(ids).toContain(href.slice(1));
  });

  it("gives each testimonial initials that match the name", () => {
    for (const { name, initials } of product.testimonials.items) {
      expect(initials[0]).toBe(name[0]);
    }
  });
});

describe("the mockups agree with each other", () => {
  it("shows the draft invoice at the total the invoice editor works out", () => {
    const draft = mockups.dashboard.invoices.find((invoice) => invoice.status === "draft");
    const { total } = invoiceTotals(mockups.invoiceEditor.items, mockups.invoiceEditor.taxPercent);
    expect(draft?.amountCents).toBe(total);
  });

  it("shows this month's revenue as +12% on last month (PLAN.md §5.2)", () => {
    const [previous, current] = mockups.months.slice(-2);
    expect(current?.paidCents).toBe(1_842_000);
    expect(percentChange(previous?.paidCents ?? 0, current?.paidCents ?? 0)).toBe(12);
  });

  it("uses one invoice of each status", () => {
    expect(mockups.dashboard.invoices.map((invoice) => invoice.status).sort()).toEqual([
      "draft",
      "due-soon",
      "overdue",
      "paid",
    ]);
  });
});

describe("honest, Fiverr-safe copy (PLAN.md §0.5, §0.6)", () => {
  const strings = allStrings(product);

  it("finds the copy to check", () => {
    expect(strings.length).toBeGreaterThan(150);
  });

  it.each([
    ["an email address or handle", /@/],
    ["a web link", /https?:|www\.|\b[a-z0-9-]+\.(com|net|org|io|app|co|ai|dev|me)\b/i],
    ["a phone number", /\+?\d[\d\s().-]{7,}\d/],
    ["a messaging app", /whatsapp|skype|telegram|wechat/i],
  ])("contains no %s", (_label, pattern) => {
    const hits = strings.filter(({ text }) => pattern.test(text));
    expect(hits).toEqual([]);
  });

  it("keeps the footer disclaimer", () => {
    expect(product.footer.copyright).toContain(
      "Quillo is a fictional product made as a portfolio demo.",
    );
  });
});
