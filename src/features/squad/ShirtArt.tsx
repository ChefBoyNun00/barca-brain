import { BARCA_CREST_URL } from "@/config/display";
import type { Jersey as JerseyData } from "./jersey-data";

// Drawn from the colours of the 2026-27 home kit: three reds, three blues, a navy collar and
// cuffs, yellow trim. It is our own illustration, not Nike's or the club's artwork.
const REDS = ["#8c0f35", "#a50044", "#c2124d"] as const;
const BLUES = ["#0b2a6b", "#004d98", "#1767b8"] as const;
const KEEPER = ["#f2c200", "#e2b400"] as const;
const NAVY = "#0a1230";
const YELLOW = "#f5c518";
const STRIPES = 12;
const WIDTH = 200;

// Shirt outline, sleeves included. Only the neckline differs between front and back.
const BODY =
  "M78 10 L28 28 L2 86 L34 98 L50 70 L50 212 Q100 218 150 212 L150 70 L166 98 L198 86 L172 28 L122 10";
const NECK = { front: "Q100 40 78 10", back: "Q100 22 78 10" } as const;
const NECK_LINE = { front: "M78 10 Q100 40 122 10", back: "M78 10 Q100 22 122 10" } as const;
const TRIM_LINE = { front: "M79 15 Q100 44 121 15", back: "M79 14 Q100 26 121 14" } as const;

export type Side = "front" | "back";
function stripeColour(index: number, keeper: boolean): string {
  if (keeper) return KEEPER[index % 2] ?? KEEPER[0];
  const shade = Math.floor(index / 2) % 3;
  return (index % 2 === 0 ? REDS[shade] : BLUES[shade]) ?? REDS[0];
}

type ShirtArtProps = {
  side: Side;
  jersey: JerseyData;
  keeper: boolean;
  /** Makes the ids inside the drawing unique when several shirts share one page. */
  idPrefix: string;
  /** Leave the name and number off, to lay them on top as real text (used for share images). */
  withText?: boolean;
  /** Pixel size, needed where CSS cannot size the drawing (share images). */
  size?: { width: number; height: number };
};

/** The shirt drawing. No hooks, so the page and the share images draw the same shirt. */
export function ShirtArt({
  side,
  jersey,
  keeper,
  idPrefix: id,
  withText = true,
  size,
}: ShirtArtProps) {
  const clip = `${id}-clip`;
  const shade = `${id}-shade`;
  const ink = keeper ? NAVY : YELLOW;
  const outline = keeper ? "none" : NAVY;
  const text = {
    textAnchor: "middle" as const,
    fill: ink,
    stroke: outline,
    strokeWidth: 3,
    paintOrder: "stroke" as const,
    style: { fontFamily: "var(--font-display)", fontWeight: 900 },
  };

  return (
    <svg viewBox="0 0 200 224" focusable="false" width={size?.width} height={size?.height}>
      <defs>
        <clipPath id={clip}>
          <path d={`${BODY} ${NECK[side]} Z`} />
        </clipPath>
        <linearGradient id={shade} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.3" />
          <stop offset="0.2" stopColor="#000" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="0.8" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clip})`}>
        {Array.from({ length: STRIPES }, (_, index) => (
          <rect
            key={index}
            x={(index * WIDTH) / STRIPES}
            width={WIDTH / STRIPES + 0.5}
            height="224"
            fill={stripeColour(index, keeper)}
          />
        ))}
        <rect width={WIDTH} height="224" fill={`url(#${shade})`} />
        <path
          d="M50 70 Q46 40 28 28 M150 70 Q154 40 172 28"
          fill="none"
          stroke="#000"
          opacity="0.22"
        />
        <path d="M2 86 L34 98 M198 86 L166 98" stroke={NAVY} strokeWidth="14" />
        <path d={NECK_LINE[side]} fill="none" stroke={NAVY} strokeWidth="9" />
        <path d={TRIM_LINE[side]} fill="none" stroke={YELLOW} strokeWidth="1.4" />
      </g>
      {!withText ? null : side === "front" ? (
        <>
          <image href={BARCA_CREST_URL} x="112" y="40" width="22" height="22" />
          {jersey.number !== null && (
            <text x="100" y="138" fontSize="60" {...text}>
              {jersey.number}
            </text>
          )}
        </>
      ) : (
        <>
          <text
            x="100"
            y="76"
            fontSize="13"
            textLength={Math.min(70, jersey.printed.length * 9)}
            lengthAdjust="spacingAndGlyphs"
            {...text}
          >
            {jersey.printed}
          </text>
          <text x="100" y="146" fontSize="74" {...text}>
            {jersey.number ?? "–"}
          </text>
        </>
      )}
    </svg>
  );
}
