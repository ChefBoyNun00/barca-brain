"use client";

import { useT } from "@/i18n/language";
import { ShareBar } from "../share/ShareBar";

/** The player's share picture and the ways to share it. */
export function PlayerShare({ id, name }: { id: string; name: string }) {
  const t = useT();
  return (
    <>
      <p className="section-note">{t("share.playerNote")}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="share-preview" src={`/card/player/${id}`} alt={t("share.playerAlt", { name })} />
      <ShareBar path={`/squad/${id}`} cardPath={`/card/player/${id}`} title={name} />
    </>
  );
}
