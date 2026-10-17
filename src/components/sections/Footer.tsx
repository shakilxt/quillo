import { ArrowUp } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { EmailForm } from "@/components/ui/EmailForm";
import { Logo } from "@/components/ui/Logo";
import { SocialGlyphs } from "@/components/ui/SocialGlyphs";
import { brand, footer } from "@/data/product";
import { cx } from "@/lib/cx";

const linkClasses =
  "rounded-xs font-semibold text-ink transition-colors hover:text-primary motion-reduce:transition-none";
const columnTitle = "font-sans text-eyebrow text-ink-subtle uppercase";

/**
 * Footer (PLAN.md §5.11), light after the ink CTA: the brand, three link columns and a demo
 * newsletter form, then a bottom bar. Every link stays on this page; the Company and Legal
 * entries are plain text, and the social icons link nowhere (§0.6).
 */
export function Footer() {
  return (
    <footer className="bg-surface text-ink-muted">
      <Container className="grid gap-12 py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)_minmax(0,1.3fr)] lg:gap-10 lg:py-20">
        <div className="flex flex-col items-start gap-5">
          <a href="#top" className="rounded-field">
            <Logo name={brand.name} />
          </a>
          <p className="max-w-xs text-pretty">{footer.about}</p>
          <SocialGlyphs className="mt-1 flex gap-2" />
        </div>

        <nav aria-label={footer.navLabel} className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {footer.columns.map((column) => (
            <div key={column.title}>
              <h2 className={columnTitle}>{column.title}</h2>
              <ul className="mt-5 flex flex-col gap-3">
                {column.items.map((item) => (
                  <li key={item.label}>
                    {"href" in item ? (
                      <a href={item.href} className={linkClasses}>
                        {item.label}
                      </a>
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div>
          <h2 className={columnTitle}>{footer.newsletter.title}</h2>
          <p className="mt-5 font-semibold text-pretty text-ink">{footer.newsletter.intro}</p>
          <EmailForm copy={footer.newsletter.form} className="mt-4" />
        </div>
      </Container>

      <div className="border-t border-line bg-paper">
        {/*
          Stacked on small screens, with room below for the fixed "Ask Quillo" button; in one row
          from md, where Back to top keeps clear of the button instead.
        */}
        <Container className="flex flex-col gap-3 pt-5 pb-24 text-small md:flex-row md:items-center md:justify-between md:pb-5">
          <p className="font-semibold text-ink">{footer.copyright}</p>
          <a
            href="#top"
            className={cx(linkClasses, "inline-flex shrink-0 items-center gap-1.5 md:mr-44")}
          >
            {footer.backToTop}
            <ArrowUp aria-hidden="true" className="size-4" />
          </a>
        </Container>
      </div>
    </footer>
  );
}
