import type { AutomationRule, DealSuggestion } from '../types';
import { convertToAffiliateUrl } from '../utils/affiliate';

export const INITIAL_RULES: AutomationRule[] = [
  {
    id: 'rule-1',
    name: 'Amazon Electronics & Tech Lightning Deals',
    category: 'Electronics',
    store: 'Amazon',
    minDiscountPercentage: 25,
    autoPublish: false,
    keywords: ['Sony', 'Apple', 'OLED', 'Headphones', 'Anker'],
    checkFrequency: 'hourly',
    enabled: true
  },
  {
    id: 'rule-2',
    name: 'Credit Card High-Value Sign-Up Bonuses',
    category: 'Credit Cards & Finance',
    store: 'Chase',
    minDiscountPercentage: 50,
    autoPublish: false,
    keywords: ['Sapphire', 'Gold', 'Venture', 'Points Bonus', 'Cash Back'],
    checkFrequency: 'daily',
    enabled: true
  },
  {
    id: 'rule-3',
    name: 'SaaS Software Flash Promotions',
    category: 'Software & SaaS',
    store: 'NordVPN',
    minDiscountPercentage: 50,
    autoPublish: true,
    keywords: ['VPN', 'Hosting', 'Cybersecurity', 'Cloud', 'Domain'],
    checkFrequency: 'every-6h',
    enabled: true
  },
  {
    id: 'rule-4',
    name: 'Walmart Rollback Super Deals',
    category: 'Home & Kitchen',
    store: 'Walmart',
    minDiscountPercentage: 30,
    autoPublish: false,
    keywords: ['Ninja', 'Air Fryer', 'KitchenAid', 'Vacuum'],
    checkFrequency: 'every-6h',
    enabled: true
  }
];

export const INITIAL_SUGGESTIONS: DealSuggestion[] = [
  {
    id: 'sug-1',
    title: 'Apple iPad Air 11-inch M2 Chip (128GB Wi-Fi) - Space Gray',
    description: 'Historical low price on Amazon! Liquid Retina display with P3 wide color, True Tone and ultralow reflectivity.',
    rawUrl: 'https://www.amazon.com/dp/B0D3J7P9Z4',
    affiliateUrl: convertToAffiliateUrl('https://www.amazon.com/dp/B0D3J7P9Z4').affiliateUrl,
    store: 'Amazon',
    category: 'Laptops & Tech',
    originalPrice: 599.00,
    dealPrice: 499.00,
    discountPercentage: 17,
    couponCode: 'IPADAIR100',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
    source: 'Amazon GoldBox Scraper',
    confidenceScore: 96,
    status: 'pending',
    detectedAt: '8 mins ago',
    reason: 'Price dropped to all-time low on Amazon. High search volume + verified Amazon Prime seller.'
  },
  {
    id: 'sug-2',
    title: 'Capital One Venture X Rewards Card - 75,000 Miles Sign-Up Bonus',
    description: 'Earn 75,000 bonus miles once you spend $4,000 on purchases within the first 3 months. Includes $300 annual travel credit.',
    rawUrl: 'https://www.capitalone.com/credit-cards/venture-x/',
    affiliateUrl: convertToAffiliateUrl('https://www.capitalone.com/credit-cards/venture-x/').affiliateUrl,
    store: 'Capital One',
    category: 'Credit Cards & Finance',
    originalPrice: 750.00,
    dealPrice: 0.00,
    discountPercentage: 100,
    bonusOffer: '✈️ 75,000 Miles ($750 Travel Value) + $300 Travel Credit',
    imageUrl: '/images/chase_card.jpg',
    source: 'Card Offer Radar',
    confidenceScore: 98,
    status: 'pending',
    detectedAt: '15 mins ago',
    reason: 'Top tier $250+ affiliate CPA payout. High converting card with premium lounge access perks.'
  },
  {
    id: 'sug-3',
    title: 'Bose QuietComfort Ultra Wireless Noise Cancelling Headphones',
    description: 'World-class noise cancellation, proprietary CustomTune technology for personalized sound, and spatial audio.',
    rawUrl: 'https://www.bestbuy.com/site/bose-quietcomfort-ultra',
    affiliateUrl: convertToAffiliateUrl('https://www.bestbuy.com/site/bose-quietcomfort-ultra').affiliateUrl,
    store: 'BestBuy',
    category: 'Electronics',
    originalPrice: 429.00,
    dealPrice: 329.00,
    discountPercentage: 23,
    couponCode: 'BOSEULTRA',
    imageUrl: '/images/sony_headphones.jpg',
    source: 'AI Trend Predictor',
    confidenceScore: 91,
    status: 'pending',
    detectedAt: '25 mins ago',
    reason: 'Competitor matching detected between Best Buy and Amazon. Trending up on Slickdeals by +340 upvotes.'
  },
  {
    id: 'sug-4',
    title: 'Adobe Creative Cloud All Apps - 50% Off First Year Subscription',
    description: 'Get Photoshop, Illustrator, Premiere Pro, After Effects, and 20+ creative apps with 100GB cloud storage.',
    rawUrl: 'https://www.adobe.com/creativecloud/plans.html',
    affiliateUrl: convertToAffiliateUrl('https://www.adobe.com/creativecloud/plans.html').affiliateUrl,
    store: 'Adobe',
    category: 'Software & SaaS',
    originalPrice: 659.88,
    dealPrice: 329.94,
    discountPercentage: 50,
    couponCode: 'CREATIVE50',
    bonusOffer: '🎨 50% OFF Annual Subscription for Creatives',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    source: 'SaaS Promo Scanner',
    confidenceScore: 94,
    status: 'pending',
    detectedAt: '42 mins ago',
    reason: 'Verified 50% educational & business campaign discount. Recurring 85% first-month affiliate commission.'
  }
];
