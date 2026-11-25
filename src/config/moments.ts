// Background photos: the club's big nights, faded in behind sections across the app.
// Files live in public/images/moments/. To change which photo sits where, edit BACKDROPS below.
//
// Every photo is from Wikimedia Commons under a free licence (public domain, CC0, CC BY or
// CC BY-SA), saved locally at 2400px wide (3600px for panoramas) so we never depend on
// Wikimedia being up. CC BY and CC BY-SA ask for the author, the licence and a link, so the
// credits page lists all three for each photo. To add one: download it, add an entry here.

export type Moment = {
  src: string;
  /** What it shows, for the credits page. */
  label: string;
  labelHe: string;
  /** The photographer, as Wikimedia Commons credits them. */
  credit: string;
  license: string;
  /** Empty for public domain, which has no licence text to link to. */
  licenseUrl: string;
  /** The photo's page on Wikimedia Commons, with the original and its full licence. */
  pageUrl: string;
  /** Which part to keep in frame when the background crops it (CSS object-position). */
  focus?: string;
};

const COMMONS = "https://commons.wikimedia.org/wiki/File:";
const CC0 = "https://creativecommons.org/publicdomain/zero/1.0/";
const CC_BY_SA_2 = "https://creativecommons.org/licenses/by-sa/2.0/";
const CC_BY_SA_3 = "https://creativecommons.org/licenses/by-sa/3.0/";
const CC_BY_SA_4 = "https://creativecommons.org/licenses/by-sa/4.0/";

