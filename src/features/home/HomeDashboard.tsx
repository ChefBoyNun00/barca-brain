import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { CURRENT_SEASON } from "@/config/football";
import { Countdown } from "./Countdown";
import { MatchRail } from "../matches/MatchRail";
import { HomeHero } from "./HomeHero";
import { ResultsTicker } from "./ResultsTicker";
import { displayCompetition, formatKickoff, formatUpdatedAgo } from "./format";
import { getHomeData } from "./get-home-data";
import {
  buildHeadline,
  getLastPlayedIndex,
  getNextMatchIndex,
  summariseSeason,
} from "./season-story";
import { TaleOfTheTape } from "./TaleOfTheTape";

const EXPLORE = [
  { href: "/squad", title: "Squad", note: "Every player and their season." },
  { href: "/table", title: "Table", note: "Where Barça stand in the league." },
  {
    href: "/season",
    title: "Weave the ending",
    note: "Play out the rest of the season.",
  },
  { href: "/news", title: "The press", note: "Spanish news, in English." },
  { href: "/ask", title: "Ask", note: "Questions about the season." },
] as const;

/** How many played matches, and how many to come, the home page's card row shows. */
const RAIL_PLAYED = 5;
const RAIL_UPCOMING = 4;

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
  const headline = buildHeadline(summary, standing);
  const nextIndex = getNextMatchIndex(matches, now);
  const nextMatch = matches[nextIndex];
  const lastPlayedIndex = getLastPlayedIndex(matches);
  const railStart = Math.max(0, lastPlayedIndex - RAIL_PLAYED + 1);
  const railMatches = matches.slice(railStart, nextIndex + RAIL_UPCOMING);
  const lastPlayed = matches[lastPlayedIndex];

  return (
    <>
      <ResultsTicker matches={matches} nextIndex={nextIndex} />
      <HomeHero
        season={CURRENT_SEASON}
        headline={headline}
        summary={summary}
        total={matches.length}
        standing={standing}
      />

      <section aria-labelledby="latest" className="page-gutter section reveal">
        <div className="section-head">
          <h2 id="latest" className="section-title">
            Latest &amp; next
          </h2>
          <Link href="/matches" className="chip chip-action">
            All matches →
          </Link>
        </div>
        <MatchRail matches={railMatches} focusId={lastPlayed?.id ?? null} />
      </section>

      {nextMatch && (
        <section aria-labelledby="next-up" className="poster reveal">
          <div className="page-gutter poster-inner">
            <p id="next-up" className="poster-kicker">
              Next match
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
          Explore
        </h2>
        <div className="explore">
          {EXPLORE.map(({ href, title, note }) => (
            <Link key={href} href={href} className="explore-tile">
              <span className="explore-title">{title}</span>
              <span className="explore-note">{note}</span>
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
    </>
  );
}
