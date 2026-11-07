// Every word the app's chrome says, in English and Catalan.
// The Catalan was written by Claude, not a native speaker: Daniel, please read it before sharing
// widely and fix anything that sounds off. Add a language by adding a column here.
// {name} is filled in by t(); {rank:ordinal} is written as 1st/2nd in English and 1r/2n in Catalan.

export const LANGUAGES = ["en", "ca"] as const;
export type Language = (typeof LANGUAGES)[number];

const en = {
  "nav.home": "Home",
  "nav.news": "News",
  "nav.table": "Table",
  "nav.matches": "Matches",
  "nav.squad": "Squad",
  "nav.ask": "Ask",

  "hero.kicker": "Més que un club · Season {season} · {played} of {total} played",
  "hero.position": "League position",
  "hero.points": "Points",
  "hero.wins": "Wins",
  "hero.draws": "Draws",
  "hero.defeats": "Defeats",
  "hero.goals": "Goals scored",
  "headline.top": "Top of {league}.",
  "headline.rank": "{rank:ordinal} in {league}.",
  "headline.winOne": "1 win from {played}.",
  "headline.wins": "{wins} wins from {played}.",
  "headline.start": "The season starts here.",

  "home.explore": "Explore",
  "home.nextMatch": "Next match",
  "home.cards": "Every match as cards →",
  "explore.squad": "Squad",
  "explore.squadNote": "Every player and their season.",
  "explore.table": "Table",
  "explore.tableNote": "Where Barça stand in the league.",
  "explore.ending": "Weave the ending",
  "explore.endingNote": "Play out the rest of the season.",
  "explore.press": "The press",
  "explore.pressNote": "Spanish news, in English.",
  "explore.shirt": "Your shirt",
  "explore.shirtNote": "Put your name on the back.",
  "explore.ask": "Ask",
  "explore.askNote": "Questions about the season.",

  "filter.all": "All",
  "filter.league": "League",
  "filter.europe": "Europe",
  "filter.home": "Home",
  "filter.away": "Away",

  "matches.title": "Matches",
  "matches.note": "Every game of the season, results and fixtures.",
  "matches.jump": "Jump to next match ↓",
  "match.home": "Home",
  "match.away": "Away",
  "match.share": "Share ↗",

  "squad.title": "The squad",
  "squad.note": "Look at the back of a shirt, then open it for the numbers.",
  "squad.everyone": "Everyone",
  "squad.keepers": "Keepers",
  "squad.defenders": "Defenders",
  "squad.midfield": "Midfield",
  "squad.forwards": "Forwards",
  "squad.masia": "La Masia",
  "sort.number": "By number",
  "sort.goals": "Most goals",
  "sort.youngest": "Youngest",
  "sort.name": "A–Z",

  "news.title": "The press",
  "news.kicker": "Spanish in, English out",
  "news.all": "All press",
  "news.barcelona": "Barcelona",
  "news.madrid": "Madrid",
  "news.both": "Both",
  "news.transfers": "Transfers",
  "news.match": "Matches",
  "news.injuries": "Injuries",
  "news.club": "Club",
  "news.other": "More news",
  "news.showAll": "Show all {count}",
  "news.showFewer": "Show fewer",

  "season.nothing": "Nothing played yet",
  "season.record": "{wins}W {draws}D {losses}L · {goals} goals",
  "season.recordOne": "{wins}W {draws}D {losses}L · 1 goal",
  "season.after": "After {n}: {record}",
  "season.replay": "▶ Replay the season",
  "season.stop": "Stop",
  "season.legend":
    "Every stripe is a match. Every dot is a goal. A defeat tears the shirt, a diamond marks Europe, and the empty threads are still to be played.",
  "season.list": "See every match as a list",

  "ask.launch": "Ask Blaugrana",
  "ask.title": "Ask Blaugrana",
  "ask.close": "Close",

  "lost.kicker": "404 · Page not found",
  "lost.title": "Offside!",
  "lost.note": "That page isn't on the pitch. The flag is up.",
  "lost.home": "Back to the home page",
  "lost.matches": "See the matches",
  loading: "Loading",

  "matchday.matchday": "Matchday",
  "matchday.fulltime": "Full time",
  "matchday.clasico": "El Clásico",
  "matchday.inPlay": "in play",
} as const;

export type TextKey = keyof typeof en;

