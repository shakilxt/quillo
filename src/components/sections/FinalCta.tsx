import { Container } from "@/components/ui/Container";
import { EmailForm } from "@/components/ui/EmailForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { emailForm, finalCta } from "@/data/product";

const titleId = `${finalCta.id}-title`;

/**
 * Final CTA (PLAN.md §5.10): the dark band every "Start free" button scrolls to, with the same
 * demo-only sign-up form as the hero. The footer carries on in ink below it.
 */
export function FinalCta() {
  return (
    <section
      id={finalCta.id}
      aria-labelledby={titleId}
      className="relative isolate overflow-hidden bg-ink section-y"
    >
      <div aria-hidden="true" className="cta-glow absolute inset-0 -z-10" />
      <div aria-hidden="true" className="cta-dots absolute inset-0 -z-10" />

      <Container className="flex flex-col items-center">
        <SectionHeading
          id={titleId}
          eyebrow={finalCta.eyebrow}
          title={finalCta.title}
          intro={finalCta.intro}
          align="center"
          tone="dark"
        />
        <EmailForm copy={emailForm} tone="dark" className="mt-10 w-full max-w-md" />
      </Container>
    </section>
  );
}
