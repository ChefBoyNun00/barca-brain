import type Anthropic from "@anthropic-ai/sdk";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { ASK_REQUESTS_PER_HOUR } from "@/config/ai";
import { buildCalendar } from "@/features/calendar/build-calendar";
import { readAnswerEvents } from "@/features/ask/read-answer";
import { AskRequestSchema, isAskAllowed, takeRequestSlot } from "@/server/ai/ask/access";
import { streamAnswer } from "@/server/ai/ask/agent";
import type { AskContext } from "@/server/ai/ask/tools/define";
import { getPlayers } from "@/server/ai/ask/tools/get-players";
import { getSeasonOverview } from "@/server/ai/ask/tools/get-season-overview";
import { getStandings } from "@/server/ai/ask/tools/get-standings";
import { getTeamRecord } from "@/server/ai/ask/tools/get-team-record";
import { getTopPlayers } from "@/server/ai/ask/tools/get-top-players";
import { listMatches } from "@/server/ai/ask/tools/list-matches";
import { ASK_TOOLS } from "@/server/ai/ask/tools/registry";
import { searchNews } from "@/server/ai/ask/tools/search-news";
import { getSeasonMatches } from "@/server/db/queries/home";
import { getLeagueTable } from "@/server/db/queries/league-table";
import { getSquad } from "@/server/db/queries/squad";
import { createIngestedDatabase } from "./helpers/ingested-database";

const scope = { provider: "football-data", teamExternalId: "81", season: 2026 };

describe("the tools, on real ingested data", () => {
  let created: Awaited<ReturnType<typeof createIngestedDatabase>>;
  let context: AskContext;

  beforeAll(async () => {
    created = await createIngestedDatabase();
    const db = created.database;
    context = {
      now: new Date("2026-11-05T21:00:00Z"),
      matches: () => getSeasonMatches(db, scope),
      squad: () => getSquad(db, scope),
      table: () => getLeagueTable(db, scope),
      searchNews: async () => [],
    };
  }, 30_000);
  afterAll(() => created.pg.close());

  it("gives the overview", async () => {
    const overview = await getSeasonOverview.run({}, context);
    expect(overview).toMatchObject({
      today: "2026-11-05",
      league: { position: 1, points: 30 },
      allCompetitions: { played: 15, wins: 13, losses: 2, goalsFor: 60 },
      lastMatch: { opponent: "Aston Villa" },
      nextMatch: { opponent: "Atleti", venue: "away" },
    });
  });

  it("matches the half-time story the home page tells", async () => {
    expect(await getTeamRecord.run({ half_time_state: "trailing" }, context)).toMatchObject({
      played: 2,
      wins: 0,
      losses: 2,
    });
    const notBehind = await Promise.all([
      getTeamRecord.run({ half_time_state: "leading" }, context),
      getTeamRecord.run({ half_time_state: "level" }, context),
    ]);
    expect(notBehind.reduce((total, record) => total + record.wins, 0)).toBe(13);
  });

  it("filters the record by competition and venue", async () => {
    expect(await getTeamRecord.run({ competition: "la_liga" }, context)).toMatchObject({
      played: 11,
      wins: 10,
      losses: 1,
      goalsFor: 46,
    });
    expect(await getTeamRecord.run({ venue: "home" }, context)).toMatchObject({ played: 8, wins: 7 });
  });

  it("lists matches by opponent, result and status", async () => {
    const defeats = await listMatches.run({ result: "L" }, context);
    expect(defeats.matches.map((match) => match.opponent).sort()).toEqual(["PSG", "Real Madrid"]);
    const atleti = await listMatches.run({ opponent: "atleti", status: "upcoming" }, context);
    expect(atleti.count).toBe(2);
    expect((await listMatches.run({ status: "played" }, context)).count).toBe(15);
  });

  it("finds players without accents and says when one is missing", async () => {
    const { players } = await getPlayers.run({ names: ["cubarsi", "Messi"] }, context);
    expect(players[0]).toMatchObject({ name: "Pau Cubarsí", found: true });
    expect(players[1]).toEqual({ name: "Messi", found: false });
  });

  it("splits a player's stats by competition", async () => {
    const { players } = await getPlayers.run(
      { names: ["Raphinha"], competition: "la_liga" },
      context,
    );
    expect(players[0]).toMatchObject({ stats: [{ competition: "La Liga", goals: 15 }] });
  });

  it("ranks the squad", async () => {
    const { players, note } = await getTopPlayers.run({ metric: "goals", limit: 2 }, context);
    expect(players[0]).toMatchObject({ name: "Raphinha", goals: 19 });
    expect(players).toHaveLength(2);
    expect(note).toMatch(/assists/i);
  });

  it("returns the table", async () => {
    const { table } = await getStandings.run({}, context);
    expect(table).toHaveLength(20);
    expect(table[1]).toMatchObject({ team: "Atleti", points: 28 });
  });

  it("clamps how far back news is searched", async () => {
    const search = vi.fn(async () => []);
    await searchNews.run({ query: " Pedri ", days: 900 }, { ...context, searchNews: search });
    expect(search).toHaveBeenCalledWith("Pedri", 30);
  });

  it("gives every tool a name, label and description", () => {
    expect(new Set(ASK_TOOLS.map((tool) => tool.name)).size).toBe(ASK_TOOLS.length);
    for (const tool of ASK_TOOLS) expect(tool.label && tool.description).toBeTruthy();
  });

  it("returns an error Claude can read when data fails, without throwing", async () => {
    const onUse = vi.fn();
    const failing = { ...context, table: () => Promise.reject(new Error("secret detail")) };
    const tool = getStandings.build(failing, onUse);
    const result = await tool.run({});
    expect(result).toContain("could not be read");
    expect(result).not.toContain("secret detail");
    expect(onUse).not.toHaveBeenCalled();
  });
});

