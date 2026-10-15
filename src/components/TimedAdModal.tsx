import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles, ExternalLink, ShieldCheck, Flame } from 'lucide-react';
import type { AdConfig, Deal } from '../types';

interface TimedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  adConfig: AdConfig;
  featuredDeal?: Deal;
}

export const TimedAdModal: React.FC<TimedAdModalProps> = ({
  isOpen,
  onClose,
  adConfig,
  featuredDeal
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const [canDismiss, setCanDismiss] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    // 5-second dismiss countdown timer for premium HIG feel
    setCountdown(5);
    setCanDismiss(false);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanDismiss(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Execute injected ad scripts if custom snippet is configured
  useEffect(() => {
    if (!isOpen || !containerRef.current || !adConfig.popupCode) return;

    containerRef.current.innerHTML = adConfig.popupCode;
    const scripts = containerRef.current.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [isOpen, adConfig.popupCode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Dismiss Button */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Special Featured Spotlight
            </span>
          </div>

          <button
            onClick={onClose}
            className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
              canDismiss
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-slate-950 text-slate-500 cursor-not-allowed border border-slate-800'
            }`}
            disabled={!canDismiss}
          >
            {canDismiss ? (
              <>
                <span>Close</span>
                <X className="w-3.5 h-3.5" />
              </>
            ) : (
              <span>Skip in {countdown}s</span>
            )}
          </button>
        </div>

        {/* Ad Container */}
        {adConfig.popupCode ? (
          <div
            ref={containerRef}
            className="my-3 min-h-[250px] flex items-center justify-center bg-slate-950 rounded-2xl p-4 border border-slate-800 text-center"
          />
        ) : (
          /* Default High-Converting Premium Affiliate Sponsor if no custom ad script pasted */
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 rounded-2xl p-5 border border-indigo-500/20 my-2">
            {featuredDeal ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950 px-2 py-0.5 rounded border border-indigo-500/30">
                    {featuredDeal.category}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-400 fill-current" /> Save ${ (featuredDeal.originalPrice - featuredDeal.dealPrice).toFixed(0) }
                  </span>
                </div>

                <div className="flex gap-4 items-center">
                  <img
                    src={featuredDeal.imageUrl}
                    alt={featuredDeal.title}
                    className="w-24 h-24 object-cover rounded-xl border border-slate-700 shrink-0"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-100 line-clamp-2 leading-snug">
                      {featuredDeal.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {featuredDeal.description}
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-lg font-black text-emerald-400">
                        ${featuredDeal.dealPrice.toFixed(2)}
                      </span>
                      {featuredDeal.originalPrice > featuredDeal.dealPrice && (
                        <span className="text-xs text-slate-500 line-through">
                          ${featuredDeal.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Direct verified partner link
                  </span>
                  <a
                    href={featuredDeal.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
                  >
                    <span>Claim Deal Now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-3xl block mb-2">🎁</span>
                <h3 className="font-bold text-base text-slate-100">Exclusive Flash Discount</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Unlock up to 70% off with exclusive verified promo codes updated hourly.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
          <span>Sponsored Recommendation</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 underline"
          >
            Continue browsing deals &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
