import Link from 'next/link';
import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import Features from '@/components/home/Features';
import Testimonials from '@/components/home/Testimonials';
import DeliveryChecker from '@/components/DeliveryChecker';
import { ArrowRight, Sliders, FileText, BarChart2 } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <Features />

      {/* Custom Builder CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-hero-pattern text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-5">
            Build Your <span className="gradient-text">Perfect Mattress</span>
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
            Use our interactive custom builder to configure every layer, choose your category, fabric, and get an instant price — no salesperson needed.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { icon: Sliders, title: 'Configure Layers', desc: '5 layer types, unlimited combos' },
              { icon: FileText, title: 'Get PDF Quote', desc: 'Instant quotation with GST' },
              { icon: BarChart2, title: 'Real-time Pricing', desc: 'See price update live as you build' },
            ].map(f => (
              <div key={f.title} className="glass-card rounded-xl p-5">
                <f.icon className="w-8 h-8 text-[#e8b85d] mx-auto mb-3" />
                <div className="font-semibold text-white mb-1">{f.title}</div>
                <div className="text-gray-400 text-sm">{f.desc}</div>
              </div>
            ))}
          </div>

          <Link href="/builder" className="btn-gold inline-flex items-center gap-2 text-lg px-8 py-4">
            Start Building Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Testimonials />

      {/* Delivery Checker */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-2xl mx-auto">
          <DeliveryChecker />
        </div>
      </section>

      {/* Order Tracking CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#1a1a2e] mb-3">Already Ordered?</h2>
          <p className="text-gray-500 mb-6">Track your mattress from production to delivery with real-time updates.</p>
          <Link href="/orders" className="btn-primary inline-flex items-center gap-2">
            Track My Order
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
