"use client";

import { ISRAEL_TV_CHANNELS } from "@/config/match-room";
import type { SeasonMatch } from "@/domain/home";
import type {
  Absence,
  LineupPlayer,
  MatchEventKind,
  MatchRoom,
  MatchRoomEvent,
  TeamSheet,
} from "@/domain/match-room";
import type { TextKey } from "@/i18n/dictionary";
import { useLanguage, useT } from "@/i18n/language";
import { displayCompetition, displayRound, formatKickoff, formatUpdatedAgo } from "../home/format";
import { formatExpectedReturn, formatMinute } from "./format";

const EVENT_LABELS: Record<MatchEventKind, TextKey> = {
  goal: "room.event.goal",
  "penalty-goal": "room.event.penalty-goal",
  "own-goal": "room.event.own-goal",
  yellow: "room.event.yellow",
  red: "room.event.red",
  "missed-penalty": "room.event.missed-penalty",
};

const REASON_LABELS: Record<Absence["reason"], TextKey> = {
  injury: "room.reason.injury",
  suspension: "room.reason.suspension",
  other: "room.reason.other",
};

const formatRating = (rating: number) => rating.toFixed(1);

function Facts({ match, room }: { match: SeasonMatch; room: MatchRoom | null }) {
  const t = useT();
  const language = useLanguage();
  const channel = ISRAEL_TV_CHANNELS[match.competition]?.[language] ?? null;
  const competition = [displayCompetition(match.competition, language), displayRound(match.round, language)]
    .filter(Boolean)
    .join(" · ");
  const rows: { label: TextKey; value: string; latin?: boolean }[] = [
    { label: "room.kickoff", value: formatKickoff(match.kickoffAt, language) },
    { label: "room.competition", value: competition },
  ];
  if (channel) rows.push({ label: "room.watch", value: channel });
  if (room?.stadium) rows.push({ label: "room.stadium", value: room.stadium, latin: true });
  if (room?.referee) rows.push({ label: "room.referee", value: room.referee, latin: true });

  return (
    <dl className="room-facts" aria-label={t("room.facts")}>
      {rows.map(({ label, value, latin }) => (
        <div key={label} className="room-fact" data-fact={label}>
          <dt>{t(label)}</dt>
          <dd>{latin ? <bdi>{value}</bdi> : value}</dd>
        </div>
      ))}
    </dl>
  );
}

function EventMarker({ kind }: { kind: MatchEventKind }) {
  return <span aria-hidden="true" className="room-marker" data-kind={kind} />;
}

