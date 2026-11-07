import { connection } from "next/server";
import { getSeasonData } from "../season/get-season-data";
import { getNextMatchIndex } from "../home/season-story";
import { MatchBoard } from "./MatchBoard";

/** Runs per request, so results and the next match are always current. */
export async function MatchesPage() {
  await connection();
  const { matches } = await getSeasonData();
  if (matches.length === 0) {
    return (
      <section className="page-gutter section">
        <h1 className="section-title">Matches</h1>
        <p className="section-note">Matches will appear after the next daily update.</p>
      </section>
    );
  }
  const next = matches[getNextMatchIndex(matches, new Date())];
  return (
    <section className="page-gutter section">
      <h1 className="section-title">Matches</h1>
      <p className="section-note">Every game of the season, results and fixtures.</p>
      <MatchBoard matches={matches} nextMatchId={next?.id ?? null} />
    </section>
  );
}
