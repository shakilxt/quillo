import type { ReactNode } from "react";
import { logoStrip } from "@/data/product";
import { cx } from "@/lib/cx";
import { LogoMarquee } from "./logos/LogoMarquee";

type Company = (typeof logoStrip.companies)[number];

/*
 * Made-up wordmarks (PLAN.md §5.3), each set differently so the row reads as six brands. The
 * styles use the site's two fonts plus the system serif and mono stacks, so no extra font loads.
 * The marks are simple shapes in currentColor.
 */
const wordmarks: Record<Company, { className: string; mark?: ReactNode }> = {
  Northpine: {
    className: "font-display text-[1.375rem] font-bold tracking-[-0.03em]",
    mark: <path d="M10 2 L18 17 H2 Z M10 9 L14 17 H6 Z" fillRule="evenodd" />,
  },
  Kitebox: {
    className: "font-sans text-[1.3rem] font-semibold lowercase tracking-[-0.01em]",
    mark: <path d="M10 1 L18 10 L10 19 L2 10 Z" />,
  },
  Arcwell: {
    className: "font-serif text-[1.4rem] font-semibold italic",
  },
  Oakmere: {
    className: "font-sans text-[0.95rem] font-semibold tracking-[0.24em] uppercase",
    mark: <circle cx="10" cy="10" r="8" />,
  },
  Saltbrook: {
    className: "font-mono text-[1.1rem] font-medium tracking-[-0.04em]",
    mark: (
      <path
        d="M1 7 Q5.5 3 10 7 T19 7 M1 13 Q5.5 9 10 13 T19 13"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    ),
  },
  "Halden & Co.": {
    className: "font-serif text-[1.35rem] font-normal tracking-[0.01em]",
  },
};

function Wordmark({ name }: { name: Company }) {
  const { className, mark } = wordmarks[name];
  return (
    <span className={cx("flex items-center gap-2 leading-none whitespace-nowrap", className)}>
      {mark && (
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          focusable="false"
          className="size-[1.1em] fill-current"
        >
          {mark}
        </svg>
      )}
      {name}
    </span>
  );
}

/** Shared by both copies; each sets its own `display`. */
const listClasses =
  "flex-wrap items-center justify-center gap-x-12 gap-y-6 text-ink-subtle lg:justify-between marquee:flex-nowrap marquee:justify-start marquee:pr-12";

/** "Trusted by…" strip under the hero: soft wording and no numbers (PLAN.md §0.5, §5.3). */
export function LogoStrip() {
  return (
    <section aria-labelledby="logos-title" className="border-y border-line bg-surface/60 py-10">
      <h2
        id="logos-title"
        className="mb-7 px-5 text-center font-sans text-small font-medium text-ink-subtle"
      >
        {logoStrip.title}
      </h2>
      <div className="mx-auto max-w-site px-5 sm:px-8 lg:px-10 marquee:px-0">
        <LogoMarquee pauseLabel={logoStrip.pauseLabel}>
          <ul className={cx(listClasses, "flex")}>
            {logoStrip.companies.map((name) => (
              <li key={name}>
                <Wordmark name={name} />
              </li>
            ))}
          </ul>
          {/* The second copy makes the loop seamless; it only shows while the strip moves. */}
          <ul aria-hidden="true" className={cx(listClasses, "hidden marquee:flex")}>
            {logoStrip.companies.map((name) => (
              <li key={name}>
                <Wordmark name={name} />
              </li>
            ))}
          </ul>
        </LogoMarquee>
      </div>
    </section>
  );
}
