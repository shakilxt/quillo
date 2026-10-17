import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { brand, nav } from "@/data/product";
import { LoginPopover } from "./nav/LoginPopover";
import { MobileMenu } from "./nav/MobileMenu";
import { NavLinks } from "./nav/NavLinks";
import { ScrollAwareHeader } from "./nav/ScrollAwareHeader";

/** Sticky nav (PLAN.md §5.1). Only the scroll state, active link and mobile menu need JS. */
export function Nav() {
  return (
    <>
      <a
        href="#main"
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-full bg-ink px-5 py-3 text-small text-paper transition-transform focus-visible:translate-y-0 motion-reduce:transition-none"
      >
        {nav.skipLink}
      </a>

      <ScrollAwareHeader>
        <Container className="flex h-18 items-center justify-between gap-6">
          {/* "#top" scrolls to the top of the page with no matching element (HTML spec). */}
          <a href="#top" className="rounded-field">
            <Logo name={brand.name} />
          </a>

          <nav aria-label={nav.ariaLabel} className="hidden lg:block">
            <NavLinks links={nav.links} />
          </nav>

          <div className="flex items-center gap-2">
            {/* Wrappers carry the breakpoints: the buttons' own inline-flex would beat `hidden`. */}
            <div className="hidden lg:block">
              <LoginPopover
                id="login-desktop"
                label={nav.login.label}
                title={nav.login.popoverTitle}
                body={nav.login.popoverBody}
              />
            </div>
            <div className="hidden sm:block">
              <ButtonLink href={nav.cta.href}>{nav.cta.label}</ButtonLink>
            </div>
            <MobileMenu
              brandName={brand.name}
              links={nav.links}
              cta={nav.cta}
              login={nav.login}
              title={nav.menuTitle}
              openLabel={nav.menuOpenLabel}
              closeLabel={nav.menuCloseLabel}
            />
          </div>
        </Container>
      </ScrollAwareHeader>
    </>
  );
}
