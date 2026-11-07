import { z } from "zod";

export const SearchSchema = z.object({ search: z.array(z.object({ id: z.string() })) });

const ClaimSchema = z.object({
  mainsnak: z.object({ datavalue: z.object({ value: z.unknown() }).optional() }),
});

// An item with no claims comes back as [] instead of {}, so that case is read as none.
const EntitySchema = z.object({
  claims: z.record(z.string(), z.array(ClaimSchema)).optional().catch(undefined),
});

export const EntitiesSchema = z.object({ entities: z.record(z.string(), EntitySchema) });

export const DateValueSchema = z.object({ time: z.string() });

const MetadataValueSchema = z.object({ value: z.string() }).optional();

export const ImageInfoSchema = z.object({
  query: z.object({
    pages: z.record(
      z.string(),
      z.object({
        imageinfo: z
          .array(
            z.object({
              thumburl: z.string(),
              descriptionurl: z.string(),
              extmetadata: z.object({
                LicenseShortName: MetadataValueSchema,
                Artist: MetadataValueSchema,
              }),
            }),
          )
          .optional(),
      }),
    ),
  }),
});

export type Entities = z.infer<typeof EntitiesSchema>["entities"];
export type ImageInfo = z.infer<typeof ImageInfoSchema>;
