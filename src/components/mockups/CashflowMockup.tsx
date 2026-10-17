import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { invoiceStatusLabels, mockups } from "@/data/product";
import { smoothArea, smoothLine, toPoints } from "@/lib/chart";
import { cx } from "@/lib/cx";
import { formatUsd } from "@/lib/money";
import { WindowFrame } from "./WindowFrame";

const { cashflow, months } = mockups;

/* Chart geometry in SVG units. The top is a round $20k, a little above the best month. */
const W = 320;
const H = 120;
const TOP_CENTS = 2_000_000;
const paid = toPoints(
  months.map((month) => month.paidCents),
  W,
  H,
  TOP_CENTS,
);
const outstanding = toPoints(
  months.map((month) => month.outstandingCents),
  W,
  H,
  TOP_CENTS,
);

function latest() {
  const month = months.at(-1);
  const paidPoint = paid.at(-1);
  const outstandingPoint = outstanding.at(-1);
  if (!month || !paidPoint || !outstandingPoint) throw new Error("mockups.months is empty");
  return { month, paidPoint, outstandingPoint };
}
const { month: thisMonth, paidPoint, outstandingPoint } = latest();

interface CashflowMockupProps {
  label: string;
  className?: string;
}

/** Deep-dive 3, "Stay on top" (PLAN.md §5.5): six months of paid vs outstanding. */
export function CashflowMockup({ label, className }: CashflowMockupProps) {
  return (
    <div role="img" aria-label={label} className={cx("select-none", className)}>
      <WindowFrame title={cashflow.windowTitle} className="shadow-float">
        <div className="flex flex-col gap-5 p-4 sm:p-6">
          <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
            <Stat label={cashflow.paidLabel} cents={thisMonth.paidCents} swatch="bg-primary" />
            <Stat
              label={cashflow.outstandingLabel}
              cents={thisMonth.outstandingCents}
              swatch="bg-amber"
            />
            <span className="ml-auto text-[11px] leading-4 text-ink-subtle">
              {cashflow.periodLabel}
            </span>
          </div>

          <div>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              aria-hidden="true"
              focusable="false"
              className="block h-auto w-full overflow-visible"
            >
              <defs>
                <linearGradient id="cashflow-paid-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="0"
                    className="[stop-color:var(--color-primary)] [stop-opacity:0.22]"
                  />
                  <stop offset="1" className="[stop-color:var(--color-primary)] [stop-opacity:0]" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((at) => (
                <line
                  key={at}
                  x1="0"
                  x2={W}
                  y1={H * at}
                  y2={H * at}
                  className="stroke-line"
                  strokeDasharray="3 4"
                />
              ))}
              <line x1="0" x2={W} y1={H} y2={H} className="stroke-line" />

              <path d={smoothArea(paid, H)} fill="url(#cashflow-paid-fill)" />
              <path
                d={smoothLine(paid)}
                fill="none"
                className="stroke-primary"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path d={smoothArea(outstanding, H)} className="fill-amber/25" />
              <path
                d={smoothLine(outstanding)}
                fill="none"
                className="stroke-amber"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* This month's values, ringed in white so they lift off the lines. */}
              <circle
                cx={paidPoint.x}
                cy={paidPoint.y}
                r="5"
                className="fill-primary stroke-surface"
                strokeWidth="2.5"
              />
              <circle
                cx={outstandingPoint.x}
                cy={outstandingPoint.y}
                r="5"
                className="fill-amber stroke-surface"
                strokeWidth="2.5"
              />
            </svg>
            {/* Labels sit under each point: the first and last align to the chart's edges. */}
            <ul className="mt-2 flex justify-between text-[11px] leading-4 text-ink-subtle">
              {months.map((month) => (
                <li key={month.month}>{month.month}</li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-3 rounded-card border border-line px-3 py-2.5 sm:px-4">
            <Badge tone="coral">{invoiceStatusLabels[cashflow.flagged.status]}</Badge>
            <span className="min-w-0 flex-1 truncate text-small text-ink">
              {cashflow.flagged.client}
              <span className="hidden text-ink-subtle sm:inline"> · {cashflow.flagged.number}</span>
            </span>
            <span className="hidden items-center gap-1 text-[11px] leading-4 text-ink-subtle sm:flex lg:hidden xl:flex">
              <Bell aria-hidden="true" className="size-3" />
              {cashflow.flaggedNote}
            </span>
            <span className="text-small font-semibold text-ink tabular-nums">
              {formatUsd(cashflow.flagged.amountCents)}
            </span>
          </div>
        </div>
      </WindowFrame>
    </div>
  );
}

function Stat({ label, cents, swatch }: { label: string; cents: number; swatch: string }) {
  return (
    <span className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-xs font-medium text-ink-subtle">
        <span className={cx("size-2 rounded-full", swatch)} />
        {label}
      </span>
      <span className="font-display text-[1.625rem] leading-none font-bold tracking-[-0.02em] text-ink tabular-nums">
        {formatUsd(cents)}
      </span>
    </span>
  );
}
