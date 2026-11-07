import type { SquadPlayer } from "@/domain/home";

export type PlayerTotals = { goals: number; assists: number | null; matches: number | null };

export type ScorerScope = "league" | "europe" | "all";

export type BoardRow = { player: SquadPlayer; goals: number; assists: number | null };

export type SquadSort = "goals" | "name" | "youngest";

/** Blanks are skipped, not read as zero. All blank stays blank. */
function sumKnown(values: (number | null)[]): number | null {
  const known = values.filter((value) => value !== null);
  return known.length === 0 ? null : known.reduce((total, value) => total + value, 0);
}

export function getPlayerTotals(player: SquadPlayer): PlayerTotals {
  return {
    goals: player.stats.reduce((total, row) => total + row.goals, 0),
    assists: sumKnown(player.stats.map((row) => row.assists)),
    matches: sumKnown(player.stats.map((row) => row.matches)),
  };
}

export function getAge(birthDate: string | null, now: Date): number | null {
  if (!birthDate) return null;
  const born = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(born.getTime())) return null;
  const hadBirthday =
    now.getUTCMonth() > born.getUTCMonth() ||
    (now.getUTCMonth() === born.getUTCMonth() && now.getUTCDate() >= born.getUTCDate());
  return now.getUTCFullYear() - born.getUTCFullYear() - (hadBirthday ? 0 : 1);
}

export function formatGoalsPerMatch({ goals, matches }: PlayerTotals): string | null {
  if (!matches) return null;
  return (goals / matches).toFixed(2);
}

export function formatShareOfGoals(goals: number, teamGoals: number): string | null {
  if (teamGoals === 0 || goals === 0) return null;
  return `${Math.round((goals / teamGoals) * 100)}%`;
}

export function getInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

const inScope = (scope: ScorerScope, isLeague: boolean) =>
  scope === "all" || (scope === "league") === isLeague;

export function buildScorerBoard(
  squad: SquadPlayer[],
  scope: ScorerScope,
  limit: number,
): BoardRow[] {
  return squad
    .map((player) => {
      const rows = player.stats.filter((row) => inScope(scope, row.isLeague));
      return {
        player,
        goals: rows.reduce((total, row) => total + row.goals, 0),
        assists: sumKnown(rows.map((row) => row.assists)),
      };
    })
    .filter((row) => row.goals > 0)
    .sort(
      (a, b) =>
        b.goals - a.goals ||
        (b.assists ?? -1) - (a.assists ?? -1) ||
        a.player.name.localeCompare(b.player.name),
    )
    .slice(0, limit);
}

const byName = (a: SquadPlayer, b: SquadPlayer) => a.name.localeCompare(b.name);

const SORTERS: Record<SquadSort, (a: SquadPlayer, b: SquadPlayer) => number> = {
  goals: (a, b) => getPlayerTotals(b).goals - getPlayerTotals(a).goals || byName(a, b),
  name: byName,
  // An unknown birth date sorts last rather than looking oldest or youngest.
  youngest: (a, b) => (b.birthDate ?? "").localeCompare(a.birthDate ?? "") || byName(a, b),
};

export function sortSquad(squad: SquadPlayer[], sort: SquadSort): SquadPlayer[] {
  return [...squad].sort(SORTERS[sort]);
}
