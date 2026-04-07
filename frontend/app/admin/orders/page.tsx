'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Order } from '@/lib/types';
import { ORDER_STATUS_LABELS, formatDate, formatPrice } from '@/lib/priceCalculator';
import { getLocalOrders } from '@/lib/localOrders';

function mergeOrders(primaryOrders: Order[], fallbackOrders: Order[]): Order[] {
  const mergedByOrderNumber = new Map<string, Order>();

  [...fallbackOrders, ...primaryOrders].forEach((order) => {
    mergedByOrderNumber.set(order.orderNumber, order);
  });

  return Array.from(mergedByOrderNumber.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const localOrders = getLocalOrders();

    api.orders.getAll()
      .then(res => {
        const apiOrders = (res as { success: boolean; data: Order[] }).data;
        setOrders(mergeOrders(apiOrders, localOrders));
      })
      .catch(() => setOrders(localOrders));
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.orders.updateStatus(orderId, { status: status as Order['status'] });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as Order['status'] } : o));
    } catch (_) {
      // Demo mode fallback
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as Order['status'] } : o));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-[#1a1a2e] mb-6">Order Management</h1>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Order</th>
                <th className="text-left p-4 font-semibold text-gray-600">Customer</th>
                <th className="text-left p-4 font-semibold text-gray-600">Date</th>
                <th className="text-left p-4 font-semibold text-gray-600">Amount</th>
                <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                <th className="text-left p-4 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-[#1a1a2e]">{order.orderNumber}</td>
                  <td className="p-4 text-gray-600">{order.customer.name}</td>
                  <td className="p-4 text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="p-4 font-medium">{formatPrice(order.totalPrice)}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_LABELS[order.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                      {ORDER_STATUS_LABELS[order.status]?.label || order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      className="input-field py-2 text-sm"
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_production">In Production</option>
                      <option value="quality_check">Quality Check</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
