import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Big_Shoulders, IBM_Plex_Mono, Inter, Noto_Sans_Hebrew } from "next/font/google";
import localFont from "next/font/local";
import { AskDrawer } from "@/features/ask/AskDrawer";
import { SiteAnalytics } from "@/features/analytics/SiteAnalytics";
import { IntroSplash } from "@/components/IntroSplash";
import { serifFontClasses, storySerif } from "@/components/serif-fonts";
import { PointerTilt } from "@/components/motion/PointerTilt";
import { LanguageReady } from "@/components/LanguageReady";
import { SiteFooter } from "@/components/SiteFooter";
import { INTRO_STORAGE_KEY, LANGUAGE_STORAGE_KEY } from "@/config/display";
import { LANGUAGES, RTL_LANGUAGES } from "@/i18n/dictionary";
import "./globals.css";
// The premium layer: loaded after globals.css so its look wins. See the note at its top.
import "./premium.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const display = Big_Shoulders({
  variable: "--font-display",
  subsets: ["latin"],
});

// Small captions and labels: wide-spaced capitals in a typewriter face.
const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// The fonts above have no Hebrew letters. Hebrew pages keep them for Latin letters and digits, so
// names, scores and numbers look exactly as in English, and only the Hebrew letters come from
// Noto Sans Hebrew, which is built on the same proportions as Inter.
const hebrew = Noto_Sans_Hebrew({
  variable: "--font-hebrew",
  subsets: ["hebrew"],
});

// Hebrew headlines: the narrow cut of the same font, to stand next to Big Shoulders. Self-hosted
// because Google's loader only gives the normal width; the file holds Hebrew letters only.
const hebrewDisplay = localFont({
  src: [{ path: "../assets/fonts/NotoSansHebrew-Condensed.woff2", weight: "500 900", style: "normal" }],
  variable: "--font-hebrew-display",
  declarations: [
    { prop: "font-stretch", value: "62.5%" },
    { prop: "unicode-range", value: "U+0590-05FF, U+FB1D-FB4F" },
    // Its Hebrew letters are shorter than Big Shoulders' tall capitals; this evens them out.
    { prop: "size-adjust", value: "110%" },
  ],
  adjustFontFallback: false,
});

/**
 * "'Inter', 'Inter Fallback'" becomes "'Inter'": the web font alone. The fallback is a resized
 * Arial that also has Hebrew letters, so left in a Hebrew stack it would draw them before our
 * Hebrew font got a turn. Read from next/font, so the real family names are never hand-copied.
 */
function webFontOnly(font: { style: { fontFamily: string } }): string {
  return (font.style.fontFamily.split(",")[0] ?? font.style.fontFamily).trim();
}

/** The Latin faces on their own, for the Hebrew font stacks in globals.css. */
const latinFaces = {
  "--latin-body": webFontOnly(inter),
  "--latin-display": webFontOnly(display),
  "--latin-serif": webFontOnly(storySerif),
} as CSSProperties;

/** Runs before the first paint. Our own constant, nothing from a visitor goes into it. */
const INTRO_SKIP_SCRIPT = `try{if(sessionStorage.getItem(${JSON.stringify(INTRO_STORAGE_KEY)})||matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.intro="seen"}}catch(e){}`;

/**
 * Puts the saved language on the page before it paints, so a Hebrew reader never sees the layout
 * jump from left-to-right to right-to-left. The text itself is still English until the app
 * starts, so it also marks the page as waiting (data-lang-pending), which keeps it hidden until
 * <LanguageReady /> sees the switch. Only our own constants go into it.
 */
const LANGUAGE_SCRIPT = `try{var l=localStorage.getItem(${JSON.stringify(LANGUAGE_STORAGE_KEY)}),d=document.documentElement;if(l&&${JSON.stringify(LANGUAGES)}.indexOf(l)>-1){d.lang=l;d.dir=${JSON.stringify(RTL_LANGUAGES)}.indexOf(l)>-1?"rtl":"ltr";if(l!=="en")d.dataset.langPending=l}}catch(e){}`;

/** Link previews need full addresses. Vercel tells us the live one; locally it is localhost. */
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Barça Brain",
  description: "An FC Barcelona app you can talk to.",
  openGraph: { images: ["/card/season"], siteName: "Barça Brain" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${display.variable} ${hebrew.variable} ${hebrewDisplay.variable} ${mono.variable} ${serifFontClasses} h-full antialiased`}
      style={latinFaces}
      suppressHydrationWarning
    >
      <head>
        {/* Marks the intro as seen before the page paints, so it never flashes on a reload. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SKIP_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: LANGUAGE_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <IntroSplash />
        <PointerTilt />
        <LanguageReady />
        {children}
        <div aria-hidden="true" className="mosaic-band" />
        <SiteFooter />
        <AskDrawer />
        <SiteAnalytics />
      </body>
    </html>
  );
}
