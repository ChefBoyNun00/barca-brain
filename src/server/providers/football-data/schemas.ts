import { z } from "zod";

// Knockout matches can exist before their teams are known, so team fields may be null.
const TeamSchema = z.object({ id: z.number().nullable(), name: z.string().nullable() });

export const TeamMatchesSchema = z.object({
  matches: z.array(
    z.object({
      id: z.number(),
      utcDate: z.string(),
      status: z.string(),
      competition: z.object({ code: z.string(), name: z.string() }),
      homeTeam: TeamSchema,
      awayTeam: TeamSchema,
    }),
  ),
});

export const ErrorBodySchema = z.object({ message: z.string() });

const CrestTeamSchema = z.object({
  id: z.number(),
  name: z.string(),
  shortName: z.string().nullable(),
  crest: z.string().nullable(),
});

// Same fields, but a knockout match can exist before its teams are known.
const FixtureTeamSchema = z.object({
  id: z.number().nullable(),
  name: z.string().nullable(),
  shortName: z.string().nullable(),
  crest: z.string().nullable(),
});

const ScoreLineSchema = z.object({ home: z.number().nullable(), away: z.number().nullable() });

const MatchSchema = z.object({
  id: z.number(),
  utcDate: z.string(),
  status: z.string(),
  matchday: z.number().nullable(),
  stage: z.string(),
  area: z.object({ name: z.string() }),
  competition: z.object({ code: z.string(), name: z.string(), type: z.string() }),
  homeTeam: FixtureTeamSchema,
  awayTeam: FixtureTeamSchema,
  score: z.object({ fullTime: ScoreLineSchema, halfTime: ScoreLineSchema }),
  referees: z.array(z.object({ name: z.string(), type: z.string() })),
});

export const TeamFixturesSchema = z.object({ matches: z.array(MatchSchema) });

export const TeamSquadSchema = z.object({
  squad: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      position: z.string().nullable(),
      dateOfBirth: z.string().nullable(),
      nationality: z.string().nullable(),
    }),
  ),
});

export const StandingsSchema = z.object({
  standings: z.array(
    z.object({
      type: z.string(),
      table: z.array(
        z.object({
          position: z.number(),
          team: CrestTeamSchema,
          playedGames: z.number().nullable(),
          form: z.string().nullable(),
          won: z.number().nullable(),
          draw: z.number().nullable(),
          lost: z.number().nullable(),
          points: z.number(),
          goalsFor: z.number().nullable(),
          goalsAgainst: z.number().nullable(),
        }),
      ),
    }),
  ),
});

export const ScorersSchema = z.object({
  scorers: z.array(
    z.object({
      player: z.object({
        id: z.number(),
        name: z.string(),
        firstName: z.string().nullable(),
        lastName: z.string().nullable(),
        dateOfBirth: z.string().nullable(),
        nationality: z.string().nullable(),
        section: z.string().nullable(),
        position: z.string().nullable(),
        shirtNumber: z.number().nullable(),
      }),
      team: CrestTeamSchema,
      playedMatches: z.number().nullable(),
      goals: z.number(),
      assists: z.number().nullable(),
      penalties: z.number().nullable(),
    }),
  ),
});

export type TeamFixtures = z.infer<typeof TeamFixturesSchema>;
export type TeamSquad = z.infer<typeof TeamSquadSchema>;
export type Standings = z.infer<typeof StandingsSchema>;
export type Scorers = z.infer<typeof ScorersSchema>;
