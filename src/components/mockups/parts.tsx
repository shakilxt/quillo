import type { LucideIcon } from "lucide-react";
import { cx } from "@/lib/cx";

/** "Bright Harbour" → "BH". Mockup clients only; testimonials carry their own initials. */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2);
}

interface ToastProps {
  icon: LucideIcon;
  iconClassName: string;
  /** Position (absolute insets) and, for the hero, the `drift` class. */
  className: string;
  children: string;
}

/** A notification card floating over a mockup's edge. */
export function Toast({ icon: Icon, iconClassName, className, children }: ToastProps) {
  return (
    <p
      className={cx(
        "absolute flex items-center gap-2.5 rounded-card border border-line bg-surface py-2 pr-4 pl-2 text-xs font-semibold whitespace-nowrap text-ink shadow-float sm:text-small",
        className,
      )}
    >
      <span
        className={cx(
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          iconClassName,
        )}
      >
        <Icon aria-hidden="true" className="size-4" strokeWidth={2.5} />
      </span>
      {children}
    </p>
  );
}
