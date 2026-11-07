"use client";

import Image from "next/image";
import type { LeagueRow, SeasonMatch } from "@/domain/home";
import { FormPips } from "./FormPips";
import { formatMatchDate } from "./format";
import { useSeasonSelection } from "./season-selection";
import { describeMatch, getMatchOutcome } from "./season-story";

type Meeting = { match: SeasonMatch; index: number };

function goalDifference({ goalsFor, goalsAgainst }: LeagueRow): string {
  if (goalsFor === null || goalsAgainst === null) return "–";
  const difference = goalsFor - goalsAgainst;
  return difference > 0 ? `+${difference}` : String(difference);
}

function MeetingButton({ match, index }: Meeting) {
  const { showOnShirt } = useSeasonSelection();
  const outcome = getMatchOutcome(match);
  return (
    <button
      type="button"
      className="meeting"
      data-outcome={outcome ?? "none"}
      aria-label={`Show on the shirt: ${describeMatch(match)}`}
      title={describeMatch(match)}
      onClick={() => showOnShirt(index)}
    >
      {outcome ? `${match.goalsFor}–${match.goalsAgainst}` : formatMatchDate(match.kickoffAt)}
    </button>
  );
}

type LeagueTableProps = { table: LeagueRow[]; matches: SeasonMatch[] };

/** The league table, with Barça's meetings against each side linking back to the shirt. */
export function LeagueTable({ table, matches }: LeagueTableProps) {
  const meetingsByTeam = new Map<string, Meeting[]>();
  matches.forEach((match, index) => {
    if (!match.isLeague || !match.opponent) return;
    const meetings = meetingsByTeam.get(match.opponent.id) ?? [];
    meetingsByTeam.set(match.opponent.id, [...meetings, { match, index }]);
  });

  return (
    <section id="table" aria-labelledby="table-title" className="page-gutter section reveal">
      <h2 id="table-title" className="section-title">
        The table
      </h2>
      <p className="section-note">
        Tap a score or date to find that match on the shirt. Scores are Barça&apos;s first.
      </p>
      {table.length === 0 ? (
        <p className="section-note">The table will appear after the next daily update.</p>
      ) : (
        <div className="league-wrap">
          <table className="league">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Position</span>
                </th>
                <th scope="col" className="league-team">
                  Team
                </th>
                <th scope="col" className="league-wide">
                  P
                </th>
                <th scope="col" className="league-wide">
                  W
                </th>
                <th scope="col" className="league-wide">
                  D
                </th>
                <th scope="col" className="league-wide">
                  L
                </th>
                <th scope="col" className="league-wide">
                  GD
                </th>
                <th scope="col">Pts</th>
                <th scope="col" className="league-wide">
                  Form
                </th>
                <th scope="col">v Barça</th>
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
                      {row.name}
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
                      {meetingsByTeam
                        .get(row.teamId)
                        ?.map(({ match, index }) => (
                          <MeetingButton key={match.id} match={match} index={index} />
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
