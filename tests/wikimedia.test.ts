import { describe, expect, it } from "vitest";
import { cleanCredit } from "@/server/providers/wikimedia/mapper";
import { createWikimediaPhotoProvider } from "@/server/providers/wikimedia/provider";

const birthDate = "2007-07-13";

const entity = (born: string, image?: string) => ({
  claims: {
    P569: [{ mainsnak: { datavalue: { value: { time: `+${born}T00:00:00Z` } } } }],
    ...(image ? { P18: [{ mainsnak: { datavalue: { value: image } } }] } : {}),
  },
});

const imageReply = (license: string, artist = "<a href='#'>A Photographer</a>") => ({
  query: {
    pages: {
      "1": {
        imageinfo: [
          {
            thumburl: "https://upload.wikimedia.org/thumb.jpg",
            descriptionurl: "https://commons.wikimedia.org/wiki/File:Photo.jpg",
            extmetadata: { LicenseShortName: { value: license }, Artist: { value: artist } },
          },
        ],
      },
    },
  },
});

function providerWith(entities: Record<string, unknown>, license = "CC BY-SA 4.0") {
  const urls: URL[] = [];
  const provider = createWikimediaPhotoProvider({
    sleep: async () => {},
    fetchJson: async (url) => {
      urls.push(url);
      const action = url.searchParams.get("action");
      if (action === "wbsearchentities") {
        return { search: Object.keys(entities).map((id) => ({ id })) };
      }
      if (action === "wbgetentities") return { entities };
      return imageReply(license);
    },
  });
  return { provider, urls };
}

const find = (provider: ReturnType<typeof providerWith>["provider"], name = "Lamine Yamal") =>
  provider.findPlayerPhoto({ name, birthDate });

describe("findPlayerPhoto", () => {
  it("returns a credited photo when the birth date matches", async () => {
    const { provider } = providerWith({ Q1: entity(birthDate, "Photo.jpg") });
    expect(await find(provider)).toEqual({
      url: "https://upload.wikimedia.org/thumb.jpg",
      credit: "A Photographer",
      license: "CC BY-SA 4.0",
      pageUrl: "https://commons.wikimedia.org/wiki/File:Photo.jpg",
    });
  });

  it("ignores someone with the same name and a different birthday", async () => {
    const { provider } = providerWith({ Q1: entity("1990-01-01", "Other.jpg") });
    expect(await find(provider)).toBeNull();
  });

  it("refuses to guess when two people match", async () => {
    const { provider } = providerWith({
      Q1: entity(birthDate, "One.jpg"),
      Q2: entity(birthDate, "Two.jpg"),
    });
    expect(await find(provider)).toBeNull();
  });

  it("returns nothing when the person has no image", async () => {
    const { provider } = providerWith({ Q1: entity(birthDate) });
    expect(await find(provider)).toBeNull();
  });

  it("copes with an item that has no claims at all", async () => {
    const { provider } = providerWith({ Q1: { claims: [] }, Q2: entity(birthDate, "Photo.jpg") });
    expect(await find(provider)).not.toBeNull();
  });

  it.each(["CC BY-NC 4.0", "CC BY-ND 4.0", "All rights reserved", "Fair use"])(
    "refuses a %s image",
    async (license) => {
      const { provider } = providerWith({ Q1: entity(birthDate, "Photo.jpg") }, license);
      expect(await find(provider)).toBeNull();
    },
  );

  it.each(["CC BY 2.0", "CC BY-SA 3.0", "CC0", "Public domain"])(
    "accepts a %s image",
    async (license) => {
      const { provider } = providerWith({ Q1: entity(birthDate, "Photo.jpg") }, license);
      expect(await find(provider)).not.toBeNull();
    },
  );

  it("searches by the name Wikimedia knows", async () => {
    const { provider, urls } = providerWith({ Q1: entity(birthDate, "Photo.jpg") });
    await find(provider, "Pablo Gavira");
    expect(urls[0]?.searchParams.get("search")).toBe("Gavi");
  });

  it("fails loudly on a reply it does not recognise", async () => {
    const provider = createWikimediaPhotoProvider({
      sleep: async () => {},
      fetchJson: async () => ({ surprise: true }),
    });
    await expect(find(provider)).rejects.toThrow("Unrecognised response");
  });
});

describe("cleanCredit", () => {
  it("removes HTML and spacing", () => {
    expect(cleanCredit("<a href='x'>Bryan   Berlin</a>\n")).toBe("Bryan Berlin");
  });

  it("names an unknown author plainly", () => {
    expect(cleanCredit("Unknown authorUnknown author")).toBe("Unknown author");
    expect(cleanCredit(undefined)).toBe("Unknown author");
  });
});
