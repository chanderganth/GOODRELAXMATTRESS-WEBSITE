'use client';

import { useState } from 'react';
import { checkDelivery, DeliveryCheckResult } from '@/lib/deliveryZones';
import { MapPin, Truck, Package, AlertTriangle, Search } from 'lucide-react';

interface DeliveryCheckerProps {
  pincode?: string;
  onResult?: (result: DeliveryCheckResult) => void;
  compact?: boolean;
}

export default function DeliveryChecker({ pincode: initialPincode = '', onResult, compact }: DeliveryCheckerProps) {
  const [pincode, setPincode] = useState(initialPincode);
  const [result, setResult] = useState<DeliveryCheckResult | null>(null);
  const [checked, setChecked] = useState(false);

  const handleCheck = () => {
    const res = checkDelivery(pincode);
    setResult(res);
    setChecked(true);
    onResult?.(res);
  };

  const icon = result?.type === 'door' ? Truck : result?.type === 'pickup' ? Package : AlertTriangle;
  const Icon = icon;
  const bgColor = result?.type === 'door'
    ? 'bg-green-50 border-green-200'
    : result?.type === 'pickup'
      ? 'bg-amber-50 border-amber-200'
      : 'bg-red-50 border-red-200';
  const textColor = result?.type === 'door'
    ? 'text-green-700'
    : result?.type === 'pickup'
      ? 'text-amber-700'
      : 'text-red-700';
  const iconColor = result?.type === 'door'
    ? 'text-green-600'
    : result?.type === 'pickup'
      ? 'text-amber-600'
      : 'text-red-500';

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              maxLength={6}
              className="input-field pl-9 pr-3 w-full"
              placeholder="Enter pincode"
              value={pincode}
              onChange={e => { setPincode(e.target.value.replace(/\D/g, '')); setChecked(false); }}
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
            />
          </div>
          <button onClick={handleCheck} className="btn-primary px-4 text-sm shrink-0">
            Check
          </button>
        </div>
        {checked && result && (
          <div className={`${bgColor} border rounded-lg p-2.5 flex items-start gap-2`}>
            <Icon className={`w-4 h-4 ${iconColor} mt-0.5 shrink-0`} />
            <span className={`text-xs ${textColor}`}>{result.message}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="font-semibold text-[#1a1a2e] text-lg mb-1 flex items-center gap-2">
        <Truck className="w-5 h-5" /> Check Delivery Availability
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        We offer door-to-door delivery in select areas. Enter your pincode to check.
      </p>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            maxLength={6}
            className="input-field pl-10 pr-3 w-full text-lg tracking-wider"
            placeholder="Enter 6-digit pincode"
            value={pincode}
            onChange={e => { setPincode(e.target.value.replace(/\D/g, '')); setChecked(false); }}
            onKeyDown={e => e.key === 'Enter' && handleCheck()}
          />
        </div>
        <button onClick={handleCheck} className="btn-primary px-6 text-base shrink-0">
          Check
        </button>
      </div>

      {checked && result && (
        <div className={`mt-4 ${bgColor} border rounded-xl p-4 flex items-start gap-3`}>
          <Icon className={`w-5 h-5 ${iconColor} mt-0.5 shrink-0`} />
          <div>
            <p className={`font-medium text-sm ${textColor}`}>{result.message}</p>
            {result.type === 'door' && result.zone && (
              <p className="text-xs text-green-600 mt-1">
                Free door-to-door delivery • No extra charges
              </p>
            )}
            {result.type === 'pickup' && result.zone && (
              <p className="text-xs text-amber-600 mt-1">
                {result.zone.note || 'Pickup from nearest distribution point'}
              </p>
            )}
            {result.type === 'unavailable' && (
              <p className="text-xs text-red-600 mt-1">
                Call us at <a href="tel:+919999999999" className="underline font-medium">+91 99999 99999</a> for custom delivery arrangements
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
