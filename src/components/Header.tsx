import React from 'react';
import { Search, Bookmark, Rss, Bell, ShieldCheck, Lock, X } from 'lucide-react';
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
  onOpenAddDeal: _onOpenAddDeal,
  onOpenAutoCurator: _onOpenAutoCurator,
  onFetchRSS,
  isSyncingRSS,
  onToggleNotifications,
  isPushEnabled,
  onOpenAffiliateSettings: _onOpenAffiliateSettings,
  onSelectSavedOnly,
  savedOnly,
  savedCount,
  onOpenAdmin,
  pendingSuggestionsCount,
  isAdminAuthenticated,
  onLogoutAdmin
}) => {
  return (
    <header className="sticky top-0 z-40 bg-black/75 backdrop-blur-2xl border-b border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between gap-4">
        
        {/* Apple Typographic Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 text-left group transition-opacity hover:opacity-85"
          >
            <div className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-white font-semibold text-xs shadow-inner">
              <span className="w-2 h-2 rounded-full bg-[#0071e3] group-hover:scale-125 transition-transform" />
            </div>
            <div>
              <span className="text-[17px] font-semibold tracking-tight text-[#f5f5f7]">
                Deal<span className="text-[#86868b] font-normal">Pulse</span>
              </span>
            </div>
          </button>

          {isAdminAuthenticated && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-[#2997ff] bg-[#0071e3]/10 border border-[#0071e3]/20 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2997ff] animate-pulse" />
              Admin
            </span>
          )}
        </div>

        {/* Spotlight-Style Search Pill */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative group">
            <Search className="w-4 h-4 text-[#86868b] group-focus-within:text-white absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products, brands, models..."
              className="w-full bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] border border-transparent focus:border-white/20 text-[#f5f5f7] placeholder-[#86868b] text-[13px] rounded-full pl-9 pr-8 py-2 outline-none transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-white p-1 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Saved Bookmarks Pill */}
          <button
            onClick={onSelectSavedOnly}
            className={`h-9 px-3.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${
              savedOnly
                ? 'bg-white text-black border-white shadow-sm font-semibold'
                : 'bg-white/[0.06] hover:bg-white/[0.1] text-[#86868b] hover:text-[#f5f5f7] border-transparent'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${savedOnly ? 'fill-black' : ''}`} />
            <span className="hidden sm:inline">Saved</span>
            {savedCount > 0 && (
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${savedOnly ? 'bg-black/10 text-black' : 'bg-white/10 text-[#f5f5f7]'}`}>
                {savedCount}
              </span>
            )}
          </button>

          {/* RSS Feed Sync Pill */}
          <button
            onClick={onFetchRSS}
            disabled={isSyncingRSS}
            className="h-9 px-3 rounded-full text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] text-[#86868b] hover:text-[#f5f5f7] border border-transparent transition-all flex items-center gap-1.5 disabled:opacity-50"
            title="Sync Latest Retailer Feeds"
          >
            <Rss className={`w-3.5 h-3.5 text-[#2997ff] ${isSyncingRSS ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{isSyncingRSS ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* Push Notifications Pill */}
          <button
            onClick={onToggleNotifications}
            className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all ${
              isPushEnabled
                ? 'bg-[#30d158]/10 text-[#30d158] border-[#30d158]/20'
                : 'bg-white/[0.06] hover:bg-white/[0.1] text-[#86868b] hover:text-[#f5f5f7] border-transparent'
            }`}
            title={isPushEnabled ? 'Notifications enabled' : 'Enable deal notifications'}
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          {/* Admin Mode Controls */}
          {isAdminAuthenticated ? (
            <div className="flex items-center gap-1.5 pl-1 border-l border-white/10">
              <button
                onClick={onOpenAdmin}
                className="h-9 px-3.5 rounded-full text-xs font-medium bg-[#0071e3] hover:bg-[#0077ed] text-white transition-all flex items-center gap-1.5 shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Studio</span>
                {pendingSuggestionsCount > 0 && (
                  <span className="bg-white text-[#0071e3] text-[10px] font-bold px-1.5 rounded-full">
                    {pendingSuggestionsCount}
                  </span>
                )}
              </button>
              <button
                onClick={onLogoutAdmin}
                className="h-9 w-9 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-[#86868b] hover:text-white flex items-center justify-center transition-colors text-xs"
                title="Exit Admin Mode"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Discrete, invisible-feeling admin trigger */
            <button
              onClick={onOpenAdmin}
              className="w-4 h-9 opacity-0 hover:opacity-20 transition-opacity cursor-default"
              title="Portal"
              tabIndex={-1}
            />
          )}
        </div>
      </div>
    </header>
  );
};
