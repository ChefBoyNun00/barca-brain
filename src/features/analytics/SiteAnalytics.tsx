"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { scrubAnalyticsUrl } from "./scrub-url";

/** Cleans each address before it leaves the browser. null means "don't send this one". */
function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = scrubAnalyticsUrl(event.url);
  return url ? { ...event, url } : null;
}

/**
 * Counts page views with Vercel Web Analytics. It sets no cookies and stores no personal data.
 * On localhost it only logs to the console; real counts start once Analytics is switched on
 * for the project in the Vercel dashboard.
 */
export function SiteAnalytics() {
  return <Analytics beforeSend={beforeSend} />;
}
