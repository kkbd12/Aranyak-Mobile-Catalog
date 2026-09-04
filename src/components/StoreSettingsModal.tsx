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
  CreditCard, 
  Upload,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Laptop,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

/**
 * Optimizes an uploaded image file into a square crisp favicon data URL.
 * SVGs are kept as crisp vectors; raster images (PNG, JPG, ICO, WEBP)
 * are centered and rendered to a 256x256 high-density canvas PNG.
 */
const optimizeImageForFavicon = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If SVG, read as text/dataURL to preserve vector crispness
    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read SVG file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    // For raster images (PNG, JPG, ICO, WebP, etc.)
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const size = 256; // Standard crisp high-res icon size
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.clearRect(0, 0, size, size);

          // Calculate scaling and centering to fit inside square canvas
          const aspect = img.width / img.height;
          let drawWidth = size;
          let drawHeight = size;
          let dx = 0;
          let dy = 0;

          if (aspect > 1) {
            drawHeight = size / aspect;
            dy = (size - drawHeight) / 2;
          } else if (aspect < 1) {
            drawWidth = size * aspect;
            dx = (size - drawWidth) / 2;
          }

          ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
          const dataUrl = canvas.toDataURL('image/png', 0.95);
          resolve(dataUrl);
        } catch (err) {
          console.warn('Canvas resize error, fallback to dataURL:', err);
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => {
        if (typeof event.target?.result === 'string') {
          resolve(event.target.result);
        } else {
          reject(new Error('Failed to load image into element'));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

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

  // Navigation Tab in Modal
  const [activeTab, setActiveTab] = useState<'favicon' | 'store' | 'payment'>('favicon');

  // Form States
  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [currency, setCurrency] = useState(settings.currency);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [deliveryFee, setDeliveryFee] = useState(settings.deliveryFee);
  const [phone, setPhone] = useState(settings.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || settings.phone || '+880 1711-889900');
  const [address, setAddress] = useState(settings.address);
  const [bkashNumber, setBkashNumber] = useState(settings.bkashNumber || '01711-889900');
  const [banglaQrNumber, setBanglaQrNumber] = useState(settings.banglaQrNumber || '01711-889900');
  const [banglaQrMerchantName, setBanglaQrMerchantName] = useState(settings.banglaQrMerchantName || settings.storeName || 'সরিষার তেল ও খাঁটি খাবার');
  const [banglaQrImageUrl, setBanglaQrImageUrl] = useState(settings.banglaQrImageUrl || '');
  const [nagadNumber, setNagadNumber] = useState(settings.nagadNumber || '01800-000000');
  const [pin, setPin] = useState(adminPin || '1234');
  
  // Favicon & Logo States
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl || settings.logoUrl || '/favicon.svg');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '/favicon.svg');
  const [syncLogoWithFavicon, setSyncLogoWithFavicon] = useState(true);
  const [customFaviconUrlInput, setCustomFaviconUrlInput] = useState('');
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isLiveTested, setIsLiveTested] = useState(false);

  const [soundEffects, setSoundEffects] = useState(settings.soundEffects);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  if (!isSettingsOpen) return null;

  // Handle Favicon File Upload
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingUpload(true);
      setUploadMessage('ফেভিকন প্রসেস ও অপ্টিমাইজ করা হচ্ছে...');
      const optimizedUrl = await optimizeImageForFavicon(file);
      setFaviconUrl(optimizedUrl);
      if (syncLogoWithFavicon) {
        setLogoUrl(optimizedUrl);
      }
      setUploadMessage('নতুন ফেভিকন সফলভাবে লোড হয়েছে!');
      setTimeout(() => setUploadMessage(null), 3000);
    } catch (err) {
      console.error('Favicon upload error:', err);
      setUploadMessage('দুঃখিত, ছবিটি প্রসেস করা সম্ভব হয়নি। অন্য ফরম্যাটে চেষ্টা করুন।');
    } finally {
      setIsProcessingUpload(false);
    }
  };

  // Handle Separate Store Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingUpload(true);
      const optimizedUrl = await optimizeImageForFavicon(file);
      setLogoUrl(optimizedUrl);
    } catch (err) {
      console.error('Logo upload error:', err);
    } finally {
      setIsProcessingUpload(false);
    }
  };

  // Apply Direct URL
  const handleApplyUrlFavicon = () => {
    if (!customFaviconUrlInput.trim()) return;
    setFaviconUrl(customFaviconUrlInput.trim());
    if (syncLogoWithFavicon) {
      setLogoUrl(customFaviconUrlInput.trim());
    }
    setCustomFaviconUrlInput('');
    setUploadMessage('ইউআরএল ফেভিকন যুক্ত হয়েছে!');
    setTimeout(() => setUploadMessage(null), 2500);
  };

  // Instant Live Test in Current Browser Tab
  const handleTestInBrowserTab = () => {
    if (typeof document !== 'undefined') {
      const activeUrl = faviconUrl || '/favicon.svg';
      const iconLinks = document.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon']");
      if (iconLinks.length > 0) {
        iconLinks.forEach(link => {
          link.setAttribute('href', activeUrl);
        });
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = activeUrl;
        document.head.appendChild(link);
      }
      setIsLiveTested(true);
      setTimeout(() => setIsLiveTested(false), 3000);
    }
  };

  // Reset to default Aranayak Logo & Favicon
  const handleResetFavicon = () => {
    setFaviconUrl('/favicon.svg');
    setLogoUrl('/favicon.svg');
    setUploadMessage('ডিফল্ট আরণ্যক লোগোতে রিসেট করা হয়েছে!');
    setTimeout(() => setUploadMessage(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalLogo = syncLogoWithFavicon ? faviconUrl : logoUrl;

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
      banglaQrNumber,
      banglaQrMerchantName,
      banglaQrImageUrl,
      nagadNumber,
      soundEffects,
      adminPin: pin,
      faviconUrl,
      logoUrl: finalLogo,
    });

    if (pin && pin !== adminPin) {
      changeAdminPin(pin);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsSettingsOpen(false);
    }, 700);
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
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[calc(100dvh-1rem)] sm:max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-scale-in"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 pt-safe sm:pt-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">অ্যাডমিন প্যানেল ও স্টোর সেটিংস</h2>
              <p className="text-xs text-slate-500">ফেভিকন আপলোড, নিরাপত্তা পিন ও স্টোর কনফিগারেশন</p>
            </div>
          </div>

          <button
            id="close-settings-modal-btn"
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-1 border-b border-slate-100 bg-white shrink-0 overflow-x-auto">
          <button
            type="button"
            id="tab-favicon-btn"
            onClick={() => setActiveTab('favicon')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'favicon'
                ? 'bg-amber-600 text-white shadow-xs shadow-amber-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>ফেভিকন ও লোগো</span>
          </button>

          <button
            type="button"
            id="tab-store-btn"
            onClick={() => setActiveTab('store')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'store'
                ? 'bg-amber-600 text-white shadow-xs shadow-amber-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>দোকানের তথ্য ও পিন</span>
          </button>

          <button
            type="button"
            id="tab-payment-btn"
            onClick={() => setActiveTab('payment')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'payment'
                ? 'bg-amber-600 text-white shadow-xs shadow-amber-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>পেমেন্ট ও ডেলিভারি</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]">
          
          {/* TAB 1: FAVICON & BRAND LOGO */}
          {activeTab === 'favicon' && (
            <div className="space-y-4 animate-fade-in">
              {/* Header Box */}
              <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-200/80 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">ব্রাউজার ফেভিকন আপলোড সেন্টার</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      যে কোনো ছবি (PNG, SVG, JPG, WEBP, ICO) আপলোড করুন। এটি ব্রাউজার ট্যাব আইকন, বুকমার্ক বার এবং মোবাইল হোমস্ক্রিন অ্যাপ আইকন হিসেবে সরাসরি প্রদর্শিত হবে।
                    </p>
                  </div>
                </div>
              </div>

              {/* Browser Tab Simulation Preview */}
              <div className="p-3.5 bg-slate-900 rounded-2xl shadow-sm text-white space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Laptop className="w-3.5 h-3.5 text-amber-400" />
                    লাইভ ব্রাউজার ট্যাব প্রিভিউ (Live Tab Simulation)
                  </span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-mono">
                    Chrome / Safari Tab
                  </span>
                </div>

                {/* The Simulated Chrome Tab */}
                <div className="bg-slate-800/90 rounded-xl p-2.5 flex items-center gap-2 border border-slate-700/60 max-w-sm">
                  <div className="w-5 h-5 rounded-md bg-white p-0.5 shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
                    <img 
                      src={faviconUrl || '/favicon.svg'} 
                      alt="Favicon Tab" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate flex-1">
                    {storeName} - {tagline.substring(0, 24)}...
                  </span>
                  <span className="text-slate-500 hover:text-slate-300 text-xs px-1 font-mono cursor-default">
                    ×
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-tight">
                  কাস্টমাররা যখনই আপনার সাইটে প্রবেশ করবে বা বুকমার্ক করবে, তখন ঠিক এই আইকনটি ট্যাবের শীর্ষে দেখতে পাবে।
                </p>
              </div>

              {/* Multi-Scale Size Demonstration */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  বিভিন্ন ডিসপ্লে স্কেলে ফেভিকন প্রিভিউ (Multi-Size Resolution)
                </span>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {/* 16x16 */}
                  <div className="flex flex-col items-center justify-center p-2.5 bg-white border border-slate-200 rounded-xl">
                    <div className="w-4 h-4 bg-white rounded-xs p-0.5 flex items-center justify-center border border-slate-200 overflow-hidden shadow-2xs">
                      <img src={faviconUrl || '/favicon.svg'} alt="16px" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 mt-1.5">16×16 px</span>
                    <span className="text-[9px] text-slate-400">ট্যাব আইকন</span>
                  </div>

                  {/* 32x32 */}
                  <div className="flex flex-col items-center justify-center p-2.5 bg-white border border-slate-200 rounded-xl">
                    <div className="w-8 h-8 bg-white rounded-md p-0.5 flex items-center justify-center border border-slate-200 overflow-hidden shadow-xs">
                      <img src={faviconUrl || '/favicon.svg'} alt="32px" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 mt-1.5">32×32 px</span>
                    <span className="text-[9px] text-slate-400">বুকমার্ক</span>
                  </div>

                  {/* 64x64 */}
                  <div className="flex flex-col items-center justify-center p-2.5 bg-white border border-slate-200 rounded-xl">
                    <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center border border-slate-200 overflow-hidden shadow-xs">
                      <img src={faviconUrl || '/favicon.svg'} alt="64px" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 mt-1.5">64×64 px</span>
                    <span className="text-[9px] text-slate-400">টাস্কবার</span>
                  </div>

                  {/* 128x128 */}
                  <div className="flex flex-col items-center justify-center p-2.5 bg-white border border-slate-200 rounded-xl">
                    <div className="w-14 h-14 bg-white rounded-xl p-1 flex items-center justify-center border border-slate-200 overflow-hidden shadow-xs">
                      <img src={faviconUrl || '/favicon.svg'} alt="128px" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 mt-1.5">128×128 px</span>
                    <span className="text-[9px] text-slate-400">হোমস্ক্রিন</span>
                  </div>
                </div>
              </div>

              {/* Upload Actions & Controls */}
              <div className="p-4 bg-white border-2 border-dashed border-amber-300 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* File Upload Button */}
                  <label className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm shadow-amber-600/20 active:scale-98">
                    <Upload className="w-4 h-4" />
                    <span>ডিভাইস থেকে ফেভিকন আপলোড করুন</span>
                    <input
                      type="file"
                      accept="image/png,image/svg+xml,image/jpeg,image/webp,image/x-icon"
                      onChange={handleFaviconUpload}
                      disabled={isProcessingUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Live Tab Test Button */}
                  <button
                    type="button"
                    onClick={handleTestInBrowserTab}
                    className="w-full sm:w-auto px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    title="বর্তমান ট্যাবে সাথে সাথে টেস্ট করে দেখুন"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isLiveTested ? 'ট্যাবে প্রয়োগ হয়েছে!' : 'ট্যাবে টেস্ট করুন'}</span>
                  </button>

                  {/* Reset to Aranayak Button */}
                  {faviconUrl !== '/favicon.svg' && (
                    <button
                      type="button"
                      onClick={handleResetFavicon}
                      className="px-3 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                      title="মূল আরণ্যক লোগোতে ফেরত যান"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>রিসেট</span>
                    </button>
                  )}
                </div>

                {/* Direct Image URL input */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <input
                    type="url"
                    value={customFaviconUrlInput}
                    onChange={(e) => setCustomFaviconUrlInput(e.target.value)}
                    placeholder="অথবা সরাসরি ফেভিকন ছবির লিঙ্ক (URL) দিন..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrlFavicon}
                    disabled={!customFaviconUrlInput.trim()}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
                  >
                    যুক্ত করুন
                  </button>
                </div>

                {uploadMessage && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{uploadMessage}</span>
                  </div>
                )}
              </div>

              {/* Sync Logo Checkbox */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={syncLogoWithFavicon}
                    onChange={(e) => setSyncLogoWithFavicon(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span>ফেভিকনটি স্টোরের মূল হেডার লোগো হিসেবেও ব্যবহার করুন</span>
                </label>

                {!syncLogoWithFavicon && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                        <img src={logoUrl || '/favicon.svg'} alt="Store Logo" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">আলাদা স্টোর হেডার লোগো</span>
                        <span className="text-[10px] text-slate-500">সাইটের টপবারে এটি দেখাবে</span>
                      </div>
                    </div>

                    <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>লোগো আপলোড</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: STORE INFO & SECURITY */}
          {activeTab === 'store' && (
            <div className="space-y-4 animate-fade-in">
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

              {/* Phone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    মোবাইল নাম্বার (অর্ডার হেল্পলাইন)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    হোয়াটসঅ্যাপ নাম্বার
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  দোকানের ঠিকানা / শপ লোকেশন
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENT & DELIVERY */}
          {activeTab === 'payment' && (
            <div className="space-y-4 animate-fade-in">
              {/* Delivery Fee & Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ডেলিভারি চার্জ (টাকা)
                  </label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 font-bold"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    কারেন্সি সিম্বল
                  </label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    placeholder="৳, $, ¥"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 font-bold"
                    required
                  />
                </div>
              </div>

              {/* bKash & Nagad */}
              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-rose-900 block">মোবাইল ব্যাংকিং পেমেন্ট নম্বর</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">বিকাশ (bKash) নম্বর</label>
                    <input
                      type="text"
                      value={bkashNumber}
                      onChange={(e) => setBkashNumber(e.target.value)}
                      placeholder="01711-xxxxxx"
                      className="w-full px-3 py-1.5 bg-white border border-rose-300 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">নগদ (Nagad) নম্বর</label>
                    <input
                      type="text"
                      value={nagadNumber}
                      onChange={(e) => setNagadNumber(e.target.value)}
                      placeholder="01800-xxxxxx"
                      className="w-full px-3 py-1.5 bg-white border border-rose-300 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Bangla QR */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <span className="text-xs font-bold text-slate-800 block">বাংলা কিউআর (Bangla QR) সেটিংস</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">মার্চেন্ট নাম</label>
                    <input
                      type="text"
                      value={banglaQrMerchantName}
                      onChange={(e) => setBanglaQrMerchantName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">বাংলা QR একাউন্ট নম্বর</label>
                    <input
                      type="text"
                      value={banglaQrNumber}
                      onChange={(e) => setBanglaQrNumber(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>
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
            </div>
          )}

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
                id="save-settings-btn"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
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
