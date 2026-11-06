import Image from "next/image";
import { connection } from "next/server";
import { CURRENT_SEASON } from "@/config/football";
import { Countdown } from "./Countdown";
import {
  displayCompetition,
  formatKickoff,
  formatOptionalStat,
  formatSeason,
  formatUpdatedAgo,
} from "./format";
import { getHomeData } from "./get-home-data";
import {
  buildFacts,
  buildHeadline,
  getLastPlayedIndex,
  getNextMatchIndex,
  summariseSeason,
} from "./season-story";
import { Tally } from "./Tally";
import { WovenSeason } from "./WovenSeason";

/** Runs per request, so the page always reads the latest ingested data. */
export async function HomeDashboard() {
  await connection();
  const { now, matches, standing, race, topScorers, lastUpdatedAt } = await getHomeData();

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
  const leaderPoints = Math.max(...race.map((team) => team.points), 0);
  const mostGoals = Math.max(...topScorers.map((scorer) => scorer.goals), 0);

  return (
    <>
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

      <WovenSeason
        matches={matches}
        lastPlayedIndex={getLastPlayedIndex(matches)}
        nextIndex={nextIndex}
      />

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
          </div>
        </section>
      )}

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

      {race.length > 0 && (
        <section aria-labelledby="race" className="page-gutter section reveal">
          <h2 id="race" className="section-title">
            The race
          </h2>
          <p className="section-note">
            {displayCompetition(standing?.competition ?? "League")}. One stripe, one point.
          </p>
          <ul className="tally-rows">
            {race.map((team) => (
              <li key={team.name}>
                <span className="tally-name" data-strong={team.isBarca}>
                  {team.name}
                </span>
                <Tally count={team.points} max={leaderPoints} muted={!team.isBarca} />
                <span className="tally-number">{team.points}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {topScorers.length > 0 && (
        <section aria-labelledby="scorers" className="page-gutter section reveal">
          <h2 id="scorers" className="section-title">
            Who&apos;s weaving
          </h2>
          <p className="section-note">League goals. One stripe, one goal.</p>
          <ul className="tally-rows">
            {topScorers.map((scorer) => (
              <li key={scorer.name}>
                <span className="tally-name" data-strong="true">
                  {scorer.name}
                </span>
                <Tally count={scorer.goals} max={mostGoals} />
                <span className="tally-number">
                  {scorer.goals}
                  <span className="tally-extra">
                    {" "}
                    · {formatOptionalStat(scorer.assists)} ast
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="section-note">
            Assists only cover goalscorers, and a dash means the data gave no figure.
          </p>
        </section>
      )}

      <footer className="page-gutter pb-12 text-center text-sm">
        {lastUpdatedAt && `${formatUpdatedAgo(lastUpdatedAt, now)}. `}Scores can lag behind real
        time.
      </footer>
    </>
  );
}
