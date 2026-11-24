"use client";

import { useT } from "@/i18n/language";

/** The landing spot SiteNav renders right after the header (so just before every page's <main>). */
export const SKIP_TARGET_ID = "content";

/**
 * The first thing a keyboard user reaches: "Skip to content". Hidden until focused. It jumps
 * past the header (logo, six links, language, menu) so the next Tab is the page's first control.
 * A plain link to a static target: it works before any script runs, and changes nothing in the DOM.
 */
export function SkipLink() {
  const t = useT();
  return (
    <a className="skip-link" href={`#${SKIP_TARGET_ID}`}>
      {t("a11y.skip")}
    </a>
  );
}
