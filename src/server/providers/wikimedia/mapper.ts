import { ALLOWED_PHOTO_LICENSE } from "@/config/photos";
import type { DomainPlayerPhoto } from "@/domain/football";
import { DateValueSchema, type Entities, type ImageInfo } from "./schemas";

const BIRTH_DATE_PROPERTY = "P569";
const IMAGE_PROPERTY = "P18";
const UNKNOWN_AUTHOR = "Unknown author";

type Entity = Entities[string];

function hasBirthDate(entity: Entity, birthDate: string): boolean {
  return (entity.claims?.[BIRTH_DATE_PROPERTY] ?? []).some((claim) => {
    const parsed = DateValueSchema.safeParse(claim.mainsnak.datavalue?.value);
    return parsed.success && parsed.data.time.slice(1, 11) === birthDate;
  });
}

/**
 * Names are shared, so a birth date must match too. If two people still match,
 * returns null: no photo is better than the wrong person's face.
 */
export function findImageFile(entities: Entities, birthDate: string): string | null {
  const matches = Object.values(entities).filter((entity) => hasBirthDate(entity, birthDate));
  if (matches.length !== 1) return null;
  const value = matches[0]?.claims?.[IMAGE_PROPERTY]?.[0]?.mainsnak.datavalue?.value;
  return typeof value === "string" ? value : null;
}

/** Commons sends the author as HTML. The credit is shown as plain text. */
export function cleanCredit(artist: string | undefined): string {
  const text = (artist ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text === "" || /unknown author/i.test(text) ? UNKNOWN_AUTHOR : text;
}

export function mapPhoto(raw: ImageInfo): DomainPlayerPhoto | null {
  const info = Object.values(raw.query.pages)[0]?.imageinfo?.[0];
  const license = info?.extmetadata.LicenseShortName?.value;
  if (!info || !license || !ALLOWED_PHOTO_LICENSE.test(license)) return null;
  return {
    url: info.thumburl,
    credit: cleanCredit(info.extmetadata.Artist?.value),
    license,
    pageUrl: info.descriptionurl,
  };
}
