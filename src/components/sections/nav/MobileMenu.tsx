"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import type { Anchor, NavLink } from "@/data/product";
import { LoginPopover } from "./LoginPopover";

interface MobileMenuProps {
  brandName: string;
  links: readonly NavLink[];
  cta: { label: string; href: Anchor };
  login: { label: string; popoverTitle: string; popoverBody: string };
  title: string;
  openLabel: string;
  closeLabel: string;
}

/** Matches Tailwind's `lg`, where the desktop links take over. */
const DESKTOP_QUERY = "(min-width: 64rem)";

/**
 * Full-width menu below `lg` (PLAN.md §5.1). A modal <dialog> makes the rest of the page
 * inert (focus stays inside), closes on Esc and returns focus to the menu button; the scroll
 * lock is the `html:has(.mobile-menu[open])` rule in globals.css.
 */
export function MobileMenu({
  brandName,
  links,
  cta,
  login,
  title,
  openLabel,
  closeLabel,
}: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  // Rotating a tablet to landscape can cross `lg` with the menu open: close it then.
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => {
      if (desktop.matches) dialogRef.current?.close();
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-controls="mobile-menu"
        aria-label={openLabel}
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 lg:hidden"
      >
        <Menu aria-hidden="true" className="size-6" />
      </button>

      <dialog
        ref={dialogRef}
        id="mobile-menu"
        aria-label={title}
        // A click on the dialog itself (not its contents) is a click on the backdrop.
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="mobile-menu inset-x-0 top-0 bottom-auto m-0 max-h-dvh w-full max-w-none overflow-y-auto bg-paper text-ink-muted shadow-float backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
      >
        <div className="mx-auto flex max-w-site flex-col px-5 pb-6 sm:px-8">
          <div className="flex h-18 items-center justify-between">
            <Logo name={brandName} />
            <button
              type="button"
              aria-label={closeLabel}
              onClick={close}
              className="inline-flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
            >
              <X aria-hidden="true" className="size-6" />
            </button>
          </div>

          <nav aria-label={title}>
            <ul className="flex flex-col border-t border-line">
              {links.map((link) => (
                <li key={link.href} className="border-b border-line">
                  <a
                    href={link.href}
                    onClick={close}
                    className="flex min-h-14 items-center font-display text-h3 text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-6 flex flex-col gap-3">
            <LoginPopover
              id="login-mobile"
              label={login.label}
              title={login.popoverTitle}
              body={login.popoverBody}
              block
            />
            <ButtonLink href={cta.href} onClick={close} size="lg" className="w-full">
              {cta.label}
            </ButtonLink>
          </div>
        </div>
      </dialog>
    </>
  );
}
