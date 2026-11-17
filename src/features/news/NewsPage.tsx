import { cookies } from "next/headers";
import { connection } from "next/server";
import {
  NEWS_BRIEFING_FRESH_HOURS,
  NEWS_EDITION_COOKIE,
  NEWS_FIRST_STORIES,
  NEWS_READER_LIMIT,
} from "@/config/news";
import type { NewsBriefing } from "@/domain/news";
import { T } from "@/i18n/language";
import { EditionSwitch } from "./EditionSwitch";
import { getNewsData } from "./get-news-data";
import { chooseNewsEdition } from "./news-edition";
import { PodcastRow } from "./PodcastRow";
import { InBrief, Reader } from "./Reader";
import { orderForReader } from "./stories";

type NewsPageProps = { searchParams: Promise<{ edition?: string | string[] }> };

const HOUR_MS = 3_600_000;

const isFresh = (
  briefing: NewsBriefing | null,
  now: Date,
): briefing is NewsBriefing =>
  briefing !== null &&
  now.getTime() - briefing.createdAt.getTime() <
    NEWS_BRIEFING_FRESH_HOURS * HOUR_MS;

/** Runs per request, so it always shows the latest stored stories, in the chosen edition. */
export async function NewsPage({ searchParams }: NewsPageProps) {
  await connection();
  const [{ edition: fromUrl }, jar] = await Promise.all([
    searchParams,
    cookies(),
  ]);
  const edition = chooseNewsEdition(
    fromUrl,
    jar.get(NEWS_EDITION_COOKIE)?.value,
  );
  const data = await getNewsData(edition);
  const israel = edition === "israel";
  const stories = orderForReader(
    israel ? data.israel : data.world,
    data.now,
    NEWS_READER_LIMIT,
  );

  return (
    <>
      <EditionSwitch value={edition} />
      <div className="edition" data-edition={edition}>
        {/* The briefing is written from the world's press, so it belongs to that edition. */}
        {!israel && isFresh(data.briefing, data.now) && (
          <InBrief briefing={data.briefing} />
        )}
        {stories.length > 0 ? (
          <Reader
            stories={stories}
            squad={data.squad}
            now={data.now}
            first={NEWS_FIRST_STORIES}
          />
        ) : (
          <p className="section-note">
            <T k={israel ? "edition.israelEmpty" : "news.empty"} />
          </p>
        )}
        {israel && <PodcastRow episodes={data.podcasts} now={data.now} />}
      </div>
    </>
  );
}
