'use client';

import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import ProductCard, { FEATURED_PRODUCTS } from '@/components/products/ProductCard';
import type { DensityCategory, Product } from '@/lib/types';
import { DENSITY_INFO } from '@/lib/priceCalculator';
import api from '@/lib/api';
import Link from 'next/link';

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<DensityCategory | 'all'>('all');
  const [allProducts, setAllProducts] = useState<Product[]>(FEATURED_PRODUCTS);

  useEffect(() => {
    api.products.getAll()
      .then(res => {
        const apiProducts = (res as { success: boolean; data: Product[] }).data;
        if (apiProducts.length > 0) {
          // Merge: API products first, then static ones not already in API
          const apiIds = new Set(apiProducts.map(p => p.id));
          const merged = [...apiProducts, ...FEATURED_PRODUCTS.filter(p => !apiIds.has(p.id))];
          setAllProducts(merged);
        }
      })
      .catch(() => {
        // Also check localStorage for admin-added products
        const cached = localStorage.getItem('admin_products');
        if (cached) {
          const local = JSON.parse(cached) as Product[];
          const localIds = new Set(local.map(p => p.id));
          const merged = [...local, ...FEATURED_PRODUCTS.filter(p => !localIds.has(p.id))];
          setAllProducts(merged);
        }
      });
  }, []);

  const filtered = activeCategory === 'all'
    ? allProducts
    : allProducts.filter(p => p.category === activeCategory);

  const categories: { key: DensityCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All Products' },
    { key: '28D_Rare', label: DENSITY_INFO['28D_Rare'].label },
    { key: '32D_Epic', label: DENSITY_INFO['32D_Epic'].label },
    { key: '40D_Legendary', label: DENSITY_INFO['40D_Legendary'].label },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a1a2e] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Our Mattresses</h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Handcrafted premium mattresses in three categories. All sizes available, custom orders welcome.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat.key
                    ? 'bg-[#1a1a2e] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-500">{filtered.length} products</span>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Custom CTA */}
        <div className="mt-16 bg-gradient-to-r from-[#1a1a2e] to-[#0f3460] rounded-2xl p-8 text-white text-center">
          <h2 className="font-display text-2xl font-bold mb-2">Don&apos;t see your size?</h2>
          <p className="text-gray-300 mb-6">Build a completely custom mattress with our interactive configurator.</p>
          <Link href="/builder" className="btn-gold inline-flex items-center gap-2">
            Open Custom Builder
          </Link>
        </div>
      </div>
    </div>
  );
}
