import { Frank_Ruhl_Libre, Instrument_Serif } from "next/font/google";

// The editorial serif: headlines in the news reader and the /club story. Loaded once, in the
// root layout, as CSS variables (--font-serif, --font-serif-he); pages pick them up from there.
// Instrument Serif has no Hebrew letters, so Hebrew uses Frank Ruhl Libre, a classic Hebrew serif.

export const storySerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export const storySerifHebrew = Frank_Ruhl_Libre({
  weight: "variable",
  subsets: ["hebrew", "latin"],
  variable: "--font-serif-he",
});

export const serifFontClasses = `${storySerif.variable} ${storySerifHebrew.variable}`;
