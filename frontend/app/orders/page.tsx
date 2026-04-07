'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Order } from '@/lib/types';
import { ORDER_STATUS_LABELS, PRODUCTION_STATUS_LABELS, formatDate, formatPrice } from '@/lib/priceCalculator';
import { Search, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import BarcodePreview from '@/components/BarcodeGenerator';
import { getLocalOrders } from '@/lib/localOrders';

const ORDER_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'in_production', label: 'In Production', icon: Package },
  { key: 'quality_check', label: 'Quality Check', icon: CheckCircle },
  { key: 'dispatched', label: 'Dispatched', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
];

function TrackingTimeline({ order }: { order: Order }) {
  const currentStep = ORDER_STATUS_LABELS[order.status]?.step || 1;

  return (
    <div className="relative">
      <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200" />
      <div className="space-y-6">
        {ORDER_STEPS.map((step, i) => {
          const Icon = step.icon;
          const completed = i + 1 < currentStep;
          const active = i + 1 === currentStep;
          const timeline = order.timeline?.find(t => t.status === step.key);

          return (
            <div key={step.key} className="flex items-start gap-4 relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${
                completed ? 'bg-green-500 text-white' : active ? 'bg-[#1a1a2e] text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="pt-1.5">
                <p className={`font-medium text-sm ${active ? 'text-[#1a1a2e]' : completed ? 'text-gray-600' : 'text-gray-400'}`}>
                  {step.label}
                </p>
                {timeline && (
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(timeline.timestamp)}</p>
                )}
                {timeline?.note && (
                  <p className="text-xs text-gray-500 mt-0.5">{timeline.note}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Demo order for when API is offline
const DEMO_ORDER: Order = {
  id: 'demo-001',
  orderNumber: 'GRM-DEMO-001',
  customer: { name: 'Demo Customer', phone: '9999999999', address: 'Bengaluru, Karnataka', email: 'demo@example.com' },
  mattress: {
    size: { length: 78, width: 60, thickness: 6 },
    density: '32D_Epic',
    layers: [{ type: 'memoryFoam', thickness: 2, label: 'Memory Foam' }, { type: 'foam', thickness: 4, label: 'HD Foam' }],
    fabric: 'velvet',
    hardness: 'medium',
  },
  priceBreakdown: {
    sqft: 32.5, basePrice: 26000, densityAddition: 16250, layerPrice: 1500, fabricPrice: 1200,
    hardnessAddition: 4495, subtotal: 49445, gstAmount: 8900, totalPrice: 58345,
  },
  totalPrice: 58345,
  status: 'in_production',
  productionStatus: 'layer_assembly',
  timeline: [
    { status: 'pending', timestamp: '2026-03-25T10:00:00Z', note: 'Order placed' },
    { status: 'confirmed', timestamp: '2026-03-25T12:00:00Z', note: 'Payment confirmed' },
    { status: 'in_production', timestamp: '2026-03-26T09:00:00Z', note: 'Started foam cutting' },
  ],
  expectedDelivery: 'Apr 02, 2026',
  createdAt: '2026-03-25T10:00:00Z',
  updatedAt: '2026-03-26T09:00:00Z',
};

export default function OrdersPage() {
  const [searchId, setSearchId] = useState('');
  const [queryOrderId, setQueryOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await api.orders.getById(searchId.trim());
      setOrder(res.data);
    } catch (_) {
      const localMatch = getLocalOrders().find(localOrder => {
        const query = searchId.trim();
        return localOrder.id === query || localOrder.orderNumber === query;
      });

      if (localMatch) {
        setOrder(localMatch);
        setLoading(false);
        return;
      }

      // Demo fallback
      if (searchId.trim().toUpperCase().includes('DEMO') || searchId.trim() === 'GRM-DEMO-001') {
        setOrder(DEMO_ORDER);
      } else {
        setError('Order not found. Try "GRM-DEMO-001" to see a demo.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const idFromQuery = new URLSearchParams(window.location.search).get('id');
    if (!idFromQuery) return;

    setQueryOrderId(idFromQuery);
    setSearchId(idFromQuery);
  }, []);

  useEffect(() => {
    if (!queryOrderId) return;
    if (!searchId.trim()) return;

    void handleSearch();
    // Trigger lookup when query id is present.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchId, queryOrderId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1a1a2e] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Track Your Order</h1>
          <p className="text-gray-300 text-lg mb-8">Enter your order number or barcode to track production & delivery</p>

          <div className="flex gap-3 max-w-lg mx-auto">
            <input
              type="text"
              className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#e8b85d] transition-colors"
              placeholder="Enter order number (e.g. GRM-DEMO-001)"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn-gold flex items-center gap-2 px-6 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-[#1a1a2e]/30 border-t-[#1a1a2e] rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Track
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center mb-6">
            {error}
          </div>
        )}

        {order && (
          <div className="space-y-6 animate-fade-in">
            {/* Order Header */}
            <div className="card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="font-bold text-[#1a1a2e] text-2xl">#{order.orderNumber}</h2>
                  <p className="text-gray-500 text-sm mt-1">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${ORDER_STATUS_LABELS[order.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                    {ORDER_STATUS_LABELS[order.status]?.label || order.status}
                  </span>
                </div>
              </div>

              {order.expectedDelivery && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">Expected delivery: {order.expectedDelivery}</span>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Timeline */}
              <div className="card p-6">
                <h3 className="font-semibold text-[#1a1a2e] text-lg mb-5">Order Timeline</h3>
                <TrackingTimeline order={order} />
              </div>

              {/* Details */}
              <div className="space-y-6">
                {/* Customer */}
                <div className="card p-6">
                  <h3 className="font-semibold text-[#1a1a2e] text-lg mb-4">Customer</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2"><span className="text-gray-500 w-20">Name</span><span className="font-medium">{order.customer.name}</span></div>
                    <div className="flex gap-2"><span className="text-gray-500 w-20">Phone</span><span className="font-medium">{order.customer.phone}</span></div>
                    <div className="flex gap-2"><span className="text-gray-500 w-20">Address</span><span className="font-medium">{order.customer.address}</span></div>
                  </div>
                </div>

                {/* Production Status */}
                <div className="card p-6">
                  <h3 className="font-semibold text-[#1a1a2e] text-lg mb-3">Production Status</h3>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${PRODUCTION_STATUS_LABELS[order.productionStatus]?.color || 'bg-gray-100 text-gray-600'}`}>
                    {PRODUCTION_STATUS_LABELS[order.productionStatus]?.label || order.productionStatus}
                  </span>
                </div>

                {/* Price */}
                <div className="card p-6">
                  <h3 className="font-semibold text-[#1a1a2e] text-lg mb-3">Order Value</h3>
                  <div className="text-3xl font-bold text-[#1a1a2e]">{formatPrice(order.totalPrice)}</div>
                  <p className="text-xs text-gray-400 mt-1">GST included</p>
                </div>
              </div>
            </div>

            {/* Barcode */}
            <BarcodePreview
              text={order.orderNumber}
              label={`Order: ${order.orderNumber}`}
            />
          </div>
        )}

        {!order && !error && !loading && (
          <div className="text-center py-16 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Enter your order number above to track your mattress</p>
            <p className="text-sm mt-1">Try <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">GRM-DEMO-001</span> for a demo</p>
          </div>
        )}
      </div>
    </div>
  );
}
