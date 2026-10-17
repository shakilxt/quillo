import { Plus, Send } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { invoiceStatusLabels, mockups } from "@/data/product";
import { cx } from "@/lib/cx";
import { formatUsd, invoiceTotals } from "@/lib/money";
import { initials } from "./parts";
import { WindowFrame } from "./WindowFrame";

const editor = mockups.invoiceEditor;
const totals = invoiceTotals(editor.items, editor.taxPercent);

/** Item | Qty | Rate | Amount. Rate is dropped below `sm` so the amounts keep their room. */
const row =
  "grid grid-cols-[minmax(0,1fr)_2rem_5rem] gap-3 sm:grid-cols-[minmax(0,1fr)_2.5rem_5rem_5.5rem]";

interface InvoiceEditorMockupProps {
  label: string;
  className?: string;
}

/** Deep-dive 1, "Create" (PLAN.md §5.5): a draft invoice with line items, tax and a total. */
export function InvoiceEditorMockup({ label, className }: InvoiceEditorMockupProps) {
  return (
    <div role="img" aria-label={label} className={cx("select-none", className)}>
      <WindowFrame title={editor.windowTitle} className="shadow-float">
        <div className="flex flex-col gap-5 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                {initials(editor.billTo)}
              </span>
              <span>
                <span className="block text-[11px] leading-4 text-ink-subtle">
                  {editor.billToLabel}
                </span>
                <span className="block text-small font-semibold text-ink">{editor.billTo}</span>
              </span>
            </div>
            <span className="flex flex-col items-end gap-1">
              <Badge>{invoiceStatusLabels.draft}</Badge>
              <span className="text-[11px] leading-4 text-ink-subtle">{editor.due}</span>
            </span>
          </div>

          <div className="text-small">
            <div
              className={cx(
                row,
                "border-b border-line px-2 pb-2 text-[11px] leading-4 font-semibold text-ink-subtle",
              )}
            >
              <span>{editor.columns.description}</span>
              <span className="text-right">{editor.columns.quantity}</span>
              <span className="hidden text-right sm:block">{editor.columns.unit}</span>
              <span className="text-right">{editor.columns.amount}</span>
            </div>
            <ul>
              {editor.items.map((item, i) => (
                <li
                  key={item.description}
                  className={cx(
                    row,
                    "items-center rounded-field px-2 py-2.5 text-ink tabular-nums",
                    // The row being edited: the "editor" part of the picture.
                    i === 0 && "my-1 bg-primary-soft/60 ring-1 ring-primary/30",
                  )}
                >
                  <span className="truncate">{item.description}</span>
                  <span className="text-right text-ink-muted">{item.quantity}</span>
                  <span className="hidden text-right text-ink-muted sm:block">
                    {formatUsd(item.unitCents, "always")}
                  </span>
                  <span className="text-right">
                    {formatUsd(item.unitCents * item.quantity, "always")}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-1 flex items-center gap-1.5 px-2 py-1.5 font-semibold text-primary">
              <Plus aria-hidden="true" className="size-4" strokeWidth={2.5} />
              {editor.addItem}
            </p>
          </div>

          <dl className="ml-auto grid w-full max-w-60 grid-cols-[1fr_auto] gap-x-6 gap-y-1.5 border-t border-line pt-4 text-small tabular-nums">
            <dt className="text-ink-muted">{editor.subtotalLabel}</dt>
            <dd className="text-right text-ink">{formatUsd(totals.subtotal, "always")}</dd>
            <dt className="text-ink-muted">{editor.taxLabel}</dt>
            <dd className="text-right text-ink">{formatUsd(totals.tax, "always")}</dd>
            <dt className="mt-1.5 self-end font-semibold text-ink">{editor.totalLabel}</dt>
            <dd className="mt-1.5 text-right font-display text-[1.375rem] leading-7 font-bold text-ink">
              {formatUsd(totals.total, "always")}
            </dd>
          </dl>

          <span className="ml-auto inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-small font-semibold text-white">
            <Send aria-hidden="true" className="size-4" strokeWidth={2.25} />
            {editor.send}
          </span>
        </div>
      </WindowFrame>
    </div>
  );
}
