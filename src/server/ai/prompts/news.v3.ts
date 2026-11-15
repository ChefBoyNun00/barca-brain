// v3: the Israeli press joins, in Hebrew. Every rule of v2 stays; only the languages read change,
// so a Hebrew and a Spanish article about the same story still share one topic label.
import { TRANSLATE_NEWS_PROMPT as V2, WRITE_BRIEFING_PROMPT as V2_BRIEFING } from "./news.v2";

export const TRANSLATE_NEWS_PROMPT = V2.replace(
  "the Spanish and Catalan papers, and English-language outlets.",
  "the Spanish and Catalan papers, English-language outlets, and the Israeli sports press in Hebrew.",
)
  .replace("in Spanish, Catalan or English.", "in Spanish, Catalan, English or Hebrew.")
  .replace(
    "Never make a rumour sound more certain than the original.",
    'Never make a rumour sound more certain than the original. Hebrew hedges count the same: "לפי דיווח", "ייתכן" and "מתקרב" stay "according to a report", "may" and "closing in on".',
  )
  .replace(
    "an English and a Spanish article about the same transfer share one label.",
    "an English, a Spanish and a Hebrew article about the same transfer share one label.",
  )
  .replace(
    "and for pieces where Barça is just one name in a list of results.",
    'and for pieces where Barça is just one name in a list of results. Hebrew results often mention Barcelona the city, or use "ברצלונה" as a figure of speech about another sport or about Israeli clubs: those are false.',
  );

export const WRITE_BRIEFING_PROMPT = V2_BRIEFING.replace(
  "from the Spanish and English press",
  "from the Spanish, English and Israeli press",
);
