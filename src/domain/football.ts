// The app's own football language. No provider's raw shape appears here, so a new
// provider only has to map into these types. `externalId` is the provider's ID as text.

export type FixtureStatus = "scheduled" | "live" | "finished" | "postponed" | "cancelled";
export type PlayerPosition = "GK" | "DF" | "MF" | "FW";
export type CompetitionType = "league" | "cup" | "international";

export type DomainCompetition = {
  externalId: string;
  name: string;
  type: CompetitionType;
  country: string | null;
};

export type DomainTeam = {
  externalId: string;
  name: string;
  shortName: string | null;
  logoUrl: string | null;
};

export type DomainPlayer = {
  externalId: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  birthDate: string | null;
  nationality: string | null;
  position: PlayerPosition | null;
  shirtNumber: number | null;
};

export type DomainPlayerPhoto = {
  url: string;
  credit: string;
  license: string;
  pageUrl: string;
};

export type DomainFixture = {
  externalId: string;
  competition: DomainCompetition;
  season: number;
  round: string | null;
  kickoffAt: string;
  status: FixtureStatus;
  /** Null when a knockout match exists before its teams are known. */
  homeTeam: DomainTeam | null;
  awayTeam: DomainTeam | null;
  homeGoals: number | null;
  awayGoals: number | null;
  homeGoalsHalfTime: number | null;
  awayGoalsHalfTime: number | null;
  venue: string | null;
  referee: string | null;
};

export type DomainStanding = {
  team: DomainTeam;
  rank: number;
  points: number;
  played: number | null;
  won: number | null;
  drawn: number | null;
  lost: number | null;
  goalsFor: number | null;
  goalsAgainst: number | null;
  form: string | null;
};

export type DomainScorer = {
  player: DomainPlayer;
  team: DomainTeam;
  matchesPlayed: number | null;
  goals: number;
  /** Null means the provider gave no value, which is not the same as zero. */
  assists: number | null;
  penalties: number | null;
};