export const MOMENTS = {
  team1903: {
    src: "/images/moments/team-1903.jpg",
    label: "An early FC Barcelona team, 1903",
    labelHe: "אחת הקבוצות הראשונות של ברצלונה, 1903",
    credit: "Unknown author",
    license: "Public domain",
    licenseUrl: "",
    pageUrl: `${COMMONS}Vitrina-1.v1311695239.jpg`,
    focus: "50% 40%",
  },
  senyeraMosaic: {
    src: "/images/moments/senyera-mosaic-2012.jpg",
    label: "The Camp Nou turns into a Senyera before El Clásico, 2012",
    labelHe: "הקאמפ נואו הופך לדגל קטלוניה לפני הקלאסיקו, 2012",
    credit: "Netol",
    license: "CC BY-SA 3.0",
    licenseUrl: CC_BY_SA_3,
    pageUrl: `${COMMONS}Camp_nou_before_F.C._Barcelona_-_Real_Madrid_league_match_of_2012.JPG`,
    focus: "50% 40%",
  },
  recordCrowd: {
    src: "/images/moments/record-crowd-2022.jpg",
    label: "A world-record crowd for Barça Femení, 2022",
    labelHe: "קהל שיא עולמי למשחק של ברסה הנשית, 2022",
    credit: "Jordi Roca",
    license: "CC BY-SA 2.0",
    licenseUrl: CC_BY_SA_2,
    pageUrl: `${COMMONS}Panor%C3%A0mica_Camp_Nou_de_r%C3%A8cord_mundial.2.jpg`,
  },
  laMasia: {
    src: "/images/moments/la-masia.jpg",
    label: "La Masia, the farmhouse where the academy began",
    labelHe: "לה מאסיה, בית החווה שבו התחילה האקדמיה",
    credit: "Maria Rosa Ferre",
    license: "CC BY-SA 2.0",
    licenseUrl: CC_BY_SA_2,
    pageUrl: `${COMMONS}La_Masia_(Can_Planas)_(Barcelona)_-_1.jpg`,
    focus: "50% 45%",
  },
  cruyff: {
    src: "/images/moments/cruyff-1974.jpg",
    label: "Johan Cruyff in the air against Feyenoord, 1974",
    labelHe: "יוהאן קרויף באוויר מול פיינורד, 1974",
    credit: "Rob Mieremet / Anefo (Nationaal Archief)",
    license: "CC0",
    licenseUrl: CC0,
    pageUrl: `${COMMONS}Feyenoord_tegen_Barcelona_0-0,_Europacup_Johan_Cruijff_springt_over_Vos_heen,_Bestanddeelnr_927-5353.jpg`,
    focus: "55% 35%",
  },
  parade: {
    src: "/images/moments/parade-2026.jpg",
    label: "Fans line the street for the league title parade, 2026",
    labelHe: "האוהדים ממלאים את הרחוב במצעד האליפות, 2026",
    credit: "Aniol",
    license: "CC0",
    licenseUrl: CC0,
    pageUrl: `${COMMONS}Rua_de_celebraci%C3%B3_del_Bar%C3%A7a_campi%C3%B3_de_Lliga_2026_20260511_38.jpg`,
  },
  campNouNight: {
    src: "/images/moments/camp-nou-night-2019.jpg",
    label: "A Champions League night at the Camp Nou, 2019",
    labelHe: "ערב ליגת האלופות בקאמפ נואו, 2019",
    credit: "kallerna",
    license: "CC BY-SA 4.0",
    licenseUrl: CC_BY_SA_4,
    pageUrl: `${COMMONS}Barcelona_vs_Inter_2019_4.jpg`,
  },
  campNouOutside: {
    src: "/images/moments/camp-nou-outside-night.jpg",
    label: "Outside the Camp Nou at night",
    labelHe: "מחוץ לקאמפ נואו בלילה",
    credit: "JaflaumS05",
    license: "CC BY-SA 4.0",
    licenseUrl: CC_BY_SA_4,
    pageUrl: `${COMMONS}Camp_Nou_at_Night_-_april_2022.jpg`,
  },
  clubWorldCup: {
    src: "/images/moments/messi-iniesta-puyol-2011.jpg",
    label: "Messi, Iniesta, Puyol and teammates after the Club World Cup final, 2011",
    labelHe: "מסי, אינייסטה, פויול וחבריהם אחרי גמר אליפות העולם למועדונים, 2011",
    credit: "Christopher Johnson",
    license: "CC BY-SA 2.0",
    licenseUrl: CC_BY_SA_2,
    pageUrl: `${COMMONS}FC_Barcelona_Team_2,_2011.jpg`,
    focus: "50% 30%",
  },
  copaFinal: {
    src: "/images/moments/copa-final-2025.jpg",
    label: "Gold confetti after winning the Copa del Rey final, 2025",
    labelHe: "קונפטי זהב אחרי הזכייה בגמר גביע המלך, 2025",
    credit: "Junta de Andalucía",
    license: "CC BY-SA 2.0",
    licenseUrl: CC_BY_SA_2,
    pageUrl: `${COMMONS}2025_04_26_Final_de_la_Copa_del_Rey.jpg`,
    focus: "50% 70%",
  },
  canaletes: {
    src: "/images/moments/canaletes-2026.jpg",
    label: "Fans celebrate the league title by night, 2026",
    labelHe: "אוהדים חוגגים את האליפות בלילה, 2026",
    credit: "Aniol",
    license: "CC0",
    licenseUrl: CC0,
    pageUrl: `${COMMONS}Celebraci%C3%B3_del_Bar%C3%A7a_campi%C3%B3_de_Lliga_20260510_200537279_09.jpg`,
  },
  campNouBowl: {
    src: "/images/moments/camp-nou-bowl-2019.jpg",
    label: "The Camp Nou bowl under floodlights, 2019",
    labelHe: "הקאמפ נואו תחת הזרקורים, 2019",
    credit: "Mtorresg76",
    license: "CC BY-SA 4.0",
    licenseUrl: CC_BY_SA_4,
    pageUrl: `${COMMONS}Camp_Nou_FC_Barcelona_-_Llevant_27_Abril_2019.jpg`,
  },
  trophyRoom: {
    src: "/images/moments/trophy-room.jpg",
    label: "Trophies in the FC Barcelona Museum",
    labelHe: "גביעים במוזיאון של ברצלונה",
    credit: "Yair Haklai",
    license: "CC BY-SA 4.0",
    licenseUrl: CC_BY_SA_4,
    pageUrl: `${COMMONS}Collections_of_the_Museum_of_FC_Barcelona.jpg`,
  },
  berlin: {
    src: "/images/moments/berlin-2015.jpg",
    label: "The squad with the Champions League trophy in Berlin, 2015",
    labelHe: "הסגל עם גביע ליגת האלופות בברלין, 2015",
    credit: "Biser Todorov",
    license: "CC BY-SA 2.0",
    licenseUrl: CC_BY_SA_2,
    pageUrl: `${COMMONS}Barcelona_FC_(51100844503).jpg`,
    focus: "50% 45%",
  },
} as const satisfies Record<string, Moment>;

/** Which photo sits behind which part of the app. */
export const BACKDROPS = {
  club: {
    // Rule of thumb: no big lettering in a photo that sits behind body text.
    founding: MOMENTS.team1903, // a real early team, shown sepia
    catalonia: MOMENTS.senyeraMosaic, // the whole stadium in Catalan colours
    culers: MOMENTS.recordCrowd,
    masia: MOMENTS.laMasia,
    // Dark and around one figure, so it sits quietly behind the passing pitch.
    idea: MOMENTS.cruyff,
    // "A day in the city": the street full of fans.
    matchday: MOMENTS.parade,
    nights: MOMENTS.campNouNight,
    tonight: MOMENTS.campNouOutside,
  },
  home: {
    poster: MOMENTS.clubWorldCup,
    // A short wide band: only a strip of the photo shows. Gold confetti reads in any strip.
    motto: MOMENTS.copaFinal,
  },
  page: {
    news: MOMENTS.canaletes,
    matches: MOMENTS.campNouBowl,
    table: MOMENTS.trophyRoom,
    squad: MOMENTS.berlin,
  },
} as const satisfies Record<string, Record<string, Moment>>;

/** Everything shown anywhere, for the credits page. */
export const ALL_MOMENTS: readonly Moment[] = Object.values(MOMENTS);
