import React from 'react';
import { Flame, Laptop, Tv, Home, Gamepad2, Shirt, CreditCard, Code2, SlidersHorizontal, Filter } from 'lucide-react';

interface CategoryNavProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  sortBy: 'popular' | 'discount' | 'newest' | 'price';
  onSortChange: (sort: 'popular' | 'discount' | 'newest' | 'price') => void;
  selectedStore: string;
  onSelectStore: (store: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  selectedStore,
  onSelectStore
}) => {
  const categories = [
    { name: 'All Deals', icon: Flame },
    { name: 'Credit Cards & Finance', icon: CreditCard },
    { name: 'Software & SaaS', icon: Code2 },
    { name: 'Electronics', icon: Tv },
    { name: 'Laptops & Tech', icon: Laptop },
    { name: 'Home & Kitchen', icon: Home },
    { name: 'Gaming', icon: Gamepad2 },
    { name: 'Fashion', icon: Shirt }
  ];

  const stores = ['All Stores', 'Amazon', 'Walmart', 'BestBuy', 'Target', 'Chase', 'Amex', 'NordVPN', 'Hostinger'];

  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 sticky top-[69px] z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Pills Slider */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => onSelectCategory(cat.name)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    isSelected
                      ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Controls: Store Filter & Sorting */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Store Select */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={selectedStore}
                onChange={(e) => onSelectStore(e.target.value)}
                className="bg-transparent text-slate-300 text-xs font-medium outline-none cursor-pointer"
              >
                {stores.map((s) => (
                  <option key={s} value={s} className="bg-slate-900 text-slate-200">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as any)}
                className="bg-transparent text-slate-300 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="popular" className="bg-slate-900 text-slate-200">Sort: 🔥 Upvotes</option>
                <option value="discount" className="bg-slate-900 text-slate-200">Sort: 💥 % Discount</option>
                <option value="newest" className="bg-slate-900 text-slate-200">Sort: 🆕 Newest</option>
                <option value="price" className="bg-slate-900 text-slate-200">Sort: 🏷️ Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
