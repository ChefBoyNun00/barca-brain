import { z } from "zod";
import type { MatchRoom, MatchRoomDetails } from "@/domain/match-room";
import type { Db } from "../client";

// The stored JSON is checked on the way out too, so a row written by an older version of the
// job can never reach the page in a shape it does not expect.

const ExpectedReturnSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("duration"),
    unit: z.enum(["days", "weeks", "months"]),
    min: z.number(),
    max: z.number(),
  }),
  z.object({
    kind: z.literal("period"),
    part: z.enum(["early", "mid", "late"]),
    month: z.number().int().min(1).max(12),
    year: z.number().int(),
  }),
  z.object({ kind: z.literal("doubtful") }),
  z.object({ kind: z.literal("unknown"), text: z.string().nullable() }),
]);

const LineupPlayerSchema = z.object({
  name: z.string(),
  shirtNumber: z.number().nullable(),
  isCaptain: z.boolean(),
  rating: z.number().nullable(),
  pitch: z.object({ x: z.number(), y: z.number() }).nullable(),
  subbedOnAt: z.number().nullable(),
  subbedOffAt: z.number().nullable(),
});

const TeamSheetSchema = z.object({
  formation: z.string().nullable(),
  coach: z.string().nullable(),
  starters: z.array(LineupPlayerSchema),
  bench: z.array(LineupPlayerSchema),
  absences: z.array(
    z.object({
      name: z.string(),
      reason: z.enum(["injury", "suspension", "other"]),
      expectedReturn: ExpectedReturnSchema,
    }),
  ),
});

const DetailsSchema = z.object({
  barca: TeamSheetSchema.nullable(),
  opponent: TeamSheetSchema.nullable(),
  events: z
    .array(
      z.object({
        kind: z.enum(["goal", "penalty-goal", "own-goal", "yellow", "red", "missed-penalty"]),
        minute: z.number(),
        addedMinute: z.number().nullable(),
        player: z.string(),
        forBarca: z.boolean(),
      }),
    )
    .nullable(),
  playerOfTheMatch: z
    .object({ name: z.string(), rating: z.number().nullable(), forBarca: z.boolean() })
    .nullable(),
  stadium: z.string().nullable(),
  referee: z.string().nullable(),
}) satisfies z.ZodType<MatchRoomDetails>;

const RowSchema = z.object({ details: z.unknown(), updated_at: z.coerce.date() });

/** The room for one fixture, or null when there is none yet or it cannot be read. */
export async function getMatchRoom(db: Db, fixtureId: string): Promise<MatchRoom | null> {
  const { rows } = await db.query(
    `select details, updated_at from match_rooms where fixture_id = $1`,
    [fixtureId],
  );
  const row = z.array(RowSchema).parse(rows)[0];
  if (!row) return null;
  const details = DetailsSchema.safeParse(row.details);
  if (!details.success) {
    console.error(`Match room for fixture ${fixtureId} has an unexpected shape`);
    return null;
  }
  return { ...details.data, updatedAt: row.updated_at };
}
