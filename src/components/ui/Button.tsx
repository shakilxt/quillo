import type { ComponentPropsWithoutRef, MouseEventHandler, ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * `primary` and `secondary` sit on paper; `ghost` is the quiet nav action;
 * `inverse` and `outline-inverse` sit on the dark ink sections.
 */
type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse" | "outline-inverse";
type ButtonSize = "md" | "lg";

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretches to the container width below the `sm` breakpoint. */
  block?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-full border font-sans font-semibold whitespace-nowrap transition duration-200 ease-out-soft hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

const variants: Record<ButtonVariant, string> = {
  primary: "border-primary bg-primary text-white hover:border-primary-hover hover:bg-primary-hover",
  secondary: "border-line bg-surface text-ink hover:border-ink-faint",
  ghost: "border-transparent bg-transparent text-ink hover:bg-ink/5",
  inverse:
    "border-paper bg-paper text-ink hover:border-mint hover:bg-mint focus-visible:outline-mint",
  "outline-inverse":
    "border-paper/40 bg-transparent text-paper hover:border-paper focus-visible:outline-mint",
};

const sizes: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 text-small",
  lg: "min-h-13 px-7 text-body",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  block = false,
}: ButtonStyleProps = {}) {
  return cx(base, variants[variant], sizes[size], block && "w-full sm:w-auto");
}

type ButtonProps = ButtonStyleProps & ComponentPropsWithoutRef<"button">;

export function Button({
  variant,
  size,
  block,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(buttonClasses({ variant, size, block }), className)}
      {...props}
    />
  );
}

interface ButtonLinkProps extends ButtonStyleProps {
  /** In-page anchors only: the site is one page and links nowhere else (PLAN.md §0.6). */
  href: `#${string}`;
  children: ReactNode;
  className?: string;
  /** Client components only, e.g. to close the mobile menu before the page scrolls. */
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export function ButtonLink({
  href,
  variant,
  size,
  block,
  className,
  onClick,
  children,
}: ButtonLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cx(buttonClasses({ variant, size, block }), className)}
    >
      {children}
    </a>
  );
}