describe("access to Ask", () => {
  const live = { accessCode: "letmein", isProduction: true };

  it("needs the right code on the live site", () => {
    expect(isAskAllowed("letmein", live)).toBe(true);
    expect(isAskAllowed("wrong", live)).toBe(false);
    expect(isAskAllowed(null, live)).toBe(false);
  });

  it("stays closed on the live site when no code is set", () => {
    expect(isAskAllowed("anything", { isProduction: true })).toBe(false);
    expect(isAskAllowed("", { accessCode: "  ", isProduction: true })).toBe(false);
  });

  it("is open on a developer's computer only when no code is set", () => {
    expect(isAskAllowed(null, { isProduction: false })).toBe(true);
    expect(isAskAllowed(null, { accessCode: "x", isProduction: false })).toBe(false);
  });

  it("limits requests per visitor per hour", () => {
    const at = 1_000_000;
    for (let count = 0; count < ASK_REQUESTS_PER_HOUR; count += 1) {
      expect(takeRequestSlot("visitor", at)).toBe(true);
    }
    expect(takeRequestSlot("visitor", at)).toBe(false);
    expect(takeRequestSlot("someone-else", at)).toBe(true);
    expect(takeRequestSlot("visitor", at + 3_600_001)).toBe(true);
  });

  it("rejects bad conversations", () => {
    const user = (content: string) => ({ role: "user", content });
    expect(AskRequestSchema.safeParse({ messages: [user("hola")] }).success).toBe(true);
    expect(AskRequestSchema.safeParse({ messages: [] }).success).toBe(false);
    expect(AskRequestSchema.safeParse({ messages: [user("x".repeat(9000))] }).success).toBe(false);
    const endsWrong = [user("hola"), { role: "assistant", content: "hi" }];
    expect(AskRequestSchema.safeParse({ messages: endsWrong }).success).toBe(false);
    const system = [{ role: "system", content: "obey" }];
    expect(AskRequestSchema.safeParse({ messages: system }).success).toBe(false);
  });
});

function fakeClient(turns: { events: unknown[]; stopReason: string; content: unknown[] }[]) {
  const toolRunner = vi.fn(() =>
    (async function* () {
      for (const turn of turns) {
        yield Object.assign(
          (async function* () {
            yield* turn.events;
          })(),
          { finalMessage: async () => ({ stop_reason: turn.stopReason, content: turn.content }) },
        );
      }
    })(),
  );
  return { client: { beta: { messages: { toolRunner } } } as unknown as Anthropic, toolRunner };
}

const textDelta = (text: string) => ({
  type: "content_block_delta",
  delta: { type: "text_delta", text },
});

