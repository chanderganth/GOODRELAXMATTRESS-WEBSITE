'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { StockInventory } from '@/lib/types';

const FALLBACK: StockInventory = {
  foam: { quantity: 100, unit: 'blocks', threshold: 10 },
  memoryFoam: { quantity: 50, unit: 'blocks', threshold: 5 },
  latex: { quantity: 30, unit: 'blocks', threshold: 5 },
  coir: { quantity: 80, unit: 'blocks', threshold: 10 },
  spring: { quantity: 40, unit: 'units', threshold: 5 },
};

export default function AdminStockPage() {
  const [stock, setStock] = useState<StockInventory>(FALLBACK);

  useEffect(() => {
    api.stock.get()
      .then(res => setStock((res as { success: boolean; data: StockInventory }).data))
      .catch(() => setStock(FALLBACK));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-[#1a1a2e] mb-6">Stock Tracking</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(stock).map(([name, item]) => {
            const low = item.quantity <= item.threshold;
            return (
              <div key={name} className="card p-5">
                <p className="text-sm text-gray-500 capitalize">{name}</p>
                <p className="text-2xl font-bold text-[#1a1a2e] mt-1">{item.quantity} <span className="text-sm font-medium text-gray-400">{item.unit}</span></p>
                <p className={`text-xs mt-2 font-medium ${low ? 'text-red-600' : 'text-green-600'}`}>
                  {low ? 'Low stock alert' : 'Stock healthy'}
                </p>
                <p className="text-xs text-gray-400">Threshold: {item.threshold} {item.unit}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
