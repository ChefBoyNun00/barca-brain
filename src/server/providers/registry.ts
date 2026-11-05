import type { FootballProviderName } from "@/config/football";
import { createFootballDataProviderFromEnv } from "./football-data/provider";
import type { FootballProvider, ProviderHooks } from "./types";

type ProviderFactory = (hooks: ProviderHooks) => FootballProvider;

// TODO(debt): api-football is still a valid config name with no adapter — removing it is a
// separate refactor from this feature — drop it from FOOTBALL_PROVIDERS, then make this a full Record.
const PROVIDERS: Partial<Record<FootballProviderName, ProviderFactory>> = {
  "football-data": createFootballDataProviderFromEnv,
};

export function getFootballProvider(
  name: FootballProviderName,
  hooks: ProviderHooks = {},
): FootballProvider {
  const createProvider = PROVIDERS[name];
  if (!createProvider) throw new Error(`No adapter registered for provider: ${name}`);
  return createProvider(hooks);
}
