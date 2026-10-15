import type { AffiliateConfig, Deal } from '../types';

export const DEFAULT_AFFILIATE_CONFIG: AffiliateConfig = {
  amazonTag: 'dealpulse-20',
  walmartId: 'dealpulse_walmart_aff',
  bestbuyId: 'dealpulse_bb_99',
  targetTag: 'dealpulse_target',
  ebayId: 'dealpulse_ebay_partner',
  bhId: 'dealpulse_bh_photo',
  homedepotId: 'dealpulse_homedepot',
  nikeId: 'dealpulse_nike',
  creditCardTag: 'dealpulse_cc_rewards',
  softwareTag: 'dealpulse_saas_aff'
};

export function getAffiliateConfig(): AffiliateConfig {
  const saved = localStorage.getItem('dealpulse_affiliate_config');
  if (saved) {
    try {
      return { ...DEFAULT_AFFILIATE_CONFIG, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_AFFILIATE_CONFIG;
    }
  }
  return DEFAULT_AFFILIATE_CONFIG;
}

export function saveAffiliateConfig(config: AffiliateConfig) {
  localStorage.setItem('dealpulse_affiliate_config', JSON.stringify(config));
}

/**
 * Automatically transforms any raw product link (Amazon, Walmart, eBay, B&H, Home Depot, Nike, etc.) into an affiliate tracked URL.
 */
export function convertToAffiliateUrl(rawUrl: string, config?: AffiliateConfig): { affiliateUrl: string; store: Deal['store'] } {
  const cfg = config || getAffiliateConfig();
  let url = rawUrl.trim();
  let store: Deal['store'] = 'Amazon';

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname.includes('amazon') || hostname.includes('amzn')) {
      store = 'Amazon';
      parsedUrl.searchParams.set('tag', cfg.amazonTag || DEFAULT_AFFILIATE_CONFIG.amazonTag);
      parsedUrl.searchParams.set('linkCode', 'as2');
      return { affiliateUrl: parsedUrl.toString(), store };
    }

    if (hostname.includes('walmart')) {
      store = 'Walmart';
      parsedUrl.searchParams.set('affiliateId', cfg.walmartId || DEFAULT_AFFILIATE_CONFIG.walmartId);
      parsedUrl.searchParams.set('sourceid', 'imp_dealpulse');
      return { affiliateUrl: parsedUrl.toString(), store };
    }

    if (hostname.includes('bestbuy')) {
      store = 'BestBuy';
      parsedUrl.searchParams.set('irclickid', cfg.bestbuyId || DEFAULT_AFFILIATE_CONFIG.bestbuyId);
      return { affiliateUrl: parsedUrl.toString(), store };
    }

    if (hostname.includes('target')) {
      store = 'Target';
      parsedUrl.searchParams.set('afid', cfg.targetTag || DEFAULT_AFFILIATE_CONFIG.targetTag);
      return { affiliateUrl: parsedUrl.toString(), store };
    }

    if (hostname.includes('ebay')) {
      store = 'eBay';
      parsedUrl.searchParams.set('mkevt', '1');
      parsedUrl.searchParams.set('mkcid', '1');
      parsedUrl.searchParams.set('mkrid', cfg.ebayId || DEFAULT_AFFILIATE_CONFIG.ebayId);
      return { affiliateUrl: parsedUrl.toString(), store };
    }

    if (hostname.includes('bhphotovideo') || hostname.includes('bhphoto')) {
      store = 'B&H';
      parsedUrl.searchParams.set('BI', cfg.bhId || DEFAULT_AFFILIATE_CONFIG.bhId);
      parsedUrl.searchParams.set('KBID', '999');
      return { affiliateUrl: parsedUrl.toString(), store };
    }

    if (hostname.includes('homedepot')) {
      store = 'Home Depot';
      parsedUrl.searchParams.set('cm_mmc', cfg.homedepotId || DEFAULT_AFFILIATE_CONFIG.homedepotId);
      return { affiliateUrl: parsedUrl.toString(), store };
    }

    if (hostname.includes('nike')) {
      store = 'Nike';
      parsedUrl.searchParams.set('cp', cfg.nikeId || DEFAULT_AFFILIATE_CONFIG.nikeId);
      return { affiliateUrl: parsedUrl.toString(), store };
    }

    if (hostname.includes('chase')) {
      store = 'Chase';
      parsedUrl.searchParams.set('cell', cfg.creditCardTag || DEFAULT_AFFILIATE_CONFIG.creditCardTag);
      return { affiliateUrl: parsedUrl.toString(), store };
    }

    if (hostname.includes('americanexpress') || hostname.includes('amex')) {
      store = 'Amex';
      parsedUrl.searchParams.set('CPID', cfg.creditCardTag || DEFAULT_AFFILIATE_CONFIG.creditCardTag);
      return { affiliateUrl: parsedUrl.toString(), store };
    }

    if (hostname.includes('nordvpn')) {
      store = 'NordVPN';
      parsedUrl.searchParams.set('aff_id', cfg.softwareTag || DEFAULT_AFFILIATE_CONFIG.softwareTag);
      return { affiliateUrl: parsedUrl.toString(), store };
    }

    // Default fallback
    parsedUrl.searchParams.set('ref', 'dealpulse_affiliate');
    return { affiliateUrl: parsedUrl.toString(), store: 'Amazon' };
  } catch {
    return { affiliateUrl: url, store: 'Amazon' };
  }
}

