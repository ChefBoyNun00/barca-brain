import { z } from "zod";
import type { LeagueRow } from "@/domain/home";
import type { Db } from "../client";
import { BARCA_CTE, type TeamScope } from "./home";

const LeagueRowSchema = z.object({
  team_id: z.string(),
  name: z.string(),
  logo_url: z.string().nullable(),
  is_barca: z.boolean(),
  rank: z.number(),
  points: z.number(),
  played: z.number().nullable(),
  won: z.number().nullable(),
  drawn: z.number().nullable(),
  lost: z.number().nullable(),
  goals_for: z.number().nullable(),
  goals_against: z.number().nullable(),
  form: z.string().nullable(),
});

/** The full league table, first place first. */
export async function getLeagueTable(db: Db, scope: TeamScope): Promise<LeagueRow[]> {
  const { rows } = await db.query(
    `${BARCA_CTE}
     select s.team_id, coalesce(t.short_name, t.name) as name, t.logo_url,
       coalesce(s.team_id = (select id from barca), false) as is_barca,
       s.rank, s.points, s.played, s.won, s.drawn, s.lost, s.goals_for, s.goals_against, s.form
     from standings s
     join teams t on t.id = s.team_id
     join competitions c on c.id = s.competition_id
     where s.season = $3 and c.type = 'league'
     order by s.rank asc`,
    [scope.provider, scope.teamExternalId, scope.season],
  );
  return z
    .array(LeagueRowSchema)
    .parse(rows)
    .map((row) => ({
      teamId: row.team_id,
      name: row.name,
      logoUrl: row.logo_url,
      isBarca: row.is_barca,
      rank: row.rank,
      points: row.points,
      played: row.played,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      goalsFor: row.goals_for,
      goalsAgainst: row.goals_against,
      form: row.form,
    }));
}
