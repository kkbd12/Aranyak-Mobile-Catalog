import React from 'react';
import { 
  X, 
  Star, 
  Plus, 
  Minus, 
  Flame, 
  Sparkles, 
  Tag, 
  PackageCheck,
  ShieldCheck,
  Package
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProduct, 
    setSelectedProduct, 
    settings, 
    cart, 
    addToCart, 
    updateCartQuantity 
  } = useStore();

  if (!selectedProduct) return null;

  const product = selectedProduct;
  const cartItem = cart.find(item => item.product.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const isMaxStockReached = quantity >= product.stock;

  const handleAdd = () => {
    if (isOutOfStock || isMaxStockReached) return;
    addToCart(product, 1);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="product-detail-modal"
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[calc(100dvh-1rem)] sm:max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-scale-in"
      >
        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Large Product Banner */}
          <div className="relative h-52 sm:h-64 bg-slate-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <button
              id="close-product-detail-btn"
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors shadow-md"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badges on image */}
            <div className="absolute bottom-3 left-3 flex gap-2">
              {product.isPopular && (
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs sm:text-sm font-bold px-3 py-1 rounded-xl shadow-md flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  জনপ্রিয় পণ্য
                </span>
              )}
              {product.isSpecial && (
                <span className="bg-amber-600 text-white text-xs sm:text-sm font-bold px-3 py-1 rounded-xl shadow-md flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  স্পেশাল আইটেম
                </span>
              )}
            </div>
          </div>

          {/* Details Container */}
          <div className="p-4 sm:p-6 space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h2>
                {product.rating && (
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 text-amber-800 font-bold text-xs sm:text-sm shrink-0">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{product.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {product.nameBn && (
                <p className="text-base font-bold text-amber-800 mt-1">
                  {product.nameBn}
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Inventory, Unit / Packet Size & Real-time Stock Metrics */}
            <div className="grid grid-cols-2 gap-2 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <span className="text-xs text-amber-900/70 block font-medium">প্যাকেট সাইজ / ওজন</span>
                  <span className="font-bold text-amber-950 text-sm">
                    {product.unit || 'Standard Pack'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <PackageCheck className="w-5 h-5 text-slate-500 shrink-0" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">বর্তমান মজুদ (Stock)</span>
                  <span className={`font-bold ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {isOutOfStock ? 'স্টক শেষ (০)' : `${product.stock} ${product.unit || 'প্যাকেট'}`}
                  </span>
                </div>
              </div>
            </div>

            {/* 100% Pure Guarantee Badge */}
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50/90 border border-emerald-200 rounded-xl text-emerald-900 text-xs sm:text-sm font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>১০০% খাঁটি ও নির্ভেজাল পণ্যের বিশ্বস্ত গ্যারান্টি</span>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pinned Bottom Bar: Price & Action */}
        <div className="p-4 sm:px-6 bg-white border-t border-slate-200 flex items-center justify-between pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] shrink-0 shadow-lg">
          <div>
            <span className="text-xs text-slate-400 block font-medium">মূল্য (Price)</span>
            <span className="text-2xl font-black text-amber-800">
              {settings.currencySymbol}{product.price}
              {product.unit && <span className="text-xs text-slate-400 font-normal">/{product.unit}</span>}
            </span>
          </div>

          {/* Stepper or Add to Cart */}
          {quantity > 0 ? (
            <div className="flex items-center bg-amber-600 text-white rounded-2xl p-1 shadow-md">
              <button
                onClick={() => updateCartQuantity(product.id, quantity - 1)}
                className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center active:scale-90 transition-transform"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-black px-3 min-w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => updateCartQuantity(product.id, quantity + 1)}
                disabled={isMaxStockReached}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform ${
                  isMaxStockReached 
                    ? 'bg-amber-700/50 cursor-not-allowed text-amber-200' 
                    : 'bg-white text-amber-600 hover:bg-amber-50 active:scale-90'
                }`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`px-5 py-3 rounded-2xl text-sm font-extrabold flex items-center gap-1.5 transition-all ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md active:scale-95'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isOutOfStock ? 'স্টক শেষ' : 'অর্ডারে যোগ করুন'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
