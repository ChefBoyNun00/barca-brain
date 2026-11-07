import { z } from "zod";
import type { HomeStanding, MatchStatus, SeasonMatch } from "@/domain/home";
import type { Db } from "../client";

export type TeamScope = { provider: string; teamExternalId: string; season: number };

export const BARCA_CTE = `
  with barca as (
    select internal_id as id from external_ids
    where entity_type = 'team' and provider = $1 and external_id = $2
  )`;

const MatchRowSchema = z.object({
  id: z.string(),
  kickoff_at: z.coerce.date(),
  status: z.enum(["scheduled", "live", "finished", "postponed", "cancelled"]),
  competition: z.string(),
  competition_type: z.string(),
  round: z.string().nullable(),
  opponent_id: z.string().nullable(),
  opponent_name: z.string().nullable(),
  opponent_logo: z.string().nullable(),
  is_home: z.boolean(),
  goals_for: z.number().nullable(),
  goals_against: z.number().nullable(),
  half_time_for: z.number().nullable(),
  half_time_against: z.number().nullable(),
});

/** Every Barça match of the season, oldest first, told from Barça's side. */
export async function getSeasonMatches(db: Db, scope: TeamScope): Promise<SeasonMatch[]> {
  const { rows } = await db.query(
    `${BARCA_CTE}
     select f.id, f.kickoff_at, f.status, c.name as competition, c.type as competition_type,
       f.round,
       o.id as opponent_id,
       coalesce(o.short_name, o.name) as opponent_name,
       o.logo_url as opponent_logo,
       f.home_team_id = barca.id as is_home,
       case when f.home_team_id = barca.id then f.home_goals else f.away_goals end as goals_for,
       case when f.home_team_id = barca.id then f.away_goals else f.home_goals end as goals_against,
       case when f.home_team_id = barca.id then f.home_goals_ht else f.away_goals_ht end
         as half_time_for,
       case when f.home_team_id = barca.id then f.away_goals_ht else f.home_goals_ht end
         as half_time_against
     from fixtures f
     join barca on barca.id in (f.home_team_id, f.away_team_id)
     join competitions c on c.id = f.competition_id
     left join teams o on o.id =
       case when f.home_team_id = barca.id then f.away_team_id else f.home_team_id end
     where f.season = $3
     order by f.kickoff_at asc`,
    [scope.provider, scope.teamExternalId, scope.season],
  );
  return z
    .array(MatchRowSchema)
    .parse(rows)
    .map((row) => ({
      id: row.id,
      kickoffAt: row.kickoff_at,
      status: row.status satisfies MatchStatus,
      competition: row.competition,
      isLeague: row.competition_type === "league",
      round: row.round,
      opponent:
        row.opponent_id === null || row.opponent_name === null
          ? null
          : { id: row.opponent_id, name: row.opponent_name, logoUrl: row.opponent_logo },
      isHome: row.is_home,
      goalsFor: row.goals_for,
      goalsAgainst: row.goals_against,
      halfTimeFor: row.half_time_for,
      halfTimeAgainst: row.half_time_against,
    }));
}

const StandingRowSchema = z.object({
  competition: z.string(),
  rank: z.number(),
  points: z.number(),
  played: z.number().nullable(),
});

export async function getLeagueStanding(db: Db, scope: TeamScope): Promise<HomeStanding | null> {
  const { rows } = await db.query(
    `${BARCA_CTE}
     select c.name as competition, s.rank, s.points, s.played
     from standings s
     join barca on barca.id = s.team_id
     join competitions c on c.id = s.competition_id
     where s.season = $3 and c.type = 'league'
     limit 1`,
    [scope.provider, scope.teamExternalId, scope.season],
  );
  return z.array(StandingRowSchema).parse(rows)[0] ?? null;
}

export async function getLastSuccessfulIngestAt(db: Db, provider: string): Promise<Date | null> {
  const { rows } = await db.query(
    `select max(finished_at) as finished_at from ingest_runs
     where provider = $1 and status = 'success'`,
    [provider],
  );
  const schema = z.array(z.object({ finished_at: z.coerce.date().nullable() }));
  return schema.parse(rows)[0]?.finished_at ?? null;
}
