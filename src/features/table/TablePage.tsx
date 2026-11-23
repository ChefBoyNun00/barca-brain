import Link from "next/link";
import { connection } from "next/server";
import { SEASON_SIM_MONTHS } from "@/config/football";
import { T } from "@/i18n/language";
import { LeagueTable } from "../home/LeagueTable";
import { getSeasonData } from "../season/get-season-data";
import { SeasonInNumbers } from "../stats/SeasonInNumbers";

/** Runs per request, so the table is as fresh as the last daily update. */
export async function TablePage() {
  await connection();
  const { matches, table } = await getSeasonData();
  // The simulator is only worth offering in the run-in; earlier, too much is still open.
  const offerSimulator = SEASON_SIM_MONTHS.includes(new Date().getUTCMonth() + 1);
  return (
    <>
      <LeagueTable table={table} matches={matches} />
      {offerSimulator && (
        <div className="page-gutter mt-6">
          <Link href="/season" className="chip chip-action">
            <T k="table.playOut" /> <T k="arrow.forward" />
          </Link>
        </div>
      )}
      <SeasonInNumbers matches={matches} barca={table.find((row) => row.isBarca) ?? null} />
    </>
  );
}
