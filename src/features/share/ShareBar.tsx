"use client";

import { useState, useSyncExternalStore } from "react";

type ShareBarProps = {
  /** The page to share, as a path such as /matches/abc. */
  path: string;
  /** The picture for it, as a path such as /card/match/abc. */
  cardPath: string;
  title: string;
};

const withDownload = (cardPath: string) =>
  `${cardPath}${cardPath.includes("?") ? "&" : "?"}download=1`;

/** Share, copy the link, or save the picture. Share only shows where the browser supports it. */
export function ShareBar({ path, cardPath, title }: ShareBarProps) {
  // False on the server, so the first paint matches, then true where the browser can share.
  const canShare = useSyncExternalStore(
    () => () => {},
    () => typeof navigator.share === "function",
    () => false,
  );
  const [copied, setCopied] = useState(false);

  const url = () => `${window.location.origin}${path}`;

  const share = async () => {
    try {
      await navigator.share({ title, url: url() });
    } catch {
      // Closing the share sheet is not an error.
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url());
    }
  };

  return (
    <div className="share-bar">
      {canShare && (
        <button type="button" className="btn-primary" onClick={share}>
          Share
        </button>
      )}
      <button type="button" className="chip chip-action" onClick={copy} aria-live="polite">
        {copied ? "Link copied" : "Copy link"}
      </button>
      <a className="chip chip-action" href={withDownload(cardPath)} download>
        Save the picture
      </a>
    </div>
  );
}
