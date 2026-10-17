import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faq } from "@/data/product";
import { AskAssistantButton } from "./faq/AskAssistantButton";

const titleId = `${faq.id}-title`;

/**
 * FAQ (PLAN.md §5.9): the heading and the way to the chat on the left, the questions on the right.
 * Native <details>, so it opens by keyboard, works without JS and find-in-page reaches the answers.
 */
export function Faq() {
  return (
    <section id={faq.id} aria-labelledby={titleId} className="border-t border-line section-y">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div className="flex flex-col items-start gap-8 lg:sticky lg:top-28 lg:self-start">
          <SectionHeading id={titleId} eyebrow={faq.eyebrow} title={faq.title} />
          <div className="flex flex-col items-start gap-4 rounded-card bg-primary-soft p-6">
            <p className="text-lead text-ink">{faq.askPrompt}</p>
            <AskAssistantButton label={faq.askAction} />
          </div>
        </div>

        <Reveal>
          <ul className="flex flex-col gap-3">
            {faq.items.map((item) => (
              <li key={item.question}>
                <details className="faq-item group rounded-card border border-line bg-surface transition-shadow open:shadow-card motion-reduce:transition-none">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 rounded-card px-5 py-4 font-display text-[1.0625rem] leading-6 font-semibold text-ink sm:px-6 sm:py-5 sm:text-[1.125rem] sm:leading-7 [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-ink transition-colors group-open:border-primary group-open:bg-primary group-open:text-white">
                      <ChevronDown
                        aria-hidden="true"
                        className="size-4 transition-transform duration-300 ease-out-soft group-open:rotate-180 motion-reduce:transition-none"
                        strokeWidth={2.25}
                      />
                    </span>
                  </summary>
                  <p className="px-5 pb-5 text-pretty sm:px-6 sm:pb-6">{item.answer}</p>
                </details>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
