// The words of "The club" (/club): FC Barcelona's story, told in chapters as you scroll.
// Written by hand, in English and Hebrew side by side. The Hebrew was written by Claude, not a
// native speaker: Daniel, please read it before sharing widely.
// Facts are kept to ones that are widely documented (FCBarcelona.com, Wikipedia). Where the
// story itself is disputed, the text says so. Edit a line here and the page picks it up.

import type { Language } from "@/i18n/dictionary";

/** One piece of text in every language the app speaks. */
export type Words = Record<Language, string>;

export type Chapter = {
  /** Used for the anchor (/club#masia) and the chapter rail. */
  id: string;
  numeral: string;
  /** Short name on the chapter rail. */
  label: Words;
  kicker: Words;
  title: Words;
  body: readonly Words[];
};

export const STORY_COVER = {
  kicker: { en: "A story in eight chapters", he: "סיפור בשמונה פרקים" },
  title: { en: "More than a club.", he: "יותר ממועדון." },
  lead: {
    en: "To understand Barça, start with a newspaper advert, a language, a farmhouse and an idea.",
    he: "כדי להבין את בארסה, מתחילים ממודעה בעיתון, משפה, מבית חווה ומרעיון אחד.",
  },
  scroll: { en: "Scroll to begin", he: "גללו כדי להתחיל" },
} as const satisfies Record<string, Words>;

export const CHAPTERS = [
  {
    id: "1899",
    numeral: "I",
    label: { en: "1899", he: "1899" },
    kicker: { en: "Chapter one · Barcelona, 1899", he: "פרק ראשון · ברצלונה, 1899" },
    title: { en: "It began with an advert.", he: "הכול התחיל במודעה." },
    body: [
      {
        en: "In October 1899 a young Swiss man, Hans Gamper, put a short notice in the sports paper Los Deportes. He was looking for people to play football.",
        he: "באוקטובר 1899 פרסם צעיר שווייצרי בשם הנס גמפר מודעה קצרה בעיתון הספורט Los Deportes. הוא חיפש אנשים לשחק איתם כדורגל.",
      },
      {
        en: "On 29 November, twelve of them met at the Gimnasio Solé. FC Barcelona began that night.",
        he: "ב־29 בנובמבר נפגשו שנים־עשר מהם באולם הספורט סולה. באותו ערב נולדה FC ברצלונה.",
      },
      {
        en: "Hans became Joan. The founder took the Catalan form of his name, and the city's language as his own.",
        he: "הנס הפך לז׳ואן. המייסד אימץ את הגרסה הקטלאנית של שמו, ואת שפת העיר כשפתו.",
      },
    ],
  },
  {
    id: "catalonia",
    numeral: "II",
    label: { en: "Catalonia", he: "קטלוניה" },
    kicker: { en: "Chapter two · A language in the stands", he: "פרק שני · שפה ביציע" },
    title: { en: "Where Catalan could still be heard.", he: "המקום שבו עוד שמעו קטלאנית." },
    body: [
      {
        en: "Under Franco's dictatorship, Catalan was pushed out of public life. The stands at Barça became one of the few places where people could still speak it, sing in it, and be among their own.",
        he: "תחת הדיקטטורה של פרנקו נדחקה הקטלאנית מהמרחב הציבורי. היציעים של בארסה הפכו לאחד המקומות הבודדים שבהם עוד אפשר היה לדבר בה, לשיר בה ולהרגיש בבית.",
      },
      {
        en: "In 1968 the club's president, Narcís de Carreras, gave that feeling its name.",
        he: "ב־1968 נתן נשיא המועדון, נרסיס דה קארראס, שם לתחושה הזאת.",
      },
    ],
  },
  {
    id: "culers",
    numeral: "III",
    label: { en: "The culers", he: "הקולרס" },
    kicker: { en: "Chapter three · Owned by its people", he: "פרק שלישי · שייך לאנשים שלו" },
    title: { en: "Nobody owns Barça. Everybody does.", he: "בארסה לא שייכת לאף אחד. היא של כולם." },
    body: [
      {
        en: "There is no billionaire and no company behind the club. It belongs to its members, the socis, and they vote for the president.",
        he: "אין מאחורי המועדון מיליארדר ואין חברה. הוא שייך לחברים שלו, הסוסיס, והם אלה שבוחרים את הנשיא.",
      },
      {
        en: "Fans are called culers, from cul, Catalan for backside. At the old ground on Carrer Indústria, people in the street looked up at a row of them sitting on top of the wall.",
        he: "האוהדים נקראים קולרס, מהמילה הקטלאנית cul, ישבן. במגרש הישן ברחוב אינדוסטריה, העוברים ברחוב ראו מלמטה שורה של אוהדים יושבים על החומה.",
      },
    ],
  },
  {
    id: "masia",
    numeral: "IV",
    label: { en: "La Masia", he: "לה מאסיה" },
    kicker: { en: "Chapter four · The farmhouse", he: "פרק רביעי · בית החווה" },
    title: { en: "Grown at home.", he: "תוצרת בית." },
    body: [
      {
        en: "Next to the stadium stood an old stone farmhouse, La Masia. From 1979 it was home to the club's young players, many of them far from their families.",
        he: "ליד האצטדיון עמד בית חווה ישן מאבן, לה מאסיה. משנת 1979 הוא היה הבית של השחקנים הצעירים של המועדון, רבים מהם רחוק ממשפחותיהם.",
      },
      {
        en: "On 25 November 2012, away at Levante, every one of the eleven Barça players on the pitch had come through the academy.",
        he: "ב־25 בנובמבר 2012, במשחק חוץ מול לבאנטה, כל אחד מאחד־עשר השחקנים של בארסה על המגרש היה בוגר האקדמיה.",
      },
    ],
  },
  {
    id: "idea",
    numeral: "V",
    label: { en: "The idea", he: "הרעיון" },
    kicker: { en: "Chapter five · Cruyff's idea", he: "פרק חמישי · הרעיון של קרויף" },
    title: { en: "Let the ball do the running.", he: "תנו לכדור לרוץ." },
    body: [
      {
        en: "Johan Cruyff came as a player in 1973 and returned as coach in 1988. He brought an idea: keep the ball, make the pitch big when you have it and small when you don't.",
        he: "יוהאן קרויף הגיע כשחקן ב־1973 וחזר כמאמן ב־1988. הוא הביא איתו רעיון: לשמור על הכדור, להגדיל את המגרש כשהכדור אצלך ולהקטין אותו כשלא.",
      },
      {
        en: "His Dream Team won the club's first European Cup at Wembley in 1992. His student Pep Guardiola took it further: in 2009 Barça won six trophies in one year.",
        he: "״קבוצת החלומות״ שלו זכתה בגביע אירופה הראשון של המועדון, בוומבלי ב־1992. התלמיד שלו, פפ גוארדיולה, לקח את זה רחוק יותר: ב־2009 זכתה בארסה בשישה תארים בשנה אחת.",
      },
    ],
  },
  {
    id: "matchday",
    numeral: "VI",
    label: { en: "Matchday", he: "יום משחק" },
    kicker: { en: "Chapter six · A day in the city", he: "פרק שישי · יום אחד בעיר" },
    title: { en: "The whole city keeps the same clock.", he: "כל העיר חיה לפי אותו שעון." },
    body: [],
  },
  {
    // The old /history page lives here now (/history redirects to /club#nights).
    id: "nights",
    numeral: "VII",
    label: { en: "Great nights", he: "לילות גדולים" },
    kicker: { en: "Chapter seven · The great nights", he: "פרק שביעי · הלילות הגדולים" },
    title: { en: "The nights that made the club.", he: "הלילות שעשו את המועדון." },
    body: [
      {
        en: "Tap a moment for one more detail, or ask Blaugrana about it.",
        he: "הקישו על רגע כדי לגלות עוד פרט, או שאלו עליו את בלאוגרנה.",
      },
    ],
  },
] as const satisfies readonly Chapter[];

