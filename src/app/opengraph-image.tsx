import { ImageResponse } from "next/og";
import { brand, hero, invoiceStatusLabels, mockups, type InvoiceStatus } from "@/data/product";
import { formatUsd, percentChange } from "@/lib/money";
import { nibDataUri } from "@/lib/logo";
import { loadOgFonts } from "@/lib/og-assets";

// The link preview (PLAN.md §7): the logo, the headline and a mini dashboard, in brand colours.
// ImageResponse takes inline styles only (no Tailwind), so the brand colours are repeated here.

export const alt = `${brand.name}: ${hero.headline.before}${hero.headline.highlight}${hero.headline.after} A preview of the invoicing dashboard.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const color = {
  paper: "#faf8f4",
  surface: "#ffffff",
  ink: "#0e1a1f",
  inkMuted: "#55636a",
  inkSubtle: "#66747a",
  line: "#e7e3dc",
  primary: "#0b6e69",
  primarySoft: "#e2f1ef",
  mint: "#7fe0c4",
  amber: "#f2b544",
  coral: "#e8664f",
};
const display = "Bricolage Grotesque";

/** The same pills as the page's Badge: ink text on every fill. */
const statusColor: Record<InvoiceStatus, string> = {
  paid: color.mint,
  "due-soon": color.amber,
  overdue: color.coral,
  draft: color.line,
};

const { dashboard, months } = mockups;

/** The hero dashboard's figures: this month's revenue, its change, and a paid and a late invoice. */
function figures() {
  const current = months.at(-1);
  const previous = months.at(-2);
  if (!current || !previous) throw new Error("mockups.months needs at least two months");
  const invoices = dashboard.invoices.filter((invoice) => invoice.status !== "draft");
  return {
    revenueCents: current.paidCents,
    change: percentChange(previous.paidCents, current.paidCents),
    invoices,
  };
}
const { revenueCents, change, invoices } = figures();
const maxPaid = Math.max(...months.map((month) => month.paidCents));

// Read once at module scope, so the image is rendered at build time (Cache Components).
const fonts = await loadOgFonts();
const nib = nibDataUri(color.primary);

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: color.paper,
        backgroundImage: "radial-gradient(rgba(14, 26, 31, 0.09) 1.5px, transparent 1.5px)",
        backgroundSize: "26px 26px",
        fontFamily: "Instrument Sans",
        color: color.ink,
      }}
    >
      {/* Words */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: 640,
          padding: "0 0 0 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={nib} width={36} height={60} alt="" />
          <span style={{ fontFamily: display, fontSize: 44, letterSpacing: "-0.02em" }}>
            {brand.name}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 44,
            fontFamily: display,
            fontSize: 70,
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
          }}
        >
          <span>{hero.headline.before.trim()}</span>
          <span style={{ display: "flex" }}>
            <span style={{ position: "relative", display: "flex" }}>
              {/* The mint swash from the hero, as a flat stroke. */}
              <span
                style={{
                  position: "absolute",
                  left: -4,
                  right: -4,
                  bottom: 4,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: color.mint,
                }}
              />
              <span style={{ position: "relative" }}>{hero.headline.highlight}</span>
            </span>
            {hero.headline.after}
          </span>
        </div>

        <span style={{ marginTop: 28, fontSize: 28, fontWeight: 500, color: color.inkMuted }}>
          {brand.tagline}
        </span>

        <span
          style={{
            marginTop: 40,
            alignSelf: "flex-start",
            padding: "8px 18px",
            borderRadius: 999,
            border: `1.5px solid ${color.line}`,
            backgroundColor: color.surface,
            fontSize: 19,
            fontWeight: 500,
            color: color.inkMuted,
          }}
        >
          {brand.disclaimer}
        </span>
      </div>

      {/* Mini dashboard, running off the right and bottom edges */}
      <div
        style={{
          position: "absolute",
          left: 690,
          top: 92,
          width: 470,
          height: 600,
          display: "flex",
          flexDirection: "column",
          backgroundColor: color.surface,
          border: `1.5px solid ${color.line}`,
          borderRadius: 22,
          boxShadow: "0 24px 64px -12px rgba(14, 26, 31, 0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "16px 20px",
            borderBottom: `1.5px solid ${color.line}`,
            backgroundColor: color.paper,
          }}
        >
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: color.line }}
            />
          ))}
          <span style={{ marginLeft: 12, fontSize: 17, fontWeight: 500, color: color.inkSubtle }}>
            {dashboard.windowTitle}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 26 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              padding: 22,
              border: `1.5px solid ${color.line}`,
              borderRadius: 16,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 17, fontWeight: 500, color: color.inkSubtle }}>
                {dashboard.revenueLabel}
              </span>
              <span style={{ fontFamily: display, fontSize: 46, letterSpacing: "-0.02em" }}>
                {formatUsd(revenueCents)}
              </span>
              <span
                style={{
                  alignSelf: "flex-start",
                  marginTop: 4,
                  padding: "3px 12px",
                  borderRadius: 999,
                  backgroundColor: color.primarySoft,
                  color: color.primary,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {`+${change}% ${dashboard.changeLabel}`}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 110 }}>
              {months.map((month, i) => (
                <span
                  key={month.month}
                  style={{
                    width: 18,
                    height: Math.round((month.paidCents / maxPaid) * 110),
                    borderRadius: 6,
                    backgroundColor: i === months.length - 1 ? color.primary : color.primarySoft,
                  }}
                />
              ))}
            </div>
          </div>

          {invoices.map((invoice) => (
            <div
              key={invoice.number}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 4px",
                borderBottom: `1.5px solid ${color.line}`,
                fontSize: 19,
              }}
            >
              <span style={{ fontWeight: 600, flexGrow: 1 }}>{invoice.client}</span>
              <span style={{ fontWeight: 500, color: color.inkMuted }}>
                {formatUsd(invoice.amountCents)}
              </span>
              <span
                style={{
                  width: 108,
                  justifyContent: "center",
                  display: "flex",
                  padding: "4px 0",
                  borderRadius: 999,
                  fontSize: 15,
                  fontWeight: 600,
                  backgroundColor: statusColor[invoice.status],
                }}
              >
                {invoiceStatusLabels[invoice.status]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* The "paid" toast floating over the dashboard's edge, as in the hero */}
      <div
        style={{
          position: "absolute",
          left: 630,
          top: 540,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 20px 14px 14px",
          backgroundColor: color.surface,
          border: `1.5px solid ${color.line}`,
          borderRadius: 16,
          boxShadow: "0 16px 40px -8px rgba(14, 26, 31, 0.2)",
          fontSize: 19,
          fontWeight: 600,
        }}
      >
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: color.mint,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              d="M5 12.5 L10 17.5 L19 7"
              fill="none"
              stroke={color.ink}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {dashboard.paidToast}
      </div>
    </div>,
    { ...size, fonts },
  );
}