const ca: Record<TextKey, string> = {
  "nav.home": "Inici",
  "nav.news": "Notícies",
  "nav.table": "Classificació",
  "nav.matches": "Partits",
  "nav.squad": "Plantilla",
  "nav.ask": "Pregunta",

  "hero.kicker": "Més que un club · Temporada {season} · {played} de {total} jugats",
  "hero.position": "Posició a la lliga",
  "hero.points": "Punts",
  "hero.wins": "Victòries",
  "hero.draws": "Empats",
  "hero.defeats": "Derrotes",
  "hero.goals": "Gols marcats",
  "headline.top": "Líders de {league}.",
  "headline.rank": "{rank:ordinal} a {league}.",
  "headline.winOne": "1 victòria de {played}.",
  "headline.wins": "{wins} victòries de {played}.",
  "headline.start": "La temporada comença aquí.",

  "home.explore": "Explora",
  "home.nextMatch": "Pròxim partit",
  "home.cards": "Tots els partits en targetes →",
  "explore.squad": "Plantilla",
  "explore.squadNote": "Tots els jugadors i la seva temporada.",
  "explore.table": "Classificació",
  "explore.tableNote": "On és el Barça a la lliga.",
  "explore.ending": "Escriu el final",
  "explore.endingNote": "Juga el que queda de temporada.",
  "explore.press": "La premsa",
  "explore.pressNote": "Notícies en castellà, en anglès.",
  "explore.shirt": "La teva samarreta",
  "explore.shirtNote": "Posa-hi el teu nom a l'esquena.",
  "explore.ask": "Pregunta",
  "explore.askNote": "Dubtes sobre la temporada.",

  "filter.all": "Tots",
  "filter.league": "Lliga",
  "filter.europe": "Europa",
  "filter.home": "Casa",
  "filter.away": "Fora",

  "matches.title": "Partits",
  "matches.note": "Tots els partits de la temporada, resultats i calendari.",
  "matches.jump": "Salta al pròxim partit ↓",
  "match.home": "Casa",
  "match.away": "Fora",
  "match.share": "Comparteix ↗",

  "squad.title": "La plantilla",
  "squad.note": "Mira l'esquena d'una samarreta i obre-la per veure'n les xifres.",
  "squad.everyone": "Tots",
  "squad.keepers": "Porters",
  "squad.defenders": "Defenses",
  "squad.midfield": "Migcampistes",
  "squad.forwards": "Davanters",
  "squad.masia": "La Masia",
  "sort.number": "Per dorsal",
  "sort.goals": "Més gols",
  "sort.youngest": "Més joves",
  "sort.name": "A–Z",

  "news.title": "La premsa",
  "news.kicker": "Del castellà a l'anglès",
  "news.all": "Tota la premsa",
  "news.barcelona": "Barcelona",
  "news.madrid": "Madrid",
  "news.both": "Les dues",
  "news.transfers": "Fitxatges",
  "news.match": "Partits",
  "news.injuries": "Lesions",
  "news.club": "Club",
  "news.other": "Més notícies",
  "news.showAll": "Mostra'ls tots ({count})",
  "news.showFewer": "Mostra'n menys",

  "season.nothing": "Encara no s'ha jugat res",
  "season.record": "{wins}V {draws}E {losses}D · {goals} gols",
  "season.recordOne": "{wins}V {draws}E {losses}D · 1 gol",
  "season.after": "Després de {n}: {record}",
  "season.replay": "▶ Repeteix la temporada",
  "season.stop": "Atura",
  "season.legend":
    "Cada franja és un partit. Cada punt és un gol. Una derrota esquinça la samarreta, un diamant marca Europa, i els fils buits són partits per jugar.",
  "season.list": "Mostra tots els partits en llista",

  "ask.launch": "Pregunta al Blaugrana",
  "ask.title": "Pregunta al Blaugrana",
  "ask.close": "Tanca",

  "lost.kicker": "404 · Pàgina no trobada",
  "lost.title": "Fora de joc!",
  "lost.note": "Aquesta pàgina no és al camp. El linier ha aixecat la bandera.",
  "lost.home": "Torna a l'inici",
  "lost.matches": "Mira els partits",
  loading: "Carregant",

  "matchday.matchday": "Dia de partit",
  "matchday.fulltime": "Final del partit",
  "matchday.clasico": "El Clásico",
  "matchday.inPlay": "en joc",
};

export const DICTIONARY: Record<Language, Record<TextKey, string>> = { en, ca };

const ORDINALS: Record<Language, (n: number) => string> = {
  en: (n) => {
    const lastTwo = n % 100;
    if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`;
    return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
  },
  // Catalan ordinals: 1r, 2n, 3r, 4t, then 5è, 6è and so on.
  ca: (n) => `${n}${({ 1: "r", 2: "n", 3: "r", 4: "t" } as Record<number, string>)[n] ?? "è"}`,
};

/** 2 becomes 2nd in English and 2n in Catalan. */
export const ordinal = (language: Language, n: number): string => ORDINALS[language](n);

export type TextVars = Record<string, string | number>;

/** Looks a key up in the chosen language and fills in its {placeholders}. */
export function translate(language: Language, key: TextKey, vars: TextVars = {}): string {
  return DICTIONARY[language][key].replace(/\{(\w+)(?::(ordinal))?\}/g, (whole, name, format) => {
    const value = vars[name];
    if (value === undefined) return whole;
    return format === "ordinal" ? ORDINALS[language](Number(value)) : String(value);
  });
}
