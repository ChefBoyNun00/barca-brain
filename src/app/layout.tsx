import type { Metadata } from "next";
import { Big_Shoulders, Inter } from "next/font/google";
import { AskDrawer } from "@/features/ask/AskDrawer";
import { IntroSplash } from "@/components/IntroSplash";
import { INTRO_STORAGE_KEY } from "@/config/display";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const display = Big_Shoulders({
  variable: "--font-display",
  subsets: ["latin"],
});

/** Runs before the first paint. Our own constant, nothing from a visitor goes into it. */
const INTRO_SKIP_SCRIPT = `try{if(sessionStorage.getItem(${JSON.stringify(INTRO_STORAGE_KEY)})||matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.intro="seen"}}catch(e){}`;

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
      className={`${inter.variable} ${display.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Marks the intro as seen before the page paints, so it never flashes on a reload. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SKIP_SCRIPT }} />
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
