import { cx } from "@/lib/cx";

interface LogoMarkProps {
  className?: string;
}

/**
 * The Quillo mark: a "Q" whose tail is a quill nib, on a teal tile. Decorative, so the
 * wordmark (or the link around it) carries the name. Also the source for icon.svg (Phase 7).
 */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={cx("size-8", className)}
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <circle cx="15" cy="15" r="7.25" fill="none" stroke="white" strokeWidth="3" />
      {/* The nib: a slim leaf shape running out of the bowl, with a slit down the middle. */}
      <path d="M17.6 17.6 L25.5 25.5 L22.4 19.6 Z" fill="white" />
      <path
        d="M17 17 L25.5 25.5"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

interface LogoProps {
  name: string;
  className?: string;
  /** `dark` sets the wordmark in paper for the ink footer. */
  tone?: "light" | "dark";
}

export function Logo({ name, className, tone = "light" }: LogoProps) {
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span
        className={cx(
          "font-display text-[1.375rem] leading-none font-bold tracking-[-0.02em]",
          tone === "dark" ? "text-paper" : "text-ink",
        )}
      >
        {name}
      </span>
    </span>
  );
}
