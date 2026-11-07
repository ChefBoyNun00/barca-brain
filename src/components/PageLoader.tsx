import Image from "next/image";
import { BARCA_CREST_URL } from "@/config/display";

/** What a page shows while its data arrives: the crest, turning slowly. */
export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="page-loader">
      <Image src={BARCA_CREST_URL} alt="" width={72} height={72} unoptimized />
    </div>
  );
}
