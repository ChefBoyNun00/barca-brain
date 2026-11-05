import { z } from "zod";
import type {
  DomainCompetition,
  DomainFixture,
  DomainPlayer,
  DomainScorer,
  DomainStanding,
  DomainTeam,
} from "@/domain/football";
import type { Db } from "../client";

type EntityType = "competition" | "team" | "player" | "fixture";

const InternalIdRowsSchema = z.array(z.object({ internal_id: z.string() }));
const IdRowsSchema = z.array(z.object({ id: z.string() }));

export async function findInternalId(
  db: Db,
  entityType: EntityType,
  provider: string,
  externalId: string,
): Promise<string | null> {
  const { rows } = await db.query(
    `select internal_id from external_ids
     where entity_type = $1 and provider = $2 and external_id = $3`,
    [entityType, provider, externalId],
  );
  return InternalIdRowsSchema.parse(rows)[0]?.internal_id ?? null;
}

/** For rows that an earlier job must have created. Fails loudly instead of skipping data. */
export async function requireInternalId(
  db: Db,
  entityType: EntityType,
  provider: string,
  externalId: string,
): Promise<string> {
  const id = await findInternalId(db, entityType, provider, externalId);
  if (id === null) throw new Error(`No ${entityType} stored for ${provider} ID ${externalId}`);
  return id;
}

/**
 * The idempotency rule: look the row up by provider ID, update it if found, otherwise
 * create it and record the mapping. Running this twice leaves one row.
 */
async function upsertMapped(
  db: Db,
  entityType: EntityType,
  provider: string,
  externalId: string,
  writes: { insert: () => Promise<string>; update: (id: string) => Promise<void> },
): Promise<string> {
  const existingId = await findInternalId(db, entityType, provider, externalId);
  if (existingId !== null) {
    await writes.update(existingId);
    return existingId;
  }
  const id = await writes.insert();
  await db.query(
    `insert into external_ids (entity_type, provider, external_id, internal_id)
     values ($1, $2, $3, $4)`,
    [entityType, provider, externalId, id],
  );
  return id;
}

const insertedId = (rows: unknown[]): string => {
  const id = IdRowsSchema.parse(rows)[0]?.id;
  if (!id) throw new Error("Insert returned no id");
  return id;
};

export function upsertCompetition(
  db: Db,
  provider: string,
  competition: DomainCompetition,
): Promise<string> {
  const values = [competition.name, competition.type, competition.country];
  return upsertMapped(db, "competition", provider, competition.externalId, {
    insert: async () =>
      insertedId(
        (
          await db.query(
            `insert into competitions (name, type, country) values ($1, $2, $3) returning id`,
            values,
          )
        ).rows,
      ),
    update: async (id) => {
      await db.query(`update competitions set name = $1, type = $2, country = $3 where id = $4`, [
        ...values,
        id,
      ]);
    },
  });
}

export function upsertTeam(db: Db, provider: string, team: DomainTeam): Promise<string> {
  const values = [team.name, team.shortName, team.logoUrl];
  return upsertMapped(db, "team", provider, team.externalId, {
    insert: async () =>
      insertedId(
        (
          await db.query(
            `insert into teams (name, short_name, logo_url) values ($1, $2, $3) returning id`,
            values,
          )
        ).rows,
      ),
    update: async (id) => {
      await db.query(`update teams set name = $1, short_name = $2, logo_url = $3 where id = $4`, [
        ...values,
        id,
      ]);
    },
  });
}

/** Squad and scorer rows each know different fields, so a blank never replaces a value. */
export function upsertPlayer(db: Db, provider: string, player: DomainPlayer): Promise<string> {
  const values = [
    player.name,
    player.firstName,
    player.lastName,
    player.birthDate,
    player.nationality,
    player.position,
  ];
  return upsertMapped(db, "player", provider, player.externalId, {
    insert: async () =>
      insertedId(
        (
          await db.query(
            `insert into players (name, first_name, last_name, birth_date, nationality, position)
             values ($1, $2, $3, $4, $5, $6) returning id`,
            values,
          )
        ).rows,
      ),
    update: async (id) => {
      await db.query(
        `update players set
           name = $1,
           first_name = coalesce($2, first_name),
           last_name = coalesce($3, last_name),
           birth_date = coalesce($4, birth_date),
           nationality = coalesce($5, nationality),
           position = coalesce($6, position)
         where id = $7`,
        [...values, id],
      );
    },
  });
}

