import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { CategorySidebar } from './components/CategorySidebar';
import { ProductFeed } from './components/ProductFeed';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AddProductModal } from './components/AddProductModal';
import { InventoryManager } from './components/InventoryManager';
import { OrderManager } from './components/OrderManager';
import { StoreSettingsModal } from './components/StoreSettingsModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { Smartphone, Monitor, Lock, Phone, MapPin, Sparkles, ShieldCheck } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { 
    activeView, 
    activeOrderNumber, 
    isAdminAuthenticated,
    isAdminAuthOpen,
    setIsAdminAuthOpen,
    settings
  } = useStore();

  const [isPhoneFrame, setIsPhoneFrame] = useState(false);
  const [confirmedOrderToView, setConfirmedOrderToView] = useState<string | null>(null);

  // Sync active order notification
  React.useEffect(() => {
    if (activeOrderNumber) {
      setConfirmedOrderToView(activeOrderNumber);
    }
  }, [activeOrderNumber]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Device Simulation Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">{settings.storeName}</span>
          <span className="text-slate-400 hidden sm:inline">• ক্লাউড ক্যাটালগ ও রিয়েল-টাইম অর্ডার</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
              isPhoneFrame
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Toggle Phone Frame mode"
          >
            {isPhoneFrame ? <Monitor className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
            <span>{isPhoneFrame ? 'ফুলস্ক্রিন ভিউ' : 'মোবাইল ফ্রেম ভিউ'}</span>
          </button>
        </div>
      </div>

      {/* App Container */}
      <div className={`flex-1 flex flex-col mx-auto w-full transition-all duration-300 ${
        isPhoneFrame 
          ? 'max-w-[430px] my-4 shadow-2xl rounded-[40px] border-8 border-slate-800 bg-white overflow-hidden ring-1 ring-slate-900/10' 
          : 'bg-white shadow-xs'
      }`}>
        {/* Dynamic Island / Speaker cutout in Phone Frame mode */}
        {isPhoneFrame && (
          <div className="bg-slate-900 h-6 flex items-center justify-center relative select-none">
            <div className="w-24 h-4 bg-black rounded-full" />
          </div>
        )}

        {/* Global App Header (Shows pure catalog for customers, full control room for admin) */}
        <Header />

        {/* Dynamic Main Body Content */}
        <main className="flex-1 flex flex-col min-h-0 relative">
          {activeView === 'customer_menu' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
              <div className="flex-1 flex min-h-0">
                {/* Category Sidebar (Visible on desktop screens when not in phone frame) */}
                {!isPhoneFrame && <CategorySidebar />}

                {/* Continuous Product List with Photos */}
                <ProductFeed />
              </div>

              {/* Discreet Customer Footer */}
              <footer className="bg-slate-900 text-slate-400 py-6 px-4 border-t border-slate-800 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">{settings.storeName}</span>
                      <span className="text-[11px] text-slate-400">{settings.tagline}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      {settings.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {settings.address}
                    </span>
                  </div>

                  {/* Discreet Admin Link in footer */}
                  <div>
                    {!isAdminAuthenticated ? (
                      <button
                        onClick={() => setIsAdminAuthOpen(true)}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-400 bg-slate-800/80 hover:bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 transition-colors"
                      >
                        <Lock className="w-3 h-3" />
                        <span>মালিক / অ্যাডমিন লগইন</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>অ্যাডমিন মোড সক্রিয়</span>
                      </span>
                    )}
                  </div>
                </div>
              </footer>
            </div>
          )}

          {activeView === 'admin_inventory' && (
            <div className="flex-1 overflow-y-auto bg-slate-50">
              <InventoryManager />
            </div>
          )}

          {activeView === 'admin_orders' && (
            <div className="flex-1 overflow-y-auto bg-slate-50">
              <OrderManager />
            </div>
          )}
        </main>

        {/* Floating Cart Bar & Slide-in Drawer */}
        <CartDrawer />

        {/* Modals */}
        <CheckoutModal />
        <ProductDetailModal />
        <AddProductModal />
        <StoreSettingsModal />
        <AdminAuthModal 
          isOpen={isAdminAuthOpen} 
          onClose={() => setIsAdminAuthOpen(false)} 
        />
        <OrderConfirmationModal 
          orderNumber={confirmedOrderToView} 
          onClose={() => setConfirmedOrderToView(null)} 
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}
