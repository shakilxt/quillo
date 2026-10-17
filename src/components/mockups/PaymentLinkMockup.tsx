import { Check, CreditCard, Lock } from "lucide-react";
import { mockups } from "@/data/product";
import { cx } from "@/lib/cx";
import { formatUsd } from "@/lib/money";
import { initials, Toast } from "./parts";
import { WindowFrame } from "./WindowFrame";

const pay = mockups.paymentLink;

interface PaymentLinkMockupProps {
  label: string;
  className?: string;
}

/**
 * Deep-dive 2, "Get paid" (PLAN.md §5.5): the pay page a client sees. The "fields" are plain
 * shapes, not inputs: the whole mockup is one image to assistive tech and can't be focused.
 */
export function PaymentLinkMockup({ label, className }: PaymentLinkMockupProps) {
  return (
    <div role="img" aria-label={label} className={cx("relative select-none", className)}>
      <WindowFrame title={pay.windowTitle} className="mx-auto max-w-sm shadow-float">
        <div className="flex flex-col gap-5 p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-field bg-ink text-xs font-semibold text-paper">
              {initials(pay.from)}
            </span>
            <span>
              <span className="block text-small font-semibold text-ink">{pay.from}</span>
              <span className="block text-[11px] leading-4 text-ink-subtle">
                {pay.invoice} · {pay.due}
              </span>
            </span>
          </div>

          <p className="font-display text-[2.5rem] leading-none font-bold tracking-[-0.02em] text-ink tabular-nums">
            {formatUsd(pay.amountCents)}
          </p>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-ink">{pay.cardLabel}</span>
            <span className="grid grid-cols-2 overflow-hidden rounded-field border border-line text-small text-ink-subtle">
              {/* Shown focused, with a caret, as if the client is about to type. */}
              <span className="col-span-2 flex items-center gap-2.5 border-b border-line px-3 py-2.5 ring-2 ring-primary/40 ring-inset">
                <CreditCard aria-hidden="true" className="size-4 text-ink-faint" />
                <span className="h-4 w-px bg-primary" />
                {pay.cardNumber}
              </span>
              <span className="border-r border-line px-3 py-2.5">{pay.expiry}</span>
              <span className="px-3 py-2.5">{pay.cvc}</span>
            </span>
          </div>

          <span className="flex h-11 items-center justify-center gap-2 rounded-full bg-primary text-small font-semibold text-white">
            <Lock aria-hidden="true" className="size-4" strokeWidth={2.25} />
            {pay.pay}
          </span>

          <span className="-mt-1 flex items-center justify-center gap-1.5 text-[11px] leading-4 text-ink-subtle">
            <Lock aria-hidden="true" className="size-3" />
            {pay.secureNote}
          </span>
        </div>
      </WindowFrame>

      <Toast
        icon={Check}
        iconClassName="bg-mint text-ink"
        className="-right-1 -bottom-9 sm:-right-4 sm:-bottom-6 lg:-right-8"
      >
        {pay.paidToast}
      </Toast>
    </div>
  );
}
