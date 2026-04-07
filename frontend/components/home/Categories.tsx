import Link from 'next/link';
import { ArrowRight, Sparkles, Crown, Zap } from 'lucide-react';
import { DENSITY_INFO } from '@/lib/priceCalculator';

const categories = [
  {
    key: '28D_Rare' as const,
    icon: Zap,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    priceFrom: '₹12,000',
    features: ['Standard comfort', 'Light-medium support', '5 year warranty', 'Cotton / Knitted fabric'],
    thickness: '4–6 inches',
    bestFor: 'Students & Guest rooms',
  },
  {
    key: '32D_Epic' as const,
    icon: Sparkles,
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    priceFrom: '₹20,000',
    features: ['Premium comfort', 'Medium-firm support', '7 year warranty', 'All fabrics available'],
    thickness: '5–8 inches',
    bestFor: 'Couples & Daily use',
    popular: true,
  },
  {
    key: '40D_Legendary' as const,
    icon: Crown,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    priceFrom: '₹35,000',
    features: ['Luxury comfort', 'Orthopedic support', '10 year warranty', 'Premium fabric only'],
    thickness: '6–12 inches',
    bestFor: 'Back pain relief & Luxury',
  },
];

export default function Categories() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="section-title">Choose Your Category</h2>
          <p className="section-subtitle">
            Three premium categories engineered for every sleep preference and budget
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const info = DENSITY_INFO[cat.key];
            const Icon = cat.icon;
            return (
              <div
                key={cat.key}
                className={`relative card border-2 ${cat.borderColor} p-7 flex flex-col ${cat.popular ? 'scale-105 shadow-xl !overflow-visible' : ''}`}
              >
                {cat.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1a1a2e] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                    Most Popular
                  </div>
                )}

                {/* Icon & Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 ${cat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${cat.iconColor}`} />
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${info.bgColor} ${info.color}`}>
                    {info.badge}
                  </span>
                </div>

                {/* Name & Price */}
                <h3 className="font-display text-2xl font-bold text-[#1a1a2e] mb-1">{info.label}</h3>
                <p className="text-gray-500 text-sm mb-1">Starting from</p>
                <p className="text-3xl font-bold text-[#1a1a2e] mb-1">{cat.priceFrom}</p>
                <p className="text-xs text-gray-400 mb-5">Thickness: {cat.thickness}</p>

                {/* Best For */}
                <div className="bg-gray-50 rounded-lg px-3 py-2 mb-5">
                  <span className="text-xs text-gray-500">Best for: </span>
                  <span className="text-xs font-semibold text-gray-700">{cat.bestFor}</span>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {cat.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#e8b85d] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/products?category=${cat.key}`}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${cat.popular ? 'btn-primary' : 'btn-outline'}`}
                >
                  Explore {info.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
