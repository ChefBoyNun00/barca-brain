import type { Metadata } from "next";
import { Big_Shoulders, Heebo, IBM_Plex_Mono, Inter } from "next/font/google";
import { AskDrawer } from "@/features/ask/AskDrawer";
import { IntroSplash } from "@/components/IntroSplash";
import { serifFontClasses } from "@/components/serif-fonts";
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

// The fonts above have no Hebrew letters, so Hebrew pages switch to Heebo.
const hebrew = Heebo({
  variable: "--font-hebrew",
  subsets: ["hebrew", "latin"],
});

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
      className={`${inter.variable} ${display.variable} ${hebrew.variable} ${mono.variable} ${serifFontClasses} h-full antialiased`}
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
      </body>
    </html>
  );
}
