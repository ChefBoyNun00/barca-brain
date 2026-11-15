"use client";

import Image from "next/image";
import { BARCA_CREST_URL } from "@/config/display";
import type { TextKey } from "@/i18n/dictionary";
import { useT } from "@/i18n/language";

/** What a page shows while its data arrives: the crest, turning slowly. */
export function PageLoader({ label = "loading" }: { label?: TextKey }) {
  const t = useT();
  return (
    <div role="status" aria-label={t(label)} className="page-loader">
      <Image src={BARCA_CREST_URL} alt="" width={72} height={72} unoptimized />
      <span aria-hidden="true" className="intro-bar">
        <span />
      </span>
    </div>
  );
}
