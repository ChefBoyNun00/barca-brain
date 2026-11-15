"use client";

import type { SeasonMatch } from "@/domain/home";
import { useLanguage, useT } from "@/i18n/language";
import { describeMatch } from "../home/season-story";
import { ShareBar } from "../share/ShareBar";

/** The picture that goes with a share, and the ways to share it. */
export function MatchShare({ match }: { match: SeasonMatch }) {
  const t = useT();
  const description = describeMatch(match, useLanguage());
  return (
    <section className="room-section" aria-labelledby="room-share-title">
      <h2 id="room-share-title" className="nw-section-title">
        {t("room.shareTitle")}
      </h2>
      <p className="section-note">{t("share.matchNote")}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="share-preview" src={`/card/match/${match.id}`} alt={description} />
      <ShareBar path={`/matches/${match.id}`} cardPath={`/card/match/${match.id}`} title={description} />
    </section>
  );
}
