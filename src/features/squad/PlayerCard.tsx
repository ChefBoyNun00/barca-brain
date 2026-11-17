"use client";

import Link from "next/link";
import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from "react";
import { isRtl } from "@/i18n/dictionary";
import { useLanguage, useT } from "@/i18n/language";
import { PLAYER_STORIES_LIMIT } from "@/config/news";
import type { SquadPlayer } from "@/domain/home";
import { displayCompetition, formatOptionalStat } from "../home/format";
import { findPlayerStories, type Story } from "../news/stories";
import { Jersey } from "./Jersey";
import { getJersey } from "./jersey-data";
import { isLaMasia } from "./la-masia";
import {
  formatGoalsPerMatch,
  formatShareOfGoals,
  getAge,
  getPlayerTotals,
} from "./squad-stats";

type PlayerCardProps = {
  player: SquadPlayer;
  now: Date;
  teamGoals: number;
  stories: Story[];
  onClose: () => void;
  onStep: (direction: 1 | -1) => void;
};

/** The browser's own dialog, which traps focus and closes on Escape for free. */
export function PlayerCard({
  player,
  now,
  teamGoals,
  stories,
  onClose,
  onStep,
}: PlayerCardProps) {
  const t = useT();
  const language = useLanguage();
  const rtl = isRtl(language);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (dialog.current && !dialog.current.open) dialog.current.showModal();
  }, []);

  const closeOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) dialog.current?.close();
  };

  // Right to left, the next player is to the left, so the arrow keys swap.
  const stepWithArrows = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "ArrowLeft") onStep(rtl ? 1 : -1);
    if (event.key === "ArrowRight") onStep(rtl ? -1 : 1);
  };

  const totals = getPlayerTotals(player);
  const playerStories = findPlayerStories(stories, player.name, PLAYER_STORIES_LIMIT);
  const age = getAge(player.birthDate, now);
  const perMatch = formatGoalsPerMatch(totals);
  const share = formatShareOfGoals(totals.goals, teamGoals);
  const details = [
    t(player.position ? `position.${player.position}` : "position.none"),
    age !== null && t("player.age", { n: age }),
    player.nationality,
  ].filter(Boolean);

  return (
    <dialog
      ref={dialog}
      className="card-dialog"
      aria-labelledby="player-card-name"
      onClose={onClose}
      onClick={closeOnBackdrop}
      onKeyDown={stepWithArrows}
    >
      <div className="player-card" key={player.id}>
        <div className="player-card-cloth">
          <Jersey jersey={getJersey(player)} keeper={player.position === "GK"} mode="back" />
        </div>
        <div className="player-card-body">
          <h3 id="player-card-name" className="player-card-name">
            <bdi>{player.name}</bdi>
          </h3>
          <p className="player-card-details">{details.join(" · ")}</p>
          {isLaMasia(player) && <p className="player-masia">{t("squad.masiaGrad")}</p>}

          {player.stats.length === 0 ? (
            <p className="player-card-empty">{t("player.noStats")}</p>
          ) : (
            <>
              <dl className="player-figures">
                <div>
                  <dt>{t("player.goals")}</dt>
                  <dd>{totals.goals}</dd>
                </div>
                <div>
                  <dt>{t("player.assists")}</dt>
                  <dd>{formatOptionalStat(totals.assists)}</dd>
                </div>
                <div>
                  <dt>{t("player.played")}</dt>
                  <dd>{formatOptionalStat(totals.matches)}</dd>
                </div>
                {perMatch && (
                  <div>
                    <dt>{t("player.perMatch")}</dt>
                    <dd>{perMatch}</dd>
                  </div>
                )}
                {share && (
                  <div>
                    <dt>{t("player.share")}</dt>
                    <dd>{share}</dd>
                  </div>
                )}
              </dl>
              <table className="player-splits">
                <thead>
                  <tr>
                    <th scope="col">{t("player.competition")}</th>
                    <th scope="col">{t("player.played")}</th>
                    <th scope="col">{t("player.goals")}</th>
                    <th scope="col">{t("player.assists")}</th>
                  </tr>
                </thead>
                <tbody>
                  {player.stats.map((row) => (
                    <tr key={row.competition}>
                      <th scope="row">{displayCompetition(row.competition, language)}</th>
                      <td>{formatOptionalStat(row.matches)}</td>
                      <td>{row.goals}</td>
                      <td>{formatOptionalStat(row.assists)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {playerStories.length > 0 && (
            <div className="player-press">
              <h4>{t("player.press")}</h4>
              <ul>
                {playerStories.map(({ id, lead }) => (
                  <li key={id}>
                    <a href={lead.url} target="_blank" rel="noreferrer" dir="auto">
                      {(language === "he" && lead.titleHe) || lead.titleEn || lead.titleOriginal}
                    </a>{" "}
                    <span>{lead.outlet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link className="player-share" href={`/squad/${player.id}`}>
            {t("player.shareThis")} {t("arrow.out")}
          </Link>

          <div className="player-card-actions">
            <button
              type="button"
              className="wall-step"
              aria-label={t("player.prev")}
              onClick={() => onStep(-1)}
            >
              {t("arrow.back")}
            </button>
            <button type="button" className="chip" onClick={() => dialog.current?.close()}>
              {t("common.close")}
            </button>
            <button
              type="button"
              className="wall-step"
              aria-label={t("player.next")}
              onClick={() => onStep(1)}
            >
              {t("arrow.forward")}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
