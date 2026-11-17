"use client";

import { DISPLAY_LOCALES, DISPLAY_TIME_ZONE } from "@/config/display";
import { useLanguage } from "@/i18n/language";

/** "Tuesday 17 November", in the reader's language and Israel time, like a newspaper's dateline. */
export function TodayDate() {
  const language = useLanguage();
  const today = new Intl.DateTimeFormat(DISPLAY_LOCALES[language], {
    timeZone: DISPLAY_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  // The server and the browser can disagree around midnight; the browser's date wins quietly.
  return <span suppressHydrationWarning>{today}</span>;
}
