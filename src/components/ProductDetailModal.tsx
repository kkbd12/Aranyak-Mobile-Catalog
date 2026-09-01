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
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="product-detail-modal"
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-in"
      >
        {/* Large Product Banner */}
        <div className="relative h-56 sm:h-64 bg-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            id="close-product-detail-btn"
            onClick={() => setSelectedProduct(null)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badges on image */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            {product.isPopular && (
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                জনপ্রিয় পণ্য
              </span>
            )}
            {product.isSpecial && (
              <span className="bg-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                স্পেশাল আইটেম
              </span>
            )}
          </div>
        </div>

        {/* Details Container */}
        <div className="p-5 space-y-4">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {product.name}
              </h2>
              {product.rating && (
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 text-amber-700 font-bold text-xs shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{product.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {product.nameBn && (
              <p className="text-sm font-semibold text-amber-800 mt-1">
                {product.nameBn}
              </p>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Inventory, Unit / Packet Size & Real-time Stock Metrics */}
          <div className="grid grid-cols-2 gap-2 bg-amber-50/50 p-3 rounded-2xl border border-amber-200/80 text-xs">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <span className="text-[10px] text-amber-900/60 block font-medium">প্যাকেট সাইজ / ওজন</span>
                <span className="font-bold text-amber-900 text-xs">
                  {product.unit || 'Standard Pack'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">বর্তমান মজুদ (Stock)</span>
                <span className={`font-bold ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-emerald-700'}`}>
                  {isOutOfStock ? 'স্টক শেষ (০)' : `${product.stock} ${product.unit || 'প্যাকেট'}`}
                </span>
              </div>
            </div>
          </div>

          {/* 100% Pure Guarantee Badge */}
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>১০০% খাঁটি ও নির্ভেজাল পণ্যের বিশ্বস্ত গ্যারান্টি</span>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag, idx) => (
                <span key={idx} className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Price & Action Bottom */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div>
              <span className="text-[11px] text-slate-400 block">মূল্য (Price)</span>
              <span className="text-xl font-black text-amber-700">
                {settings.currencySymbol}{product.price}
                {product.unit && <span className="text-xs text-slate-400 font-normal">/{product.unit}</span>}
              </span>
            </div>

            {/* Stepper or Add to Cart */}
            {quantity > 0 ? (
              <div className="flex items-center bg-amber-500 text-white rounded-2xl p-1 shadow-md">
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
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md active:scale-95'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>{isOutOfStock ? 'স্টক শেষ' : 'অর্ডারে যোগ করুন'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
