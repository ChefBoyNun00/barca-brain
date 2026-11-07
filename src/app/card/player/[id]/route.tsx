import { connection } from "next/server";
import { POSITION_LABELS } from "@/config/display";
import { CARD_COLOURS, CardFrame, renderCard, wantsDownload } from "@/features/share/card-kit";
import { ShirtCardArt } from "@/features/share/ShirtCardArt";
import { getSquadData } from "@/features/squad/get-squad-data";
import { getJersey } from "@/features/squad/jersey-data";
import { isLaMasia } from "@/features/squad/la-masia";
import { getPlayerTotals } from "@/features/squad/squad-stats";

type Context = { params: Promise<{ id: string }> };

/** A player as a picture: their shirt and their season in three numbers. */
export async function GET(request: Request, { params }: Context) {
  await connection();
  const { id } = await params;
  const { squad } = await getSquadData();
  const player = squad.find((item) => item.id === id);
  if (!player) return new Response("No such player", { status: 404 });

  const totals = getPlayerTotals(player);
  const stats = [
    { label: "GOALS", value: String(totals.goals) },
    { label: "ASSISTS", value: totals.assists === null ? "–" : String(totals.assists) },
    { label: "PLAYED", value: totals.matches === null ? "–" : String(totals.matches) },
  ];

  return renderCard(
    <CardFrame>
      <div style={{ display: "flex", alignItems: "center", gap: 64, width: "100%" }}>
        <ShirtCardArt jersey={getJersey(player)} keeper={player.position === "GK"} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <span style={{ fontSize: 34, letterSpacing: 6, color: CARD_COLOURS.gold }}>
            {(player.position ? POSITION_LABELS[player.position] : "Squad player").toUpperCase()}
            {isLaMasia(player) ? " · LA MASIA" : ""}
          </span>
          <span style={{ fontSize: player.name.length > 14 ? 96 : 120, lineHeight: 1 }}>
            {player.name.toUpperCase()}
          </span>
          <div style={{ display: "flex", gap: 48, marginTop: 28 }}>
            {stats.map((stat) => (
              <div key={stat.label} style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 120, lineHeight: 1, color: CARD_COLOURS.gold }}>
                  {stat.value}
                </span>
                <span style={{ fontSize: 30, letterSpacing: 4, color: "rgba(255,255,255,0.7)" }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardFrame>,
    { download: wantsDownload(request.url) ? "barca-player" : undefined },
  );
}
