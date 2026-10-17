import { Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pricing, type Plan } from "@/data/product";
import { cx } from "@/lib/cx";
import { formatPrice, planPrice } from "@/lib/pricing";
import { BillingToggle } from "./pricing/BillingToggle";

const titleId = `${pricing.id}-title`;

/** Pricing (PLAN.md §5.8): three plans, Pro raised, with a Monthly / Yearly switch. */
export function Pricing() {
  return (
    <section id={pricing.id} aria-labelledby={titleId} className="section-y">
      <Container>
        <SectionHeading
          id={titleId}
          eyebrow={pricing.eyebrow}
          title={pricing.title}
          intro={pricing.intro}
          align="center"
        />

        <div className="mt-10">
          <BillingToggle copy={pricing.toggle}>
            {/* Stacked until lg: three columns any narrower squeeze the feature lists. */}
            <ul className="mx-auto mt-12 grid max-w-md gap-6 lg:mt-16 lg:max-w-none lg:grid-cols-3 lg:gap-5">
              {pricing.plans.map((plan, i) => (
                <Reveal as="li" key={plan.id} delay={i * 80} className="flex">
                  <PlanCard plan={plan} />
                </Reveal>
              ))}
            </ul>
          </BillingToggle>
        </div>
      </Container>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const monthly = planPrice(plan.monthlyCents, "monthly");
  const yearly = planPrice(plan.monthlyCents, "yearly");
  const free = plan.monthlyCents === 0;

  // The highlighted card is raised: 16px taller top and bottom, with its content still in line
  // with its neighbours'.
  return (
    <div
      className={cx(
        "relative flex flex-1 flex-col rounded-card border bg-surface p-7 sm:p-8",
        plan.highlighted
          ? "border-primary shadow-float ring-1 ring-primary lg:-my-4 lg:py-12"
          : "border-line shadow-card",
      )}
    >
      {plan.highlighted && (
        <Badge tone="amber" className="absolute -top-3 left-7 sm:left-8">
          {pricing.popularBadge}
        </Badge>
      )}

      <h3 className="text-h3">{plan.name}</h3>
      {/* Two lines held open at lg, so the prices and buttons line up across the cards. */}
      <p className="mt-2 text-pretty lg:min-h-13">{plan.tagline}</p>

      <p className="mt-6 flex items-baseline gap-1.5">
        <span className="font-display text-[3rem] leading-none font-bold tracking-[-0.03em] text-ink tabular-nums">
          {free ? (
            formatPrice(monthly.perMonth)
          ) : (
            <>
              <span className="price-swap yearly:hidden">{formatPrice(monthly.perMonth)}</span>
              <span className="price-swap hidden yearly:inline">
                {formatPrice(yearly.perMonth)}
              </span>
            </>
          )}
        </span>
        <span className="text-small">{pricing.perMonth}</span>
      </p>
      <p className="mt-2 min-h-5 text-small text-ink-subtle">
        {free || yearly.billedYearly === null ? (
          pricing.freeNote
        ) : (
          <>
            <span className="yearly:hidden">{pricing.monthlyNote}</span>
            <span className="hidden yearly:inline">
              {pricing.yearlyNote} {formatPrice(yearly.billedYearly)}
            </span>
          </>
        )}
      </p>

      <ButtonLink
        href={pricing.ctaHref}
        variant={plan.highlighted ? "primary" : "secondary"}
        className="mt-7 w-full"
      >
        {plan.cta}
      </ButtonLink>

      <p className="mt-8 border-t border-line pt-7 text-small text-ink">{pricing.includesLabel}</p>
      <ul className="mt-4 flex flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-ink">
            <span className="mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-full bg-mint">
              <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
            </span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
