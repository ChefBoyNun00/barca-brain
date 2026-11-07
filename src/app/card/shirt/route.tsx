import { CARD_COLOURS, CardFrame, renderCard, wantsDownload } from "@/features/share/card-kit";
import { ShirtCardArt } from "@/features/share/ShirtCardArt";
import { cleanShirtInput } from "@/features/share/shirt-input";

/** A shirt with any name and number on the back, as a picture to share. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const { name, number } = cleanShirtInput(params.get("name"), params.get("number"));
  const jersey = { printed: name, number };

  return renderCard(
    <CardFrame>
      <div style={{ display: "flex", alignItems: "center", gap: 64, width: "100%" }}>
        <ShirtCardArt jersey={jersey} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <span style={{ fontSize: 36, letterSpacing: 6, color: CARD_COLOURS.gold }}>
            MY BARÇA SHIRT
          </span>
          <span style={{ fontSize: name.length > 9 ? 120 : 170, lineHeight: 1 }}>{name}</span>
          <span style={{ fontSize: 120, lineHeight: 1, color: CARD_COLOURS.gold }}>
            {number === null ? "" : `No. ${number}`}
          </span>
        </div>
      </div>
    </CardFrame>,
    { download: wantsDownload(request.url) ? "my-barca-shirt" : undefined },
  );
}
