'use client';

import Link from 'next/link';
import { ArrowRight, Star, ChevronDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] bg-hero-pattern flex items-center overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#e8b85d]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0f3460]/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <div className="text-white">
          <div className="inline-flex items-center gap-2 bg-[#e8b85d]/20 border border-[#e8b85d]/30 text-[#e8b85d] text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Star className="w-4 h-4 fill-current" />
            Trusted by 10,000+ Families
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Sleep Better.<br />
            <span className="gradient-text">Live Better.</span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8 max-w-lg">
            Handcrafted custom mattresses built to your exact specifications. Choose your density, layers, fabric, and size — all with real-time pricing.
          </p>

          {/* Stats */}
          <div className="flex gap-8 mb-10">
            {[
              { value: '10K+', label: 'Happy Sleepers' },
              { value: '15+', label: 'Years Experience' },
              { value: '5★', label: 'Avg Rating' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-[#e8b85d]">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/builder" className="btn-gold inline-flex items-center justify-center gap-2 text-base">
              Build Your Mattress
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/products" className="border-2 border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors inline-flex items-center justify-center text-base">
              Browse Products
            </Link>
          </div>
        </div>

        {/* Right — Mattress Visual */}
        <div className="hidden lg:flex justify-center items-center">
          <div className="relative w-80">
            {/* Mattress illustration */}
            <div className="relative mx-auto w-72 animate-float">
              {/* Shadow */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-64 h-8 bg-black/30 rounded-full blur-xl" />
              {/* Mattress body */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                {/* Top fabric */}
                <div className="h-4 bg-gradient-to-r from-[#e8b85d]/80 to-[#f5c840]/80" />
                {/* Layers */}
                {[
                  { h: 'h-6', bg: 'bg-yellow-100/90', label: 'Memory Foam' },
                  { h: 'h-8', bg: 'bg-green-100/90', label: 'Natural Latex' },
                  { h: 'h-10', bg: 'bg-blue-100/90', label: 'HD Foam Core' },
                  { h: 'h-6', bg: 'bg-orange-100/90', label: 'Coir Base' },
                ].map((layer, i) => (
                  <div key={i} className={`${layer.h} ${layer.bg} border-t border-white/50 flex items-center px-4`}>
                    <span className="text-xs text-gray-600 font-medium">{layer.label}</span>
                  </div>
                ))}
                {/* Bottom fabric */}
                <div className="h-4 bg-gradient-to-r from-[#1a1a2e] to-[#0f3460]" />
              </div>

              {/* Floating badges */}
              <div className="absolute -right-8 top-4 glass-card text-white text-xs px-3 py-2 rounded-xl">
                <div className="font-bold text-[#e8b85d]">40D</div>
                <div>Legendary</div>
              </div>
              <div className="absolute -left-8 bottom-8 glass-card text-white text-xs px-3 py-2 rounded-xl">
                <div className="font-bold text-green-400">10yr</div>
                <div>Warranty</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
        <ChevronDown className="w-6 h-6" />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