function Events({
  events,
  room,
  barcaName,
  opponentName,
}: {
  events: MatchRoomEvent[];
  room: MatchRoom;
  barcaName: string;
  opponentName: string;
}) {
  const t = useT();
  const best = room.playerOfTheMatch;
  return (
    <section className="room-section" aria-labelledby="room-events-title">
      <h2 id="room-events-title" className="nw-section-title">
        {t("room.events")}
      </h2>
      {best && (
        <p className="room-potm" data-side={best.forBarca ? "barca" : "opponent"}>
          <span className="room-potm-label">{t("room.potm")}</span>
          <bdi className="room-potm-name">{best.name}</bdi>
          {best.rating !== null && (
            <span className="room-rating">{t("room.rating", { rating: formatRating(best.rating) })}</span>
          )}
        </p>
      )}
      {events.length === 0 ? (
        <p className="section-note">{t("room.noEvents")}</p>
      ) : (
        <ol className="room-events">
          {events.map((event, index) => (
            <li key={index} className="room-event" data-side={event.forBarca ? "barca" : "opponent"}>
              <bdi dir="ltr" className="room-minute">
                {formatMinute(event.minute, event.addedMinute)}
              </bdi>
              <EventMarker kind={event.kind} />
              <span className="room-event-text">
                <bdi className="room-event-player">{event.player}</bdi>
                <span className="room-event-kind">
                  {t(EVENT_LABELS[event.kind])} · <bdi>{event.forBarca ? barcaName : opponentName}</bdi>
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/**
 * FotMob draws the goalkeeper at the top, attacking down. We draw Barça attacking up the screen,
 * which is the same picture turned half a circle, so both axes flip and left-backs stay on the left.
 * The margins keep names at the touchlines inside the pitch.
 */
const pitchPosition = ({ x, y }: { x: number; y: number }) => ({
  left: `${6 + (1 - x) * 88}%`,
  top: `${4 + (1 - y) * 92}%`,
});

/** Barça's eleven on a pitch. It stays left to right in Hebrew, because a pitch has a real left. */
function Pitch({ players, label }: { players: LineupPlayer[]; label: string }) {
  return (
    <ol className="room-pitch" dir="ltr" aria-label={label}>
      {players.map((player) =>
        player.pitch ? (
          <li key={player.name} className="room-pitch-player" style={pitchPosition(player.pitch)}>
            <span className="room-pitch-shirt" aria-hidden="true">
              {player.shirtNumber ?? ""}
            </span>
            <bdi className="room-pitch-name">{player.name}</bdi>
          </li>
        ) : null,
      )}
    </ol>
  );
}

function PlayerRow({ player }: { player: LineupPlayer }) {
  const t = useT();
  const changes = [
    player.subbedOnAt !== null ? t("room.cameOn", { minute: formatMinute(player.subbedOnAt, null) }) : null,
    player.subbedOffAt !== null ? t("room.wentOff", { minute: formatMinute(player.subbedOffAt, null) }) : null,
  ].filter(Boolean);
  return (
    <li className="room-player">
      <span className="room-player-number">{player.shirtNumber ?? ""}</span>
      <span className="room-player-name">
        <bdi>{player.name}</bdi>
        {player.isCaptain && (
          <abbr className="room-captain" title={t("room.captain")}>
            {t("room.captainShort")}
          </abbr>
        )}
        {changes.length > 0 && <span className="room-player-change">{changes.join(" · ")}</span>}
      </span>
      {player.rating !== null && <span className="room-rating">{formatRating(player.rating)}</span>}
    </li>
  );
}

function TeamColumn({ name, sheet, isBarca }: { name: string; sheet: TeamSheet; isBarca: boolean }) {
  const t = useT();
  return (
    <div className="room-team" data-side={isBarca ? "barca" : "opponent"}>
      <h3 className="room-team-name">
        <bdi>{name}</bdi>
      </h3>
      <p className="room-team-meta">
        {[
          sheet.formation ? t("room.formation", { formation: sheet.formation }) : null,
          sheet.coach ? t("room.coach", { name: sheet.coach }) : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <ol className="room-players">
        {sheet.starters.map((player) => (
          <PlayerRow key={player.name} player={player} />
        ))}
      </ol>
      {sheet.bench.length > 0 && (
        <>
          <h4 className="room-bench-title">{t("room.bench")}</h4>
          <ol className="room-players room-players-bench">
            {sheet.bench.map((player) => (
              <PlayerRow key={player.name} player={player} />
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

function Lineups({
  room,
  kickedOff,
  barcaName,
  opponentName,
}: {
  room: MatchRoom;
  kickedOff: boolean;
  barcaName: string;
  opponentName: string;
}) {
  const t = useT();
  const { barca, opponent } = room;
  const confirmed =
    barca !== null && opponent !== null && barca.starters.length > 0 && opponent.starters.length > 0;
  const showPitch =
    confirmed && barca.starters.length === 11 && barca.starters.every((player) => player.pitch !== null);

  let body: React.ReactNode;
  if (confirmed) {
    body = (
      <>
        {showPitch && (
          <Pitch players={barca.starters} label={t("room.pitch", { team: barcaName })} />
        )}
        <div className="room-teams">
          <TeamColumn name={barcaName} sheet={barca} isBarca />
          <TeamColumn name={opponentName} sheet={opponent} isBarca={false} />
        </div>
      </>
    );
  } else if (!kickedOff && barca !== null) {
    body = <p className="section-note">{t("room.lineupsPending")}</p>;
  } else {
    body = <p className="section-note">{t("room.sectionMissing")}</p>;
  }

  return (
    <section className="room-section" aria-labelledby="room-lineups-title">
      <h2 id="room-lineups-title" className="nw-section-title">
        {t("room.lineups")}
      </h2>
      {body}
    </section>
  );
}

function AbsenceList({ name, absences }: { name: string; absences: Absence[] }) {
  const t = useT();
  const language = useLanguage();
  return (
    <div className="room-team">
      <h3 className="room-team-name">
        <bdi>{name}</bdi>
      </h3>
      {absences.length === 0 ? (
        <p className="section-note">{t("room.noneMissing")}</p>
      ) : (
        <ul className="room-absences">
          {absences.map((absence) => (
            <li key={absence.name} className="room-absence">
              <bdi className="room-absence-name">{absence.name}</bdi>
              <span className="room-absence-reason" data-reason={absence.reason}>
                {t(REASON_LABELS[absence.reason])}
              </span>
              <span className="room-absence-return">
                {formatExpectedReturn(absence.expectedReturn, language)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Missing({ room, barcaName, opponentName }: { room: MatchRoom; barcaName: string; opponentName: string }) {
  const t = useT();
  if (room.barca === null && room.opponent === null) return null;
  return (
    <section className="room-section" aria-labelledby="room-missing-title">
      <h2 id="room-missing-title" className="nw-section-title">
        {t("room.missing")}
      </h2>
      <div className="room-teams">
        {room.barca && <AbsenceList name={barcaName} absences={room.barca.absences} />}
        {room.opponent && <AbsenceList name={opponentName} absences={room.opponent.absences} />}
      </div>
    </section>
  );
}

/**
 * Everything about one match in one place: when and where to watch, who is missing, the
 * lineups, and afterwards what happened. Before kickoff the team news comes first.
 */
export function MatchRoomView({ match, room, now }: { match: SeasonMatch; room: MatchRoom | null; now: Date }) {
  const t = useT();
  const language = useLanguage();
  const barcaName = t("common.barca");
  const opponentName = match.opponent?.name ?? t("common.tbd");
  const kickedOff = now.getTime() >= match.kickoffAt.getTime();

  if (room === null) {
    return (
      <div className="room">
        <Facts match={match} room={null} />
        <p className="room-empty">{t(kickedOff ? "room.emptyPast" : "room.emptyUpcoming")}</p>
      </div>
    );
  }

  const events = room.events;
  const eventsSection = kickedOff ? (
    events === null ? (
      <section className="room-section" aria-labelledby="room-events-title">
        <h2 id="room-events-title" className="nw-section-title">
          {t("room.events")}
        </h2>
        <p className="section-note">{t("room.sectionMissing")}</p>
      </section>
    ) : (
      <Events events={events} room={room} barcaName={barcaName} opponentName={opponentName} />
    )
  ) : null;
  const lineups = <Lineups room={room} kickedOff={kickedOff} barcaName={barcaName} opponentName={opponentName} />;
  const missing = <Missing room={room} barcaName={barcaName} opponentName={opponentName} />;

  return (
    <div className="room">
      <Facts match={match} room={room} />
      {kickedOff ? (
        <>
          {eventsSection}
          {lineups}
          {missing}
        </>
      ) : (
        <>
          {missing}
          {lineups}
        </>
      )}
      <p className="room-source">
        {t("room.source")} {formatUpdatedAgo(room.updatedAt, now, language)}.
      </p>
    </div>
  );
}
