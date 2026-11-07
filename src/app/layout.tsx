import type { Metadata } from "next";
import { Big_Shoulders, Heebo, Inter } from "next/font/google";
import { AskDrawer } from "@/features/ask/AskDrawer";
import { IntroSplash } from "@/components/IntroSplash";
import { INTRO_STORAGE_KEY, LANGUAGE_STORAGE_KEY } from "@/config/display";
import { RTL_LANGUAGES } from "@/i18n/dictionary";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const display = Big_Shoulders({
  variable: "--font-display",
  subsets: ["latin"],
});

// The two fonts above have no Hebrew letters, so Hebrew pages switch to Heebo.
const hebrew = Heebo({
  variable: "--font-hebrew",
  subsets: ["hebrew", "latin"],
});

/** Runs before the first paint. Our own constant, nothing from a visitor goes into it. */
const INTRO_SKIP_SCRIPT = `try{if(sessionStorage.getItem(${JSON.stringify(INTRO_STORAGE_KEY)})||matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.intro="seen"}}catch(e){}`;

/**
 * Puts the saved language on the page before it paints, so a Hebrew reader never sees the layout
 * jump from left-to-right to right-to-left. Only our own constants go into it.
 */
const LANGUAGE_SCRIPT = `try{var l=localStorage.getItem(${JSON.stringify(LANGUAGE_STORAGE_KEY)});if(l&&${JSON.stringify(["en", ...RTL_LANGUAGES])}.indexOf(l)>-1){document.documentElement.lang=l;document.documentElement.dir=${JSON.stringify(RTL_LANGUAGES)}.indexOf(l)>-1?"rtl":"ltr"}}catch(e){}`;

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
      className={`${inter.variable} ${display.variable} ${hebrew.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Marks the intro as seen before the page paints, so it never flashes on a reload. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SKIP_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: LANGUAGE_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <IntroSplash />
        {children}
        <div aria-hidden="true" className="mosaic-band" />
        <AskDrawer />
      </body>
    </html>
  );
}
