import { z } from "zod";

// Only the fields we read. FotMob sends far more, and zod drops the rest.
// Fields that FotMob leaves out before kickoff, or for some matches, are optional.

const FixtureRefSchema = z.object({
  id: z.number(),
  status: z.object({ utcTime: z.string() }),
});

export const TeamSchema = z.object({
  fixtures: z.object({
    allFixtures: z.object({
      nextMatch: FixtureRefSchema.nullish(),
      lastMatch: FixtureRefSchema.nullish(),
    }),
  }),
});

/** The parts every match has. The sections below are checked one by one. */
export const MatchDetailsSchema = z.object({
  general: z.object({
    matchId: z.string(),
    matchTimeUTCDate: z.string(),
    homeTeam: z.object({ id: z.number() }),
    awayTeam: z.object({ id: z.number() }),
  }),
  content: z.object({
    lineup: z.unknown().optional(),
    matchFacts: z
      .object({
        events: z.unknown().optional(),
        infoBox: z.unknown().optional(),
        playerOfTheMatch: z.unknown().optional(),
      })
      .optional(),
  }),
});

/** Ratings arrive as 7.3, and the player of the match's as "9.1". */
const RatingSchema = z.union([z.number(), z.string()]).nullish();

const LineupPlayerSchema = z.object({
  name: z.string(),
  shirtNumber: z.union([z.string(), z.number()]).nullish(),
  isCaptain: z.boolean().optional(),
  performance: z
    .object({
      rating: RatingSchema,
      substitutionEvents: z.array(z.object({ time: z.number(), type: z.string() })).optional(),
    })
    .nullish(),
  verticalLayout: z.object({ x: z.number(), y: z.number() }).nullish(),
});

const AbsentPlayerSchema = z.object({
  name: z.string(),
  unavailability: z
    .object({ type: z.string(), expectedReturn: z.string().nullish() })
    .nullish(),
});

const LineupSideSchema = z.object({
  formation: z.string().nullish(),
  coach: z.object({ name: z.string() }).nullish(),
  starters: z.array(LineupPlayerSchema).nullish(),
  subs: z.array(LineupPlayerSchema).nullish(),
  unavailable: z.array(AbsentPlayerSchema).nullish(),
});

export const LineupSchema = z.object({
  homeTeam: LineupSideSchema,
  awayTeam: LineupSideSchema,
});

const EventSchema = z.object({
  type: z.string(),
  time: z.number().nullish(),
  overloadTime: z.number().nullish(),
  /** The side the event belongs to. For an own goal, the side that benefits. */
  isHome: z.boolean().nullish(),
  player: z.object({ name: z.string().nullish() }).nullish(),
  nameStr: z.string().nullish(),
  ownGoal: z.boolean().nullish(),
  goalDescriptionKey: z.string().nullish(),
  isPenaltyShootoutEvent: z.boolean().nullish(),
  card: z.string().nullish(),
});

export const EventsSchema = z.object({ events: z.array(EventSchema) });

export const InfoBoxSchema = z.object({
  Stadium: z.object({ name: z.string().nullish() }).nullish(),
  Referee: z.object({ text: z.string().nullish() }).nullish(),
});

export const PlayerOfTheMatchSchema = z.object({
  name: z.object({ fullName: z.string() }),
  teamId: z.number(),
  rating: z.object({ num: RatingSchema }).nullish(),
});

export type RawLineupPlayer = z.infer<typeof LineupPlayerSchema>;
export type RawLineupSide = z.infer<typeof LineupSideSchema>;
export type RawEvent = z.infer<typeof EventSchema>;
export type RawMatchDetails = z.infer<typeof MatchDetailsSchema>;
