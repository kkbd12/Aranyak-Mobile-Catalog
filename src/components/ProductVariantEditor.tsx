import React from 'react';
import { Plus, Trash2, Layers, Check, Sparkles } from 'lucide-react';
import { ProductVariant } from '../types';

interface ProductVariantEditorProps {
  enabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  currencySymbol: string;
  productSkuBase?: string;
}

const PRESET_SUGGESTIONS = [
  { group: 'মসলা প্যাক (Spices)', items: ['১০০ গ্রাম', '২৫০ গ্রাম', '৫০০ গ্রাম', '১ কেজি'] },
  { group: 'তেল ও তরল (Oils)', items: ['২৫০ মিলি', '৫০০ মিলি', '১ লিটার', '২ লিটার', '৫ লিটার'] },
  { group: 'চাল ও ডাল (Grains)', items: ['১ কেজি', '২ কেজি', '৫ কেজি', '১০ কেজি', '২৫ কেজি'] },
];

export const ProductVariantEditor: React.FC<ProductVariantEditorProps> = ({
  enabled,
  onToggleEnabled,
  variants,
  onChange,
  currencySymbol,
  productSkuBase = 'ITEM'
}) => {
  // Add new blank or customized variant
  const handleAddVariant = (unitName = '') => {
    const newId = `v-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newVariant: ProductVariant = {
      id: newId,
      unit: unitName || `${variants.length + 1} Size Pack`,
      price: 0,
      stock: 20,
      sku: `${productSkuBase}-${variants.length + 1}`,
    };
    onChange([...variants, newVariant]);
  };

  const handleAddPreset = (unitName: string) => {
    if (variants.some(v => v.unit.trim().toLowerCase() === unitName.trim().toLowerCase())) {
      return; // Already added
    }
    const newId = `v-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newVariant: ProductVariant = {
      id: newId,
      unit: unitName,
      price: 0,
      stock: 25,
      sku: `${productSkuBase}-${unitName.replace(/\s+/g, '')}`,
    };
    onChange([...variants, newVariant]);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    onChange(updated);
  };

  const handleRemoveVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    onChange(updated);
  };

  // Calculations
  const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  const minPrice = variants.length > 0 ? Math.min(...variants.map(v => Number(v.price) || 0)) : 0;
  const maxPrice = variants.length > 0 ? Math.max(...variants.map(v => Number(v.price) || 0)) : 0;

  return (
    <div className="space-y-3 bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-amber-50/60 p-3.5 sm:p-4 rounded-2xl border border-amber-300/80 shadow-2xs">
      {/* Header Toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
              ওজন ও সাইজের ভ্যারিয়েন্ট (Multi-weight Variants)
            </span>
            <p className="text-[11px] text-slate-500">
              একই পণ্যের বিভিন্ন ওজন (যেমন: ২৫০g, ৫০০g, ১kg) ও আলাদা দাম
            </p>
          </div>
        </div>

        {/* Switch Toggle */}
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggleEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600 shadow-inner"></div>
        </label>
      </div>

      {/* When Variants Enabled */}
      {enabled && (
        <div className="space-y-3 pt-2 border-t border-amber-200/80">
          {/* Quick Preset Buttons */}
          <div className="space-y-1.5 bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>দ্রুত ওজন/সাইজ যোগ করুন (Quick Presets):</span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {PRESET_SUGGESTIONS.map((grp) => (
                <React.Fragment key={grp.group}>
                  {grp.items.map((item) => {
                    const isAdded = variants.some(v => v.unit.trim().toLowerCase() === item.trim().toLowerCase());
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleAddPreset(item)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                          isAdded
                            ? 'bg-amber-100 text-amber-900 border-amber-300 cursor-default opacity-75'
                            : 'bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border-slate-200 hover:border-amber-300'
                        }`}
                        title={isAdded ? 'যোগ করা হয়েছে' : 'ক্লিক করে যোগ করুন'}
                      >
                        <span>+ {item}</span>
                        {isAdded && <Check className="w-3 h-3 text-amber-700" />}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Variants Table / List */}
          {variants.length === 0 ? (
            <div className="py-4 text-center bg-white/70 rounded-xl border border-dashed border-amber-300 text-xs text-amber-800 font-medium">
              উপরে ক্লিক করে অথবা নিচের বাটন চেপে ভ্যারিয়েন্ট যোগ করুন
            </div>
          ) : (
            <div className="space-y-2">
              <div className="hidden sm:grid grid-cols-12 gap-2 text-[11px] font-extrabold text-slate-600 px-2 uppercase tracking-wider">
                <div className="col-span-4">ওজন / সাইজের নাম *</div>
                <div className="col-span-3">বিক্রয় মূল্য ({currencySymbol}) *</div>
                <div className="col-span-2">মজুদ (Stock) *</div>
                <div className="col-span-2">কেনা দাম (ঐচ্ছিক)</div>
                <div className="col-span-1 text-center">মুছুন</div>
              </div>

              {variants.map((v, idx) => (
                <div 
                  key={v.id || idx}
                  className="bg-white p-2.5 sm:p-2 rounded-xl border border-amber-200/90 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  {/* Unit / Weight Name */}
                  <div className="col-span-4">
                    <label className="sm:hidden text-[10px] font-bold text-slate-500 block mb-0.5">
                      ওজন / সাইজ
                    </label>
                    <input
                      type="text"
                      value={v.unit}
                      onChange={(e) => handleUpdateVariant(idx, 'unit', e.target.value)}
                      placeholder="যেমন: ২৫০ গ্রাম, ১ কেজি"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:border-amber-500"
                      required
                    />
                  </div>

                  {/* Selling Price */}
                  <div className="col-span-3">
                    <label className="sm:hidden text-[10px] font-bold text-slate-500 block mb-0.5">
                      বিক্রয় মূল্য ({currencySymbol})
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-700">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={v.price === 0 ? '' : v.price}
                        onChange={(e) => handleUpdateVariant(idx, 'price', e.target.value === '' ? 0 : Number(e.target.value))}
                        placeholder="দাম"
                        className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-amber-800 focus:bg-white focus:border-amber-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="col-span-2">
                    <label className="sm:hidden text-[10px] font-bold text-slate-500 block mb-0.5">
                      মজুদ স্টক
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={v.stock}
                      onChange={(e) => handleUpdateVariant(idx, 'stock', Math.max(0, Number(e.target.value)))}
                      placeholder="স্টক"
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-emerald-700 focus:bg-white focus:border-amber-500"
                      required
                    />
                  </div>

                  {/* Cost Price */}
                  <div className="col-span-2">
                    <label className="sm:hidden text-[10px] font-bold text-slate-500 block mb-0.5">
                      কেনা দাম ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={v.costPrice !== undefined ? v.costPrice : ''}
                      onChange={(e) => handleUpdateVariant(idx, 'costPrice', e.target.value === '' ? undefined : Number(e.target.value))}
                      placeholder="ঐচ্ছিক"
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 focus:bg-white focus:border-amber-500"
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="col-span-1 flex justify-end sm:justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="ভ্যারিয়েন্ট মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Another Row Button & Summary */}
          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
            <button
              type="button"
              onClick={() => handleAddVariant()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>＋ নতুন সাইজ/ওজন যোগ করুন</span>
            </button>

            {variants.length > 0 && (
              <div className="text-[11px] font-bold text-amber-950 bg-amber-100/80 px-3 py-1.5 rounded-xl border border-amber-300/80 flex items-center gap-2">
                <span>{variants.length}টি সাইজ</span>
                <span>•</span>
                <span>দাম: {currencySymbol}{minPrice} - {currencySymbol}{maxPrice}</span>
                <span>•</span>
                <span className="text-emerald-800 font-extrabold">মোট মজুদ: {totalStock}টি</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
