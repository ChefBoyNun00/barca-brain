import Link from "next/link";
import { connection } from "next/server";
import { Icon, type IconName } from "@/components/Icon";
import { CURRENT_SEASON } from "@/config/football";
import type { TextKey } from "@/i18n/dictionary";
import { T } from "@/i18n/language";
import { HomeFooter } from "./HomeFooter";
import { HomeHero } from "./HomeHero";
import { getMatchdayState } from "./matchday";
import { NextMatchPoster } from "./NextMatchPoster";
import { ResultsTicker } from "./ResultsTicker";
import { SeasonSelectionProvider } from "./season-selection";
import { WovenSeason } from "./WovenSeason";
import { getHomeData } from "./get-home-data";
import { getLastPlayedIndex, getNextMatchIndex, summariseSeason } from "./season-story";

const EXPLORE = [
  { href: "/squad", title: "explore.squad", note: "explore.squadNote", icon: "shirt" },
  { href: "/table", title: "explore.table", note: "explore.tableNote", icon: "table" },
  { href: "/season", title: "explore.ending", note: "explore.endingNote", icon: "ending" },
  { href: "/news", title: "explore.press", note: "explore.pressNote", icon: "news" },
  { href: "/stats", title: "explore.stats", note: "explore.statsNote", icon: "stats" },
  { href: "/history", title: "explore.history", note: "explore.historyNote", icon: "history" },
  { href: "/shirt", title: "explore.shirt", note: "explore.shirtNote", icon: "shirt" },
  { href: "/ask", title: "explore.ask", note: "explore.askNote", icon: "ask" },
] as const satisfies readonly { href: string; title: TextKey; note: TextKey; icon: IconName }[];

/** Runs per request, so the page always reads the latest ingested data. */
export async function HomeDashboard() {
  await connection();
  const { now, matches, standing, table, lastUpdatedAt } = await getHomeData();

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

  const summary = summariseSeason(matches);
  const nextIndex = getNextMatchIndex(matches, now);
  const nextMatch = matches[nextIndex];
  const lastPlayedIndex = getLastPlayedIndex(matches);
  return (
    <SeasonSelectionProvider initialIndex={Math.max(lastPlayedIndex, 0)}>
      <ResultsTicker matches={matches} nextIndex={nextIndex} />
      <HomeHero
        season={CURRENT_SEASON}
        summary={summary}
        total={matches.length}
        standing={standing}
        matchday={getMatchdayState(matches, now)}
        now={now}
      />

      <WovenSeason matches={matches} lastPlayedIndex={lastPlayedIndex} nextIndex={nextIndex} />
      <div className="page-gutter season-more">
        <Link href="/matches" className="chip chip-action">
          <T k="home.cards" />
        </Link>
      </div>

      {nextMatch && (
        <NextMatchPoster match={nextMatch} matches={matches} table={table} now={now} />
      )}

      <nav aria-labelledby="explore" className="page-gutter section reveal">
        <h2 id="explore" className="section-title">
          <T k="home.explore" />
        </h2>
        <div className="explore">
          {EXPLORE.map(({ href, title, note, icon }) => (
            <Link key={href} href={href} className="explore-tile">
              <span className="explore-icon">
                <Icon name={icon} />
              </span>
              <span className="explore-title">
                <T k={title} />
              </span>
              <span className="explore-note">
                <T k={note} />
              </span>
              <Icon name="arrow" className="icon explore-go" />
            </Link>
          ))}
        </div>
      </nav>

      <HomeFooter lastUpdatedAt={lastUpdatedAt} now={now} />
    </SeasonSelectionProvider>
  );
}
