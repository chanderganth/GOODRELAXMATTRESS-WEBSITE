'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { CustomerRecord } from '@/lib/types';
import { formatPrice } from '@/lib/priceCalculator';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);

  useEffect(() => {
    api.customers.getAll()
      .then(res => setCustomers((res as { success: boolean; data: CustomerRecord[] }).data))
      .catch(() => setCustomers([]));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-[#1a1a2e] mb-6">Customers</h1>
        <div className="grid md:grid-cols-2 gap-4">
          {customers.map(c => (
            <div key={c.phone} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-[#1a1a2e]">{c.name}</h2>
                <span className="text-xs bg-[#1a1a2e] text-white px-2 py-1 rounded-full">{c.totalOrders} orders</span>
              </div>
              <p className="text-sm text-gray-500">{c.phone}</p>
              <p className="text-sm text-gray-500">{c.email || 'No email'}</p>
              <p className="text-sm text-gray-600 mt-2">Total Spent: <span className="font-semibold text-[#1a1a2e]">{formatPrice(c.totalSpent)}</span></p>
            </div>
          ))}
          {customers.length === 0 && (
            <div className="card p-10 text-center text-gray-400 md:col-span-2">No customers found</div>
          )}
        </div>
      </div>
    </div>
  );
}
