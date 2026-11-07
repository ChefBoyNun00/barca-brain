# 10 — Design system: the photo pass

What the app looks like and why. Read this before changing colours, photos or type.

## Direction
A sports-poster look: night navy, the blaugrana gradient, gold for "look here",
condensed display type, and real photos. Score apps (FotMob, OneFootball, Apple Sports)
win on clarity: team colour as the main colour signal, bold compressed numbers, one
glance per screen. We keep that clarity and add what they lack: club identity and photos.

## Colour
| Token | Value | Use |
|---|---|---|
| `--barca-blue` | #004D98 | links, active chips, data stripes |
| `--barca-garnet` | #A50044 | defeats, accents, kicker headings |
| `--barca-gold` | #EDBB00 | the one thing to look at: highlights, badges, numbers on photos |
| `--barca-navy` | #0A1230 | headings on light, dark panels |
| `--night` | #060B1F | behind photos (deeper than navy so photos pop) |
| `--grad-blaugrana` | garnet → purple → blue | photo frames, empty-photo cards |
| `--photo-tint` | magenta → indigo → blue | the tint laid over player photos |

Hex values are the widely used club values (third-party sources agree on blue, garnet, gold).
Gold is for emphasis only. Never put gold text on white (about 1.8:1, which fails).

## Contrast (WCAG 2.2 AA)
- Body text 4.5:1, large text (24px+, or 19px+ bold) 3:1.
- Text on a photo always sits on a scrim (a dark gradient), never on the bare photo.
  Measure against the lightest pixel behind the text.
  - Hero: navy at 92% → 30%, darkest on the left where the headline is.
  - Cards: `--scrim-up` (96% navy at the bottom, gone by 62%) plus a 55% wash at the top for the number.
- Gold text painted through the letters (`background-clip: text`) gets no `text-shadow`,
  because the shadow shows through and dulls it. Use `filter: drop-shadow` instead.

## Photos
- **Sources, in order:** Wikimedia Commons (free licences only, see `ALLOWED_PHOTO_LICENSE`),
  then our own art (shirts, crests, trencadís). Never outlets' or the club's photos.
- **Tint:** every player photo goes through `DuoPhoto`. Photos come from many kits
  (Spain, Brazil, old clubs); the tint makes them one set in club colours.
  Hover/focus removes the tint and shows the photo as taken.
- **Credit:** CC BY / BY-SA need author, licence, link and a note that we changed the photo.
  The credits page lists every photo and says they are tinted/darkened.
- **Crop:** faces sit high in portraits, so `object-position: center 20%`.
  Very wide boxes give the photo half the width and fade it in, rather than zooming into a face.
- **Missing photo:** initials on the blaugrana gradient. Never a broken image.

## Type
- Display: Big Shoulders 800–900, uppercase, line-height 0.9–0.95. Headlines, names, numbers.
- Text: Inter. Small labels: 0.7rem, 700–800, letter-spacing 0.06–0.08em, uppercase.
- Numbers use `tabular-nums` where they line up or count.

## Motion
- Transform and opacity only. Entrance 0.5–0.9s ease-out, hover 300ms.
- The global `prefers-reduced-motion` rule turns it all off. Don't add motion it can't reach.

## Layout
- Content width 1200px; photos may bleed to the screen edge (`--bleed`).
- Squad cards: 2 across on phones, as many 12.5rem cards as fit above 640px. 3:4 ratio.

## Research sources
- Text over images and scrims: Smashing Magazine, "Designing Accessible Text Over Images" (2023); W3C WCAG F83.
- Dark surfaces: Material Design dark theme (m2.material.io/design/color/dark-theme).
- Apple Sports: Lickability's design teardown (team colours as cards, compact bold score numerals).
- Club colours: fcbarcelona.com "The colours"; teamcolorcodes.com.
