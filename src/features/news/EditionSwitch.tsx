"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  NEWS_EDITION_COOKIE,
  NEWS_EDITION_COOKIE_DAYS,
  NEWS_EDITION_IDS,
  type NewsEdition,
} from "@/config/news";
import { Icon, IsraelFlag } from "@/components/Icon";
import type { TextKey } from "@/i18n/dictionary";
import { useT } from "@/i18n/language";

const TABS: Record<NewsEdition, { label: TextKey; note: TextKey; flag: ReactNode }> = {
  world: { label: "edition.world", note: "edition.worldNote", flag: <Icon name="globe" /> },
  israel: { label: "edition.israel", note: "edition.israelNote", flag: <IsraelFlag /> },
};

/** Saved so the news page opens on the same edition next time. Our own value, never a visitor's. */
function remember(edition: NewsEdition) {
  const maxAge = NEWS_EDITION_COOKIE_DAYS * 24 * 60 * 60;
  document.cookie = `${NEWS_EDITION_COOKIE}=${edition}; path=/; max-age=${maxAge}; samesite=lax`;
}

/** The two editions of the news, as two big tabs. */
export function EditionSwitch({ value }: { value: NewsEdition }) {
  const t = useT();
  return (
    <nav aria-label={t("edition.label")} className="edition-switch">
      {NEWS_EDITION_IDS.map((edition) => (
        <Link
          key={edition}
          href={`/news?edition=${edition}`}
          className="edition-tab"
          data-edition={edition}
          aria-current={edition === value ? "page" : undefined}
          onClick={() => remember(edition)}
          scroll={false}
        >
          <span className="edition-flag" aria-hidden="true">
            {TABS[edition].flag}
          </span>
          <span className="edition-label">{t(TABS[edition].label)}</span>
          <span className="edition-note">{t(TABS[edition].note)}</span>
        </Link>
      ))}
    </nav>
  );
}
