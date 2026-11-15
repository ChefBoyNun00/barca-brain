// The app's one icon set: 24px line icons, round caps, 1.8 stroke, drawn in the current text
// colour. Emoji render differently on every phone, so the UI never uses them as icons.
// Add an icon here by adding one line of path data.

const PATHS = {
  home: "M3 11l9-8 9 8v10H15v-7H9v7H3z",
  news: "M4 4h13v16H6a2 2 0 0 1-2-2zM17 8h3v10a2 2 0 0 1-2 2M8 8h6M8 12h6M8 16h4",
  table: "M4 5h16M4 10h16M4 15h16M4 20h10",
  matches: "M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14H3zM3 10h18M8 2v4M16 2v4",
  shirt: "M8 3L3 6l2 5 3-1v11h8V10l3 1 2-5-5-3a4 4 0 0 1-8 0z",
  stats: "M5 20V10M12 20V4M19 20v-7",
  history: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 3",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  ask: "M4 5h16v11H9l-5 4zM8 9h8M8 12h5",
  ending: "M5 21V4M5 4h11l-2 4 2 4H5",
  flame: "M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5.5 1-8.5z",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z",
  ticket: "M4 7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4zM14 6v12",
  bag: "M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2",
  play: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM10 8.5v7l6-3.5z",
  calendar: "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14H4zM4 10h16M9 2v4M15 2v4M8 14h3",
  external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  close: "M6 6l12 12M18 6L6 18",
  arrow: "M5 12h14M13 6l6 6-6 6",
} as const;

export type IconName = keyof typeof PATHS;

/** A decorative icon. Its meaning must also be in nearby text, so screen readers skip it. */
export function Icon({ name, className = "icon" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path d={PATHS[name]} />
    </svg>
  );
}

/** The flag of Israel, drawn to its proportions (8:11), for the Israeli news edition. */
export function IsraelFlag({ className = "flag" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 160" aria-hidden="true" focusable="false" className={className}>
      <rect width="220" height="160" fill="#ffffff" />
      <rect y="15" width="220" height="25" fill="#0038b8" />
      <rect y="120" width="220" height="25" fill="#0038b8" />
      <g fill="none" stroke="#0038b8" strokeWidth="5.5">
        <path d="M110 52 L133 92 L87 92 Z" />
        <path d="M110 108 L87 68 L133 68 Z" />
      </g>
    </svg>
  );
}