/** Chapter two's centrepiece: the words, then who said them. */
export const MES_QUE_UN_CLUB = {
  quote: { en: "Més que un club", he: "Més que un club" },
  meaning: { en: "More than a club.", he: "יותר ממועדון." },
  credit: {
    en: "Narcís de Carreras, on becoming president, 1968",
    he: "נרסיס דה קארראס, עם היבחרו לנשיא, 1968",
  },
} as const satisfies Record<string, Words>;

/** Chapter one's aside. The colours' origin is genuinely disputed, so it says so. */
export const COLOURS_NOTE = {
  en: "Where the blue and garnet came from is still argued about. One story points to FC Basel, Gamper's club in Switzerland.",
  he: "מאיפה הגיעו הכחול והבורדו? עדיין מתווכחים על זה. גרסה אחת מצביעה על באזל, המועדון של גמפר בשווייץ.",
} as const satisfies Words;

/** Chapter four: the academy's most famous graduates. The current ones come from la-masia.ts. */
export const MASIA_LEGENDS = [
  "Xavi",
  "Andrés Iniesta",
  "Lionel Messi",
  "Carles Puyol",
  "Sergio Busquets",
  "Pep Guardiola",
  "Víctor Valdés",
  "Gerard Piqué",
  "Cesc Fàbregas",
  "Pedro",
] as const;

