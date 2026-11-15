import Link from "next/link";
import { connection } from "next/server";
import { T } from "@/i18n/language";
import { LeagueTable } from "../home/LeagueTable";
import { getSeasonData } from "../season/get-season-data";

/** Runs per request, so the table is as fresh as the last daily update. */
export async function TablePage() {
  await connection();
  const { matches, table } = await getSeasonData();
  return (
    <>
      <LeagueTable table={table} matches={matches} />
      <div className="page-gutter mt-6">
        <Link href="/season" className="chip chip-action">
          <T k="table.playOut" /> <T k="arrow.forward" />
        </Link>
      </div>
    </>
  );
}
