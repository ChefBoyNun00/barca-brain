import { z } from "zod";
import type { PlayerPhoto, SquadPlayer } from "@/domain/home";
import type { Db } from "../client";
import { BARCA_CTE, type TeamScope } from "./home";

const StatRowSchema = z.object({
  competition: z.string(),
  is_league: z.boolean(),
  matches: z.number().nullable(),
  goals: z.number(),
  assists: z.number().nullable(),
});

const PlayerRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  position: z.enum(["GK", "DF", "MF", "FW"]).nullable(),
  birth_date: z.string().nullable(),
  nationality: z.string().nullable(),
  photo_url: z.string().nullable(),
  photo_credit: z.string().nullable(),
  photo_license: z.string().nullable(),
  photo_page_url: z.string().nullable(),
  stats: z.array(StatRowSchema),
});

type PlayerRow = z.infer<typeof PlayerRowSchema>;

/** A free licence only allows use with its details, so without them the photo is not shown. */
function toPhoto(row: PlayerRow): PlayerPhoto | null {
  if (!row.photo_url || !row.photo_license || !row.photo_page_url) return null;
  return {
    url: row.photo_url,
    credit: row.photo_credit,
    license: row.photo_license,
    pageUrl: row.photo_page_url,
  };
}

/** This season's squad, with each player's numbers split by competition. */
export async function getSquad(db: Db, scope: TeamScope): Promise<SquadPlayer[]> {
  const { rows } = await db.query(
    `${BARCA_CTE}
     select p.id, p.name, p.position, p.birth_date::text as birth_date, p.nationality,
       p.photo_url, p.photo_credit, p.photo_license, p.photo_page_url,
       coalesce((
         select json_agg(json_build_object(
           'competition', c.name,
           'is_league', c.type = 'league',
           'matches', s.matches_played,
           'goals', s.goals,
           'assists', s.assists
         ) order by c.type = 'league' desc, c.name)
         from player_season_stats s
         join competitions c on c.id = s.competition_id
         where s.player_id = p.id and s.team_id = m.team_id and s.season = m.season
       ), '[]'::json) as stats
     from squad_memberships m
     join barca on barca.id = m.team_id
     join players p on p.id = m.player_id
     where m.season = $3
     order by p.name asc`,
    [scope.provider, scope.teamExternalId, scope.season],
  );
  return z
    .array(PlayerRowSchema)
    .parse(rows)
    .map((row) => ({
      id: row.id,
      name: row.name,
      position: row.position,
      birthDate: row.birth_date,
      nationality: row.nationality,
      photo: toPhoto(row),
      stats: row.stats.map(({ is_league: isLeague, ...stat }) => ({ ...stat, isLeague })),
    }));
}
