import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    city: 'Bengaluru',
    rating: 5,
    review: 'Best investment I have made for my health! The 40D Legendary mattress completely cured my back pain. The custom builder made it so easy to pick exactly what I needed.',
    product: '40D Legendary — King Size',
    initials: 'PS',
    color: 'bg-purple-500',
  },
  {
    name: 'Rahul Mehta',
    city: 'Mumbai',
    rating: 5,
    review: 'Ordered a custom size (80×56 inches) for our unusual bed frame. GoodRelax delivered perfectly. The memory foam layer is heavenly.',
    product: '32D Epic — Custom Size',
    initials: 'RM',
    color: 'bg-blue-500',
  },
  {
    name: 'Anitha KC',
    city: 'Chennai',
    rating: 5,
    review: 'The PDF quotation feature was brilliant! I could show my husband the exact pricing before ordering. Transparent pricing and great quality.',
    product: '28D Rare — Queen Size',
    initials: 'AK',
    color: 'bg-green-500',
  },
  {
    name: 'Vikram Singh',
    city: 'Delhi',
    rating: 5,
    review: 'Got mattresses for my entire hotel (32 rooms). The bulk pricing was excellent, delivery was on time, and the order tracking kept us updated throughout production.',
    product: '32D Epic — Bulk Order',
    initials: 'VS',
    color: 'bg-amber-500',
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Thousands of happy sleepers across India</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="card p-6 flex flex-col">
              {/* Stars */}
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#e8b85d] text-[#e8b85d]" />
                ))}
              </div>
              {/* Review */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">&ldquo;{t.review}&rdquo;</p>
              {/* Product */}
              <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg mb-4 font-medium">
                {t.product}
              </div>
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 ${t.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{t.name}</div>
                  <div className="text-gray-400 text-xs">{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
