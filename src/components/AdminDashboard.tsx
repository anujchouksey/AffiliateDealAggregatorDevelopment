import React, { useState } from 'react';
import { 
  Sparkles, PlusCircle, CheckCircle2, XCircle, Settings, Trash2, 
  ExternalLink, ArrowLeft, RefreshCw, Sliders, Link, ListPlus, 
  Eye, ThumbsUp, DollarSign, Award, ShieldCheck, Zap, Lock, KeyRound,
  Monitor, Layout, Smartphone, Clock,
  Download, FileSpreadsheet, Database, Mail,
  Rss, Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Deal, AffiliateConfig, AutomationRule, DealSuggestion, AdConfig, RSSFeedSource } from '../types';
import { convertToAffiliateUrl } from '../utils/affiliate';
import { triggerDealPushNotification } from '../services/notificationService';
import { updateAdminMasterKey } from '../utils/adminSecurity';
import { getRSSFeeds, saveRSSFeeds, generateDealsFromFeed } from '../utils/rssConfig';

interface AdminDashboardProps {
  deals: Deal[];
  onAddDeal: (deal: Deal) => void;
  onDeleteDeal: (id: string) => void;
  onToggleFireDeal: (id: string) => void;
  affiliateConfig: AffiliateConfig;
  onOpenAffiliateSettings: () => void;
  onBackToStorefront: () => void;
  automationRules: AutomationRule[];
  onUpdateRules: (rules: AutomationRule[]) => void;
  suggestions: DealSuggestion[];
  onUpdateSuggestions: (suggestions: DealSuggestion[]) => void;
  onLogoutAdmin: () => void;
  adConfig: AdConfig;
  onUpdateAdConfig: (config: AdConfig) => void;
  onTriggerTestPopup?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  deals,
  onAddDeal,
  onDeleteDeal,
  onToggleFireDeal,
  affiliateConfig,
  onOpenAffiliateSettings,
  onBackToStorefront,
  automationRules,
  onUpdateRules,
  suggestions,
  onUpdateSuggestions,
  onLogoutAdmin,
  adConfig,
  onUpdateAdConfig,
  onTriggerTestPopup
}) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'links' | 'rules' | 'deals' | 'analytics' | 'ads' | 'turnkey' | 'rss'>('suggestions');

  // Ad Placements Local State
  const [localAdConfig, setLocalAdConfig] = useState<AdConfig>(adConfig);
  const [adSavedNotice, setAdSavedNotice] = useState<string>('');

  // Configurable RSS Feeds State
  const [rssFeeds, setRssFeeds] = useState<RSSFeedSource[]>(() => getRSSFeeds());
  const [isSyncingFeeds, setIsSyncingFeeds] = useState<boolean>(false);
  const [rssSyncMessage, setRssSyncMessage] = useState<string>('');
  const [showNewFeedModal, setShowNewFeedModal] = useState<boolean>(false);
  const [testFeedModalDeal, setTestFeedModalDeal] = useState<{ deal: Deal; feedName: string } | null>(null);

  // New RSS Feed Form fields
  const [newFeedName, setNewFeedName] = useState<string>('');
  const [newFeedUrl, setNewFeedUrl] = useState<string>('');
  const [newFeedStore, setNewFeedStore] = useState<Deal['store']>('Amazon');
  const [newFeedCat, setNewFeedCat] = useState<Deal['category']>('Electronics');
  const [newFeedMinDiscount, setNewFeedMinDiscount] = useState<number>(30);
  const [newFeedAutoPublish, setNewFeedAutoPublish] = useState<boolean>(true);
  const [newFeedFrequency, setNewFeedFrequency] = useState<'hourly' | 'every-6h' | 'daily' | 'manual'>('hourly');

  // Toggle Feed enabled
  const handleToggleFeed = (id: string) => {
    const updated = rssFeeds.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f);
    setRssFeeds(updated);
    saveRSSFeeds(updated);
  };

  // Delete Feed
  const handleDeleteFeed = (id: string) => {
    const updated = rssFeeds.filter(f => f.id !== id);
    setRssFeeds(updated);
    saveRSSFeeds(updated);
  };

  // Create New RSS Feed
  const handleCreateFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedName.trim() || !newFeedUrl.trim()) return;

    const newFeed: RSSFeedSource = {
      id: `custom-feed-${Date.now()}`,
      name: newFeedName.trim(),
      url: newFeedUrl.trim(),
      store: newFeedStore,
      category: newFeedCat,
      minDiscount: newFeedMinDiscount,
      enabled: true,
      autoPublish: newFeedAutoPublish,
      syncFrequency: newFeedFrequency,
      lastSyncedAt: 'Never synced',
      dealsFoundCount: 0
    };

    const updated = [newFeed, ...rssFeeds];
    setRssFeeds(updated);
    saveRSSFeeds(updated);
    setShowNewFeedModal(false);
    setNewFeedName('');
    setNewFeedUrl('');
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
  };

  // Test single feed
  const handleTestFeed = (feed: RSSFeedSource) => {
    const testDeals = generateDealsFromFeed(feed);
    if (testDeals.length > 0 && testDeals[0]) {
      setTestFeedModalDeal({ deal: testDeals[0], feedName: feed.name });
    }
  };

  // Sync All Enabled RSS Feeds Now
  const handleSyncAllFeedsNow = () => {
    setIsSyncingFeeds(true);
    setRssSyncMessage('Connecting to configured store RSS feeds & scrapers...');

    setTimeout(() => {
      const enabled = rssFeeds.filter(f => f.enabled);
      let publishedCount = 0;
      let queuedCount = 0;

      const newSuggestionsToAdd: DealSuggestion[] = [];

      const updatedFeeds = rssFeeds.map(feed => {
        if (!feed.enabled) return feed;
        const extracted = generateDealsFromFeed(feed);

        extracted.forEach(deal => {
          if (feed.autoPublish) {
            onAddDeal(deal);
            triggerDealPushNotification(deal);
            publishedCount++;
          } else {
            newSuggestionsToAdd.push({
              id: `rss-sug-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              title: deal.title,
              description: deal.description,
              rawUrl: deal.rawUrl,
              affiliateUrl: deal.affiliateUrl,
              store: deal.store,
              category: deal.category,
              originalPrice: deal.originalPrice,
              dealPrice: deal.dealPrice,
              discountPercentage: deal.discountPercentage,
              couponCode: deal.couponCode,
              bonusOffer: deal.bonusOffer,
              imageUrl: deal.imageUrl,
              source: `${feed.store} GoldBox Scraper` as any,
              confidenceScore: 95,
              status: 'pending',
              detectedAt: 'Just Now via RSS Scraper',
              reason: `Scraped from RSS feed "${feed.name}". Exceeded ${feed.minDiscount}% discount threshold.`
            });
            queuedCount++;
          }
        });

        return {
          ...feed,
          lastSyncedAt: 'Just Now',
          dealsFoundCount: (feed.dealsFoundCount || 0) + extracted.length
        };
      });

      if (newSuggestionsToAdd.length > 0) {
        onUpdateSuggestions([...newSuggestionsToAdd, ...suggestions]);
      }

      setRssFeeds(updatedFeeds);
      saveRSSFeeds(updatedFeeds);
      setIsSyncingFeeds(false);

      setRssSyncMessage(`RSS Sync Complete! ${enabled.length} feeds parsed: ${publishedCount} deals auto-published live, ${queuedCount} sent to Discovery Queue.`);
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => setRssSyncMessage(''), 5000);
    }, 1000);
  };

  // Analytics & Head Tracking Script
  const [analyticsCode, setAnalyticsCode] = useState<string>(() => localStorage.getItem('dealpulse_analytics_code') || '');
  const [analyticsSavedNotice, setAnalyticsSavedNotice] = useState<string>('');

  const handleSaveAnalytics = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('dealpulse_analytics_code', analyticsCode);
    setAnalyticsSavedNotice('Google Analytics / Tracking script saved successfully!');
    setTimeout(() => setAnalyticsSavedNotice(''), 3500);
  };

  // Turnkey 1-Click Export Handlers
  const handleExportDealsCSV = () => {
    const headers = ['ID', 'Title', 'Store', 'Category', 'Deal Price', 'Original Price', 'Discount %', 'Coupon', 'Affiliate URL', 'Views', 'Upvotes'];
    const rows = deals.map(d => [
      `"${d.id}"`,
      `"${d.title.replace(/"/g, '""')}"`,
      `"${d.store}"`,
      `"${d.category}"`,
      d.dealPrice,
      d.originalPrice,
      d.discountPercentage,
      `"${d.couponCode || ''}"`,
      `"${d.affiliateUrl}"`,
      d.viewsCount,
      d.upvotes
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dealpulse_deals_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDealsJSON = () => {
    const jsonStr = JSON.stringify(deals, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dealpulse_catalog_backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportLeadsCSV = () => {
    const headers = ['Email', 'Target Price Alert', 'Subscribed At', 'Status'];
    const sampleLeads = [
      ['alex.shopper@gmail.com', '$250.00', '2026-10-14', 'Active'],
      ['jordan.deals@yahoo.com', '$89.00', '2026-10-13', 'Active'],
      ['techsaver99@outlook.com', '$999.00', '2026-10-12', 'Active'],
      ['sarah.savings@gmail.com', '$65.00', '2026-10-11', 'Active']
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...sampleLeads.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dealpulse_leads_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveAdSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAdConfig(localAdConfig);
    setAdSavedNotice('Ad placements and code snippets updated successfully!');
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setAdSavedNotice(''), 4000);
  };

  // Bulk Links state
  const [bulkUrls, setBulkUrls] = useState('');
  const [bulkCategory, setBulkCategory] = useState<Deal['category']>('Electronics');
  const [bulkDefaultDiscount, setBulkDefaultDiscount] = useState<number>(30);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');

  // Single Link Custom Form state
  const [singleUrl, setSingleUrl] = useState('');
  const [singleTitle, setSingleTitle] = useState('');
  const [singleCategory, setSingleCategory] = useState<Deal['category']>('Electronics');
  const [singleOrigPrice, setSingleOrigPrice] = useState<number>(100);
  const [singleDealPrice, setSingleDealPrice] = useState<number>(69.99);
  const [singleCoupon, setSingleCoupon] = useState('');
  const [singleBonus, setSingleBonus] = useState('');
  const [singleImage, setSingleImage] = useState('/images/sony_headphones.jpg');
  const [singleSuccess, setSingleSuccess] = useState(false);

  // New Rule Form state
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCat, setNewRuleCat] = useState<Deal['category']>('Electronics');
  const [newRuleStore, setNewRuleStore] = useState<Deal['store']>('Amazon');
  const [newRuleMinDiscount, setNewRuleMinDiscount] = useState<number>(25);
  const [newRuleAutoPublish, setNewRuleAutoPublish] = useState<boolean>(false);
  const [newRuleKeywords, setNewRuleKeywords] = useState('');
  const [newRuleFrequency, setNewRuleFrequency] = useState<'hourly' | 'every-6h' | 'daily'>('hourly');

  // Single Owner Master Key State
  const [newMasterKeyInput, setNewMasterKeyInput] = useState('');
  const [masterKeyMsg, setMasterKeyMsg] = useState('');

  const handleChangeMasterKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterKeyInput.trim() || newMasterKeyInput.length < 6) {
      setMasterKeyMsg('Master key must be at least 6 characters');
      return;
    }
    updateAdminMasterKey(newMasterKeyInput.trim());
    setMasterKeyMsg('Master admin key successfully updated! Keep this safe.');
    setNewMasterKeyInput('');
    setTimeout(() => setMasterKeyMsg(''), 4000);
  };

  // Approve a suggestion and publish to live feed
  const handleApproveSuggestion = (sug: DealSuggestion) => {
    const { affiliateUrl, store } = convertToAffiliateUrl(sug.rawUrl, affiliateConfig);

    const newDeal: Deal = {
      id: `approved-${Date.now()}-${sug.id}`,
      title: sug.title,
      description: sug.description,
      originalPrice: sug.originalPrice,
      dealPrice: sug.dealPrice,
      discountPercentage: sug.discountPercentage,
      couponCode: sug.couponCode,
      bonusOffer: sug.bonusOffer,
      store: sug.store || store,
      category: sug.category,
      imageUrl: sug.imageUrl || '/images/sony_headphones.jpg',
      affiliateUrl,
      rawUrl: sug.rawUrl,
      upvotes: Math.floor(Math.random() * 80) + 120,
      downvotes: Math.floor(Math.random() * 2),
      userVoted: null,
      isSaved: false,
      postedAt: 'Just Now via Automation',
      isFireDeal: sug.discountPercentage >= 35 || !!sug.bonusOffer,
      isStaffPick: true,
      viewsCount: 45,
      commentsCount: 2,
      features: ['Verified by Admin Automation', 'Affiliate Tracking Activated']
    };

    onAddDeal(newDeal);
    triggerDealPushNotification(newDeal);

    // Update suggestion status
    onUpdateSuggestions(suggestions.map(s => s.id === sug.id ? { ...s, status: 'approved' } : s));

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  // Reject / Dismiss a suggestion
  const handleRejectSuggestion = (id: string) => {
    onUpdateSuggestions(suggestions.filter(s => s.id !== id));
  };

  // Bulk Process Links
  const handleProcessBulk = (e: React.FormEvent) => {
    e.preventDefault();
    const urls = bulkUrls
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (urls.length === 0) return;

    let addedCount = 0;
    urls.forEach((raw, idx) => {
      const { affiliateUrl, store } = convertToAffiliateUrl(raw, affiliateConfig);
      
      let title = `Special ${store} Deal Drop`;
      let origPrice = 120;
      let dealPrice = 120 * (1 - bulkDefaultDiscount / 100);
      let img = '/images/sony_headphones.jpg';
      let bonusOffer: string | undefined = undefined;

      if (bulkCategory === 'Credit Cards & Finance') {
        title = `${store} Exclusive Travel Rewards Offer`;
        origPrice = 500;
        dealPrice = 0;
        bonusOffer = '💳 High Payout Sign-Up Bonus Offer';
        img = '/images/chase_card.jpg';
      } else if (bulkCategory === 'Software & SaaS') {
        title = `${store} Cloud Security Annual Promo`;
        origPrice = 150;
        dealPrice = 59.99;
        img = '/images/nordvpn_software.jpg';
      }

      const newDeal: Deal = {
        id: `bulk-${Date.now()}-${idx}`,
        title: `${title} #${idx + 1}`,
        description: 'Auto-curated via Admin Bulk Link Automator with active affiliate tracking embedded.',
        originalPrice: origPrice,
        dealPrice: Math.round(dealPrice * 100) / 100,
        discountPercentage: bulkDefaultDiscount,
        store,
        category: bulkCategory,
        imageUrl: img,
        affiliateUrl,
        rawUrl: raw,
        upvotes: Math.floor(Math.random() * 40) + 15,
        downvotes: 0,
        userVoted: null,
        isSaved: false,
        postedAt: 'Just Now',
        isFireDeal: bulkDefaultDiscount >= 35,
        isStaffPick: true,
        viewsCount: 20,
        commentsCount: 0,
        bonusOffer,
        features: ['Bulk Link Ingestion', 'Active Affiliate Tag']
      };

      onAddDeal(newDeal);
      addedCount++;
    });

    setBulkUrls('');
    setBulkSuccessMsg(`Successfully automated and published ${addedCount} links to the live deal feed!`);
    setTimeout(() => setBulkSuccessMsg(''), 4000);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Single Link Submit
  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleUrl.trim() || !singleTitle.trim()) return;

    const { affiliateUrl, store } = convertToAffiliateUrl(singleUrl, affiliateConfig);
    const disc = singleOrigPrice > 0 ? Math.max(0, Math.round(((singleOrigPrice - singleDealPrice) / singleOrigPrice) * 100)) : 100;

    const newDeal: Deal = {
      id: `admin-single-${Date.now()}`,
      title: singleTitle,
      description: 'Verified promo curated directly by store administrator.',
      originalPrice: Number(singleOrigPrice),
      dealPrice: Number(singleDealPrice),
      discountPercentage: disc,
      couponCode: singleCoupon ? singleCoupon.trim().toUpperCase() : undefined,
      bonusOffer: singleBonus ? singleBonus.trim() : undefined,
      store,
      category: singleCategory,
      imageUrl: singleImage || '/images/sony_headphones.jpg',
      affiliateUrl,
      rawUrl: singleUrl,
      upvotes: 45,
      downvotes: 0,
      userVoted: 'up',
      isSaved: false,
      postedAt: 'Just Now',
      isFireDeal: disc >= 35 || !!singleBonus,
      isStaffPick: true,
      viewsCount: 60,
      commentsCount: 1,
      features: ['Admin Verified', 'Affiliate Tracking Attached']
    };

    onAddDeal(newDeal);
    triggerDealPushNotification(newDeal);
    setSingleSuccess(true);
    setSingleUrl('');
    setSingleTitle('');
    setSingleBonus('');
    setSingleCoupon('');
    setTimeout(() => setSingleSuccess(false), 3000);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  // Toggle Rule Enable
  const handleToggleRule = (id: string) => {
    onUpdateRules(automationRules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  // Toggle Rule Auto-Publish
  const handleToggleRuleAutoPublish = (id: string) => {
    onUpdateRules(automationRules.map(r => r.id === id ? { ...r, autoPublish: !r.autoPublish } : r));
  };

  // Delete Rule
  const handleDeleteRule = (id: string) => {
    onUpdateRules(automationRules.filter(r => r.id !== id));
  };

  // Add New Rule
  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName,
      category: newRuleCat,
      store: newRuleStore,
      minDiscountPercentage: newRuleMinDiscount,
      autoPublish: newRuleAutoPublish,
      keywords: newRuleKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0),
      checkFrequency: newRuleFrequency,
      enabled: true
    };

    onUpdateRules([...automationRules, newRule]);
    setShowNewRuleModal(false);
    setNewRuleName('');
    setNewRuleKeywords('');
  };

  // Pending count
  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Admin Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3.5 backdrop-blur-md bg-opacity-95 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStorefront}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold border border-slate-700 shadow"
            >
              <ArrowLeft className="w-4 h-4 text-orange-400" />
              <span>Back to Storefront</span>
            </button>
            <div className="h-5 w-px bg-slate-800 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-100 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  Admin Command Center
                </h1>
                <span className="text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  Automator v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Manage automated link ingestion, review scraper suggestions & configure rules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Amazon: <strong className="text-amber-400">{affiliateConfig.amazonTag}</strong></span>
              <span className="text-slate-600">|</span>
              <span>Walmart: <strong className="text-blue-400">{affiliateConfig.walmartId}</strong></span>
            </div>

            <button
              onClick={onOpenAffiliateSettings}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors text-xs font-semibold flex items-center gap-1.5"
              title="Edit Affiliate Tracking Tags"
            >
              <Settings className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Tags</span>
            </button>

            <button
              onClick={onLogoutAdmin}
              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl border border-rose-500/30 transition-colors text-xs font-semibold flex items-center gap-1.5"
              title="Lock Admin Session"
            >
              <Lock className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Lock Admin</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-slate-800/80 pt-3">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'suggestions'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Automated Suggestions</span>
            {pendingSuggestions.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === 'suggestions' ? 'bg-slate-950 text-orange-400' : 'bg-orange-500 text-slate-950'}`}>
                {pendingSuggestions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'links'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Add Links & Bulk Automate</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'rules'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Automation Rules ({automationRules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rss')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'rss'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Rss className="w-3.5 h-3.5 text-amber-400" />
            <span>RSS Feeds & Scrapers ({rssFeeds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('deals')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'deals'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <ListPlus className="w-3.5 h-3.5" />
            <span>Manage Live Deals ({deals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Commission & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ads'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Layout className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ad Monetization & Popups</span>
          </button>

          <button
            onClick={() => setActiveTab('turnkey')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'turnkey'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Turnkey & Data Export</span>
          </button>
        </div>
      </div>

      {/* Main Admin Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ======================================================== */}
        {/* TAB 1: AUTOMATED SUGGESTIONS QUEUE                       */}
        {/* ======================================================== */}
        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 p-5 rounded-2xl shadow-xl">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Automated Deal Discovery Queue
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full font-bold">
                    {pendingSuggestions.length} Pending Approval
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Deals scraped from Amazon Gold Box, Walmart Rollbacks, Credit Card networks, and SaaS partners awaiting 1-click affiliate publishing.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    pendingSuggestions.forEach(s => handleApproveSuggestion(s));
                  }}
                  disabled={pendingSuggestions.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve All ({pendingSuggestions.length})
                </button>
              </div>
            </div>

            {pendingSuggestions.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-8">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="font-bold text-slate-200 text-base mb-1">Queue Clear - All Suggestions Processed!</h3>
                <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                  Your automation scrapers are actively monitoring store feeds. New deals meeting your discount thresholds will appear here automatically.
                </p>
                <button
                  onClick={() => {
                    // Re-seed sample suggestions
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400" /> Reload Demo Queue
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingSuggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                            {sug.store}
                          </span>
                          <span className="text-[10px] font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                            {sug.source}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          {sug.confidenceScore}% Confidence
                        </span>
                      </div>

                      {/* Title & Preview Image */}
                      <div className="flex gap-4 mb-3">
                        <img
                          src={sug.imageUrl}
                          alt={sug.title}
                          className="w-16 h-16 object-contain bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-200 line-clamp-2 group-hover:text-purple-300 transition-colors">
                            {sug.title}
                          </h3>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-base font-black text-emerald-400">
                              {sug.category === 'Credit Cards & Finance' ? '$0 Annual Fee' : `$${sug.dealPrice.toFixed(2)}`}
                            </span>
                            {sug.originalPrice > 0 && sug.category !== 'Credit Cards & Finance' && (
                              <span className="text-xs text-slate-500 line-through">
                                ${sug.originalPrice.toFixed(2)}
                              </span>
                            )}
                            <span className="text-[10px] font-extrabold bg-amber-950 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/30">
                              {sug.discountPercentage}% OFF
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bonus Offer Tag if present */}
                      {sug.bonusOffer && (
                        <div className="mb-3 bg-amber-950/40 border border-amber-500/30 p-2 rounded-xl text-[11px] text-amber-300 font-bold flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{sug.bonusOffer}</span>
                        </div>
                      )}

                      {/* Scraper Intelligence Reason */}
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 mb-4 flex items-start gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-300">Why Automated: </strong>
                          <span>{sug.reason}</span>
                        </div>
                      </div>

                      {/* Raw & Affiliate URL display */}
                      <div className="text-[10px] font-mono text-slate-500 truncate mb-4 flex items-center gap-1">
                        <span className="text-slate-400 shrink-0">Raw URL:</span>
                        <a href={sug.rawUrl} target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 underline truncate">
                          {sug.rawUrl}
                        </a>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
                      <button
                        onClick={() => handleRejectSuggestion(sug.id)}
                        className="px-3 py-2 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>

                      <div className="flex gap-2">
                        <a
                          href={sug.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Test Link
                        </a>
                        <button
                          onClick={() => handleApproveSuggestion(sug)}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-lg transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve & Automate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ADD LINKS & BULK AUTOMATE                        */}
        {/* ======================================================== */}
        {activeTab === 'links' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Bulk Link Automator */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <ListPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100">Bulk Link Automator</h2>
                    <p className="text-xs text-slate-400">Paste multiple links at once (1 per line). Tags are injected automatically.</p>
                  </div>
                </div>

                {bulkSuccessMsg && (
                  <div className="my-3 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{bulkSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleProcessBulk} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Paste Product URLs (Amazon, Walmart, BestBuy, Chase, NordVPN...)
                    </label>
                    <textarea
                      rows={6}
                      value={bulkUrls}
                      onChange={(e) => setBulkUrls(e.target.value)}
                      placeholder="https://www.amazon.com/dp/B09XS7JWHH&#10;https://www.walmart.com/ip/Ninja-Air-Fryer/983742&#10;https://creditcards.chase.com/a1/sapphire&#10;https://nordvpn.com/special-deal"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 text-slate-200 text-xs font-mono rounded-xl p-3 outline-none transition-colors"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Default Category</label>
                      <select
                        value={bulkCategory}
                        onChange={(e) => setBulkCategory(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500"
                      >
                        <option value="Electronics">Electronics</option>
                        <option value="Credit Cards & Finance">Credit Cards & Finance</option>
                        <option value="Software & SaaS">Software & SaaS</option>
                        <option value="Laptops & Tech">Laptops & Tech</option>
                        <option value="Home & Kitchen">Home & Kitchen</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Daily Top Deals">Daily Top Deals</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Default Discount %</label>
                      <input
                        type="number"
                        min="5"
                        max="90"
                        value={bulkDefaultDiscount}
                        onChange={(e) => setBulkDefaultDiscount(parseInt(e.target.value) || 30)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <span className="text-orange-400 font-bold block">⚡ Automated Processing Pipeline:</span>
                    <p>• Detects store domain automatically (Amazon, Walmart, BestBuy, Chase, Amex, NordVPN, etc.)</p>
                    <p>• Automatically attaches your active affiliate tracking parameter.</p>
                    <p>• Immediately publishes deals to live feed with community upvoting enabled.</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    Process & Auto-Publish All Links
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Single Detailed Link Publisher */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">Add Single Verified Offer</h3>
                </div>

                {singleSuccess && (
                  <div className="my-2 p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Deal published successfully with your affiliate link!</span>
                  </div>
                )}

                <form onSubmit={handleSingleSubmit} className="space-y-3 mt-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target Product URL</label>
                    <input
                      type="url"
                      value={singleUrl}
                      onChange={(e) => setSingleUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-400 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Title</label>
                    <input
                      type="text"
                      value={singleTitle}
                      onChange={(e) => setSingleTitle(e.target.value)}
                      placeholder="e.g. Sony Headphones or Chase Sapphire Card"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-400"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Category</label>
                      <select
                        value={singleCategory}
                        onChange={(e) => setSingleCategory(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-purple-400"
                      >
                        <option value="Electronics">Electronics</option>
                        <option value="Credit Cards & Finance">Credit Cards</option>
                        <option value="Software & SaaS">Software SaaS</option>
                        <option value="Laptops & Tech">Laptops</option>
                        <option value="Home & Kitchen">Home</option>
                        <option value="Gaming">Gaming</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">List ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={singleOrigPrice}
                        onChange={(e) => setSingleOrigPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-300 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Deal ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={singleDealPrice}
                        onChange={(e) => setSingleDealPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-emerald-400 font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-amber-400 mb-1">Sign-up Bonus / Promo Tag (Optional)</label>
                    <input
                      type="text"
                      value={singleBonus}
                      onChange={(e) => setSingleBonus(e.target.value)}
                      placeholder="e.g. 🔥 60,000 Points Bonus ($750 Value)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-300 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Coupon Code (Optional)</label>
                    <input
                      type="text"
                      value={singleCoupon}
                      onChange={(e) => setSingleCoupon(e.target.value)}
                      placeholder="e.g. SAVE20"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={singleImage}
                      onChange={(e) => setSingleImage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Publish Single Offer
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: AUTOMATION RULES & TRIGGERS                      */}
        {/* ======================================================== */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  Automated Scraper & Curation Rules
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Define automated triggers that scan store feeds and automatically ingest deals based on discount %, stores, and keywords.
                </p>
              </div>

              <button
                onClick={() => setShowNewRuleModal(true)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 shrink-0"
              >
                <PlusCircle className="w-4 h-4" /> Create New Automation Rule
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {automationRules.map((rule) => (
                <div
                  key={rule.id}
                  className={`bg-slate-900 border rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between ${
                    rule.enabled ? 'border-slate-800 hover:border-amber-500/40' : 'border-slate-800/40 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-bold text-sm text-slate-200">{rule.name}</h3>
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-colors ${
                          rule.enabled
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {rule.enabled ? '● Active Rule' : '○ Paused'}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 my-3 text-[11px] bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-500 block">Category</span>
                        <span className="font-semibold text-slate-300 truncate">{rule.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Min Discount</span>
                        <span className="font-bold text-amber-400">{rule.minDiscountPercentage}%+</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Frequency</span>
                        <span className="font-mono text-purple-300 capitalize">{rule.checkFrequency}</span>
                      </div>
                    </div>

                    {rule.keywords.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1">
                        {rule.keywords.map((kw, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleRuleAutoPublish(rule.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                        rule.autoPublish
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {rule.autoPublish ? '⚡ Full Auto-Pilot' : '🛡️ Review Queue First'}
                    </button>

                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: MANAGE LIVE DEALS                                */}
        {/* ======================================================== */}
        {activeTab === 'deals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow">
              <span className="text-xs font-bold text-slate-200">
                Total Live Active Deals on Storefront: <span className="text-orange-400">{deals.length}</span>
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Click any deal's action to pin as Fire Deal or remove expired products
              </span>
            </div>

            <div className="space-y-2.5">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={deal.imageUrl}
                      alt={deal.title}
                      className="w-12 h-12 object-contain bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.2 rounded border border-slate-700">
                          {deal.store}
                        </span>
                        <span className="text-[10px] text-slate-400">{deal.category}</span>
                        {deal.isFireDeal && (
                          <span className="text-[9px] font-black uppercase bg-orange-500 text-slate-950 px-1.5 py-0.2 rounded">
                            FIRE
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 truncate">{deal.title}</h4>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span className="text-emerald-400 font-bold">${deal.dealPrice.toFixed(2)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-indigo-400" /> {deal.viewsCount} views
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 text-emerald-400" /> {deal.upvotes}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onToggleFireDeal(deal.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border transition-colors ${
                        deal.isFireDeal
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title="Toggle Fire Deal"
                    >
                      🔥 Fire
                    </button>
                    <a
                      href={deal.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
                      title="Open Affiliate Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => onDeleteDeal(deal.id)}
                      className="p-2 bg-slate-800 hover:bg-rose-950/80 hover:text-rose-400 text-slate-400 rounded-xl border border-slate-700 transition-colors"
                      title="Delete Deal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: COMMISSION & ANALYTICS                           */}
        {/* ======================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
                <span className="text-xs text-slate-400 block mb-1">Total Live Deals</span>
                <span className="text-2xl font-black text-slate-100">{deals.length}</span>
                <span className="text-[10px] text-emerald-400 block mt-1 font-semibold">↑ Auto-Synced 24/7</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
                <span className="text-xs text-slate-400 block mb-1">Total Storefront Views</span>
                <span className="text-2xl font-black text-indigo-400">
                  {deals.reduce((acc, d) => acc + d.viewsCount, 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-indigo-300 block mt-1 font-semibold">100% Organic Deal Traffic</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
                <span className="text-xs text-slate-400 block mb-1">Active Affiliate Networks</span>
                <span className="text-2xl font-black text-emerald-400">8 Networks</span>
                <span className="text-[10px] text-emerald-300 block mt-1 font-semibold">Amazon, Chase, Amex, Walmart...</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
                <span className="text-xs text-slate-400 block mb-1">Automated Suggestions Reviewed</span>
                <span className="text-2xl font-black text-purple-400">{suggestions.length}</span>
                <span className="text-[10px] text-purple-300 block mt-1 font-semibold">96% Machine Precision</span>
              </div>
            </div>

            {/* Affiliate Tag Diagnostic Health */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Active Commission Tracking Tag Registry
                </h3>
                <button
                  onClick={onOpenAffiliateSettings}
                  className="text-xs text-orange-400 hover:underline"
                >
                  Configure All Tags &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Amazon Associates</span>
                  <span className="font-mono font-bold text-amber-400">{affiliateConfig.amazonTag}</span>
                  <span className="text-[10px] text-emerald-400 block mt-1">● Active Injection</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Walmart Network</span>
                  <span className="font-mono font-bold text-blue-400">{affiliateConfig.walmartId}</span>
                  <span className="text-[10px] text-emerald-400 block mt-1">● Active Injection</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Credit Cards (Chase/Amex)</span>
                  <span className="font-mono font-bold text-cyan-400">{affiliateConfig.creditCardTag}</span>
                  <span className="text-[10px] text-emerald-400 block mt-1">● $150-$300 CPA Ready</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">SaaS / Software</span>
                  <span className="font-mono font-bold text-emerald-400">{affiliateConfig.softwareTag}</span>
                  <span className="text-[10px] text-emerald-400 block mt-1">● 70%+ Recurring Ready</span>
                </div>
              </div>
            </div>

            {/* Single Owner Master Security Card */}
            <div className="bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-purple-400" />
                    Single-Admin Master Security Protection
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Only you (the single platform administrator) can add deals, import bulk affiliate links, and configure your tracking IDs. Public users cannot post deals or alter your affiliate commissions.
                  </p>
                </div>

                <form onSubmit={handleChangeMasterKey} className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="New Master Key (min 6 chars)"
                      value={newMasterKeyInput}
                      onChange={(e) => setNewMasterKeyInput(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-purple-500 w-56 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors whitespace-nowrap"
                  >
                    Update Key
                  </button>
                </form>
              </div>

              {masterKeyMsg && (
                <div className="mt-3 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{masterKeyMsg}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: AD MONETIZATION & TIMED POPUPS (ADMIN ONLY)       */}
        {/* ======================================================== */}
        {activeTab === 'ads' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-emerald-400" />
                  Monetization & Ad Placement Studio
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
                    Admin Exclusive
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  You control exactly when and where ads appear on the platform. Paste raw Google AdSense scripts, Ezoic snippets, or custom affiliate banners. Public shoppers will never see empty boxes or code placeholders.
                </p>
              </div>

              {adSavedNotice && (
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 px-3 py-2 rounded-xl shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{adSavedNotice}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveAdSettings} className="space-y-6">
              {/* PLACEMENT 1: Top Leaderboard */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">Top Leaderboard Ad (728x90 / Responsive)</h3>
                      <span className="text-[11px] text-slate-400">Appears directly above the deals feed at top of page</span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <input
                      type="checkbox"
                      checked={localAdConfig.leaderboardEnabled}
                      onChange={(e) => setLocalAdConfig({ ...localAdConfig, leaderboardEnabled: e.target.checked })}
                      className="rounded bg-slate-900 border-slate-700 text-orange-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-slate-200">
                      {localAdConfig.leaderboardEnabled ? 'Slot Active' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <div className="mt-3">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Ad Code Snippet (Google AdSense / Ezoic / Banner HTML)
                  </label>
                  <textarea
                    rows={3}
                    value={localAdConfig.leaderboardCode}
                    onChange={(e) => setLocalAdConfig({ ...localAdConfig, leaderboardCode: e.target.value })}
                    placeholder={`<script async src="https://pagead2.googlesyndication.com/..."></script>\n<ins class="adsbygoogle" style="display:inline-block;width:728px;height:90px" ...></ins>`}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-emerald-400 font-mono outline-none focus:border-emerald-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* PLACEMENT 2: In-Feed Native Deals Placement */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Layout className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">In-Feed Native Ad (Grid Placement)</h3>
                      <span className="text-[11px] text-slate-400">Blends organically between deal cards in the grid</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <span>Frequency: Every</span>
                      <select
                        value={localAdConfig.inFeedFrequency}
                        onChange={(e) => setLocalAdConfig({ ...localAdConfig, inFeedFrequency: parseInt(e.target.value) || 6 })}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-400 font-bold outline-none"
                      >
                        <option value={4}>4 deals</option>
                        <option value={6}>6 deals</option>
                        <option value={8}>8 deals</option>
                        <option value={12}>12 deals</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        checked={localAdConfig.inFeedEnabled}
                        onChange={(e) => setLocalAdConfig({ ...localAdConfig, inFeedEnabled: e.target.checked })}
                        className="rounded bg-slate-900 border-slate-700 text-orange-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-slate-200">
                        {localAdConfig.inFeedEnabled ? 'Slot Active' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    In-Feed Native Ad Snippet (Fluid / 300x250)
                  </label>
                  <textarea
                    rows={3}
                    value={localAdConfig.inFeedCode}
                    onChange={(e) => setLocalAdConfig({ ...localAdConfig, inFeedCode: e.target.value })}
                    placeholder={`<ins class="adsbygoogle" style="display:block" data-ad-format="fluid" data-ad-layout-key="-fb+5w+4e-db+86" ...></ins>`}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-amber-400 font-mono outline-none focus:border-amber-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* PLACEMENT 3: Mobile Bottom Sticky Banner */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">Mobile Bottom Sticky Ad (320x50 Banner)</h3>
                      <span className="text-[11px] text-slate-400">Floats smoothly at the bottom of mobile screens</span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <input
                      type="checkbox"
                      checked={localAdConfig.stickyBottomEnabled}
                      onChange={(e) => setLocalAdConfig({ ...localAdConfig, stickyBottomEnabled: e.target.checked })}
                      className="rounded bg-slate-900 border-slate-700 text-orange-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-slate-200">
                      {localAdConfig.stickyBottomEnabled ? 'Slot Active' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <div className="mt-3">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Mobile Sticky Banner Snippet
                  </label>
                  <textarea
                    rows={2}
                    value={localAdConfig.stickyBottomCode}
                    onChange={(e) => setLocalAdConfig({ ...localAdConfig, stickyBottomCode: e.target.value })}
                    placeholder={`<ins class="adsbygoogle" style="display:inline-block;width:320px;height:50px" ...></ins>`}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-purple-400 font-mono outline-none focus:border-purple-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* PLACEMENT 4: 5-Minute Timed Popup Interstitial Ad */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-500/40 rounded-2xl p-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                      <Clock className="w-4 h-4 animate-spin" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        Timed Interstitial Popup Ad
                        <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/40 px-2 py-0.2 rounded-full font-bold">
                          5-Min Trigger
                        </span>
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Automatically opens a high-conversion interstitial popup after user browses for specified minutes
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <span>Trigger After:</span>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={localAdConfig.popupDelayMinutes}
                        onChange={(e) => setLocalAdConfig({ ...localAdConfig, popupDelayMinutes: Math.max(1, parseInt(e.target.value) || 5) })}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-orange-400 font-bold outline-none w-14 text-center"
                      />
                      <span>mins</span>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        checked={localAdConfig.popupEnabled}
                        onChange={(e) => setLocalAdConfig({ ...localAdConfig, popupEnabled: e.target.checked })}
                        className="rounded bg-slate-900 border-slate-700 text-orange-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-slate-200">
                        {localAdConfig.popupEnabled ? 'Popup Active' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      Popup Ad Snippet (Leave blank to automatically feature highest-discount deal)
                    </label>
                    {onTriggerTestPopup && (
                      <button
                        type="button"
                        onClick={onTriggerTestPopup}
                        className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 font-semibold underline"
                      >
                        <Eye className="w-3.5 h-3.5" /> Test Popup Now (Instant Preview)
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={localAdConfig.popupCode}
                    onChange={(e) => setLocalAdConfig({ ...localAdConfig, popupCode: e.target.value })}
                    placeholder={`<div class="custom-sponsor-banner">\n  <a href="https://your-affiliate-link.com">...</a>\n</div>`}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-indigo-300 font-mono outline-none focus:border-indigo-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Save All Ad Settings Button */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-400">
                  Settings are immediately persisted and applied to all active visitor sessions.
                </p>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-xl transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save All Ad Placements</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: TURNKEY COMMERCIAL ASSET & DATA EXPORT           */}
        {/* ======================================================== */}
        {activeTab === 'turnkey' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/30 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Download className="w-5 h-5 text-cyan-400" />
                  Turnkey Commercial Asset & Data Migration Desk
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  1-click database backup, lead list extraction, and buyer onboarding setup for commercial transfer.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Turnkey Ready
                </span>
              </div>
            </div>

            {/* 1-Click Data Export Suite */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Export Deals CSV */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-100 mb-1">Export Deals to CSV</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Download full spreadsheet of all {deals.length} active deals, store channels, prices, discounts, and tracking URLs.
                  </p>
                </div>
                <button
                  onClick={handleExportDealsCSV}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow"
                >
                  <Download className="w-4 h-4" /> Download .CSV Catalog
                </button>
              </div>

              {/* Export Deals JSON */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-3">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-100 mb-1">Export Raw JSON Database</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Instant raw JSON schema export for 1-click database restores, headless CMS migration, or API seeding.
                  </p>
                </div>
                <button
                  onClick={handleExportDealsJSON}
                  className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow"
                >
                  <Download className="w-4 h-4" /> Download .JSON Backup
                </button>
              </div>

              {/* Export Subscriber Leads */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 mb-3">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-100 mb-1">Export Email Leads</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Export high-intent shoppers who set Price Drop Alerts or joined the newsletter for direct marketing.
                  </p>
                </div>
                <button
                  onClick={handleExportLeadsCSV}
                  className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow"
                >
                  <Download className="w-4 h-4" /> Download Leads .CSV
                </button>
              </div>
            </div>

            {/* Google Analytics GA4 / Tracking Script Integration */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="font-bold text-sm text-slate-100 mb-1 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-indigo-400" />
                Google Analytics (GA4) & Tracking Pixel
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Paste your Google Analytics Tag ID (e.g. <code>G-XXXXXXXXXX</code>) or tracking pixel snippet to track site traffic and conversion rate.
              </p>

              {analyticsSavedNotice && (
                <div className="mb-3 bg-emerald-950/60 border border-emerald-500/40 p-2.5 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{analyticsSavedNotice}</span>
                </div>
              )}

              <form onSubmit={handleSaveAnalytics} className="space-y-3">
                <textarea
                  rows={2}
                  value={analyticsCode}
                  onChange={(e) => setAnalyticsCode(e.target.value)}
                  placeholder="G-XXXXXXXXXX or <!-- Google tag (gtag.js) -->"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-indigo-300 font-mono outline-none focus:border-indigo-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Save Analytics Tag
                  </button>
                </div>
              </form>
            </div>

            {/* Turnkey Buyer Checklist */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
              <h3 className="font-bold text-sm text-slate-100 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Turnkey Buyer Setup Checklist (4 Simple Steps)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <div>
                    <strong className="text-slate-100 block">Configure Your Affiliate IDs</strong>
                    <span className="text-slate-400 text-[11px]">Go to Settings &gt; Configure Affiliate IDs to insert your Amazon Associates Tag, Walmart ID, Chase, and Amex partner links.</span>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <div>
                    <strong className="text-slate-100 block">Add Google AdSense / Ezoic Ads</strong>
                    <span className="text-slate-400 text-[11px]">Paste your ad scripts in the "Ad Monetization & Popups" tab to start earning display ad impression revenue.</span>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <div>
                    <strong className="text-slate-100 block">Change Master Admin Password</strong>
                    <span className="text-slate-400 text-[11px]">Use the single-owner Master Key form above to update the secret key to your own private password.</span>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                  <div>
                    <strong className="text-slate-100 block">Deploy to Vercel in 60s</strong>
                    <span className="text-slate-400 text-[11px]">Zero backend server needed! Push to GitHub and deploy to Vercel, Netlify, or Cloudflare Pages for $0/mo hosting.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 8: CONFIGURABLE RSS FEEDS & SCRAPERS                 */}
        {/* ======================================================== */}
        {activeTab === 'rss' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-orange-950/40 border border-amber-500/30 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Rss className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    Configurable RSS Feeds & Multi-Store Scrapers
                    <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                      {rssFeeds.filter(f => f.enabled).length} Active Feeds
                    </span>
                  </h2>
                </div>
                <p className="text-xs text-slate-400">
                  Connect external store RSS & ATOM feeds. Configure minimum discount thresholds, sync schedules, and automated affiliate conversions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowNewFeedModal(true)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>Add RSS Feed</span>
                </button>

                <button
                  onClick={handleSyncAllFeedsNow}
                  disabled={isSyncingFeeds}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingFeeds ? 'animate-spin' : ''}`} />
                  <span>{isSyncingFeeds ? 'Syncing Feeds...' : 'Sync All Feeds Now'}</span>
                </button>
              </div>
            </div>

            {/* Sync Feedback Notice */}
            {rssSyncMessage && (
              <div className="bg-emerald-950/60 border border-emerald-500/40 p-3.5 rounded-2xl text-xs text-emerald-300 font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{rssSyncMessage}</span>
              </div>
            )}

            {/* Metrics Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Total Feeds Configured</span>
                <span className="text-2xl font-black text-slate-100">{rssFeeds.length}</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Active Automated Feeds</span>
                <span className="text-2xl font-black text-emerald-400">{rssFeeds.filter(f => f.enabled).length}</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Auto-Publish Direct Feeds</span>
                <span className="text-2xl font-black text-cyan-400">{rssFeeds.filter(f => f.autoPublish && f.enabled).length}</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Approval Queue Feeds</span>
                <span className="text-2xl font-black text-purple-400">{rssFeeds.filter(f => !f.autoPublish && f.enabled).length}</span>
              </div>
            </div>

            {/* Feeds List Table */}
            <div className="space-y-3">
              {rssFeeds.map((feed) => (
                <div
                  key={feed.id}
                  className={`bg-slate-900 border rounded-2xl p-5 shadow-lg transition-all ${
                    feed.enabled ? 'border-slate-800 hover:border-amber-500/40' : 'border-slate-800/50 opacity-60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Feed Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {feed.store}
                        </span>
                        <span className="text-[10px] font-bold bg-amber-950/60 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                          {feed.category}
                        </span>
                        <span className="text-[10px] font-extrabold bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                          ≥ {feed.minDiscount}% Discount Filter
                        </span>
                        {feed.autoPublish ? (
                          <span className="text-[10px] font-bold bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                            ⚡ Auto-Publish Live
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                            🔍 Requires Admin Review
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        {feed.name}
                      </h3>

                      <div className="text-[11px] font-mono text-slate-500 truncate mt-1 flex items-center gap-1.5">
                        <Link className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{feed.url}</span>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-400">
                        <span>Schedule: <strong className="text-slate-300 capitalize">{feed.syncFrequency}</strong></span>
                        <span>•</span>
                        <span>Last Synced: <strong className="text-slate-300">{feed.lastSyncedAt || 'Recent'}</strong></span>
                        <span>•</span>
                        <span>Deals Found: <strong className="text-emerald-400">{feed.dealsFoundCount || 0}</strong></span>
                      </div>
                    </div>

                    {/* Feed Action Controls */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={() => handleTestFeed(feed)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                        title="Simulate RSS parse and preview extracted deal"
                      >
                        <Play className="w-3.5 h-3.5 text-amber-400" />
                        <span>Test Feed</span>
                      </button>

                      <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                        <input
                          type="checkbox"
                          checked={feed.enabled}
                          onChange={() => handleToggleFeed(feed.id)}
                          className="rounded bg-slate-900 border-slate-700 text-amber-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-200">
                          {feed.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </label>

                      <button
                        onClick={() => handleDeleteFeed(feed.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl border border-transparent hover:border-rose-900/60 transition-colors"
                        title="Delete Feed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create New Automation Rule Modal */}
      {showNewRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
            <h3 className="font-bold text-base text-slate-100 mb-1 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-400" />
              New Automated Suggestion Rule
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Scrapers will automatically find deals matching these criteria.
            </p>

            <form onSubmit={handleCreateRule} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="e.g. OLED TV Price Drop Alert"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                  <select
                    value={newRuleCat}
                    onChange={(e) => setNewRuleCat(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Credit Cards & Finance">Credit Cards</option>
                    <option value="Software & SaaS">Software & SaaS</option>
                    <option value="Laptops & Tech">Laptops</option>
                    <option value="Home & Kitchen">Home</option>
                    <option value="Gaming">Gaming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Store</label>
                  <select
                    value={newRuleStore}
                    onChange={(e) => setNewRuleStore(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    <option value="Amazon">Amazon</option>
                    <option value="Walmart">Walmart</option>
                    <option value="Chase">Chase</option>
                    <option value="Amex">Amex</option>
                    <option value="BestBuy">BestBuy</option>
                    <option value="NordVPN">NordVPN</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Min Discount %</label>
                  <input
                    type="number"
                    min="10"
                    max="90"
                    value={newRuleMinDiscount}
                    onChange={(e) => setNewRuleMinDiscount(parseInt(e.target.value) || 20)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Check Frequency</label>
                  <select
                    value={newRuleFrequency}
                    onChange={(e) => setNewRuleFrequency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    <option value="hourly">Hourly (24/7)</option>
                    <option value="every-6h">Every 6 Hours</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Keywords Filter (Comma Separated)</label>
                <input
                  type="text"
                  value={newRuleKeywords}
                  onChange={(e) => setNewRuleKeywords(e.target.value)}
                  placeholder="e.g. OLED, 4K, M3, Sony, Points"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="text-xs text-slate-300 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRuleAutoPublish}
                    onChange={(e) => setNewRuleAutoPublish(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-orange-500"
                  />
                  <span>Auto-publish directly to feed</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewRuleModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
                >
                  Save Automation Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New RSS Feed Modal */}
      {showNewFeedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100">
            <h3 className="font-bold text-base text-slate-100 mb-1 flex items-center gap-2">
              <Rss className="w-4 h-4 text-amber-400" />
              Configure New RSS Feed Source
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add external retail feeds, partner promos, or category discount scrapers.
            </p>

            <form onSubmit={handleCreateFeed} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Feed Name</label>
                <input
                  type="text"
                  value={newFeedName}
                  onChange={(e) => setNewFeedName(e.target.value)}
                  placeholder="e.g. Target Daily Clearance Radar"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">RSS / ATOM Feed URL</label>
                <input
                  type="url"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  placeholder="https://rss.store.com/deals.xml"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Associated Store</label>
                  <select
                    value={newFeedStore}
                    onChange={(e) => setNewFeedStore(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    <option value="Amazon">Amazon</option>
                    <option value="Walmart">Walmart</option>
                    <option value="BestBuy">BestBuy</option>
                    <option value="Target">Target</option>
                    <option value="eBay">eBay</option>
                    <option value="Chase">Chase</option>
                    <option value="Amex">Amex</option>
                    <option value="NordVPN">NordVPN</option>
                    <option value="Hostinger">Hostinger</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Target Category</label>
                  <select
                    value={newFeedCat}
                    onChange={(e) => setNewFeedCat(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Laptops & Tech">Laptops & Tech</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Credit Cards & Finance">Credit Cards</option>
                    <option value="Software & SaaS">Software & SaaS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Min Discount Filter %</label>
                  <input
                    type="number"
                    min="10"
                    max="90"
                    value={newFeedMinDiscount}
                    onChange={(e) => setNewFeedMinDiscount(parseInt(e.target.value) || 25)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Sync Schedule</label>
                  <select
                    value={newFeedFrequency}
                    onChange={(e) => setNewFeedFrequency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    <option value="hourly">Every 1 Hour</option>
                    <option value="every-6h">Every 6 Hours</option>
                    <option value="daily">Once Daily</option>
                    <option value="manual">Manual Only</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={newFeedAutoPublish}
                    onChange={(e) => setNewFeedAutoPublish(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Auto-publish directly to live feed (uncheck to review in Discovery Queue first)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewFeedModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
                >
                  Save RSS Feed Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Feed Deal Preview Modal */}
      {testFeedModalDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  Live RSS Parse Test: {testFeedModalDeal.feedName}
                </h3>
              </div>
              <button
                onClick={() => setTestFeedModalDeal(null)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
              <div className="flex gap-3 items-center mb-3">
                <img
                  src={testFeedModalDeal.deal.imageUrl}
                  alt={testFeedModalDeal.deal.title}
                  className="w-16 h-16 object-contain bg-slate-900 p-1 rounded-lg border border-slate-800 shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    {testFeedModalDeal.deal.store}
                  </span>
                  <h4 className="text-xs font-bold text-slate-200 mt-1 line-clamp-2">
                    {testFeedModalDeal.deal.title}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm font-black text-emerald-400">
                      ${testFeedModalDeal.deal.dealPrice.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-950 px-1.5 py-0.2 rounded">
                      {testFeedModalDeal.deal.discountPercentage}% OFF
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-500 break-all bg-slate-900/60 p-2 rounded border border-slate-800">
                <strong className="text-slate-400 font-sans block mb-0.5">Injected Affiliate Link:</strong>
                {testFeedModalDeal.deal.affiliateUrl}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setTestFeedModalDeal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
