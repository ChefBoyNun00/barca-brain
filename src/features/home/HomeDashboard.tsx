import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { CURRENT_SEASON } from "@/config/football";
import type { TextKey } from "@/i18n/dictionary";
import { T } from "@/i18n/language";
import { Countdown } from "./Countdown";
import { HomeHero } from "./HomeHero";
import { getMatchdayState } from "./matchday";
import { ResultsTicker } from "./ResultsTicker";
import { SeasonSelectionProvider } from "./season-selection";
import { WovenSeason } from "./WovenSeason";
import { displayCompetition, formatKickoff, formatUpdatedAgo } from "./format";
import { getHomeData } from "./get-home-data";
import { getLastPlayedIndex, getNextMatchIndex, summariseSeason } from "./season-story";
import { TaleOfTheTape } from "./TaleOfTheTape";

const EXPLORE = [
  { href: "/squad", title: "explore.squad", note: "explore.squadNote" },
  { href: "/table", title: "explore.table", note: "explore.tableNote" },
  { href: "/season", title: "explore.ending", note: "explore.endingNote" },
  { href: "/news", title: "explore.press", note: "explore.pressNote" },
  { href: "/shirt", title: "explore.shirt", note: "explore.shirtNote" },
  { href: "/ask", title: "explore.ask", note: "explore.askNote" },
] as const satisfies readonly { href: string; title: TextKey; note: TextKey }[];

/** Runs per request, so the page always reads the latest ingested data. */
export async function HomeDashboard() {
  await connection();
  const { now, matches, standing, table, lastUpdatedAt } = await getHomeData();

  if (matches.length === 0) {
    return (
      <section className="page-gutter py-24 text-center">
        <h1 className="display-title">The shirt isn&apos;t woven yet</h1>
        <p className="mt-4">Matches will appear here after the next daily update.</p>
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
        <section aria-labelledby="next-up" className="poster reveal">
          <div className="page-gutter poster-inner">
            <p id="next-up" className="poster-kicker">
              <T k="home.nextMatch" />
            </p>
            <div className="poster-teams">
              {nextMatch.opponent?.logoUrl && (
                <Image src={nextMatch.opponent.logoUrl} alt="" width={96} height={96} unoptimized />
              )}
              <p className="poster-opponent">{nextMatch.opponent?.name ?? "To be decided"}</p>
            </div>
            <p className="poster-meta">
              {nextMatch.isHome ? "At home" : "Away"} ·{" "}
              {[displayCompetition(nextMatch.competition), nextMatch.round]
                .filter(Boolean)
                .join(" · ")}{" "}
              · {formatKickoff(nextMatch.kickoffAt)}
            </p>
            <Countdown kickoffAt={nextMatch.kickoffAt} serverNow={now} />
            <TaleOfTheTape table={table} matches={matches} opponentId={nextMatch.opponent?.id} />
            <Link
              className="poster-ask"
              href={{
                pathname: "/ask",
                query: { q: "Preview the next match for me" },
              }}
            >
              Ask Blaugrana for a preview →
            </Link>
          </div>
        </section>
      )}

      <nav aria-labelledby="explore" className="page-gutter section reveal">
        <h2 id="explore" className="section-title">
          <T k="home.explore" />
        </h2>
        <div className="explore">
          {EXPLORE.map(({ href, title, note }) => (
            <Link key={href} href={href} className="explore-tile">
              <span className="explore-title">
                <T k={title} />
              </span>
              <span className="explore-note">
                <T k={note} />
              </span>
            </Link>
          ))}
        </div>
      </nav>

      <footer className="page-gutter pb-12 text-center text-sm">
        {lastUpdatedAt && `${formatUpdatedAgo(lastUpdatedAt, now)}. `}Scores can lag behind real
        time.
        <br />
        Unofficial fan project, not affiliated with FC Barcelona.{" "}
        <a href="/calendar.ics" className="footer-link">
          Add fixtures to your calendar
        </a>{" "}
        ·{" "}
        <Link href="/credits" className="footer-link">
          Credits
        </Link>
      </footer>
    </SeasonSelectionProvider>
  );
}
