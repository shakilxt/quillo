import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/cx";

interface LoginPopoverProps {
  /** Unique per instance: the desktop nav and the mobile menu each have one. */
  id: string;
  label: string;
  title: string;
  body: string;
  block?: boolean;
  className?: string;
}

/**
 * "Log in" opens a small "This is a demo product" note (PLAN.md §5.1). It uses the native
 * Popover API, so Esc, clicking outside and focus return all work with no JavaScript; CSS
 * anchor positioning places it under the button (see `.login-popover` in globals.css).
 */
export function LoginPopover({ id, label, title, body, block, className }: LoginPopoverProps) {
  const anchor = `--${id}`;

  return (
    <>
      <Button
        variant={block ? "secondary" : "ghost"}
        block={block}
        popoverTarget={id}
        className={cx(block && "w-full sm:w-full", className)}
        style={{ anchorName: anchor } satisfies CSSProperties}
      >
        {label}
      </Button>
      <div
        id={id}
        popover="auto"
        aria-labelledby={`${id}-title`}
        className="login-popover rounded-card border border-line bg-surface p-4 text-small text-ink-muted shadow-float"
        style={{ positionAnchor: anchor } satisfies CSSProperties}
      >
        <p id={`${id}-title`} className="mb-1 font-semibold text-ink">
          {title}
        </p>
        <p className="font-normal">{body}</p>
      </div>
    </>
  );
}
