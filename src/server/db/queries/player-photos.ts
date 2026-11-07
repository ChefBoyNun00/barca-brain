import { z } from "zod";
import type { DomainPlayerPhoto } from "@/domain/football";
import type { Db } from "../client";

export type PlayerNeedingPhoto = { id: string; name: string; birthDate: string };

const RowsSchema = z.array(
  z.object({ id: z.string(), name: z.string(), birth_date: z.string() }),
);

/** Squad players with no photo who have not been searched for recently. */
export async function getPlayersNeedingPhotos(
  db: Db,
  scope: {
    provider: string;
    teamExternalId: string;
    season: number;
    retryAfterDays: number;
    limit: number;
  },
): Promise<PlayerNeedingPhoto[]> {
  const { rows } = await db.query(
    `select p.id, p.name, to_char(p.birth_date, 'YYYY-MM-DD') as birth_date
     from players p
     join squad_memberships m on m.player_id = p.id
     join external_ids e on e.internal_id = m.team_id
     where e.entity_type = 'team' and e.provider = $1 and e.external_id = $2
       and m.season = $3
       and p.photo_url is null
       and p.birth_date is not null
       and (p.photo_checked_at is null
            or p.photo_checked_at < now() - make_interval(days => $4::int))
     order by p.name
     limit $5`,
    [scope.provider, scope.teamExternalId, scope.season, scope.retryAfterDays, scope.limit],
  );
  return RowsSchema.parse(rows).map(({ birth_date: birthDate, ...rest }) => ({
    ...rest,
    birthDate,
  }));
}

export async function savePlayerPhoto(
  db: Db,
  playerId: string,
  photo: DomainPlayerPhoto | null,
): Promise<void> {
  await db.query(
    `update players
     set photo_url = $1, photo_credit = $2, photo_license = $3, photo_page_url = $4,
         photo_checked_at = now()
     where id = $5`,
    [photo?.url ?? null, photo?.credit ?? null, photo?.license ?? null, photo?.pageUrl ?? null, playerId],
  );
}
