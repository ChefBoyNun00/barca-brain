"use client";

import { useState } from "react";
import { Jersey } from "../squad/Jersey";
import { SHIRT_DEFAULT, SHIRT_NAME_MAX, cleanShirtInput } from "./shirt-input";
import { ShareBar } from "./ShareBar";

type ShirtMakerProps = { initialName: string; initialNumber: number | null };

/** Type a name and number, see the shirt, and take the picture away. */
export function ShirtMaker({ initialName, initialNumber }: ShirtMakerProps) {
  const [name, setName] = useState(initialName === SHIRT_DEFAULT.name ? "" : initialName);
  const [number, setNumber] = useState(initialNumber === null ? "" : String(initialNumber));

  const clean = cleanShirtInput(name, number);
  const jersey = { printed: clean.name, number: clean.number };
  const query = `name=${encodeURIComponent(clean.name)}${
    clean.number === null ? "" : `&number=${clean.number}`
  }`;

  const remember = () => window.history.replaceState(null, "", `/shirt?${query}`);

  return (
    <div className="shirt-maker">
      <div className="shirt-preview" aria-hidden="true">
        <Jersey jersey={jersey} mode="front" />
        <Jersey jersey={jersey} mode="back" />
      </div>

      <form className="shirt-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          <span>Name on the back</span>
          <input
            type="text"
            value={name}
            maxLength={SHIRT_NAME_MAX}
            placeholder="Your name"
            autoComplete="off"
            onChange={(event) => setName(event.target.value)}
            onBlur={remember}
          />
        </label>
        <label>
          <span>Number</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={99}
            value={number}
            placeholder="10"
            onChange={(event) => setNumber(event.target.value)}
            onBlur={remember}
          />
        </label>
        <p className="shirt-note">
          Printed as <strong>{clean.name}</strong>
          {clean.number === null ? " with no number." : `, number ${clean.number}.`}
        </p>
        <ShareBar
          path={`/shirt?${query}`}
          cardPath={`/card/shirt?${query}`}
          title="My Barça shirt"
        />
      </form>
    </div>
  );
}
