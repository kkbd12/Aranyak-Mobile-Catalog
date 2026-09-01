import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  Receipt, 
  X, 
  Printer, 
  ShoppingBag, 
  UtensilsCrossed, 
  QrCode,
  ArrowRight,
  MessageCircle,
  Share2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { generateWhatsAppOrderText, openWhatsAppChat } from '../utils/whatsapp';

interface OrderConfirmationModalProps {
  orderNumber: string | null;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({ orderNumber, onClose }) => {
  const { orders, settings, setActiveView } = useStore();

  if (!orderNumber) return null;

  const order = orders.find(o => o.orderNumber === orderNumber);
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const message = generateWhatsAppOrderText({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      orderType: order.orderType,
      deliveryAddress: order.deliveryAddress,
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit
      })),
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      tax: order.tax,
      total: order.total,
      settings
    });

    const targetPhone = settings.whatsappNumber || settings.phone || '';
    openWhatsAppChat({ phone: targetPhone, message });
  };

  const handleGoToOrdersPOS = () => {
    onClose();
    setActiveView('admin_orders');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="order-confirmation-container"
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-in"
      >
        {/* Success Header */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-xl font-black">Order Placed Successfully!</h2>
          <p className="text-xs text-amber-100 mt-1">
            আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে
          </p>

          <div className="mt-4 inline-block bg-white text-slate-900 font-mono font-black text-sm px-4 py-1.5 rounded-full shadow-md">
            Token: #{order.orderNumber}
          </div>
        </div>

        {/* Receipt Details Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto print:max-h-none">
          {/* Order Meta Info */}
          <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-slate-400 block text-[10px]">Type / টেবিল</span>
              <span className="font-bold text-slate-800">
                {order.orderType === 'dine_in' ? `Dine In (${order.tableNumber})` : order.orderType === 'takeaway' ? 'Takeaway' : 'Delivery'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Payment / মাধ্যম</span>
              <span className="font-bold text-slate-800 uppercase">
                {order.paymentMethod} • {order.paymentStatus}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Status</span>
              <span className="font-bold text-amber-600 capitalize">
                {order.status}
              </span>
            </div>
          </div>

          {/* Ordered Items List */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-amber-600" />
              Order Items Breakdown
            </h4>
            <div className="space-y-2 border-t border-b border-slate-100 py-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-700">{item.quantity}×</span>
                    <div>
                      <span>{item.name}</span>
                      {item.unit && (
                        <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded ml-1.5 font-semibold inline-block">
                          {item.unit}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {settings.currencySymbol}{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Breakdown */}
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{settings.currencySymbol}{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT ({settings.taxRate}%)</span>
              <span>{settings.currencySymbol}{order.tax}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>{settings.currencySymbol}{order.deliveryFee}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total</span>
              <span className="text-amber-700 text-base">{settings.currencySymbol}{order.total}</span>
            </div>
          </div>

          {/* Automated Inventory Note */}
          <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-[11px] flex items-center gap-2 border border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>অটোমেটিক ইনভেন্টরি: স্টক স্বয়ংক্রিয়ভাবে আপডেট করা হয়েছে।</span>
          </div>

          {/* WhatsApp Direct Share Button */}
          <button
            id="order-confirm-share-whatsapp-btn"
            onClick={handleShareWhatsApp}
            className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-black rounded-2xl shadow-md shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
            <span>WhatsApp-এ দোকানদারকে স্লিপ পাঠান</span>
          </button>
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট স্লিপ</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            মেন্যুতে ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
};
