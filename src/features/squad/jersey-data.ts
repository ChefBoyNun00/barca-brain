import { SQUAD_JERSEYS } from "@/config/squad-numbers";
import type { SquadPlayer } from "@/domain/home";

export type Jersey = { number: number | null; printed: string };

/** What is on the back of a player's shirt. Unknown players get their surname and no number. */
export function getJersey(player: Pick<SquadPlayer, "name">): Jersey {
  const known = SQUAD_JERSEYS[player.name];
  if (known) return known;
  const surname = player.name.split(/\s+/).filter(Boolean).at(-1) ?? player.name;
  return { number: null, printed: surname.toLocaleUpperCase("en") };
}
