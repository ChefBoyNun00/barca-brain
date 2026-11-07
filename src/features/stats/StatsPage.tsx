import Link from "next/link";
import type { CSSProperties } from "react";
import { connection } from "next/server";
import { LEAGUE_MATCHES } from "@/config/football";
import type { SquadPlayer } from "@/domain/home";
import { T } from "@/i18n/language";
import type { TextKey } from "@/i18n/dictionary";
import { MatchCard } from "../matches/MatchCard";
import { getJersey } from "../squad/jersey-data";
import { getPlayerTotals } from "../squad/squad-stats";
import { getStatsData } from "./get-stats-data";
import { buildSeasonNumbers, projectPoints, type Record3 } from "./season-stats";

const TOP_PLAYERS = 5;

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
        <span>
          {record.wins}-{record.draws}-{record.losses}
        </span>
      </p>
      <div
        className="split-bar"
        role="img"
        aria-label={`${record.wins} W ${record.draws} D ${record.losses} L`}
      >
        {parts.map(({ key, count }) => (
          <span key={key} data-part={key} style={{ flexGrow: count / total }}>
            {count > 0 && <span aria-hidden="true">{count}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function Leaders({
  title,
  note,
  players,
  pick,
}: {
  title: TextKey;
  note?: TextKey;
  players: SquadPlayer[];
  pick: (player: SquadPlayer) => number;
}) {
  const ranked = players
    .map((player) => ({ player, value: pick(player) }))
    .filter(({ value }) => value > 0)
    .sort((a, b) => b.value - a.value || a.player.name.localeCompare(b.player.name))
    .slice(0, TOP_PLAYERS);
  const top = ranked[0]?.value ?? 1;
  return (
    <section className="leaders">
      <h3 className="leaders-title">
        <T k={title} />
      </h3>
      <ol>
        {ranked.map(({ player, value }, index) => (
          <li key={player.id} data-first={index === 0} style={{ "--i": index } as CSSProperties}>
            <Link href={`/squad/${player.id}`}>
              <span className="leaders-number">{getJersey(player).number ?? "–"}</span>
              <span className="leaders-name">{player.name}</span>
              <span className="leaders-bar" aria-hidden="true">
                <span style={{ width: `${(value / top) * 100}%` }} />
              </span>
              <span className="leaders-value">{value}</span>
            </Link>
          </li>
        ))}
      </ol>
      {note && (
        <p className="section-note">
          <T k={note} />
        </p>
      )}
    </section>
  );
}

/** Runs per request, so the numbers follow the latest ingested results. */
export async function StatsPage() {
  await connection();
  const { matches, squad, barca } = await getStatsData();
  const numbers = buildSeasonNumbers(matches);

  if (numbers.played === 0) {
    return (
      <section className="page-gutter section">
        <h1 className="section-title">
          <T k="stats.title" />
        </h1>
        <p className="section-note">
          <T k="stats.empty" />
        </p>
      </section>
    );
  }

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

  return (
    <section className="page-gutter section">
      <h1 className="section-title">
        <T k="stats.title" />
      </h1>
      <p className="section-note">
        <T k="stats.note" />
      </p>

      <div className="num-grid">
        <Tile label="stats.played" value={numbers.played} index={0} />
        <Tile label="stats.wins" value={numbers.wins} index={1} />
        <Tile label="stats.draws" value={numbers.draws} index={2} />
        <Tile label="stats.defeats" value={numbers.losses} index={3} />
        <Tile label="stats.goalsFor" value={numbers.goalsFor} index={4} />
        <Tile label="stats.goalsAgainst" value={numbers.goalsAgainst} index={5} />
        <Tile label="stats.difference" value={difference > 0 ? `+${difference}` : difference} index={6} />
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
          <h2 className="stats-heading">
            <T k="stats.venue" />
          </h2>
          <RecordBar label="stats.home" record={numbers.home} />
          <RecordBar label="stats.away" record={numbers.away} />
        </div>
        {numbers.halfTimeKnown > 0 && halves > 0 && (
          <div>
            <h2 className="stats-heading">
              <T k="stats.halves" />
            </h2>
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

      <h2 className="stats-heading">
        <T k="stats.runs" />
      </h2>
      <div className="num-grid num-grid-three">
        <Tile label="stats.longestWinning" value={numbers.longestWinning} index={0} />
        <Tile label="stats.longestUnbeaten" value={numbers.longestUnbeaten} index={1} />
        <Tile label="stats.currentUnbeaten" value={numbers.currentUnbeaten} index={2} />
      </div>

      {standout.length > 0 && (
        <>
          <h2 className="stats-heading">
            <T k="stats.standout" />
          </h2>
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

      <div className="stats-columns">
        <Leaders
          title="stats.scorers"
          players={squad}
          pick={(player) => getPlayerTotals(player).goals}
        />
        <Leaders
          title="stats.assists"
          note="stats.assistsNote"
          players={squad}
          pick={(player) => getPlayerTotals(player).assists ?? 0}
        />
      </div>
    </section>
  );
}
