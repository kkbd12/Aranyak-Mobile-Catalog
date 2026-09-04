import React, { useState } from 'react';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Filter, 
  ChefHat, 
  Package, 
  RotateCcw,
  Utensils,
  MapPin,
  QrCode,
  DollarSign,
  Settings
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';

export const OrderManager: React.FC = () => {
  const { orders, updateOrderStatus, settings, setIsSettingsOpen } = useStore();
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('active');

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'active') {
      return order.status === 'pending' || order.status === 'preparing' || order.status === 'ready';
    }
    if (statusFilter === 'completed') {
      return order.status === 'completed';
    }
    if (statusFilter === 'cancelled') {
      return order.status === 'cancelled';
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending / নতুন অর্ডার
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
            <ChefHat className="w-3 h-3" />
            Preparing / তৈরি হচ্ছে
          </span>
        );
      case 'ready':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <Package className="w-3 h-3" />
            Ready for Delivery / রেডি
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Completed / সম্পন্ন
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Cancelled (Stock Refunded)
          </span>
        );
    }
  };

  return (
    <div id="order-manager-view" className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900">
              Live Orders &amp; Kitchen POS
            </h1>
            <p className="text-xs text-slate-500">
              লাইভ অর্ডার ম্যানেজমেন্ট ও অটো-স্টক রিফান্ড
            </p>
          </div>
        </div>

        {/* Filter Switcher & Settings */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'active' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Active ({orders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready').length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'completed' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Completed ({orders.filter(o => o.status === 'completed').length})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'cancelled' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Cancelled ({orders.filter(o => o.status === 'cancelled').length})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({orders.length})
            </button>
          </div>

          <button
            id="order-open-settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 text-xs font-bold rounded-2xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
            title="ফেভিকন আপলোড ও দোকান সেটিংস"
          >
            <Settings className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">ফেভিকন ও সেটিংস</span>
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No orders in this queue</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            New customer orders placed from the digital menu will automatically stream here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const dateFormatted = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={order.id}
                id={`order-card-${order.id}`}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-all space-y-4"
              >
                <div>
                  {/* Order Top Meta */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-slate-900">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {dateFormatted}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-700 mt-0.5">
                        {order.customerName}
                      </p>
                    </div>

                    {getStatusBadge(order.status)}
                  </div>

                  {/* Order Type and Delivery / Table info */}
                  <div className="py-2 flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 rounded-xl mt-3">
                    {order.orderType === 'dine_in' ? (
                      <>
                        <QrCode className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-bold text-slate-800">Dine-In • {order.tableNumber || 'Table'}</span>
                      </>
                    ) : order.orderType === 'takeaway' ? (
                      <>
                        <Package className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-bold text-slate-800">Takeaway Order</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="truncate font-bold text-slate-800">
                          Delivery: {order.deliveryAddress || 'Address specified'}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Ordered Items */}
                  <div className="space-y-1.5 my-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-800">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-black text-amber-700 shrink-0">{item.quantity}×</span>
                          <span className="font-medium truncate">{item.name}</span>
                          {item.unit && (
                            <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded font-semibold shrink-0">
                              {item.unit}
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-slate-700 shrink-0 ml-2">
                          {settings.currencySymbol}{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Cooking notes */}
                  {order.notes && (
                    <div className="p-2 bg-amber-50 rounded-xl text-[11px] text-amber-800 border border-amber-200/60 mb-2">
                      <span className="font-bold">Note: </span>{order.notes}
                    </div>
                  )}

                  {/* Total & Payment */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <div className="text-slate-600">
                      <span>পেমেন্ট: </span>
                      <span className="font-bold text-slate-900">
                        {order.paymentMethod === 'bkash' ? 'bKash' : 
                         order.paymentMethod === 'bangla_qr' ? 'Bangla QR' : 
                         order.paymentMethod === 'cash' ? 'Cash on Delivery' : order.paymentMethod}
                      </span>
                      {order.transactionId && (
                        <span className="ml-1.5 text-[10px] font-mono font-bold text-pink-700 bg-pink-50 border border-pink-200 px-1.5 py-0.2 rounded">
                          TrxID: {order.transactionId}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-black text-amber-700">
                      Total: {settings.currencySymbol}{order.total}
                    </div>
                  </div>
                </div>

                {/* Workflow Status Action Buttons */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  {order.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Accept &amp; Cook</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Cancel Order #${order.orderNumber}? (Stock will be automatically refunded to inventory)`)) {
                            updateOrderStatus(order.id, 'cancelled');
                          }
                        }}
                        className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Cancel (Refund)</span>
                      </button>
                    </div>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Ready for Serving</span>
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete &amp; Close Order</span>
                    </button>
                  )}

                  {order.status === 'completed' && (
                    <div className="text-center py-1 text-xs text-emerald-700 font-bold bg-emerald-50 rounded-xl">
                      ✓ Order Fulfilled
                    </div>
                  )}

                  {order.status === 'cancelled' && (
                    <div className="text-center py-1 text-xs text-rose-700 font-bold bg-rose-50 rounded-xl">
                      ✗ Cancelled • Stock Restored
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
