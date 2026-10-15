import React from 'react';
import { X, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import type { Deal } from '../types';
import { generateCategoryDeals } from '../utils/affiliate';

interface AutoCuratorModalProps {
  onClose: () => void;
  onDealsGenerated: (newDeals: Deal[]) => void;
}

export const AutoCuratorModal: React.FC<AutoCuratorModalProps> = ({ onClose, onDealsGenerated }) => {
  const [selectedCategory, setSelectedCategory] = React.useState<Deal['category']>('Electronics');
  const [dealCount, setDealCount] = React.useState<number>(3);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const categories: Deal['category'][] = [
    'Electronics',
    'Laptops & Tech',
    'Home & Kitchen',
    'Gaming',
    'Fashion',
    'Daily Top Deals'
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateCategoryDeals(selectedCategory, dealCount);
      onDealsGenerated(generated);
      setIsGenerating(false);
      onClose();
    }, 1200);
  };

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
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">Auto-Curator Deal Scanner</h3>
            <p className="text-xs text-slate-400">Generate top-selling deals auto-embedded with your affiliate link</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Select Targeted Category</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between ${
                    selectedCategory === cat
                      ? 'bg-purple-950/60 border-purple-500 text-purple-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Number of Best-Sellers to Auto-Generate</label>
            <div className="flex gap-2">
              {[2, 3, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setDealCount(num)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    dealCount === num
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {num} Deals
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
              <Zap className="w-3.5 h-3.5" /> What will happen:
            </div>
            <p>1. Scans top-selling products on Amazon & Walmart for {selectedCategory}.</p>
            <p>2. Automatically calculates savings %, generates coupon code, and attaches your affiliate ID.</p>
            <p>3. Instantly publishes slick deal cards to your deal feed.</p>
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
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Auto-Curating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Auto-Generate Deals
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
