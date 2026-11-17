import Image from "next/image";
import type { Moment } from "@/config/moments";

/**
 * A photo faded in behind a section. Purely decoration: hidden from screen readers, no alt text.
 * "night" sits behind dark sections (the photo shows through a dark wash); "page" sits faintly
 * behind the top of a light page and fades out before the content gets dense.
 * The look lives in premium.css (.backdrop). The parent decides the stacking: see the CSS.
 */
export function PhotoBackdrop({
  moment,
  tone = "night",
  archival = false,
  priority = false,
}: {
  moment: Moment;
  tone?: "night" | "page";
  /** Sepia and grain, for a chapter set long before the photo was taken (the 1899 founding). */
  archival?: boolean;
  /** True only when the photo is at the top of the page, so it loads first. */
  priority?: boolean;
}) {
  return (
    <div aria-hidden="true" className="backdrop" data-tone={tone} data-archival={archival || undefined}>
      <Image
        src={moment.src}
        alt=""
        fill
        sizes="100vw"
        priority={priority}
        style={moment.focus ? { objectPosition: moment.focus } : undefined}
      />
    </div>
  );
}
