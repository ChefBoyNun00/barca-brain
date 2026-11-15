import type { TextKey } from "@/i18n/dictionary";

/**
 * Starter questions that fit the page you are looking at. Anything else gets the default set.
 * They are dictionary keys, so a Hebrew reader asks in Hebrew and gets a Hebrew answer.
 */
const BY_PAGE: { prefix: string; questions: readonly TextKey[] }[] = [
  { prefix: "/squad", questions: ["q.topScorer", "q.masia", "q.compare"] },
  { prefix: "/table", questions: ["q.rivals", "q.safe", "q.around"] },
  { prefix: "/matches", questions: ["q.bestWin", "q.behind", "q.preview"] },
  { prefix: "/news", questions: ["q.papers", "q.rumours", "q.disagree"] },
];

export function suggestionsFor(pathname: string): readonly TextKey[] | undefined {
  return BY_PAGE.find(({ prefix }) => pathname.startsWith(prefix))?.questions;
}
