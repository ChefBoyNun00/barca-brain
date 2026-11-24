"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ASK_MAX_MESSAGES } from "@/config/ai";
import type { TextKey } from "@/i18n/dictionary";
import { useLanguage, useT } from "@/i18n/language";
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

const SUGGESTIONS: readonly TextKey[] = [
  "q.papers",
  "q.behind",
  "q.preview",
  "q.compare",
  "q.explain",
  "q.rumours",
];

/** Why the server said no, or why an answer failed, in words for the visitor. */
const REFUSALS: Record<string, TextKey> = {
  limit: "chat.limit",
  "not-configured": "chat.notConfigured",
  invalid: "chat.invalid",
  key: "chat.keyRejected",
  busy: "chat.busy",
  failed: "chat.answerFailed",
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

type AskChatProps = {
  /** Replaces the starter questions, for example with ones that fit the page you are on. */
  suggestions?: readonly TextKey[];
  /** The /ask page can be opened with ?q=... to ask something straight away. */
  readQuestionFromUrl?: boolean;
};

export function AskChat({ suggestions = SUGGESTIONS, readQuestionFromUrl = true }: AskChatProps) {
  const t = useT();
  const language = useLanguage();
  // The page and the drawer can both hold a chat, so the ideas heading needs a unique id.
  const ideasTitleId = useId();
  const urlQuestion = useSearchParams().get("q") ?? "";
  const firstQuestion = readQuestionFromUrl ? urlQuestion : "";
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
    setTurns([...previous, { question, answer: "", status: t("chat.thinking"), sources: [], error: null }]);
    setDraft("");
    setIsAnswering(true);
    abort.current = new AbortController();

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-ask-code": code },
        body: JSON.stringify({ messages: toHistory(previous, question), language }),
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
          error: t(REFUSALS[reason ?? ""] ?? "chat.failed"),
        });
        return;
      }

      for await (const event of readAnswerEvents(response.body)) {
        if (event.type === "status") updateLast({ status: event.label });
        if (event.type === "text") {
          updateLast((turn) => ({ answer: turn.answer + event.text, status: null }));
        }
        if (event.type === "sources") updateLast({ sources: event.labels });
        if (event.type === "error") {
          const known = REFUSALS[event.reason ?? ""];
          updateLast({ status: null, error: known ? t(known) : event.message });
        }
      }
      updateLast({ status: null });
    } catch (error) {
      const stopped = error instanceof DOMException && error.name === "AbortError";
      updateLast({ status: null, error: stopped ? null : t("chat.dropped") });
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
      {/* Before the first question: what it can do, then the box (the main task), then ideas.
          The ideas come after the box on purpose: they help a visitor who is stuck, but they
          shouldn't push the box off a phone screen. */}
      {turns.length === 0 && (
        <p className="chat-tip">
          <strong>{t("chat.tipStrong")}</strong>
          {t("chat.tipRest")}
        </p>
      )}

      <ol className="chat-turns">
        {turns.map((turn, index) => (
          <li key={index}>
            <p className="chat-question" dir="auto">
              {turn.question}
            </p>
            <div className="chat-answer" dir="auto">
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
                      {t("chat.retry")}
                    </button>
                  )}
                </p>
              )}
              {turn.sources.length > 0 && (
                <p className="chat-sources">
                  {t("chat.answeredFrom", { sources: turn.sources.join(" · ") })}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
      <div ref={end} className="chat-end" />

      {needsCode && (
        <form className="chat-code" onSubmit={submitCode}>
          <label htmlFor="ask-code">{t("chat.codeLabel")}</label>
          <div>
            <input
              id="ask-code"
              type="password"
              autoComplete="off"
              value={codeDraft}
              onChange={(event) => setCodeDraft(event.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={!codeDraft.trim()}>
              {t("chat.continue")}
            </button>
          </div>
        </form>
      )}

      <form className="chat-input" onSubmit={submit}>
        <textarea
          aria-label={t("chat.inputLabel")}
          placeholder={t("chat.placeholder")}
          dir="auto"
          rows={2}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={submitOnEnter}
        />
        {isAnswering ? (
          <button type="button" className="chip" onClick={() => abort.current?.abort()}>
            {t("chat.stop")}
          </button>
        ) : (
          <button type="submit" className="btn-primary" disabled={!draft.trim()}>
            {t("chat.ask")}
          </button>
        )}
      </form>

      {turns.length === 0 && (
        <section className="chat-ideas" aria-labelledby={ideasTitleId}>
          <h2 id={ideasTitleId} className="chat-ideas-title">
            {t("chat.tryAsking")}
          </h2>
          <ul className="chat-suggestions">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>
                <button type="button" className="chat-suggestion" onClick={() => void ask(t(suggestion), turns)}>
                  {t(suggestion)}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
