"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ASK_MAX_MESSAGES } from "@/config/ai";
import { readAccessCode, saveAccessCode } from "./access-code";
import { AnswerText } from "./AnswerText";
import { readAnswerEvents } from "./read-answer";

type Turn = {
  question: string;
  answer: string;
  status: string | null;
  sources: string[];
  error: string | null;
};

const SUGGESTIONS = [
  "What are the Spanish papers saying today?",
  "How do we do when we're behind at half-time?",
  "Preview the next match for me",
  "Compare Lamine Yamal and Raphinha this season",
  "Explain the next match to a friend who has never watched football",
  "Which transfer rumours are worth believing?",
];

const REFUSALS: Record<string, string> = {
  limit: "That's a lot of questions for one hour. Try again a little later.",
  "not-configured": "Ask Blaugrana isn't switched on yet: it needs a Claude API key.",
  invalid: "That message couldn't be sent. Try a shorter one.",
};

function toHistory(turns: Turn[], question: string) {
  const finished = turns
    .filter((turn) => turn.answer && !turn.error)
    .flatMap((turn) => [
      { role: "user" as const, content: turn.question },
      { role: "assistant" as const, content: turn.answer },
    ]);
  return [...finished, { role: "user" as const, content: question }].slice(-(ASK_MAX_MESSAGES - 1));
}

export function AskChat() {
  const firstQuestion = useSearchParams().get("q") ?? "";
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState(firstQuestion);
  const [isAnswering, setIsAnswering] = useState(false);
  const [needsCode, setNeedsCode] = useState(false);
  const [codeDraft, setCodeDraft] = useState("");
  const abort = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [turns]);

  const updateLast = (change: Partial<Turn> | ((turn: Turn) => Partial<Turn>)) =>
    setTurns((all) =>
      all.map((turn, index) =>
        index === all.length - 1
          ? { ...turn, ...(typeof change === "function" ? change(turn) : change) }
          : turn,
      ),
    );

  async function ask(question: string, previous: Turn[], code = readAccessCode()) {
    setTurns([...previous, { question, answer: "", status: "Thinking", sources: [], error: null }]);
    setDraft("");
    setIsAnswering(true);
    abort.current = new AbortController();

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-ask-code": code },
        body: JSON.stringify({ messages: toHistory(previous, question) }),
        signal: abort.current.signal,
      });

      if (response.status === 401) {
        setNeedsCode(true);
        setTurns(previous);
        setDraft(question);
        return;
      }
      if (!response.ok || !response.body) {
        const { reason } = (await response.json().catch(() => ({}))) as { reason?: string };
        updateLast({
          status: null,
          error: REFUSALS[reason ?? ""] ?? "That didn't work. Try again.",
        });
        return;
      }

      for await (const event of readAnswerEvents(response.body)) {
        if (event.type === "status") updateLast({ status: event.label });
        if (event.type === "text") {
          updateLast((turn) => ({ answer: turn.answer + event.text, status: null }));
        }
        if (event.type === "sources") updateLast({ sources: event.labels });
        if (event.type === "error") updateLast({ status: null, error: event.message });
      }
      updateLast({ status: null });
    } catch (error) {
      const stopped = error instanceof DOMException && error.name === "AbortError";
      updateLast({ status: null, error: stopped ? null : "The connection dropped. Try again." });
    } finally {
      setIsAnswering(false);
    }
  }

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const question = draft.trim();
    if (question && !isAnswering) void ask(question, turns);
  };

  const submitOnEnter = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const submitCode = (event: FormEvent) => {
    event.preventDefault();
    saveAccessCode(codeDraft.trim());
    setNeedsCode(false);
    const question = draft.trim();
    if (question) void ask(question, turns, codeDraft.trim());
  };

  const retryLast = () => {
    const last = turns.at(-1);
    if (last) void ask(last.question, turns.slice(0, -1));
  };

  return (
    <div className="chat">
      {turns.length === 0 && (
        <div className="chat-start">
          <p className="chat-tip">
            <strong>Paste anything in Spanish</strong>, like a tweet or a quote, and it comes back
            in plain English with the football context explained.
          </p>
          <ul className="chat-suggestions">
            {SUGGESTIONS.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  className="chip chip-action"
                  onClick={() => void ask(suggestion, turns)}
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ol className="chat-turns">
        {turns.map((turn, index) => (
          <li key={index}>
            <p className="chat-question">{turn.question}</p>
            <div className="chat-answer">
              {turn.answer && <AnswerText text={turn.answer} />}
              {turn.status && (
                <p role="status" className="chat-status">
                  {turn.status}…
                </p>
              )}
              {turn.error && (
                <p role="alert" className="chat-error">
                  {turn.error}{" "}
                  {index === turns.length - 1 && (
                    <button type="button" className="chat-retry" onClick={retryLast}>
                      Retry
                    </button>
                  )}
                </p>
              )}
              {turn.sources.length > 0 && (
                <p className="chat-sources">Answered from: {turn.sources.join(" · ")}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
      <div ref={end} className="chat-end" />

      {needsCode && (
        <form className="chat-code" onSubmit={submitCode}>
          <label htmlFor="ask-code">Enter your access code to ask</label>
          <div>
            <input
              id="ask-code"
              type="password"
              autoComplete="off"
              value={codeDraft}
              onChange={(event) => setCodeDraft(event.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={!codeDraft.trim()}>
              Continue
            </button>
          </div>
        </form>
      )}

      <form className="chat-input" onSubmit={submit}>
        <textarea
          aria-label="Your question"
          placeholder="Ask anything, or paste Spanish to translate"
          rows={2}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={submitOnEnter}
        />
        {isAnswering ? (
          <button type="button" className="chip" onClick={() => abort.current?.abort()}>
            Stop
          </button>
        ) : (
          <button type="submit" className="btn-primary" disabled={!draft.trim()}>
            Ask
          </button>
        )}
      </form>
    </div>
  );
}
