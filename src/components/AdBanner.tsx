import React, { useEffect, useRef } from 'react';
import { DollarSign, Settings } from 'lucide-react';
import type { AdConfig } from '../types';

interface AdBannerProps {
  type: 'leaderboard' | 'in-feed' | 'sticky-bottom';
  adConfig: AdConfig;
  isAdminAuthenticated?: boolean;
  onOpenAdmin?: () => void;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  type,
  adConfig,
  isAdminAuthenticated = false,
  onOpenAdmin,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine active state and code for this slot
  const isEnabled = 
    type === 'leaderboard' ? adConfig.leaderboardEnabled :
    type === 'in-feed' ? adConfig.inFeedEnabled :
    adConfig.stickyBottomEnabled;

  const adCode = 
    type === 'leaderboard' ? adConfig.leaderboardCode :
    type === 'in-feed' ? adConfig.inFeedCode :
    adConfig.stickyBottomCode;

  // Execute injected ad scripts (e.g. Google AdSense adsbygoogle or Ezoic)
  useEffect(() => {
    if (!isEnabled || !containerRef.current || !adCode) return;

    containerRef.current.innerHTML = adCode;
    const scripts = containerRef.current.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [isEnabled, adCode]);

  // If slot is disabled by admin, render nothing
  if (!isEnabled) {
    return null;
  }

  // If admin has configured custom ad code, render the live ad container
  if (adCode) {
    if (type === 'sticky-bottom') {
      return (
        <div
          ref={containerRef}
          className={`fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 border-t border-slate-800 p-2 flex items-center justify-center shadow-2xl backdrop-blur-md ${className}`}
        />
      );
    }

    return (
      <div
        ref={containerRef}
        className={`w-full my-4 flex items-center justify-center overflow-hidden rounded-2xl bg-slate-950/60 border border-slate-800 p-2.5 ${className}`}
      />
    );
  }

  // If slot is enabled by admin but no code has been pasted yet:
  // ONLY show a setup prompt to the authenticated admin; hide completely from regular shoppers
  if (isAdminAuthenticated) {
    return (
      <div className={`w-full my-3 bg-purple-950/20 border border-dashed border-purple-500/40 rounded-2xl p-3.5 flex items-center justify-between text-xs text-purple-300 ${className}`}>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-purple-400" />
          <span>
            <strong>{type.toUpperCase()} Ad Placement Active</strong> (Paste your AdSense / Ezoic code snippet in Admin Studio)
          </span>
        </div>
        {onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
          >
            <Settings className="w-3 h-3" /> Configure Ad Code
          </button>
        )}
      </div>
    );
  }

  // For regular public visitors: do not show any placeholder
  return null;
};
