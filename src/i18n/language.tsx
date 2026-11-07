"use client";

import { useSyncExternalStore } from "react";
import { LANGUAGES, translate, type Language, type TextKey, type TextVars } from "./dictionary";

const STORAGE_KEY = "barca-brain:language";
const CHANGE_EVENT = "barca-brain:language-change";

function read(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.find((language) => language === stored) ?? "en";
  } catch {
    return "en";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The chosen language. The server and the first paint are English, then it switches. */
export function useLanguage(): Language {
  return useSyncExternalStore(subscribe, read, () => "en");
}

export function setLanguage(language: Language) {
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Without storage the choice lasts until the page reloads.
  }
  document.documentElement.lang = language;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** For client components: const t = useT(); t("nav.home"). */
export function useT() {
  const language = useLanguage();
  return (key: TextKey, vars?: TextVars) => translate(language, key, vars);
}

/** For server components: <T k="home.explore" /> writes the text in the visitor's language. */
export function T({ k, vars }: { k: TextKey; vars?: TextVars }) {
  return <>{useT()(k, vars)}</>;
}
