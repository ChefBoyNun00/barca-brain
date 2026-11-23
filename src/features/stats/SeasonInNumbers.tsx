import type { CSSProperties } from "react";
import { LEAGUE_MATCHES } from "@/config/football";
import type { LeagueRow, SeasonMatch } from "@/domain/home";
import { T } from "@/i18n/language";
import type { TextKey } from "@/i18n/dictionary";
import { formatSigned } from "@/i18n/numbers";
import { getLastPlayedIndex, getNextMatchIndex } from "../home/season-story";
import { SeasonSelectionProvider } from "../home/season-selection";
import { WovenSeason } from "../home/WovenSeason";
import { MatchCard } from "../matches/MatchCard";
import { buildSeasonNumbers, projectPoints, type Record3 } from "./season-stats";

/** The anchor the old /stats address now lands on (/table#numbers). */
export const SEASON_NUMBERS_ID = "numbers";

/** `index` staggers the entrance, so the tiles arrive one after another. */
function Tile({ label, value, index }: { label: TextKey; value: string | number; index: number }) {
  return (
    <div className="num-tile" style={{ "--i": index } as CSSProperties}>
      <span className="num-tile-value">{value}</span>
      <span className="num-tile-label">
        <T k={label} />
      </span>
    </div>
  );
}

function RecordBar({ label, record }: { label: TextKey; record: Record3 }) {
  const total = Math.max(record.played, 1);
  const parts = [
    { key: "W", count: record.wins },
    { key: "D", count: record.draws },
    { key: "L", count: record.losses },
  ];
  return (
    <div className="split">
      <p className="split-label">
        <T k={label} />
        {/* Three separate pieces, so wins come first in either reading direction, like the bar. */}
        <span className="split-record">
          <span>{record.wins}</span>-<span>{record.draws}</span>-<span>{record.losses}</span>
        </span>
      </p>
      <span id={`record-${label}`} className="sr-only">
        <T
          k="stats.recordAria"
          vars={{ wins: record.wins, draws: record.draws, losses: record.losses }}
        />
      </span>
      <div className="split-bar" role="img" aria-labelledby={`record-${label}`}>
        {parts.map(({ key, count }) => (
          <span key={key} data-part={key} style={{ flexGrow: count / total }}>
            {count > 0 && <span aria-hidden="true">{count}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * The team's season worked out from its results: record, goals, runs, standout matches and the
 * woven shirt. Lives under the league table (it used to be its own /stats page).
 * Shows nothing before the first match is played: the table above already has its own empty state.
 */
export function SeasonInNumbers({ matches, barca }: { matches: SeasonMatch[]; barca: LeagueRow | null }) {
  const numbers = buildSeasonNumbers(matches);
  if (numbers.played === 0) return null;

  const difference = numbers.goalsFor - numbers.goalsAgainst;
  const pace = barca?.played ? projectPoints(barca.points, barca.played, LEAGUE_MATCHES) : null;
  const halves = numbers.firstHalfGoals + numbers.secondHalfGoals;
  const standout = [
    { label: "stats.biggestWin" as const, match: numbers.biggestWin },
    { label: "stats.heaviestDefeat" as const, match: numbers.heaviestDefeat },
    { label: "stats.highestScoring" as const, match: numbers.highestScoring },
  ].filter(
    (item, index, all) =>
      item.match !== null && all.findIndex((other) => other.match?.id === item.match?.id) === index,
  );
  const lastPlayedIndex = getLastPlayedIndex(matches);

  return (
    <>
      <section id={SEASON_NUMBERS_ID} aria-labelledby="numbers-title" className="page-gutter section">
        <h2 id="numbers-title" className="section-title">
          <T k="stats.title" />
        </h2>
        <p className="section-note">
          <T k="stats.note" />
        </p>

        <div className="num-grid num-grid-eight">
          <Tile label="stats.played" value={numbers.played} index={0} />
          <Tile label="stats.wins" value={numbers.wins} index={1} />
          <Tile label="stats.draws" value={numbers.draws} index={2} />
          <Tile label="stats.defeats" value={numbers.losses} index={3} />
          <Tile label="stats.goalsFor" value={numbers.goalsFor} index={4} />
          <Tile label="stats.goalsAgainst" value={numbers.goalsAgainst} index={5} />
          <Tile label="stats.difference" value={formatSigned(difference)} index={6} />
          <Tile label="stats.cleanSheets" value={numbers.cleanSheets} index={7} />
        </div>

        {pace !== null && (
          <p className="pace">
            <span className="pace-label">
              <T k="stats.pace" />
            </span>
            <span className="pace-value">{pace}</span>
            <span className="pace-note">
              <T k="stats.paceNote" vars={{ matches: LEAGUE_MATCHES }} />
            </span>
          </p>
        )}

        <div className="stats-columns">
          <div>
            <h3 className="stats-heading">
              <T k="stats.venue" />
            </h3>
            <RecordBar label="stats.home" record={numbers.home} />
            <RecordBar label="stats.away" record={numbers.away} />
          </div>
          {numbers.halfTimeKnown > 0 && halves > 0 && (
            <div>
              <h3 className="stats-heading">
                <T k="stats.halves" />
              </h3>
              <div className="halves">
                <div style={{ flexGrow: numbers.firstHalfGoals }} data-half="first">
                  <strong>{numbers.firstHalfGoals}</strong>
                  <T k="stats.firstHalf" />
                </div>
                <div style={{ flexGrow: numbers.secondHalfGoals }} data-half="second">
                  <strong>{numbers.secondHalfGoals}</strong>
                  <T k="stats.secondHalf" />
                </div>
              </div>
              <p className="section-note">
                <T k="stats.halvesNote" vars={{ count: numbers.halfTimeKnown }} />
              </p>
            </div>
          )}
        </div>

        <h3 className="stats-heading">
          <T k="stats.runs" />
        </h3>
        <div className="num-grid num-grid-three">
          <Tile label="stats.longestWinning" value={numbers.longestWinning} index={0} />
          <Tile label="stats.longestUnbeaten" value={numbers.longestUnbeaten} index={1} />
          <Tile label="stats.currentUnbeaten" value={numbers.currentUnbeaten} index={2} />
        </div>

        {standout.length > 0 && (
          <>
            <h3 className="stats-heading">
              <T k="stats.standout" />
            </h3>
            <div className="standout">
              {standout.map(({ label, match }) =>
                match ? (
                  <div key={label}>
                    <p className="standout-label">
                      <T k={label} />
                    </p>
                    <MatchCard match={match} index={0} />
                  </div>
                ) : null,
              )}
            </div>
          </>
        )}
      </section>

      {/* The whole season as one woven shirt. */}
      <section aria-labelledby="woven" className="surface-stone weave-section">
        <div className="page-gutter">
          <h2 id="woven" className="section-title">
            <T k="stats.woven" />
          </h2>
        </div>
        <SeasonSelectionProvider initialIndex={Math.max(lastPlayedIndex, 0)}>
          <WovenSeason
            matches={matches}
            lastPlayedIndex={lastPlayedIndex}
            nextIndex={getNextMatchIndex(matches, new Date())}
          />
        </SeasonSelectionProvider>
      </section>
    </>
  );
}
