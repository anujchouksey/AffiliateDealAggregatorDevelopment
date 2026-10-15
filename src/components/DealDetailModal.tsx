import React from 'react';
import { X, Flame, ThumbsUp, ThumbsDown, Copy, ExternalLink, Share2, ShieldCheck, Tag, Clock, Eye, MessageSquare, Check, Sparkles } from 'lucide-react';
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
    { author: 'DealHunter99', time: '10m ago', text: 'Just ordered one! Amazing discount for this model.' },
    { author: 'TechSaver', time: '35m ago', text: 'Verified the coupon code AUDIO30OFF works at checkout!' }
  ]);

  const handleUpvote = () => {
    onVote(deal.id, 'up');
    confetti({
      particleCount: 40,
      spread: 60,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-extrabold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/40 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400 animate-bounce" />
            {deal.isFireDeal ? 'HOT FIRE DEAL' : 'POPULAR DEAL'}
          </span>
          <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            {deal.store}
          </span>
          <span className="text-xs font-medium text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {deal.postedAt}
          </span>
          <span className="text-xs font-medium text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full flex items-center gap-1 ml-auto">
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            {deal.viewsCount} views
          </span>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
          {/* Image & Price Tag */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full aspect-square bg-slate-950 rounded-2xl border border-slate-800 p-4 flex items-center justify-center relative group overflow-hidden shadow-inner">
              <img
                src={deal.imageUrl}
                alt={deal.title}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-3 left-3 bg-emerald-500 text-slate-950 font-black text-sm px-2.5 py-1 rounded-lg shadow">
                {deal.discountPercentage}% OFF
              </span>
            </div>

            {/* Voting Bar */}
            <div className="w-full mt-4 flex items-center justify-between bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-medium px-2">Community Score</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUpvote}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    deal.userVoted === 'up'
                      ? 'bg-emerald-500 text-slate-950 shadow-lg'
                      : 'bg-slate-800 text-slate-300 hover:bg-emerald-950 hover:text-emerald-400'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{deal.upvotes}</span>
                </button>
                <button
                  onClick={() => onVote(deal.id, 'down')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    deal.userVoted === 'down'
                      ? 'bg-rose-500 text-white shadow-lg'
                      : 'bg-slate-800 text-slate-400 hover:bg-rose-950 hover:text-rose-400'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>{deal.downvotes}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Details & CTAs */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-100 leading-snug mb-3">{deal.title}</h1>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">{deal.description}</p>

              {/* Price Display Box */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Verified Discounted Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-400">${deal.dealPrice.toFixed(2)}</span>
                    <span className="text-base text-slate-500 line-through">${deal.originalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block mb-0.5">Total Instant Savings</span>
                  <span className="text-base font-extrabold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30">
                    Save ${(deal.originalPrice - deal.dealPrice).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Coupon Box if available */}
              {deal.couponCode && (
                <div className="bg-amber-950/30 border border-dashed border-amber-500/50 p-3 rounded-2xl mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-xs text-amber-200 font-bold block">Exclusive Promo Coupon Code</span>
                      <span className="text-sm font-mono font-bold text-amber-300 tracking-wider">{deal.couponCode}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyCoupon}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow"
                  >
                    {copiedCoupon ? (
                      <>
                        <Check className="w-4 h-4" /> Copied & Opening!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy Code & Get Deal
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Feature Highlights */}
              {deal.features && deal.features.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Deal Highlights</h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {deal.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Outbound CTA & Share buttons */}
            <div className="space-y-2 pt-2">
              <a
                href={deal.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm md:text-base py-3.5 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                <span>GET DEAL AT {deal.store.toUpperCase()}</span>
                <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <button
                onClick={() => onOpenShare(deal)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4 text-orange-400" /> Share Deal with Friends (Affiliate Embedded)
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Price History & All-Time Low Tracker */}
        <div className="mb-6">
          <PriceHistoryChart deal={deal} />
        </div>

        {/* Comments Section */}
        <div className="border-t border-slate-800 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-200">Community Discussion & Price Updates ({comments.length})</h3>
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Has anyone tried this? Leave a comment or price update..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
            >
              Comment
            </button>
          </form>

          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {comments.map((c, i) => (
              <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-400">{c.author}</span>
                  <span className="text-[10px] text-slate-500">{c.time}</span>
                </div>
                <p className="text-xs text-slate-300">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
