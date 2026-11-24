# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Barça fans in two languages, weighted equally: Hebrew-speaking fans in Israel (the current launch audience) and English-speaking fans. They come to catch up on news, prepare for the next match, check the table and squad, and settle arguments with real numbers.

Secondary: recruiters and sports-tech employers looking at the app as a portfolio piece (real data pipeline, real database, real LLM engineering, deployed). Daniel, the builder, is also a daily user.

## Product Purpose

A Barça app you can talk to. It holds the season's matches, results, scorers and standings, reads and translates the Spanish and Israeli press, and lets fans ask anything about the team. Success means a fan trusts the answer because it comes from data, not guesses, and comes back because the app feels like the club, not a scores ticker.

## Positioning

Two things together, neither of which FotMob or ESPN offers:

1. **AI analyst + club story.** Ask Blaugrana answers questions from our own database through typed tools, showing the data it used, and never guesses. Around it, the app tells the story of "Més que un club" (the /club chapters) with a premium, restrained feel instead of a stats dashboard.
2. **The Hebrew Barça home.** The best place in Hebrew for Barça news, matchday and stats, with Israeli press (Barça Mania and others) alongside translated Spanish press, and the AI on top.

## Operating Context

- Pages: Home, News, Matches, Table (also /season), Squad, The club (/club story), Ask (Ask Blaugrana). Also a match card (/card), shirt page, calendar feed (calendar.ics), credits.
- Every screen works in English and Hebrew (RTL), switched with the language toggle.
- Data refreshes on its own: daily football ingest, news runs (read, translate, write Hebrew), and a Matchday Room refresh every 15 minutes on GitHub Actions.
- Mostly used on phones around match time and for news catch-up.

## Capabilities and Constraints

- Next.js App Router on Vercel; Postgres on Supabase; Claude via the Anthropic SDK. Layer rules in CLAUDE.md are binding (providers-only API access, queries-only SQL, read-only AI tools, config in src/config).
- Data is current season only (2026–27, La Liga + Champions League); free-tier limits mean no history and limited per-match detail.
- Ask Blaugrana must stay grounded: every answer traceable to tool calls over the DB.
- No user accounts.
- Open: native Hebrew review of all Hebrew copy (much of it was written by Claude); Ask Blaugrana Hebrew accuracy eval not yet done.

## Brand Commitments

- Name in the UI: "Ask Blaugrana" for the AI analyst. The Barça crest is used via BARCA_CREST_URL.
- Hebrew spelling of the club is "בארסה".
- Explicitly not another ESPN/FotMob stats app; the feel is premium and story-led, interactive but not too much.
- Photos are used as backgrounds behind content, not as galleries or photo sections.

## Evidence on Hand

- Live season data, news articles and stories in the Supabase DB.
- 11 editorial photos in public/images/moments/ (captions in src/config/moments.ts). **Licence UNCONFIRMED (Getty/iStock):** do not add more such photos, and they must be licensed or swapped for Wikimedia with credits before relying on them.
- No testimonials, user numbers, or press coverage exist; do not invent any.

## Product Principles

1. Real data or no answer: never show a number or claim the database can't back.
2. Hebrew is a first-class edition, not a translation layer: names, order, spelling and RTL must be right.
3. The club, not the ticker: tell the story and give the context; scores are table stakes.
4. Restraint over noise: one loud thing per screen, the rest quiet.

## Accessibility & Inclusion

Full RTL support for Hebrew (bdi around names, correct score order). Every async view has loading, error and empty states.
