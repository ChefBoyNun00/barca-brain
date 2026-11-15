"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import { BARCA_CREST_URL } from "@/config/display";
import type { TextKey } from "@/i18n/dictionary";
import { useT } from "@/i18n/language";
import { Icon, type IconName } from "./Icon";
import { LanguageToggle } from "./LanguageToggle";

type Section = { href: string; label: TextKey; icon: ReactNode; also?: string[] };

const icon = (name: IconName) => <Icon name={name} className="tab-icon" />;

/** The main features, in the order fans reach for them. Add a page here to add a tab. */
const PRIMARY: Section[] = [
  { href: "/", label: "nav.home", icon: icon("home") },
  {
    href: "/news",
    label: "nav.news",
    icon: icon("news"),
  },
  {
    href: "/table",
    label: "nav.table",
    icon: icon("table"),
    also: ["/season"],
  },
  {
    href: "/matches",
    label: "nav.matches",
    icon: icon("matches"),
  },
  {
    href: "/squad",
    label: "nav.squad",
    icon: icon("shirt"),
  },
];

/** More pages. On a wide screen they sit in the top bar, on a phone behind the More tab. */
const SECONDARY: Section[] = [
  {
    href: "/stats",
    label: "nav.stats",
    icon: icon("stats"),
  },
  {
    href: "/history",
    label: "nav.history",
    icon: icon("history"),
  },
];

/** Only in the More menu on phones: the desktop top bar has no room for it. */
const EXTRA: Section[] = [
  {
    href: "/shirt",
    label: "nav.shirt",
    icon: icon("shirt"),
  },
];

const MORE_ICON = icon("more");

function isActive(pathname: string, { href, also = [] }: Section): boolean {
  if (href === "/") return pathname === "/";
  return [href, ...also].some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function NavShell({ pathname }: { pathname: string }) {
  const t = useT();
  // The menu is open for one page only, so moving to another page closes it by itself.
  const [moreOpenFor, setMoreOpenFor] = useState<string | null>(null);
  const moreOpen = moreOpenFor === pathname;
  const moreIsActive = [...SECONDARY, ...EXTRA].some((section) => isActive(pathname, section));
  return (
    <>
      <nav aria-label={t("a11y.main")} className="nav">
        <div className="nav-inner">
          <Link href="/" className="brand">
            <Image src={BARCA_CREST_URL} alt="" width={28} height={28} unoptimized />
            <span className="brand-name">Barça Brain</span>
          </Link>
          <ul className="nav-links">
            {[...PRIMARY, ...SECONDARY].map((section) => (
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
          <LanguageToggle />
        </div>
      </nav>
      {/* On phones the same links sit at the bottom, where a thumb can reach them. */}
      <nav aria-label={t("a11y.tabs")} className="tabbar">
        {moreOpen && (
          <ul className="tabbar-more">
            {[...SECONDARY, ...EXTRA].map((section) => (
              <li key={section.href}>
                <Link
                  href={section.href}
                  aria-current={isActive(pathname, section) ? "page" : undefined}
                >
                  {section.icon}
                  <span>{t(section.label)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <ul>
          {PRIMARY.map((section) => (
            <li key={section.href}>
              <Link
                href={section.href}
                aria-current={isActive(pathname, section) ? "page" : undefined}
              >
                {section.icon}
                <span>{t(section.label)}</span>
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-current={moreIsActive ? "page" : undefined}
              onClick={() => setMoreOpenFor(moreOpen ? null : pathname)}
            >
              {MORE_ICON}
              <span>{t("nav.more")}</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

/** Reads the current page, so the active tab lights up. */
function ActiveNav() {
  return <NavShell pathname={usePathname()} />;
}

/**
 * The address is only known at request time on pages like /matches/[id], so it loads inside
 * Suspense. Until it does, the nav shows with no tab lit, so it is never missing.
 */
export function SiteNav() {
  return (
    <Suspense fallback={<NavShell pathname="" />}>
      <ActiveNav />
    </Suspense>
  );
}
