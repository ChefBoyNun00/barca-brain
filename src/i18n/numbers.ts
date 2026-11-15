import { isRtl, type Language } from "./dictionary";

/** Unicode "left-to-right isolate" and "pop directional isolate": invisible on screen. */
const LTR_START = "⁦";
const LTR_END = "⁩";

const goals = (value: number | null) => (value === null ? "–" : String(value));

/**
 * A score with the first team's goals where the reader starts: on the left in English, on the
 * right in Hebrew. Hebrew sports writing reads a score from the right, so a 3–1 Barça win is
 * written 1–3 ("ניצחה 1:3"). Pass Barça's goals first in a sentence about Barça, and the home
 * side's first on a scoreboard (the home side also sits on the reading-start side).
 */
export function formatScore(language: Language, first: number | null, second: number | null): string {
  return isRtl(language)
    ? `${LTR_START}${goals(second)}–${goals(first)}${LTR_END}`
    : `${goals(first)}–${goals(second)}`;
}

/**
 * +12 or -3. Kept left to right in every language, so a Hebrew page shows +12 and not 12+.
 * The marks are invisible, so English text is unchanged on screen.
 */
export function formatSigned(value: number): string {
  return `${LTR_START}${value > 0 ? `+${value}` : String(value)}${LTR_END}`;
}
