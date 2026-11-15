"use client";

import Image from "next/image";
import Link from "next/link";
import { BARCA_CREST_URL, CLUB_LINKS } from "@/config/display";
import type { TextKey } from "@/i18n/dictionary";
import { useT } from "@/i18n/language";
import { Icon, type IconName } from "./Icon";

/** The app's own pages, in the same order as the nav. */
const PAGES: { href: string; label: TextKey }[] = [
  { href: "/", label: "nav.home" },
  { href: "/news", label: "nav.news" },
  { href: "/matches", label: "nav.matches" },
  { href: "/table", label: "nav.table" },
  { href: "/squad", label: "nav.squad" },
  { href: "/stats", label: "nav.stats" },
  { href: "/history", label: "nav.history" },
  { href: "/shirt", label: "nav.shirt" },
  { href: "/ask", label: "nav.ask" },
];

const CLUB_LABELS: Record<(typeof CLUB_LINKS)[number]["id"], TextKey> = {
  site: "footer.site",
  tickets: "footer.tickets",
  shop: "footer.shop",
  video: "footer.video",
};

/** The foot of every page: the app's pages, the official club, and the small print. */
export function SiteFooter() {
  const t = useT();
  return (
    <footer className="site-foot">
      <div className="site-foot-inner">
        <div className="site-foot-brand">
          <Link href="/" className="brand">
            <Image src={BARCA_CREST_URL} alt="" width={36} height={36} unoptimized />
            <span>Barça Brain</span>
          </Link>
          <p className="site-foot-motto" lang="ca">
            Més que un club
          </p>
          <p>{t("footer.tagline")}</p>
        </div>

        <nav aria-labelledby="foot-pages" className="site-foot-col">
          <h2 id="foot-pages">{t("footer.pages")}</h2>
          <ul className="site-foot-pages">
            {PAGES.map(({ href, label }) => (
              <li key={href}>
                <Link href={href}>{t(label)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="foot-club" className="site-foot-col">
          <h2 id="foot-club">{t("footer.official")}</h2>
          <ul className="site-foot-club">
            {CLUB_LINKS.map(({ id, href, icon }) => (
              <li key={id}>
                <a href={href} target="_blank" rel="noopener noreferrer">
                  <Icon name={icon satisfies IconName} />
                  <span>{t(CLUB_LABELS[id])}</span>
                  <span className="sr-only">{t("footer.newTab")}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="site-foot-fine">
        <p>{t("footer.unofficial")}</p>
        <p className="site-foot-fine-links">
          <a href="/calendar.ics">
            <Icon name="calendar" />
            {t("footer.calendar")}
          </a>
          <Link href="/credits">{t("footer.credits")}</Link>
        </p>
      </div>
    </footer>
  );
}
