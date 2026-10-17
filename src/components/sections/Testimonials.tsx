import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials, type AvatarTone } from "@/data/product";
import { cx } from "@/lib/cx";

const titleId = `${testimonials.id}-title`;

const avatarTones: Record<AvatarTone, string> = {
  mint: "bg-mint text-ink",
  amber: "bg-amber text-ink",
  "primary-soft": "bg-primary-soft text-primary",
};

/**
 * Testimonials (PLAN.md §5.7): made-up people with initials avatars, no photos and no numbers
 * about real outcomes (§0.5, §0.7).
 */
export function Testimonials() {
  return (
    <section id={testimonials.id} aria-labelledby={titleId} className="section-y">
      <Container>
        <SectionHeading
          id={titleId}
          eyebrow={testimonials.eyebrow}
          title={testimonials.title}
          align="center"
        />

        <ul className="mx-auto mt-12 grid max-w-2xl gap-5 lg:mt-16 lg:max-w-none lg:grid-cols-3">
          {testimonials.items.map((item, i) => (
            <Reveal as="li" key={item.name} delay={i * 80} className="flex">
              <figure className="flex flex-1 flex-col gap-8 rounded-card border border-line bg-surface p-7 shadow-card">
                <span
                  aria-hidden="true"
                  className="-mb-10 font-display text-[3.5rem] leading-none font-bold text-primary/25"
                >
                  “
                </span>
                <blockquote className="flex-1 text-[1.0625rem] leading-7 text-pretty text-ink">
                  <p>{item.quote}</p>
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={cx(
                      "flex size-11 shrink-0 items-center justify-center rounded-full text-small font-semibold",
                      avatarTones[item.tone],
                    )}
                  >
                    {item.initials}
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{item.name}</span>
                    <span className="block text-small text-ink-muted">{item.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
