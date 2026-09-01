import React, { useState } from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  RefreshCw, 
  Plus, 
  Minus, 
  Search, 
  Filter, 
  History, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Package,
  Layers,
  Edit,
  Trash2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { EditProductModal } from './EditProductModal';

export const InventoryManager: React.FC = () => {
  const { 
    products, 
    categories, 
    inventoryLogs, 
    settings, 
    adjustStock, 
    setExactStock, 
    quickBatchRestock,
    deleteProduct,
    setIsAddProductOpen,
    lowStockCount,
    outOfStockCount
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'stock_list' | 'audit_log'>('stock_list');
  const [selectedProductToEdit, setSelectedProductToEdit] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Inventory Totals
  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalRetailValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const totalCostValue = products.reduce((sum, p) => sum + (p.stock * (p.costPrice || p.price * 0.5)), 0);

  // Filter products
  const filteredProducts = products.filter(product => {
    // Category filter
    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false;
    }

    // Status filter
    if (filterMode === 'low_stock' && (product.stock <= 0 || product.stock > product.lowStockThreshold)) {
      return false;
    }
    if (filterMode === 'out_of_stock' && product.stock > 0) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      return (
        product.name.toLowerCase().includes(q) ||
        (product.nameBn && product.nameBn.toLowerCase().includes(q)) ||
        product.sku.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const handleStartEdit = (product: Product) => {
    setEditingStockId(product.id);
    setTempStockValue(product.stock);
  };

  const handleSaveExactStock = (productId: string) => {
    setExactStock(productId, tempStockValue, 'Direct stock adjustment via inventory panel');
    setEditingStockId(null);
  };

  return (
    <div id="inventory-manager-view" className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-5 pb-24 animate-fade-in">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900">
              Automated Inventory Hub
            </h1>
            <p className="text-xs text-slate-500">
              রিয়েল-টাইম অটোমেটেড স্টক ম্যানেজমেন্ট ও ট্র্যাকিং
            </p>
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-2">
          {lowStockCount > 0 && (
            <button
              id="auto-batch-restock-btn"
              onClick={() => quickBatchRestock('all', 20)}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
              title="Automatically restock all items running low (+20 each)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Auto Restock Low Items (+20)</span>
            </button>
          )}

          <button
            id="inv-add-product-btn"
            onClick={() => setIsAddProductOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 4 Automated Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Stock Units */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Units</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalUnits}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across {products.length} products</p>
        </div>

        {/* Inventory Value */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Retail Value</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">
            {settings.currencySymbol}{totalRetailValue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Cost: {settings.currencySymbol}{Math.round(totalCostValue).toLocaleString()}
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div 
          onClick={() => setFilterMode(filterMode === 'low_stock' ? 'all' : 'low_stock')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            lowStockCount > 0
              ? 'bg-amber-50/70 border-amber-200 hover:border-amber-400'
              : 'bg-white border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Low Stock Alert</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">{lowStockCount}</p>
          <p className="text-[11px] text-amber-800 mt-0.5">
            {lowStockCount > 0 ? 'Click to filter low stock items' : 'All stocks healthy'}
          </p>
        </div>

        {/* Out of Stock */}
        <div 
          onClick={() => setFilterMode(filterMode === 'out_of_stock' ? 'all' : 'out_of_stock')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            outOfStockCount > 0
              ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400'
              : 'bg-white border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Out of Stock</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-700 mt-2">{outOfStockCount}</p>
          <p className="text-[11px] text-rose-800 mt-0.5">
            {outOfStockCount > 0 ? 'Auto-disabled on menu' : 'No stockout items'}
          </p>
        </div>
      </div>

      {/* Tabs: Stock Catalog Table vs. Real-time Audit Logs */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        {/* Navigation Switch */}
        <div className="px-4 pt-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('stock_list')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === 'stock_list'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Stock Control & Quick Adjust ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('audit_log')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === 'audit_log'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Automated Movement Logs ({inventoryLogs.length})</span>
            </button>
          </div>

          {/* Search & Filter in Tab Header */}
          {activeTab === 'stock_list' && (
            <div className="flex items-center gap-2 pb-2">
              {/* Category dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-medium"
              >
                <option value="all">All Categories</option>
                {categories.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* Status Chips */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2 py-1 rounded-lg ${filterMode === 'all' ? 'bg-white font-bold shadow-2xs text-slate-900' : 'text-slate-500'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterMode('low_stock')}
                  className={`px-2 py-1 rounded-lg ${filterMode === 'low_stock' ? 'bg-white font-bold shadow-2xs text-amber-700' : 'text-slate-500'}`}
                >
                  Low
                </button>
                <button
                  onClick={() => setFilterMode('out_of_stock')}
                  className={`px-2 py-1 rounded-lg ${filterMode === 'out_of_stock' ? 'bg-white font-bold shadow-2xs text-rose-700' : 'text-slate-500'}`}
                >
                  Out
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search SKU or name..."
                  className="pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: Stock Control Table */}
        {activeTab === 'stock_list' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Item & SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Current Stock</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Quick Stock Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No products match your inventory filter.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const isOut = product.stock <= 0;
                    const isLow = product.stock > 0 && product.stock <= product.lowStockThreshold;

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Product Info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">
                                {product.nameBn || product.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="text-[10px] text-slate-400 font-mono">
                                  SKU: {product.sku}
                                </span>
                                {product.unit && (
                                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded-md">
                                    {product.unit}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3 text-slate-600 capitalize">
                          {product.category}
                        </td>

                        {/* Price */}
                        <td className="py-3 px-3 font-bold text-amber-700">
                          {settings.currencySymbol}{product.price}
                        </td>

                        {/* Current Stock */}
                        <td className="py-3 px-3">
                          {editingStockId === product.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                value={tempStockValue}
                                onChange={(e) => setTempStockValue(Math.max(0, Number(e.target.value)))}
                                className="w-16 px-2 py-1 bg-white border border-indigo-400 rounded-lg text-xs font-bold text-slate-900"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveExactStock(product.id)}
                                className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingStockId(null)}
                                className="px-1.5 py-1 text-slate-400 hover:text-slate-600 text-[10px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div 
                              onClick={() => handleStartEdit(product)}
                              className="group/stock flex items-center gap-1.5 cursor-pointer"
                              title="Click to edit exact number"
                            >
                              <span className={`text-sm font-extrabold ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                                {product.stock}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {product.unit || 'units'}
                              </span>
                              <Edit className="w-3 h-3 text-slate-300 group-hover/stock:text-indigo-600 opacity-0 group-hover/stock:opacity-100 transition-opacity" />
                            </div>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-3">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                              Low Stock (&lt;={product.lowStockThreshold})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                              In Stock
                            </span>
                          )}
                        </td>

                        {/* Quick Stock Controls */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedProductToEdit(product);
                                setIsEditModalOpen(true);
                              }}
                              className="px-2 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 text-[11px] font-bold transition-colors flex items-center gap-1"
                              title="Edit product details, customize unit / packet size, price, stock"
                            >
                              <Edit className="w-3 h-3 text-amber-700" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => adjustStock(product.id, -1, 'Quick adjust -1')}
                              disabled={product.stock <= 0}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold disabled:opacity-40 transition-colors"
                              title="Reduce by 1"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => adjustStock(product.id, 1, 'Quick restock +1')}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold transition-colors"
                              title="Add 1"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => adjustStock(product.id, 10, 'Quick batch restock +10')}
                              className="px-2 h-7 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-colors"
                              title="Add 10"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => adjustStock(product.id, 50, 'Quick batch restock +50')}
                              className="px-2 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors"
                              title="Add 50"
                            >
                              +50
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                                  deleteProduct(product.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-1"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Automated Audit Logs */}
        {activeTab === 'audit_log' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Automatic real-time log of every order deduction and stock movement</span>
              <span className="font-semibold">{inventoryLogs.length} total entries</span>
            </div>

            {inventoryLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No inventory changes logged yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {inventoryLogs.map((log) => {
                  const isNegative = log.quantityChange < 0;

                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isNegative ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {isNegative ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {log.productName}
                            </span>
                            {log.referenceId && (
                              <span className="font-mono text-[10px] bg-slate-200/80 px-1.5 py-0.2 rounded font-semibold text-slate-700">
                                #{log.referenceId}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {log.note || log.changeType}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-black text-sm block ${isNegative ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {isNegative ? '' : '+'}{log.quantityChange}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {log.previousStock} → {log.newStock} stock
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Edit Modal (Allows full customization of Unit, Price, Stock, etc.) */}
      <EditProductModal
        product={selectedProductToEdit}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProductToEdit(null);
        }}
      />
    </div>
  );
};
