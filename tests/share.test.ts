import { describe, expect, it } from "vitest";
import { SHIRT_DEFAULT, SHIRT_NAME_MAX, cleanShirtInput } from "@/features/share/shirt-input";

describe("shirt input", () => {
  it("prints a name in capitals and keeps the number", () => {
    expect(cleanShirtInput("daniel", "7")).toEqual({ name: "DANIEL", number: 7 });
  });

  it("keeps accents and Catalan letters", () => {
    expect(cleanShirtInput("Núria Ç", "10").name).toBe("NÚRIA Ç");
  });

  it("strips markup, symbols and emoji from the name", () => {
    expect(cleanShirtInput("<b>Leo</b>😀;", "9").name).toBe("BLEOB");
  });

  it("cuts a long name", () => {
    expect(cleanShirtInput("a".repeat(40), "1").name).toHaveLength(SHIRT_NAME_MAX);
  });

  it("accepts only numbers from 0 to 99", () => {
    expect(cleanShirtInput("Leo", "100").number).toBeNull();
    expect(cleanShirtInput("Leo", "-3").number).toBeNull();
    expect(cleanShirtInput("Leo", "abc").number).toBeNull();
    expect(cleanShirtInput("Leo", "0").number).toBe(0);
  });

  it("falls back to a default shirt when nothing usable is given", () => {
    expect(cleanShirtInput("", null)).toEqual(SHIRT_DEFAULT);
    expect(cleanShirtInput("!!!", "x").name).toBe(SHIRT_DEFAULT.name);
  });
});
