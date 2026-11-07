// What the home page shows, independent of the database and any provider.
// Matches are told from Barça's side: goalsFor is always Barça's goals.

export type HomeTeam = { id: string; name: string; logoUrl: string | null };

export type MatchStatus = "scheduled" | "live" | "finished" | "postponed" | "cancelled";

export type SeasonMatch = {
  id: string;
  kickoffAt: Date;
  status: MatchStatus;
  competition: string;
  isLeague: boolean;
  round: string | null;
  opponent: HomeTeam | null;
  isHome: boolean;
  goalsFor: number | null;
  goalsAgainst: number | null;
  halfTimeFor: number | null;
  halfTimeAgainst: number | null;
};

export type HomeStanding = {
  competition: string;
  rank: number;
  points: number;
  played: number | null;
};

export type LeagueRow = {
  teamId: string;
  name: string;
  logoUrl: string | null;
  isBarca: boolean;
  rank: number;
  points: number;
  played: number | null;
  won: number | null;
  drawn: number | null;
  lost: number | null;
  goalsFor: number | null;
  goalsAgainst: number | null;
  /** Comma separated, newest match first, as the provider sends it. */
  form: string | null;
};

export type PlayerPosition = "GK" | "DF" | "MF" | "FW";

export type PlayerPhoto = {
  url: string;
  credit: string | null;
  license: string;
  pageUrl: string;
};

export type PlayerCompetitionStats = {
  competition: string;
  isLeague: boolean;
  matches: number | null;
  goals: number;
  /** Null means the provider gave no value, which is not the same as zero. */
  assists: number | null;
};

export type SquadPlayer = {
  id: string;
  name: string;
  position: PlayerPosition | null;
  /** YYYY-MM-DD */
  birthDate: string | null;
  nationality: string | null;
  photo: PlayerPhoto | null;
  stats: PlayerCompetitionStats[];
};

export type HomeData = {
  now: Date;
  matches: SeasonMatch[];
  standing: HomeStanding | null;
  table: LeagueRow[];
  lastUpdatedAt: Date | null;
};
