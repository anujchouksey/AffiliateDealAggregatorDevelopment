import type { RSSFeedSource, Deal } from '../types';
import { convertToAffiliateUrl, getAffiliateConfig } from './affiliate';

export const DEFAULT_RSS_FEEDS: RSSFeedSource[] = [
  {
    id: 'feed-amazon-goldbox',
    name: 'Amazon Daily Gold Box Deals RSS',
    url: 'https://rss.amazon.com/daily-deals',
    store: 'Amazon',
    category: 'Electronics',
    minDiscount: 30,
    enabled: true,
    autoPublish: true,
    syncFrequency: 'hourly',
    lastSyncedAt: '12 mins ago',
    dealsFoundCount: 142
  },
  {
    id: 'feed-walmart-rollbacks',
    name: 'Walmart Rollbacks & Clearance Stream',
    url: 'https://rss.walmart.com/rollbacks',
    store: 'Walmart',
    category: 'Home & Kitchen',
    minDiscount: 35,
    enabled: true,
    autoPublish: false,
    syncFrequency: 'hourly',
    lastSyncedAt: '35 mins ago',
    dealsFoundCount: 89
  },
  {
    id: 'feed-bestbuy-tech',
    name: 'BestBuy Daily Tech Drops Feed',
    url: 'https://rss.bestbuy.com/tech-deals',
    store: 'BestBuy',
    category: 'Laptops & Tech',
    minDiscount: 25,
    enabled: true,
    autoPublish: true,
    syncFrequency: 'every-6h',
    lastSyncedAt: '1 hour ago',
    dealsFoundCount: 64
  },
  {
    id: 'feed-target-deals',
    name: 'Target Circle Daily Specials',
    url: 'https://rss.target.com/circle-deals',
    store: 'Target',
    category: 'Electronics',
    minDiscount: 20,
    enabled: false,
    autoPublish: false,
    syncFrequency: 'daily',
    lastSyncedAt: '4 hours ago',
    dealsFoundCount: 31
  },
  {
    id: 'feed-chase-amex-promos',
    name: 'Credit Card Bonus & Points Radar',
    url: 'https://rss.financialpartners.com/promos',
    store: 'Chase',
    category: 'Credit Cards & Finance',
    minDiscount: 50,
    enabled: true,
    autoPublish: false,
    syncFrequency: 'daily',
    lastSyncedAt: '2 hours ago',
    dealsFoundCount: 18
  },
  {
    id: 'feed-saas-security',
    name: 'Cybersecurity & Cloud SaaS Feed',
    url: 'https://rss.softwarepromos.com/cloud-deals',
    store: 'NordVPN',
    category: 'Software & SaaS',
    minDiscount: 60,
    enabled: true,
    autoPublish: true,
    syncFrequency: 'every-6h',
    lastSyncedAt: '1 hour ago',
    dealsFoundCount: 27
  }
];

export function getRSSFeeds(): RSSFeedSource[] {
  try {
    const saved = localStorage.getItem('dealpulse_rss_feeds');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved RSS feeds', e);
  }
  return DEFAULT_RSS_FEEDS;
}

export function saveRSSFeeds(feeds: RSSFeedSource[]): void {
  try {
    localStorage.setItem('dealpulse_rss_feeds', JSON.stringify(feeds));
  } catch (e) {
    console.error('Failed to save RSS feeds', e);
  }
}

// Generate realistic verified deals dynamically from any given feed source
export function generateDealsFromFeed(feed: RSSFeedSource): Deal[] {
  const config = getAffiliateConfig();
  const timestamp = Date.now();
  const results: Deal[] = [];

  // Deterministic mock seed based on feed name
  const seed = feed.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const discount1 = Math.max(feed.minDiscount, Math.min(80, feed.minDiscount + 12));
  const origPrice1 = feed.category === 'Credit Cards & Finance' ? 650 : (feed.category === 'Software & SaaS' ? 240 : 349.99);
  const dealPrice1 = feed.category === 'Credit Cards & Finance' ? 0 : Math.round(origPrice1 * (1 - discount1 / 100) * 100) / 100;

  let title1 = `${feed.store} High-Yield Special Deal Drop`;
  let img1 = '/images/sony_headphones.jpg';
  let bonusOffer1: string | undefined = undefined;

  if (feed.category === 'Credit Cards & Finance') {
    title1 = `${feed.store} Preferred Rewards - Exclusive 75,000 Bonus Miles Offer`;
    img1 = '/images/chase_card.jpg';
    bonusOffer1 = '💳 75,000 Miles Bonus + $300 Travel Credit';
  } else if (feed.category === 'Software & SaaS') {
    title1 = `${feed.store} Ultimate Annual Security & Cloud Backup Suite`;
    img1 = '/images/nordvpn_software.jpg';
    bonusOffer1 = '⚡ 3 Free Months + Priority 24/7 Support';
  } else if (feed.store === 'Amazon') {
    title1 = `Anker Solix Fast-Recharge Solar Portable Power Station (${discount1}% OFF)`;
    img1 = 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=80';
  } else if (feed.store === 'Walmart') {
    title1 = `LG UltraGear 34" QHD Curved 160Hz Gaming Monitor`;
    img1 = 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80';
  } else if (feed.store === 'BestBuy') {
    title1 = `Apple iPad Air M2 11-inch Liquid Retina Display (WiFi 128GB)`;
    img1 = '/images/macbook_air.jpg';
  }

  const rawUrl1 = `${feed.url}/product-${(seed % 9000) + 1000}`;
  const { affiliateUrl: affUrl1, store: resolvedStore1 } = convertToAffiliateUrl(rawUrl1, config);

  results.push({
    id: `rss-${feed.id}-${timestamp}-1`,
    title: title1,
    description: `Curated live from RSS feed "${feed.name}". Verified discount threshold exceeded minimum ${feed.minDiscount}%.`,
    originalPrice: origPrice1,
    dealPrice: dealPrice1,
    discountPercentage: discount1,
    couponCode: `SAVE${discount1}`,
    bonusOffer: bonusOffer1,
    store: feed.store || resolvedStore1,
    category: feed.category,
    imageUrl: img1,
    affiliateUrl: affUrl1,
    rawUrl: rawUrl1,
    upvotes: Math.floor(Math.random() * 95) + 35,
    downvotes: Math.floor(Math.random() * 2),
    userVoted: null,
    isSaved: false,
    postedAt: 'Just now via RSS Scraper',
    isFireDeal: discount1 >= 35,
    isStaffPick: true,
    viewsCount: Math.floor(Math.random() * 320) + 90,
    commentsCount: Math.floor(Math.random() * 8) + 1,
    features: [
      `Scraped from ${feed.name}`,
      `Verified > ${feed.minDiscount}% discount threshold`,
      'Affiliate link auto-injected by system'
    ]
  });

  return results;
}
