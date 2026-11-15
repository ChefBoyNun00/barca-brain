import { connection } from "next/server";
import { STADIUM_PHOTO } from "@/config/photos";
import type { SquadPlayer } from "@/domain/home";
import { getAppDatabase } from "@/server/db/app-database";
import { getSquad } from "@/server/db/queries/squad";
import { getCurrentTeamScope } from "@/server/db/team-scope";
import { T } from "@/i18n/language";

/** Free licences require this credit, so it lists whatever the page actually shows. */
export async function CreditsList() {
  await connection();
  const squad = await getSquad(getAppDatabase(), getCurrentTeamScope());
  const credited = squad.filter((player) => player.photo);

  return (
    <>
      <ul className="credits">
        <li>
          <span className="credits-player">
            <T k="credits.stadium" />
          </span>
          <a href={STADIUM_PHOTO.pageUrl} target="_blank" rel="noreferrer">
            {STADIUM_PHOTO.credit}, {STADIUM_PHOTO.license}
          </a>
        </li>
      </ul>
      {/* CC BY-SA asks us to say when a photo has been changed. */}
      <p className="section-note">
        <T k="credits.tinted" />
      </p>
      {credited.length === 0 ? (
        <p className="section-note">
          <T k="credits.noPhotos" />
        </p>
      ) : (
        <PlayerCredits players={credited} />
      )}
    </>
  );
}

function PlayerCredits({ players }: { players: SquadPlayer[] }) {
  return (
    <ul className="credits">
      {players.map(({ id, name, photo }) => (
        <li key={id}>
          <span className="credits-player">
            <bdi>{name}</bdi>
          </span>
          <a href={photo?.pageUrl} target="_blank" rel="noreferrer">
            {photo?.credit ?? "Wikimedia Commons"}, {photo?.license}
          </a>
        </li>
      ))}
    </ul>
  );
}
