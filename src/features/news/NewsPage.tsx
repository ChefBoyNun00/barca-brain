import { cookies } from "next/headers";
import { connection } from "next/server";
import {
  NEWS_EDITION_COOKIE,
  NEWS_HEAT_CHART_LIMIT,
  NEWS_HEAT_HALF_LIFE_HOURS,
  NEWS_NOT_IN_ISRAEL_LIMIT,
  NEWS_SPIN_LIMIT,
} from "@/config/news";
import type { SquadPlayer } from "@/domain/home";
import type { NewsMedia } from "@/domain/news";
import { T } from "@/i18n/language";
import { EditionSwitch } from "./EditionSwitch";
import { FrontPage } from "./FrontPage";
import { getNewsData } from "./get-news-data";
import type { HeatEntry } from "./HeatChart";
import { chooseNewsEdition } from "./news-edition";
import { NotInIsrael } from "./NotInIsrael";
import { PodcastRow } from "./PodcastRow";
import { findAbroad, heatOf, notYetIn, rankByHeat, spinsOf, type NewsStory } from "./stories";
import { TheSpin } from "./TheSpin";

type NewsPageProps = { searchParams: Promise<{ edition?: string | string[] }> };

/** Runs per request, so it always shows the latest stored stories, in the chosen edition. */
export async function NewsPage({ searchParams }: NewsPageProps) {
  await connection();
  const [{ edition: fromUrl }, jar] = await Promise.all([searchParams, cookies()]);
  const edition = chooseNewsEdition(fromUrl, jar.get(NEWS_EDITION_COOKIE)?.value);
  const data = await getNewsData(edition);

  return (
    <>
      <EditionSwitch value={edition} />
      <div className="edition" data-edition={edition}>
        {edition === "israel" ? (
          <IsraelEdition {...data} />
        ) : (
          <WorldEdition stories={data.world} squad={data.squad} now={data.now} />
        )}
      </div>
    </>
  );
}

/** Heat as a share of the hottest story's, so the chart's bars read against the lead. */
function toEntries(ranked: NewsStory[], now: Date, abroadOf?: (story: NewsStory) => number) {
  const top = ranked[0] ? heatOf(ranked[0], now, NEWS_HEAT_HALF_LIFE_HOURS) : 0;
  return ranked.map(
    (story): HeatEntry => ({
      story,
      heat: top > 0 ? heatOf(story, now, NEWS_HEAT_HALF_LIFE_HOURS) / top : 0,
      abroad: abroadOf?.(story),
    }),
  );
}

type EditionProps = { stories: NewsStory[]; squad: SquadPlayer[]; now: Date };

/** The world's press: the hottest story, the heat chart, and the two cities' spin. */
function WorldEdition({ stories, squad, now }: EditionProps) {
  const ranked = rankByHeat(stories, now, NEWS_HEAT_HALF_LIFE_HOURS);
  const [lead, ...chart] = toEntries(ranked.slice(0, NEWS_HEAT_CHART_LIMIT + 1), now);
  if (!lead) {
    return (
      <p className="section-note">
        <T k="news.empty" />
      </p>
    );
  }
  return (
    <>
      <FrontPage lead={lead} chart={chart} squad={squad} now={now} />
      <TheSpin spins={spinsOf(ranked, NEWS_SPIN_LIMIT)} />
    </>
  );
}

type IsraelProps = {
  world: NewsStory[];
  israel: NewsStory[];
  squad: SquadPlayer[];
  podcasts: NewsMedia[];
  now: Date;
};

/** Israel's own press, how far each story has travelled, what Israel has missed, and podcasts. */
function IsraelEdition({ world, israel, squad, podcasts, now }: IsraelProps) {
  const ranked = rankByHeat(israel, now, NEWS_HEAT_HALF_LIFE_HOURS);
  const rankedWorld = rankByHeat(world, now, NEWS_HEAT_HALF_LIFE_HOURS);
  const abroadOf = (story: NewsStory) => findAbroad(story, world)?.outlets.length ?? 0;
  const [lead, ...chart] = toEntries(ranked.slice(0, NEWS_HEAT_CHART_LIMIT + 1), now, abroadOf);

  return (
    <>
      {lead ? (
        <FrontPage lead={lead} chart={chart} squad={squad} now={now} />
      ) : (
        <p className="section-note">
          <T k="edition.israelEmpty" />
        </p>
      )}
      {/* With no Israeli press read yet, every story abroad would look "missed". */}
      {israel.length > 0 && (
        <NotInIsrael stories={notYetIn(rankedWorld, israel, NEWS_NOT_IN_ISRAEL_LIMIT)} now={now} />
      )}
      <PodcastRow episodes={podcasts} now={now} />
    </>
  );
}
