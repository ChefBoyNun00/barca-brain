"use client";

import type { Choice } from "./ChoiceChips";

type SegmentedProps<Id extends string> = {
  label: string;
  choices: readonly Choice<Id>[];
  value: Id;
  onChange: (id: Id) => void;
};

/** Equal-width options with a highlight that slides to the chosen one. */
export function Segmented<Id extends string>({
  label,
  choices,
  value,
  onChange,
}: SegmentedProps<Id>) {
  const index = Math.max(
    0,
    choices.findIndex((choice) => choice.id === value),
  );
  return (
    <div
      role="group"
      aria-label={label}
      className="segmented"
      style={{ "--count": choices.length, "--index": index } as React.CSSProperties}
    >
      <span aria-hidden="true" className="segmented-thumb" />
      {choices.map((choice) => (
        <button
          key={choice.id}
          type="button"
          aria-pressed={choice.id === value}
          onClick={() => onChange(choice.id)}
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}
