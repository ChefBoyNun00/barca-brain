"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BARCA_CREST_URL, INTRO_STORAGE_KEY } from "@/config/display";

/** How long the crest has the screen to itself, then how long the fade out takes. */
const SHOW_MS = 2400;
const FADE_MS = 550;

type Phase = "show" | "out" | "gone";

/**
 * The first thing on a visit: the crest turning in, the club's words, a stripe filling. Plays once
 * per visit. A click or any key skips it. Visitors who asked for less motion never see it.
 */
export function IntroSplash() {
  const [phase, setPhase] = useState<Phase>("show");

  useEffect(() => {
    const seen = document.documentElement.dataset.intro === "seen";
    let leave: number | undefined;
    const fadeOut = () => {
      setPhase("out");
      leave = window.setTimeout(() => setPhase("gone"), seen ? 0 : FADE_MS);
    };
    const timer = window.setTimeout(fadeOut, seen ? 0 : SHOW_MS);
    const skip = () => {
      window.clearTimeout(timer);
      fadeOut();
    };
    window.addEventListener("keydown", skip, { once: true });
    try {
      window.sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
    } catch {
      // Without storage it simply plays again on the next load.
    }
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(leave);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div className="intro" data-phase={phase} aria-hidden="true" onClick={() => setPhase("out")}>
      <div className="intro-crest">
        <Image src={BARCA_CREST_URL} alt="" width={128} height={128} unoptimized priority />
      </div>
      <p className="intro-word">Més que un club</p>
      <span className="intro-bar">
        <span />
      </span>
    </div>
  );
}
