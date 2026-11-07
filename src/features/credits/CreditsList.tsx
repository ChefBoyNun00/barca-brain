import { connection } from "next/server";
import { getAppDatabase } from "@/server/db/app-database";
import { getSquad } from "@/server/db/queries/squad";
import { getCurrentTeamScope } from "@/server/db/team-scope";

/** Free licences require this credit, so it lists whatever the page actually shows. */
export async function CreditsList() {
  await connection();
  const squad = await getSquad(getAppDatabase(), getCurrentTeamScope());
  const credited = squad.filter((player) => player.photo);

  if (credited.length === 0) {
    return <p className="section-note">No player photos are in use yet.</p>;
  }

  return (
    <ul className="credits">
      {credited.map(({ id, name, photo }) => (
        <li key={id}>
          <span className="credits-player">{name}</span>
          <a href={photo?.pageUrl} target="_blank" rel="noreferrer">
            {photo?.credit ?? "Wikimedia Commons"}, {photo?.license}
          </a>
        </li>
      ))}
    </ul>
  );
}
