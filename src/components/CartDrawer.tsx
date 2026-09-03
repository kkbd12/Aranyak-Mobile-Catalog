import React from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    settings, 
    cartTotalCount, 
    cartTotalAmount, 
    isCartOpen, 
    setIsCartOpen, 
    setIsCheckoutOpen,
    removeFromCart, 
    updateCartQuantity, 
    clearCart,
    orderType,
    tableNumber
  } = useStore();

  if (cartTotalCount === 0 && !isCartOpen) {
    return null;
  }

  const taxAmount = Math.round((cartTotalAmount * settings.taxRate) / 100);
  const deliveryFee = orderType === 'delivery' ? settings.deliveryFee : 0;
  const estimatedTotal = cartTotalAmount + taxAmount + deliveryFee;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <>
      {/* Floating Bottom Cart Action Bar (Appears when items are in cart) */}
      {cartTotalCount > 0 && !isCartOpen && (
        <div 
          id="floating-cart-bar"
          className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-30 px-3 sm:px-4 max-w-lg mx-auto animate-fade-in-up"
        >
          <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-2.5 sm:p-3 shadow-2xl border border-slate-800 flex items-center justify-between gap-3">
            {/* Cart Icon & Price Info */}
            <div 
              id="cart-summary-trigger"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
            >
              {/* Distinctive Round Amber Cart Bubble Badge */}
              <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                <ShoppingBag className="w-5 h-5 text-slate-950 stroke-[2.2]" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-extrabold flex items-center justify-center border-2 border-slate-900 animate-bounce">
                  {cartTotalCount}
                </span>
              </div>

              {/* Price Details */}
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base sm:text-lg font-black text-amber-400">
                    {settings.currencySymbol}{cartTotalAmount}
                  </span>
                  <span className="text-[11px] text-slate-400 hidden xs:inline">
                    ({cartTotalCount} items)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {orderType === 'dine_in' ? `Dine-In • ${tableNumber}` : orderType === 'takeaway' ? 'Takeaway Order' : 'Home Delivery'}
                </p>
              </div>
            </div>

            {/* Quick Checkout Trigger */}
            <button
              id="cart-checkout-btn"
              onClick={handleProceedToCheckout}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
            >
              <span>Order Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Expandable Sliding Cart Drawer / Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            id="cart-backdrop"
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          {/* Drawer Container */}
          <div className="relative w-full sm:w-[440px] max-w-full bg-white shadow-2xl flex flex-col h-full max-h-full sm:max-h-[100dvh] overflow-hidden animate-slide-left z-10">
            {/* Drawer Header */}
            <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0 pt-safe">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Your Cart (আপনার কার্ট)</h2>
                  <p className="text-[11px] text-slate-500">{cartTotalCount} items selected</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {cart.length > 0 && (
                  <button
                    id="clear-cart-btn"
                    onClick={clearCart}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 hover:bg-rose-50 rounded-md transition-colors flex items-center gap-1"
                    title="Clear Cart"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
                <button
                  id="close-cart-btn"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Unified Scrollable Container: Cart Items + Bill Summary + Checkout Button */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 pb-36 sm:pb-24">
              {cart.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    পণ্য নির্বাচন করে কার্টে যোগ করুন!
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Explore Menu
                  </button>
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="space-y-3 divide-y divide-slate-100">
                    {cart.map(({ product, quantity, selectedVariant }) => {
                      const isRealVariant = selectedVariant && typeof selectedVariant === 'object' && typeof selectedVariant.price === 'number' && !isNaN(selectedVariant.price);
                      const unitPrice = isRealVariant 
                        ? selectedVariant.price 
                        : (typeof product.price === 'number' && !isNaN(product.price) ? product.price : 0);
                      const maxStock = isRealVariant 
                        ? (selectedVariant.stock ?? product.stock) 
                        : (product.stock ?? 99);
                      const safeQuantity = typeof quantity === 'number' && !isNaN(quantity) && quantity > 0 ? quantity : 1;
                      const isMaxStock = safeQuantity >= maxStock;
                      const itemTotal = unitPrice * safeQuantity;
                      const itemKey = isRealVariant ? `${product.id}-${selectedVariant.id}` : product.id;
                      const displayUnit = isRealVariant 
                        ? (selectedVariant.unit || selectedVariant.nameBn || selectedVariant.name) 
                        : product.unit;

                      return (
                        <div
                          key={itemKey}
                          id={`cart-item-${itemKey}`}
                          className="pt-3.5 first:pt-0 flex items-center justify-between gap-3"
                        >
                          {/* Image & Title */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-14 h-14 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                            />
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 truncate">
                                {product.nameBn || product.name}
                              </h4>
                              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                {displayUnit && (
                                  <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded-md">
                                    {displayUnit}
                                  </span>
                                )}
                                <p className="text-xs text-amber-800 font-extrabold">
                                  {settings.currencySymbol}{unitPrice} × {safeQuantity} = {settings.currencySymbol}{itemTotal}
                                </p>
                              </div>
                              {isMaxStock && (
                                <p className="text-[11px] text-amber-600 font-medium">
                                  সর্বোচ্চ স্টক ({maxStock})
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Stepper Controls */}
                          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 shrink-0">
                            <button
                              id={`cart-decrease-${itemKey}`}
                              onClick={() => updateCartQuantity(product.id, safeQuantity - 1, isRealVariant ? selectedVariant?.id : undefined)}
                              className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-800 flex items-center justify-center shadow-2xs active:scale-95 transition-all cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-black w-6 text-center text-slate-900">
                              {safeQuantity}
                            </span>
                            <button
                              id={`cart-increase-${itemKey}`}
                              onClick={() => updateCartQuantity(product.id, safeQuantity + 1, isRealVariant ? selectedVariant?.id : undefined)}
                              disabled={isMaxStock}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-2xs active:scale-95 transition-all ${
                                isMaxStock 
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                  : 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5 font-bold" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Bill Summary & Checkout Button Card */}
                  <div className="pt-2">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          বিল বিবরণী (Order Summary)
                        </span>
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                          {cartTotalCount} টি পণ্য
                        </span>
                      </div>

                      {/* Cost breakdown */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal (সাবটোটাল)</span>
                          <span className="font-semibold text-slate-900">
                            {settings.currencySymbol}{cartTotalAmount}
                          </span>
                        </div>

                        {settings.taxRate > 0 && (
                          <div className="flex justify-between text-slate-600">
                            <span>VAT / Tax ({settings.taxRate}%)</span>
                            <span className="font-semibold text-slate-900">
                              {settings.currencySymbol}{taxAmount}
                            </span>
                          </div>
                        )}

                        {orderType === 'delivery' && (
                          <div className="flex justify-between text-slate-600">
                            <span>Delivery Fee (ডেলিভারি ফি)</span>
                            <span className="font-semibold text-slate-900">
                              {settings.currencySymbol}{deliveryFee}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                          <span>Total Amount (সর্বমোট প্রদেয়)</span>
                          <span className="text-amber-800 text-base font-black">
                            {settings.currencySymbol}{estimatedTotal}
                          </span>
                        </div>
                      </div>

                      {/* Checkout Button */}
                      <button
                        id="proceed-checkout-btn"
                        onClick={handleProceedToCheckout}
                        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm sm:text-base font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
                      >
                        <span>Proceed to Checkout</span>
                        <span className="bg-amber-700/60 px-2 py-0.5 rounded-lg text-xs font-black">
                          {settings.currencySymbol}{estimatedTotal}
                        </span>
                        <ArrowRight className="w-4 h-4 ml-0.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
