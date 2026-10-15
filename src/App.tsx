import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { DealCard } from './components/DealCard';
import { DealDetailModal } from './components/DealDetailModal';
import { AddDealModal } from './components/AddDealModal';
import { AutoCuratorModal } from './components/AutoCuratorModal';
import { AffiliateSettingsModal } from './components/AffiliateSettingsModal';
import { ShareModal } from './components/ShareModal';
import { AdBanner } from './components/AdBanner';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAuthModal } from './components/AdminAuthModal';
import { InstallPwaModal } from './components/InstallPwaModal';
import { TimedAdModal } from './components/TimedAdModal';
import { PriceHistoryModal } from './components/PriceHistoryModal';
import { LegalModal } from './components/LegalModals';
import { CookieBanner } from './components/CookieBanner';
import { INITIAL_DEALS } from './data/initialDeals';
import { INITIAL_RULES, INITIAL_SUGGESTIONS } from './data/initialAutomation';
import type { Deal, AffiliateConfig, AutomationRule, DealSuggestion, AdConfig } from './types';
import { getAffiliateConfig, convertToAffiliateUrl } from './utils/affiliate';
import { isAdminSessionValid, terminateAdminSession } from './utils/adminSecurity';
import { getAdConfig, saveAdConfig } from './utils/adConfig';
import { fetchLatestRSSDeals } from './services/dealFetcher';
import { requestNotificationPermission, isNotificationsEnabled, triggerDealPushNotification } from './services/notificationService';
import { Sparkles, Flame, Settings, ShieldCheck, Rss, Shield } from 'lucide-react';

