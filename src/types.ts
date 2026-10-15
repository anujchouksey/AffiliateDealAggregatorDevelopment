export interface Deal {
  id: string;
  title: string;
  description: string;
  originalPrice: number;
  dealPrice: number;
  discountPercentage: number;
  couponCode?: string;
  store: 'Amazon' | 'Walmart' | 'BestBuy' | 'Target' | 'eBay' | 'B&H' | 'Home Depot' | 'Nike' | 'Micro Center' | 'Chase' | 'Amex' | 'Capital One' | 'NordVPN' | 'Hostinger' | 'Adobe' | 'Software Partner' | 'Financial Partner';
  storeLogo?: string;
  category: 'Credit Cards & Finance' | 'Software & SaaS' | 'Electronics' | 'Home & Kitchen' | 'Gaming' | 'Laptops & Tech' | 'Fashion' | 'Daily Top Deals';
  imageUrl: string;
  affiliateUrl: string;
  rawUrl: string;
  upvotes: number;
  downvotes: number;
  userVoted?: 'up' | 'down' | null;
  isSaved?: boolean;
  postedAt: string;
  isFireDeal?: boolean;
  isStaffPick?: boolean;
  viewsCount: number;
  commentsCount: number;
  expiryDate?: string;
  features?: string[];
  bonusOffer?: string;
}

export interface AffiliateConfig {
  amazonTag: string;
  walmartId: string;
  bestbuyId: string;
  targetTag: string;
  ebayId: string;
  bhId: string;
  homedepotId: string;
  nikeId: string;
  creditCardTag: string;
  softwareTag: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
}

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  category: Deal['category'];
  store: Deal['store'] | 'All Stores';
  minDiscountPercentage: number;
  autoPublish: boolean;
  keywords: string[];
  checkFrequency: 'hourly' | 'every-6h' | 'daily';
  enabled: boolean;
}

export interface DealSuggestion {
  id: string;
  title: string;
  description: string;
  rawUrl: string;
  affiliateUrl: string;
  store: Deal['store'];
  category: Deal['category'];
  originalPrice: number;
  dealPrice: number;
  discountPercentage: number;
  couponCode?: string;
  bonusOffer?: string;
  imageUrl: string;
  source: 'Amazon GoldBox Scraper' | 'Walmart Rollback API' | 'Card Offer Radar' | 'SaaS Promo Scanner' | 'Admin Batch Rule' | 'AI Trend Predictor';
  confidenceScore: number;
  status: 'pending' | 'approved' | 'rejected';
  detectedAt: string;
  reason: string;
}

export interface AdConfig {
  leaderboardEnabled: boolean;
  leaderboardCode: string;
  inFeedEnabled: boolean;
  inFeedFrequency: number;
  inFeedCode: string;
  stickyBottomEnabled: boolean;
  stickyBottomCode: string;
  popupEnabled: boolean;
  popupDelayMinutes: number;
  popupCode: string;
}

export interface RSSFeedSource {
  id: string;
  name: string;
  url: string;
  store: Deal['store'];
  category: Deal['category'];
  minDiscount: number;
  enabled: boolean;
  autoPublish: boolean;
  syncFrequency: 'hourly' | 'every-6h' | 'daily' | 'manual';
  lastSyncedAt?: string;
  dealsFoundCount?: number;
}
