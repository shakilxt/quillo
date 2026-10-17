import { cx } from "@/lib/cx";
import { NIB_PATH, NIB_VIEWBOX } from "@/lib/logo";

interface LogoMarkProps {
  /** Size and colour, e.g. `h-8 w-5 fill-primary`. */
  className: string;
}

/**
 * The Quillo mark: a pen nib (lib/logo.ts). Decorative, so the wordmark (or the link around it)
 * carries the name. The hole and slit are cut out, so it works on any background.
 */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg viewBox={NIB_VIEWBOX} aria-hidden="true" focusable="false" className={className}>
      <path fillRule="evenodd" d={NIB_PATH} />
    </svg>
  );
}

interface LogoProps {
  name: string;
  className?: string;
}

export function Logo({ name, className }: LogoProps) {
  return (
    <span className={cx("inline-flex items-center gap-2", className)}>
      <LogoMark className="h-8 w-5 fill-primary" />
      <span className="font-display text-[1.375rem] leading-none font-bold tracking-[-0.02em] text-ink">
        {name}
      </span>
    </span>
  );
}
