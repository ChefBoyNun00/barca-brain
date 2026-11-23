/**
 * Page-view analytics (Vercel Web Analytics: no cookies, no personal data).
 *
 * Only these parts of a web address after the "?" are kept when a visit is counted. Everything
 * else is removed first, because some addresses carry things people typed: /ask?q=<a question>,
 * /shirt?name=<a name>. Add a name here only if it is a fixed choice, never free text.
 */
export const ANALYTICS_KEPT_PARAMS: readonly string[] = [
  // World or Israel news edition: tells us which one people read.
  "edition",
];
