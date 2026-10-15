import React from 'react';
import { Sparkles, Laptop, Tv, Home, Gamepad2, Shirt, CreditCard, Code2, ChevronDown } from 'lucide-react';

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
    { name: 'All Deals', icon: Sparkles },
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
    <div className="bg-black/60 border-b border-white/[0.06] sticky top-14 md:top-16 z-30 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Apple Segmented Pill Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => onSelectCategory(cat.name)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all duration-200 ${
                    isSelected
                      ? 'bg-white text-black font-semibold shadow-sm scale-[1.02]'
                      : 'bg-white/[0.05] text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/[0.09]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-[#86868b]'}`} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Controls: Clean Filter & Sort Pills */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            {/* Store Select */}
            <div className="relative">
              <select
                value={selectedStore}
                onChange={(e) => onSelectStore(e.target.value)}
                className="appearance-none bg-white/[0.05] hover:bg-white/[0.09] text-[#f5f5f7] text-xs font-medium pl-3 pr-7 py-1.5 rounded-full border border-white/[0.08] outline-none cursor-pointer transition-colors"
              >
                {stores.map((s) => (
                  <option key={s} value={s} className="bg-[#1c1c1e] text-[#f5f5f7]">
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#86868b] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as any)}
                className="appearance-none bg-white/[0.05] hover:bg-white/[0.09] text-[#f5f5f7] text-xs font-medium pl-3 pr-7 py-1.5 rounded-full border border-white/[0.08] outline-none cursor-pointer transition-colors"
              >
                <option value="popular" className="bg-[#1c1c1e] text-[#f5f5f7]">Most Popular</option>
                <option value="discount" className="bg-[#1c1c1e] text-[#f5f5f7]">Highest Discount</option>
                <option value="newest" className="bg-[#1c1c1e] text-[#f5f5f7]">Newest First</option>
                <option value="price" className="bg-[#1c1c1e] text-[#f5f5f7]">Price: Low to High</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#86868b] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
