"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { TextKey, TextVars } from "@/i18n/dictionary";
import { useT } from "@/i18n/language";

type AskLinkProps = {
  /** The question to open Ask Blaugrana with, written in the visitor's language. */
  question: TextKey;
  vars?: TextVars;
  className?: string;
  children: ReactNode;
};

/** Opens /ask with a question already typed, so a Hebrew reader asks in Hebrew. */
export function AskLink({ question, vars, className, children }: AskLinkProps) {
  const t = useT();
  return (
    <Link href={{ pathname: "/ask", query: { q: t(question, vars) } }} className={className}>
      {children}
    </Link>
  );
}
