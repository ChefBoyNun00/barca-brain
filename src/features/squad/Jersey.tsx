import type { Jersey as JerseyData } from "./jersey-data";

type JerseyProps = {
  jersey: JerseyData;
  /** "flip" turns to the back on hover or focus. "back" shows the back only. */
  mode: "flip" | "back";
};

/** A Barça shirt drawn with CSS. The back carries the name and number. Purely decorative. */
export function Jersey({ jersey, mode }: JerseyProps) {
  return (
    <span aria-hidden="true" className="jersey" data-mode={mode}>
      <span className="jersey-turn">
        <span className="jersey-face jersey-front">
          <span className="jersey-collar" />
        </span>
        <span className="jersey-face jersey-back">
          <span className="jersey-printed">{jersey.printed}</span>
          <span className="jersey-number">{jersey.number ?? "–"}</span>
        </span>
      </span>
    </span>
  );
}
