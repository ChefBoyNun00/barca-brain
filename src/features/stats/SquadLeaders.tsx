import Link from "next/link";
import type { CSSProperties } from "react";
import type { SquadPlayer } from "@/domain/home";
import { T } from "@/i18n/language";
import type { TextKey } from "@/i18n/dictionary";
import { getJersey } from "../squad/jersey-data";
import { getPlayerTotals } from "../squad/squad-stats";

const TOP_PLAYERS = 5;

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
  if (ranked.length === 0) return null;
  const top = ranked[0]?.value ?? 1;
  return (
    <section className="leaders">
      {/* h2: it sits straight under the Squad page's h1. */}
      <h2 className="leaders-title">
        <T k={title} />
      </h2>
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

/** Top scorers and assists, under the squad (they used to sit on the /stats page). */
export function SquadLeaders({ squad }: { squad: SquadPlayer[] }) {
  if (squad.length === 0) return null;
  return (
    <section className="page-gutter section stats-columns">
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
    </section>
  );
}
