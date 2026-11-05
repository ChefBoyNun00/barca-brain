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
