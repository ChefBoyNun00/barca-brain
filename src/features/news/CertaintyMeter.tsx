import { T } from "@/i18n/language";
import type { TextKey } from "@/i18n/dictionary";
import type { MeterStep } from "./stories";

const STEPS: MeterStep[] = [1, 2, 3, 4];

/** Four segments that fill as a deal firms up. The label carries the meaning, not the colour. */
export function CertaintyMeter({ step }: { step: MeterStep }) {
  return (
    <div className="meter" data-step={step}>
      <span className="meter-track" aria-hidden="true">
        {STEPS.map((segment) => (
          <span key={segment} className="meter-segment" data-on={segment <= step} />
        ))}
      </span>
      <span className="meter-label">
        <T k={`news.meter${step}` as TextKey} />
      </span>
    </div>
  );
}
