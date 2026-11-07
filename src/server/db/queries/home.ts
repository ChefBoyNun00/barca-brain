import { z } from "zod";
import type {
  HomeScorer,
  HomeStanding,
  MatchStatus,
  RaceTeam,
  SeasonMatch,
} from "@/domain/home";
import type { Db } from "../client";

export type TeamScope = { provider: string; teamExternalId: string; season: number };

const BARCA_CTE = `
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
        row.opponent_name === null
          ? null
          : { name: row.opponent_name, logoUrl: row.opponent_logo },
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

const RaceRowSchema = z.object({
  name: z.string(),
  points: z.number(),
  is_barca: z.boolean(),
});

/** The top of the league table. */
export async function getLeagueRace(db: Db, scope: TeamScope, limit: number): Promise<RaceTeam[]> {
  const { rows } = await db.query(
    `${BARCA_CTE}
     select coalesce(t.short_name, t.name) as name, s.points,
       coalesce(s.team_id = (select id from barca), false) as is_barca
     from standings s
     join teams t on t.id = s.team_id
     join competitions c on c.id = s.competition_id
     where s.season = $3 and c.type = 'league'
     order by s.rank asc
     limit $4`,
    [scope.provider, scope.teamExternalId, scope.season, limit],
  );
  return z
    .array(RaceRowSchema)
    .parse(rows)
    .map(({ is_barca: isBarca, ...rest }) => ({ ...rest, isBarca }));
}

const ScorerRowSchema = z.object({
  name: z.string(),
  goals: z.number(),
  assists: z.number().nullable(),
});

export async function getTopLeagueScorers(
  db: Db,
  scope: TeamScope,
  limit: number,
): Promise<HomeScorer[]> {
  const { rows } = await db.query(
    `${BARCA_CTE}
     select p.name, s.goals, s.assists
     from player_season_stats s
     join barca on barca.id = s.team_id
     join players p on p.id = s.player_id
     join competitions c on c.id = s.competition_id
     where s.season = $3 and c.type = 'league'
     order by s.goals desc, s.assists desc nulls last, p.name asc
     limit $4`,
    [scope.provider, scope.teamExternalId, scope.season, limit],
  );
  return z.array(ScorerRowSchema).parse(rows);
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
