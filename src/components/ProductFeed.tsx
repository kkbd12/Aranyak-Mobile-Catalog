import React, { useEffect, useRef } from 'react';
import { ProductCard } from './ProductCard';
import { useStore } from '../context/StoreContext';
import { 
  Sparkles, 
  SearchX, 
  Plus, 
  Layers, 
  Package, 
  Flame, 
  Crown, 
  Droplets, 
  Wheat, 
  ShoppingBag, 
  Gift 
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-3.5 h-3.5" />,
  Flame: <Flame className="w-3.5 h-3.5" />,
  Crown: <Crown className="w-3.5 h-3.5" />,
  Droplets: <Droplets className="w-3.5 h-3.5" />,
  Wheat: <Wheat className="w-3.5 h-3.5" />,
  ShoppingBag: <ShoppingBag className="w-3.5 h-3.5" />,
  Package: <Package className="w-3.5 h-3.5" />,
  Gift: <Gift className="w-3.5 h-3.5" />,
  Layers: <Layers className="w-3.5 h-3.5" />,
};

interface ProductFeedProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

export const ProductFeed: React.FC<ProductFeedProps> = () => {
  const { 
    products, 
    categories, 
    activeCategory, 
    setActiveCategory, 
    searchQuery, 
    setSearchQuery,
    setIsAddProductOpen
  } = useStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Filter products by search query
  const filteredProducts = products.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(query) ||
      (p.nameBn && p.nameBn.toLowerCase().includes(query)) ||
      p.description.toLowerCase().includes(query) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(query)))
    );
  });

  // Smooth scroll to section when category is clicked
  useEffect(() => {
    if (activeCategory === 'all') {
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      const targetElement = sectionRefs.current[activeCategory];
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activeCategory]);

  const activeCategoriesToRender = categories.filter(cat => cat.id !== 'all');

  return (
    <div
      ref={containerRef}
      id="product-feed-scroll-container"
      className="flex-1 h-[calc(100vh-6.5rem)] overflow-y-auto px-3 sm:px-5 py-2.5 space-y-4 pb-32 scroll-smooth"
    >
      {/* Top Header Bar & View Switcher - Categories hidden on mobile */}
      <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md pt-1 pb-2 border-b border-slate-200/80 -mx-3 px-3 sm:-mx-5 sm:px-5">
        <div className="flex items-center justify-between gap-2">
          {/* Quick Category Horizontal Slider (Visible ONLY on Desktop/Tablet) */}
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 select-none">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              const count = cat.id === 'all' 
                ? products.length 
                : products.filter(p => p.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-xs scale-102'
                      : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200/70'
                  }`}
                >
                  <span className={isSelected ? 'text-amber-200' : 'text-amber-600'}>
                    {ICON_MAP[cat.icon] || <Layers className="w-3.5 h-3.5" />}
                  </span>
                  <span>{cat.nameBn || cat.name}</span>
                  <span className={`text-[10px] px-1 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-amber-700/60 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mobile Catalog Header Info */}
          <div className="flex md:hidden items-center gap-2 flex-1">
            <span className="w-2 h-4 bg-amber-500 rounded-full shrink-0" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">পণ্য তালিকা</span>
              <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded-full border border-amber-200/60">
                {products.length}টি আইটেম
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search results mode */}
      {searchQuery ? (
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              খোঁজা হচ্ছে: &ldquo;{searchQuery}&rdquo;
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {filteredProducts.length}টি আইটেম পাওয়া গেছে
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <SearchX className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">কোনো আইটেম পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                &ldquo;{searchQuery}&rdquo; দিয়ে কিছু মেলেনি। অন্য শব্দ লিখে খুঁজুন অথবা নতুন প্রোডাক্ট যোগ করুন।
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  সার্চ ক্লিয়ার করুন
                </button>
                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  নতুন মসলা/মুদি যোগ করুন
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 w-full">
              {filteredProducts.map((product, idx) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  serialNumber={idx + 1}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Continuous Serial Categorized Scroll Feed */
        (() => {
          let globalSerialCounter = 0;

          return activeCategoriesToRender.map((category) => {
            const categoryItems = products.filter(p => p.category === category.id);
            if (categoryItems.length === 0) return null;

            const categoryStartSerial = globalSerialCounter + 1;
            const categoryEndSerial = globalSerialCounter + categoryItems.length;

            return (
              <section
                key={category.id}
                id={`section-${category.id}`}
                ref={(el) => {
                  sectionRefs.current[category.id] = el;
                }}
                className="scroll-mt-14"
              >
                {/* Category Header with Serial Numbers Indicator */}
                <div className="flex bg-white/80 backdrop-blur-xs py-2 px-3 rounded-2xl border border-slate-200/80 items-center justify-between mb-2.5 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-5 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full shrink-0" />
                    <div>
                      <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                        {category.nameBn || category.name}
                      </h2>
                      {category.nameBn && (
                        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                          {category.name}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-lg shadow-2xs">
                      #{categoryStartSerial} - #{categoryEndSerial}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                      {categoryItems.length}টি
                    </span>
                  </div>
                </div>

                {/* Product Layout: Single Column Sequential Rows */}
                <div className="flex flex-col gap-2.5 w-full">
                  {categoryItems.map((product) => {
                    globalSerialCounter += 1;
                    const itemSerial = globalSerialCounter;
                    return (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        serialNumber={itemSerial}
                      />
                    );
                  })}
                </div>
              </section>
            );
          });
        })()
      )}

      {/* End of Catalog Footer */}
      <div className="pt-8 pb-12 text-center text-slate-400 text-xs flex flex-col items-center gap-1.5 border-t border-slate-200/80 mt-8">
        <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
          ✓
        </div>
        <span className="font-semibold text-slate-600">সকল মসলা ও সুপার শপ আইটেমের তালিকা সমাপ্ত</span>
        <span className="text-[11px] text-slate-400">১০০% খাঁটি ও নির্ভেজাল পণ্যের বিশ্বস্ত প্রতিষ্ঠান</span>
      </div>
    </div>
  );
};
