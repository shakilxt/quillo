import type { ReactNode } from "react";

/**
 * Generic social icons for the footer (PLAN.md §5.11). lucide dropped its brand icons, so these
 * are simple line drawings in the same 24px, 2px-stroke style. They're decoration with no links.
 */
const glyphs: readonly { name: string; paths: ReactNode }[] = [
  {
    name: "instagram",
    paths: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
  },
  {
    name: "linkedin",
    paths: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M8 11v5.5M8 7.75v.01M12 16.5V11m0 2.5a2.5 2.5 0 0 1 5 0v3" />
      </>
    ),
  },
  {
    name: "x",
    paths: <path d="M4 4h4.5L20 20h-4.5ZM19.5 4l-6.4 7M4.5 20l6.4-7" />,
  },
  {
    name: "youtube",
    paths: (
      <>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="m10 9.5 4.5 2.5-4.5 2.5Z" />
      </>
    ),
  },
];

export function SocialGlyphs({ className }: { className?: string }) {
  return (
    <ul aria-hidden="true" className={className}>
      {glyphs.map((glyph) => (
        <li
          key={glyph.name}
          className="flex size-10 items-center justify-center rounded-full border border-paper/15 text-paper/60"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            focusable="false"
            className="size-4.5"
          >
            {glyph.paths}
          </svg>
        </li>
      ))}
    </ul>
  );
}
