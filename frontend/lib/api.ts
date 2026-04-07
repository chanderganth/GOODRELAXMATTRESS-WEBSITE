import type { Order, OrderStatus } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'goodrelax-admin-2024';

async function request<T>(endpoint: string, options?: RequestInit, admin = false): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (admin) headers['x-admin-secret'] = ADMIN_SECRET;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json;
}

// Products
export const api = {
  products: {
    getAll: (category?: string) =>
      request<{ success: boolean; data: unknown[] }>(`/api/products${category ? `?category=${category}` : ''}`),
    getById: (id: string) =>
      request<{ success: boolean; data: unknown }>(`/api/products/${id}`),
    getPricing: () =>
      request<{ success: boolean; data: unknown }>('/api/products/pricing'),
    create: (data: unknown) =>
      request<{ success: boolean; data: unknown }>('/api/products', { method: 'POST', body: JSON.stringify(data) }, true),
    update: (id: string, data: unknown) =>
      request<{ success: boolean; data: unknown }>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/products/${id}`, { method: 'DELETE' }, true),
    updatePricing: (data: unknown) =>
      request<{ success: boolean }>('/api/products/pricing/config', { method: 'PUT', body: JSON.stringify(data) }, true),
    uploadImages: async (files: File[]): Promise<{ success: boolean; data: string[] }> => {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      const res = await fetch(`${API_URL}/api/products/upload`, {
        method: 'POST',
        headers: { 'x-admin-secret': ADMIN_SECRET },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Upload failed');
      return json;
    },
  },

  orders: {
    getAll: (status?: string) =>
      request<{ success: boolean; data: Order[] }>(`/api/orders${status ? `?status=${status}` : ''}`, {}, true),
    getById: (id: string) =>
      request<{ success: boolean; data: Order }>(`/api/orders/${id}`),
    create: (data: unknown) =>
      request<{ success: boolean; data: Order }>('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, data: { status?: OrderStatus; productionStatus?: string; note?: string }) =>
      request<{ success: boolean; data: Order }>(`/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }, true),
    getStats: () =>
      request<{ success: boolean; data: unknown }>('/api/orders/stats', {}, true),
  },

  customers: {
    getAll: () =>
      request<{ success: boolean; data: unknown[] }>('/api/customers', {}, true),
    getByPhone: (phone: string) =>
      request<{ success: boolean; data: unknown }>(`/api/customers/${encodeURIComponent(phone)}`, {}, true),
  },

  barcode: {
    generate: (text: string) =>
      request<{ success: boolean; data: { barcode: string; text: string } }>(
        '/api/barcode/generate',
        { method: 'POST', body: JSON.stringify({ text }) }
      ),
  },

  stock: {
    get: () => request<{ success: boolean; data: unknown }>('/api/stock', {}, true),
    update: (data: unknown) => request<{ success: boolean }>('/api/stock', { method: 'PUT', body: JSON.stringify(data) }, true),
    getLogs: () => request<{ success: boolean; data: unknown[] }>('/api/stock/logs', {}, true),
  },
};

export default api;
