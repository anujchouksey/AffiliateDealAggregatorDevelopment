import React from 'react';
import { X, Copy, Check, Share2, MessageCircle, Send, Globe, Mail } from 'lucide-react';
import type { Deal } from '../types';

interface ShareModalProps {
  deal: Deal;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ deal, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const shareText = `🔥 HOT DEAL: ${deal.title} is now $${deal.dealPrice.toFixed(2)} (was $${deal.originalPrice.toFixed(2)}) - Save ${deal.discountPercentage}% OFF!`;
  const shareUrl = deal.affiliateUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${shareText}\nGet Deal Here: ${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: deal.title,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    }
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      color: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      icon: MessageCircle,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`
    },
    {
      name: 'X (Twitter)',
      color: 'bg-slate-800 hover:bg-slate-700 text-white',
      icon: Send,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Telegram',
      color: 'bg-sky-600 hover:bg-sky-500 text-white',
      icon: Send,
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Facebook',
      color: 'bg-blue-600 hover:bg-blue-500 text-white',
      icon: Globe,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Reddit',
      color: 'bg-orange-600 hover:bg-orange-500 text-white',
      icon: Share2,
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(deal.title)}`
    },
    {
      name: 'Email',
      color: 'bg-purple-600 hover:bg-purple-500 text-white',
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(`Hot Deal: ${deal.title}`)}&body=${encodeURIComponent(`${shareText}\n\nLink: ${shareUrl}`)}`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">Share Affiliate Deal</h3>
            <p className="text-xs text-slate-400">Cross-platform instant sharing with tracking tag</p>
          </div>
        </div>

        {/* Deal Preview Card */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 mb-5 flex items-center gap-3">
          <img src={deal.imageUrl} alt={deal.title} className="w-14 h-14 object-cover rounded-lg shrink-0 border border-slate-800" />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-200 truncate">{deal.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-emerald-400 font-bold text-sm">${deal.dealPrice.toFixed(2)}</span>
              <span className="text-xs text-slate-500 line-through">${deal.originalPrice.toFixed(2)}</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                {deal.discountPercentage}% OFF
              </span>
            </div>
          </div>
        </div>

        {/* Native Web Share API button if supported */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full mb-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Open iOS / Android Native Share Sheet
          </button>
        )}

        {/* Social Platforms Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {socialLinks.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${item.color} py-2.5 px-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-medium shadow-md group`}
              >
                <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>{item.name}</span>
              </a>
            );
          })}
        </div>

        {/* Copy Direct Link */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Direct Affiliate Deal Link</label>
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <input
              type="text"
              readOnly
              value={deal.affiliateUrl}
              className="bg-transparent text-xs text-slate-300 w-full outline-none px-1 font-mono truncate"
            />
            <button
              onClick={handleCopyLink}
              className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-semibold px-3 py-1.5 rounded-lg text-xs shrink-0 flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
