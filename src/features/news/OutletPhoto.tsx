"use client";

import { useState, type ReactNode } from "react";

/**
 * The outlet's own photo for a story, loaded straight from the outlet (no copy is kept), with the
 * outlet credited. If the outlet's server refuses it or it is gone, the fallback shows instead,
 * so a story never sits under a broken image.
 */
export function OutletPhoto({
  src,
  credit,
  fallback,
  priority = false,
}: {
  src: string;
  /** Shown on the photo, e.g. "Photo: Mundo Deportivo". */
  credit: ReactNode;
  fallback: ReactNode;
  /** The lead photo loads straight away; the rest wait until they are near the screen. */
  priority?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  if (broken) return <>{fallback}</>;
  return (
    <figure className="rd-photo">
      {/* A plain img on purpose: these come from many outlets' servers, and next/image would
          need every host listed. Lazy-loaded, sized by CSS, no referrer sent to the outlet. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
      />
      {credit && <figcaption className="rd-credit">{credit}</figcaption>}
    </figure>
  );
}