export function App() {
  const [viewMode, setViewMode] = useState<'storefront' | 'admin'>('storefront');

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem('dealpulse_deals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_DEALS;
      }
    }
    return INITIAL_DEALS;
  });

  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(() => {
    const saved = localStorage.getItem('dealpulse_automation_rules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_RULES;
      }
    }
    return INITIAL_RULES;
  });

  const [suggestions, setSuggestions] = useState<DealSuggestion[]>(() => {
    const saved = localStorage.getItem('dealpulse_deal_suggestions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_SUGGESTIONS;
      }
    }
    return INITIAL_SUGGESTIONS;
  });

  const [affiliateConfig, setAffiliateConfig] = useState<AffiliateConfig>(getAffiliateConfig());
  const [selectedCategory, setSelectedCategory] = useState<string>('All Deals');
  const [selectedStore, setSelectedStore] = useState<string>('All Stores');
  const [sortBy, setSortBy] = useState<'popular' | 'discount' | 'newest' | 'price'>('popular');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savedOnly, setSavedOnly] = useState<boolean>(false);
  const [showAds, setShowAds] = useState<boolean>(true);
  const [isSyncingRSS, setIsSyncingRSS] = useState<boolean>(false);
  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(isNotificationsEnabled());

  // Single Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => isAdminSessionValid());
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Modals state
  const [activeDetailDeal, setActiveDetailDeal] = useState<Deal | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showAutoCuratorModal, setShowAutoCuratorModal] = useState<boolean>(false);
  const [showAffiliateSettingsModal, setShowAffiliateSettingsModal] = useState<boolean>(false);
  const [activeShareDeal, setActiveShareDeal] = useState<Deal | null>(null);
  const [showPwaModal, setShowPwaModal] = useState<boolean>(false);
  const [activePriceHistoryDeal, setActivePriceHistoryDeal] = useState<Deal | null>(null);
  const [activeLegalType, setActiveLegalType] = useState<'privacy' | 'terms' | 'ftc' | 'contact' | null>(null);

  // Ad Monetization & Timed Popup State (Admin Controlled)
  const [adConfig, setAdConfig] = useState<AdConfig>(() => getAdConfig());
  const [showTimedPopup, setShowTimedPopup] = useState<boolean>(false);

  const handleOpenAdminTrigger = () => {
    if (isAdminAuthenticated) {
      setViewMode('admin');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogoutAdmin = () => {
    terminateAdminSession();
    setIsAdminAuthenticated(false);
    setViewMode('storefront');
    if (window.location.hash || window.location.search) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    setShowAuthModal(false);
    setViewMode('admin');
  };

  const handleOpenAffiliateSettingsTrigger = () => {
    if (isAdminAuthenticated) {
      setShowAffiliateSettingsModal(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleOpenAddDealTrigger = () => {
    if (isAdminAuthenticated) {
      setShowAddModal(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleOpenAutoCuratorTrigger = () => {
    if (isAdminAuthenticated) {
      setShowAutoCuratorModal(true);
    } else {
      setShowAuthModal(true);
    }
  };

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('dealpulse_deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('dealpulse_automation_rules', JSON.stringify(automationRules));
  }, [automationRules]);

  useEffect(() => {
    localStorage.setItem('dealpulse_deal_suggestions', JSON.stringify(suggestions));
  }, [suggestions]);

  // Secret Typed Access Listener:
  // Hidden from the real world. Only opens when owner types into browser address bar:
  // e.g., /#admin, /#/admin, /#owner, /?admin, /admin, or types 'admin' on keyboard!
  useEffect(() => {
    const handleCheckSecretTypedRoute = () => {
      const hash = (window.location.hash || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();
      const pathname = (window.location.pathname || '').toLowerCase();

      const isSecretAdminTyped =
        hash === '#admin' ||
        hash === '#/admin' ||
        hash === '#owner' ||
        hash === '#/owner' ||
        hash === '#portal' ||
        search.includes('admin') ||
        search.includes('owner') ||
        pathname.endsWith('/admin') ||
        pathname.endsWith('/owner');

      if (isSecretAdminTyped) {
        if (isAdminSessionValid()) {
          setIsAdminAuthenticated(true);
          setViewMode('admin');
        } else {
          setShowAuthModal(true);
        }
      }
    };

    handleCheckSecretTypedRoute();
    window.addEventListener('hashchange', handleCheckSecretTypedRoute);
    window.addEventListener('popstate', handleCheckSecretTypedRoute);

    // Stealth Keystroke Buffer: If owner types "admin" anywhere on the keyboard
    let keyBuffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Alt+A or Cmd+Shift+A secret combo
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.metaKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        handleOpenAdminTrigger();
        return;
      }

      keyBuffer += e.key.toLowerCase();
      if (keyBuffer.length > 10) {
        keyBuffer = keyBuffer.slice(-10);
      }
      if (keyBuffer.endsWith('admin') || keyBuffer.endsWith('owner')) {
        handleOpenAdminTrigger();
        keyBuffer = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleCheckSecretTypedRoute);
      window.removeEventListener('popstate', handleCheckSecretTypedRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAdminAuthenticated]);

  // Timed 5-Minute Interstitial Popup Ad Trigger (Only fires once per session)
  useEffect(() => {
    if (!adConfig.popupEnabled) return;

    const delayMs = (adConfig.popupDelayMinutes || 5) * 60 * 1000;
    const timer = setTimeout(() => {
      const alreadyShown = sessionStorage.getItem('dealpulse_timed_ad_shown');
      if (!alreadyShown) {
        setShowTimedPopup(true);
        sessionStorage.setItem('dealpulse_timed_ad_shown', 'true');
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [adConfig.popupEnabled, adConfig.popupDelayMinutes]);

  // Push notification toggle handler
  const handleToggleNotifications = async () => {
    if (!isPushEnabled) {
      const granted = await requestNotificationPermission();
      setIsPushEnabled(granted);
    } else {
      localStorage.setItem('dealpulse_notifications_enabled', 'false');
      setIsPushEnabled(false);
    }
  };

  // RSS Feed Fetcher handler
  const handleFetchRSS = async () => {
    setIsSyncingRSS(true);
    try {
      const rssDeals = await fetchLatestRSSDeals();
      setDeals((prev) => {
        const existingIds = new Set(prev.map((d) => d.id));
        const uniqueNew = rssDeals.filter((d) => !existingIds.has(d.id));
        if (uniqueNew.length > 0 && uniqueNew[0]) {
          triggerDealPushNotification(uniqueNew[0]);
        }
        return [...uniqueNew, ...prev];
      });
    } catch (err) {
      console.error('Failed to sync RSS deals', err);
    } finally {
      setTimeout(() => setIsSyncingRSS(false), 800);
    }
  };

  // Update affiliate URLs dynamically if user updates affiliate config
  const handleAffiliateConfigSave = (newConfig: AffiliateConfig) => {
    setAffiliateConfig(newConfig);
    setDeals((prevDeals) =>
      prevDeals.map((d) => {
        const { affiliateUrl } = convertToAffiliateUrl(d.rawUrl, newConfig);
        return { ...d, affiliateUrl };
      })
    );
  };

  // Voting handler
  const handleVote = (id: string, type: 'up' | 'down') => {
    setDeals((prevDeals) =>
      prevDeals.map((d) => {
        if (d.id !== id) return d;

        let upvotes = d.upvotes;
        let downvotes = d.downvotes;
        let userVoted: 'up' | 'down' | null = type;

        if (d.userVoted === type) {
          userVoted = null;
          if (type === 'up') upvotes -= 1;
          if (type === 'down') downvotes -= 1;
        } else {
          if (d.userVoted === 'up') upvotes -= 1;
          if (d.userVoted === 'down') downvotes -= 1;

          if (type === 'up') upvotes += 1;
          if (type === 'down') downvotes += 1;
        }

        const isFireDeal = upvotes - downvotes >= 300 || d.discountPercentage >= 35;
        const updated = { ...d, upvotes, downvotes, userVoted, isFireDeal };

        if (activeDetailDeal && activeDetailDeal.id === id) {
          setActiveDetailDeal(updated);
        }

        return updated;
      })
    );
  };

  // Save / Bookmark handler
  const handleToggleSave = (id: string) => {
    setDeals((prevDeals) =>
      prevDeals.map((d) => {
        if (d.id !== id) return d;
        const updated = { ...d, isSaved: !d.isSaved };
        if (activeDetailDeal && activeDetailDeal.id === id) {
          setActiveDetailDeal(updated);
        }
        return updated;
      })
    );
  };

  // Add manually posted deal
  const handleAddDeal = (newDeal: Deal) => {
    setDeals([newDeal, ...deals]);
    triggerDealPushNotification(newDeal);
  };

  // Delete / unpublish a deal
  const handleDeleteDeal = (id: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== id));
  };

  // Toggle Fire Deal status
  const handleToggleFireDeal = (id: string) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isFireDeal: !d.isFireDeal } : d))
    );
  };

  // Auto-curated deals published
  const handleDealsGenerated = (newDeals: Deal[]) => {
    setDeals([...newDeals, ...deals]);
    if (newDeals.length > 0 && newDeals[0]) {
      triggerDealPushNotification(newDeals[0]);
    }
  };

  // Filter & Sort Logic
  const filteredDeals = deals.filter((d) => {
    if (savedOnly && !d.isSaved) return false;
    if (selectedCategory !== 'All Deals' && d.category !== selectedCategory) return false;
    if (selectedStore !== 'All Stores' && d.store !== selectedStore) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = d.title.toLowerCase().includes(q);
      const matchDesc = d.description.toLowerCase().includes(q);
      const matchStore = d.store.toLowerCase().includes(q);
      const matchCat = d.category.toLowerCase().includes(q);
      const matchCoupon = d.couponCode?.toLowerCase().includes(q);
      const matchBonus = d.bonusOffer?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchStore && !matchCat && !matchCoupon && !matchBonus) return false;
    }

    return true;
  });

  // Sort filtered deals
  const sortedDeals = [...filteredDeals].sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    }
    if (sortBy === 'discount') {
      return b.discountPercentage - a.discountPercentage;
    }
    if (sortBy === 'price') {
      return a.dealPrice - b.dealPrice;
    }
    return 0;
  });

  const savedCount = deals.filter((d) => d.isSaved).length;
  const pendingSuggestionsCount = suggestions.filter((s) => s.status === 'pending').length;

  // If in Admin Mode, show the Admin Dashboard
  if (viewMode === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-slate-950">
        <AdminDashboard
          deals={deals}
          onAddDeal={handleAddDeal}
          onDeleteDeal={handleDeleteDeal}
          onToggleFireDeal={handleToggleFireDeal}
          affiliateConfig={affiliateConfig}
          onOpenAffiliateSettings={() => setShowAffiliateSettingsModal(true)}
          onBackToStorefront={() => {
            setViewMode('storefront');
            if (window.location.hash || window.location.search) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
          automationRules={automationRules}
          onUpdateRules={setAutomationRules}
          suggestions={suggestions}
          onUpdateSuggestions={setSuggestions}
          onLogoutAdmin={handleLogoutAdmin}
          adConfig={adConfig}
          onUpdateAdConfig={(newConfig) => {
            setAdConfig(newConfig);
            saveAdConfig(newConfig);
          }}
          onTriggerTestPopup={() => setShowTimedPopup(true)}
        />

        {showAffiliateSettingsModal && (
          <AffiliateSettingsModal
            onClose={() => setShowAffiliateSettingsModal(false)}
            onSave={handleAffiliateConfigSave}
          />
        )}
      </div>
    );
  }

  // Otherwise, render Storefront View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-slate-950">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddDeal={handleOpenAddDealTrigger}
        onOpenAutoCurator={handleOpenAutoCuratorTrigger}
        onFetchRSS={handleFetchRSS}
        isSyncingRSS={isSyncingRSS}
        onToggleNotifications={handleToggleNotifications}
        isPushEnabled={isPushEnabled}
        onOpenAffiliateSettings={handleOpenAffiliateSettingsTrigger}
        onSelectSavedOnly={() => setSavedOnly(!savedOnly)}
        savedOnly={savedOnly}
        savedCount={savedCount}
        showAds={showAds}
        onToggleAds={() => setShowAds(!showAds)}
        affiliateConfig={affiliateConfig}
        onOpenAdmin={handleOpenAdminTrigger}
        pendingSuggestionsCount={pendingSuggestionsCount}
        isAdminAuthenticated={isAdminAuthenticated}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* Category Nav & Filters */}
      <CategoryNav
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSavedOnly(false);
        }}
        sortBy={sortBy}
        onSortChange={setSortBy}
        selectedStore={selectedStore}
        onSelectStore={setSelectedStore}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Leaderboard Ad Slot (Admin controlled) */}
        <AdBanner
          type="leaderboard"
          adConfig={adConfig}
          isAdminAuthenticated={isAdminAuthenticated}
          onOpenAdmin={handleOpenAdminTrigger}
        />

        {/* Hero Alert Banner */}
        <div className="mb-6 bg-gradient-to-r from-orange-950/60 via-slate-900 to-amber-950/60 border border-orange-500/30 rounded-2xl p-4 md:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6 text-orange-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-extrabold text-slate-100 flex items-center gap-2">
                Top Trending Deals & Daily Price Drops
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Verified Best Prices
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAdminAuthenticated ? (
                  <>Active Commission Tracking: <span className="text-amber-300 font-mono">{affiliateConfig.amazonTag}</span>. All deals generating revenue.</>
                ) : (
                  'Real-time price drops from top retailers, financial rewards & software deals curated daily.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
            {isAdminAuthenticated && (
              <>
                <button
                  onClick={() => setViewMode('admin')}
                  className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Shield className="w-4 h-4 text-purple-200" /> Admin Studio
                  {pendingSuggestionsCount > 0 && (
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {pendingSuggestionsCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setShowAutoCuratorModal(true)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 shadow-md transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" /> Auto-Curate
                </button>
                <button
                  onClick={() => setShowAffiliateSettingsModal(true)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </>
            )}
            <button
              onClick={handleFetchRSS}
              disabled={isSyncingRSS}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 shadow-md transition-all flex items-center gap-1.5"
            >
              <Rss className={`w-4 h-4 text-orange-400 ${isSyncingRSS ? 'animate-spin' : ''}`} />
              <span>{isSyncingRSS ? 'Syncing...' : 'Fetch RSS'}</span>
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between mb-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">{sortedDeals.length} Deals & Offers</span>
            {selectedCategory !== 'All Deals' && (
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[11px]">Category: {selectedCategory}</span>
            )}
            {savedOnly && (
              <span className="bg-amber-950 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[11px]">Saved Bookmarks</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
            <ShieldCheck className="w-4 h-4" /> 100% Affiliate Link Ready
          </div>
        </div>

        {/* Empty State */}
        {sortedDeals.length === 0 && (
          <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-8 max-w-md mx-auto my-8">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Flame className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-200 mb-1">No deals match your filter</h3>
            <p className="text-xs text-slate-400 mb-6">Try clearing search terms or run the Auto-Curator to generate hot deals.</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Deals');
                  setSelectedStore('All Stores');
                  setSavedOnly(false);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => setShowAutoCuratorModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Auto-Generate
              </button>
            </div>
          </div>
        )}

        {/* Deals Feed Grid with Dynamic Native In-Feed Ads */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sortedDeals.map((deal, idx) => (
            <React.Fragment key={deal.id}>
              <DealCard
                deal={deal}
                onSelectDeal={setActiveDetailDeal}
                onVote={handleVote}
                onToggleSave={handleToggleSave}
                onOpenShare={setActiveShareDeal}
                onOpenPriceHistory={setActivePriceHistoryDeal}
              />
              {/* Insert In-Feed Native Ad based on admin frequency */}
              {adConfig.inFeedEnabled && (idx + 1) % (adConfig.inFeedFrequency || 6) === 0 && (
                <AdBanner
                  type="in-feed"
                  adConfig={adConfig}
                  isAdminAuthenticated={isAdminAuthenticated}
                  onOpenAdmin={handleOpenAdminTrigger}
                  className="sm:col-span-2 xl:col-span-1"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </main>

      {/* Footer */}
      <Footer
        affiliateConfig={affiliateConfig}
        onOpenSettings={handleOpenAffiliateSettingsTrigger}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenPwaModal={() => setShowPwaModal(true)}
        onOpenLegal={setActiveLegalType}
      />

      {/* Sticky Mobile Bottom Ad if enabled by admin */}
      <AdBanner
        type="sticky-bottom"
        adConfig={adConfig}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAdmin={handleOpenAdminTrigger}
        className="md:hidden"
      />

      {/* Modals Layer */}
      {activeDetailDeal && (
        <DealDetailModal
          deal={activeDetailDeal}
          onClose={() => setActiveDetailDeal(null)}
          onVote={handleVote}
          onToggleSave={handleToggleSave}
          onOpenShare={setActiveShareDeal}
        />
      )}

      {showAddModal && (
        <AddDealModal
          onClose={() => setShowAddModal(false)}
          onAddDeal={handleAddDeal}
        />
      )}

      {showAutoCuratorModal && (
        <AutoCuratorModal
          onClose={() => setShowAutoCuratorModal(false)}
          onDealsGenerated={handleDealsGenerated}
        />
      )}

      {showAffiliateSettingsModal && (
        <AffiliateSettingsModal
          onClose={() => setShowAffiliateSettingsModal(false)}
          onSave={handleAffiliateConfigSave}
        />
      )}

      {activeShareDeal && (
        <ShareModal
          deal={activeShareDeal}
          onClose={() => setActiveShareDeal(null)}
        />
      )}

      {showAuthModal && (
        <AdminAuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAdminAuthSuccess}
        />
      )}

      {showPwaModal && (
        <InstallPwaModal
          onClose={() => setShowPwaModal(false)}
          sampleDeal={deals[0]}
        />
      )}

      {/* 5-Minute Timed Popup Interstitial Ad (Admin controlled) */}
      <TimedAdModal
        isOpen={showTimedPopup}
        onClose={() => setShowTimedPopup(false)}
        adConfig={adConfig}
        featuredDeal={deals[0]}
      />

      {/* Interactive Price History Modal (CamelCamelCamel / Apple HIG style) */}
      {activePriceHistoryDeal && (
        <PriceHistoryModal
          deal={activePriceHistoryDeal}
          onClose={() => setActivePriceHistoryDeal(null)}
          onSelectDealDetails={(deal) => {
            setActivePriceHistoryDeal(null);
            setActiveDetailDeal(deal);
          }}
        />
      )}

      {/* Floating Cookie & Privacy Consent Banner */}
      <CookieBanner onOpenPrivacy={() => setActiveLegalType('privacy')} />

      {/* Comprehensive Legal & Compliance Modals (FTC, Privacy, Terms, Contact) */}
      <LegalModal
        type={activeLegalType}
        onClose={() => setActiveLegalType(null)}
      />
    </div>
  );
}