export const MASIA_ROWS = {
  legends: { en: "Came through the farmhouse", he: "עברו בבית החווה" },
  now: { en: "In today's squad", he: "בסגל של היום" },
} as const satisfies Record<string, Words>;

/** Chapter five's line. Cruyff said versions of this often; this is the best-known one. */
export const CRUYFF_QUOTE = {
  quote: {
    en: "Playing football is very simple, but playing simple football is the hardest thing there is.",
    he: "לשחק כדורגל זה פשוט מאוד, אבל לשחק כדורגל פשוט זה הדבר הכי קשה שיש.",
  },
  credit: { en: "Johan Cruyff", he: "יוהאן קרויף" },
} as const satisfies Record<string, Words>;

/** Chapter six: a home game, hour by hour. Rituals, not records. */
export type MatchdayHour = { time: string; title: Words; text: Words };

export const MATCHDAY_HOURS: readonly MatchdayHour[] = [
  {
    time: "13:00",
    title: { en: "Vermut", he: "ורמוט" },
    text: {
      en: "Vermouth, olives and crisps on a terrace. The line-up is argued over before it is announced.",
      he: "ורמוט, זיתים וצ׳יפס על מרפסת של בר. מתווכחים על ההרכב עוד לפני שהוא מתפרסם.",
    },
  },
  {
    time: "19:30",
    title: { en: "The walk", he: "ההליכה" },
    text: {
      en: "Shirts and scarves fill the streets around the stadium. Three generations of one family, walking the same way.",
      he: "חולצות וצעיפים ממלאים את הרחובות סביב האצטדיון. שלושה דורות של אותה משפחה, הולכים לאותו כיוון.",
    },
  },
  {
    time: "20:55",
    title: { en: "Tot el camp és un clam", he: "Tot el camp és un clam" },
    text: {
      en: "The Cant del Barça. The whole ground sings the club's anthem, in Catalan, before a ball is kicked.",
      he: "״קאנט דל בארסה״. כל האצטדיון שר את ההמנון של המועדון, בקטלאנית, עוד לפני הבעיטה הראשונה.",
    },
  },
  {
    time: "21:00",
    title: { en: "Kick-off", he: "שריקת פתיחה" },
    text: {
      en: "Late, like everything in Spain. Dinner can wait.",
      he: "מאוחר, כמו כל דבר בספרד. ארוחת הערב יכולה לחכות.",
    },
  },
  {
    time: "23:30",
    title: { en: "Canaletes", he: "קנאלטס" },
    text: {
      en: "When there is something to celebrate, the city goes to the old fountain at the top of La Rambla. It has been the place for generations.",
      he: "כשיש מה לחגוג, העיר הולכת למזרקה הישנה בראש הרמבלה. כבר דורות שזה המקום.",
    },
  },
];

/** Chapter eight's anchor (/club#tonight). It is rendered separately, because it reads live data. */
export const TONIGHT_ID = "tonight";
export const TONIGHT_NUMERAL = "VIII";

/** Chapter eight is live: it reads this season from our database. */
export const STORY_NOW = {
  label: { en: "Tonight", he: "הערב" },
  kicker: { en: "Chapter eight · Tonight", he: "פרק שמיני · הערב" },
  title: { en: "The story is still being written.", he: "הסיפור עוד נכתב." },
  lead: {
    en: "Every match adds a line. This is where it stands right now.",
    he: "כל משחק מוסיף שורה. ככה זה נראה ממש עכשיו.",
  },
  next: { en: "The next line", he: "השורה הבאה" },
  home: { en: "At home", he: "בבית" },
  away: { en: "Away", he: "בחוץ" },
  noData: {
    en: "This season's numbers aren't in yet. Check back after the next match.",
    he: "המספרים של העונה עוד לא הגיעו. חזרו אחרי המשחק הבא.",
  },
} as const satisfies Record<string, Words>;

/** Where the story hands you over to the rest of the app. */
export const STORY_EXITS = [
  { href: "/", label: { en: "Follow the season", he: "לעקוב אחרי העונה" } },
  { href: "/squad", label: { en: "Meet the squad", he: "להכיר את הסגל" } },
  { href: "/news", label: { en: "Read the news", he: "לקרוא את החדשות" } },
  { href: "/ask", label: { en: "Ask Blaugrana anything", he: "לשאול את בלאוגרנה הכול" } },
] as const satisfies readonly { href: string; label: Words }[];

/** Labels for things you hear rather than see. */
export const STORY_A11Y = {
  rail: { en: "Chapters", he: "פרקים" },
  pitch: {
    en: "A Barça team in a 4-3-3 passing the ball in short triangles",
    he: "קבוצה של בארסה במערך 4-3-3 מוסרת את הכדור במשולשים קצרים",
  },
} as const satisfies Record<string, Words>;
