// Draws public/trencadis.svg: a mosaic of broken tiles in the club's colours, like the trencadís
// of Gaudí's Park Güell. Run `node scripts/make-trencadis.mjs` to redraw it. It is seeded, so the
// same seed always gives the same picture.

import { writeFileSync } from "node:fs";

const WIDTH = 1600;
const HEIGHT = 480;
const CELL = 64;
const SEED = 1899; // the year the club was founded

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = mulberry32(SEED);

const PALETTE = [
  ...Array(5).fill("#004d98"),
  ...Array(3).fill("#1767b8"),
  ...Array(3).fill("#0b2a6b"),
  "#4f8fd6",
  ...Array(5).fill("#a50044"),
  ...Array(3).fill("#c2124d"),
  ...Array(2).fill("#8c0f35"),
  ...Array(3).fill("#edbb00"),
  "#f5c518",
  ...Array(2).fill("#f4ecd6"),
];

const columns = Math.ceil(WIDTH / CELL) + 2;
const rows = Math.ceil(HEIGHT / CELL) + 2;

// A grid of points, each knocked off its place, so no two tiles are alike.
const points = Array.from({ length: rows }, (_, row) =>
  Array.from({ length: columns }, (_, column) => [
    (column - 1) * CELL + (random() - 0.5) * CELL * 0.7,
    (row - 1) * CELL + (random() - 0.5) * CELL * 0.7,
  ]),
);

const tiles = [];
for (let row = 0; row < rows - 1; row += 1) {
  for (let column = 0; column < columns - 1; column += 1) {
    const a = points[row][column];
    const b = points[row][column + 1];
    const c = points[row + 1][column + 1];
    const d = points[row + 1][column];
    // Each cell breaks along one diagonal or the other.
    const shards = random() < 0.5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
    for (const shard of shards) {
      const colour = PALETTE[Math.floor(random() * PALETTE.length)];
      const polygon = shard.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
      tiles.push(`<polygon points="${polygon}" fill="${colour}"/>`);
    }
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid slice">
<rect width="${WIDTH}" height="${HEIGHT}" fill="#0a1230"/>
<g stroke="#0a1230" stroke-width="2.4" stroke-linejoin="round">
${tiles.join("\n")}
</g>
</svg>
`;

writeFileSync(new URL("../public/trencadis.svg", import.meta.url), svg);
console.log(`Wrote ${tiles.length} tiles.`);
