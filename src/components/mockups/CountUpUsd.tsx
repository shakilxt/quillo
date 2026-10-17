import type { CSSProperties } from "react";
import { formatUsd } from "@/lib/money";

/**
 * Counts a whole-dollar amount up from zero once, in pure CSS (`.count-up` in globals.css),
 * so there's no JavaScript and no flash when the page hydrates.
 *
 * The real figure is always in the DOM for screen readers, search and copy-paste. The animation
 * is an overlay of CSS counters that ends on the same text, so it only runs for amounts it can
 * show exactly: whole dollars under $1,000,000 (one thousands separator).
 */
export function CountUpUsd({ cents }: { cents: number }) {
  const text = formatUsd(cents);
  const dollars = cents / 100;
  if (!Number.isInteger(dollars) || dollars < 1_000 || dollars >= 1_000_000) return text;

  const style = {
    "--count-thousands": Math.floor(dollars / 1_000),
    "--count-units": dollars % 1_000,
  } as CSSProperties;

  return (
    <span className="count-up" style={style}>
      <span className="count-up-value">{text}</span>
    </span>
  );
}
