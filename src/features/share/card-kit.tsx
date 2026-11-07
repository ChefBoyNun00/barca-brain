import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/og";
import type { ReactElement, ReactNode } from "react";
import { BARCA_CREST_URL } from "@/config/display";

export const CARD_SIZE = { width: 1200, height: 630 } as const;
export const CARD_COLOURS = {
  navy: "#0a1230",
  blue: "#004d98",
  garnet: "#a50044",
  gold: "#edbb00",
} as const;

const STRIPES = 25;

async function loadFont(): Promise<ArrayBuffer> {
  const file = fileURLToPath(new URL("../../assets/fonts/BebasNeue-Regular.ttf", import.meta.url));
  const buffer = await readFile(file);
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

/** Every share card is drawn on this: a strip of the shirt on top, the crest and name below. */
export function CardFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        color: "#ffffff",
        background: CARD_COLOURS.navy,
        fontFamily: "Bebas",
      }}
    >
      <div style={{ display: "flex", height: 24 }}>
        {Array.from({ length: STRIPES }, (_, index) => (
          <div
            key={index}
            style={{
              width: 48,
              height: 24,
              background: index % 2 === 0 ? CARD_COLOURS.garnet : CARD_COLOURS.blue,
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", flex: 1, padding: "28px 56px 8px" }}>{children}</div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 56px 26px",
          fontSize: 28,
          letterSpacing: 3,
          color: "rgba(255,255,255,0.75)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BARCA_CREST_URL} alt="" width={44} height={44} />
          <span>BARÇA BRAIN</span>
        </div>
        <span style={{ color: CARD_COLOURS.gold }}>MÉS QUE UN CLUB</span>
      </div>
    </div>
  );
}

/** Turns a card into a PNG. Add ?download=1 to the URL to make the browser save it. */
export async function renderCard(
  element: ReactElement,
  options: { download?: string } = {},
): Promise<ImageResponse> {
  const font = await loadFont();
  return new ImageResponse(element, {
    ...CARD_SIZE,
    fonts: [{ name: "Bebas", data: font, style: "normal", weight: 400 }],
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
      ...(options.download
        ? { "Content-Disposition": `attachment; filename="${options.download}.png"` }
        : {}),
    },
  });
}

export const wantsDownload = (url: string) => new URL(url).searchParams.has("download");
