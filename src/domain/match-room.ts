// What the Matchday Room shows, independent of the database and any provider.
// Told from Barça's side, like the rest of the app: `barca` is always Barça's team sheet.

/** When an absent player should be back, as the source states it. */
export type ExpectedReturn =
  /** "About 1-2 weeks": min 1, max 2. "About 2 weeks": both 2. */
  | { kind: "duration"; unit: "days" | "weeks" | "months"; min: number; max: number }
  /** month is 1 to 12. */
  | { kind: "period"; part: "early" | "mid" | "late"; month: number; year: number }
  | { kind: "doubtful" }
  /** Wording we do not recognise. The English original is kept, or null when there was none. */
  | { kind: "unknown"; text: string | null };

export type Absence = {
  name: string;
  reason: "injury" | "suspension" | "other";
  expectedReturn: ExpectedReturn;
};

export type LineupPlayer = {
  name: string;
  shirtNumber: number | null;
  isCaptain: boolean;
  /** The source's match rating out of 10. Null before kickoff or when not given. */
  rating: number | null;
  /** Where the player stands on a pitch drawn from Barça's goal upwards, 0 to 1 on each axis. */
  pitch: { x: number; y: number } | null;
  subbedOnAt: number | null;
  subbedOffAt: number | null;
};

export type TeamSheet = {
  formation: string | null;
  coach: string | null;
  /** Empty until the lineup is announced, about an hour before kickoff. */
  starters: LineupPlayer[];
  bench: LineupPlayer[];
  absences: Absence[];
};

export type MatchEventKind =
  | "goal"
  | "penalty-goal"
  | "own-goal"
  | "yellow"
  | "red"
  | "missed-penalty";

export type MatchRoomEvent = {
  kind: MatchEventKind;
  minute: number;
  /** Stoppage time: 3 in 90+3. */
  addedMinute: number | null;
  player: string;
  /**
   * Goals: Barça scored it, so an opponent's own goal is for Barça.
   * Cards and missed penalties: the player is Barça's.
   */
  forBarca: boolean;
};

/** Everything the room shows about one match. A section the source could not give is null. */
export type MatchRoomDetails = {
  barca: TeamSheet | null;
  opponent: TeamSheet | null;
  events: MatchRoomEvent[] | null;
  playerOfTheMatch: { name: string; rating: number | null; forBarca: boolean } | null;
  stadium: string | null;
  referee: string | null;
};

export type MatchRoom = MatchRoomDetails & { updatedAt: Date };

/** One match as a provider found it, before it is tied to one of our fixtures. */
export type FetchedMatchRoom = {
  externalId: string;
  kickoffAt: Date;
  barcaIsHome: boolean;
  details: MatchRoomDetails;
};
