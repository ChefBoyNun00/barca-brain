// What the home page shows, independent of the database and any provider.
// Matches are told from Barça's side: goalsFor is always Barça's goals.

export type HomeTeam = { name: string; logoUrl: string | null };

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

export type RaceTeam = { name: string; points: number; isBarca: boolean };

export type HomeScorer = {
  name: string;
  goals: number;
  /** Null means the provider gave no value, which is not the same as zero. */
  assists: number | null;
};

export type HomeData = {
  now: Date;
  matches: SeasonMatch[];
  standing: HomeStanding | null;
  race: RaceTeam[];
  topScorers: HomeScorer[];
  lastUpdatedAt: Date | null;
};
