import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  DollarSign, 
  ShoppingBag,
  Truck,
  MessageCircle,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { OrderType } from '../types';
import { generateWhatsAppOrderText, openWhatsAppChat } from '../utils/whatsapp';

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    settings, 
    cartTotalAmount, 
    placeOrder,
    orderType: defaultOrderType,
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<OrderType>(defaultOrderType || 'delivery');
  const [tableNumber, setTableNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'card'>('bkash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  const taxAmount = Math.round((cartTotalAmount * settings.taxRate) / 100);
  const deliveryFee = orderType === 'delivery' ? settings.deliveryFee : 0;
  const totalAmount = cartTotalAmount + taxAmount + deliveryFee;

  const validateForm = () => {
    if (!customerName.trim()) {
      alert('অনুগ্রহ করে আপনার নাম প্রদান করুন');
      return false;
    }
    if (!customerPhone.trim()) {
      alert('অনুগ্রহ করে আপনার মোবাইল নম্বর প্রদান করুন');
      return false;
    }
    if (orderType !== 'takeaway' && !deliveryAddress.trim()) {
      alert('অনুগ্রহ করে ডেলিভারির ঠিকানা প্রদান করুন');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = (shareViaWhatsApp = false) => {
    if (cart.length === 0) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const placedOrder = placeOrder({
        customerName: customerName.trim() || 'সম্মানিত ক্রেতা (Customer)',
        customerPhone: customerPhone.trim() || 'N/A',
        orderType,
        tableNumber: orderType === 'dine_in' ? (tableNumber || 'Parcel') : undefined,
        deliveryAddress: (orderType === 'delivery' || orderType === 'dine_in') ? deliveryAddress : undefined,
        paymentMethod,
        notes: notes.trim() || undefined,
      });

      if (placedOrder) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        if (shareViaWhatsApp) {
          const message = generateWhatsAppOrderText({
            orderNumber: placedOrder.orderNumber,
            customerName: placedOrder.customerName,
            customerPhone: placedOrder.customerPhone,
            orderType: placedOrder.orderType,
            deliveryAddress: placedOrder.deliveryAddress,
            paymentMethod: placedOrder.paymentMethod,
            notes: placedOrder.notes,
            items: placedOrder.items,
            subtotal: placedOrder.subtotal,
            deliveryFee: placedOrder.deliveryFee,
            tax: placedOrder.tax,
            total: placedOrder.total,
            settings
          });

          const targetPhone = settings.whatsappNumber || settings.phone || '';
          openWhatsAppChat({ phone: targetPhone, message });
        }

        setIsCheckoutOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePlaceOrder(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="checkout-modal-container"
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[calc(100dvh-1rem)] sm:max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-scale-in"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 pt-safe sm:pt-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">অর্ডার কনফার্ম করুন</h2>
              <p className="text-xs text-slate-500">পণ্য সরবরাহ ও পেমেন্টের তথ্য দিন</p>
            </div>
          </div>
          <button
            id="close-checkout-btn"
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]">
          {/* Cart Items Preview */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block">
              অর্ডারকৃত পণ্যের তালিকা ({cart.length}টি আইটেম):
            </span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {cart.map(({ product, quantity, selectedVariant }) => {
                const unitPrice = selectedVariant ? selectedVariant.price : product.price;
                const displayUnit = selectedVariant 
                  ? (selectedVariant.nameBn || selectedVariant.weight) 
                  : product.unit;
                const itemKey = selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id;

                return (
                  <div key={itemKey} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-black text-amber-700">{quantity}×</span>
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900 truncate block">
                          {product.nameBn || product.name}
                        </span>
                        {displayUnit && (
                          <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded font-medium inline-block">
                            {displayUnit}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-slate-800 shrink-0 ml-2">
                      {settings.currencySymbol}{unitPrice * quantity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Delivery Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              ডেলিভারি মাধ্যম নির্বাচন করুন
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="checkout-type-delivery"
                onClick={() => setOrderType('delivery')}
                className={`py-2.5 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  orderType === 'delivery'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-2xs ring-1 ring-amber-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>হোম ডেলিভারি</span>
                <span className="text-[10px] text-slate-400 font-normal">বাসায় পৌঁছে দেবে</span>
              </button>

              <button
                type="button"
                id="checkout-type-takeaway"
                onClick={() => setOrderType('takeaway')}
                className={`py-2.5 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  orderType === 'takeaway'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-2xs ring-1 ring-amber-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <span>শপ পিকআপ</span>
                <span className="text-[10px] text-slate-400 font-normal">দোকান থেকে সংগ্রহ</span>
              </button>

              <button
                type="button"
                id="checkout-type-dinein"
                onClick={() => setOrderType('dine_in')}
                className={`py-2.5 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  orderType === 'dine_in'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-2xs ring-1 ring-amber-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Truck className="w-4 h-4 text-amber-600" />
                <span>কুরিয়ার পার্সেল</span>
                <span className="text-[10px] text-slate-400 font-normal">সারা দেশে ডেলিভারি</span>
              </button>
            </div>
          </div>

          {/* Delivery Address field */}
          {orderType !== 'takeaway' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ডেলিভারির পূর্ণাঙ্গ ঠিকানা *
              </label>
              <textarea
                id="checkout-address-input"
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="বাসা/হোল্ডিং নম্বর, রোড, এলাকা, জেলা/উপজেলা এবং ল্যান্ডমার্ক..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>
          )}

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                আপনার নাম *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="checkout-name-input"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="যেমন: মোঃ শফিকুল ইসলাম"
                  className="w-full pl-8.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                মোবাইল নম্বর *
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="checkout-phone-input"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full pl-8.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              পেমেন্ট মাধ্যম (Payment Method)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <label
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                  paymentMethod === 'bkash'
                    ? 'border-pink-500 bg-pink-50 text-pink-700 ring-2 ring-pink-400'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="bkash"
                  checked={paymentMethod === 'bkash'}
                  onChange={() => setPaymentMethod('bkash')}
                  className="sr-only"
                />
                <span className="text-[11px] font-black text-pink-600">bKash</span>
                <span className="text-[9px] text-slate-500">বিকাশ পেমেন্ট</span>
              </label>

              <label
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                  paymentMethod === 'nagad'
                    ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-400'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="nagad"
                  checked={paymentMethod === 'nagad'}
                  onChange={() => setPaymentMethod('nagad')}
                  className="sr-only"
                />
                <span className="text-[11px] font-black text-orange-600">Nagad</span>
                <span className="text-[9px] text-slate-500">নগদ একাউন্ট</span>
              </label>

              <label
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-400'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="sr-only"
                />
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px]">ক্যাশ অন ডেলিভারি</span>
              </label>

              <label
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-400'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="sr-only"
                />
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span className="text-[11px]">কার্ড / ব্যাংক</span>
              </label>
            </div>
          </div>

          {/* Packaging Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              বিশেষ কোনো নির্দেশনা বা নোট (ঐচ্ছিক)
            </label>
            <input
              id="checkout-notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="যেমন: মসলাগুলো ভালো পলি প্যাকে সিল করবেন..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Bill Summary Banner */}
          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-700">
              <span>আইটেম সংখ্যা ({cart.reduce((s, i) => s + i.quantity, 0)}টি পণ্য)</span>
              <span className="font-semibold">{settings.currencySymbol}{cartTotalAmount}</span>
            </div>
            {orderType === 'delivery' && (
              <div className="flex justify-between text-slate-700">
                <span>হোম ডেলিভারি চার্জ</span>
                <span className="font-semibold">{settings.currencySymbol}{deliveryFee}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-amber-200">
              <span>সর্বমোট প্রদেয় টাকা</span>
              <span className="text-amber-800 text-base font-black">{settings.currencySymbol}{totalAmount}</span>
            </div>
          </div>

          {/* Action Buttons: WhatsApp Share & Standard Place Order */}
          <div className="space-y-2 pt-1">
            {/* Primary: Share Order via WhatsApp */}
            <button
              id="share-order-whatsapp-btn"
              type="button"
              onClick={() => handlePlaceOrder(true)}
              disabled={isSubmitting || cart.length === 0}
              className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-black rounded-2xl shadow-lg shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
              </div>
              <span>WhatsApp-এ সরাসরি অর্ডার পাঠান</span>
              <span className="bg-black/15 text-white text-xs px-2 py-0.5 rounded-lg font-mono">
                {settings.currencySymbol}{totalAmount}
              </span>
            </button>

            {/* Secondary: Place Order in App */}
            <button
              id="confirm-place-order-btn"
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>অ্যাপে অর্ডার সম্পন্ন করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