export async function upsertSquadMembership(
  db: Db,
  membership: { playerId: string; teamId: string; season: number; shirtNumber: number | null },
): Promise<void> {
  await db.query(
    `insert into squad_memberships (player_id, team_id, season, shirt_number)
     values ($1, $2, $3, $4)
     on conflict (player_id, team_id, season) do update
       set shirt_number = coalesce(excluded.shirt_number, squad_memberships.shirt_number)`,
    [membership.playerId, membership.teamId, membership.season, membership.shirtNumber],
  );
}

export function upsertFixture(
  db: Db,
  provider: string,
  fixture: DomainFixture,
  ids: { competitionId: string; homeTeamId: string | null; awayTeamId: string | null },
): Promise<string> {
  const values = [
    ids.competitionId,
    fixture.season,
    fixture.round,
    fixture.kickoffAt,
    fixture.status,
    ids.homeTeamId,
    ids.awayTeamId,
    fixture.homeGoals,
    fixture.awayGoals,
    fixture.homeGoalsHalfTime,
    fixture.awayGoalsHalfTime,
    fixture.venue,
    fixture.referee,
  ];
  return upsertMapped(db, "fixture", provider, fixture.externalId, {
    insert: async () =>
      insertedId(
        (
          await db.query(
            `insert into fixtures (competition_id, season, round, kickoff_at, status,
               home_team_id, away_team_id, home_goals, away_goals, home_goals_ht, away_goals_ht,
               venue, referee)
             values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) returning id`,
            values,
          )
        ).rows,
      ),
    update: async (id) => {
      await db.query(
        `update fixtures set competition_id = $1, season = $2, round = $3, kickoff_at = $4,
           status = $5, home_team_id = $6, away_team_id = $7, home_goals = $8, away_goals = $9,
           home_goals_ht = $10, away_goals_ht = $11, venue = $12, referee = $13
         where id = $14`,
        [...values, id],
      );
    },
  });
}

export async function upsertPlayerSeasonStats(
  db: Db,
  stats: {
    playerId: string;
    teamId: string;
    competitionId: string;
    season: number;
    scorer: DomainScorer;
  },
): Promise<void> {
  const { scorer } = stats;
  await db.query(
    `insert into player_season_stats (player_id, team_id, competition_id, season,
       matches_played, goals, assists, penalties)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (player_id, team_id, competition_id, season) do update set
       matches_played = excluded.matches_played,
       goals = excluded.goals,
       assists = excluded.assists,
       penalties = excluded.penalties,
       updated_at = now()`,
    [
      stats.playerId,
      stats.teamId,
      stats.competitionId,
      stats.season,
      scorer.matchesPlayed,
      scorer.goals,
      scorer.assists,
      scorer.penalties,
    ],
  );
}

export async function upsertStanding(
  db: Db,
  row: { competitionId: string; season: number; teamId: string; standing: DomainStanding },
): Promise<void> {
  const { standing } = row;
  await db.query(
    `insert into standings (competition_id, season, team_id, rank, points, played, won, drawn,
       lost, goals_for, goals_against, form)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     on conflict (competition_id, season, team_id) do update set
       rank = excluded.rank,
       points = excluded.points,
       played = excluded.played,
       won = excluded.won,
       drawn = excluded.drawn,
       lost = excluded.lost,
       goals_for = excluded.goals_for,
       goals_against = excluded.goals_against,
       form = excluded.form,
       updated_at = now()`,
    [
      row.competitionId,
      row.season,
      row.teamId,
      standing.rank,
      standing.points,
      standing.played,
      standing.won,
      standing.drawn,
      standing.lost,
      standing.goalsFor,
      standing.goalsAgainst,
      standing.form,
    ],
  );
}
