import { connection } from "next/server";
import { getHomeData } from "@/features/home/get-home-data";
import {
  buildHeadlineParts,
  getNextMatchIndex,
  summariseSeason,
} from "@/features/home/season-story";
import { TonightView, type TonightMatch } from "./TonightView";

/**
 * Chapter seven reads this season from our own database, so the story ends on what is true
 * tonight. Runs per request, like the home page.
 */
export async function ClubNow() {
  await connection();
  let data: Awaited<ReturnType<typeof getHomeData>>;
  try {
    data = await getHomeData();
  } catch (error) {
    // The story is the point of this page; a database hiccup should not take it down with it.
    console.error("club: could not load the season for chapter seven", error);
    return <TonightView headline={[]} next={null} />;
  }
  const { now, matches, standing } = data;
  if (matches.length === 0) return <TonightView headline={[]} next={null} />;

  const summary = summariseSeason(matches);
  const upcoming = matches[getNextMatchIndex(matches, now)];
  const next: TonightMatch | null =
    upcoming && upcoming.status !== "finished" && upcoming.opponent
      ? {
          opponent: upcoming.opponent.name,
          logoUrl: upcoming.opponent.logoUrl,
          kickoffAt: upcoming.kickoffAt,
          isHome: upcoming.isHome,
          competition: upcoming.competition,
        }
      : null;

  return <TonightView headline={buildHeadlineParts(summary, standing)} next={next} />;
}
