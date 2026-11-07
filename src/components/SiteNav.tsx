"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BARCA_CREST_URL } from "@/config/display";

type Section = { href: string; label: string; icon: ReactNode; also?: string[] };

const icon = (paths: string) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="tab-icon">
    <path d={paths} />
  </svg>
);

/** The main features, in the order fans reach for them. Add a page here to add a tab. */
const SECTIONS: Section[] = [
  { href: "/", label: "Home", icon: icon("M3 11l9-8 9 8v10H15v-7H9v7H3z") },
  {
    href: "/news",
    label: "News",
    icon: icon("M4 4h13v16H6a2 2 0 0 1-2-2zM17 8h3v10a2 2 0 0 1-2 2M8 8h6M8 12h6M8 16h4"),
  },
  {
    href: "/table",
    label: "Table",
    icon: icon("M4 5h16M4 10h16M4 15h16M4 20h10"),
    also: ["/season"],
  },
  {
    href: "/matches",
    label: "Matches",
    icon: icon("M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14H3zM3 10h18M8 2v4M16 2v4"),
  },
  {
    href: "/squad",
    label: "Squad",
    icon: icon("M8 3L3 6l2 5 3-1v11h8V10l3 1 2-5-5-3a4 4 0 0 1-8 0z"),
  },
  { href: "/ask", label: "Ask", icon: icon("M4 5h16v11H9l-5 4z") },
];

function isActive(pathname: string, { href, also = [] }: Section): boolean {
  if (href === "/") return pathname === "/";
  return [href, ...also].some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function SiteNav() {
  const pathname = usePathname();

  return (
    <>
      <nav aria-label="Main" className="nav">
        <div className="nav-inner">
          <Link href="/" className="brand">
            <Image src={BARCA_CREST_URL} alt="" width={28} height={28} unoptimized />
            <span className="brand-name">Barça Brain</span>
          </Link>
          <ul className="nav-links">
            {SECTIONS.map((section) => (
              <li key={section.href}>
                <Link
                  href={section.href}
                  aria-current={isActive(pathname, section) ? "page" : undefined}
                >
                  {section.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      {/* On phones the same links sit at the bottom, where a thumb can reach them. */}
      <nav aria-label="Tabs" className="tabbar">
        <ul>
          {SECTIONS.map((section) => (
            <li key={section.href}>
              <Link
                href={section.href}
                aria-current={isActive(pathname, section) ? "page" : undefined}
              >
                {section.icon}
                <span>{section.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
