import React from 'react';
import { Flame, ThumbsUp, ThumbsDown, Bookmark, Share2, ExternalLink, Copy, Check, Eye, Award, CreditCard, Code2, TrendingDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Deal } from '../types';

interface DealCardProps {
  deal: Deal;
  onSelectDeal: (deal: Deal) => void;
  onVote: (id: string, type: 'up' | 'down') => void;
  onToggleSave: (id: string) => void;
  onOpenShare: (deal: Deal) => void;
  onOpenPriceHistory?: (deal: Deal) => void;
}

export const DealCard: React.FC<DealCardProps> = ({
  deal,
  onSelectDeal,
  onVote,
  onToggleSave,
  onOpenShare,
  onOpenPriceHistory
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    onVote(deal.id, 'up');
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 }
    });
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    onVote(deal.id, 'down');
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave(deal.id);
  };

  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deal.couponCode) {
      navigator.clipboard.writeText(deal.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      window.open(deal.affiliateUrl, '_blank');
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenShare(deal);
  };

  const isCreditCard = deal.category === 'Credit Cards & Finance';
  const isSoftware = deal.category === 'Software & SaaS';

  return (
    <div
      onClick={() => onSelectDeal(deal)}
      className="bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative"
    >
      {/* Card Header & Badges */}
      <div className="relative aspect-[4/3] bg-slate-950 p-4 flex items-center justify-center overflow-hidden border-b border-slate-800/80">
        <img
          src={deal.imageUrl}
          alt={deal.title}
          className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-500"
        />

        {/* Discount or Category Badge */}
        {isCreditCard ? (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md z-10 flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5" /> REWARDS CARD
          </span>
        ) : isSoftware ? (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md z-10 flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5" /> SAAS SOFTWARE
          </span>
        ) : (
          <span className="absolute top-3 left-3 bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-lg shadow-md z-10">
            {deal.discountPercentage}% OFF
          </span>
        )}

        {/* Store Badge */}
        <span className="absolute top-3 right-3 bg-slate-900/90 text-slate-200 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-slate-700 shadow-md backdrop-blur-sm z-10">
          {deal.store}
        </span>

        {/* Fire Deal Indicator */}
        {deal.isFireDeal && (
          <div className="absolute bottom-3 left-3 bg-orange-500/90 text-slate-950 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow z-10">
            <Flame className="w-3 h-3 fill-slate-950 text-slate-950" />
            HOT FIRE
          </div>
        )}

        {/* Save/Bookmark Button */}
        <button
          onClick={handleSave}
          className={`absolute bottom-3 right-3 p-2 rounded-xl border backdrop-blur-sm transition-colors z-10 ${
            deal.isSaved
              ? 'bg-amber-500 text-slate-950 border-amber-400'
              : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-800'
          }`}
          title={deal.isSaved ? 'Saved to bookmarks' : 'Save deal'}
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-medium">{deal.category}</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-indigo-400" /> {deal.viewsCount}
            </span>
          </div>

          <h3 className="font-bold text-slate-100 text-sm md:text-base line-clamp-2 leading-snug group-hover:text-orange-400 transition-colors mb-2">
            {deal.title}
          </h3>

          {/* Special Sign-up Bonus Banner for Credit Cards & SaaS */}
          {deal.bonusOffer && (
            <div className="mb-3 bg-gradient-to-r from-amber-950/60 to-orange-950/60 border border-amber-500/40 p-2 rounded-xl text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{deal.bonusOffer}</span>
            </div>
          )}

          {/* Price display */}
          <div className="flex items-baseline gap-2 mb-1.5">
            {isCreditCard ? (
              <span className="text-xl font-black text-cyan-400">$0 Annual Fee / Bonus</span>
            ) : (
              <>
                <span className="text-2xl font-black text-emerald-400">${deal.dealPrice.toFixed(2)}</span>
                {deal.originalPrice > 0 && (
                  <span className="text-xs text-slate-500 line-through font-medium">${deal.originalPrice.toFixed(2)}</span>
                )}
                {deal.originalPrice > deal.dealPrice && (
                  <span className="text-[11px] font-bold text-amber-400 ml-auto bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    Save ${(deal.originalPrice - deal.dealPrice).toFixed(2)}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Interactive Price History Tracker Link */}
          {!isCreditCard && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPriceHistory?.(deal);
              }}
              className="mb-3 flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-emerald-300 font-medium transition-colors group/history w-fit"
              title="View interactive price history chart & all-time low trends"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover/history:scale-125 transition-transform" />
              <span className="underline decoration-slate-700 underline-offset-2">Price History & All-Time Low</span>
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          )}
        </div>

        {/* Action Controls & Outbound Link */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800">
          {/* Coupon Code Pill if available */}
          {deal.couponCode && (
            <button
              onClick={handleCopyCoupon}
              className="w-full bg-amber-950/40 border border-dashed border-amber-500/50 hover:bg-amber-950/70 text-amber-300 text-xs font-mono font-bold py-1.5 px-3 rounded-xl flex items-center justify-between transition-colors"
            >
              <span>CODE: {deal.couponCode}</span>
              <span className="text-[10px] text-amber-400 font-sans flex items-center gap-1">
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </span>
            </button>
          )}

          {/* Voting & Share Bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={handleUpvote}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  deal.userVoted === 'up'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{deal.upvotes}</span>
              </button>
              <div className="w-px h-3 bg-slate-800" />
              <button
                onClick={handleDownvote}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  deal.userVoted === 'down'
                    ? 'bg-rose-500 text-white'
                    : 'text-slate-400 hover:text-rose-400 hover:bg-slate-900'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Price History Quick Icon */}
            {!isCreditCard && onOpenPriceHistory && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPriceHistory(deal);
                }}
                className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800"
                title="Interactive Price History Graph"
              >
                <TrendingDown className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleShareClick}
              className="p-2 text-slate-400 hover:text-orange-400 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800"
              title="Share deal"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Outbound Direct CTA */}
            <a
              href={deal.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs py-2 px-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 group/btn"
            >
              <span>{isCreditCard ? 'APPLY NOW' : 'GET DEAL'}</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
