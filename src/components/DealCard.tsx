import React from 'react';
import { Bookmark, Share2, Copy, Check, TrendingDown, ArrowUpRight } from 'lucide-react';
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
      particleCount: 25,
      spread: 45,
      origin: { y: 0.8 }
    });
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
      className="group bg-[#161618] hover:bg-[#1c1c1e] border border-white/[0.08] hover:border-white/[0.18] rounded-[24px] p-4 flex flex-col justify-between transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60 relative"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[4/3] bg-[#0d0d0f] rounded-[18px] p-4 flex items-center justify-center overflow-hidden border border-white/[0.04] mb-3.5">
        <img
          src={deal.imageUrl}
          alt={deal.title}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Refined Apple Pill Badge (Top Left) */}
        {isCreditCard ? (
          <span className="absolute top-2.5 left-2.5 bg-[#0071e3]/15 text-[#2997ff] border border-[#0071e3]/30 text-[11px] font-medium px-2.5 py-0.5 rounded-full backdrop-blur-md">
            Rewards
          </span>
        ) : isSoftware ? (
          <span className="absolute top-2.5 left-2.5 bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[11px] font-medium px-2.5 py-0.5 rounded-full backdrop-blur-md">
            Software
          </span>
        ) : (
          <span className="absolute top-2.5 left-2.5 bg-[#30d158]/15 text-[#30d158] border border-[#30d158]/30 text-[11px] font-medium px-2.5 py-0.5 rounded-full backdrop-blur-md">
            -{deal.discountPercentage}%
          </span>
        )}

        {/* Store Identifier (Top Right) */}
        <span className="absolute top-2.5 right-2.5 text-[#86868b] text-[10px] font-semibold uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded-full border border-white/[0.06] backdrop-blur-md">
          {deal.store}
        </span>

        {/* Bookmark Trigger (Bottom Right) */}
        <button
          onClick={handleSave}
          className={`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
            deal.isSaved
              ? 'bg-white text-black border-white'
              : 'bg-black/50 text-[#86868b] hover:text-white border-white/[0.08] hover:bg-black/80'
          }`}
          title={deal.isSaved ? 'Saved to bookmarks' : 'Save deal'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${deal.isSaved ? 'fill-black' : ''}`} />
        </button>
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row */}
          <div className="flex items-center justify-between text-[11px] text-[#86868b] mb-1.5">
            <span className="truncate">{deal.category}</span>
            {deal.isFireDeal && (
              <span className="text-[#ff9500] text-[10px] font-medium">Trending</span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-medium text-[#f5f5f7] text-[14px] leading-snug line-clamp-2 mb-2 group-hover:text-white transition-colors">
            {deal.title}
          </h3>

          {/* Bonus Offer (if applicable) */}
          {deal.bonusOffer && (
            <div className="mb-2 text-[11px] text-[#86868b] bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-lg truncate">
              {deal.bonusOffer}
            </div>
          )}

          {/* Pricing Row */}
          <div className="flex items-baseline gap-2 mb-2">
            {isCreditCard ? (
              <span className="text-[17px] font-semibold text-[#f5f5f7]">$0 Annual Fee</span>
            ) : (
              <>
                <span className="text-xl font-semibold tracking-tight text-[#f5f5f7]">
                  ${deal.dealPrice.toFixed(2)}
                </span>
                {deal.originalPrice > 0 && (
                  <span className="text-xs text-[#86868b] line-through font-normal">
                    ${deal.originalPrice.toFixed(2)}
                  </span>
                )}
                {deal.originalPrice > deal.dealPrice && (
                  <span className="text-[11px] font-medium text-[#30d158] ml-auto">
                    Save ${(deal.originalPrice - deal.dealPrice).toFixed(2)}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Price History & Coupon Micro-links */}
          <div className="flex items-center gap-2 mb-3">
            {!isCreditCard && onOpenPriceHistory && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPriceHistory(deal);
                }}
                className="text-[11px] text-[#86868b] hover:text-[#2997ff] transition-colors flex items-center gap-1"
              >
                <TrendingDown className="w-3 h-3 text-[#30d158]" />
                <span>Price Trend</span>
              </button>
            )}

            {deal.couponCode && (
              <button
                onClick={handleCopyCoupon}
                className="text-[11px] text-[#2997ff] hover:underline transition-colors flex items-center gap-1 ml-auto"
              >
                {copied ? <Check className="w-3 h-3 text-[#30d158]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : deal.couponCode}</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
          {/* Subtle Upvote counter */}
          <button
            onClick={handleUpvote}
            className={`text-xs px-2.5 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1 ${
              deal.userVoted === 'up'
                ? 'bg-white/15 text-white'
                : 'text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/[0.06]'
            }`}
            title="Upvote deal"
          >
            <span>▲</span>
            <span>{deal.upvotes}</span>
          </button>

          <div className="flex items-center gap-1.5">
            {/* Share Button */}
            <button
              onClick={handleShareClick}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#86868b] hover:text-white hover:bg-white/[0.08] transition-colors"
              title="Share deal"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Apple Blue Pill CTA */}
            <a
              href={deal.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1 transition-all duration-200 shadow-sm"
            >
              <span>View Deal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
