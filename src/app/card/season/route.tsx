import { connection } from "next/server";
import { CURRENT_SEASON } from "@/config/football";
import { formatSeason } from "@/features/home/format";
import { getHomeData } from "@/features/home/get-home-data";
import { buildHeadline, summariseSeason } from "@/features/home/season-story";
import { CARD_COLOURS, CardFrame, renderCard, wantsDownload } from "@/features/share/card-kit";

/** The season so far as a picture: the headline and the record. Also the site's link preview. */
export async function GET(request: Request) {
  await connection();
  const { matches, standing } = await getHomeData();
  const summary = summariseSeason(matches);
  const headline = buildHeadline(summary, standing);
  const stats = [
    { label: "WINS", value: summary.wins },
    { label: "DRAWS", value: summary.draws },
    { label: "DEFEATS", value: summary.losses },
    { label: "GOALS", value: summary.goalsFor },
  ];

  return renderCard(
    <CardFrame>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 36, letterSpacing: 6, color: CARD_COLOURS.gold }}>
          SEASON {formatSeason(CURRENT_SEASON)} · {summary.played} OF {matches.length} PLAYED
        </span>
        {headline.map((line, index) => (
          <span
            key={line}
            style={{
              fontSize: 128,
              lineHeight: 1,
              textTransform: "uppercase",
              color: index === 0 ? "#ffffff" : CARD_COLOURS.gold,
            }}
          >
            {line}
          </span>
        ))}
        <div style={{ display: "flex", gap: 56, marginTop: 30 }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 96, lineHeight: 1 }}>{stat.value}</span>
              <span style={{ fontSize: 28, letterSpacing: 4, color: "rgba(255,255,255,0.7)" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </CardFrame>,
    { download: wantsDownload(request.url) ? "barca-season" : undefined },
  );
}
