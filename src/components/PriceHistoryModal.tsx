import React from 'react';
import { X, ArrowUpRight } from 'lucide-react';
import type { Deal } from '../types';
import { PriceHistoryChart } from './PriceHistoryChart';

interface PriceHistoryModalProps {
  deal: Deal;
  onClose: () => void;
  onSelectDealDetails?: (deal: Deal) => void;
}

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
  deal,
  onClose,
  onSelectDealDetails
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-[#1c1c1e] border border-white/[0.12] rounded-[28px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative text-[#f5f5f7] animate-in zoom-in-95 duration-200">
        {/* Apple Discrete Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[#86868b] hover:text-white flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product Snapshot Header */}
        <div className="flex gap-4 items-center mb-6 border-b border-white/[0.06] pb-5">
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className="w-16 h-16 object-contain bg-[#0d0d0f] p-2 rounded-[16px] border border-white/[0.06] shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-medium text-[#30d158] bg-[#30d158]/12 border border-[#30d158]/25 px-2 py-0.5 rounded-full">
                -{deal.discountPercentage}% Verified Drop
              </span>
              <span className="text-[10px] text-[#86868b] bg-white/[0.05] px-2 py-0.5 rounded-full">
                {deal.store}
              </span>
            </div>

            <h2 className="font-medium text-sm md:text-base text-[#f5f5f7] line-clamp-2 leading-snug">
              {deal.title}
            </h2>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-semibold text-[#f5f5f7]">
                ${deal.dealPrice.toFixed(2)}
              </span>
              {deal.originalPrice > deal.dealPrice && (
                <span className="text-xs text-[#86868b] line-through font-normal">
                  ${deal.originalPrice.toFixed(2)}
                </span>
              )}
              {deal.originalPrice > deal.dealPrice && (
                <span className="text-[11px] font-medium text-[#30d158] ml-auto">
                  Save ${(deal.originalPrice - deal.dealPrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* The Interactive Chart */}
        <PriceHistoryChart deal={deal} />

        {/* Footer CTAs */}
        <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
          {onSelectDealDetails ? (
            <button
              onClick={() => {
                onClose();
                onSelectDealDetails(deal);
              }}
              className="text-xs text-[#86868b] hover:text-[#f5f5f7] font-medium transition-colors"
            >
              Full Deal Specifications &rarr;
            </button>
          ) : (
            <div />
          )}

          <a
            href={deal.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium px-4 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>View at {deal.store}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
