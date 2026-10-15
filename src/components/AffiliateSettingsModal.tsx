import React from 'react';
import { X, Save, Tag, ShieldCheck, RefreshCw } from 'lucide-react';
import type { AffiliateConfig } from '../types';
import { getAffiliateConfig, saveAffiliateConfig, DEFAULT_AFFILIATE_CONFIG } from '../utils/affiliate';

interface AffiliateSettingsModalProps {
  onClose: () => void;
  onSave: (config: AffiliateConfig) => void;
}

export const AffiliateSettingsModal: React.FC<AffiliateSettingsModalProps> = ({ onClose, onSave }) => {
  const [config, setConfig] = React.useState<AffiliateConfig>(getAffiliateConfig());
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAffiliateConfig(config);
    onSave(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    setConfig(DEFAULT_AFFILIATE_CONFIG);
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
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">Affiliate Tag Configuration</h3>
            <p className="text-xs text-slate-400">All outbound product & card links automatically embed your tracking IDs</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-amber-400 mb-1">Amazon Tag</label>
              <input
                type="text"
                value={config.amazonTag}
                onChange={(e) => setConfig({ ...config, amazonTag: e.target.value })}
                placeholder="mystore-20"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-400 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-blue-400 mb-1">Walmart ID</label>
              <input
                type="text"
                value={config.walmartId}
                onChange={(e) => setConfig({ ...config, walmartId: e.target.value })}
                placeholder="walmart_aff_id"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-400 transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-yellow-400 mb-1">BestBuy Impact ID</label>
              <input
                type="text"
                value={config.bestbuyId}
                onChange={(e) => setConfig({ ...config, bestbuyId: e.target.value })}
                placeholder="bb_impact_123"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-yellow-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-red-400 mb-1">Target Tag</label>
              <input
                type="text"
                value={config.targetTag}
                onChange={(e) => setConfig({ ...config, targetTag: e.target.value })}
                placeholder="target_af_id"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-red-400 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-purple-400 mb-1">eBay Partner Network</label>
              <input
                type="text"
                value={config.ebayId}
                onChange={(e) => setConfig({ ...config, ebayId: e.target.value })}
                placeholder="ebay_partner_id"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-teal-400 mb-1">B&H Photo Tag</label>
              <input
                type="text"
                value={config.bhId}
                onChange={(e) => setConfig({ ...config, bhId: e.target.value })}
                placeholder="bh_photo_id"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-teal-400 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-cyan-400 mb-1">Credit Cards Tag (Chase/Amex)</label>
              <input
                type="text"
                value={config.creditCardTag}
                onChange={(e) => setConfig({ ...config, creditCardTag: e.target.value })}
                placeholder="cc_rewards_tag"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">Software/SaaS Affiliate ID</label>
              <input
                type="text"
                value={config.softwareTag}
                onChange={(e) => setConfig({ ...config, softwareTag: e.target.value })}
                placeholder="saas_partner_id"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-emerald-200">Automatic Tag Injection Enabled</span>
              <span>All product outbound buttons and shared links automatically append your affiliate IDs.</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-200 underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset Defaults
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {savedSuccess ? 'Saved!' : 'Save Tags'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
