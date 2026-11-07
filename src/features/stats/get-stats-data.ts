import { getSeasonData } from "../season/get-season-data";
import { getSquadData } from "../squad/get-squad-data";

export async function getStatsData() {
  const [{ matches, table }, { squad }] = await Promise.all([getSeasonData(), getSquadData()]);
  return { matches, squad, barca: table.find((row) => row.isBarca) ?? null };
}
