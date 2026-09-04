import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Product,
  ProductVariant,
  Category,
  CartItem,
  Order,
  InventoryLog,
  StoreSettings,
  AppView,
  OrderType,
  OrderStatus
} from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialData';
import { playAddToCartSound, playRemoveSound, playOrderSuccessSound } from '../utils/audio';
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  writeBatch
} from 'firebase/firestore';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  orders: Order[];
  inventoryLogs: InventoryLog[];
  settings: StoreSettings;
  activeView: AppView;
  activeCategory: string;
  searchQuery: string;
  selectedProduct: Product | null;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isAddProductOpen: boolean;
  isSettingsOpen: boolean;
  activeOrderNumber: string | null;
  tableNumber: string;
  orderType: OrderType;
  lowStockCount: number;
  outOfStockCount: number;
  totalProductsCount: number;
  cartTotalAmount: number;
  cartTotalCount: number;

  // Cloud and Remote Sync State
  isCloudConnected: boolean;
  isSyncing: boolean;

  // Admin Security & Worldwide Remote Operation
  isAdminAuthenticated: boolean;
  isAdminAuthOpen: boolean;
  adminPin: string;
  setIsAdminAuthOpen: (open: boolean) => void;
  loginAsAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  changeAdminPin: (newPin: string) => boolean;

  // Actions
  setActiveView: (view: AppView) => void;
  setActiveCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsAddProductOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setTableNumber: (table: string) => void;
  setOrderType: (type: OrderType) => void;
  
  // Cart Actions
  addToCart: (product: Product, variant?: ProductVariant | number, quantity?: number) => boolean;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  
  // Product & Category Management
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'salesCount' | 'rating'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  deleteMultipleProducts: (ids: string[]) => void;
  addCategory: (category: { name: string; nameBn?: string; icon: string }) => Category;
  
  // Inventory Automated Actions
  adjustStock: (productId: string, deltaQuantity: number, note?: string) => void;
  adjustVariantStock: (productId: string, variantId: string, deltaQuantity: number, note?: string) => void;
  setExactStock: (productId: string, newStock: number, note?: string) => void;
  quickBatchRestock: (category?: string, addAmount?: number) => void;
  
  // Orders Actions
  placeOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    orderType: OrderType;
    tableNumber?: string;
    deliveryAddress?: string;
    paymentMethod: 'cash' | 'bkash' | 'bangla_qr' | 'nagad' | 'card';
    transactionId?: string;
    notes?: string;
  }) => Order | null;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  
  // Settings & Reset
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetToSampleData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  PRODUCTS: 'easyorder_products_v2_spice',
  CATEGORIES: 'easyorder_categories_v2_spice',
  CART: 'easyorder_cart_v2_spice',
  ORDERS: 'easyorder_orders_v2_spice',
  INVENTORY_LOGS: 'easyorder_inv_logs_v2_spice',
  SETTINGS: 'easyorder_settings_v2_spice',
  ADMIN_SESSION: 'easyorder_admin_session_v1',
  ADMIN_PIN: 'easyorder_admin_pin_v1'
};

