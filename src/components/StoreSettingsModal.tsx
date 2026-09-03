import React, { useState } from 'react';
import { 
  X, 
  Store, 
  DollarSign, 
  Percent, 
  Truck, 
  Volume2, 
  Phone, 
  MapPin, 
  RotateCcw,
  Save,
  Check,
  KeyRound,
  Globe,
  CreditCard
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const StoreSettingsModal: React.FC = () => {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen, 
    settings, 
    updateSettings, 
    resetToSampleData,
    adminPin,
    changeAdminPin,
    isCloudConnected
  } = useStore();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [currency, setCurrency] = useState(settings.currency);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [deliveryFee, setDeliveryFee] = useState(settings.deliveryFee);
  const [phone, setPhone] = useState(settings.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || settings.phone || '+880 1711-889900');
  const [address, setAddress] = useState(settings.address);
  const [bkashNumber, setBkashNumber] = useState(settings.bkashNumber || '01700-000000');
  const [nagadNumber, setNagadNumber] = useState(settings.nagadNumber || '01800-000000');
  const [pin, setPin] = useState(adminPin || '1234');
  const [soundEffects, setSoundEffects] = useState(settings.soundEffects);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  if (!isSettingsOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      tagline,
      currency,
      currencySymbol,
      taxRate: Number(taxRate),
      deliveryFee: Number(deliveryFee),
      phone,
      whatsappNumber,
      address,
      bkashNumber,
      nagadNumber,
      soundEffects,
      adminPin: pin,
    });
    if (pin && pin !== adminPin) {
      changeAdminPin(pin);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsSettingsOpen(false);
    }, 600);
  };

  const handleConfirmReset = () => {
    resetToSampleData();
    setIsConfirmingReset(false);
    setIsSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="store-settings-modal"
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[calc(100dvh-1rem)] sm:max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-scale-in"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 pt-safe sm:pt-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">দোকান ও অ্যাডমিন সেটিংস</h2>
              <p className="text-xs text-slate-500">Store, Cloud &amp; Security Configuration</p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]">
          {/* Cloud Sync Status Banner */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Firebase ক্লাউড ডেটাবেস সক্রিয়</span>
            </div>
            <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-md font-bold">
              Worldwide Live Sync
            </span>
          </div>

          {/* Admin Security PIN */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-900">
              <KeyRound className="w-4 h-4 text-amber-700" />
              <label className="text-xs font-bold">অ্যাডমিন সিকিউরিটি পিন (PIN / Passcode)</label>
            </div>
            <p className="text-[11px] text-amber-800/80 font-medium">
              যে কোনো মোবাইল বা ল্যাপটপ থেকে অ্যাডমিন প্যানেলে লগইন করার জন্য এই পিন ব্যবহৃত হবে।
            </p>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="e.g. 1234"
              maxLength={6}
              className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-400"
              required
            />
          </div>

          {/* Store Name & Tagline */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                দোকানের নাম (Store Name)
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ট্যাগলাইন বা স্লোগান (Tagline)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500"
              />
            </div>
          </div>

          {/* Currency Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                কারেন্সি সিম্বল (Symbol)
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="৳, $, ¥, €"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ডেলিভারি চার্জ ({currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 font-semibold"
              />
            </div>
          </div>

          {/* Payment Account Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                বিকাশ মার্চেন্ট / পার্সোনাল নম্বর
              </label>
              <input
                type="text"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
                placeholder="017xxxxxxxx"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                নগদ নম্বর
              </label>
              <input
                type="text"
                value={nagadNumber}
                onChange={(e) => setNagadNumber(e.target.value)}
                placeholder="018xxxxxxxx"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                হটলাইন / কাস্টমার কেয়ার ফোন
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>হোয়াটসঅ্যাপ নম্বর (WhatsApp)</span>
                <span className="text-[10px] text-emerald-600 font-bold">সরাসরি চ্যাট</span>
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+880 17XXXXXXXX"
                className="w-full px-3.5 py-2 bg-emerald-50/50 border border-emerald-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              দোকানের ঠিকানা / আউটলেট
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500"
            />
          </div>

          {/* Sound toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={soundEffects}
                onChange={(e) => setSoundEffects(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-400"
              />
              <Volume2 className="w-4 h-4 text-slate-500" />
              <span>কার্টে পণ্য যোগ ও অর্ডারের সময় সাউন্ড ফিডব্যাক বাজবে</span>
            </label>
          </div>

          {/* Action Buttons */}
          {isConfirmingReset ? (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2.5 animate-scale-in">
              <p className="text-xs font-bold text-rose-800">
                সম্পূর্ণ ক্যাটালগ ও সেটিংস ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  হ্যাঁ, রিসেট করুন
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingReset(false)}
                  className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors"
                >
                  বাতিল
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmingReset(true)}
                className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>রিসেট ডিফল্ট</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>সংরক্ষিত হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>সেটিংস সেভ করুন</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
