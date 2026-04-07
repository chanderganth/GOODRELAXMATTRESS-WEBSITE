'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, ArrowRight, Check } from 'lucide-react';
import type { Product } from '@/lib/types';
import { DENSITY_INFO, formatPrice } from '@/lib/priceCalculator';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

// Static featured products (would be fetched from API in production)
const FEATURED_PRODUCTS: Product[] = [
  {
    id: 'prod-28d-queen',
    name: '28D Rare Queen Mattress',
    category: '28D_Rare',
    description: 'Perfect starter mattress with HD foam core, cotton fabric, and medium firmness.',
    basePrice: 14400,
    densityAddition: 0,
    features: ['HD Foam Core', 'Cotton Fabric', 'Medium Firm', '5yr warranty'],
    images: ['/products/rare-queen.jpg'],
    colors: [
      { name: 'Beige', hex: '#F5F5DC' },
      { name: 'Light Grey', hex: '#D3D3D3' },
      { name: 'White', hex: '#FFFFFF' },
    ],
    quiltPatterns: [],
    thickness: 5,
    isActive: true,
    badge: 'Value Pick',
    rating: 4.3,
    reviewCount: 128,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'prod-32d-queen',
    name: '32D Epic Queen Mattress',
    category: '32D_Epic',
    description: 'Premium memory foam + HD foam combo for the ultimate balanced sleep experience.',
    basePrice: 26400,
    densityAddition: 500,
    features: ['Memory Foam Top', 'HD Foam Core', 'Velvet Fabric', '7yr warranty'],
    images: ['/products/epic-queen.jpg'],
    colors: [
      { name: 'Maroon', hex: '#800000' },
      { name: 'Navy Blue', hex: '#000080' },
      { name: 'Grey', hex: '#808080' },
    ],
    quiltPatterns: [],
    thickness: 6,
    isActive: true,
    badge: 'Best Seller',
    rating: 4.7,
    reviewCount: 342,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'prod-40d-king',
    name: '40D Legendary King Mattress',
    category: '40D_Legendary',
    description: 'Our most luxurious mattress: latex + memory foam + coir layers for orthopedic support.',
    basePrice: 54000,
    densityAddition: 700,
    features: ['Natural Latex', 'Memory Foam', 'Coir Base', 'Bamboo Fabric', '10yr warranty'],
    images: ['/products/legendary-king.jpg'],
    colors: [
      { name: 'Royal Blue', hex: '#4169E1' },
      { name: 'Pearl White', hex: '#FDEEF4' },
      { name: 'Charcoal', hex: '#36454F' },
      { name: 'Gold', hex: '#DAA520' },
    ],
    quiltPatterns: [],
    thickness: 8,
    isActive: true,
    badge: 'Luxury',
    rating: 4.9,
    reviewCount: 189,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'prod-32d-single',
    name: '32D Epic Single Mattress',
    category: '32D_Epic',
    description: 'Compact but premium — memory foam comfort in single size for students and hostels.',
    basePrice: 18000,
    densityAddition: 500,
    features: ['Memory Foam', 'Knitted Fabric', 'Soft-Medium', '7yr warranty'],
    images: ['/products/epic-single.jpg'],
    colors: [
      { name: 'Blue', hex: '#4682B4' },
      { name: 'Grey', hex: '#808080' },
    ],
    quiltPatterns: [],
    thickness: 5,
    isActive: true,
    badge: undefined,
    rating: 4.5,
    reviewCount: 97,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'prod-40d-queen',
    name: '40D Legendary Queen Mattress',
    category: '40D_Legendary',
    description: 'Pocket spring + memory foam combination for couples who need motion isolation.',
    basePrice: 44800,
    densityAddition: 700,
    features: ['Pocket Spring', 'Memory Foam', 'Velvet Fabric', '10yr warranty'],
    images: ['/products/legendary-queen.jpg'],
    colors: [
      { name: 'Ivory', hex: '#FFFFF0' },
      { name: 'Dark Grey', hex: '#505050' },
      { name: 'Burgundy', hex: '#722F37' },
    ],
    quiltPatterns: [],
    thickness: 8,
    isActive: true,
    badge: 'New',
    rating: 4.8,
    reviewCount: 76,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'prod-28d-double',
    name: '28D Rare Double Mattress',
    category: '28D_Rare',
    description: 'Coir + foam combo for firm orthopedic support. Great for back pain relief on a budget.',
    basePrice: 17280,
    densityAddition: 0,
    features: ['Coir Layer', 'HD Foam', 'Cotton Fabric', '5yr warranty'],
    images: ['/products/rare-double.jpg'],
    colors: [
      { name: 'Beige', hex: '#F5F5DC' },
      { name: 'Light Blue', hex: '#ADD8E6' },
    ],
    quiltPatterns: [],
    thickness: 5,
    isActive: true,
    badge: 'Ortho Pick',
    rating: 4.2,
    reviewCount: 65,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ProductCardProps {
  product: Product;
}

const getImageUrl = (src: string) => {
  if (!src) return '/products/rare-queen.jpg';
  if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('/products')) return src;
  if (src.startsWith('/uploads')) return `${API_URL}${src}`;
  return src;
};

export default function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const { addStandard } = useCart();
  const info = DENSITY_INFO[product.category];

  const handleAddToCart = () => {
    const mockConfig = {
      size: { length: 78, width: 60, thickness: product.thickness },
      density: product.category,
      layers: [{ type: 'foam' as const, thickness: 4, label: 'Base Foam' }],
      fabric: 'cotton' as const,
      hardness: 'medium' as const,
    };
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

  return (
    <div className="card flex flex-col group">
      {/* Image */}
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        <Image
          src={getImageUrl(product.images[0])}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 33vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-[#1a1a2e] text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {product.badge}
          </span>
        )}
        <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${info.bgColor} ${info.color}`}>
          {info.badge}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-[#1a1a2e] text-base mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.floor(product.rating!) ? 'fill-[#e8b85d] text-[#e8b85d]' : 'text-gray-200 fill-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.reviewCount})</span>
          </div>
        )}

        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {product.features.slice(0, 3).map(f => (
            <span key={f} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
              <Check className="w-3 h-3 text-green-500" />
              {f}
            </span>
          ))}
        </div>

        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 mb-4">
            {product.colors.slice(0, 5).map((color, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full border border-gray-300"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-xs text-gray-400">+{product.colors.length - 5}</span>
            )}
            <span className="text-xs text-gray-400 ml-1">{product.colors.length} colors</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-end gap-2 mb-4">
          <span className="text-2xl font-bold text-[#1a1a2e]">{formatPrice(product.basePrice)}</span>
          <span className="text-xs text-gray-400 mb-1">+ GST (18%)</span>
        </div>

        {/* Actions */}
        <div className="mt-auto grid grid-cols-2 gap-2">
          <Link
            href={`/products/${product.id}`}
            className="border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors text-center flex items-center justify-center gap-1.5"
          >
            Details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleAddToCart}
            className={`px-3 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
              added ? 'bg-green-500 text-white' : 'btn-primary'
            }`}
          >
            {added ? <><Check className="w-3.5 h-3.5" /> Added</> : <><ShoppingCart className="w-3.5 h-3.5" /> Add</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export { FEATURED_PRODUCTS };
