import { ShirtArt } from "../squad/ShirtArt";
import type { Jersey } from "../squad/jersey-data";

const WIDTH = 380;
const HEIGHT = Math.round((WIDTH * 224) / 200);

/** The back of a shirt for a share card. The name and number are real text laid on top. */
export function ShirtCardArt({ jersey, keeper = false }: { jersey: Jersey; keeper?: boolean }) {
  const ink = keeper ? "#0a1230" : "#f5c518";
  return (
    <div style={{ display: "flex", position: "relative", width: WIDTH, height: HEIGHT }}>
      <ShirtArt
        side="back"
        jersey={jersey}
        keeper={keeper}
        idPrefix="card"
        withText={false}
        size={{ width: WIDTH, height: HEIGHT }}
      />
      <div
        style={{
          position: "absolute",
          top: 108,
          left: 0,
          width: WIDTH,
          display: "flex",
          justifyContent: "center",
          fontSize: 34,
          letterSpacing: 4,
          color: ink,
        }}
      >
        {jersey.printed}
      </div>
      <div
        style={{
          position: "absolute",
          top: 148,
          left: 0,
          width: WIDTH,
          display: "flex",
          justifyContent: "center",
          fontSize: 230,
          lineHeight: 1,
          color: ink,
        }}
      >
        {jersey.number ?? "–"}
      </div>
    </div>
  );
}
