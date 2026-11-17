"use client";

import { useState, type ReactNode } from "react";
import { useT } from "@/i18n/language";

/**
 * Keeps the page short: the first stories show, the rest wait behind one button. The stories are
 * already on the page (rendered on the server), so opening them is instant.
 */
export function MoreStories({ count, children }: { count: number; children: ReactNode }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  if (count === 0) return null;
  return (
    <>
      <div className="rd-more-list" hidden={!open}>
        {children}
      </div>
      {!open && (
        <button type="button" className="pill rd-more" onClick={() => setOpen(true)}>
          {t("news.moreStories", { count })}
        </button>
      )}
    </>
  );
}
