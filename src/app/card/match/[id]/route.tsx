import { displayCompetition, formatMatchDate } from "@/features/home/format";
import { describeOutcome, getMatchOutcome } from "@/features/home/season-story";
import { CARD_COLOURS, CardFrame, renderCard, wantsDownload } from "@/features/share/card-kit";
import { getSeasonData } from "@/features/season/get-season-data";
import { BARCA_CREST_URL } from "@/config/display";
import { connection } from "next/server";

function CardSide({ name, crest }: { name: string; crest: string | null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 300 }}>
      {crest && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={crest} alt="" width={210} height={210} style={{ objectFit: "contain" }} />
      )}
      <span style={{ marginTop: 8, fontSize: 54, textAlign: "center" }}>{name.toUpperCase()}</span>
    </div>
  );
}

type Context = { params: Promise<{ id: string }> };

/** One match as a picture: both crests, the score and the result. */
export async function GET(request: Request, { params }: Context) {
  await connection();
  const { id } = await params;
  const { matches } = await getSeasonData();
  const match = matches.find((item) => item.id === id);
  if (!match) return new Response("No such match", { status: 404 });

  const outcome = getMatchOutcome(match);
  const opponent = match.opponent?.name ?? "To be decided";
  const opponentCrest = match.opponent?.logoUrl ?? null;
  const sides = match.isHome
    ? [
        { name: "Barça", crest: BARCA_CREST_URL },
        { name: opponent, crest: opponentCrest },
      ]
    : [
        { name: opponent, crest: opponentCrest },
        { name: "Barça", crest: BARCA_CREST_URL },
      ];
  const goals = match.isHome
    ? [match.goalsFor, match.goalsAgainst]
    : [match.goalsAgainst, match.goalsFor];
  const tone =
    outcome === "W" ? CARD_COLOURS.gold : outcome === "L" ? "#ff5c8a" : "rgba(255,255,255,0.85)";

  return renderCard(
    <CardFrame>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 38,
            letterSpacing: 5,
          }}
        >
          <span style={{ color: CARD_COLOURS.gold }}>
            {[displayCompetition(match.competition), match.round]
              .filter(Boolean)
              .join(" · ")
              .toUpperCase()}
          </span>
          <span style={{ color: tone }}>
            {outcome ? describeOutcome(outcome).toUpperCase() : "COMING UP"}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <CardSide name={sides[0]!.name} crest={sides[0]!.crest} />
          <div style={{ display: "flex", fontSize: outcome ? 250 : 190, lineHeight: 1 }}>
            {outcome ? `${goals[0]}–${goals[1]}` : "V"}
          </div>
          <CardSide name={sides[1]!.name} crest={sides[1]!.crest} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            fontSize: 32,
            letterSpacing: 4,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          {formatMatchDate(match.kickoffAt).toUpperCase()} · {match.isHome ? "HOME" : "AWAY"}
          {match.halfTimeFor !== null && match.halfTimeAgainst !== null
            ? ` · HALF-TIME ${match.halfTimeFor}–${match.halfTimeAgainst}`
            : ""}
        </div>
      </div>
    </CardFrame>,
    { download: wantsDownload(request.url) ? "barca-match" : undefined },
  );
}
