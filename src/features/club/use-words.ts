"use client";

import type { Words } from "@/config/club-story";
import { useLanguage } from "@/i18n/language";

/** Picks the visitor's language out of a story text: const w = useWords(); w(STORY_COVER.title). */
export function useWords() {
  const language = useLanguage();
  return (words: Words) => words[language];
}
