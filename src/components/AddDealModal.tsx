import React from 'react';
import { X, PlusCircle, Link, Percent, Sparkles, Award } from 'lucide-react';
import type { Deal } from '../types';
import { convertToAffiliateUrl } from '../utils/affiliate';

interface AddDealModalProps {
  onClose: () => void;
  onAddDeal: (deal: Deal) => void;
}

export const AddDealModal: React.FC<AddDealModalProps> = ({ onClose, onAddDeal }) => {
  const [rawUrl, setRawUrl] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [originalPrice, setOriginalPrice] = React.useState<number>(100);
  const [dealPrice, setDealPrice] = React.useState<number>(0);
  const [couponCode, setCouponCode] = React.useState('');
  const [bonusOffer, setBonusOffer] = React.useState('');
  const [category, setCategory] = React.useState<Deal['category']>('Credit Cards & Finance');
  const [imageUrl, setImageUrl] = React.useState('/images/chase_card.jpg');
  const [detectedStore, setDetectedStore] = React.useState<Deal['store']>('Chase');
  const [convertedAffiliateUrl, setConvertedAffiliateUrl] = React.useState('');

  const handleUrlChange = (val: string) => {
    setRawUrl(val);
    if (val.trim()) {
      const { affiliateUrl, store } = convertToAffiliateUrl(val);
      setDetectedStore(store);
      setConvertedAffiliateUrl(affiliateUrl);
    }
  };

  const calculatedDiscount = originalPrice > 0 ? Math.max(0, Math.round(((originalPrice - dealPrice) / originalPrice) * 100)) : 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !rawUrl) return;

    const { affiliateUrl, store } = convertToAffiliateUrl(rawUrl);

    const newDeal: Deal = {
      id: `manual-deal-${Date.now()}`,
      title,
      description: description || 'Exclusive limited-time promotional offer verified by deal pulse team.',
      originalPrice: Number(originalPrice),
      dealPrice: Number(dealPrice),
      discountPercentage: calculatedDiscount,
      couponCode: couponCode ? couponCode.trim().toUpperCase() : undefined,
      bonusOffer: bonusOffer ? bonusOffer.trim() : undefined,
      store,
      category,
      imageUrl: imageUrl || '/images/chase_card.jpg',
      affiliateUrl,
      rawUrl,
      upvotes: 1,
      downvotes: 0,
      userVoted: 'up',
      isSaved: false,
      postedAt: 'Just Now',
      isFireDeal: true,
      isStaffPick: true,
      viewsCount: 15,
      commentsCount: 0,
      features: ['Verified Partner Offer', 'Affiliate Tracking Link Attached']
    };

    onAddDeal(newDeal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">Post Deal, Credit Card or Software Offer</h3>
            <p className="text-xs text-slate-400">Paste affiliate link &rarr; auto-injects tracking tag</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Deal Type / Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Deal['category'])}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-orange-500"
            >
              <option value="Credit Cards & Finance">Credit Cards & Finance (High Payout)</option>
              <option value="Software & SaaS">Software & SaaS (VPN, Hosting, Tools)</option>
              <option value="Electronics">Electronics</option>
              <option value="Laptops & Tech">Laptops & Tech</option>
              <option value="Home & Kitchen">Home & Kitchen</option>
              <option value="Gaming">Gaming</option>
              <option value="Fashion">Fashion</option>
              <option value="Daily Top Deals">Daily Top Deals</option>
            </select>
          </div>

          {/* Product/Offer URL input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-orange-400" />
              Affiliate Offer URL (Card, SaaS, Amazon, Walmart)
            </label>
            <input
              type="url"
              value={rawUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://creditcards.chase.com/... or https://nordvpn.com/..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-orange-500 font-mono transition-colors"
              required
            />
            {convertedAffiliateUrl && (
              <div className="mt-1.5 p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-[11px] text-emerald-300 flex items-center justify-between">
                <span className="truncate">Auto-Affiliate: {convertedAffiliateUrl}</span>
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ml-2">
                  {detectedStore}
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Offer Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chase Sapphire Preferred Card - Earn 60,000 Bonus Points"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors"
              required
            />
          </div>

          {/* Sign-Up Bonus Offer */}
          <div>
            <label className="block text-xs font-semibold text-amber-400 mb-1 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Sign-Up Bonus / Special Promo (Optional)
            </label>
            <input
              type="text"
              value={bonusOffer}
              onChange={(e) => setBonusOffer(e.target.value)}
              placeholder="e.g., 🔥 60,000 Points Bonus ($750 Value) or 75% OFF + Free Domain"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-amber-300 font-medium outline-none focus:border-amber-400"
            />
          </div>

          {/* Prices Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Standard Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Offer Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={dealPrice}
                onChange={(e) => setDealPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Discount %</label>
              <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-bold flex items-center justify-between">
                <span>{calculatedDiscount}% OFF</span>
                <Percent className="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>
          </div>

          {/* Coupon Code & Image */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Coupon Code (Optional)</label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="e.g. NORD72OFF"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/images/chase_card.jpg"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Short Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain reward point value, cash back terms, or SaaS features..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Publish Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
