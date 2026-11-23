import { Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";

// The editorial serif: headlines in the news reader and the /club story. Loaded once, in the
// root layout, as CSS variables (--font-serif, --font-serif-he); pages pick them up from there.
// Instrument Serif has no Hebrew letters. Hebrew uses the narrow cut of Noto Serif Hebrew, which
// has the same tall, slim, light shape, so a Hebrew headline looks like the English one.

export const storySerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
});

// Self-hosted because Google's loader only gives the normal width; the file holds Hebrew letters
// only, so Latin names inside a Hebrew headline stay in Instrument Serif.
export const storySerifHebrew = localFont({
  src: [{ path: "../assets/fonts/NotoSerifHebrew-Condensed.woff2", weight: "300 700", style: "normal" }],
  variable: "--font-serif-he",
  declarations: [
    { prop: "font-stretch", value: "62.5%" },
    { prop: "unicode-range", value: "U+0590-05FF, U+FB1D-FB4F" },
  ],
  adjustFontFallback: false,
});

export const serifFontClasses = `${storySerif.variable} ${storySerifHebrew.variable}`;
