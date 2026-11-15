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
      <main className="page-gutter flex-1 pt-10 pb-8">
        <p className="kicker">
          <T k="ask.kicker" />
        </p>
        <h1 className="display-title mt-3">
          <T k="ask.title" />
        </h1>
        <Suspense fallback={<PageLoader />}>
          <AskChat />
        </Suspense>
      </main>
    </>
  );
}
