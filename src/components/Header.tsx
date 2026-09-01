import React from 'react';
import { 
  Search, 
  X, 
  Plus, 
  Boxes, 
  ClipboardList, 
  Store, 
  Settings, 
  MapPin,
  ShoppingBag,
  Truck,
  Sparkles,
  Lock,
  LogOut,
  Globe,
  ShoppingCart
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { OrderType } from '../types';

export const Header: React.FC = () => {
  const { 
    settings, 
    activeView, 
    setActiveView, 
    searchQuery, 
    setSearchQuery, 
    setIsAddProductOpen,
    setIsSettingsOpen,
    orderType,
    setOrderType,
    lowStockCount,
    orders,
    isAdminAuthenticated,
    setIsAdminAuthOpen,
    logoutAdmin,
    isCloudConnected,
    isSyncing,
    cartTotalCount,
    setIsCartOpen
  } = useStore();

  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;

  return (
    <header id="app-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Admin Top Status Bar (Only visible when Admin is logged in) */}
      {isAdminAuthenticated && (
        <div className="bg-slate-900 text-slate-200 px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-500/30 text-[11px]">
              👑 অ্যাডমিন মোড অ্যাক্টিভ (Admin Portal)
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Globe className="w-3 h-3" />
              <span>ক্লাউড ডেটাবেস লাইভ — বিশ্বের যেকোনো স্থান থেকে সিঙ্ক হচ্ছে</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isSyncing && (
              <span className="text-[10px] text-amber-300 animate-pulse hidden sm:inline">
                ক্লাউড আপডেট হচ্ছে...
              </span>
            )}
            <button
              onClick={logoutAdmin}
              className="inline-flex items-center gap-1 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-200 px-2.5 py-0.5 rounded-md text-[11px] font-bold border border-slate-700 transition-colors"
              title="Switch back to clean customer-only view"
            >
              <LogOut className="w-3 h-3" />
              <span>কাস্টমার ভিউতে যান</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Store Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button 
            id="brand-home-btn"
            onClick={() => setActiveView('customer_menu')}
            className="flex items-center gap-2 text-left focus:outline-hidden group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight group-hover:text-amber-700 transition-colors truncate">
                {settings.storeName}
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate font-medium">
                {settings.tagline}
              </p>
            </div>
          </button>
        </div>

        {/* Right Navigation & Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* If ADMIN is logged in: Show Full Control Center Tabs */}
          {isAdminAuthenticated ? (
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {/* Order Delivery Channel Selector (Admin Only) */}
              <div className="hidden xl:flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium border border-slate-200/80 mr-1">
                <button
                  id="admin-order-mode-delivery"
                  onClick={() => setOrderType('delivery')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    orderType === 'delivery'
                      ? 'bg-white text-amber-800 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="হোম ডেলিভারি মোড"
                >
                  <MapPin className="w-3 h-3 text-amber-600" />
                  <span>হোম ডেলিভারি</span>
                </button>
                <button
                  id="admin-order-mode-takeaway"
                  onClick={() => setOrderType('takeaway')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    orderType === 'takeaway'
                      ? 'bg-white text-amber-800 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="শপ পিকআপ মোড"
                >
                  <ShoppingBag className="w-3 h-3 text-amber-600" />
                  <span>শপ পিকআপ</span>
                </button>
                <button
                  id="admin-order-mode-dinein"
                  onClick={() => setOrderType('dine_in')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    orderType === 'dine_in'
                      ? 'bg-white text-amber-800 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="কুরিয়ার পার্সেল মোড"
                >
                  <Truck className="w-3 h-3 text-amber-600" />
                  <span>কুরিয়ার পার্সেল</span>
                </button>
              </div>

              {/* Admin Navigation Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                <button
                  id="view-menu-btn"
                  onClick={() => setActiveView('customer_menu')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    activeView === 'customer_menu'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Customer Menu & Catalog"
                >
                  <Store className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">দোকান / ক্যাটালগ</span>
                </button>

                <button
                  id="view-inventory-btn"
                  onClick={() => setActiveView('admin_inventory')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 relative ${
                    activeView === 'admin_inventory'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Automated Inventory & Stock Tracking"
                >
                  <Boxes className="w-3.5 h-3.5 text-indigo-600" />
                  <span>ইনভেন্টরি</span>
                  {lowStockCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {lowStockCount}
                    </span>
                  )}
                </button>

                <button
                  id="view-orders-btn"
                  onClick={() => setActiveView('admin_orders')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 relative ${
                    activeView === 'admin_orders'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Live Customer Orders"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
                  <span>অর্ডারসমূহ</span>
                  {pendingOrdersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold animate-pulse">
                      {pendingOrdersCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Quick Add Product Button */}
              <button
                id="quick-add-product-btn"
                onClick={() => setIsAddProductOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-amber-600/20 active:scale-95 transition-all"
                title="Easily Add New Spice or Grocery Item"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">+ নতুন আইটেম</span>
              </button>

              {/* Settings */}
              <button
                id="open-settings-btn"
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                title="Store Settings & PIN"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* If CUSTOMER view: Pure, minimal customer header with Cart & subtle lock */
            <div className="flex items-center gap-2">
              {/* Floating Quick Cart Button */}
              <button
                id="header-cart-btn"
                onClick={() => setIsCartOpen(true)}
                className="relative px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm shadow-amber-600/20 active:scale-95 transition-all"
                title="View Shopping Cart"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>কার্ট ({cartTotalCount})</span>
              </button>

              {/* Discreet Admin Lock Button */}
              <button
                id="admin-auth-trigger-btn"
                onClick={() => setIsAdminAuthOpen(true)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-xl flex items-center gap-1 border border-slate-200 transition-colors"
                title="মালিক / অ্যাডমিন লগইন (Admin Access)"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] hidden xs:inline">অ্যাডমিন</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instant Search Bar (Active in Menu View) - Clean for customers */}
      {activeView === 'customer_menu' && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-2.5 pt-0.5">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="search-products-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="মসলা, তেল, চাল, ডাল, ঘি বা মুদি পণ্য সার্চ করুন... (যেমন: হলুদ, এলাচ, সরিষার তেল)"
              className="w-full pl-9.5 pr-8 py-2.5 bg-slate-100/90 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:outline-hidden transition-all placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                id="clear-search-btn"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
