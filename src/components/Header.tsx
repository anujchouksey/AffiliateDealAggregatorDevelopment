import React from 'react';
import { Flame, Search, PlusCircle, Sparkles, Settings, Bookmark, DollarSign, Rss, Bell, BellRing, ShieldCheck, Lock, Unlock } from 'lucide-react';
import type { AffiliateConfig } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddDeal: () => void;
  onOpenAutoCurator: () => void;
  onFetchRSS: () => void;
  isSyncingRSS: boolean;
  onToggleNotifications: () => void;
  isPushEnabled: boolean;
  onOpenAffiliateSettings: () => void;
  onSelectSavedOnly: () => void;
  savedOnly: boolean;
  savedCount: number;
  showAds: boolean;
  onToggleAds: () => void;
  affiliateConfig: AffiliateConfig;
  onOpenAdmin: () => void;
  pendingSuggestionsCount: number;
  isAdminAuthenticated: boolean;
  onLogoutAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAddDeal,
  onOpenAutoCurator,
  onFetchRSS,
  isSyncingRSS,
  onToggleNotifications,
  isPushEnabled,
  onOpenAffiliateSettings,
  onSelectSavedOnly,
  savedOnly,
  savedCount,
  showAds,
  onToggleAds,
  affiliateConfig,
  onOpenAdmin,
  pendingSuggestionsCount,
  isAdminAuthenticated,
  onLogoutAdmin
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.location.reload()}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Flame className="w-6 h-6 fill-slate-950 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-slate-100 font-sans">
                    Deal<span className="text-orange-500">Pulse</span>
                  </h1>
                  <span className="text-[10px] font-extrabold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/40 px-2 py-0.5 rounded-full">
                    {isAdminAuthenticated ? 'Admin Active' : 'Hot Deals'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  {isAdminAuthenticated ? (
                    <>Curated Hot Deals &bull; Active Tag: <span className="text-amber-400 font-mono">{affiliateConfig.amazonTag}</span></>
                  ) : (
                    'Curated Best-Seller Discounts & Price Drops Daily'
                  )}
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={onOpenAdmin}
                className={`p-2 rounded-xl font-bold text-xs flex items-center gap-1 ${
                  isAdminAuthenticated ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}
                title="Admin Studio"
              >
                {isAdminAuthenticated ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4 text-purple-400" />}
                {isAdminAuthenticated && pendingSuggestionsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>
              {isAdminAuthenticated && (
                <button
                  onClick={onOpenAddDeal}
                  className="p-2 bg-orange-500 text-slate-950 rounded-xl font-bold text-xs"
                  title="Post Deal"
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search deals (e.g. Chase Sapphire, NordVPN, Sony, PS5...)"
                className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 text-slate-200 text-xs md:text-sm rounded-2xl pl-10 pr-4 py-2.5 outline-none transition-colors shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Admin Portal Button (Hidden from real world unless authenticated) */}
            {isAdminAuthenticated && (
              <button
                onClick={onOpenAdmin}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-lg transition-all flex items-center gap-1.5 border border-purple-400/30 group"
                title="Open Admin Automation Studio"
              >
                <ShieldCheck className="w-4 h-4 text-purple-200 group-hover:rotate-12 transition-transform" />
                <span>Admin Studio</span>
                {pendingSuggestionsCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse ml-0.5">
                    {pendingSuggestionsCount}
                  </span>
                )}
              </button>
            )}

            {/* Push Notifications Toggle button */}
            <button
              onClick={onToggleNotifications}
              className={`text-xs px-3 py-2 rounded-xl font-bold border transition-colors flex items-center gap-1.5 ${
                isPushEnabled
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
              title={isPushEnabled ? 'Deal Drop Push Alerts Active' : 'Enable Web Push Alerts'}
            >
              {isPushEnabled ? (
                <BellRing className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
              ) : (
                <Bell className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="hidden xl:inline">{isPushEnabled ? 'Alerts ON' : 'Enable Push Alerts'}</span>
            </button>

            {/* RSS Feed Sync button */}
            <button
              onClick={onFetchRSS}
              disabled={isSyncingRSS}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs px-3 py-2 rounded-xl shadow transition-all flex items-center gap-1.5"
              title="Sync latest deals via RSS Feeds"
            >
              <Rss className={`w-3.5 h-3.5 text-orange-400 ${isSyncingRSS ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">{isSyncingRSS ? 'Syncing...' : 'RSS Deals'}</span>
            </button>

            {/* Admin-only buttons: Auto-Curator, Post Deal, Affiliate Settings */}
            {isAdminAuthenticated && (
              <>
                <button
                  onClick={onOpenAutoCurator}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-700 shadow transition-all flex items-center gap-1.5"
                  title="Auto Generate Best Selling Category Deals"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="hidden sm:inline">Auto-Curator</span>
                </button>

                <button
                  onClick={onOpenAddDeal}
                  className="bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Deal</span>
                </button>

                <button
                  onClick={onOpenAffiliateSettings}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
                  title="Edit Affiliate Tags"
                >
                  <Settings className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  onClick={onLogoutAdmin}
                  className="p-2 bg-slate-900 hover:bg-rose-950/80 text-rose-400 rounded-xl border border-slate-800 transition-colors"
                  title="Lock Admin Session"
                >
                  <Unlock className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Saved Deals Button */}
            <button
              onClick={onSelectSavedOnly}
              className={`text-xs px-3 py-2 rounded-xl font-bold border transition-colors flex items-center gap-1.5 ${
                savedOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({savedCount})</span>
            </button>

            {/* Toggle Monetization Ads */}
            <button
              onClick={onToggleAds}
              className={`p-2 rounded-xl border transition-colors ${
                showAds
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
              title="Toggle Ad Placement Slots"
            >
              <DollarSign className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
