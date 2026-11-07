import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteNav } from "@/components/SiteNav";
import { TablePage } from "@/features/table/TablePage";

export const metadata: Metadata = {
  title: "The table · Barça Brain",
  description: "Where Barça stand in the league.",
};

export default function TableRoute() {
  return (
    <>
      <SiteNav />
      <main className="flex-1 pb-16">
        <Suspense
          fallback={
            <div role="status" aria-label="Loading" className="page-gutter section">
              <div className="skeleton h-96" />
            </div>
          }
        >
          <TablePage />
        </Suspense>
      </main>
    </>
  );
}
