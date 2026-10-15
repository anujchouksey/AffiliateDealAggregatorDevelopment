import type { Deal, RSSFeedSource } from '../types';
import { getRSSFeeds, generateDealsFromFeed } from '../utils/rssConfig';

/**
 * RSS / Deal Scraper Service for 24/7 Automated Daily Deal Updates.
 * Parses active admin-configured RSS feed sources into structured affiliate deals.
 */
export async function fetchLatestRSSDeals(customFeeds?: RSSFeedSource[]): Promise<Deal[]> {
  const feedsToProcess = customFeeds || getRSSFeeds();
  const enabledFeeds = feedsToProcess.filter((f) => f.enabled);

  if (enabledFeeds.length === 0) {
    return [];
  }

  const aggregatedDeals: Deal[] = [];

  for (const feed of enabledFeeds) {
    const deals = generateDealsFromFeed(feed);
    aggregatedDeals.push(...deals);
  }

  return aggregatedDeals;
}
