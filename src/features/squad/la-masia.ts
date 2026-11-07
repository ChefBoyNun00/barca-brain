import { LA_MASIA_GRADUATES } from "@/config/la-masia";
import type { SquadPlayer } from "@/domain/home";

export const isLaMasia = (player: Pick<SquadPlayer, "name">): boolean =>
  LA_MASIA_GRADUATES.has(player.name);
