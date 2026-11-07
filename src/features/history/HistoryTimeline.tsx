"use client";

import Link from "next/link";
import { useState } from "react";
import { ChoiceChips } from "@/components/ChoiceChips";
import { HISTORY_MOMENTS, HISTORY_TAGS, type HistoryTag } from "@/config/history";
import type { TextKey } from "@/i18n/dictionary";
import { useT } from "@/i18n/language";

type Filter = "all" | HistoryTag;

/** The club's best moments, oldest first, down a line of years. */
export function HistoryTimeline() {
  const t = useT();
  const [filter, setFilter] = useState<Filter>("all");
  const choices = (["all", ...HISTORY_TAGS] as Filter[]).map((id) => ({
    id,
    label: t(`history.${id}` as TextKey),
  }));
  const shown = HISTORY_MOMENTS.filter(
    (moment) => filter === "all" || moment.tags.includes(filter),
  );

  return (
    <>
      <div className="squad-controls">
        <ChoiceChips
          label="Filter the moments"
          choices={choices}
          value={filter}
          onChange={setFilter}
        />
      </div>
      <ol className="timeline">
        {shown.map((moment, index) => (
          <li key={moment.id} className="moment" data-side={index % 2 === 0 ? "left" : "right"}>
            <span aria-hidden="true" className="moment-year">
              {moment.year}
            </span>
            <article className="moment-card">
              <p className="moment-when">{moment.when}</p>
              <h2 className="moment-title">{moment.title}</h2>
              <p className="moment-story">{moment.story}</p>
              <details className="moment-fact">
                <summary>{t("history.fact")}</summary>
                <p>{moment.fact}</p>
              </details>
              <div className="moment-tags">
                {moment.tags.map((tag) => (
                  <span key={tag}>{t(`history.${tag}` as TextKey)}</span>
                ))}
                <Link
                  href={{ pathname: "/ask", query: { q: `Tell me about ${moment.title}` } }}
                  className="moment-ask"
                >
                  {t("history.ask")} →
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </>
  );
}