/**
 * Auto-generates high converting deal posts based on category and affiliate tags.
 */
export function generateCategoryDeals(category: Deal['category'], count = 3): Deal[] {
  const config = getAffiliateConfig();
  const timestamp = Date.now();

  const templates: Record<Deal['category'], Array<Partial<Deal>>> = {
    'Credit Cards & Finance': [
      {
        title: 'Chase Sapphire Preferred Card - Earn 60,000 Bonus Points',
        description: 'Earn 60,000 bonus points after spending $4,000 in first 3 months. $750 travel redemption value.',
        originalPrice: 750,
        dealPrice: 0,
        discountPercentage: 100,
        couponCode: 'CHASEBONUS',
        store: 'Chase',
        imageUrl: '/images/chase_card.jpg',
        rawUrl: 'https://creditcards.chase.com/a1/sapphire/preferred',
        bonusOffer: '🔥 60,000 Points Sign-Up Bonus ($750 Value)',
        features: ['60,000 Bonus Points', '3x Dining & Select Streaming', '5x Travel on Chase Ultimate Rewards']
      }
    ],
    'Software & SaaS': [
      {
        title: 'NordVPN 2-Year Plan - 72% OFF + 3 Extra Months Free',
        description: 'Ultra-fast encrypted VPN with Threat Protection anti-malware and password manager.',
        originalPrice: 320,
        dealPrice: 89.99,
        discountPercentage: 72,
        couponCode: 'NORD72OFF',
        store: 'NordVPN',
        imageUrl: '/images/nordvpn_software.jpg',
        rawUrl: 'https://nordvpn.com/special-deal',
        bonusOffer: '⚡ 72% OFF + 3 Months Free',
        features: ['6400+ Fast Servers', 'Ad & Malware Blocker', '1TB Cloud Storage']
      }
    ],
    'Electronics': [
      {
        title: 'Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones',
        description: 'Lowest price of the season! Industry leading noise canceling with two processors and 8 microphones.',
        originalPrice: 399.99,
        dealPrice: 278.00,
        discountPercentage: 30,
        couponCode: 'AUDIO30OFF',
        store: 'Amazon',
        imageUrl: '/images/sony_headphones.jpg',
        rawUrl: 'https://www.amazon.com/dp/B09XS7JWHH',
        features: ['30-hr battery life', 'Ultra-comfortable light design', 'Multipoint Bluetooth connection']
      }
    ],
    'Laptops & Tech': [
      {
        title: 'Apple MacBook Air 15" M3 Chip (16GB RAM, 512GB SSD) - Midnight',
        description: 'Incredible performance in an ultra-slim enclosure. Features all-day 18-hour battery life.',
        originalPrice: 1499.00,
        dealPrice: 1199.00,
        discountPercentage: 20,
        couponCode: 'MACM3SAVINGS',
        store: 'Amazon',
        imageUrl: '/images/macbook_air.jpg',
        rawUrl: 'https://www.amazon.com/dp/B0CX23V6X5',
        features: ['Apple M3 8-Core CPU', '16GB Unified Memory', 'MagSafe Charging & Touch ID']
      }
    ],
    'Home & Kitchen': [
      {
        title: 'Ninja Max XL 5.5-Qt Digital Air Fryer with Crisper Plate',
        description: 'Air fry, roast, bake, re-heat, and dehydrate up to 3 lbs of food with up to 75% less fat.',
        originalPrice: 169.99,
        dealPrice: 99.99,
        discountPercentage: 41,
        couponCode: 'CRISPY10',
        store: 'Walmart',
        imageUrl: '/images/ninja_airfryer.jpg',
        rawUrl: 'https://www.walmart.com/ip/Ninja-Air-Fryer-Max-XL/983742',
        features: ['5.5-Qt Capacity', '450°F Max Heat', 'Dishwasher Safe Parts']
      }
    ],
    'Gaming': [
      {
        title: 'PlayStation 5 Console Slim Digital Edition + Spider-Man 2 Bundle',
        description: 'Experience lightning fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback.',
        originalPrice: 499.99,
        dealPrice: 399.99,
        discountPercentage: 20,
        store: 'Amazon',
        imageUrl: '/images/ps5_console.jpg',
        rawUrl: 'https://www.amazon.com/dp/B0CL5K53DS',
        features: ['1TB Custom NVMe SSD', 'Tempest 3D AudioTech', 'DualSense Wireless Controller included']
      }
    ],
    'Fashion': [
      {
        title: 'Nike Air Max 270 Men\'s Running & Casual Shoes',
        description: 'Iconic max air unit delivers lightweight cushioning under every step. Breathable mesh upper for all-day comfort.',
        originalPrice: 160.00,
        dealPrice: 99.98,
        discountPercentage: 38,
        couponCode: 'SPRINGNIKE',
        store: 'Nike',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
        rawUrl: 'https://www.nike.com/t/air-max-270-mens-shoes',
        features: ['Neoprene stretch bootie fit', 'Dual-density foam sole', 'Rubber toe tip for durability']
      }
    ],
    'Daily Top Deals': [
      {
        title: 'Anker Magnetic Wireless Power Bank 10,000mAh for iPhone & Android',
        description: 'Snaps magnetically to back of smartphone for seamless 20W high speed charging on the go.',
        originalPrice: 59.99,
        dealPrice: 34.99,
        discountPercentage: 42,
        couponCode: 'ANKERPOWER',
        store: 'Amazon',
        imageUrl: 'https://images.unsplash.com/photo-1609592424074-27945d8b8a3e?w=800&auto=format&fit=crop&q=80',
        rawUrl: 'https://www.amazon.com/dp/B09BN1N7F9',
        features: ['10,000mAh Capacity', 'Strong Magnetic Grip', 'Foldable Stand Included']
      }
    ]
  };

  const selectedCategoryItems = templates[category] || templates['Daily Top Deals'];

  return selectedCategoryItems.slice(0, count).map((item, idx) => {
    const { affiliateUrl, store } = convertToAffiliateUrl(item.rawUrl || '', config);
    return {
      id: `auto-${category.toLowerCase().replace(/\s+/g, '-')}-${timestamp}-${idx}`,
      title: item.title || 'Special Featured Deal',
      description: item.description || 'Limited time promotional price auto-curated with best affiliate deal rate.',
      originalPrice: item.originalPrice || 100,
      dealPrice: item.dealPrice || 50,
      discountPercentage: item.discountPercentage || 50,
      couponCode: item.couponCode,
      bonusOffer: item.bonusOffer,
      store: item.store || store,
      category,
      imageUrl: item.imageUrl || '/images/chase_card.jpg',
      affiliateUrl,
      rawUrl: item.rawUrl || '',
      upvotes: Math.floor(Math.random() * 250) + 40,
      downvotes: Math.floor(Math.random() * 5),
      userVoted: null,
      isSaved: false,
      postedAt: 'Just Now',
      isFireDeal: true,
      isStaffPick: true,
      viewsCount: Math.floor(Math.random() * 1200) + 300,
      commentsCount: Math.floor(Math.random() * 25) + 3,
      features: item.features || ['Verified Partner Offer', 'Affiliate Deal Guaranteed']
    };
  });
}
