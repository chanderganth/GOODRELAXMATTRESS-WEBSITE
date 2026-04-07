'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Menu, X, Moon, Phone } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, openCart } = useCart();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/builder', label: 'Custom Builder' },
    { href: '/orders', label: 'Track Order' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#1a1a2e] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#e8b85d] rounded-lg flex items-center justify-center">
              <Moon className="w-5 h-5 text-[#1a1a2e]" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-white font-display font-bold text-lg leading-tight block">GoodRelax</span>
              <span className="text-[#e8b85d] text-[10px] font-medium tracking-widest uppercase leading-none">Mattress</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <a href="tel:+919999999999" className="hidden md:flex items-center gap-1.5 text-[#e8b85d] text-sm font-medium hover:text-yellow-300 transition-colors">
              <Phone className="w-4 h-4" />
              <span>+91 99999 99999</span>
            </a>
            <button
              onClick={openCart}
              className="relative p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#e8b85d] text-[#1a1a2e] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#16213e] border-t border-white/10 px-4 py-4 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="tel:+919999999999"
            className="flex items-center gap-2 text-[#e8b85d] px-4 py-3 text-sm font-medium"
          >
            <Phone className="w-4 h-4" />
            +91 99999 99999
          </a>
        </div>
      )}
    </nav>
  );
}
