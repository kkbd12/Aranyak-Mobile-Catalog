export interface ProductVariant {
  id: string;
  unit: string; // e.g. "১০০ গ্রাম", "২৫০ গ্রাম", "৫০০ গ্রাম", "১ কেজি"
  price: number;
  costPrice?: number;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  nameBn?: string;
  description: string;
  price: number;
  costPrice?: number;
  category: string;
  image: string;
  stock: number;
  lowStockThreshold: number;
  sku: string;
  rating: number;
  salesCount: number;
  isPopular?: boolean;
  isSpecial?: boolean;
  unit?: string; // e.g. "250g Pack"
  variants?: ProductVariant[]; // Multiple packet sizes/units
  tags?: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameBn?: string;
  icon: string;
  order: number;
}

export interface CartItem {
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  specialInstructions?: string;
}

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unitPrice: number;
  unit?: string;
  variantId?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  tableNumber?: string;
  deliveryAddress?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'cash' | 'bkash' | 'bangla_qr' | 'nagad' | 'card';
  paymentStatus: 'paid' | 'unpaid';
  transactionId?: string;
  notes?: string;
}

export interface InventoryLog {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  changeType: 'order_deduction' | 'order_cancellation_refund' | 'manual_restock' | 'stock_adjustment' | 'new_product';
  quantityChange: number; // e.g. -2 or +10
  previousStock: number;
  newStock: number;
  referenceId?: string; // e.g. Order ID
  note?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  currency: string;
  currencySymbol: string;
  taxRate: number; // percentage
  deliveryFee: number;
  minOrderAmount: number;
  tableOrderingEnabled: boolean;
  soundEffects: boolean;
  phone: string;
  whatsappNumber?: string;
  address: string;
  bkashNumber?: string;
  nagadNumber?: string;
  banglaQrNumber?: string;
  banglaQrMerchantName?: string;
  banglaQrImageUrl?: string;
  logoUrl?: string;
  faviconUrl?: string;
  adminPin?: string;
}

export type AppView = 'customer_menu' | 'admin_inventory' | 'admin_orders' | 'admin_analytics';
