import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Image as ImageIcon, 
  Layers, 
  Package, 
  Tag, 
  Check,
  Trash2,
  Edit3
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { INITIAL_PRESET_IMAGES } from '../data/initialData';

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_PRESET_UNITS = [
  '100g Pack',
  '200g Pack',
  '250g Pack',
  '400g Pack',
  '500g Pack',
  '1 kg Pack',
  '2 kg Pack',
  '5 kg Bag',
  '10 kg Bag',
  '25 kg Bag',
  '250ml Bottle',
  '500ml Bottle',
  '1 Liter Bottle',
  '2 Liter Bottle',
  '5 Liter Can',
  '500g Jar',
  '1 kg Jar',
  'Mega Box',
  'Pcs'
];

export const EditProductModal: React.FC<EditProductModalProps> = ({ product, isOpen, onClose }) => {
  const { categories, updateProduct, deleteProduct, settings } = useStore();

  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [stock, setStock] = useState<number | ''>('');
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('');
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [customUnitInput, setCustomUnitInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isSpecial, setIsSpecial] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setNameBn(product.nameBn || '');
      setDescription(product.description || '');
      setPrice(product.price);
      setCostPrice(product.costPrice !== undefined ? product.costPrice : '');
      setCategory(product.category || categories[1]?.id || 'ground_spices');
      setImage(product.image || INITIAL_PRESET_IMAGES[0].url);
      setCustomImageUrl('');
      setStock(product.stock);
      setLowStockThreshold(product.lowStockThreshold || 5);
      setSku(product.sku || '');
      
      const currentUnit = product.unit || 'Pack';
      const isPreset = COMMON_PRESET_UNITS.includes(currentUnit);
      if (isPreset) {
        setUnit(currentUnit);
        setIsCustomUnit(false);
        setCustomUnitInput('');
      } else {
        setUnit('CUSTOM_OPTION');
        setIsCustomUnit(true);
        setCustomUnitInput(currentUnit);
      }

      setTagsInput(product.tags ? product.tags.join(', ') : '');
      setIsPopular(!!product.isPopular);
      setIsSpecial(!!product.isSpecial);
    }
  }, [product, categories]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price === '' || stock === '') return;

    const finalImage = customImageUrl.trim() || image || product.image;
    const finalUnit = isCustomUnit 
      ? (customUnitInput.trim() || 'Pack') 
      : (unit === 'CUSTOM_OPTION' ? (customUnitInput.trim() || 'Pack') : (unit.trim() || 'Pack'));

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    updateProduct(product.id, {
      name: name.trim(),
      nameBn: nameBn.trim() || undefined,
      description: description.trim(),
      price: Number(price),
      costPrice: costPrice !== '' ? Number(costPrice) : undefined,
      category,
      image: finalImage,
      stock: Number(stock),
      lowStockThreshold: Number(lowStockThreshold) || 5,
      sku: sku.trim() || product.sku,
      unit: finalUnit,
      tags: parsedTags,
      isPopular,
      isSpecial,
    });

    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      deleteProduct(product.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="edit-product-modal-container"
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-in"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Edit3 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Edit Product / আইটেম এডিট</h2>
              <p className="text-xs text-slate-500">ওজন/পরিমাপ, দাম ও স্টক পরিবর্তন করুন</p>
            </div>
          </div>

          <button
            id="close-edit-product-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Product Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product Name (English) *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পণ্যের নাম (বাংলায়)
              </label>
              <input
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category (ক্যাটাগরি) *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-indigo-500 font-semibold"
            >
              {categories
                .filter(c => c.id !== 'all')
                .map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameBn || cat.name} ({cat.name})
                  </option>
                ))}
            </select>
          </div>

          {/* Pricing & Stock Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Price ({settings.currencySymbol}) *
              </label>
              <input
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-indigo-500 font-bold text-indigo-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cost Price ({settings.currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Stock (বর্তমান মজুদ) *
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-indigo-500 font-bold text-emerald-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Low Alert &lt;=
              </label>
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Unit / Weight Customization Box */}
          <div className="space-y-2 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-600" />
                <span>Unit / Packet Size (ওজন বা পরিমাপ কাস্টমাইজ) *</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsCustomUnit(!isCustomUnit);
                  if (!isCustomUnit && !customUnitInput) {
                    setCustomUnitInput(unit !== 'CUSTOM_OPTION' ? unit : '');
                  }
                }}
                className="text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-white hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 transition-colors shadow-2xs"
              >
                {isCustomUnit ? '← ড্রপডাউন সিলেক্ট' : '✍️ কাস্টম সাইজ লিখুন'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                {isCustomUnit ? (
                  <div>
                    <input
                      type="text"
                      value={customUnitInput}
                      onChange={(e) => setCustomUnitInput(e.target.value)}
                      placeholder="যেমন: ৫০ গ্রাম ট্রায়াল প্যাক, ৭৫০ মিলি, ১২ পিস"
                      className="w-full px-3 py-2 bg-white border border-amber-400 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-amber-400 font-bold text-slate-900"
                      autoFocus
                    />
                    {/* Quick suggestion chips for custom unit */}
                    <div className="flex items-center gap-1 flex-wrap mt-1.5">
                      <span className="text-[10px] text-slate-500">কুইক ট্যাপ:</span>
                      {['৫০ গ্রাম', '৭৫ গ্রাম', '১৫০ গ্রাম', '৩৫০ গ্রাম', '৭৫০ গ্রাম', '৩ কেজি', '১০ কেজি বস্তা', '১২ পিস বক্স', '৭৫০ মিলি'].map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCustomUnitInput(sug)}
                          className="text-[10px] px-1.5 py-0.5 bg-white hover:bg-amber-100 text-slate-700 rounded-md border border-slate-200 transition-colors font-medium"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <select
                    value={unit}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM_OPTION') {
                        setIsCustomUnit(true);
                      } else {
                        setUnit(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-indigo-500 font-semibold"
                  >
                    <option value="100g Pack">100g Pack (১০০ গ্রাম প্যাকেট)</option>
                    <option value="200g Pack">200g Pack (২০০ গ্রাম প্যাকেট)</option>
                    <option value="250g Pack">250g Pack (২৫০ গ্রাম প্যাকেট)</option>
                    <option value="400g Pack">400g Pack (৪০০ গ্রাম প্যাকেট)</option>
                    <option value="500g Pack">500g Pack (৫০০ গ্রাম প্যাকেট)</option>
                    <option value="1 kg Pack">1 kg Pack (১ কেজি প্যাকেট)</option>
                    <option value="2 kg Pack">2 kg Pack (২ কেজি)</option>
                    <option value="5 kg Bag">5 kg Bag (৫ কেজি বস্তা/ব্যাগ)</option>
                    <option value="10 kg Bag">10 kg Bag (১০ কেজি বস্তা)</option>
                    <option value="25 kg Bag">25 kg Bag (২৫ কেজি বস্তা)</option>
                    <option value="250ml Bottle">250ml Bottle (২৫০ মিলি)</option>
                    <option value="500ml Bottle">500ml Bottle (৫০০ মিলি)</option>
                    <option value="1 Liter Bottle">1 Liter Bottle (১ লিটার বোতল)</option>
                    <option value="2 Liter Bottle">2 Liter Bottle (২ লিটার বোতল)</option>
                    <option value="5 Liter Can">5 Liter Can (৫ লিটার ক্যান)</option>
                    <option value="500g Jar">500g Jar (৫০০ গ্রাম বয়াম/জার)</option>
                    <option value="1 kg Jar">1 kg Jar (১ কেজি বয়াম)</option>
                    <option value="Mega Box">Mega Box / কম্বো বক্স</option>
                    <option value="Pcs">Pcs / পিস</option>
                    <option value="CUSTOM_OPTION">✨ Customize / কাস্টম পরিমাপ লিখুন...</option>
                  </select>
                )}
              </div>

              <div>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="SKU / Item Code"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Image Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Product Image (ছবি)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-2 max-h-28 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
              {INITIAL_PRESET_IMAGES.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setImage(preset.url);
                    setCustomImageUrl('');
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                    image === preset.url && !customImageUrl
                      ? 'border-indigo-600 ring-2 ring-indigo-300 scale-95'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                  title={preset.label}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  {image === preset.url && !customImageUrl && (
                    <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white drop-shadow-md" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="relative">
              <ImageIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="অথবা কাস্টম ছবি URL পেস্ট করুন (https://...)"
                className="w-full pl-8.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / পণ্যের বিবরণ
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="পণ্যের বিস্তারিত গুণাগুণ..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-indigo-500"
            />
          </div>

          {/* Popular / Special Flags */}
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>জনপ্রিয় পণ্য 🔥</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isSpecial}
                onChange={(e) => setIsSpecial(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>স্পেশাল অফার ✨</span>
            </label>
          </div>

          {/* Buttons: Save Changes and Delete */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span>মুছে ফেলুন</span>
            </button>

            <button
              type="submit"
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>পরিবর্তন সেভ করুন (Save Changes)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
