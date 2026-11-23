// Background photos: the club's big nights, faded in behind sections across the app.
// Files live in public/images/moments/. To change which photo sits where, edit BACKDROPS below.
//
// TODO(debt): licence — these are Getty Images / iStock editorial photos supplied by Daniel,
// not free-licence ones like the rest of the app (see ALLOWED_PHOTO_LICENSE in photos.ts).
// Before the site is public with them, either licence each one from Getty, or swap in
// Wikimedia Commons photos with credits. Fill `credit` with the photographer once known.

export type Moment = {
  src: string;
  /** What it shows, for the credits page and for whoever edits this file. */
  label: string;
  credit: string;
  /** Which part to keep in frame when the background crops it (CSS object-position). */
  focus?: string;
};

const GETTY = "Getty Images";

export const MOMENTS = {
  ronaldinhoMessi: {
    src: "/images/moments/ronaldinho-messi-2005.jpg",
    label: "Ronaldinho carries Messi after his first goal, 2005",
    credit: GETTY,
    focus: "50% 25%",
  },
  messiArmsUp: {
    src: "/images/moments/messi-arms-up.jpg",
    label: "Messi pointing to the sky, 2014",
    credit: GETTY,
    focus: "50% 35%",
  },
  messiRecord: {
    src: "/images/moments/messi-record-2014.jpg",
    label: "Messi thrown into the air after his La Liga scoring record, 2014",
    credit: GETTY,
    focus: "60% 35%",
  },
  trebleParade: {
    src: "/images/moments/treble-parade-2015.jpg",
    label: "The treble parade, 2015",
    credit: GETTY,
  },
  remontada: {
    src: "/images/moments/remontada-2017.jpg",
    label: "Messi celebrates the 6–1 against PSG, 2017",
    credit: GETTY,
    focus: "65% 30%",
  },
  supercopa: {
    src: "/images/moments/supercopa-2025.jpg",
    label: "Lamine Yamal with the Supercopa, 2025",
    credit: GETTY,
    focus: "50% 30%",
  },
  ligaTrophy: {
    src: "/images/moments/liga-trophy.jpg",
    label: "The squad lifts the league trophy",
    credit: GETTY,
    focus: "50% 30%",
  },
  flick: {
    src: "/images/moments/flick-in-the-air.jpg",
    label: "Hansi Flick thrown into the air by his players",
    credit: GETTY,
    focus: "50% 25%",
  },
  lamineTen: {
    src: "/images/moments/lamine-ten.jpg",
    label: "Lamine Yamal and teammates, arm in arm",
    credit: GETTY,
    focus: "50% 60%",
  },
  canaletes: {
    src: "/images/moments/canaletes.jpg",
    label: "Fans celebrating in the street at night",
    credit: GETTY,
  },
  mesQueUnClub: {
    src: "/images/moments/mes-que-un-club.jpg",
    label: "The crest under Més que un club",
    credit: GETTY,
  },
} as const satisfies Record<string, Moment>;

/** Which photo sits behind which part of the app. */
export const BACKDROPS = {
  club: {
    // Rule of thumb: no big lettering in a photo that sits behind body text (the parade's
    // "CAMPIONS" banner used to sit behind the 1899 story).
    // TODO(debt): a real archive photo (the 1899 or 1903 team, public domain on Wikimedia
    // Commons) would suit chapter one better than the crest — Daniel to supply.
    founding: MOMENTS.mesQueUnClub, // the crest, aged to sepia: where it all started
    catalonia: MOMENTS.canaletes, // Senyeres waving in the street
    culers: MOMENTS.remontada, // Messi climbing the barrier into the crowd
    masia: MOMENTS.ronaldinhoMessi,
    // Calm and dark around one figure, so it sits quietly behind the passing pitch.
    idea: MOMENTS.messiArmsUp,
    // Stack layout, one heading over it: the parade through the city suits "a day in the city".
    matchday: MOMENTS.trebleParade,
    nights: MOMENTS.messiRecord,
    tonight: MOMENTS.flick,
  },
  home: {
    poster: MOMENTS.lamineTen,
    // A short wide band: only a strip of the photo shows. Fans, flags and fireworks read as
    // "more than a club" in any strip; Messi's photo showed only two disembodied hands.
    motto: MOMENTS.canaletes,
  },
  page: {
    news: MOMENTS.remontada,
    matches: MOMENTS.supercopa,
    table: MOMENTS.ligaTrophy,
    squad: MOMENTS.flick,
  },
} as const satisfies Record<string, Record<string, Moment>>;

/** Everything shown anywhere, for the credits page. */
export const ALL_MOMENTS: readonly Moment[] = Object.values(MOMENTS);
