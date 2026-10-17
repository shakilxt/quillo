import { Container } from "@/components/ui/Container";
import { icons } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { howItWorks } from "@/data/product";

const titleId = `${howItWorks.id}-title`;

/**
 * How it works (PLAN.md §5.6): a dark ink band with three numbered steps joined by a thin line,
 * which runs down the left on mobile and across on desktop.
 */
export function HowItWorks() {
  return (
    <section id={howItWorks.id} aria-labelledby={titleId} className="bg-ink section-y">
      <Container>
        <SectionHeading
          id={titleId}
          eyebrow={howItWorks.eyebrow}
          title={howItWorks.title}
          align="center"
          tone="dark"
        />

        {/* The <ol> carries the numbering for screen readers; the visible "Step 1" is decoration. */}
        <ol className="mx-auto mt-14 grid max-w-md gap-10 lg:mt-20 lg:max-w-none lg:grid-cols-3 lg:gap-8">
          {howItWorks.steps.map((step, i) => {
            const Icon = icons[step.icon];
            const last = i === howItWorks.steps.length - 1;
            return (
              <Reveal
                as="li"
                key={step.title}
                delay={i * 120}
                className="relative flex gap-5 lg:flex-col lg:items-center lg:gap-6 lg:text-center"
              >
                {!last && (
                  // From this icon to the next: down by the gap below (40px) on mobile, across
                  // the column gap (32px) on desktop, stopping 8px short of each circle.
                  <span
                    aria-hidden="true"
                    className="absolute top-16 -bottom-8 left-7 border-l border-dashed border-paper/25 lg:top-7 lg:right-[calc(-50%+0.25rem)] lg:bottom-auto lg:left-[calc(50%+2.25rem)] lg:border-t lg:border-l-0"
                  />
                )}
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full border border-paper/15 bg-paper/5 text-mint">
                  <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
                </span>
                <div className="flex flex-col gap-2 pt-1 lg:pt-0">
                  <p aria-hidden="true" className="font-sans text-eyebrow text-mint uppercase">
                    {howItWorks.stepLabel} {i + 1}
                  </p>
                  <h3 className="text-h3 text-paper">{step.title}</h3>
                  <p className="text-pretty text-paper/75">{step.body}</p>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
