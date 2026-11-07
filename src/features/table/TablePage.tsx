import { connection } from "next/server";
import { LeagueTable } from "../home/LeagueTable";
import { getSeasonData } from "../season/get-season-data";

/** Runs per request, so the table is as fresh as the last daily update. */
export async function TablePage() {
  await connection();
  const { matches, table } = await getSeasonData();
  return <LeagueTable table={table} matches={matches} />;
}
