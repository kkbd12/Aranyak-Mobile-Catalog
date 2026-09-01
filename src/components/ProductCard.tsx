import React from 'react';
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

  const cartItem = cart.find(item => item.product.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const isMaxStockReached = quantity >= product.stock;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock || isMaxStockReached) return;
    addToCart(product, 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMaxStockReached) return;
    updateCartQuantity(product.id, quantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateCartQuantity(product.id, quantity - 1);
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
      className={`group relative bg-white rounded-2xl p-2 sm:p-3 border transition-all duration-150 cursor-pointer flex items-center justify-between gap-2.5 sm:gap-4 hover:shadow-md hover:border-amber-400 active:bg-slate-50/50 w-full ${
        isOutOfStock 
          ? 'border-slate-200 bg-slate-50/70 opacity-75' 
          : 'border-slate-200/90'
      }`}
    >
      {/* Left: Serial Number Badge + Product Thumbnail + Name & Info */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
        {/* Serial Badge */}
        {serialStr && (
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 font-black text-[11px] sm:text-xs flex items-center justify-center shrink-0 shadow-2xs">
            #{serialStr}
          </div>
        )}

        {/* Thumbnail Image */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 select-none shadow-2xs border border-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-[10px] text-white font-bold text-center p-0.5 leading-tight">
              স্টক শেষ
            </div>
          )}
          {product.isPopular && !isOutOfStock && (
            <div className="absolute top-1 left-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[8px] font-bold px-1 py-0.2 rounded shadow-xs flex items-center gap-0.5">
              <Flame className="w-2 h-2 fill-white" />
            </div>
          )}
        </div>

        {/* Product Names & Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-amber-700 transition-colors leading-tight">
              {product.nameBn || product.name}
            </h4>
          </div>

          {product.nameBn && (
            <p className="text-[10px] sm:text-xs text-slate-500 truncate mt-0.5 font-medium">
              {product.name}
            </p>
          )}

          {/* Unit & Stock Badges */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {product.unit && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded-md">
                <Package className="w-2.5 h-2.5" />
                {product.unit}
              </span>
            )}
            
            {isLowStock && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200/60 animate-pulse">
                <AlertTriangle className="w-2.5 h-2.5" />
                মজুদ {product.stock}
              </span>
            )}

            {!isOutOfStock && !isLowStock && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />
                মজুদ {product.stock}
              </span>
            )}

            {product.rating && (
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 bg-amber-50/50 px-1 py-0.2 rounded">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                {product.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Price & Stepper / Add Button */}
      <div 
        className="shrink-0 flex flex-col items-end justify-center gap-1 sm:gap-1.5 pl-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-right">
          <span className="text-xs sm:text-base font-extrabold text-amber-800 block leading-tight">
            {settings.currencySymbol}{product.price}
          </span>
          {product.unit && (
            <span className="text-[9px] sm:text-[10px] text-slate-400 block">
              /{product.unit}
            </span>
          )}
        </div>

        {quantity > 0 ? (
          <div className="flex items-center bg-amber-600 text-white rounded-xl p-0.5 shadow-xs">
            <button
              id={`decrease-btn-${product.id}`}
              onClick={handleDecrement}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white active:scale-90 transition-transform"
              title="Decrease"
            >
              <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <span className="text-xs font-black px-2 sm:px-2.5 min-w-5 sm:min-w-6 text-center">
              {quantity}
            </span>
            <button
              id={`increase-btn-${product.id}`}
              onClick={handleIncrement}
              disabled={isMaxStockReached}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-transform ${
                isMaxStockReached 
                  ? 'bg-amber-800/50 cursor-not-allowed text-amber-200' 
                  : 'bg-white text-amber-700 hover:bg-amber-50 active:scale-90 shadow-xs'
              }`}
              title="Increase"
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 font-bold" />
            </button>
          </div>
        ) : (
          <button
            id={`add-btn-${product.id}`}
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>কিনুন</span>
          </button>
        )}
      </div>
    </div>
  );
};
