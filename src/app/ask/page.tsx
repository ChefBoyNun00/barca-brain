import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteNav } from "@/components/SiteNav";
import { AskChat } from "@/features/ask/AskChat";

export const metadata: Metadata = {
  title: "Ask Blaugrana · Barça Brain",
  description: "Ask about Barça, or paste Spanish to translate it.",
};

export default function Ask() {
  return (
    <>
      <SiteNav />
      <main className="page-gutter flex-1 pt-10 pb-8">
        <p className="kicker">This season&apos;s numbers, the Spanish press, and a translator</p>
        <h1 className="display-title mt-3">Ask Blaugrana</h1>
        <Suspense fallback={<div role="status" aria-label="Loading" className="skeleton mt-8 h-40" />}>
          <AskChat />
        </Suspense>
      </main>
    </>
  );
}
