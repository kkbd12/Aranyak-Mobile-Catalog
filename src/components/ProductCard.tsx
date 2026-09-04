import React, { useState } from 'react';
import { Plus, Minus, Star, AlertTriangle, CheckCircle, Flame, Package } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  serialNumber?: number;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  serialNumber
}) => {
  const { 
    settings, 
    cart, 
    addToCart, 
    updateCartQuantity, 
    setSelectedProduct 
  } = useStore();

  const hasVariants = Boolean(product.variants && product.variants.length > 0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants[0].id;
    }
    return '';
  });

  // Determine currently active variant
  const activeVariant = hasVariants
    ? (product.variants?.find(v => v.id === selectedVariantId) || product.variants?.[0])
    : undefined;

  const currentPrice = activeVariant ? activeVariant.price : product.price;
  const currentUnit = activeVariant ? activeVariant.unit : product.unit;
  const currentStock = activeVariant ? activeVariant.stock : product.stock;

  // Find cart item for this specific active variant or product
  const cartItem = cart.find(item => 
    item.product.id === product.id && 
    (activeVariant ? item.selectedVariant?.id === activeVariant.id : !item.selectedVariant)
  );
  const quantity = cartItem ? cartItem.quantity : 0;
  
  const isOutOfStock = currentStock <= 0;
  const isLowStock = currentStock > 0 && currentStock <= (product.lowStockThreshold || 5);
  const isMaxStockReached = quantity >= currentStock;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock || isMaxStockReached) return;
    addToCart(product, activeVariant, 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMaxStockReached) return;
    updateCartQuantity(product.id, quantity + 1, activeVariant?.id);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateCartQuantity(product.id, quantity - 1, activeVariant?.id);
  };

  const handleCardClick = () => {
    setSelectedProduct(product);
  };

  const serialStr = serialNumber 
    ? (serialNumber < 10 ? `0${serialNumber}` : `${serialNumber}`) 
    : null;

  return (
    <div
      id={`product-row-${product.id}`}
      onClick={handleCardClick}
      className={`group relative bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 border transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 sm:gap-4 hover:shadow-md hover:border-amber-400 active:bg-slate-50/50 w-full ${
        isOutOfStock 
          ? 'border-slate-200 bg-slate-50/70 opacity-75' 
          : 'border-slate-200/90'
      }`}
    >
      {/* Left: Serial Number Badge + Product Thumbnail + Name & Info */}
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
        {/* Serial Badge */}
        {serialStr && (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/80 font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-2xs">
            #{serialStr}
          </div>
        )}

        {/* Thumbnail Image */}
        <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-slate-100 shrink-0 select-none shadow-2xs border border-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-xs text-white font-bold text-center p-1 leading-tight">
              স্টক শেষ
            </div>
          )}
          {product.isPopular && !isOutOfStock && (
            <div className="absolute top-1 left-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5 fill-white" />
            </div>
          )}
        </div>

        {/* Product Names & Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 truncate group-hover:text-amber-700 transition-colors leading-snug">
              {product.nameBn || product.name}
            </h4>
          </div>

          {product.nameBn && (
            <p className="text-xs sm:text-xs text-slate-500 truncate mt-0.5 font-medium">
              {product.name}
            </p>
          )}

          {/* Unit & Stock Badges */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {currentUnit && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg">
                <Package className="w-3 h-3 text-amber-700" />
                {currentUnit}
              </span>
            )}
            
            {isLowStock && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200/80 animate-pulse">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                মজুদ {currentStock}
              </span>
            )}

            {!isOutOfStock && !isLowStock && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-lg">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                মজুদ {currentStock}
              </span>
            )}

            {product.rating && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50/50 px-1.5 py-0.5 rounded-lg">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {product.rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Multi-weight / Size Variant Chips Selector */}
          {hasVariants && (
            <div 
              className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5"
              onClick={(e) => e.stopPropagation()}
            >
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
                    className={`shrink-0 px-2 py-1 rounded-xl text-[11px] font-bold transition-all border flex items-center gap-1 cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : isVOut
                        ? 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60 cursor-not-allowed'
                        : 'bg-amber-50/90 hover:bg-amber-100 text-amber-950 border-amber-200/90'
                    }`}
                    title={`${v.unit}: ${settings.currencySymbol}${v.price} (মজুদ: ${v.stock})`}
                  >
                    <span>{v.unit}</span>
                    <span className={`text-[10px] font-black ${isSelected ? 'text-amber-100' : 'text-amber-700'}`}>
                      ({settings.currencySymbol}{v.price})
                    </span>
                    {vQty > 0 && (
                      <span className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ml-0.5 ${
                        isSelected ? 'bg-white text-amber-800' : 'bg-amber-600 text-white'
                      }`}>
                        {vQty}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Price & Stepper / Add Button */}
      <div 
        className="shrink-0 flex flex-col items-end justify-center gap-1.5 sm:gap-2 pl-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-right">
          <span className="text-base sm:text-lg font-black text-amber-800 block leading-tight">
            {settings.currencySymbol}{currentPrice}
          </span>
          {currentUnit && (
            <span className="text-[11px] sm:text-xs text-slate-400 block font-medium">
              /{currentUnit}
            </span>
          )}
        </div>

        {quantity > 0 ? (
          <div className="flex items-center bg-amber-600 text-white rounded-xl p-0.5 shadow-xs">
            <button
              id={`decrease-btn-${product.id}${activeVariant ? `-${activeVariant.id}` : ''}`}
              onClick={handleDecrement}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white active:scale-90 transition-transform cursor-pointer"
              title="Decrease"
            >
              <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <span className="text-sm font-black px-2.5 sm:px-3 min-w-6 sm:min-w-7 text-center">
              {quantity}
            </span>
            <button
              id={`increase-btn-${product.id}${activeVariant ? `-${activeVariant.id}` : ''}`}
              onClick={handleIncrement}
              disabled={isMaxStockReached}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-transform cursor-pointer ${
                isMaxStockReached 
                  ? 'bg-amber-800/50 cursor-not-allowed text-amber-200' 
                  : 'bg-white text-amber-700 hover:bg-amber-50 active:scale-90 shadow-xs'
              }`}
              title="Increase"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 font-bold" />
            </button>
          </div>
        ) : (
          <button
            id={`add-btn-${product.id}${activeVariant ? `-${activeVariant.id}` : ''}`}
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`flex items-center gap-1 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-xs active:scale-95 cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>কিনুন</span>
          </button>
        )}
      </div>
    </div>
  );
};
