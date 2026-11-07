"use client";

export type Choice<Id extends string> = { id: Id; label: string };

type ChoiceChipsProps<Id extends string> = {
  label: string;
  choices: readonly Choice<Id>[];
  value: Id;
  onChange: (id: Id) => void;
};

/** A row of pill buttons where exactly one is active. */
export function ChoiceChips<Id extends string>({
  label,
  choices,
  value,
  onChange,
}: ChoiceChipsProps<Id>) {
  return (
    <div role="group" aria-label={label} className="chips">
      {choices.map((choice) => (
        <button
          key={choice.id}
          type="button"
          className="chip"
          aria-pressed={choice.id === value}
          onClick={() => onChange(choice.id)}
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}
