import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  Plus, 
  Minus, 
  Flame, 
  Sparkles, 
  PackageCheck,
  ShieldCheck,
  Package,
  Check
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

  const product = selectedProduct;

  const hasVariants = Boolean(product?.variants && product.variants.length > 0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(() => {
    if (product?.variants && product.variants.length > 0) {
      return product.variants[0].id;
    }
    return '';
  });

  // Keep selected variant synchronized when opened product changes
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
    } else {
      setSelectedVariantId('');
    }
  }, [product?.id]);

  if (!product) return null;

  const activeVariant = hasVariants
    ? (product.variants?.find(v => v.id === selectedVariantId) || product.variants?.[0])
    : undefined;

  const currentPrice = activeVariant ? activeVariant.price : product.price;
  const currentUnit = activeVariant ? activeVariant.unit : product.unit;
  const currentStock = activeVariant ? activeVariant.stock : product.stock;

  const cartItem = cart.find(item => 
    item.product.id === product.id && 
    (activeVariant ? item.selectedVariant?.id === activeVariant.id : !item.selectedVariant)
  );
  const quantity = cartItem ? cartItem.quantity : 0;

  const isOutOfStock = currentStock <= 0;
  const isLowStock = currentStock > 0 && currentStock <= (product.lowStockThreshold || 5);
  const isMaxStockReached = quantity >= currentStock;

  const handleAdd = () => {
    if (isOutOfStock || isMaxStockReached) return;
    addToCart(product, activeVariant, 1);
  };

  const handleIncrement = () => {
    if (isMaxStockReached) return;
    updateCartQuantity(product.id, quantity + 1, activeVariant?.id);
  };

  const handleDecrement = () => {
    updateCartQuantity(product.id, quantity - 1, activeVariant?.id);
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
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors shadow-md cursor-pointer"
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

            {/* MULTI-WEIGHT / VARIANT SELECTOR */}
            {hasVariants && (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-700" />
                    ওজন ও সাইজ নির্বাচন করুন:
                  </span>
                  <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/80">
                    {product.variants!.length}টি সাইজ উপলব্ধ
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {product.variants!.map((v) => {
                    const isSelected = activeVariant?.id === v.id;
                    const isVOut = v.stock <= 0;
                    const vCartItem = cart.find(ci => ci.product.id === product.id && ci.selectedVariant?.id === v.id);
                    const vQty = vCartItem ? vCartItem.quantity : 0;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        disabled={isVOut}
                        className={`p-3 rounded-2xl border text-left transition-all relative cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-amber-50/90 border-amber-500 shadow-sm ring-2 ring-amber-400/40'
                            : isVOut
                            ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                            : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs sm:text-sm truncate ${isSelected ? 'text-amber-950 font-black' : 'text-slate-800 font-bold'}`}>
                            {v.unit}
                          </span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-baseline justify-between gap-1 mt-1.5">
                          <span className={`text-sm sm:text-base font-black ${isSelected ? 'text-amber-800' : 'text-slate-900'}`}>
                            {settings.currencySymbol}{v.price}
                          </span>
                          <span className={`text-[10px] font-semibold ${isVOut ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                            {isVOut ? 'স্টক শেষ' : `মজুদ ${v.stock}`}
                          </span>
                        </div>

                        {vQty > 0 && (
                          <div className="mt-1 pt-1 border-t border-amber-200/60 text-[10px] text-amber-700 font-bold flex items-center justify-between">
                            <span>কার্টে আছে:</span>
                            <span className="font-extrabold">{vQty}টি</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inventory, Unit / Packet Size & Real-time Stock Metrics */}
            <div className="grid grid-cols-2 gap-2 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <span className="text-xs text-amber-900/70 block font-medium">প্যাকেট সাইজ / ওজন</span>
                  <span className="font-bold text-amber-950 text-sm">
                    {currentUnit || 'Standard Pack'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <PackageCheck className="w-5 h-5 text-slate-500 shrink-0" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">বর্তমান মজুদ (Stock)</span>
                  <span className={`font-bold ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {isOutOfStock ? 'স্টক শেষ (০)' : `${currentStock} ${currentUnit || 'প্যাকেট'}`}
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
              {settings.currencySymbol}{currentPrice}
              {currentUnit && <span className="text-xs text-slate-400 font-normal">/{currentUnit}</span>}
            </span>
          </div>

          {/* Stepper or Add to Cart */}
          {quantity > 0 ? (
            <div className="flex items-center bg-amber-600 text-white rounded-2xl p-1 shadow-md">
              <button
                onClick={handleDecrement}
                className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                title="Decrease"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-black px-3 min-w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={isMaxStockReached}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform cursor-pointer ${
                  isMaxStockReached 
                    ? 'bg-amber-700/50 cursor-not-allowed text-amber-200' 
                    : 'bg-white text-amber-600 hover:bg-amber-50 active:scale-90'
                }`}
                title="Increase"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`px-5 py-3 rounded-2xl text-sm font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
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
