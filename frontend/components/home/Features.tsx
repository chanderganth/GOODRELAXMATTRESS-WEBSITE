import { Truck, Shield, Wrench, Headphones, Award, Leaf } from 'lucide-react';

const features = [
  {
    icon: Wrench,
    title: 'Custom Built',
    description: 'Every mattress is built to your exact specifications — size, density, layers, and fabric.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Free home delivery across India. We deliver directly from our factory to your door.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Shield,
    title: 'Up to 10-Year Warranty',
    description: 'Our 40D Legendary comes with a full 10-year warranty. Sleep with complete peace of mind.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our sleep experts are available around the clock to help you choose the perfect mattress.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Award,
    title: 'ISI Certified',
    description: 'All our foam materials are ISI certified and tested for safety, durability, and quality.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Leaf,
    title: 'Eco-Friendly',
    description: 'We use sustainably sourced natural latex and coir with minimal environmental impact.',
    color: 'bg-teal-50 text-teal-600',
  },
];

export default function Features() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="section-title">Why Choose GoodRelax?</h2>
          <p className="section-subtitle">We don&apos;t just sell mattresses — we craft sleep experiences</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(feat => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="card p-6 hover:translate-y-[-2px] transition-all duration-200">
                <div className={`w-12 h-12 ${feat.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-[#1a1a2e] text-lg mb-2">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
