"use client";

import { useEffect } from "react";
import { useLanguage } from "@/i18n/language";

/**
 * The server always sends English, because the language choice lives in this browser. For a
 * Hebrew reader the script in the layout hides the page until it has switched, so they never
 * see English laid out right to left. This shows the page once the switch has happened.
 */
export function LanguageReady() {
  const language = useLanguage();
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.langPending === language) delete root.dataset.langPending;
  }, [language]);
  return null;
}
