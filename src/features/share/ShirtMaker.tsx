"use client";

import { useState } from "react";
import { useT } from "@/i18n/language";
import { Jersey } from "../squad/Jersey";
import { SHIRT_DEFAULT, SHIRT_NAME_MAX, cleanShirtInput } from "./shirt-input";
import { ShareBar } from "./ShareBar";

type ShirtMakerProps = { initialName: string; initialNumber: number | null };

/** Type a name and number, see the shirt, and take the picture away. */
export function ShirtMaker({ initialName, initialNumber }: ShirtMakerProps) {
  const t = useT();
  const [name, setName] = useState(initialName === SHIRT_DEFAULT.name ? "" : initialName);
  const [number, setNumber] = useState(initialNumber === null ? "" : String(initialNumber));

  const clean = cleanShirtInput(name, number);
  const jersey = { printed: clean.name, number: clean.number };
  const query = `name=${encodeURIComponent(clean.name)}${
    clean.number === null ? "" : `&number=${clean.number}`
  }`;

  const remember = () => window.history.replaceState(null, "", `/shirt?${query}`);

  return (
    <div className="shirt-maker">
      <div className="shirt-preview" aria-hidden="true">
        <Jersey jersey={jersey} mode="front" />
        <Jersey jersey={jersey} mode="back" />
      </div>

      <form className="shirt-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          <span>{t("shirt.name")}</span>
          <input
            type="text"
            value={name}
            maxLength={SHIRT_NAME_MAX}
            placeholder={t("shirt.namePlaceholder")}
            dir="auto"
            autoComplete="off"
            onChange={(event) => setName(event.target.value)}
            onBlur={remember}
          />
        </label>
        <label>
          <span>{t("shirt.number")}</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={99}
            value={number}
            placeholder="10"
            onChange={(event) => setNumber(event.target.value)}
            onBlur={remember}
          />
        </label>
        <p className="shirt-note">
          {t("shirt.printed")} <bdi><strong>{clean.name}</strong></bdi>
          {clean.number === null
            ? ` ${t("shirt.noNumber")}`
            : `, ${t("shirt.withNumber", { n: clean.number })}`}
        </p>
        <ShareBar
          path={`/shirt?${query}`}
          cardPath={`/card/shirt?${query}`}
          title={t("shirt.shareTitle")}
        />
      </form>
    </div>
  );
}
