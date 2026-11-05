import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { FOOTBALL_DATA } from "@/config/football";
import type { FootballDataReply } from "@/server/providers/football-data/client";
import { requestValidated } from "@/server/providers/football-data/request";
import { getFootballProvider } from "@/server/providers/registry";
import { ProviderError } from "@/server/providers/types";

const schema = z.object({ ok: z.boolean() });
const reply = (httpStatus: number, body: unknown = {}): FootballDataReply => ({
  httpStatus,
  body,
  requestsLeftThisMinute: null,
});
const okReply = reply(200, { ok: true });

function setup(...steps: (FootballDataReply | Error)[]) {
  const fetchReply = vi.fn(async () => {
    const step = steps.shift();
    if (!step) throw new Error("test ran out of replies");
    if (step instanceof Error) throw step;
    return step;
  });
  const sleep = vi.fn(async () => {});
  const onResponse = vi.fn();
  const run = () =>
    requestValidated("/v4/test", { season: 2026 }, schema, {
      apiToken: "test-token",
      fetchReply,
      sleep,
      onResponse,
    });
  return { fetchReply, sleep, onResponse, run };
}

describe("requestValidated", () => {
  it("returns validated data on the first try", async () => {
    const { run, fetchReply, sleep } = setup(okReply);
    await expect(run()).resolves.toEqual({ ok: true });
    expect(fetchReply).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it("retries a rate limit and doubles the wait", async () => {
    const { run, sleep } = setup(reply(429), reply(429), okReply);
    await expect(run()).resolves.toEqual({ ok: true });
    const base = FOOTBALL_DATA.retryBaseDelayMs;
    expect(sleep.mock.calls).toEqual([[base], [base * 2]]);
  });

  it("retries server errors and network failures", async () => {
    const { run, fetchReply } = setup(reply(503), new Error("socket hang up"), okReply);
    await expect(run()).resolves.toEqual({ ok: true });
    expect(fetchReply).toHaveBeenCalledTimes(3);
  });

  it("gives up after the maximum retries", async () => {
    const replies = Array.from({ length: FOOTBALL_DATA.maxRetries + 1 }, () => reply(500));
    const { run, fetchReply } = setup(...replies);
    await expect(run()).rejects.toThrow("HTTP 500");
    expect(fetchReply).toHaveBeenCalledTimes(FOOTBALL_DATA.maxRetries + 1);
  });

  it("reports a network failure after the maximum retries", async () => {
    const failures = Array.from(
      { length: FOOTBALL_DATA.maxRetries + 1 },
      () => new Error("timed out"),
    );
    const { run } = setup(...failures);
    await expect(run()).rejects.toThrow("timed out");
  });

  it.each([400, 403, 404])("does not retry HTTP %i", async (status) => {
    const { run, fetchReply } = setup(reply(status));
    await expect(run()).rejects.toBeInstanceOf(ProviderError);
    expect(fetchReply).toHaveBeenCalledTimes(1);
  });

  it("does not retry an unrecognised reply shape", async () => {
    const { run, fetchReply } = setup(reply(200, { surprise: true }));
    await expect(run()).rejects.toThrow("Unrecognised response shape");
    expect(fetchReply).toHaveBeenCalledTimes(1);
  });

  it("puts context on errors, without the token", async () => {
    const { run } = setup(reply(403));
    const error = await run().catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ProviderError);
    expect((error as ProviderError).context).toEqual({
      provider: "football-data",
      endpoint: "/v4/test",
      params: { season: 2026 },
      httpStatus: 403,
    });
    expect(JSON.stringify((error as ProviderError).context)).not.toContain("test-token");
  });

  it("reports every reply, including failed ones", async () => {
    const { run, onResponse } = setup(reply(429), okReply);
    await run();
    expect(onResponse.mock.calls.map(([event]) => event.httpStatus)).toEqual([429, 200]);
  });
});

describe("getFootballProvider", () => {
  it("rejects a provider with no adapter", () => {
    expect(() => getFootballProvider("api-football")).toThrow("No adapter registered");
  });
});
