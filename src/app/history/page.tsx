import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { HistoryTimeline } from "@/features/history/HistoryTimeline";
import { T } from "@/i18n/language";

export const metadata: Metadata = {
  title: "Best moments · Barça Brain",
  description: "The nights that made FC Barcelona, from 1899 to today.",
};

export default function HistoryPage() {
  return (
    <>
      <SiteNav />
      <main className="page-gutter flex-1 pt-10 pb-16">
        <p className="kicker">Més que un club</p>
        <h1 className="display-title mt-3">
          <T k="history.title" />
        </h1>
        <p className="mt-4 max-w-2xl">
          <T k="history.note" />
        </p>
        <HistoryTimeline />
        <p className="section-note mt-8">
          <T k="history.sources" />
        </p>
      </main>
    </>
  );
}
