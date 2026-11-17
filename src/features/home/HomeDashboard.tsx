import Link from "next/link";
import { connection } from "next/server";
import { CURRENT_SEASON } from "@/config/football";
import { HOME_NEWS_STORIES } from "@/config/news";
import { T } from "@/i18n/language";
import { PhotoBackdrop } from "@/components/PhotoBackdrop";
import { BACKDROPS } from "@/config/moments";
import { getNewsData } from "../news/get-news-data";
import { ReaderItem } from "../news/Reader";
import { orderForReader } from "../news/stories";
import { HomeFooter } from "./HomeFooter";
import { HomeHero } from "./HomeHero";
import { getMatchdayState } from "./matchday";
import { NextMatchPoster } from "./NextMatchPoster";
import { getHomeData } from "./get-home-data";
import { getNextMatchIndex, summariseSeason } from "./season-story";

/** The news is a nice-to-have on home: if it fails to load, home still shows without it. */
async function loadHeadlines(now: Date) {
  try {
    const news = await getNewsData("world");
    return { stories: orderForReader(news.world, now, HOME_NEWS_STORIES), squad: news.squad };
  } catch (error) {
    console.error("home: could not load the headlines", error);
    return null;
  }
}

/**
 * Home answers four questions and stops: where do Barça stand, when is the next match, what's
 * the news today, and what is this club. Everything else is one tap away in the header.
 * Runs per request, so the page always reads the latest ingested data.
 */
export async function HomeDashboard() {
  await connection();
  // Both at once: the headlines never hold up the scores, or the other way round.
  const [{ now, matches, standing, table, lastUpdatedAt }, headlines] = await Promise.all([
    getHomeData(),
    loadHeadlines(new Date()),
  ]);

  if (matches.length === 0) {
    return (
      <section className="page-gutter py-24 text-center">
        <h1 className="display-title">
          <T k="home.empty" />
        </h1>
        <p className="mt-4">
          <T k="home.emptyNote" />
        </p>
      </section>
    );
  }

  const nextMatch = matches[getNextMatchIndex(matches, now)];
  return (
    <>
      <HomeHero
        season={CURRENT_SEASON}
        summary={summariseSeason(matches)}
        total={matches.length}
        standing={standing}
        matchday={getMatchdayState(matches, now)}
        now={now}
      />

      {nextMatch && (
        <NextMatchPoster match={nextMatch} matches={matches} table={table} now={now} />
      )}

      {headlines && headlines.stories.length > 0 && (
        <section aria-labelledby="home-news" className="page-gutter home-news">
          <div className="home-news-head">
            <h2 id="home-news" className="section-title">
              <T k="home.newsTitle" />
            </h2>
            <Link href="/news" className="pill">
              <T k="home.allNews" />
            </Link>
          </div>
          <ol className="rd-list">
            {headlines.stories.map((story) => (
              <ReaderItem key={story.id} story={story} squad={headlines.squad} now={now} />
            ))}
          </ol>
        </section>
      )}

      {/* One quiet door into the club's story. */}
      <Link href="/club" className="motto-band" data-photo>
        <PhotoBackdrop moment={BACKDROPS.home.motto} />
        <span aria-hidden="true" className="motto-track">
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index}>
              <T k="motto.line" />
              <span className="motto-dot" />
            </span>
          ))}
        </span>
        <span className="motto-cta">
          <T k="motto.cta" /> <T k="arrow.forward" />
        </span>
      </Link>

      <HomeFooter lastUpdatedAt={lastUpdatedAt} now={now} />
    </>
  );
}
