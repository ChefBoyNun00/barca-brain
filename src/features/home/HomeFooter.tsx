"use client";

import { useLanguage, useT } from "@/i18n/language";
import { formatUpdatedAgo } from "./format";

/** How fresh the data is. The fan-project note and links now sit in the site footer on every page. */
export function HomeFooter({ lastUpdatedAt, now }: { lastUpdatedAt: Date | null; now: Date }) {
  const t = useT();
  const language = useLanguage();
  return (
    <p className="page-gutter home-fresh">
      {lastUpdatedAt && `${formatUpdatedAgo(lastUpdatedAt, now, language)}. `}
      {t("footer.lag")}
    </p>
  );
}
