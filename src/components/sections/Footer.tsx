import { ArrowUp } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { SocialGlyphs } from "@/components/ui/SocialGlyphs";
import { brand, footer } from "@/data/product";
import { cx } from "@/lib/cx";

const linkClasses =
  "rounded-xs text-paper/75 transition-colors hover:text-paper motion-reduce:transition-none";

/**
 * Footer (PLAN.md §5.11), carrying on in ink from the final CTA. Every link stays on this page;
 * the Company and Legal entries are plain text, and the social icons link nowhere (§0.6).
 */
export function Footer() {
  return (
    <footer className="border-t border-paper/10 bg-ink text-paper/75 [&_:focus-visible]:outline-mint">
      <Container className="grid gap-12 py-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)] lg:py-20">
        <div className="flex flex-col items-start gap-5">
          <a href="#top" className="rounded-field">
            <Logo name={brand.name} tone="dark" />
          </a>
          <p className="max-w-xs text-pretty">{brand.tagline}</p>
          <SocialGlyphs className="mt-1 flex gap-2" />
        </div>

        <nav aria-label={footer.navLabel} className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {footer.columns.map((column) => (
            <div key={column.title}>
              <h2 className="font-sans text-eyebrow text-paper uppercase">{column.title}</h2>
              <ul className="mt-5 flex flex-col gap-3">
                {column.items.map((item) => (
                  <li key={item.label}>
                    {"href" in item ? (
                      <a href={item.href} className={linkClasses}>
                        {item.label}
                      </a>
                    ) : (
                      <span className="text-paper/60">{item.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </Container>

      <div className="border-t border-paper/10">
        {/* The extra bottom padding keeps this row clear of the fixed "Ask Quillo" button. */}
        <Container className="flex flex-col gap-4 pt-8 pb-24 text-small sm:flex-row sm:items-center sm:justify-between">
          <p>{footer.copyright}</p>
          <a href="#top" className={cx(linkClasses, "inline-flex shrink-0 items-center gap-1.5")}>
            {footer.backToTop}
            <ArrowUp aria-hidden="true" className="size-4" />
          </a>
        </Container>
      </div>
    </footer>
  );
}
