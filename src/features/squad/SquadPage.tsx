import { connection } from "next/server";
import { getSquadData } from "./get-squad-data";
import { SquadExplorer } from "./SquadExplorer";

/** Runs per request, so the squad always shows the latest ingested stats. */
export async function SquadPage() {
  await connection();
  const { now, squad, stories, teamGoals } = await getSquadData();
  return <SquadExplorer squad={squad} now={now} teamGoals={teamGoals} stories={stories} />;
}
