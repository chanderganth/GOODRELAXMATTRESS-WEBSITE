'use client';

import { useCart } from '@/context/CartContext';
import { formatPrice, DENSITY_INFO, LAYER_INFO, FABRIC_INFO, HARDNESS_INFO } from '@/lib/priceCalculator';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CartDrawer() {
  const { state, removeItem, closeCart, totalPrice, totalItems } = useCart();

  if (!state.isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-[#1a1a2e] text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="font-semibold text-lg">Cart ({totalItems})</h2>
          </div>
          <button onClick={closeCart} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 pb-16">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-30" />
              <p className="font-medium text-gray-500">Your cart is empty</p>
              <p className="text-sm mt-1">Add a mattress to get started</p>
              <Link href="/builder" onClick={closeCart} className="btn-primary mt-6 text-sm">
                Build Custom Mattress
              </Link>
            </div>
          ) : (
            state.items.map(item => (
              <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-bold px-2 py-0.5 bg-[#1a1a2e] text-white rounded-full uppercase mb-1 inline-block">
                      {item.type === 'custom' ? 'Custom Build' : 'Standard'}
                    </span>
                    {item.product && (
                      <h3 className="font-semibold text-gray-800 text-sm mt-1">{item.product.name}</h3>
                    )}
                    {item.mattressConfig && (
                      <div className="space-y-0.5 mt-1">
                        <p className="text-sm font-medium text-gray-800">
                          {DENSITY_INFO[item.mattressConfig.density].label} — Custom
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.mattressConfig.size.length}×{item.mattressConfig.size.width}×{item.mattressConfig.size.thickness}&quot; •{' '}
                          {FABRIC_INFO[item.mattressConfig.fabric].label} •{' '}
                          {HARDNESS_INFO[item.mattressConfig.hardness].label}
                        </p>
                        <p className="text-xs text-gray-500">
                          Layers: {item.mattressConfig.layers.map(l => LAYER_INFO[l.type].label).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors shrink-0 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Price breakdown mini */}
                <div className="border-t border-gray-200 pt-3 mt-3 space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatPrice(item.priceBreakdown.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>GST (18%)</span>
                    <span>+{formatPrice(item.priceBreakdown.gstAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#1a1a2e] pt-1">
                    <span>Item Total</span>
                    <span>{formatPrice(item.priceBreakdown.totalPrice)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t p-5 space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Grand Total</span>
              <span className="text-2xl font-bold text-[#1a1a2e]">{formatPrice(totalPrice)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3.5"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
