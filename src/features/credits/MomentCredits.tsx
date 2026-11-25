"use client";

import type { Moment } from "@/config/moments";
import { useLanguage } from "@/i18n/language";

/**
 * One line per background photo: what it shows, who took it, and its licence.
 * CC BY and CC BY-SA ask for all three, plus a link to the original.
 */
export function MomentCredits({ moments }: { moments: readonly Moment[] }) {
  const language = useLanguage();
  return (
    <ul className="credits">
      {moments.map((moment) => (
        <li key={moment.src}>
          <span className="credits-player">{language === "he" ? moment.labelHe : moment.label}</span>
          <span>
            <a href={moment.pageUrl} target="_blank" rel="noreferrer">
              <bdi>{moment.credit}</bdi>
            </a>
            {", "}
            {moment.licenseUrl ? (
              <a href={moment.licenseUrl} target="_blank" rel="noreferrer">
                {moment.license}
              </a>
            ) : (
              moment.license
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
