'use client';

import { useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { Lock, LogOut, Moon } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

function AdminLoginGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login, logout } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-11 h-11 bg-[#e8b85d] rounded-xl flex items-center justify-center">
              <Moon className="w-6 h-6 text-[#1a1a2e]" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-[#1a1a2e] font-display font-bold text-xl block">GoodRelax</span>
              <span className="text-[#e8b85d] text-[10px] font-medium tracking-widest uppercase">Admin Panel</span>
            </div>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
              <Lock className="w-7 h-7 text-gray-400" />
            </div>
          </div>

          <h2 className="text-center text-xl font-bold text-[#1a1a2e] mb-1">Admin Login</h2>
          <p className="text-center text-sm text-gray-500 mb-6">Enter your admin password to continue</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError('');
              if (login(password)) {
                toast.success('Welcome back, Admin!');
              } else {
                setError('Incorrect password');
                setPassword('');
              }
            }}
          >
            <input
              type="password"
              className="input-field w-full mb-3"
              placeholder="Admin password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button type="submit" className="btn-primary w-full py-3 text-base">
              Login
            </button>
          </form>

          <Link href="/" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-4">
            ← Back to website
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Admin top bar */}
      <div className="bg-[#1a1a2e] text-white px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-[#e8b85d]">Admin Panel</span>
          <Link href="/admin" className="hover:text-[#e8b85d] transition-colors">Dashboard</Link>
          <Link href="/admin/products" className="hover:text-[#e8b85d] transition-colors">Products</Link>
          <Link href="/admin/orders" className="hover:text-[#e8b85d] transition-colors">Orders</Link>
          <Link href="/admin/customers" className="hover:text-[#e8b85d] transition-colors">Customers</Link>
          <Link href="/admin/stock" className="hover:text-[#e8b85d] transition-colors">Stock</Link>
          <Link href="/admin/delivery" className="hover:text-[#e8b85d] transition-colors">Delivery</Link>
        </div>
        <button
          onClick={() => { logout(); toast.success('Logged out'); }}
          className="flex items-center gap-1.5 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </div>
      {children}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLoginGate>{children}</AdminLoginGate>
    </AdminAuthProvider>
  );
}
