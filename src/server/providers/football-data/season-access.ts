import { CURRENT_SEASON, FOOTBALL_DATA } from "@/config/football";
import { getFromFootballData } from "./client";
import { ErrorBodySchema, TeamMatchesSchema } from "./schemas";

export type SeasonAccess =
  | {
      kind: "ok";
      matchCount: number;
      finishedCount: number;
      teamName: string | null;
      competitions: { code: string; name: string; matches: number }[];
      firstKickoff: string | null;
      lastKickoff: string | null;
    }
  | { kind: "empty" }
  | { kind: "plan-restricted" | "bad-key" | "rate-limited" | "unexpected"; message: string };

function classifyError(httpStatus: number, body: unknown): SeasonAccess {
  const parsed = ErrorBodySchema.safeParse(body);
  const message = parsed.success ? parsed.data.message : `HTTP ${httpStatus}`;

  if (httpStatus === 429) return { kind: "rate-limited", message };
  if (httpStatus === 403) return { kind: "plan-restricted", message };
  if (httpStatus === 401 || (httpStatus === 400 && /token/i.test(message))) {
    return { kind: "bad-key", message };
  }
  return { kind: "unexpected", message };
}

/** Pure interpretation of a reply. Unlike API-Football, this API uses real HTTP error codes. */
export function classifySeasonAccess(httpStatus: number, body: unknown): SeasonAccess {
  if (httpStatus !== 200) {
    return classifyError(httpStatus, body);
  }

  const parsed = TeamMatchesSchema.safeParse(body);
  if (!parsed.success) {
    return { kind: "unexpected", message: "HTTP 200, unrecognised response shape" };
  }

  const { matches } = parsed.data;
  if (matches.length === 0) {
    return { kind: "empty" };
  }

  const competitions = new Map<string, { code: string; name: string; matches: number }>();
  for (const { competition } of matches) {
    const entry = competitions.get(competition.code) ?? { ...competition, matches: 0 };
    entry.matches += 1;
    competitions.set(competition.code, entry);
  }

  const kickoffs = matches.map((match) => match.utcDate).sort();
  const teams = matches.flatMap((match) => [match.homeTeam, match.awayTeam]);

  return {
    kind: "ok",
    matchCount: matches.length,
    finishedCount: matches.filter((match) => match.status === "FINISHED").length,
    teamName: teams.find((team) => team.id === FOOTBALL_DATA.teamId)?.name ?? null,
    competitions: [...competitions.values()],
    firstKickoff: kickoffs[0] ?? null,
    lastKickoff: kickoffs.at(-1) ?? null,
  };
}

export async function checkSeasonAccess(
  apiToken: string,
): Promise<{ access: SeasonAccess; requestsLeftThisMinute: string | null }> {
  const reply = await getFromFootballData(
    `/v4/teams/${FOOTBALL_DATA.teamId}/matches`,
    { season: CURRENT_SEASON },
    apiToken,
  );
  return {
    access: classifySeasonAccess(reply.httpStatus, reply.body),
    requestsLeftThisMinute: reply.requestsLeftThisMinute,
  };
}
