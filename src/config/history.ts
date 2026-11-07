// The club's best moments, written by hand. Newest facts are checked against FCBarcelona.com and
// Wikipedia; each entry says how sure it is. Daniel: add, fix or remove a moment by editing this
// list: the page and its filters pick it up. Keep it to facts you could source.

export const HISTORY_TAGS = ["origins", "europe", "clasico", "masia", "treble"] as const;
export type HistoryTag = (typeof HISTORY_TAGS)[number];

export type HistoryMoment = {
  id: string;
  /** The year, or the exact date when it matters. */
  when: string;
  year: number;
  title: string;
  story: string;
  /** One extra detail, shown when you ask for it. */
  fact: string;
  tags: readonly HistoryTag[];
  /** "checked" means a source confirmed it on 2026-11-07. "memory" means please confirm it. */
  confidence: "checked" | "memory";
};

export const HISTORY_MOMENTS: readonly HistoryMoment[] = [
  {
    id: "founded",
    when: "29 November 1899",
    year: 1899,
    title: "The club is born",
    story:
      "Joan Gamper, a Swiss footballer living in Barcelona, put an advert in a newspaper looking for people to play. Twelve of them met at the Gimnasio Solé and FC Barcelona began.",
    fact: "The advert ran on 22 October 1899. The founding meeting was five weeks later.",
    tags: ["origins"],
    confidence: "checked",
  },
  {
    id: "camp-nou",
    when: "24 September 1957",
    year: 1957,
    title: "Camp Nou opens its doors",
    story:
      "The club had outgrown Les Corts. The new stadium opened with a ceremony and a match, and grew into one of the largest in Europe.",
    fact: "Les Corts, the old stadium, had opened in 1922.",
    tags: ["origins"],
    confidence: "checked",
  },
  {
    id: "cruyff-0-5",
    when: "17 February 1974",
    year: 1974,
    title: "Cruyff and the 0–5 at the Bernabéu",
    story:
      "Johan Cruyff's first season at the club. Barça went to Madrid and won 5–0, on their way to a first league title in 14 years. It is still remembered as one of the great Clásicos.",
    fact: "Cruyff would later return as the coach who built the Dream Team.",
    tags: ["clasico"],
    confidence: "memory",
  },
  {
    id: "wembley-1992",
    when: "20 May 1992",
    year: 1992,
    title: "Wembley: the first European Cup",
    story:
      "After losing the finals of 1961 and 1986, Barça finally won it. Ronald Koeman's free kick in extra time beat Sampdoria 1–0 and gave the club the one trophy it had always wanted.",
    fact: "It was the first European Cup in the club's history, 93 years after it was founded.",
    tags: ["europe"],
    confidence: "checked",
  },
  {
    id: "paris-2006",
    when: "17 May 2006",
    year: 2006,
    title: "Paris: a comeback against Arsenal",
    story:
      "Behind in the final, Barça came back with late goals from Samuel Eto'o and Juliano Belletti to win 2–1. Ronaldinho's team had a second European Cup.",
    fact: "It was the club's second European Cup, 14 years after Wembley.",
    tags: ["europe"],
    confidence: "checked",
  },
  {
    id: "bernabeu-2-6",
    when: "2 May 2009",
    year: 2009,
    title: "2–6 at the Bernabéu",
    story:
      "Guardiola's side went to Madrid and won 6–2, with Messi playing as a false nine. It is remembered as the performance that made the world see what that team was.",
    fact: "It was the season Barça went on to win six trophies.",
    tags: ["clasico"],
    confidence: "memory",
  },
  {
    id: "rome-2009",
    when: "27 May 2009",
    year: 2009,
    title: "Rome and the sextuple",
    story:
      "Samuel Eto'o and Lionel Messi scored in a 2–0 win over Manchester United in the Champions League final. It completed a treble, and by the end of the year Barça had won six trophies in one calendar year.",
    fact: "Six trophies in a single calendar year had never been done before.",
    tags: ["europe", "treble"],
    confidence: "checked",
  },
  {
    id: "five-nil",
    when: "29 November 2010",
    year: 2010,
    title: "5–0 against Mourinho's Madrid",
    story:
      "José Mourinho's first Clásico as Real Madrid coach ended 5–0 to Barça at the Camp Nou. It was one of the most one-sided Clásicos in memory.",
    fact: "Mourinho had taken charge of Madrid only that summer.",
    tags: ["clasico"],
    confidence: "memory",
  },
  {
    id: "wembley-2011",
    when: "28 May 2011",
    year: 2011,
    title: "Wembley again: Pedro, Messi and Villa",
    story:
      "Manchester United again, in the final again, and again Barça won: 3–1, with goals from Pedro, Messi and David Villa. Many fans call it the best football the club has played in a final.",
    fact: "It was the fourth European Cup in club history.",
    tags: ["europe"],
    confidence: "checked",
  },
  {
    id: "all-masia",
    when: "25 November 2012",
    year: 2012,
    title: "Eleven from La Masia",
    story:
      "Late in a win over Levante, every one of the eleven players on the pitch had come through the club's academy. It is the most Barcelona thing that has ever happened on a football pitch.",
    fact: "Several of them, such as Xavi, Iniesta and Messi, had arrived as children.",
    tags: ["masia"],
    confidence: "memory",
  },
  {
    id: "berlin-2015",
    when: "6 June 2015",
    year: 2015,
    title: "Berlin: the second treble",
    story:
      "Rakitić, Suárez and Neymar scored in a 3–1 win over Juventus. Under Luis Enrique, Barça won La Liga, the Copa del Rey and the Champions League in one season, for the second time.",
    fact: "The trio of Messi, Suárez and Neymar scored 122 goals that season.",
    tags: ["europe", "treble"],
    confidence: "checked",
  },
  {
    id: "remontada",
    when: "8 March 2017",
    year: 2017,
    title: "La Remontada: 6–1 against PSG",
    story:
      "Barça had lost the first leg 4–0. At the Camp Nou they scored five goals, and Sergi Roberto got the sixth in the last seconds, to win 6–1 on the night. No team had ever turned around a four-goal first-leg deficit in the Champions League.",
    fact: "The tie finished 6–5 on aggregate to Barça.",
    tags: ["europe"],
    confidence: "checked",
  },
  {
    id: "flick-2025",
    when: "2024–25",
    year: 2025,
    title: "Flick's young side win everything at home",
    story:
      "Hansi Flick's team, built around Lamine Yamal, Pedri, Gavi and Pau Cubarsí, won La Liga, the Copa del Rey and the Supercopa de España in one season, beating Real Madrid in both cup finals.",
    fact: "Several of the players who won it came through La Masia.",
    tags: ["masia", "treble"],
    confidence: "memory",
  },
];
