import { describe, expect, it } from "vitest";
import { scrubAnalyticsUrl } from "./scrub-url";

describe("scrubAnalyticsUrl", () => {
  it("removes a typed Ask question", () => {
    expect(scrubAnalyticsUrl("https://x.app/ask?q=who%20scored")).toBe("https://x.app/ask");
  });

  it("removes a name typed into the shirt maker", () => {
    expect(scrubAnalyticsUrl("https://x.app/shirt?name=Daniel&number=10")).toBe(
      "https://x.app/shirt",
    );
  });

  it("keeps the news edition and drops the rest", () => {
    expect(scrubAnalyticsUrl("https://x.app/news?edition=israel&utm_source=wa")).toBe(
      "https://x.app/news?edition=israel",
    );
  });

  it("drops the #section part", () => {
    expect(scrubAnalyticsUrl("https://x.app/table#numbers")).toBe("https://x.app/table");
  });

  it("leaves a plain address alone", () => {
    expect(scrubAnalyticsUrl("https://x.app/matches")).toBe("https://x.app/matches");
  });

  it("refuses an address it can't read", () => {
    expect(scrubAnalyticsUrl("not a url")).toBeNull();
  });
});
