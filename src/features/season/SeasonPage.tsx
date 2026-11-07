import { connection } from "next/server";
import { SeasonEnding } from "../home/SeasonEnding";
import { getSeasonData } from "./get-season-data";

/** Runs per request, so the what-if always starts from the latest table. */
export async function SeasonPage() {
  await connection();
  const { matches, table } = await getSeasonData();

  if (matches.length === 0 || table.length === 0) {
    return (
      <section className="page-gutter section">
        <h1 className="section-title">Weave the ending</h1>
        <p className="section-note">This will appear after the next daily update.</p>
      </section>
    );
  }
  return <SeasonEnding matches={matches} table={table} />;
}
