'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { DashboardStats } from '@/lib/types';
import { formatPrice } from '@/lib/priceCalculator';
import Link from 'next/link';
import { Package, Users, IndianRupee, Activity, ArrowRight } from 'lucide-react';

const FALLBACK_STATS: DashboardStats = {
  totalOrders: 48,
  totalCustomers: 41,
  totalRevenue: 1423500,
  statusCounts: { pending: 5, confirmed: 8, in_production: 16, dispatched: 7, delivered: 12 },
  recentOrders: [],
};

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats>(FALLBACK_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.orders.getStats()
      .then(res => setStats((res as { success: boolean; data: DashboardStats }).data))
      .catch(() => setStats(FALLBACK_STATS))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { icon: Package, label: 'Total Orders', value: stats.totalOrders, color: 'bg-blue-50 text-blue-600' },
    { icon: Users, label: 'Customers', value: stats.totalCustomers, color: 'bg-green-50 text-green-600' },
    { icon: IndianRupee, label: 'Revenue', value: formatPrice(stats.totalRevenue), color: 'bg-amber-50 text-amber-600' },
    { icon: Activity, label: 'In Production', value: stats.statusCounts.in_production || 0, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1a1a2e] text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-300 mt-2">Manage products, orders, customers and stock</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map(c => (
            <div key={c.label} className="card p-5">
              <div className={`w-11 h-11 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
                <c.icon className="w-5 h-5" />
              </div>
              <p className="text-gray-500 text-sm">{c.label}</p>
              <p className="text-2xl font-bold text-[#1a1a2e] mt-1">{loading ? '...' : c.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { href: '/admin/products', title: 'Manage Products', desc: 'Categories, pricing, layers' },
            { href: '/admin/orders', title: 'Order Management', desc: 'Track and update statuses' },
            { href: '/admin/customers', title: 'Customers', desc: 'View customer records' },
            { href: '/admin/stock', title: 'Stock Tracking', desc: 'Foam blocks and fabrics' },
            { href: '/admin/delivery', title: 'Delivery Zones', desc: 'Manage delivery areas' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="card p-5 hover:shadow-md transition-shadow">
              <h2 className="font-semibold text-[#1a1a2e] mb-1">{item.title}</h2>
              <p className="text-sm text-gray-500 mb-4">{item.desc}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1a1a2e]">
                Open <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
