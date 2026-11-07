"use client";

import { setLanguage, useLanguage } from "@/i18n/language";

const OPTIONS = [
  { id: "ca", label: "CA", name: "Català" },
  { id: "en", label: "EN", name: "English" },
] as const;

/** Català / English. Remembers the choice in this browser. */
export function LanguageToggle() {
  const language = useLanguage();
  return (
    <div role="group" aria-label="Language" className="lang-toggle">
      {OPTIONS.map(({ id, label, name }) => (
        <button
          key={id}
          type="button"
          lang={id}
          title={name}
          aria-pressed={language === id}
          onClick={() => setLanguage(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
