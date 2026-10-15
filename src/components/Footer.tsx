import React from 'react';
import { Flame, ShieldCheck, DollarSign, Smartphone, Scale, FileText, Mail, Shield } from 'lucide-react';
import type { AffiliateConfig } from '../types';

interface FooterProps {
  affiliateConfig: AffiliateConfig;
  onOpenSettings: () => void;
  isAdminAuthenticated?: boolean;
  onOpenPwaModal?: () => void;
  onOpenLegal?: (type: 'privacy' | 'terms' | 'ftc' | 'contact') => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  affiliateConfig, 
  onOpenSettings, 
  isAdminAuthenticated = false,
  onOpenPwaModal,
  onOpenLegal
}) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        
        {/* Column 1: Brand & Model */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <span className="font-bold text-lg text-slate-100">DealPulse</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Automated deal aggregator and price comparison platform. Built with Apple HIG design principles — responsive across iOS, Android, and Web.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              {isAdminAuthenticated ? (
                <>Active Tag: <strong className="font-mono">{affiliateConfig.amazonTag}</strong></>
              ) : (
                'Verified Deals & Direct Best-Price Discounts'
              )}
            </span>
          </div>
        </div>

        {/* Column 2: Legal & Trust (Crucial for AdSense & Business Valuation) */}
        <div>
          <h4 className="font-bold text-slate-200 text-sm mb-3">Legal & Transparency</h4>
          <ul className="space-y-2 text-[11px]">
            <li>
              <button
                onClick={() => onOpenLegal?.('ftc')}
                className="text-slate-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>FTC Affiliate Disclosure</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenLegal?.('privacy')}
                className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Privacy Policy (GDPR / CCPA)</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenLegal?.('terms')}
                className="text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-1.5"
              >
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>Terms of Service</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenLegal?.('contact')}
                className="text-slate-400 hover:text-orange-300 transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-orange-400" />
                <span>Contact & Partnerships</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Transparency & Free Access */}
        <div>
          <h4 className="font-bold text-slate-200 text-sm mb-3">Consumer Promise</h4>
          <p className="text-slate-400 text-[11px] leading-relaxed mb-3">
            0% subscription fees. All savings and discounts are 100% free for users, funded through participating brand partnerships and non-intrusive banners.
          </p>
          {isAdminAuthenticated ? (
            <button
              onClick={onOpenSettings}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 font-semibold"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Configure Affiliate IDs
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Partner-supported at zero cost to shoppers.</span>
            </div>
          )}
        </div>

        {/* Column 4: PWA Native Apps */}
        <div>
          <h4 className="font-bold text-slate-200 text-sm mb-3">Cross-Platform (PWA)</h4>
          <p className="text-slate-400 text-[11px] leading-relaxed mb-3">
            Installable on iPhone (Safari Save to Home Screen) and Android Chrome for native app-like deal notifications.
          </p>
          <button
            onClick={onOpenPwaModal}
            className="flex items-center gap-2 text-xs text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 px-3 py-1.5 rounded-xl font-semibold transition-all group shadow"
          >
            <Smartphone className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>iOS & Android Ready &rarr;</span>
          </button>
        </div>
      </div>

      {/* Bottom Attribution & FTC Disclaimer Bar */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
        <p className="text-slate-500">
          Developed by <span className="font-semibold text-slate-300">FidlogicItsolutions</span>. All rights reserved.
        </p>
        <p className="text-slate-500 text-[10px] text-center sm:text-right">
          As an affiliate partner, DealPulse earns from qualifying purchases.
        </p>
      </div>
    </footer>
  );
};
