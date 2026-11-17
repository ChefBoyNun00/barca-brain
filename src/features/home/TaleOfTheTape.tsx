"use client";

import Image from "next/image";
import { useLanguage, useT } from "@/i18n/language";
import { formatScore } from "@/i18n/numbers";
import type { LeagueRow, SeasonMatch } from "@/domain/home";
import { FormPips } from "./FormPips";
import { displayTeam, formatMatchDate } from "./format";
import { buildTape, findLastMeeting } from "./tale-of-the-tape";

function TapeTeam({ team }: { team: LeagueRow }) {
  const language = useLanguage();
  return (
    <div className="tape-team">
      {team.logoUrl && <Image src={team.logoUrl} alt="" width={40} height={40} unoptimized />}
      <span>{displayTeam(team.name, language)}</span>
    </div>
  );
}

type TaleOfTheTapeProps = { table: LeagueRow[]; matches: SeasonMatch[]; opponentId?: string };

/** How the two sides compare in the league. Skipped for opponents outside it. */
export function TaleOfTheTape({ table, matches, opponentId }: TaleOfTheTapeProps) {
  const t = useT();
  const language = useLanguage();
  const tape = buildTape(table, opponentId, language);
  if (!tape) return null;
  const lastMeeting = findLastMeeting(matches, opponentId);

  return (
    <div className="tape">
      <div className="tape-head">
        <TapeTeam team={tape.barca} />
        <p className="tape-title">{t("tape.title")}</p>
        <TapeTeam team={tape.rival} />
      </div>
      <dl>
        {tape.rows.map(({ label, barca, rival, barcaShare }) => (
          <div key={label} className="tape-row">
            <span className="tape-value">{barca}</span>
            <div className="tape-middle">
              <dt>{label}</dt>
              <dd className="sr-only">
                {t("tape.values", { barca, rival: displayTeam(tape.rival.name, language), rivalValue: rival })}
              </dd>
              <div aria-hidden="true" className="tape-bar">
                <span style={{ flexGrow: barcaShare }} />
                <span style={{ flexGrow: 1 - barcaShare }} />
              </div>
            </div>
            <span className="tape-value">{rival}</span>
          </div>
        ))}
        <div className="tape-row tape-row-form">
          <FormPips form={tape.barca.form} />
          <div className="tape-middle">
            <dt>{t("tape.lastFive")}</dt>
          </div>
          <FormPips form={tape.rival.form} />
        </div>
      </dl>
      {lastMeeting && (
        <p className="tape-note">
          {t("tape.last", {
            date: formatMatchDate(lastMeeting.kickoffAt, language),
            score: formatScore(language, lastMeeting.goalsFor, lastMeeting.goalsAgainst),
            rival: displayTeam(tape.rival.name, language),
            venue: t(lastMeeting.isHome ? "venue.home" : "venue.away"),
          })}
        </p>
      )}
    </div>
  );
}
