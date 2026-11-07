export const SHIRT_NAME_MAX = 12;
export const SHIRT_DEFAULT = { name: "CULER", number: 10 } as const;

/**
 * Whatever a visitor types ends up printed on a shirt and in a public image, so it is
 * trimmed to letters, spaces and a few name marks, in capitals, and the number to 0-99.
 */
export function cleanShirtInput(
  rawName: string | null | undefined,
  rawNumber: string | null | undefined,
): { name: string; number: number | null } {
  const name = (rawName ?? "")
    .normalize("NFC")
    .replace(/[^\p{L}\p{M} .'-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, SHIRT_NAME_MAX)
    .toLocaleUpperCase("en");
  const parsed =
    rawNumber === null || rawNumber === undefined ? NaN : Number.parseInt(rawNumber, 10);
  const number = Number.isInteger(parsed) && parsed >= 0 && parsed <= 99 ? parsed : null;
  if (name === "" && number === null) return { ...SHIRT_DEFAULT };
  return { name: name === "" ? SHIRT_DEFAULT.name : name, number };
}
