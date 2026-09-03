import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  User, 
  ShoppingBag,
  Truck,
  MessageCircle,
  QrCode,
  Copy,
  Check,
  Banknote,
  ShieldCheck
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
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'cash' | 'bangla_qr'>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  const taxAmount = Math.round((cartTotalAmount * settings.taxRate) / 100);
  const deliveryFee = orderType === 'delivery' ? settings.deliveryFee : 0;
  const totalAmount = cartTotalAmount + taxAmount + deliveryFee;

  const handleCopy = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

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
        transactionId: transactionId.trim() || undefined,
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
            transactionId: placedOrder.transactionId,
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
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content with generous bottom padding for iframe / mobile browser scrolling */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain pb-32 sm:pb-8">
          {/* Cart Items Preview */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block">
              অর্ডারকৃত পণ্যের তালিকা ({cart.length}টি আইটেম):
            </span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {cart.map(({ product, quantity, selectedVariant }) => {
                const isRealVariant = selectedVariant && typeof selectedVariant === 'object' && typeof selectedVariant.price === 'number' && !isNaN(selectedVariant.price);
                const unitPrice = isRealVariant 
                  ? selectedVariant.price 
                  : (typeof product.price === 'number' && !isNaN(product.price) ? product.price : 0);
                const safeQuantity = typeof quantity === 'number' && !isNaN(quantity) && quantity > 0 ? quantity : 1;
                const displayUnit = isRealVariant 
                  ? (selectedVariant.unit || selectedVariant.nameBn || selectedVariant.name) 
                  : product.unit;
                const itemKey = isRealVariant ? `${product.id}-${selectedVariant.id}` : product.id;

                return (
                  <div key={itemKey} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-black text-amber-700">{safeQuantity}×</span>
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
                      {settings.currencySymbol}{unitPrice * safeQuantity}
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
                className={`py-2.5 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
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
                className={`py-2.5 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
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
                className={`py-2.5 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
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

          {/* Payment Method Selector: Bkash, Cash on Delivery, Bangla QR */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              পেমেন্ট মাধ্যম (Payment Method)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* 1. bKash */}
              <label
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                  paymentMethod === 'bkash'
                    ? 'border-pink-500 bg-pink-50 text-pink-700 ring-2 ring-pink-400 shadow-2xs'
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
                <span className="text-xs font-black text-pink-600">bKash</span>
                <span className="text-[10px] text-slate-600">বিকাশ পেমেন্ট</span>
              </label>

              {/* 2. Cash on Delivery */}
              <label
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-400 shadow-2xs'
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
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] text-center leading-tight">ক্যাশ অন ডেলিভারি</span>
              </label>

              {/* 3. Bangla QR */}
              <label
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                  paymentMethod === 'bangla_qr'
                    ? 'border-sky-600 bg-sky-50 text-sky-800 ring-2 ring-sky-400 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="bangla_qr"
                  checked={paymentMethod === 'bangla_qr'}
                  onChange={() => setPaymentMethod('bangla_qr')}
                  className="sr-only"
                />
                <div className="flex items-center gap-0.5">
                  <QrCode className="w-3.5 h-3.5 text-sky-600" />
                  <span className="text-xs font-black text-sky-700">বাংলা QR</span>
                </div>
                <span className="text-[10px] text-slate-600">Bangla QR</span>
              </label>
            </div>

            {/* Dynamic Payment Details & Instructions Box */}
            <div className="mt-3">
              {/* bKash Details */}
              {paymentMethod === 'bkash' && (
                <div className="p-3.5 bg-pink-50/70 rounded-2xl border border-pink-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-pink-900">বিকাশ পার্সোনাল / মার্চেন্ট নম্বর:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(settings.bkashNumber || '01711-889900')}
                      className="text-[11px] font-semibold text-pink-700 hover:text-pink-800 bg-white border border-pink-300 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                    </button>
                  </div>
                  <div className="text-base font-black text-pink-700 font-mono tracking-wider bg-white px-3 py-1.5 rounded-xl border border-pink-200/80">
                    {settings.bkashNumber || '01711-889900'}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    💡 বিকাশ অ্যাপে গিয়ে <strong>Send Money</strong> অথবা <strong>Payment</strong> করুন। মোট প্রদেয়: <strong className="text-pink-700">{settings.currencySymbol}{totalAmount}</strong>। পেমেন্ট করার পর প্রাপ্ত TrxID টি নিচে দিন।
                  </p>
                  <div>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="বিকাশ Transaction ID (TrxID) লিখুন - যেমন: BL98XA72K"
                      className="w-full px-3 py-2 bg-white border border-pink-200 rounded-xl text-xs font-mono placeholder:font-sans focus:border-pink-500 focus:ring-1 focus:ring-pink-400"
                    />
                  </div>
                </div>
              )}

              {/* Cash on Delivery Details */}
              {paymentMethod === 'cash' && (
                <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1.5 text-xs text-emerald-900">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>ক্যাশ অন ডেলিভারি (Cash on Delivery)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    পণ্য বাসায় পৌঁছানোর পর ডেলিভারিম্যানকে ঠিক <strong>{settings.currencySymbol}{totalAmount}</strong> নগদ বুঝিয়ে দিন। পণ্য হাতে পাওয়ার আগে কোনো অগ্রিম টাকা দেওয়ার প্রয়োজন নেই।
                  </p>
                </div>
              )}

              {/* Bangla QR Details */}
              {paymentMethod === 'bangla_qr' && (
                <div className="p-3.5 bg-sky-50/80 rounded-2xl border border-sky-200 space-y-3">
                  {/* Bangla QR Header Banner */}
                  <div className="flex items-center justify-between border-b border-sky-200/80 pb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center font-black text-xs">
                        QR
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-sky-950">বাংলা কিউআর (Bangla QR)</h4>
                        <p className="text-[10px] text-sky-700">বাংলাদেশ ব্যাংক অনুমোদিত ইন্টারঅপারেবল কিউআর</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-sky-200/70 text-sky-900 px-2 py-0.5 rounded-full">
                      সব অ্যাপ সমর্থিত
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    যেকোনো ব্যাংক অ্যাপ (Citytouch, EBL SKYBANKING, BRAC Bank ইত্যাদি) অথবা bKash, Nagad, Upay অ্যাপের <strong>'QR স্ক্যান'</strong> অপশন দিয়ে নিচের কিউআর কোড স্ক্যান করে সরাসরি পেমেন্ট করুন।
                  </p>

                  {/* QR Presentation Box */}
                  <div className="bg-white p-3.5 rounded-xl border border-sky-200 shadow-2xs flex flex-col items-center text-center">
                    {settings.banglaQrImageUrl ? (
                      <img
                        src={settings.banglaQrImageUrl}
                        alt="Bangla QR Code"
                        className="w-48 h-48 object-contain rounded-lg border border-slate-100"
                      />
                    ) : (
                      <div className="relative w-44 h-44 bg-white p-2 border-2 border-dashed border-sky-300 rounded-xl flex flex-col items-center justify-center">
                        {/* Realistic scannable visual SVG representation */}
                        <svg className="w-32 h-32 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                          {/* Corner Markers */}
                          <path d="M5 5 h30 v30 h-30 z M10 10 v20 h20 v-20 z M15 15 h10 v10 h-10 z" />
                          <path d="M65 5 h30 v30 h-30 z M70 10 v20 h20 v-20 z M75 15 h10 v10 h-10 z" />
                          <path d="M5 65 h30 v30 h-30 z M10 70 v20 h20 v-20 z M15 75 h10 v10 h-10 z" />
                          {/* Data Pattern */}
                          <rect x="42" y="10" width="6" height="6" />
                          <rect x="52" y="10" width="6" height="6" />
                          <rect x="42" y="20" width="16" height="6" />
                          <rect x="10" y="42" width="10" height="6" />
                          <rect x="25" y="42" width="6" height="16" />
                          <rect x="42" y="42" width="6" height="6" />
                          <rect x="52" y="42" width="16" height="6" />
                          <rect x="72" y="42" width="18" height="6" />
                          <rect x="42" y="52" width="16" height="6" />
                          <rect x="62" y="52" width="6" height="16" />
                          <rect x="72" y="52" width="18" height="6" />
                          <rect x="42" y="72" width="10" height="18" />
                          <rect x="56" y="72" width="14" height="6" />
                          <rect x="74" y="72" width="16" height="18" />
                          <rect x="56" y="82" width="14" height="8" />
                        </svg>
                        {/* Center Bangla QR Badge */}
                        <div className="absolute inset-0 m-auto w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black shadow-md border-2 border-white">
                          বাংলা QR
                        </div>
                      </div>
                    )}

                    <div className="mt-2.5">
                      <div className="text-xs font-bold text-slate-900">
                        {settings.banglaQrMerchantName || settings.storeName || 'সরিষার তেল ও খাঁটি খাবার'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        মার্চেন্ট আইডি / নম্বর: {settings.banglaQrNumber || settings.phone || '01711-889900'}
                      </div>
                      <div className="mt-1 inline-block bg-sky-100 text-sky-900 px-2.5 py-0.5 rounded-full text-xs font-black">
                        প্রদেয়: {settings.currencySymbol}{totalAmount}
                      </div>
                    </div>
                  </div>

                  {/* TrxID / Ref input */}
                  <div>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="পেমেন্ট শেষে Transaction ID / TrxID দিন (ঐচ্ছিক)"
                      className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs font-mono placeholder:font-sans focus:border-sky-500 focus:ring-1 focus:ring-sky-400"
                    />
                  </div>
                </div>
              )}
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
