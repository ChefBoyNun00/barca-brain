import { connection } from "next/server";
import {
  NEWS_BOARD_LIMIT,
  NEWS_BREAKING_HOURS,
  NEWS_BREAKING_LIMIT,
  NEWS_INSIDERS_LIMIT,
  NEWS_TOP_STORIES,
} from "@/config/news";
import { Briefing } from "./Briefing";
import { BreakingStrip } from "./BreakingStrip";
import { FanPulse } from "./FanPulse";
import { FrontPage } from "./FrontPage";
import { getNewsData } from "./get-news-data";
import { Insiders } from "./Insiders";
import { NewsFeed } from "./NewsFeed";
import { isBreaking, pickHero, scoopOf, topicOf } from "./stories";
import { TransferBoard } from "./TransferBoard";
import { VideoRow } from "./VideoRow";

/** Runs per request, so it always shows the latest stored stories. */
export async function NewsPage() {
  await connection();
  const { now, stories, briefing, squad, videos, fans } = await getNewsData();

  if (stories.length === 0) {
    return <p className="section-note">The press hasn&apos;t been read yet. Check back soon.</p>;
  }

  const breaking = stories.filter((story) => isBreaking(story, now, NEWS_BREAKING_HOURS));
  const lead = pickHero(stories);
  const rest = stories.filter((story) => story !== lead);
  // Next biggest by coverage, so the side column is the day's other big stories.
  const top = [...rest]
    .sort((a, b) => b.outlets.length - a.outlets.length || b.latestAt.getTime() - a.latestAt.getTime())
    .slice(0, NEWS_TOP_STORIES);

  return (
    <>
      <BreakingStrip
        stories={(breaking.length > 0 ? breaking : stories).slice(0, NEWS_BREAKING_LIMIT)}
        live={breaking.length > 0}
      />
      {lead && <FrontPage lead={lead} top={top} squad={squad} now={now} />}
      {briefing && <Briefing briefing={briefing} now={now} />}
      <TransferBoard
        stories={stories.filter((story) => topicOf(story) === "transfers").slice(0, NEWS_BOARD_LIMIT)}
        now={now}
      />
      <Insiders
        stories={stories.filter((story) => scoopOf(story)).slice(0, NEWS_INSIDERS_LIMIT)}
        now={now}
      />
      <VideoRow videos={videos} now={now} />
      <NewsFeed stories={rest} squad={squad} now={now} />
      <FanPulse threads={fans} now={now} />
    </>
  );
}
