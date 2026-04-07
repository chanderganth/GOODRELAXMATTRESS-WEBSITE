import type { Order } from './types';

const LOCAL_ORDERS_KEY = 'goodrelax_local_orders';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getLocalOrders(): Order[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(LOCAL_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

export function saveLocalOrder(order: Order): void {
  if (!canUseStorage()) return;

  const existingOrders = getLocalOrders();
  const filtered = existingOrders.filter(existing => existing.orderNumber !== order.orderNumber && existing.id !== order.id);
  const updated = [order, ...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  window.localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
}
