import { connection } from "next/server";
import { buildCalendar } from "@/features/calendar/build-calendar";
import { getAppDatabase } from "@/server/db/app-database";
import { getSeasonMatches } from "@/server/db/queries/home";
import { getCurrentTeamScope } from "@/server/db/team-scope";

export async function GET(): Promise<Response> {
  await connection();
  const matches = await getSeasonMatches(getAppDatabase(), getCurrentTeamScope());
  return new Response(buildCalendar(matches, new Date()), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="barca-fixtures.ics"',
    },
  });
}
