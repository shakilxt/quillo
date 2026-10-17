import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { CashflowMockup } from "@/components/mockups/CashflowMockup";
import { InvoiceEditorMockup } from "@/components/mockups/InvoiceEditorMockup";
import { PaymentLinkMockup } from "@/components/mockups/PaymentLinkMockup";
import { Container } from "@/components/ui/Container";
import { icons } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { deepDives, features, type DeepDive } from "@/data/product";
import { cx } from "@/lib/cx";

const titleId = `${features.id}-title`;

/**
 * Features (PLAN.md §5.4 and §5.5): the six-card grid, then three rows that each show one job
 * in a mockup. One section, so the nav's "Features" link stays active through all of it.
 */
export function Features() {
  return (
    <section id={features.id} aria-labelledby={titleId} className="section-y">
      <Container>
        <SectionHeading
          id={titleId}
          eyebrow={features.eyebrow}
          title={features.title}
          intro={features.intro}
          align="center"
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-16 lg:grid-cols-3">
          {features.items.map((feature, i) => {
            const Icon = icons[feature.icon];
            return (
              <Reveal
                as="li"
                key={feature.title}
                delay={(i % 3) * 80}
                className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-7"
              >
                <span className="flex size-11 items-center justify-center rounded-field bg-primary-soft text-primary">
                  <Icon aria-hidden="true" className="size-5.5" strokeWidth={2} />
                </span>
                <h3 className="mt-5 text-h3">{feature.title}</h3>
                <p className="mt-2 text-pretty">{feature.body}</p>
              </Reveal>
            );
          })}
        </ul>

        <div className="mt-24 flex flex-col gap-24 lg:mt-36 lg:gap-32">
          {deepDives.map((row, i) => (
            <DeepDiveRow key={row.mockup} row={row} flip={i % 2 === 1} />
          ))}
        </div>
      </Container>
    </section>
  );
}

const mockupFor: Record<DeepDive["mockup"], (label: string) => ReactNode> = {
  "invoice-editor": (label) => <InvoiceEditorMockup label={label} />,
  "payment-link": (label) => <PaymentLinkMockup label={label} className="sm:px-6" />,
  cashflow: (label) => <CashflowMockup label={label} />,
};

/** Text on one side, its mockup on the other; `flip` swaps the sides on desktop. */
function DeepDiveRow({ row, flip }: { row: DeepDive; flip: boolean }) {
  return (
    // The mockup side gets the wider column so the invoice lines don't truncate at 1024.
    <div
      className={cx(
        "grid grid-cols-1 items-center gap-12 xl:gap-20",
        flip
          ? "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
          : "lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]",
      )}
    >
      <Reveal className={cx("flex max-w-xl flex-col gap-4", flip && "lg:order-last")}>
        <p className="text-eyebrow text-primary uppercase">{row.eyebrow}</p>
        <h3 className="text-title text-balance">{row.title}</h3>
        <p className="text-lead text-pretty">{row.body}</p>
        <ul className="mt-2 flex flex-col gap-3">
          {row.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3 text-ink">
              <span className="mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-full bg-mint">
                <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
              </span>
              {bullet}
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={120}>
        <div className="rounded-[1.75rem] bg-primary-soft px-4 py-10 sm:px-10 sm:py-14 lg:px-8 xl:px-12">
          {mockupFor[row.mockup](row.mockupLabel)}
        </div>
      </Reveal>
    </div>
  );
}
