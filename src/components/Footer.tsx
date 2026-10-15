import React from 'react';
import { Scale, FileText, Mail, Shield } from 'lucide-react';
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
  onOpenPwaModal: _onOpenPwaModal,
  onOpenLegal
}) => {
  return (
    <footer className="bg-black border-t border-white/[0.08] text-[#86868b] text-xs py-12 px-4 sm:px-6 lg:px-8 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto">
        
        {/* Apple Fine Print Disclosure */}
        <div className="pb-8 mb-8 border-b border-white/[0.06] text-[11px] leading-relaxed text-[#6e6e73] space-y-1.5">
          <p>
            1. Pricing and availability of listed products and services are accurate at the time of publication and subject to change by respective retailers.
          </p>
          <p>
            2. DealPulse earns qualifying commissions through affiliate referral links at zero additional cost to consumers.
          </p>
        </div>

        {/* Multi-Column Nav Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 text-[12px]">
          
          {/* Column 1: Brand & Intelligence */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-white/[0.08] border border-white/[0.12] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-[#f5f5f7]">DealPulse</span>
            </div>
            <p className="text-[#86868b] leading-relaxed text-[12px]">
              Engineered retail price intelligence platform. Curating price drops and hardware deals with zero ad clutter.
            </p>
            {isAdminAuthenticated && (
              <p className="text-[11px] text-[#2997ff] font-mono">
                Active Partner Tag: {affiliateConfig.amazonTag}
              </p>
            )}
          </div>

          {/* Column 2: Legal & Transparency */}
          <div>
            <h4 className="font-medium text-[#f5f5f7] text-xs uppercase tracking-wider mb-3">Legal & Trust</h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => onOpenLegal?.('ftc')}
                  className="text-[#86868b] hover:text-[#f5f5f7] transition-colors flex items-center gap-1.5 text-[12px]"
                >
                  <FileText className="w-3.5 h-3.5 text-[#86868b]" />
                  <span>FTC Affiliate Disclosure</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal?.('privacy')}
                  className="text-[#86868b] hover:text-[#f5f5f7] transition-colors flex items-center gap-1.5 text-[12px]"
                >
                  <Shield className="w-3.5 h-3.5 text-[#86868b]" />
                  <span>Privacy Policy (GDPR / CCPA)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal?.('terms')}
                  className="text-[#86868b] hover:text-[#f5f5f7] transition-colors flex items-center gap-1.5 text-[12px]"
                >
                  <Scale className="w-3.5 h-3.5 text-[#86868b]" />
                  <span>Terms of Service</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal?.('contact')}
                  className="text-[#86868b] hover:text-[#f5f5f7] transition-colors flex items-center gap-1.5 text-[12px]"
                >
                  <Mail className="w-3.5 h-3.5 text-[#86868b]" />
                  <span>Contact & Press</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Transparency */}
          <div>
            <h4 className="font-medium text-[#f5f5f7] text-xs uppercase tracking-wider mb-3">Shopper Promise</h4>
            <p className="text-[#86868b] leading-relaxed mb-3 text-[12px]">
              0% subscription fees. All price comparisons and deal feeds are 100% free for users, funded through verified retailer partnerships.
            </p>
            {isAdminAuthenticated && (
              <button
                onClick={onOpenSettings}
                className="text-[11px] text-[#2997ff] hover:underline transition-colors font-medium"
              >
                Configure Tracking Tags &rarr;
              </button>
            )}
          </div>

          {/* Column 4: Official Mobile Apps (App Store & Google Play) */}
          <div className="space-y-3">
            <h4 className="font-medium text-[#f5f5f7] text-xs uppercase tracking-wider mb-2">Get the App</h4>
            <p className="text-[#86868b] leading-relaxed mb-3 text-[12px]">
              Instant deal alerts on the go. Available for iPhone, iPad, and Android.
            </p>
            <div className="flex flex-col gap-2">
              {/* Apple App Store Badge */}
              <a
                href={affiliateConfig.appStoreUrl || 'https://apps.apple.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-white/20 rounded-xl px-3.5 py-2 transition-all group shadow-sm"
              >
                {/* SVG Apple Logo */}
                <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.07-7.7-7.9-12.02-14.48-6.19-9.5-11.03-20.47-14.52-32.93-3.49-12.45-5.23-24.16-5.23-35.13 0-14.62 3.65-26.69 10.96-36.21 7.3-9.52 16.5-14.39 27.6-14.61 5.38 0 11.28 1.48 17.69 4.44 6.42 2.96 10.59 4.5 12.51 4.62 1.69 0 6.07-1.63 13.15-4.88 7.07-3.26 13.41-4.72 19.01-4.38 14.5.76 25.4 6.35 32.71 16.78-12.98 7.84-19.34 18.52-19.09 32.06.26 10.52 4.28 19.34 12.06 26.47 7.78 7.12 16.99 11.12 27.63 12-2.17 6.42-4.81 12.87-7.92 19.34zM119.22 31.84c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 11.89-10.42 19.78-12.09.87 7.17-1.37 13.97-6.72 20.39-5.35 6.42-12.02 10.57-20.01 12.46-.22-.09-.55-.13-1-.09z"/>
                </svg>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase tracking-wider text-[#86868b] leading-tight font-medium">Download on the</span>
                  <span className="text-xs font-semibold text-[#f5f5f7] tracking-tight group-hover:text-white leading-tight">App Store</span>
                </div>
              </a>

              {/* Google Play Store Badge */}
              <a
                href={affiliateConfig.playStoreUrl || 'https://play.google.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-white/20 rounded-xl px-3.5 py-2 transition-all group shadow-sm"
              >
                {/* SVG Google Play Logo */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 512 512">
                  <path fill="#4285F4" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"/>
                  <path fill="#34A853" d="M47 0C34 7.5 25.1 21.3 25.1 38v436c0 16.7 8.9 30.5 21.9 38l242.4-242L47 0z"/>
                  <path fill="#EA4335" d="M325.3 277.7l60.1 60.1L104.6 499l220.7-221.3z"/>
                  <path fill="#FBBC04" d="M459.4 233.1L385.4 191l-60.1 60.1 60.1 60.1 74.2-42.3c15.8-9 25.6-21.7 25.6-35.8s-9.8-26.8-25.8-35.8z"/>
                </svg>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase tracking-wider text-[#86868b] leading-tight font-medium">GET IT ON</span>
                  <span className="text-xs font-semibold text-[#f5f5f7] tracking-tight group-hover:text-white leading-tight">Google Play</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Attribution & Copyright */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#86868b]">
          <p>
            Copyright &copy; {new Date().getFullYear()} DealPulse. Developed by <span className="text-[#f5f5f7] font-medium">FidlogicItsolutions</span>. All rights reserved.
          </p>
          <p className="text-[#6e6e73]">
            Cupertino-Grade Web Architecture
          </p>
        </div>

      </div>
    </footer>
  );
};