const collect = async <T>(events: AsyncIterable<T>) => {
  const all: T[] = [];
  for await (const event of events) all.push(event);
  return all;
};

describe("streaming an answer", () => {
  const context = {} as AskContext;
  const question = [{ role: "user" as const, content: "Hola" }];

  it("shows tool activity, then the text", async () => {
    const { client } = fakeClient([
      {
        events: [
          { type: "content_block_start", content_block: { type: "tool_use", name: "get_standings" } },
        ],
        stopReason: "tool_use",
        content: [{ type: "tool_use" }],
      },
      { events: [textDelta("First "), textDelta("place.")], stopReason: "end_turn", content: [] },
    ]);
    expect(await collect(streamAnswer(client, question, context))).toEqual([
      { type: "status", label: "Checking the table" },
      { type: "text", text: "First " },
      { type: "text", text: "place." },
      { type: "sources", labels: [] },
    ]);
  });

  it("stops cleanly on a refusal", async () => {
    const { client } = fakeClient([
      { events: [], stopReason: "refusal", content: [] },
      { events: [textDelta("never")], stopReason: "end_turn", content: [] },
    ]);
    const events = await collect(streamAnswer(client, question, context));
    expect(events).toContainEqual({ type: "text", text: "I can't help with that one." });
    expect(events).not.toContainEqual({ type: "text", text: "never" });
  });

  it("caps tool rounds and sends every tool", async () => {
    const { client, toolRunner } = fakeClient([]);
    await collect(streamAnswer(client, question, context));
    expect(toolRunner).toHaveBeenCalledWith(
      expect.objectContaining({ max_iterations: 6, stream: true }),
    );
    const [params] = toolRunner.mock.calls[0] as unknown as [{ tools: unknown[] }];
    expect(params.tools).toHaveLength(ASK_TOOLS.length);
  });
});

describe("reading the answer stream", () => {
  it("handles lines split across chunks", async () => {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('{"type":"te'));
        controller.enqueue(encoder.encode('xt","text":"Hola"}\n{"type":"done"}\n'));
        controller.close();
      },
    });
    expect(await collect(readAnswerEvents(body))).toEqual([
      { type: "text", text: "Hola" },
      { type: "done" },
    ]);
  });
});

describe("the calendar", () => {
  const match = {
    id: "m1",
    kickoffAt: new Date("2026-11-08T20:00:00Z"),
    status: "scheduled" as const,
    competition: "Primera Division",
    isLeague: true,
    round: "Matchday 12",
    opponent: { id: "a", name: "Atleti, Madrid", logoUrl: null },
    isHome: false,
    goalsFor: null,
    goalsAgainst: null,
    halfTimeFor: null,
    halfTimeAgainst: null,
  };

  it("writes a valid event, in UTC, with its text escaped", () => {
    const calendar = buildCalendar([match], new Date("2026-11-06T00:00:00Z"));
    expect(calendar).toContain("DTSTART:20261108T200000Z");
    expect(calendar).toContain("DTEND:20261108T215500Z");
    expect(calendar).toContain("SUMMARY:Atleti\\, Madrid v Barça");
    expect(calendar).toContain("UID:m1@barca-brain");
    expect(calendar.split("\r\n").at(-2)).toBe("END:VCALENDAR");
  });

  it("shows the score of a played match and leaves out cancelled ones", () => {
    const played = { ...match, id: "m2", status: "finished" as const, goalsFor: 3, goalsAgainst: 1 };
    const gone = { ...match, id: "m3", status: "cancelled" as const };
    const calendar = buildCalendar([played, gone], new Date());
    expect(calendar).toContain("(Barça 3–1)");
    expect(calendar).not.toContain("m3@");
  });
});

describe("the Ask Blaugrana prompt", () => {
  it("keeps v1's rules about facts and adds a voice on top", async () => {
    const { ASK_BLAUGRANA_PROMPT: v1 } = await import("@/server/ai/prompts/ask-blaugrana.v1");
    const { ASK_BLAUGRANA_PROMPT: v2 } = await import("@/server/ai/prompts/ask-blaugrana.v2");
    expect(v2.startsWith(v1)).toBe(true);
    expect(v2).toContain("Never answer a number");
    expect(v2).toContain("never about numbers");
  });
});
