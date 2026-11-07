import type { NewsFeed } from "@/config/news";
import type {
  DomainFixture,
  DomainPlayer,
  DomainPlayerPhoto,
  DomainScorer,
  DomainStanding,
} from "@/domain/football";

/** The contract between ingest and any football API. Only domain types cross it. */
export interface FootballProvider {
  name: string;
  getTeamFixtures(params: { teamId: string; season: number }): Promise<DomainFixture[]>;
  getSquad(teamId: string): Promise<DomainPlayer[]>;
  getStandings(competitionId: string, season: number): Promise<DomainStanding[]>;
  /** Every listed scorer in the competition, not only one team's. */
  getSeasonScorers(competitionId: string, season: number): Promise<DomainScorer[]>;
}

/** Finds a freely licensed photo. Null means none could be matched with confidence. */
export interface PlayerPhotoProvider {
  findPlayerPhoto(player: {
    name: string;
    birthDate: string;
  }): Promise<DomainPlayerPhoto | null>;
}

/** One HTTP reply. `body` stays unknown because it is only stored or counted, never read. */
export type ProviderResponseEvent = {
  provider: string;
  endpoint: string;
  params: Record<string, string | number>;
  httpStatus: number;
  body: unknown;
};

export type ProviderHooks = {
  /** Called for every reply, so ingest can count requests and keep raw payloads. */
  onResponse?: (event: ProviderResponseEvent) => void;
};

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly context: {
      provider: string;
      endpoint: string;
      params: Record<string, string | number>;
      httpStatus?: number;
    },
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export type FeedArticle = {
  url: string;
  outlet: string;
  title: string;
  snippet: string | null;
  publishedAt: Date;
  /** YouTube only: the id the embed plays. */
  videoId?: string | null;
  /** Fan threads only: who posted it. */
  author?: string | null;
};

export interface NewsProvider {
  fetchFeed(feed: NewsFeed): Promise<FeedArticle[]>;
}
