import { DashboardMockup } from "@/components/mockups/DashboardMockup";
import { Container } from "@/components/ui/Container";
import { EmailForm } from "@/components/ui/EmailForm";
import { emailForm, hero } from "@/data/product";

/** Hero (PLAN.md §5.2): text and sign-up on the left, the live dashboard mockup on the right. */
export function Hero() {
  return (
    // Pulled up under the sticky nav (h-18) so the dot grid runs behind it.
    <section aria-labelledby="hero-title" className="relative isolate -mt-18 overflow-x-clip pt-18">
      <div aria-hidden="true" className="hero-dots absolute inset-0 -z-10" />

      <Container className="grid items-center gap-16 pt-10 pb-20 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14 lg:pt-20 lg:pb-28">
        <div className="flex flex-col items-start gap-6">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface py-1 pr-4 pl-1 text-small text-ink shadow-card">
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs/5 font-semibold text-white">
              {hero.badge.tag}
            </span>
            <span className="sr-only">: </span>
            {hero.badge.text}
          </p>

          <h1 id="hero-title" className="text-display text-balance">
            {hero.headline.before}
            <span className="relative whitespace-nowrap">
              {hero.headline.highlight}
              <Swash />
            </span>
            {hero.headline.after}
          </h1>

          <p className="max-w-xl text-lead text-pretty">{hero.lead}</p>

          <EmailForm copy={emailForm} className="mt-2 w-full max-w-md" />
        </div>

        <DashboardMockup
          label={hero.mockupLabel}
          className="mx-auto w-full max-w-xl lg:max-w-none"
        />
      </Container>
    </section>
  );
}

/** The mint underline under "paid on time": one loose, hand-drawn stroke behind the text. */
function Swash() {
  return (
    <svg
      viewBox="0 0 300 24"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className="swash absolute inset-x-[-0.06em] bottom-[-0.02em] -z-10 h-[0.36em] w-[calc(100%+0.12em)] overflow-visible"
    >
      <path
        d="M4 17 C 70 7, 170 4, 296 10"
        fill="none"
        className="stroke-mint"
        strokeWidth="11"
        strokeLinecap="round"
        pathLength="1"
      />
    </svg>
  );
}
