"use client";

import Link from "next/link";
import { useLanguage, useT } from "@/i18n/language";
import { formatScore, formatSigned } from "@/i18n/numbers";
import Image from "next/image";
import type { LeagueRow, SeasonMatch } from "@/domain/home";
import { FormPips } from "./FormPips";
import { formatMatchDate } from "./format";
import { describeMatch, getMatchOutcome } from "./season-story";

type Meeting = { match: SeasonMatch };

function goalDifference({ goalsFor, goalsAgainst }: LeagueRow): string {
  if (goalsFor === null || goalsAgainst === null) return "–";
  return formatSigned(goalsFor - goalsAgainst);
}

function MeetingButton({ match }: Meeting) {
  const t = useT();
  const language = useLanguage();
  const outcome = getMatchOutcome(match);
  const description = describeMatch(match, language);
  return (
    <Link
      href={`/matches#match-${match.id}`}
      className="meeting"
      data-outcome={outcome ?? "none"}
      aria-label={t("table.open", { match: description })}
      title={description}
    >
      {outcome
        ? formatScore(language, match.goalsFor, match.goalsAgainst)
        : formatMatchDate(match.kickoffAt, language)}
    </Link>
  );
}

type LeagueTableProps = { table: LeagueRow[]; matches: SeasonMatch[] };

/** The league table, with Barça's meetings against each side linking back to the shirt. */
export function LeagueTable({ table, matches }: LeagueTableProps) {
  const t = useT();
  const meetingsByTeam = new Map<string, Meeting[]>();
  matches.forEach((match) => {
    if (!match.isLeague || !match.opponent) return;
    const meetings = meetingsByTeam.get(match.opponent.id) ?? [];
    meetingsByTeam.set(match.opponent.id, [...meetings, { match }]);
  });

  return (
    <section id="table" aria-labelledby="table-title" className="page-gutter section reveal">
      <h1 id="table-title" className="section-title">
        {t("table.title")}
      </h1>
      <p className="section-note">{t("table.note")}</p>
      {table.length === 0 ? (
        <p className="section-note">{t("table.empty")}</p>
      ) : (
        <div className="league-wrap">
          <table className="league">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">{t("table.position")}</span>
                </th>
                <th scope="col" className="league-team">
                  {t("table.team")}
                </th>
                <th scope="col" className="league-wide">
                  {t("table.played")}
                </th>
                <th scope="col" className="league-wide">
                  {t("table.won")}
                </th>
                <th scope="col" className="league-wide">
                  {t("table.drawn")}
                </th>
                <th scope="col" className="league-wide">
                  {t("table.lost")}
                </th>
                <th scope="col" className="league-wide">
                  {t("table.difference")}
                </th>
                <th scope="col">{t("table.points")}</th>
                <th scope="col" className="league-wide">
                  {t("table.form")}
                </th>
                <th scope="col">{t("table.vBarca")}</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr key={row.teamId} data-barca={row.isBarca}>
                  <td className="league-rank">{row.rank}</td>
                  <th scope="row" className="league-team">
                    <span>
                      {row.logoUrl && (
                        <Image src={row.logoUrl} alt="" width={24} height={24} unoptimized />
                      )}
                      <bdi>{row.name}</bdi>
                    </span>
                  </th>
                  <td className="league-wide">{row.played ?? "–"}</td>
                  <td className="league-wide">{row.won ?? "–"}</td>
                  <td className="league-wide">{row.drawn ?? "–"}</td>
                  <td className="league-wide">{row.lost ?? "–"}</td>
                  <td className="league-wide">{goalDifference(row)}</td>
                  <td className="league-points">{row.points}</td>
                  <td className="league-wide">
                    <FormPips form={row.form} />
                  </td>
                  <td>
                    <span className="meetings">
                      {meetingsByTeam.get(row.teamId)?.map(({ match }) => (
                        <MeetingButton key={match.id} match={match} />
                      ))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
