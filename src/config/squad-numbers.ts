// Shirt numbers and the name printed on the back, keyed by the exact name the data provider uses.
// The free football-data tier has no shirt numbers, so Daniel maintains them here (2026-27 squad,
// checked 2026-11-07). A player missing from this list shows a dash and their surname.
// If a name changes in the provider's data, the player silently loses their number: fix it here.

export type JerseyEntry = { number: number; printed: string };

export const SQUAD_JERSEYS: Record<string, JerseyEntry> = {
  "Joan García": { number: 1, printed: "J. GARCÍA" },
  "João Cancelo": { number: 2, printed: "CANCELO" },
  "Álex Balde": { number: 3, printed: "BALDE" },
  "Brian Fariñas": { number: 4, printed: "FARIÑAS" },
  "Pau Cubarsí": { number: 5, printed: "CUBARSÍ" },
  "Pablo Gavira": { number: 6, printed: "GAVI" },
  "Fermín López": { number: 7, printed: "FERMÍN" },
  Pedri: { number: 8, printed: "PEDRI" },
  "Gabriel Jesus": { number: 9, printed: "JESUS" },
  "Lamine Yamal": { number: 10, printed: "YAMAL" },
  Raphinha: { number: 11, printed: "RAPHINHA" },
  "Xavi Espart": { number: 12, printed: "ESPART" },
  "Wojciech Szczęsny": { number: 13, printed: "SZCZĘSNY" },
  "Karim Adeyemi": { number: 14, printed: "ADEYEMI" },
  "Andreas Christensen": { number: 15, printed: "CHRISTENSEN" },
  Rodri: { number: 16, printed: "RODRI" },
  "Anthony Gordon": { number: 17, printed: "GORDON" },
  "Gerard Martín": { number: 18, printed: "G. MARTÍN" },
  "Roony Bardghji": { number: 19, printed: "BARDGHJI" },
  "Dani Olmo": { number: 20, printed: "OLMO" },
  "Frenkie de Jong": { number: 21, printed: "DE JONG" },
  "Marc Bernal": { number: 22, printed: "BERNAL" },
  "Jules Koundé": { number: 23, printed: "KOUNDÉ" },
  "Eric García": { number: 24, printed: "E. GARCÍA" },
  "Dominik Livaković": { number: 25, printed: "LIVAKOVIĆ" },
  "Jesse Bisiwu": { number: 27, printed: "BISIWU" },
  "Hamza Abdelkarim": { number: 29, printed: "ABDELKARIM" },
};
