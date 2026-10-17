"use client";

import { useEffect } from "react";

/**
 * Mounted once on the page. Marks each `<Reveal>` with `data-revealed` as it enters the viewport,
 * then stops watching it, so every element animates once.
 */
export function RevealObserver() {
  useEffect(() => {
    const targets = document.querySelectorAll("[data-reveal]:not([data-revealed])");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        }
      },
      // Start a little before the element's top edge clears the bottom of the screen.
      { rootMargin: "0px 0px -8% 0px" },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return null;
}