const DEFAULT_ADMIN_PIN = '1234';

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Cloud connectivity state
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN_SESSION) === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);
  const [adminPin, setAdminPin] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN_PIN) || DEFAULT_ADMIN_PIN;
    } catch {
      return DEFAULT_ADMIN_PIN;
    }
  });

  // Local state with fallback
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CART);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      // Sanitize any corrupted items where selectedVariant might be a number or invalid
      return parsed.map((item: any) => {
        let validVariant: ProductVariant | undefined = undefined;
        if (
          item.selectedVariant && 
          typeof item.selectedVariant === 'object' && 
          typeof item.selectedVariant.price === 'number' && 
          !isNaN(item.selectedVariant.price)
        ) {
          validVariant = item.selectedVariant;
        }
        return {
          ...item,
          quantity: typeof item.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 0 ? item.quantity : 1,
          selectedVariant: validVariant,
        };
      });
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.INVENTORY_LOGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.storeName || parsed.storeName === 'Smart Mosla & Super Shop' || parsed.storeName === 'খাঁটি মসলা ও সুপার শপ') {
          parsed.storeName = 'Aranayak';
        }
        return { ...INITIAL_SETTINGS, ...parsed };
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // UI States
  const [activeView, setActiveView] = useState<AppView>('customer_menu');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeOrderNumber, setActiveOrderNumber] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState<string>('Parcel');
  const [orderType, setOrderType] = useState<OrderType>('delivery');

  // --- Real-Time Firestore Sync ---
  useEffect(() => {
    let unsubscribeProducts: (() => void) | null = null;
    let unsubscribeCategories: (() => void) | null = null;
    let unsubscribeOrders: (() => void) | null = null;
    let unsubscribeSettings: (() => void) | null = null;
    let unsubscribeLogs: (() => void) | null = null;

    const setupFirestoreSync = async () => {
      try {
        setIsSyncing(true);
        const productsCol = collection(db, 'products');
        const categoriesCol = collection(db, 'categories');
        const ordersCol = collection(db, 'orders');
        const settingsCol = collection(db, 'settings');
        const logsCol = collection(db, 'stockLogs');

        // Check if database is empty on first boot and seed if needed
        const prodSnap = await getDocs(productsCol);
        if (prodSnap.empty) {
          const batch = writeBatch(db);
          INITIAL_PRODUCTS.forEach(p => {
            const ref = doc(db, 'products', p.id);
            batch.set(ref, p);
          });
          INITIAL_CATEGORIES.forEach(c => {
            const ref = doc(db, 'categories', c.id);
            batch.set(ref, c);
          });
          const settingsRef = doc(db, 'settings', 'store_config');
          batch.set(settingsRef, INITIAL_SETTINGS);
          await batch.commit();
        }

        // 1. Subscribe to Products
        unsubscribeProducts = onSnapshot(productsCol, (snapshot) => {
          const list: Product[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as Product);
          });
          // Sort by order/createdAt
          list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          setProducts(list);
          setIsCloudConnected(true);
          setIsSyncing(false);
        }, (err) => {
          console.warn('Products Firestore snapshot error:', err);
          setIsCloudConnected(false);
          setIsSyncing(false);
        });

        // 2. Subscribe to Categories
        unsubscribeCategories = onSnapshot(categoriesCol, (snapshot) => {
          if (!snapshot.empty) {
            const catList: Category[] = [];
            snapshot.forEach(docSnap => {
              catList.push(docSnap.data() as Category);
            });
            catList.sort((a, b) => (a.order || 0) - (b.order || 0));
            setCategories(catList);
          }
        }, (err) => {
          console.warn('Categories Firestore snapshot error:', err);
        });

        // 3. Subscribe to Orders
        unsubscribeOrders = onSnapshot(ordersCol, (snapshot) => {
          const orderList: Order[] = [];
          snapshot.forEach(docSnap => {
            orderList.push(docSnap.data() as Order);
          });
          orderList.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          setOrders(orderList);
        }, (err) => {
          console.warn('Orders Firestore snapshot error:', err);
        });

        // 4. Subscribe to Store Settings
        unsubscribeSettings = onSnapshot(doc(db, 'settings', 'store_config'), (docSnap) => {
          if (docSnap.exists()) {
            const remoteSettings = docSnap.data() as StoreSettings;
            setSettings(remoteSettings);
            if (remoteSettings.adminPin) {
              setAdminPin(remoteSettings.adminPin);
            }
          }
        }, (err) => {
          console.warn('Settings Firestore snapshot error:', err);
        });

        // 5. Subscribe to Stock Audit Logs
        unsubscribeLogs = onSnapshot(logsCol, (snapshot) => {
          const logList: InventoryLog[] = [];
          snapshot.forEach(docSnap => {
            logList.push(docSnap.data() as InventoryLog);
          });
          logList.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
          setInventoryLogs(logList);
        }, (err) => {
          console.warn('StockLogs Firestore snapshot error:', err);
        });

      } catch (err) {
        console.warn('Error setting up Firestore sync:', err);
        setIsCloudConnected(false);
        setIsSyncing(false);
      }
    };

    setupFirestoreSync();

    return () => {
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeCategories) unsubscribeCategories();
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeSettings) unsubscribeSettings();
      if (unsubscribeLogs) unsubscribeLogs();
    };
  }, []);

  // Save to LocalStorage as offline backup
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      localStorage.setItem(LOCAL_STORAGE_KEYS.CART, JSON.stringify(cart));
      localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      localStorage.setItem(LOCAL_STORAGE_KEYS.INVENTORY_LOGS, JSON.stringify(inventoryLogs));
      localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_PIN, adminPin);
    } catch (e) {
      console.warn('LocalStorage backup warning:', e);
    }
  }, [products, categories, cart, orders, inventoryLogs, settings, adminPin]);

  // Admin Auth Helpers
  const loginAsAdmin = useCallback((pin: string): boolean => {
    const currentPin = settings.adminPin || adminPin || DEFAULT_ADMIN_PIN;
    if (pin === currentPin || pin === DEFAULT_ADMIN_PIN) {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_SESSION, 'true');
      } catch (e) {
        console.warn(e);
      }
      return true;
    }
    return false;
  }, [settings.adminPin, adminPin]);

  const logoutAdmin = useCallback(() => {
    setIsAdminAuthenticated(false);
    setActiveView('customer_menu');
    try {
      sessionStorage.removeItem(LOCAL_STORAGE_KEYS.ADMIN_SESSION);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const changeAdminPin = useCallback((newPin: string): boolean => {
    if (!newPin || newPin.length < 4) return false;
    setAdminPin(newPin);
    updateSettings({ adminPin: newPin });
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_PIN, newPin);
    } catch (e) {
      console.warn(e);
    }
    return true;
  }, []);

  // Guard activeView changes: if customer tries to switch to admin view without auth, open auth modal
  const handleSetActiveView = useCallback((view: AppView) => {
    if (view !== 'customer_menu' && !isAdminAuthenticated) {
      setIsAdminAuthOpen(true);
      return;
    }
    setActiveView(view);
  }, [isAdminAuthenticated]);

  // Derived Counts
  const lowStockCount = products.filter(p => {
    const totalStock = p.variants && p.variants.length > 0
      ? p.variants.reduce((s, v) => s + (v.stock || 0), 0)
      : p.stock;
    return totalStock > 0 && totalStock <= p.lowStockThreshold;
  }).length;

  const outOfStockCount = products.filter(p => {
    const totalStock = p.variants && p.variants.length > 0
      ? p.variants.reduce((s, v) => s + (v.stock || 0), 0)
      : p.stock;
    return totalStock <= 0;
  }).length;

  const totalProductsCount = products.length;

  const cartTotalCount = cart.reduce((sum, item) => sum + (typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1), 0);
  const cartTotalAmount = cart.reduce((sum, item) => {
    const isRealVariant = item.selectedVariant && typeof item.selectedVariant === 'object' && typeof item.selectedVariant.price === 'number' && !isNaN(item.selectedVariant.price);
    const itemPrice = isRealVariant 
      ? item.selectedVariant!.price 
      : (typeof item.product?.price === 'number' && !isNaN(item.product.price) ? item.product.price : 0);
    const qty = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1;
    return sum + (itemPrice * qty);
  }, 0);

  // Cart Actions
  const addToCart = useCallback((
    product: Product, 
    variantOrQuantity?: ProductVariant | number, 
    quantityParam = 1
  ): boolean => {
    const currentProduct = products.find(p => p.id === product.id) || product;
    
    let selectedVariant: ProductVariant | undefined = undefined;
    let quantity = 1;

    if (typeof variantOrQuantity === 'number') {
      quantity = variantOrQuantity > 0 ? variantOrQuantity : 1;
    } else if (variantOrQuantity && typeof variantOrQuantity === 'object') {
      selectedVariant = variantOrQuantity;
      quantity = typeof quantityParam === 'number' && quantityParam > 0 ? quantityParam : 1;
    } else {
      quantity = typeof quantityParam === 'number' && quantityParam > 0 ? quantityParam : 1;
    }

    // If no variant was passed, but product has variants, pick first valid variant
    if (!selectedVariant && currentProduct.variants && currentProduct.variants.length > 0) {
      const first = currentProduct.variants[0];
      if (first && typeof first === 'object' && typeof first.price === 'number') {
        selectedVariant = first;
      }
    }

    // Ensure selectedVariant is only kept if valid object with numeric price
    if (selectedVariant && (typeof selectedVariant !== 'object' || typeof selectedVariant.price !== 'number' || isNaN(selectedVariant.price))) {
      selectedVariant = undefined;
    }

    const availableStock = selectedVariant ? selectedVariant.stock : currentProduct.stock;

    if (availableStock <= 0) {
      return false;
    }

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => 
        item.product.id === product.id && 
        (selectedVariant ? item.selectedVariant?.id === selectedVariant.id : !item.selectedVariant)
      );

      if (existingIndex > -1) {
        const existingItem = prevCart[existingIndex];
        const newQty = existingItem.quantity + quantity;
        
        if (newQty > availableStock) {
          return prevCart;
        }

        const updated = [...prevCart];
        updated[existingIndex] = {
          ...existingItem,
          quantity: newQty,
          product: currentProduct,
          selectedVariant: selectedVariant,
        };
        return updated;
      } else {
        if (quantity > availableStock) {
          return prevCart;
        }
        return [...prevCart, { product: currentProduct, selectedVariant, quantity }];
      }
    });

    if (settings.soundEffects) {
      playAddToCartSound();
    }
    return true;
  }, [products, settings.soundEffects]);

  const removeFromCart = useCallback((productId: string, variantId?: string) => {
    setCart(prev => prev.filter(item => {
      if (item.product.id !== productId) return true;
      if (variantId) return item.selectedVariant?.id !== variantId;
      return false;
    }));
    if (settings.soundEffects) {
      playRemoveSound();
    }
  }, [settings.soundEffects]);

  const updateCartQuantity = useCallback((productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    const currentProduct = products.find(p => p.id === productId);
    if (currentProduct) {
      let maxStock = currentProduct.stock;
      if (variantId && currentProduct.variants) {
        const v = currentProduct.variants.find(varItem => varItem.id === variantId);
        if (v) maxStock = v.stock;
      }
      if (quantity > maxStock) return;
    }

    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId && (!variantId || item.selectedVariant?.id === variantId)) {
          return { ...item, quantity };
        }
        return item;
      })
    );

    if (settings.soundEffects) {
      playAddToCartSound();
    }
  }, [products, removeFromCart, settings.soundEffects]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Product & Category Management (Writes to Firestore & Optimistic Local State)
  const addProduct = useCallback((productData: Omit<Product, 'id' | 'createdAt' | 'salesCount' | 'rating'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      salesCount: 0,
      rating: 5.0,
      createdAt: new Date().toISOString(),
    };

    setProducts(prev => [newProduct, ...prev]);

    // Write to Firestore
    try {
      const prodRef = doc(db, 'products', newProduct.id);
      setDoc(prodRef, newProduct).catch(err => console.warn('Firestore setDoc product failed:', err));
    } catch (err) {
      console.warn('Firebase error:', err);
    }

    // Log initial stock creation
    const log: InventoryLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      productId: newProduct.id,
      productName: newProduct.name,
      changeType: 'new_product',
      quantityChange: newProduct.stock,
      previousStock: 0,
      newStock: newProduct.stock,
      note: 'New product added to catalog'
    };
    setInventoryLogs(prev => [log, ...prev]);
    try {
      const logRef = doc(db, 'stockLogs', log.id);
      setDoc(logRef, log).catch(err => console.warn(err));
    } catch (err) {
      console.warn(err);
    }

    return newProduct;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          return updated;
        }
        return p;
      })
    );

    try {
      const prodRef = doc(db, 'products', id);
      updateDoc(prodRef, updates).catch(err => console.warn('Firestore updateDoc failed:', err));
    } catch (err) {
      console.warn('Firebase updateDoc error:', err);
    }
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => {
      const next = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
    setCart(prev => prev.filter(item => item.product.id !== id));

    try {
      const prodRef = doc(db, 'products', id);
      deleteDoc(prodRef).catch(err => console.warn('Firestore deleteDoc failed:', err));
    } catch (err) {
      console.warn('Firebase deleteDoc error:', err);
    }
  }, []);

  const deleteMultipleProducts = useCallback((ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    setProducts(prev => {
      const next = prev.filter(p => !idSet.has(p.id));
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
    setCart(prev => prev.filter(item => !idSet.has(item.product.id)));

    try {
      const batch = writeBatch(db);
      ids.forEach(id => {
        batch.delete(doc(db, 'products', id));
      });
      batch.commit().catch(err => console.warn('Firebase batch delete error:', err));
    } catch (err) {
      console.warn('Firebase batch delete error:', err);
    }
  }, []);

  const addCategory = useCallback((categoryData: { name: string; nameBn?: string; icon: string }): Category => {
    const slug = categoryData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newCat: Category = {
      id: slug || `cat-${Date.now()}`,
      name: categoryData.name,
      nameBn: categoryData.nameBn,
      icon: categoryData.icon || 'Sparkles',
      order: categories.length + 1,
    };
    setCategories(prev => [...prev, newCat]);

    try {
      const catRef = doc(db, 'categories', newCat.id);
      setDoc(catRef, newCat).catch(err => console.warn(err));
    } catch (err) {
      console.warn(err);
    }

    return newCat;
  }, [categories.length]);

  // Automated Inventory Actions (Remote & Real-time)
  const adjustStock = useCallback((productId: string, deltaQuantity: number, note?: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const prevStock = p.stock;
          const newStock = Math.max(0, prevStock + deltaQuantity);

          const log: InventoryLog = {
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            timestamp: new Date().toISOString(),
            productId: p.id,
            productName: p.name,
            changeType: 'stock_adjustment',
            quantityChange: deltaQuantity,
            previousStock: prevStock,
            newStock: newStock,
            note: note || (deltaQuantity > 0 ? `Manual stock added (+${deltaQuantity})` : `Manual stock reduced (${deltaQuantity})`)
          };

          setInventoryLogs(logs => [log, ...logs]);

          try {
            const prodRef = doc(db, 'products', p.id);
            updateDoc(prodRef, { stock: newStock }).catch(err => console.warn(err));
            const logRef = doc(db, 'stockLogs', log.id);
            setDoc(logRef, log).catch(err => console.warn(err));
          } catch (err) {
            console.warn(err);
          }

          return { ...p, stock: newStock };
        }
        return p;
      })
    );
  }, []);

  const setExactStock = useCallback((productId: string, newStock: number, note?: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const prevStock = p.stock;
          const change = newStock - prevStock;

          const log: InventoryLog = {
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            timestamp: new Date().toISOString(),
            productId: p.id,
            productName: p.name,
            changeType: 'stock_adjustment',
            quantityChange: change,
            previousStock: prevStock,
            newStock: Math.max(0, newStock),
            note: note || `Exact stock updated to ${newStock}`
          };

          setInventoryLogs(logs => [log, ...logs]);

          try {
            const prodRef = doc(db, 'products', p.id);
            updateDoc(prodRef, { stock: Math.max(0, newStock) }).catch(err => console.warn(err));
            const logRef = doc(db, 'stockLogs', log.id);
            setDoc(logRef, log).catch(err => console.warn(err));
          } catch (err) {
            console.warn(err);
          }

          return { ...p, stock: Math.max(0, newStock) };
        }
        return p;
      })
    );
  }, []);

  const adjustVariantStock = useCallback((productId: string, variantId: string, deltaQuantity: number, note?: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId && p.variants && p.variants.length > 0) {
          const updatedVariants = p.variants.map(v => {
            if (v.id === variantId) {
              const newVarStock = Math.max(0, (v.stock || 0) + deltaQuantity);
              return { ...v, stock: newVarStock };
            }
            return v;
          });
          const newTotalStock = updatedVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
          const targetVar = p.variants.find(v => v.id === variantId);

          const log: InventoryLog = {
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            timestamp: new Date().toISOString(),
            productId: p.id,
            productName: `${p.name} (${targetVar?.unit || 'Variant'})`,
            changeType: deltaQuantity >= 0 ? 'manual_restock' : 'stock_adjustment',
            quantityChange: deltaQuantity,
            previousStock: targetVar?.stock || 0,
            newStock: Math.max(0, (targetVar?.stock || 0) + deltaQuantity),
            note: note || `Variant stock updated (${targetVar?.unit})`
          };

          setInventoryLogs(logs => [log, ...logs]);

          try {
            const prodRef = doc(db, 'products', p.id);
            updateDoc(prodRef, { 
              variants: updatedVariants,
              stock: newTotalStock 
            }).catch(err => console.warn(err));

            const logRef = doc(db, 'stockLogs', log.id);
            setDoc(logRef, log).catch(err => console.warn(err));
          } catch (err) {
            console.warn(err);
          }

          return { ...p, variants: updatedVariants, stock: newTotalStock };
        }
        return p;
      })
    );
  }, []);

  const quickBatchRestock = useCallback((categoryId?: string, addAmount = 10) => {
    setProducts(prev => {
      const updatedProducts = prev.map(p => {
        if (!categoryId || categoryId === 'all' || p.category === categoryId) {
          const currentTotal = p.variants && p.variants.length > 0 
            ? p.variants.reduce((s, v) => s + (v.stock || 0), 0)
            : p.stock;

          if (currentTotal <= p.lowStockThreshold) {
            let updatedVariants = p.variants ? [...p.variants] : undefined;
            if (updatedVariants && updatedVariants.length > 0) {
              updatedVariants = updatedVariants.map(v => ({ ...v, stock: (v.stock || 0) + addAmount }));
            }
            const prevStock = p.stock;
            const newStock = updatedVariants 
              ? updatedVariants.reduce((s, v) => s + (v.stock || 0), 0)
              : prevStock + addAmount;

            const log: InventoryLog = {
              id: `log-${Date.now()}-${p.id}`,
              timestamp: new Date().toISOString(),
              productId: p.id,
              productName: p.name,
              changeType: 'manual_restock',
              quantityChange: addAmount,
              previousStock: prevStock,
              newStock: newStock,
              note: `Automated Batch Restock (+${addAmount})`
            };
            setInventoryLogs(logs => [log, ...logs]);

            try {
              const prodRef = doc(db, 'products', p.id);
              updateDoc(prodRef, { 
                ...(updatedVariants ? { variants: updatedVariants } : {}),
                stock: newStock 
              }).catch(err => console.warn(err));
              const logRef = doc(db, 'stockLogs', log.id);
              setDoc(logRef, log).catch(err => console.warn(err));
            } catch (err) {
              console.warn(err);
            }

            return { 
              ...p, 
              ...(updatedVariants ? { variants: updatedVariants } : {}),
              stock: newStock 
            };
          }
        }
        return p;
      });
      return updatedProducts;
    });
  }, []);

  // AUTOMATED ORDER PLACEMENT & REAL-TIME STOCK DEPLETION
  const placeOrder = useCallback((orderData: {
    customerName: string;
    customerPhone: string;
    orderType: OrderType;
    tableNumber?: string;
    deliveryAddress?: string;
    paymentMethod: 'cash' | 'bkash' | 'bangla_qr' | 'nagad' | 'card';
    transactionId?: string;
    notes?: string;
  }): Order | null => {
    if (cart.length === 0) return null;

    // Check if all cart quantities are still available
    for (const item of cart) {
      const prod = products.find(p => p.id === item.product.id);
      if (!prod) {
        alert('দুঃখিত, আইটেমটি পাওয়া যায়নি।');
        return null;
      }
      const itemVariant = item.selectedVariant ? prod.variants?.find(v => v.id === item.selectedVariant?.id) : undefined;
      const availableStock = itemVariant ? itemVariant.stock : prod.stock;
      if (availableStock < item.quantity) {
        alert(`দুঃখিত, "${item.product.nameBn || item.product.name}${itemVariant ? ` (${itemVariant.unit})` : ''}" এর পর্যাপ্ত স্টক নেই (মজুদ আছে: ${availableStock}টি)।`);
        return null;
      }
    }

    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = cart.reduce((sum, item) => {
      const price = item.selectedVariant?.price ?? item.product.price;
      return sum + (price * item.quantity);
    }, 0);
    const tax = Math.round((subtotal * settings.taxRate) / 100);
    const deliveryFee = orderData.orderType === 'delivery' ? settings.deliveryFee : 0;
    const total = subtotal + tax + deliveryFee;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      customerName: orderData.customerName || 'সম্মানিত কাস্টমার',
      customerPhone: orderData.customerPhone || 'N/A',
      orderType: orderData.orderType,
      tableNumber: orderData.orderType === 'dine_in' ? (orderData.tableNumber || tableNumber) : undefined,
      deliveryAddress: orderData.orderType === 'delivery' ? orderData.deliveryAddress : undefined,
      items: cart.map(item => {
        const itemPrice = item.selectedVariant?.price ?? item.product.price;
        const itemUnit = item.selectedVariant?.unit || item.product.unit;
        const displayName = item.product.nameBn 
          ? (item.selectedVariant ? `${item.product.nameBn} - ${item.selectedVariant.unit}` : item.product.nameBn)
          : (item.selectedVariant ? `${item.product.name} (${item.selectedVariant.unit})` : item.product.name);

        return {
          productId: item.product.id,
          name: displayName,
          price: itemPrice * item.quantity,
          quantity: item.quantity,
          unitPrice: itemPrice,
          unit: itemUnit,
          variantId: item.selectedVariant?.id,
        };
      }),
      subtotal,
      tax,
      discount: 0,
      deliveryFee,
      total,
      status: 'pending',
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentMethod === 'cash' ? 'unpaid' : 'paid',
      transactionId: orderData.transactionId,
      notes: orderData.notes,
    };

    // 1. EXECUTE REAL-TIME STOCK DEDUCTION IN CLOUD & LOCAL
    const newLogs: InventoryLog[] = [];
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const matchingCartItems = cart.filter(item => item.product.id === p.id);
        if (matchingCartItems.length > 0) {
          let updatedVariants = p.variants ? [...p.variants] : undefined;
          let totalDeduction = 0;

          matchingCartItems.forEach(cartMatch => {
            totalDeduction += cartMatch.quantity;
            if (updatedVariants && cartMatch.selectedVariant) {
              updatedVariants = updatedVariants.map(v => {
                if (v.id === cartMatch.selectedVariant?.id) {
                  return { ...v, stock: Math.max(0, (v.stock || 0) - cartMatch.quantity) };
                }
                return v;
              });
            }
          });

          const prevStock = p.stock;
          const newStock = updatedVariants 
            ? updatedVariants.reduce((s, v) => s + (v.stock || 0), 0)
            : Math.max(0, prevStock - totalDeduction);
          const newSales = (p.salesCount || 0) + totalDeduction;

          const logItem: InventoryLog = {
            id: `log-${Date.now()}-${p.id}`,
            timestamp: new Date().toISOString(),
            productId: p.id,
            productName: p.name,
            changeType: 'order_deduction',
            quantityChange: -totalDeduction,
            previousStock: prevStock,
            newStock: newStock,
            referenceId: orderNumber,
            note: `Auto-deducted for Order ${orderNumber}`
          };
          newLogs.push(logItem);

          try {
            const prodRef = doc(db, 'products', p.id);
            updateDoc(prodRef, { 
              ...(updatedVariants ? { variants: updatedVariants } : {}),
              stock: newStock,
              salesCount: newSales
            }).catch(err => console.warn(err));

            const logRef = doc(db, 'stockLogs', logItem.id);
            setDoc(logRef, logItem).catch(err => console.warn(err));
          } catch (err) {
            console.warn(err);
          }

          return {
            ...p,
            ...(updatedVariants ? { variants: updatedVariants } : {}),
            stock: newStock,
            salesCount: newSales,
          };
        }
        return p;
      })
    );

    // Save Order to Firestore and Local State
    try {
      const orderRef = doc(db, 'orders', newOrder.id);
      setDoc(orderRef, newOrder).catch(err => console.warn('Firestore setDoc order failed:', err));
    } catch (err) {
      console.warn('Firebase order save error:', err);
    }

    setInventoryLogs(logs => [...newLogs, ...logs]);
    setOrders(prev => [newOrder, ...prev]);
    setActiveOrderNumber(orderNumber);
    clearCart();

    if (settings.soundEffects) {
      playOrderSuccessSound();
    }

    return newOrder;
  }, [cart, products, settings, tableNumber, clearCart]);

  // Order Status update & Automated Restock Refund on Cancel (Writes to Firestore)
  const updateOrderStatus = useCallback((orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders => {
      const order = prevOrders.find(o => o.id === orderId);
      if (!order) return prevOrders;

      const previousStatus = order.status;

      // If an order was NOT cancelled before, but is now cancelled -> AUTO RESTOCK INVENTORY!
      if (previousStatus !== 'cancelled' && newStatus === 'cancelled') {
        const refundLogs: InventoryLog[] = [];
        setProducts(prevProducts =>
          prevProducts.map(p => {
            const orderItemsForProd = order.items.filter(item => item.productId === p.id);
            if (orderItemsForProd.length > 0) {
              let updatedVariants = p.variants ? [...p.variants] : undefined;
              let totalRefundQty = 0;

              orderItemsForProd.forEach(itemMatch => {
                totalRefundQty += itemMatch.quantity;
                if (updatedVariants && itemMatch.variantId) {
                  updatedVariants = updatedVariants.map(v => {
                    if (v.id === itemMatch.variantId) {
                      return { ...v, stock: (v.stock || 0) + itemMatch.quantity };
                    }
                    return v;
                  });
                }
              });

              const prevStock = p.stock;
              const newStock = updatedVariants
                ? updatedVariants.reduce((s, v) => s + (v.stock || 0), 0)
                : prevStock + totalRefundQty;
              const newSales = Math.max(0, (p.salesCount || 0) - totalRefundQty);

              const logItem: InventoryLog = {
                id: `log-refund-${Date.now()}-${p.id}`,
                timestamp: new Date().toISOString(),
                productId: p.id,
                productName: p.name,
                changeType: 'order_cancellation_refund',
                quantityChange: +totalRefundQty,
                previousStock: prevStock,
                newStock: newStock,
                referenceId: order.orderNumber,
                note: `Auto-restocked due to Order ${order.orderNumber} cancellation`
              };
              refundLogs.push(logItem);

              try {
                const prodRef = doc(db, 'products', p.id);
                updateDoc(prodRef, { 
                  ...(updatedVariants ? { variants: updatedVariants } : {}),
                  stock: newStock,
                  salesCount: newSales
                }).catch(err => console.warn(err));

                const logRef = doc(db, 'stockLogs', logItem.id);
                setDoc(logRef, logItem).catch(err => console.warn(err));
              } catch (err) {
                console.warn(err);
              }

              return {
                ...p,
                ...(updatedVariants ? { variants: updatedVariants } : {}),
                stock: newStock,
                salesCount: newSales,
              };
            }
            return p;
          })
        );
        setInventoryLogs(logs => [...refundLogs, ...logs]);
      }

      // Update Order in Firestore
      try {
        const orderRef = doc(db, 'orders', orderId);
        updateDoc(orderRef, { status: newStatus }).catch(err => console.warn(err));
      } catch (err) {
        console.warn(err);
      }

      return prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    });
  }, []);

  const updateSettings = useCallback((newSettings: Partial<StoreSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        const settingsRef = doc(db, 'settings', 'store_config');
        setDoc(settingsRef, updated, { merge: true }).catch(err => console.warn(err));
      } catch (err) {
        console.warn(err);
      }
      return updated;
    });
  }, []);

  const resetToSampleData = useCallback(() => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setSettings(INITIAL_SETTINGS);
    setCart([]);
    setOrders([]);
    setInventoryLogs([]);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CART);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ORDERS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.INVENTORY_LOGS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SETTINGS);

    // Sync reset to Firestore
    try {
      const batch = writeBatch(db);
      INITIAL_PRODUCTS.forEach(p => {
        batch.set(doc(db, 'products', p.id), p);
      });
      INITIAL_CATEGORIES.forEach(c => {
        batch.set(doc(db, 'categories', c.id), c);
      });
      batch.set(doc(db, 'settings', 'store_config'), INITIAL_SETTINGS);
      batch.commit().catch(err => console.warn(err));
    } catch (e) {
      console.warn(e);
    }
  }, []);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        cart,
        orders,
        inventoryLogs,
        settings,
        activeView,
        activeCategory,
        searchQuery,
        selectedProduct,
        isCartOpen,
        isCheckoutOpen,
        isAddProductOpen,
        isSettingsOpen,
        activeOrderNumber,
        tableNumber,
        orderType,
        lowStockCount,
        outOfStockCount,
        totalProductsCount,
        cartTotalAmount,
        cartTotalCount,

        isCloudConnected,
        isSyncing,

        isAdminAuthenticated,
        isAdminAuthOpen,
        adminPin,
        setIsAdminAuthOpen,
        loginAsAdmin,
        logoutAdmin,
        changeAdminPin,

        setActiveView: handleSetActiveView,
        setActiveCategory,
        setSearchQuery,
        setSelectedProduct,
        setIsCartOpen,
        setIsCheckoutOpen,
        setIsAddProductOpen,
        setIsSettingsOpen,
        setTableNumber,
        setOrderType,

        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,

        addProduct,
        updateProduct,
        deleteProduct,
        deleteMultipleProducts,
        addCategory,

        adjustStock,
        adjustVariantStock,
        setExactStock,
        quickBatchRestock,

        placeOrder,
        updateOrderStatus,
        updateSettings,
        resetToSampleData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
