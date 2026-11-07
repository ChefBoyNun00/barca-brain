"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { BARCA_CREST_URL } from "@/config/display";
import { useT } from "@/i18n/language";
import { AskChat } from "./AskChat";
import { suggestionsFor } from "./page-suggestions";

function Drawer() {
  const pathname = usePathname();
  const t = useT();
  const dialog = useRef<HTMLDialogElement>(null);
  const [everOpened, setEverOpened] = useState(false);

  // The chat is only loaded once someone opens it, then kept, so the conversation survives
  // moving between pages and closing the panel.
  const open = () => {
    setEverOpened(true);
    dialog.current?.showModal();
  };

  useEffect(() => {
    // Moving to another page closes the panel, so it never covers what you just chose.
    dialog.current?.close();
  }, [pathname]);

  const closeOnBackdrop = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) dialog.current?.close();
  };

  if (pathname.startsWith("/ask")) return null;

  return (
    <>
      <button type="button" className="ask-launch" onClick={open}>
        <Image src={BARCA_CREST_URL} alt="" width={28} height={28} unoptimized />
        <span>{t("ask.launch")}</span>
      </button>

      <dialog
        ref={dialog}
        className="ask-drawer"
        aria-labelledby="ask-drawer-title"
        onClick={closeOnBackdrop}
      >
        <div className="ask-drawer-head">
          <h2 id="ask-drawer-title">{t("ask.title")}</h2>
          <button
            type="button"
            className="ask-drawer-close"
            aria-label={t("ask.close")}
            onClick={() => dialog.current?.close()}
          >
            ✕
          </button>
        </div>
        <div className="ask-drawer-body">
          {everOpened && (
            <Suspense fallback={null}>
              <AskChat suggestions={suggestionsFor(pathname)} readQuestionFromUrl={false} />
            </Suspense>
          )}
        </div>
      </dialog>
    </>
  );
}

/** Ask Blaugrana on every page: a button at the corner that slides a chat in from the side. */
export function AskDrawer() {
  return (
    <Suspense fallback={null}>
      <Drawer />
    </Suspense>
  );
}
