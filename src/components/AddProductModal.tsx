import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Image as ImageIcon, 
  Sparkles, 
  Layers, 
  DollarSign, 
  Package, 
  Tag, 
  Check,
  Wand2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { INITIAL_PRESET_IMAGES } from '../data/initialData';

export const AddProductModal: React.FC = () => {
  const { 
    isAddProductOpen, 
    setIsAddProductOpen, 
    categories, 
    addCategory, 
    addProduct,
    settings
  } = useStore();

  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>(120);
  const [costPrice, setCostPrice] = useState<number | ''>(85);
  const [category, setCategory] = useState(categories[1]?.id || 'ground_spices');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingNewCat, setIsCreatingNewCat] = useState(false);
  const [image, setImage] = useState(INITIAL_PRESET_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [stock, setStock] = useState<number | ''>(30);
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>(6);
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('250g Pack');
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [customUnitInput, setCustomUnitInput] = useState('');
  const [tagsInput, setTagsInput] = useState('১০০% খাঁটি, রোদে শুকানো');
  const [isPopular, setIsPopular] = useState(true);
  const [isSpecial, setIsSpecial] = useState(false);

  if (!isAddProductOpen) return null;

  // Preset Template Quick Fill for Spice & Super Shop
  const fillSampleTemplate = (type: 'turmeric' | 'cardamom' | 'mustard_oil' | 'rice') => {
    if (type === 'turmeric') {
      setName('Pure Ground Turmeric Powder (হলুদ গুঁড়া)');
      setNameBn('১০০% খাঁটি হলুদ গুঁড়া ২৫০ গ্রাম');
      setDescription('সম্পূর্ণ প্রাকৃতিক দেশি কাঁচা হলুদ রোদে শুকিয়ে প্রস্তুত। কোনো প্রিজারভেটিভ বা কেমিক্যাল ছাড়া।');
      setPrice(110);
      setCostPrice(75);
      setStock(40);
      setLowStockThreshold(8);
      setImage('https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80');
      setSku(`MOS-TUR-${Math.floor(100 + Math.random() * 900)}`);
      setUnit('250g Pack');
      setCategory('ground_spices');
      setTagsInput('১০০% খাঁটি, প্রাকৃতিক রঙ');
      setIsPopular(true);
    } else if (type === 'cardamom') {
      setName('Jumbo Green Cardamom (সবুজ এলাচ)');
      setNameBn('৮ মিমি সুগন্ধি বড় সবুজ এলাচ ১০০ গ্রাম');
      setDescription('গাঢ় সবুজ ও তৈলাক্ত দানার জাম্বো সাইজ এলাচ। মিষ্টি ও বিরিয়ানিতে তীব্র সুবাস নিশ্চিত।');
      setPrice(360);
      setCostPrice(280);
      setStock(20);
      setLowStockThreshold(4);
      setImage('https://images.unsplash.com/photo-1627916607164-7b20241db935?auto=format&fit=crop&w=600&q=80');
      setSku(`WHL-ELA-${Math.floor(100 + Math.random() * 900)}`);
      setUnit('100g Pack');
      setCategory('whole_spices');
      setTagsInput('বোল্ডার এলাচ, তীব্র সুবাস');
      setIsSpecial(true);
    } else if (type === 'mustard_oil') {
      setName('Cold Pressed Mustard Oil (সরিষার তেল)');
      setNameBn('কাঠের ঘানি ভাঙা খাঁটি সরিষার তেল ১ লিটার');
      setDescription('মাঘী সরিষা থেকে কাঠের ঘানিতে ভাঙানো খাঁটি ঝাঁঝ ও নিরবচ্ছিন্ন গুণমানের ভোজ্য তেল।');
      setPrice(280);
      setCostPrice(210);
      setStock(35);
      setLowStockThreshold(6);
      setImage('https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80');
      setSku(`OIL-MUS-${Math.floor(100 + Math.random() * 900)}`);
      setUnit('1 Liter Bottle');
      setCategory('oils_ghee');
      setTagsInput('ঘানি ভাঙা, তীব্র ঝাঁঝ');
      setIsPopular(true);
    } else {
      setName('Aromatic Chinigura Polao Rice (চিনিগুঁড়া চাল)');
      setNameBn('দিনাজপুরের সুগন্ধি চিনিগুঁড়া পোলাও চাল ১ কেজি');
      setDescription('ছোট দানার সুবাসিত পুরোনো আমনের পোলাও চাল। বিরিয়ানি ও ক্ষীরের জন্য অসাধারণ।');
      setPrice(150);
      setCostPrice(115);
      setStock(50);
      setLowStockThreshold(10);
      setImage('https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80');
      setSku(`RIC-CHI-${Math.floor(100 + Math.random() * 900)}`);
      setUnit('1 kg Pack');
      setCategory('rice_dal');
      setTagsInput('দিনাজপুরের সুবাস, পোলাও স্পেশাল');
      setIsPopular(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price === '' || stock === '') return;

    let finalCategory = category;

    // If adding a new custom category
    if (isCreatingNewCat && newCategoryName.trim()) {
      const created = addCategory({
        name: newCategoryName.trim(),
        icon: 'Sparkles',
      });
      finalCategory = created.id;
    }

    const finalImage = customImageUrl.trim() || image || INITIAL_PRESET_IMAGES[0].url;
    const finalSku = sku.trim() || `ITEM-${Math.floor(1000 + Math.random() * 9000)}`;
    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const finalUnit = isCustomUnit 
      ? (customUnitInput.trim() || 'Pack') 
      : (unit.trim() || 'Pack');

    addProduct({
      name: name.trim(),
      nameBn: nameBn.trim() || undefined,
      description: description.trim() || 'উন্নতমানের ১০০% খাঁটি ও নির্ভেজাল পণ্য।',
      price: Number(price),
      costPrice: costPrice !== '' ? Number(costPrice) : undefined,
      category: finalCategory,
      image: finalImage,
      stock: Number(stock),
      lowStockThreshold: Number(lowStockThreshold) || 5,
      sku: finalSku,
      unit: finalUnit,
      tags: parsedTags,
      isPopular,
      isSpecial,
    });

    setIsAddProductOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="add-product-modal-container"
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-in"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white flex items-center justify-center shadow-xs">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add New Product / Item</h2>
              <p className="text-xs text-slate-500">নতুন মসলা বা সুপার শপ পণ্য যুক্ত করুন</p>
            </div>
          </div>

          <button
            id="close-add-product-btn"
            onClick={() => setIsAddProductOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Fill Helpers for Spice & Groceries */}
        <div className="px-5 pt-3 pb-2 bg-amber-50/50 border-b border-amber-100/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1 text-amber-800 font-bold">
            <Wand2 className="w-3.5 h-3.5" />
            <span>Fast Fill Templates:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => fillSampleTemplate('turmeric')}
              className="px-2 py-1 bg-white hover:bg-amber-100 text-slate-700 rounded-lg border border-amber-200 font-semibold transition-colors"
            >
              🌶️ হলুদ গুঁড়া
            </button>
            <button
              type="button"
              onClick={() => fillSampleTemplate('cardamom')}
              className="px-2 py-1 bg-white hover:bg-amber-100 text-slate-700 rounded-lg border border-amber-200 font-semibold transition-colors"
            >
              🌿 সবুজ এলাচ
            </button>
            <button
              type="button"
              onClick={() => fillSampleTemplate('mustard_oil')}
              className="px-2 py-1 bg-white hover:bg-amber-100 text-slate-700 rounded-lg border border-amber-200 font-semibold transition-colors"
            >
              🫒 সরিষার তেল
            </button>
            <button
              type="button"
              onClick={() => fillSampleTemplate('rice')}
              className="px-2 py-1 bg-white hover:bg-amber-100 text-slate-700 rounded-lg border border-amber-200 font-semibold transition-colors"
            >
              🌾 চিনিগুঁড়া চাল
            </button>
          </div>
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
                id="new-product-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Radhuni Pure Turmeric Powder"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পণ্যের নাম (বাংলায়)
              </label>
              <input
                id="new-product-name-bn"
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="যেমন: খাঁটি হলুদ গুঁড়া ২৫০ গ্রাম"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Category (ক্যাটাগরি) *</label>
              <button
                type="button"
                onClick={() => setIsCreatingNewCat(!isCreatingNewCat)}
                className="text-[11px] font-bold text-amber-600 hover:text-amber-700"
              >
                {isCreatingNewCat ? '← Select existing' : '+ নতুন ক্যাটাগরি তৈরি'}
              </button>
            </div>

            {isCreatingNewCat ? (
              <input
                id="new-category-input"
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="নতুন ক্যাটাগরির নাম লিখুন (যেমন: অর্গানিক মধু ও ঘি, বেকারি)"
                className="w-full px-3.5 py-2 bg-slate-50 border border-amber-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500"
                required
              />
            ) : (
              <select
                id="new-product-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 font-semibold"
              >
                {categories
                  .filter(c => c.id !== 'all')
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameBn || cat.name} ({cat.name})
                    </option>
                  ))}
              </select>
            )}
          </div>

          {/* Pricing & Stock Details (Fully Automated Inventory Config) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Selling Price ({settings.currencySymbol}) *
              </label>
              <input
                id="new-product-price"
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 font-bold text-amber-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cost Price ({settings.currencySymbol})
              </label>
              <input
                id="new-product-cost"
                type="number"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial Stock *
              </label>
              <input
                id="new-product-stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 font-bold text-emerald-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Low Stock Alert &lt;=
              </label>
              <input
                id="new-product-low-stock"
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500"
              />
            </div>
          </div>

          {/* Unit / Weight and SKU */}
          <div className="space-y-2 bg-amber-50/40 p-3 rounded-2xl border border-amber-200/70">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-amber-600" />
                <span>Unit / Packet Size (ওজন বা পরিমাপ) *</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsCustomUnit(!isCustomUnit);
                  if (!isCustomUnit && !customUnitInput) {
                    setCustomUnitInput(unit);
                  }
                }}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-white hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300 transition-colors"
              >
                {isCustomUnit ? '← সিলেক্ট লিস্ট দেখুন' : '✍️ কাস্টম সাইজ লিখুন'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                {isCustomUnit ? (
                  <div>
                    <input
                      id="custom-unit-input"
                      type="text"
                      value={customUnitInput}
                      onChange={(e) => setCustomUnitInput(e.target.value)}
                      placeholder="যেমন: ৫০ গ্রাম ট্রায়াল প্যাক, ৭৫০ মিলি, ১২ পিস"
                      className="w-full px-3 py-2 bg-white border border-amber-400 rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-amber-500 font-semibold"
                      autoFocus
                    />
                    {/* Quick suggestion chips for custom unit */}
                    <div className="flex items-center gap-1 flex-wrap mt-1.5">
                      <span className="text-[10px] text-slate-500">কুইক সাজেশন:</span>
                      {['৫০ গ্রাম', '৭৫ গ্রাম', '১৫০ গ্রাম', '৩৫০ গ্রাম', '৭৫০ গ্রাম', '৩ কেজি', '১০ কেজি বস্তা', '১২ পিস বক্স', '৭৫০ মিলি'].map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCustomUnitInput(sug)}
                          className="text-[10px] px-1.5 py-0.5 bg-white hover:bg-amber-100 text-slate-700 rounded-md border border-slate-200 transition-colors"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <select
                    id="new-product-unit"
                    value={unit}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM_OPTION') {
                        setIsCustomUnit(true);
                      } else {
                        setUnit(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 font-semibold"
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
                  id="new-product-sku"
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="SKU / Item Code (Auto if blank)"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Image Picker with Preset Gallery */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Preset Photo or Custom URL
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-2 max-h-32 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
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
                      ? 'border-amber-500 ring-2 ring-amber-300 scale-95'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                  title={preset.label}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  {image === preset.url && !customImageUrl && (
                    <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white drop-shadow-md" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="relative">
              <ImageIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="custom-image-url-input"
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="অথবা যে কোনো ছবি লিঙ্ক পেস্ট করুন (https://...)"
                className="w-full pl-8.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-amber-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / পণ্যের বিবরণ
            </label>
            <textarea
              id="new-product-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="পণ্যের গুণাগুণ, খাঁটি হওয়ার নিশ্চয়তা ও প্যাকিং বিস্তারিত..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500"
            />
          </div>

          {/* Tags and Flags */}
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-400"
              />
              <span>জনপ্রিয় পণ্য 🔥</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isSpecial}
                onChange={(e) => setIsSpecial(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-400"
              />
              <span>স্পেশাল অফার ✨</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            id="save-new-product-btn"
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-amber-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>প্রোডাক্ট সেভ করুন ও ক্যাটালগে যুক্ত করুন</span>
          </button>
        </form>
      </div>
    </div>
  );
};
