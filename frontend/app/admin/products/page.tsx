'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import {
  DENSITY_INFO,
  LAYER_INFO,
  FABRIC_INFO,
  DEFAULT_PRICING,
  getActivePricingConfig,
  saveActivePricingConfig,
  formatPrice,
} from '@/lib/priceCalculator';
import type { DensityCategory, FabricType, LayerType, PricingConfig, Product } from '@/lib/types';
import toast from 'react-hot-toast';
import {
  Plus, Trash2, Pencil, X, Upload, ImageIcon, Star, Save, RotateCcw, ChevronDown, ChevronUp,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const EMPTY_PRODUCT: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  category: '28D_Rare',
  description: '',
  basePrice: 0,
  densityAddition: 0,
  features: [''],
  images: [],
  thickness: 5,
  isActive: true,
  badge: '',
  rating: 4.5,
  reviewCount: 0,
};

export default function AdminProductsPage() {
  // ======================== PRICING STATE ========================
  const [pricing, setPricing] = useState<PricingConfig>(getActivePricingConfig());
  const [savingPricing, setSavingPricing] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  // ======================== PRODUCT STATE ========================
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ======================== LOAD DATA ========================
  useEffect(() => {
    api.products.getPricing()
      .then(res => {
        const c = (res as { success: boolean; data: PricingConfig }).data;
        setPricing(c);
        saveActivePricingConfig(c);
      })
      .catch(() => setPricing(getActivePricingConfig()));

    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoadingProducts(true);
    api.products.getAll()
      .then(res => setProducts((res as { success: boolean; data: Product[] }).data))
      .catch(() => {
        const cached = localStorage.getItem('admin_products');
        if (cached) setProducts(JSON.parse(cached));
      })
      .finally(() => setLoadingProducts(false));
  };

  // ======================== PRICING HANDLERS ========================
  const updateDensityPrice = (key: DensityCategory, value: number) => {
    setPricing(c => ({ ...c, densityAdditions: { ...c.densityAdditions, [key]: Math.max(0, value || 0) } }));
  };
  const updateLayerPrice = (key: LayerType, value: number) => {
    setPricing(c => ({ ...c, layerPrices: { ...c.layerPrices, [key]: Math.max(0, value || 0) } }));
  };
  const updateFabricPrice = (key: FabricType, value: number) => {
    setPricing(c => ({ ...c, fabricPrices: { ...c.fabricPrices, [key]: Math.max(0, value || 0) } }));
  };

  const handleSavePricing = async () => {
    setSavingPricing(true);
    try {
      await api.products.updatePricing(pricing);
      saveActivePricingConfig(pricing);
      toast.success('Pricing saved');
    } catch {
      saveActivePricingConfig(pricing);
      toast.success('Saved locally (offline mode)');
    } finally {
      setSavingPricing(false);
    }
  };

  // ======================== IMAGE HANDLERS ========================
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + form.images.length + pendingImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setPendingImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setImagePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeExistingImage = (idx: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const removePendingImage = (idx: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // ======================== FEATURE HANDLERS ========================
  const updateFeature = (idx: number, value: string) => {
    setForm(f => ({ ...f, features: f.features.map((feat, i) => (i === idx ? value : feat)) }));
  };
  const addFeature = () => {
    setForm(f => ({ ...f, features: [...f.features, ''] }));
  };
  const removeFeature = (idx: number) => {
    setForm(f => ({ ...f, features: f.features.filter((_, i) => i !== idx) }));
  };

  // ======================== FORM HANDLERS ========================
  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_PRODUCT, features: [''] });
    setPendingImages([]);
    setImagePreviews([]);
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      description: product.description,
      basePrice: product.basePrice,
      densityAddition: product.densityAddition,
      features: product.features.length > 0 ? [...product.features] : [''],
      images: [...product.images],
      thickness: product.thickness,
      isActive: product.isActive,
      badge: product.badge || '',
      rating: product.rating || 4.5,
      reviewCount: product.reviewCount || 0,
    });
    setPendingImages([]);
    setImagePreviews([]);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setPendingImages([]);
    setImagePreviews([]);
  };

  const handleSaveProduct = async () => {
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (form.basePrice <= 0) { toast.error('Base price must be positive'); return; }

    setSaving(true);
    try {
      let uploadedUrls: string[] = [];
      if (pendingImages.length > 0) {
        const uploadRes = await api.products.uploadImages(pendingImages);
        uploadedUrls = uploadRes.data;
      }

      const features = form.features.filter(f => f.trim() !== '');
      const images = [...form.images, ...uploadedUrls];

      const productData = {
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        basePrice: form.basePrice,
        densityAddition: form.densityAddition,
        features,
        images,
        thickness: form.thickness,
        isActive: form.isActive,
        badge: form.badge?.trim() || undefined,
        rating: form.rating,
        reviewCount: form.reviewCount,
      };

      if (editingId) {
        await api.products.update(editingId, productData);
        toast.success('Product updated');
      } else {
        await api.products.create(productData);
        toast.success('Product created');
      }

      loadProducts();
      closeForm();
    } catch {
      // Fallback: save to localStorage
      const features = form.features.filter(f => f.trim() !== '');
      const now = new Date().toISOString();
      const product: Product = {
        id: editingId || `local-${Date.now()}`,
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        basePrice: form.basePrice,
        densityAddition: form.densityAddition,
        features,
        images: [...form.images, ...imagePreviews],
        thickness: form.thickness,
        isActive: form.isActive,
        badge: form.badge?.trim() || undefined,
        rating: form.rating,
        reviewCount: form.reviewCount,
        createdAt: now,
        updatedAt: now,
      };

      const existing = JSON.parse(localStorage.getItem('admin_products') || '[]') as Product[];
      if (editingId) {
        const idx = existing.findIndex(p => p.id === editingId);
        if (idx >= 0) existing[idx] = product; else existing.push(product);
      } else {
        existing.push(product);
      }
      localStorage.setItem('admin_products', JSON.stringify(existing));
      setProducts(existing);
      toast.success('Saved locally (offline mode)');
      closeForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.products.delete(id);
      toast.success('Product deleted');
      loadProducts();
    } catch {
      const existing = JSON.parse(localStorage.getItem('admin_products') || '[]') as Product[];
      const updated = existing.filter(p => p.id !== id);
      localStorage.setItem('admin_products', JSON.stringify(updated));
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Removed locally');
    }
  };

  // ======================== IMAGE URL HELPER ========================
  const getImageUrl = (src: string) => {
    if (src.startsWith('http') || src.startsWith('data:')) return src;
    if (src.startsWith('/uploads')) return `${API_URL}${src}`;
    return src;
  };

  // ======================== RENDER ========================
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-[#1a1a2e]">Products & Pricing</h1>
          <button onClick={openAddForm} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {/* =================== PRODUCT LIST =================== */}
        <div className="space-y-4">
          <h2 className="font-semibold text-[#1a1a2e] text-lg">
            Products {!loadingProducts && <span className="text-gray-400 text-sm font-normal">({products.length})</span>}
          </h2>

          {loadingProducts ? (
            <div className="card p-12 text-center text-gray-400">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="card p-12 text-center">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No products yet. Add your first product!</p>
              <button onClick={openAddForm} className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map(product => (
                <div key={product.id} className="card p-4 flex gap-4 items-start">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0 relative">
                    {product.images[0] ? (
                      <Image
                        src={getImageUrl(product.images[0])}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-[#1a1a2e] text-base">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${DENSITY_INFO[product.category].bgColor} ${DENSITY_INFO[product.category].color}`}>
                            {DENSITY_INFO[product.category].badge}
                          </span>
                          {product.badge && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{product.badge}</span>
                          )}
                          <span className="text-sm text-gray-500">{product.thickness}&quot; thick</span>
                          {product.rating && (
                            <span className="flex items-center gap-0.5 text-xs text-gray-500">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {product.rating}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-[#1a1a2e]">{formatPrice(product.basePrice)}</p>
                        <p className="text-xs text-gray-400">{product.images.length} image{product.images.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    {product.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{product.description}</p>
                    )}
                    {product.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.features.map(f => (
                          <span key={f} className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">{f}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEditForm(product)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =================== ADD/EDIT FORM MODAL =================== */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="font-display text-xl font-bold text-[#1a1a2e]">
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    className="input-field"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Rare Queen Mattress"
                  />
                </div>

                {/* Category + Badge row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      className="input-field"
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value as DensityCategory }))}
                    >
                      {(Object.keys(DENSITY_INFO) as DensityCategory[]).map(key => (
                        <option key={key} value={key}>{DENSITY_INFO[key].label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Badge (optional)</label>
                    <input
                      className="input-field"
                      value={form.badge || ''}
                      onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                      placeholder="e.g. Best Seller, New, Ortho Pick"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="input-field min-h-[80px]"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the product..."
                  />
                </div>

                {/* Price + Thickness + Rating row */}
                <div className="grid sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹) *</label>
                    <input
                      className="input-field"
                      type="number"
                      min={0}
                      value={form.basePrice || ''}
                      onChange={e => setForm(f => ({ ...f, basePrice: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Density Add (₹)</label>
                    <input
                      className="input-field"
                      type="number"
                      min={0}
                      value={form.densityAddition || ''}
                      onChange={e => setForm(f => ({ ...f, densityAddition: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thickness (in)</label>
                    <input
                      className="input-field"
                      type="number"
                      min={1}
                      max={20}
                      value={form.thickness}
                      onChange={e => setForm(f => ({ ...f, thickness: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <input
                      className="input-field"
                      type="number"
                      min={0}
                      max={5}
                      step={0.1}
                      value={form.rating || ''}
                      onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images <span className="text-gray-400 font-normal">(max 5, jpg/png/webp, up to 5MB each)</span>
                  </label>

                  <div className="flex flex-wrap gap-3 mb-3">
                    {form.images.map((src, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 group">
                        <Image src={getImageUrl(src)} alt="" fill className="object-cover" sizes="96px" unoptimized />
                        <button
                          onClick={() => removeExistingImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {imagePreviews.map((src, idx) => (
                      <div key={`pending-${idx}`} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-blue-300 group">
                        <Image src={src} alt="" fill className="object-cover" sizes="96px" unoptimized />
                        <button
                          onClick={() => removePendingImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-blue-500 text-white text-[10px] text-center py-0.5">New</div>
                      </div>
                    ))}

                    {(form.images.length + pendingImages.length) < 5 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#1a1a2e] flex flex-col items-center justify-center gap-1 transition-colors"
                      >
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-xs text-gray-400">Upload</span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                  <div className="space-y-2">
                    {form.features.map((feat, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          className="input-field flex-1"
                          value={feat}
                          onChange={e => updateFeature(idx, e.target.value)}
                          placeholder={`Feature ${idx + 1}, e.g. Memory Foam Top`}
                        />
                        {form.features.length > 1 && (
                          <button onClick={() => removeFeature(idx)} className="p-2 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={addFeature} className="mt-2 text-sm text-[#1a1a2e] hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add feature
                  </button>
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-10 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-sm text-gray-700">{form.isActive ? 'Active (visible to customers)' : 'Inactive (hidden)'}</span>
                </label>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
                <button onClick={closeForm} className="btn-outline">Cancel</button>
                <button onClick={handleSaveProduct} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================== PRICING SECTION (collapsible) =================== */}
        <div className="card">
          <button
            onClick={() => setPricingOpen(!pricingOpen)}
            className="w-full flex items-center justify-between p-6 text-left"
          >
            <h2 className="font-semibold text-[#1a1a2e] text-lg">Pricing Configuration</h2>
            {pricingOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {pricingOpen && (
            <div className="px-6 pb-6 space-y-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Base Pricing</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <label className="text-sm text-gray-600">Base Price / sqft
                    <input className="input-field mt-1" type="number" min={0}
                      value={pricing.basePricePerSqft}
                      onChange={e => setPricing(c => ({ ...c, basePricePerSqft: Math.max(0, Number(e.target.value)) }))}
                    />
                  </label>
                  <label className="text-sm text-gray-600">Epic Addition / sqft
                    <input className="input-field mt-1" type="number" min={0}
                      value={pricing.densityAdditions['32D_Epic']}
                      onChange={e => updateDensityPrice('32D_Epic', Number(e.target.value))}
                    />
                  </label>
                  <label className="text-sm text-gray-600">Legendary Addition / sqft
                    <input className="input-field mt-1" type="number" min={0}
                      value={pricing.densityAdditions['40D_Legendary']}
                      onChange={e => updateDensityPrice('40D_Legendary', Number(e.target.value))}
                    />
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Layer Pricing</h3>
                  <div className="space-y-2">
                    {(Object.keys(LAYER_INFO) as LayerType[]).map(key => (
                      <div key={key} className="bg-gray-50 rounded-lg p-3 text-sm">
                        <label className="flex items-center justify-between gap-3">
                          <span>{LAYER_INFO[key].label}</span>
                          <input type="number" min={0} className="input-field max-w-[150px] py-2"
                            value={pricing.layerPrices[key]}
                            onChange={e => updateLayerPrice(key, Number(e.target.value))}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Fabric Pricing</h3>
                  <div className="space-y-2">
                    {(Object.keys(FABRIC_INFO) as FabricType[]).map(key => (
                      <div key={key} className="bg-gray-50 rounded-lg p-3 text-sm">
                        <label className="flex items-center justify-between gap-3">
                          <span>{FABRIC_INFO[key].label}</span>
                          <input type="number" min={0} className="input-field max-w-[150px] py-2"
                            value={pricing.fabricPrices[key]}
                            onChange={e => updateFabricPrice(key, Number(e.target.value))}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleSavePricing} disabled={savingPricing} className="btn-primary disabled:opacity-60 flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {savingPricing ? 'Saving...' : 'Save Pricing'}
                </button>
                <button onClick={() => { setPricing(DEFAULT_PRICING); saveActivePricingConfig(DEFAULT_PRICING); toast.success('Reset to defaults'); }} className="btn-outline flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Reset Defaults
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}