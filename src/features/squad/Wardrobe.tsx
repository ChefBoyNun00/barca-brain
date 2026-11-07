"use client";

import { useState } from "react";
import { ChoiceChips } from "@/components/ChoiceChips";
import type { TextKey } from "@/i18n/dictionary";
import { useT } from "@/i18n/language";
import { POSITION_LABELS } from "@/config/display";
import type { PlayerPosition, SquadPlayer } from "@/domain/home";
import { Jersey } from "./Jersey";
import { getJersey } from "./jersey-data";
import { isLaMasia } from "./la-masia";
import { sortSquad, type SquadSort } from "./squad-stats";

type PositionFilter = "all" | "masia" | PlayerPosition;

const POSITION_CHOICES: { id: PositionFilter; label: TextKey }[] = [
  { id: "all", label: "squad.everyone" },
  { id: "GK", label: "squad.keepers" },
  { id: "DF", label: "squad.defenders" },
  { id: "MF", label: "squad.midfield" },
  { id: "FW", label: "squad.forwards" },
  { id: "masia", label: "squad.masia" },
];

const SORT_CHOICES: { id: SquadSort; label: TextKey }[] = [
  { id: "number", label: "sort.number" },
  { id: "goals", label: "sort.goals" },
  { id: "youngest", label: "sort.youngest" },
  { id: "name", label: "sort.name" },
];

function Hanger({ player, onOpen }: { player: SquadPlayer; onOpen: () => void }) {
  const jersey = getJersey(player);
  const position = player.position ? POSITION_LABELS[player.position] : "Squad player";
  const masia = isLaMasia(player);
  return (
    <button
      type="button"
      className="hanger"
      onClick={onOpen}
      aria-label={`${player.name}${jersey.number === null ? "" : `, number ${jersey.number}`}. ${position}${masia ? ", La Masia graduate" : ""}. Open stats.`}
    >
      <span aria-hidden="true" className="hanger-hook" />
      {masia && (
        <span aria-hidden="true" className="hanger-masia" title="La Masia graduate">
          M
        </span>
      )}
      <Jersey jersey={jersey} keeper={player.position === "GK"} mode="flip" />
      {/* Touch screens cannot hover, so the name is also written underneath. */}
      <span aria-hidden="true" className="hanger-caption">
        {jersey.number === null ? jersey.printed : `${jersey.number} · ${jersey.printed}`}
      </span>
    </button>
  );
}

type WardrobeProps = {
  squad: SquadPlayer[];
  onOpen: (playerId: string) => void;
};

/** The squad as shirts on a rail. Hover one to see its back, open it for the stats. */
export function Wardrobe({ squad, onOpen }: WardrobeProps) {
  const t = useT();
  const [position, setPosition] = useState<PositionFilter>("all");
  const [sort, setSort] = useState<SquadSort>("number");
  const shown = sortSquad(
    squad.filter((player) => {
      if (position === "all") return true;
      return position === "masia" ? isLaMasia(player) : player.position === position;
    }),
    sort,
  );

  return (
    <section id="squad" aria-labelledby="squad-title" className="page-gutter section reveal">
      <h1 id="squad-title" className="section-title">
        {t("squad.title")}
      </h1>
      <p className="section-note">{t("squad.note")}</p>
      <div className="squad-controls">
        <ChoiceChips
          label="Filter by position"
          choices={POSITION_CHOICES.map(({ id, label }) => ({ id, label: t(label) }))}
          value={position}
          onChange={setPosition}
        />
        <ChoiceChips
          label="Sort players"
          choices={SORT_CHOICES.map(({ id, label }) => ({ id, label: t(label) }))}
          value={sort}
          onChange={setSort}
        />
      </div>
      {shown.length === 0 ? (
        <p className="section-note">No players in this group.</p>
      ) : (
        <ul className="wardrobe">
          {shown.map((player) => (
            <li key={player.id}>
              <Hanger player={player} onOpen={() => onOpen(player.id)} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
