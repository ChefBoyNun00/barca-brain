/** Starter questions that fit the page you are looking at. Anything else gets the default set. */
const BY_PAGE: { prefix: string; questions: readonly string[] }[] = [
  {
    prefix: "/squad",
    questions: [
      "Who has scored the most for us this season?",
      "Which La Masia players are in the squad?",
      "Compare Lamine Yamal and Raphinha this season",
    ],
  },
  {
    prefix: "/table",
    questions: [
      "Who are our closest rivals in the table?",
      "How many points do we need to be safe at the top?",
      "How are we doing against the teams around us?",
    ],
  },
  {
    prefix: "/matches",
    questions: [
      "What was our best win this season?",
      "How do we do when we're behind at half-time?",
      "Preview the next match for me",
    ],
  },
  {
    prefix: "/news",
    questions: [
      "What are the Spanish papers saying today?",
      "Which transfer rumours are worth believing?",
      "Where do the Barcelona and Madrid papers disagree?",
    ],
  },
];

export function suggestionsFor(pathname: string): readonly string[] | undefined {
  return BY_PAGE.find(({ prefix }) => pathname.startsWith(prefix))?.questions;
}
