"use client";

import { useLanguage, useT } from "@/i18n/language";
import { describeOutcome, outcomeLetter, parseForm } from "./season-story";

/** Recent results, oldest on the left. The letter carries the meaning, not the colour. */
export function FormPips({ form }: { form: string | null }) {
  const t = useT();
  const language = useLanguage();
  const outcomes = parseForm(form);
  if (outcomes.length === 0) return <span className="form-empty">–</span>;
  const summary = outcomes.map((outcome) => describeOutcome(outcome, language)).join(", ");
  return (
    <span className="form-pips" role="img" aria-label={t("form.aria", { summary })}>
      {outcomes.map((outcome, index) => (
        <span
          key={index}
          className="form-pip"
          data-outcome={outcome}
          data-prev={index > 0 ? outcomes[index - 1] : undefined}
          style={{ "--i": index } as React.CSSProperties}
        >
          {outcomeLetter(outcome, language)}
        </span>
      ))}
    </span>
  );
}
