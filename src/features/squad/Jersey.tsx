"use client";

import { useId } from "react";
import type { Jersey as JerseyData } from "./jersey-data";
import { ShirtArt } from "./ShirtArt";

type JerseyProps = {
  jersey: JerseyData;
  keeper?: boolean;
  /** "flip" turns to the back on hover or focus. "back" shows the back only. */
  mode: "flip" | "back" | "front";
};

/** A Barça shirt. "front" holds still on the front. The front shows the crest and number, the back the printed name. Decorative. */
export function Jersey({ jersey, keeper = false, mode }: JerseyProps) {
  const id = useId();
  return (
    <span aria-hidden="true" className="jersey" data-mode={mode}>
      <span className="jersey-turn">
        <span className="jersey-face jersey-front">
          <ShirtArt side="front" jersey={jersey} keeper={keeper} idPrefix={`${id}f`} />
        </span>
        <span className="jersey-face jersey-back">
          <ShirtArt side="back" jersey={jersey} keeper={keeper} idPrefix={`${id}b`} />
        </span>
      </span>
    </span>
  );
}
