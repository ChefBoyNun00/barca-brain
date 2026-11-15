import type { Language } from "@/i18n/dictionary";

/**
 * Added after the main prompt when the fan reads the site in another language. Kept separate so
 * the main prompt stays identical, and cached, for every visitor.
 */
export const ASK_LANGUAGE_NOTES: Record<Language, string | null> = {
  en: null,
  he: `The fan is reading the site in Hebrew. Reply in natural, everyday Hebrew, as an Israeli football fan would say it, unless the fan writes to you in another language. When the fan pastes Spanish or Catalan, translate it into Hebrew, not English. Write player, coach and club names the way the Israeli sports press spells them in Hebrew, and add the Latin spelling in brackets the first time when it helps. Numbers, scores and dates stay as they are.`,
};
