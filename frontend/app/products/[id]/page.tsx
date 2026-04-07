'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Star, Check, ChevronLeft, ChevronRight, Truck, Shield, Ruler, Palette, Grid3X3 } from 'lucide-react';
import type { Product } from '@/lib/types';
import { DENSITY_INFO, formatPrice } from '@/lib/priceCalculator';
import { FEATURED_PRODUCTS } from '@/components/products/ProductCard';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const getImageUrl = (src: string) => {
  if (!src) return '/products/rare-queen.jpg';
  if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('/')) return src;
  return src;
};

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const { addStandard } = useCart();

  useEffect(() => {
    // Try API first, then static products
    const findProduct = async () => {
      try {
        const res = await api.products.getById(id);
        const p = (res as { success: boolean; data: Product }).data;
        if (p) { setProduct(p); return; }
      } catch {
        // API failed, try static
      }

      const staticMatch = FEATURED_PRODUCTS.find(p => p.id === id);
      if (staticMatch) { setProduct(staticMatch); }
    };

    findProduct().finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const priceBreakdown = {
      sqft: (78 / 12) * (60 / 12),
      basePrice: product.basePrice,
      densityAddition: 0,
      layerPrice: 0,
      fabricPrice: 0,
      hardnessAddition: 0,
      subtotal: product.basePrice,
      gstAmount: Math.round(product.basePrice * 0.18),
      totalPrice: Math.round(product.basePrice * 1.18),
    };
    addStandard(product, priceBreakdown);
    setAdded(true);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">Product not found</p>
        <Link href="/products" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>
    );
  }

  const info = DENSITY_INFO[product.category];
  const images = product.images.length > 0 ? product.images : ['/products/rare-queen.jpg'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a1a2e] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* =================== IMAGE GALLERY =================== */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden mb-4">
              <Image
                src={getImageUrl(images[activeImage])}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
              />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-[#1a1a2e] text-white text-sm font-bold px-4 py-2 rounded-full">
                  {product.badge}
                </span>
              )}
              <span className={`absolute top-4 right-4 text-sm font-bold px-3 py-1.5 rounded-full ${info.bgColor} ${info.color}`}>
                {info.badge}
              </span>

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImage(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-colors ${
                      activeImage === idx ? 'border-[#1a1a2e]' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image src={getImageUrl(src)} alt="" fill className="object-cover" sizes="80px" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* =================== PRODUCT DETAILS =================== */}
          <div className="flex flex-col">
            {/* Title & Rating */}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-2">{product.name}</h1>

            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating!) ? 'fill-[#e8b85d] text-[#e8b85d]' : 'text-gray-200 fill-gray-200'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">{product.rating} ({product.reviewCount} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3 mb-6">
              <span className="text-4xl font-bold text-[#1a1a2e]">{formatPrice(product.basePrice)}</span>
              <span className="text-sm text-gray-400 mb-1">+ 18% GST</span>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-base leading-relaxed mb-6">{product.description}</p>

            {/* Quick Info */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Ruler className="w-5 h-5 text-[#e8b85d] mx-auto mb-1" />
                <p className="text-xs text-gray-500">Thickness</p>
                <p className="font-semibold text-[#1a1a2e]">{product.thickness}&quot;</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Shield className="w-5 h-5 text-[#e8b85d] mx-auto mb-1" />
                <p className="text-xs text-gray-500">Category</p>
                <p className="font-semibold text-[#1a1a2e]">{info.label}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Truck className="w-5 h-5 text-[#e8b85d] mx-auto mb-1" />
                <p className="text-xs text-gray-500">Delivery</p>
                <p className="font-semibold text-[#1a1a2e]">Free</p>
              </div>
            </div>

            {/* Features */}
            {product.features.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-[#1a1a2e] mb-3">Features</h3>
                <ul className="space-y-2">
                  {product.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-green-500" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Available Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#e8b85d]" /> Available Colors
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      {color.image ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#1a1a2e] transition-colors cursor-pointer">
                          <Image src={getImageUrl(color.image)} alt={color.name} fill className="object-cover" sizes="64px" unoptimized />
                        </div>
                      ) : (
                        <div
                          className="w-16 h-16 rounded-xl border-2 border-gray-200 hover:border-[#1a1a2e] transition-colors cursor-pointer"
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      )}
                      <span className="text-xs text-gray-600 font-medium">{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quilt Patterns */}
            {product.quiltPatterns && product.quiltPatterns.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4 text-[#e8b85d]" /> Quilt Patterns
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.quiltPatterns.map((quilt, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:border-[#1a1a2e] transition-colors cursor-pointer">
                      {quilt.image && (
                        <div className="relative aspect-square">
                          <Image src={getImageUrl(quilt.image)} alt={quilt.name} fill className="object-cover" sizes="200px" unoptimized />
                        </div>
                      )}
                      <div className="p-2 text-center">
                        <span className="text-sm font-medium text-gray-700">{quilt.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="mt-auto flex gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-4 rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-all ${
                  added ? 'bg-green-500 text-white' : 'btn-primary'
                }`}
              >
                {added ? (
                  <><Check className="w-5 h-5" /> Added to Cart</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                )}
              </button>
              <Link href="/builder" className="btn-outline py-4 px-6 flex items-center gap-2">
                Customize
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
