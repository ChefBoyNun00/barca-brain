import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/PageLoader";
import { SiteNav } from "@/components/SiteNav";
import { AskChat } from "@/features/ask/AskChat";
import { T } from "@/i18n/language";

export const metadata: Metadata = {
  title: "Ask Blaugrana · Barça Brain",
  description: "Ask about Barça, or paste Spanish to translate it.",
};

export default function Ask() {
  return (
    <>
      <SiteNav />
      {/* Same title, note and spacing as Matches, Table and Squad: every page opens the same way. */}
      <main className="page-gutter flex-1 pb-16">
        <section className="section">
          <h1 className="section-title">
            <T k="ask.title" />
          </h1>
          <p className="section-note">
            <T k="ask.kicker" />
          </p>
          <Suspense fallback={<PageLoader />}>
            <AskChat />
          </Suspense>
        </section>
      </main>
    </>
  );
}
