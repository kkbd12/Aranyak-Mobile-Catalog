import React from 'react';
import { 
  Sparkles, 
  Flame, 
  Crown, 
  Droplets, 
  Wheat, 
  ShoppingBag, 
  Package, 
  Gift, 
  Layers
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
  Crown: <Crown className="w-4 h-4" />,
  Droplets: <Droplets className="w-4 h-4" />,
  Wheat: <Wheat className="w-4 h-4" />,
  ShoppingBag: <ShoppingBag className="w-4 h-4" />,
  Package: <Package className="w-4 h-4" />,
  Gift: <Gift className="w-4 h-4" />,
  Layers: <Layers className="w-4 h-4" />,
};

interface CategorySidebarProps {
  onCategorySelect?: (categoryId: string) => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({ onCategorySelect }) => {
  const { categories, activeCategory, setActiveCategory, products, cart } = useStore();

  const handleSelect = (catId: string) => {
    setActiveCategory(catId);
    if (onCategorySelect) {
      onCategorySelect(catId);
    }
  };

  return (
    <aside 
      id="category-sidebar"
      className="hidden lg:block w-40 lg:w-48 shrink-0 bg-slate-100/90 border-r border-slate-200/90 h-[calc(100vh-6.5rem)] sticky top-24 overflow-y-auto overflow-x-hidden py-1.5 scrollbar-thin select-none"
    >
      <div className="flex flex-col gap-1 px-1 sm:px-2">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          
          // Count items in category
          const categoryProducts = category.id === 'all' 
            ? products 
            : products.filter(p => p.category === category.id);
          const totalCount = categoryProducts.length;

          // Count cart items in this category
          const cartCountForCategory = cart
            .filter(item => category.id === 'all' || item.product.category === category.id)
            .reduce((sum, item) => sum + item.quantity, 0);

          return (
            <button
              key={category.id}
              id={`category-tab-${category.id}`}
              onClick={() => handleSelect(category.id)}
              className={`group relative flex flex-col sm:flex-row items-center sm:items-start text-left w-full p-2 sm:p-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-white text-amber-800 font-bold shadow-xs border-l-4 sm:border-l-0 sm:border-r-4 border-amber-600'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 font-medium'
              }`}
            >
              {/* Category Icon */}
              <div className={`p-1.5 rounded-lg mb-1 sm:mb-0 sm:mr-2 shrink-0 transition-colors ${
                isActive ? 'bg-amber-100 text-amber-700' : 'bg-slate-200/60 text-slate-500 group-hover:text-slate-700'
              }`}>
                {ICON_MAP[category.icon] || <Layers className="w-4 h-4" />}
              </div>

              {/* Category Titles */}
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <span className="text-[11px] sm:text-xs block leading-tight truncate">
                  {category.nameBn || category.name}
                </span>
                {category.nameBn && (
                  <span className="text-[10px] text-slate-400 font-normal hidden lg:block truncate mt-0.5">
                    {category.name}
                  </span>
                )}
              </div>

              {/* Cart Badge if items added from this category */}
              {cartCountForCategory > 0 && (
                <span className="absolute top-1 right-1 sm:relative sm:top-auto sm:right-auto sm:ml-auto w-4 h-4 rounded-full bg-amber-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-scale-in">
                  {cartCountForCategory}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
