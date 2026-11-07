import { describeOutcome, parseForm } from "./season-story";

/** Recent results, oldest on the left. The letter carries the meaning, not the colour. */
export function FormPips({ form }: { form: string | null }) {
  const outcomes = parseForm(form);
  if (outcomes.length === 0) return <span className="form-empty">–</span>;
  const summary = outcomes.map(describeOutcome).join(", ");
  return (
    <span className="form-pips" role="img" aria-label={`Recent form, oldest first: ${summary}`}>
      {outcomes.map((outcome, index) => (
        <span key={index} className="form-pip" data-outcome={outcome}>
          {outcome}
        </span>
      ))}
    </span>
  );
}
