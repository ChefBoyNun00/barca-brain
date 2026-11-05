import type {
  DomainCompetition,
  DomainFixture,
  DomainPlayer,
  DomainScorer,
  DomainStanding,
  DomainTeam,
  FixtureStatus,
  PlayerPosition,
} from "@/domain/football";
import type { Scorers, Standings, TeamFixtures, TeamSquad } from "./schemas";

type RawMatch = TeamFixtures["matches"][number];
type RawFixtureTeam = RawMatch["homeTeam"];
type RawTeam = Standings["standings"][number]["table"][number]["team"];

const STATUS_BY_PROVIDER: Record<string, FixtureStatus> = {
  SCHEDULED: "scheduled",
  TIMED: "scheduled",
  IN_PLAY: "live",
  PAUSED: "live",
  EXTRA_TIME: "live",
  PENALTY_SHOOTOUT: "live",
  FINISHED: "finished",
  AWARDED: "finished",
  SUSPENDED: "postponed",
  POSTPONED: "postponed",
  CANCELLED: "cancelled",
};

const LEAGUE_STAGES = new Set(["REGULAR_SEASON", "LEAGUE_STAGE"]);

/** Fails loudly: guessing a match's status could show a wrong result. */
function mapStatus(status: string): FixtureStatus {
  const mapped = STATUS_BY_PROVIDER[status];
  if (!mapped) throw new Error(`Unknown football-data match status: ${status}`);
  return mapped;
}

/** Broad squad labels and specific scorer labels both end up as one of four positions. */
export function mapPosition(position: string | null): PlayerPosition | null {
  const label = position?.toLowerCase() ?? "";
  if (label.includes("goalkeeper")) return "GK";
  if (label.includes("defence") || label.includes("back")) return "DF";
  if (label.includes("midfield")) return "MF";
  if (/offence|forward|winger|striker/.test(label)) return "FW";
  return null;
}

function mapRound(stage: string, matchday: number | null): string | null {
  if (LEAGUE_STAGES.has(stage)) return matchday === null ? null : `Matchday ${matchday}`;
  const words = stage.toLowerCase().replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function mapTeam(team: RawTeam): DomainTeam {
  return {
    externalId: String(team.id),
    name: team.name,
    shortName: team.shortName,
    logoUrl: team.crest,
  };
}

function mapFixtureTeam(team: RawFixtureTeam): DomainTeam | null {
  if (team.id === null || team.name === null) return null;
  return mapTeam({ ...team, id: team.id, name: team.name });
}

function mapCompetition(match: RawMatch): DomainCompetition {
  return {
    externalId: match.competition.code,
    name: match.competition.name,
    type: match.competition.type === "LEAGUE" ? "league" : "cup",
    country: match.area.name,
  };
}

export function mapFixtures(raw: TeamFixtures, season: number): DomainFixture[] {
  // TODO(debt): shootout scores are unverified — no shootout exists in the data yet, and
  // fullTime may include penalties — recheck against a real one once knockouts are played.
  return raw.matches.map((match) => ({
    externalId: String(match.id),
    competition: mapCompetition(match),
    season,
    round: mapRound(match.stage, match.matchday),
    kickoffAt: match.utcDate,
    status: mapStatus(match.status),
    homeTeam: mapFixtureTeam(match.homeTeam),
    awayTeam: mapFixtureTeam(match.awayTeam),
    homeGoals: match.score.fullTime.home,
    awayGoals: match.score.fullTime.away,
    homeGoalsHalfTime: match.score.halfTime.home,
    awayGoalsHalfTime: match.score.halfTime.away,
    venue: null,
    referee: match.referees.find((referee) => referee.type === "REFEREE")?.name ?? null,
  }));
}

export function mapSquad(raw: TeamSquad): DomainPlayer[] {
  return raw.squad.map((player) => ({
    externalId: String(player.id),
    name: player.name,
    firstName: null,
    lastName: null,
    birthDate: player.dateOfBirth,
    nationality: player.nationality,
    position: mapPosition(player.position),
    shirtNumber: null,
  }));
}

/** Only TOTAL tables: HOME and AWAY repeat every team and would triple the rows. */
export function mapStandings(raw: Standings): DomainStanding[] {
  return raw.standings
    .filter((block) => block.type === "TOTAL")
    .flatMap((block) => block.table)
    .map((row) => ({
      team: mapTeam(row.team),
      rank: row.position,
      points: row.points,
      played: row.playedGames,
      won: row.won,
      drawn: row.draw,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      form: row.form,
    }));
}

export function mapScorers(raw: Scorers): DomainScorer[] {
  return raw.scorers.map(({ player, team, playedMatches, goals, assists, penalties }) => ({
    player: {
      externalId: String(player.id),
      name: player.name,
      firstName: player.firstName,
      lastName: player.lastName,
      birthDate: player.dateOfBirth,
      nationality: player.nationality,
      position: mapPosition(player.position ?? player.section),
      shirtNumber: player.shirtNumber,
    },
    team: mapTeam(team),
    matchesPlayed: playedMatches,
    goals,
    assists,
    penalties,
  }));
}
