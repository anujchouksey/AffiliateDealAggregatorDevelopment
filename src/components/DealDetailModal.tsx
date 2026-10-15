import React from 'react';
import { X, Copy, Share2, Clock, MessageSquare, Check, ArrowUpRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Deal } from '../types';
import { PriceHistoryChart } from './PriceHistoryChart';

interface DealDetailModalProps {
  deal: Deal;
  onClose: () => void;
  onVote: (id: string, type: 'up' | 'down') => void;
  onToggleSave: (id: string) => void;
  onOpenShare: (deal: Deal) => void;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({
  deal,
  onClose,
  onVote,
  onOpenShare
}) => {
  const [copiedCoupon, setCopiedCoupon] = React.useState(false);
  const [commentInput, setCommentInput] = React.useState('');
  const [comments, setComments] = React.useState<Array<{ author: string; time: string; text: string }>>([
    { author: 'DealHunter99', time: '10m ago', text: 'Verified price drop at checkout. Instant discount applied.' },
    { author: 'TechSaver', time: '35m ago', text: 'Confirmed authentic retailer stock with manufacturer warranty.' }
  ]);

  const handleUpvote = () => {
    onVote(deal.id, 'up');
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 }
    });
  };

  const handleCopyCoupon = () => {
    if (deal.couponCode) {
      navigator.clipboard.writeText(deal.couponCode);
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2500);
      window.open(deal.affiliateUrl, '_blank');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setComments([{ author: 'You', time: 'Just now', text: commentInput.trim() }, ...comments]);
    setCommentInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-[#1c1c1e] border border-white/[0.12] rounded-[28px] max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative text-[#f5f5f7]">
        {/* Apple Style Discrete Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[#86868b] hover:text-white flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Eyebrow Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[11px] font-medium text-[#30d158] bg-[#30d158]/12 border border-[#30d158]/25 px-2.5 py-0.5 rounded-full">
            -{deal.discountPercentage}% Verified Drop
          </span>
          <span className="text-[11px] font-medium text-[#86868b] bg-white/[0.05] border border-white/[0.08] px-2.5 py-0.5 rounded-full">
            {deal.store}
          </span>
          <span className="text-[11px] text-[#86868b] ml-auto flex items-center gap-1">
            <Clock className="w-3 h-3" /> {deal.postedAt}
          </span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
          {/* Left: Product Image & Score */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full aspect-square bg-[#0d0d0f] rounded-[20px] border border-white/[0.06] p-5 flex items-center justify-center overflow-hidden">
              <img
                src={deal.imageUrl}
                alt={deal.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Voting Bar */}
            <div className="w-full mt-3 flex items-center justify-between bg-white/[0.04] border border-white/[0.06] px-3 py-2 rounded-full">
              <span className="text-xs text-[#86868b] font-medium">Community Score</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleUpvote}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                    deal.userVoted === 'up'
                      ? 'bg-white text-black font-semibold'
                      : 'bg-white/[0.08] text-[#86868b] hover:text-white hover:bg-white/[0.14]'
                  }`}
                >
                  <span>▲</span>
                  <span>{deal.upvotes}</span>
                </button>
                <button
                  onClick={() => onVote(deal.id, 'down')}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    deal.userVoted === 'down'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-white/[0.08] text-[#86868b] hover:text-white hover:bg-white/[0.14]'
                  }`}
                >
                  <span>▼</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Details & Pricing */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-[#86868b] uppercase tracking-wider block mb-1">
                {deal.category}
              </span>
              <h2 className="text-lg md:text-xl font-semibold text-[#f5f5f7] leading-snug mb-2.5">
                {deal.title}
              </h2>
              <p className="text-xs md:text-sm text-[#86868b] leading-relaxed mb-4">
                {deal.description}
              </p>

              {/* Price Surface */}
              <div className="bg-[#121214] p-4 rounded-[18px] border border-white/[0.06] mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#86868b] block mb-0.5">Offer Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-[#f5f5f7]">${deal.dealPrice.toFixed(2)}</span>
                    {deal.originalPrice > 0 && (
                      <span className="text-xs text-[#86868b] line-through font-normal">${deal.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                {deal.originalPrice > deal.dealPrice && (
                  <div className="text-right">
                    <span className="text-[11px] text-[#86868b] block mb-0.5">Instant Savings</span>
                    <span className="text-xs font-medium text-[#30d158] bg-[#30d158]/12 border border-[#30d158]/25 px-2.5 py-1 rounded-full">
                      Save ${(deal.originalPrice - deal.dealPrice).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Coupon Pill (if available) */}
              {deal.couponCode && (
                <div className="bg-white/[0.04] border border-white/[0.08] p-3 rounded-[16px] mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#86868b] block">Exclusive Coupon</span>
                    <span className="text-xs font-mono font-semibold text-[#2997ff]">{deal.couponCode}</span>
                  </div>
                  <button
                    onClick={handleCopyCoupon}
                    className="bg-white/[0.08] hover:bg-white/[0.14] text-[#f5f5f7] text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
                  >
                    {copiedCoupon ? <Check className="w-3.5 h-3.5 text-[#30d158]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCoupon ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-2">
              <a
                href={deal.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-sm py-3 px-6 rounded-full shadow-md transition-all flex items-center justify-center gap-1.5 group"
              >
                <span>View Deal at {deal.store}</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <button
                onClick={() => onOpenShare(deal)}
                className="w-full bg-white/[0.06] hover:bg-white/[0.1] text-[#86868b] hover:text-[#f5f5f7] text-xs font-medium py-2 px-4 rounded-full border border-white/[0.06] transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" /> Share Offer
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Price History Chart */}
        <div className="mb-6 pt-4 border-t border-white/[0.06]">
          <PriceHistoryChart deal={deal} />
        </div>

        {/* Discussion Section */}
        <div className="border-t border-white/[0.06] pt-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-[#86868b]" />
            <h3 className="font-medium text-xs text-[#f5f5f7] uppercase tracking-wider">
              Discussion & Updates ({comments.length})
            </h3>
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Leave a verified update or comment..."
              className="flex-1 bg-white/[0.04] border border-white/[0.08] focus:border-white/20 rounded-full px-4 py-2 text-xs text-[#f5f5f7] placeholder-[#86868b] outline-none transition-colors"
            />
            <button
              type="submit"
              className="bg-white text-black font-medium px-4 py-2 rounded-full text-xs hover:bg-[#f5f5f7] transition-colors"
            >
              Post
            </button>
          </form>

          <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
            {comments.map((c, i) => (
              <div key={i} className="bg-white/[0.03] p-3 rounded-[14px] border border-white/[0.04]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#f5f5f7]">{c.author}</span>
                  <span className="text-[10px] text-[#86868b]">{c.time}</span>
                </div>
                <p className="text-xs text-[#86868b]">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
