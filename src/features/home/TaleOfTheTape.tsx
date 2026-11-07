import Image from "next/image";
import type { LeagueRow, SeasonMatch } from "@/domain/home";
import { FormPips } from "./FormPips";
import { formatMatchDate } from "./format";
import { buildTape, findLastMeeting } from "./tale-of-the-tape";

function TapeTeam({ team }: { team: LeagueRow }) {
  return (
    <div className="tape-team">
      {team.logoUrl && <Image src={team.logoUrl} alt="" width={40} height={40} unoptimized />}
      <span>{team.name}</span>
    </div>
  );
}

type TaleOfTheTapeProps = { table: LeagueRow[]; matches: SeasonMatch[]; opponentId?: string };

/** How the two sides compare in the league. Skipped for opponents outside it. */
export function TaleOfTheTape({ table, matches, opponentId }: TaleOfTheTapeProps) {
  const tape = buildTape(table, opponentId);
  if (!tape) return null;
  const lastMeeting = findLastMeeting(matches, opponentId);

  return (
    <div className="tape">
      <div className="tape-head">
        <TapeTeam team={tape.barca} />
        <p className="tape-title">Tale of the tape</p>
        <TapeTeam team={tape.rival} />
      </div>
      <dl>
        {tape.rows.map(({ label, barca, rival, barcaShare }) => (
          <div key={label} className="tape-row">
            <span className="tape-value">{barca}</span>
            <div className="tape-middle">
              <dt>{label}</dt>
              <dd className="sr-only">
                Barça {barca}, {tape.rival.name} {rival}
              </dd>
              <div aria-hidden="true" className="tape-bar">
                <span style={{ flexGrow: barcaShare }} />
                <span style={{ flexGrow: 1 - barcaShare }} />
              </div>
            </div>
            <span className="tape-value">{rival}</span>
          </div>
        ))}
        <div className="tape-row">
          <FormPips form={tape.barca.form} />
          <div className="tape-middle">
            <dt>Last five</dt>
          </div>
          <FormPips form={tape.rival.form} />
        </div>
      </dl>
      {lastMeeting && (
        <p className="tape-note">
          Last time, {formatMatchDate(lastMeeting.kickoffAt)}: Barça {lastMeeting.goalsFor}–
          {lastMeeting.goalsAgainst} {tape.rival.name}, {lastMeeting.isHome ? "at home" : "away"}.
        </p>
      )}
    </div>
  );
}
