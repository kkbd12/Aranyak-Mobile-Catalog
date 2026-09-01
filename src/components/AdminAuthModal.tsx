import React, { useState } from 'react';
import { Lock, KeyRound, ShieldCheck, X, Eye, EyeOff, Globe } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ isOpen, onClose }) => {
  const { loginAsAdmin } = useStore();
  const [enteredPin, setEnteredPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredPin) {
      setErrorMsg('দয়া করে অ্যাডমিন পিন বা পাসকোড দিন');
      return;
    }

    const success = loginAsAdmin(enteredPin);
    if (success) {
      setErrorMsg('');
      setEnteredPin('');
      onClose();
    } else {
      setErrorMsg('ভুল পিন কোড! সঠিক পিন প্রদান করুন।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div 
        id="admin-auth-modal-container"
        className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-in"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">মালিক / অ্যাডমিন লগইন</h2>
              <p className="text-[11px] text-amber-300 flex items-center gap-1 font-medium">
                <Globe className="w-3 h-3" />
                <span>ক্লাউড কন্ট্রোল প্যানেল</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleLogin} className="p-5 space-y-4">
          <div className="text-center py-1">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xs">
              <KeyRound className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-600 font-medium">
              দোকান পরিচালনা, ইনভেন্টরি স্টক ও অর্ডার দেখার জন্য আপনার সিকিউরিটি পিন দিন।
            </p>
          </div>

          {/* PIN Input Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              সিকিউরিটি পিন / পাসকোড:
            </label>
            <div className="relative flex items-center">
              <input
                id="admin-pin-input"
                type={showPin ? 'text' : 'password'}
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="পিন কোড লিখুন..."
                className="w-full text-center tracking-widest text-lg font-bold py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 font-mono transition-all"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                title={showPin ? 'লুকান' : 'দেখুন'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 font-bold text-center mt-1">{errorMsg}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-amber-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>অ্যাডমিন প্যানেলে প্রবেশ করুন</span>
          </button>
        </form>
      </div>
    </div>
  );
};
