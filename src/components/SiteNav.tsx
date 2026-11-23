"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type CSSProperties } from "react";
import { BARCA_CREST_URL } from "@/config/display";
import type { TextKey } from "@/i18n/dictionary";
import { useT } from "@/i18n/language";
import { LanguageToggle } from "./LanguageToggle";

/** inBar: shown right in the header (and the phone's link row), not only in the full menu. */
type Section = { href: string; label: TextKey; also?: string[]; inBar?: boolean };

/** Every page, in the order the menu lists them. Add a page here to add it to the menu. */
const SECTIONS: Section[] = [
  { href: "/", label: "nav.home", inBar: true },
  { href: "/news", label: "nav.news", inBar: true },
  { href: "/matches", label: "nav.matches", inBar: true },
  { href: "/table", label: "nav.table", also: ["/season"], inBar: true },
  { href: "/squad", label: "nav.squad", inBar: true },
  { href: "/club", label: "nav.club", inBar: true },
  { href: "/ask", label: "nav.ask" },
];

const MENU_ID = "site-menu";

function isActive(pathname: string, { href, also = [] }: Section): boolean {
  if (href === "/") return pathname === "/";
  return [href, ...also].some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function NavShell({ pathname }: { pathname: string }) {
  const t = useT();
  // The menu belongs to one page, so arriving on another page closes it by itself.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const links = useRef<HTMLElement>(null);

  // On a phone the links are a sideways row: bring the current page's link into view.
  useEffect(() => {
    const row = links.current;
    const current = row?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!row || !current || row.scrollWidth <= row.clientWidth) return;
    const rowBox = row.getBoundingClientRect();
    const linkBox = current.getBoundingClientRect();
    row.scrollLeft += linkBox.left + linkBox.width / 2 - (rowBox.left + rowBox.width / 2);
  }, [pathname]);

  // While the menu is open: the page behind stays still, Escape closes it, and focus moves in.
  useEffect(() => {
    if (!open) return;
    const button = toggle.current;
    document.documentElement.dataset.menuOpen = "";
    menu.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenFor(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      delete document.documentElement.dataset.menuOpen;
      window.removeEventListener("keydown", onKey);
      button?.focus();
    };
  }, [open]);

  return (
    <>
      <header className="hdr" data-open={open || undefined}>
        <div className="hdr-inner">
          <Link href="/" className="hdr-brand" aria-label="Barça Brain">
            <Image src={BARCA_CREST_URL} alt="" width={30} height={30} unoptimized />
            <span className="hdr-name">Barça Brain</span>
          </Link>
          <nav ref={links} aria-label={t("a11y.main")} className="hdr-links">
            <ul>
              {SECTIONS.filter((section) => section.inBar).map((section) => (
                <li key={section.href}>
                  <Link
                    href={section.href}
                    aria-current={isActive(pathname, section) ? "page" : undefined}
                  >
                    {t(section.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="hdr-lang">
            <LanguageToggle />
          </div>
          <button
            ref={toggle}
            type="button"
            className="hdr-menu"
            aria-expanded={open}
            aria-controls={MENU_ID}
            onClick={() => setOpenFor(open ? null : pathname)}
          >
            <span className="hdr-menu-word">{t(open ? "nav.close" : "nav.more")}</span>
            <span aria-hidden="true" className="hdr-menu-lines">
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      <div
        ref={menu}
        id={MENU_ID}
        className="menu"
        data-open={open || undefined}
        role="dialog"
        aria-modal="true"
        aria-label={t("a11y.allPages")}
        // inert, not hidden: hidden would cut the closing animation off. CSS hides it after.
        inert={!open}
      >
        <nav aria-label={t("a11y.allPages")} className="menu-inner">
          <ol className="menu-links">
            {SECTIONS.map((section, index) => (
              <li key={section.href} style={{ "--i": index } as CSSProperties}>
                <Link
                  href={section.href}
                  aria-current={isActive(pathname, section) ? "page" : undefined}
                  onClick={() => setOpenFor(null)}
                >
                  <span className="menu-num">{String(index + 1).padStart(2, "0")}</span>
                  <span className="menu-word">{t(section.label)}</span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="menu-foot">
            <p className="menu-motto">Més que un club</p>
            <LanguageToggle />
          </div>
        </nav>
      </div>
    </>
  );
}

/** Reads the current page, so the menu can mark where you are. */
function ActiveNav() {
  return <NavShell pathname={usePathname()} />;
}

/**
 * The address is only known at request time on pages like /matches/[id], so it loads inside
 * Suspense. Until it does, the header shows with nothing marked, so it is never missing.
 */
export function SiteNav() {
  return (
    <Suspense fallback={<NavShell pathname="" />}>
      <ActiveNav />
    </Suspense>
  );
}
