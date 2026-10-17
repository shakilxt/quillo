"use client";

import { useEffect, useMemo, useState } from "react";
import type { NavLink } from "@/data/product";

/**
 * Highlights the link whose section crosses a thin band just above the middle of the
 * viewport. Sections that aren't on the page are skipped.
 */
function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        setActive(ids.find((id) => visible.has(id)) ?? null);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );

    for (const id of ids) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export function NavLinks({ links }: { links: readonly NavLink[] }) {
  const ids = useMemo(() => links.map((link) => link.href.slice(1)), [links]);
  const active = useActiveSection(ids);

  return (
    <ul className="flex items-center gap-1">
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            aria-current={active === link.href.slice(1) ? "true" : undefined}
            className="rounded-full px-3.5 py-2 text-small text-ink-muted transition-colors hover:text-ink aria-[current=true]:bg-primary-soft aria-[current=true]:text-primary motion-reduce:transition-none"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
