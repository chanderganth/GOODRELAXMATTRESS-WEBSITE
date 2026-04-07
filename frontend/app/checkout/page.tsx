'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { formatPrice, DENSITY_INFO, LAYER_INFO, FABRIC_INFO, HARDNESS_INFO, getExpectedDelivery } from '@/lib/priceCalculator';
import { generatePDFQuotation } from '@/components/PDFQuotation';
import api from '@/lib/api';
import type { Order } from '@/lib/types';
import { saveLocalOrder } from '@/lib/localOrders';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Check, FileText, User, MapPin, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { state, clearCart, totalPrice } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', city: '', pincode: '',
  });

  const buildLocalOrder = (orderData: {
    customer: {
      name: string;
      phone: string;
      email: string;
      address: string;
      city: string;
      pincode: string;
    };
    mattress: NonNullable<(typeof state.items)[number]['mattressConfig']>;
    priceBreakdown: (typeof state.items)[number]['priceBreakdown'];
    totalPrice: number;
    notes: string;
    expectedDelivery: string;
  }, orderNumber: string): Order => {
    const timestamp = new Date().toISOString();

    return {
      ...orderData,
      id: `local-${Date.now()}`,
      orderNumber,
      status: 'pending',
      productionStatus: 'not_started',
      timeline: [{ status: 'pending', timestamp, note: 'Order placed' }],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  };

  const handlePlaceOrder = async () => {
    if (!form.name || !form.phone || !form.address) {
      toast.error('Please fill all required fields');
      return;
    }
    if (state.items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setLoading(true);
    const firstItem = state.items[0];
    const orderData = {
      customer: { ...form },
      mattress: firstItem.mattressConfig || {
        size: { length: 78, width: 60, thickness: 6 },
        density: firstItem.product?.category || '32D_Epic',
        layers: [{ type: 'foam', thickness: 4, label: 'HD Foam' }],
        fabric: 'cotton',
        hardness: 'medium',
      },
      priceBreakdown: firstItem.priceBreakdown,
      totalPrice,
      notes: `Items: ${state.items.length}`,
      expectedDelivery: getExpectedDelivery(7),
    };

    try {
      const result = await api.orders.create(orderData);
      const order = (result as { success: boolean; data: Order }).data;
      saveLocalOrder(order);

      // Download PDF
      if (firstItem.mattressConfig) {
        generatePDFQuotation(firstItem.mattressConfig, firstItem.priceBreakdown, order.orderNumber);
      }

      clearCart();
      toast.success(`Order ${order.orderNumber} placed successfully!`);
      router.push(`/orders?id=${order.orderNumber}`);
    } catch (err) {
      // Fallback: save order locally so it appears in admin and tracking pages.
      const mockOrderNumber = `GRM-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
      const fallbackOrder = buildLocalOrder(orderData, mockOrderNumber);
      saveLocalOrder(fallbackOrder);

      clearCart();
      toast.success(`Order ${mockOrderNumber} placed!`);
      router.push(`/orders?id=${mockOrderNumber}`);
    } finally {
      setLoading(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <Link href="/builder" className="btn-primary mt-4">Build a Mattress</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1a1a2e] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-4xl font-bold mb-2">Checkout</h1>
          <p className="text-gray-300">Review your order and provide delivery details</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-[#1a1a2e] text-lg mb-5 flex items-center gap-2">
              <User className="w-5 h-5" /> Delivery Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name *</label>
                <input className="input-field" placeholder="Your full name" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Phone *
                </label>
                <input className="input-field" placeholder="+91 99999 99999" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Email (optional)
                </label>
                <input className="input-field" type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Delivery Address *
                </label>
                <textarea className="input-field resize-none" rows={3} placeholder="House no, Street, Area"
                  value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">City</label>
                <input className="input-field" placeholder="City" value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Pincode</label>
                <input className="input-field" placeholder="560001" value={form.pincode}
                  onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div className="card p-6">
            <h2 className="font-semibold text-[#1a1a2e] text-lg mb-4">Order Items ({state.items.length})</h2>
            <div className="space-y-3">
              {state.items.map(item => (
                <div key={item.id} className="flex justify-between items-start bg-gray-50 rounded-xl p-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-800">
                      {item.product?.name || `${DENSITY_INFO[item.mattressConfig!.density].label} Custom`}
                    </p>
                    {item.mattressConfig && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.mattressConfig.size.length}×{item.mattressConfig.size.width}&quot; •{' '}
                        {HARDNESS_INFO[item.mattressConfig.hardness].label} •{' '}
                        {FABRIC_INFO[item.mattressConfig.fabric].label}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-[#1a1a2e]">{formatPrice(item.priceBreakdown.totalPrice)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card p-6 h-fit sticky top-32">
          <h3 className="font-semibold text-[#1a1a2e] text-lg mb-5">Order Summary</h3>
          <div className="space-y-3 text-sm mb-5">
            <div className="flex justify-between text-gray-600">
              <span>Items ({state.items.length})</span>
              <span>{formatPrice(state.items.reduce((s, i) => s + i.priceBreakdown.subtotal, 0))}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST (18%)</span>
              <span>+{formatPrice(state.items.reduce((s, i) => s + i.priceBreakdown.gstAmount, 0))}</span>
            </div>
            <div className="flex justify-between text-green-600 font-medium">
              <span>Delivery</span>
              <span>FREE</span>
            </div>
          </div>
          <div className="bg-[#1a1a2e] text-white rounded-xl p-4 flex justify-between items-center mb-5">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-[#e8b85d]">{formatPrice(totalPrice)}</span>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-5 flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <div className="text-xs text-green-700">
              <div className="font-medium mb-0.5">Expected Delivery: {getExpectedDelivery(7)}</div>
              <div className="text-green-600">Free delivery across India</div>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Placing Order...</>
            ) : (
              <><Check className="w-5 h-5" /> Place Order</>
            )}
          </button>
          <p className="text-xs text-center text-gray-400 mt-3">PDF quotation will be downloaded after order</p>
        </div>
      </div>
    </div>
  );
}
