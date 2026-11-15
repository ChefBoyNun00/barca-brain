import type { SquadPlayer } from "@/domain/home";
import { T } from "@/i18n/language";
import { Icon } from "@/components/Icon";
import { AbroadTag, HeatChart, type HeatEntry } from "./HeatChart";
import { StoryCard } from "./StoryCard";

type FrontPageProps = {
  lead: HeatEntry;
  chart: HeatEntry[];
  squad: SquadPlayer[];
  now: Date;
};

/** The hottest story, big, and the heat chart of the next biggest beside it. */
export function FrontPage({ lead, chart, squad, now }: FrontPageProps) {
  return (
    <section className="front" aria-labelledby="front-lead">
      <h2 id="front-lead" className="sr-only">
        <T k="news.topStory" />
      </h2>
      <div className="front-lead">
        <p className="front-hottest">
          <Icon name="flame" /> <T k="heat.hottest" />
          {lead.abroad !== undefined && <AbroadTag count={lead.abroad} />}
        </p>
        <StoryCard story={lead.story} squad={squad} now={now} size="lead" />
      </div>
      <HeatChart entries={chart} now={now} startAt={2} />
    </section>
  );
}
