import { connection } from "next/server";
import { Briefing } from "./Briefing";
import { getNewsData } from "./get-news-data";
import { NewsFeed } from "./NewsFeed";

/** Runs per request, so it always shows the latest stored stories. */
export async function NewsPage() {
  await connection();
  const { now, stories, briefing, squad } = await getNewsData();

  if (stories.length === 0) {
    return <p className="section-note">The press hasn&apos;t been read yet. Check back soon.</p>;
  }

  return (
    <>
      {briefing && <Briefing briefing={briefing} now={now} />}
      <NewsFeed stories={stories} squad={squad} now={now} />
    </>
  );
}
