import {
  BarChart3,
  Bell,
  Check,
  FileText,
  LayoutDashboard,
  Settings,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Badge, statusTone } from "@/components/ui/Badge";
import { invoiceStatusLabels, mockups } from "@/data/product";
import { cx } from "@/lib/cx";
import { formatUsd, percentChange } from "@/lib/money";
import { CountUpUsd } from "./CountUpUsd";
import { initials, Toast } from "./parts";
import { WindowFrame } from "./WindowFrame";

const { dashboard, months } = mockups;

/** Same order as `mockups.dashboard.sidebar`. */
const sidebarIcons: readonly LucideIcon[] = [LayoutDashboard, FileText, Users, BarChart3, Settings];

/** "This month" is the last month in the data; the +n% chip compares it with the one before. */
function thisMonth() {
  const current = months.at(-1);
  const previous = months.at(-2);
  if (!current || !previous) throw new Error("mockups.months needs at least two months");
  return {
    paidCents: current.paidCents,
    change: percentChange(previous.paidCents, current.paidCents),
  };
}
const { paidCents, change } = thisMonth();

/* Bar chart geometry, in SVG user units. Labels sit below in HTML so they don't scale. */
const CHART_W = 300;
const CHART_H = 96;
const SLOT_W = CHART_W / months.length;
const BAR_W = 26;
const maxPaid = Math.max(...months.map((month) => month.paidCents));

interface DashboardMockupProps {
  /** Describes the whole picture for screen readers; the mockup itself is decorative. */
  label: string;
  className?: string;
}

/**
 * The hero's product preview (PLAN.md §5.2): a browser window with a mini Quillo dashboard,
 * plus two notification cards floating over its edges.
 */
export function DashboardMockup({ label, className }: DashboardMockupProps) {
  return (
    <div role="img" aria-label={label} className={cx("relative select-none", className)}>
      <WindowFrame title={dashboard.windowTitle} className="shadow-float">
        <div className="flex">
          <ul className="hidden w-14 shrink-0 flex-col items-center gap-2 border-r border-line bg-paper/60 py-4 sm:flex">
            {dashboard.sidebar.map((item, i) => {
              const Icon = sidebarIcons[i];
              if (!Icon) return null;
              return (
                <li
                  key={item}
                  className={cx(
                    "flex size-9 items-center justify-center rounded-field",
                    i === 0 ? "bg-primary-soft text-primary" : "text-ink-faint",
                  )}
                >
                  <Icon aria-hidden="true" className="size-4.5" strokeWidth={2} />
                </li>
              );
            })}
          </ul>

          <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-5">
            {/* Revenue + chart */}
            <div className="grid gap-4 rounded-card border border-line p-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end sm:gap-6">
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-ink-subtle">{dashboard.revenueLabel}</p>
                <p className="font-display text-[2rem] leading-none font-bold tracking-[-0.02em] text-ink tabular-nums">
                  <CountUpUsd cents={paidCents} />
                </p>
                <p className="flex items-center gap-1.5 text-xs text-ink-subtle">
                  <Badge tone="mint" className="gap-0.5 px-1.5">
                    <TrendingUp aria-hidden="true" className="size-3" strokeWidth={2.5} />
                    {change > 0 ? "+" : ""}
                    {change}%
                  </Badge>
                  {dashboard.changeLabel}
                </p>
              </div>

              <div>
                <svg
                  viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                  aria-hidden="true"
                  focusable="false"
                  className="block h-auto w-full overflow-visible"
                >
                  {[0.33, 0.66].map((at) => (
                    <line
                      key={at}
                      x1="0"
                      x2={CHART_W}
                      y1={CHART_H * at}
                      y2={CHART_H * at}
                      className="stroke-line"
                      strokeDasharray="3 4"
                    />
                  ))}
                  {months.map((month, i) => {
                    const h = Math.max(4, (month.paidCents / maxPaid) * (CHART_H - 6));
                    const last = i === months.length - 1;
                    return (
                      <rect
                        key={month.month}
                        x={i * SLOT_W + (SLOT_W - BAR_W) / 2}
                        y={CHART_H - h}
                        width={BAR_W}
                        height={h}
                        rx="5"
                        className={last ? "fill-primary" : "fill-primary/20"}
                      />
                    );
                  })}
                </svg>
                <ul className="mt-1.5 grid grid-cols-6 text-center text-[11px] leading-4 text-ink-subtle">
                  {months.map((month) => (
                    <li key={month.month}>{month.month}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recent invoices */}
            <div className="rounded-card border border-line">
              <p className="border-b border-line px-4 py-2.5 text-xs font-semibold text-ink">
                {dashboard.invoicesTitle}
              </p>
              <ul className="divide-y divide-line">
                {dashboard.invoices.map((invoice) => (
                  <li
                    key={invoice.number}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 sm:grid-cols-[auto_minmax(0,1fr)_auto_5.5rem]"
                  >
                    <span className="flex size-8 items-center justify-center rounded-full bg-paper text-[11px] font-semibold text-ink-muted">
                      {initials(invoice.client)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-small text-ink">{invoice.client}</span>
                      <span className="block text-[11px] leading-4 text-ink-subtle">
                        {invoice.number} · {invoice.due}
                      </span>
                    </span>
                    <span className="hidden text-right text-small text-ink tabular-nums sm:block">
                      {formatUsd(invoice.amountCents)}
                    </span>
                    <span className="flex flex-col items-end gap-0.5 sm:block sm:text-right">
                      <span className="text-small text-ink tabular-nums sm:hidden">
                        {formatUsd(invoice.amountCents)}
                      </span>
                      <Badge tone={statusTone[invoice.status]}>
                        {invoiceStatusLabels[invoice.status]}
                      </Badge>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </WindowFrame>

      {/*
        Floating notifications, set over the window's top and bottom edges so they never hide
        the figures or the status pills. The top one sits high enough to clear the title bar's
        dots and title at every width. They drift gently unless reduced motion is on.
      */}
      <Toast
        icon={Check}
        iconClassName="bg-mint text-ink"
        className="drift -top-9 -left-3 sm:-left-10 lg:-left-14"
      >
        {dashboard.paidToast}
      </Toast>
      <Toast
        icon={Bell}
        iconClassName="bg-amber text-ink"
        className="drift -right-3 -bottom-7 [animation-delay:-3s] sm:-right-8"
      >
        {dashboard.reminderToast}
      </Toast>
    </div>
  );
}
