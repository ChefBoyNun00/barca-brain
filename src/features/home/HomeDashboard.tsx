import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { CURRENT_SEASON } from "@/config/football";
import { HOME_STORIES_LIMIT } from "@/config/news";
import { Briefing } from "../news/Briefing";
import { groupStories } from "../news/stories";
import { StoryCard } from "../news/StoryCard";
import { SquadExplorer } from "../squad/SquadExplorer";
import { Countdown } from "./Countdown";
import { displayCompetition, formatKickoff, formatSeason, formatUpdatedAgo } from "./format";
import { getHomeData } from "./get-home-data";
import { LeagueTable } from "./LeagueTable";
import { SeasonEnding } from "./SeasonEnding";
import { SeasonSelectionProvider } from "./season-selection";
import {
  buildFacts,
  buildHeadline,
  getLastPlayedIndex,
  getNextMatchIndex,
  summariseSeason,
} from "./season-story";
import { TaleOfTheTape } from "./TaleOfTheTape";
import { WovenSeason } from "./WovenSeason";

/** Runs per request, so the page always reads the latest ingested data. */
export async function HomeDashboard() {
  await connection();
  const { now, matches, standing, table, squad, articles, briefing, lastUpdatedAt } =
    await getHomeData();

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
  const facts = buildFacts(summary);
  const nextIndex = getNextMatchIndex(matches, now);
  const nextMatch = matches[nextIndex];
  const lastPlayedIndex = getLastPlayedIndex(matches);
  const stories = groupStories(articles);

  return (
    <SeasonSelectionProvider initialIndex={Math.max(lastPlayedIndex, 0)}>
      <header className="page-gutter pt-10 pb-8 sm:pt-16">
        <p className="kicker">
          Season {formatSeason(CURRENT_SEASON)} · {summary.played} of {matches.length} matches woven
        </p>
        <h1 className="display-title mt-3">
          {headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
      </header>

      <WovenSeason matches={matches} lastPlayedIndex={lastPlayedIndex} nextIndex={nextIndex} />

      {nextMatch && (
        <section aria-labelledby="next-up" className="poster reveal">
          <div className="page-gutter poster-inner">
            <p id="next-up" className="poster-kicker">
              Next stripe
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
              href={{ pathname: "/ask", query: { q: "Preview the next match for me" } }}
            >
              Ask Blaugrana for a preview →
            </Link>
          </div>
        </section>
      )}

      {stories.length > 0 && (
        <section aria-labelledby="press" className="page-gutter section reveal">
          <h2 id="press" className="section-title">
            The press, in English
          </h2>
          <p className="section-note">What Spain is saying, so you don&apos;t have to read Spanish.</p>
          {briefing && <Briefing briefing={briefing} now={now} />}
          <div className="stories">
            {stories.slice(0, HOME_STORIES_LIMIT).map((story) => (
              <StoryCard key={story.id} story={story} squad={squad} now={now} />
            ))}
          </div>
          <Link href="/news" className="chip chip-action press-more">
            All the news →
          </Link>
        </section>
      )}

      <SeasonEnding matches={matches} table={table} />

      <LeagueTable table={table} matches={matches} />

      {facts.length > 0 && (
        <section aria-labelledby="story" className="page-gutter section reveal">
          <h2 id="story" className="section-title">
            The half-time story
          </h2>
          <dl className="facts">
            {facts.map(({ figure, text }) => (
              <div key={text} className="fact">
                <dt className="fact-figure">{figure}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
          <p className="section-note">All competitions, {summary.played} matches played.</p>
        </section>
      )}

      <SquadExplorer squad={squad} now={now} teamGoals={summary.goalsFor} stories={stories} />

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
