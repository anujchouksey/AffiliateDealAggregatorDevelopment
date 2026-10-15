import React from 'react';
import { Smartphone, Scale, FileText, Mail, Shield, ArrowUpRight } from 'lucide-react';
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

          {/* Column 4: Native App Experience (PWA) */}
          <div>
            <h4 className="font-medium text-[#f5f5f7] text-xs uppercase tracking-wider mb-3">Install App</h4>
            <p className="text-[#86868b] leading-relaxed mb-3 text-[12px]">
              Install DealPulse directly onto your iPhone or Mac Home Screen for zero-latency price notifications.
            </p>
            <button
              onClick={onOpenPwaModal}
              className="inline-flex items-center gap-1.5 text-[12px] text-[#f5f5f7] bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] px-3.5 py-1.5 rounded-full transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#2997ff]" />
              <span>iOS & Android PWA</span>
              <ArrowUpRight className="w-3 h-3 text-[#86868b]" />
            </button>
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
