import React from 'react';
import { X, ExternalLink, Flame } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative text-slate-100 animate-in zoom-in-95 duration-200">
        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Snapshot Header */}
        <div className="flex gap-4 items-center mb-6 border-b border-slate-800 pb-5">
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className="w-20 h-20 object-contain bg-slate-950 p-2 rounded-2xl border border-slate-800 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3 fill-current" /> Verified Deal
              </span>
              <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {deal.store}
              </span>
              <span className="text-[10px] text-slate-400">
                {deal.postedAt}
              </span>
            </div>

            <h2 className="font-extrabold text-base text-slate-100 line-clamp-2 leading-snug">
              {deal.title}
            </h2>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-emerald-400">
                ${deal.dealPrice.toFixed(2)}
              </span>
              {deal.originalPrice > deal.dealPrice && (
                <span className="text-xs text-slate-500 line-through">
                  ${deal.originalPrice.toFixed(2)}
                </span>
              )}
              {deal.originalPrice > deal.dealPrice && (
                <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                  Save ${(deal.originalPrice - deal.dealPrice).toFixed(2)} ({deal.discountPercentage}% OFF)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* The Interactive Chart */}
        <PriceHistoryChart deal={deal} />

        {/* Action Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          {onSelectDealDetails && (
            <button
              onClick={() => {
                onClose();
                onSelectDealDetails(deal);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold order-2 sm:order-1"
            >
              View Full Deal Specs & Comments &rarr;
            </button>
          )}

          <a
            href={deal.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 order-1 sm:order-2 group ml-auto"
          >
            <span>CLAIM THIS DEAL AT {deal.store.toUpperCase()}</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
};
