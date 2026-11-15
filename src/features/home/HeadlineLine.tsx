"use client";

import type { TextKey, TextVars } from "@/i18n/dictionary";
import { useLanguage, useT } from "@/i18n/language";
import { displayCompetition } from "./format";

/**
 * One line of the home headline. The league arrives as the provider names it ("Primera Division")
 * and is written here in the visitor's language: La Liga in English, לה ליגה in Hebrew.
 */
export function HeadlineLine({ k, vars, competition }: { k: TextKey; vars: TextVars; competition?: string }) {
  const t = useT();
  const language = useLanguage();
  const league = competition ? displayCompetition(competition, language) : undefined;
  return <>{t(k, league ? { ...vars, league } : vars)}</>;
}
