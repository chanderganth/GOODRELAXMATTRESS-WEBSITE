'use client';

import { useEffect, useState } from 'react';
import { getDeliveryZones, saveDeliveryZones, DeliveryZone, DeliveryType } from '@/lib/deliveryZones';
import { MapPin, Plus, Trash2, Edit2, Save, X, Truck, Package, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const DELIVERY_TYPES: { value: DeliveryType; label: string; color: string }[] = [
  { value: 'door', label: 'Door Delivery', color: 'bg-green-100 text-green-800' },
  { value: 'pickup', label: 'Pickup Only', color: 'bg-amber-100 text-amber-800' },
  { value: 'unavailable', label: 'Unavailable', color: 'bg-red-100 text-red-800' },
];

export default function AdminDeliveryPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    pincodeRange: '', // comma-separated or range like 600001-600130
    deliveryType: 'door' as DeliveryType,
    estimatedDays: 7,
    note: '',
  });

  useEffect(() => {
    setZones(getDeliveryZones());
  }, []);

  const save = (updated: DeliveryZone[]) => {
    setZones(updated);
    saveDeliveryZones(updated);
  };

  const parsePincodes = (input: string): string[] => {
    const result: string[] = [];
    const parts = input.split(',').map(s => s.trim());
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(s => s.trim());
        if (start && end && /^\d{6}$/.test(start) && /^\d{6}$/.test(end)) {
          const s = parseInt(start);
          const e = parseInt(end);
          const max = Math.min(Math.abs(e - s) + 1, 500); // limit to 500 pincodes per range
          for (let i = 0; i < max; i++) {
            result.push(String(Math.min(s, e) + i).padStart(6, '0'));
          }
        }
      } else if (/^\d{6}$/.test(part)) {
        result.push(part);
      }
    }
    return [...new Set(result)];
  };

  const handleAdd = () => {
    if (!form.name.trim()) {
      toast.error('Zone name is required');
      return;
    }
    const pincodes = parsePincodes(form.pincodeRange);
    const newZone: DeliveryZone = {
      id: `zone-${Date.now()}`,
      name: form.name.trim(),
      pincodes,
      deliveryType: form.deliveryType,
      estimatedDays: form.estimatedDays,
      note: form.note.trim() || undefined,
    };
    save([...zones, newZone]);
    setForm({ name: '', pincodeRange: '', deliveryType: 'door', estimatedDays: 7, note: '' });
    setShowAddForm(false);
    toast.success(`Zone "${newZone.name}" added with ${pincodes.length} pincodes`);
  };

  const handleDelete = (id: string) => {
    const zone = zones.find(z => z.id === id);
    if (confirm(`Delete zone "${zone?.name}"?`)) {
      save(zones.filter(z => z.id !== id));
      toast.success('Zone deleted');
    }
  };

  const handleEditSave = (id: string) => {
    save(zones.map(z => z.id === id ? { ...z } : z));
    setEditingId(null);
    toast.success('Zone updated');
  };

  const updateZone = (id: string, updates: Partial<DeliveryZone>) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
  };

  const handleAddPincodes = (id: string, input: string) => {
    const zone = zones.find(z => z.id === id);
    if (!zone) return;
    const newPincodes = parsePincodes(input);
    const merged = [...new Set([...zone.pincodes, ...newPincodes])];
    updateZone(id, { pincodes: merged });
  };

  const handleRemovePincode = (id: string, pincode: string) => {
    const zone = zones.find(z => z.id === id);
    if (!zone) return;
    updateZone(id, { pincodes: zone.pincodes.filter(p => p !== pincode) });
  };

  const getTypeIcon = (type: DeliveryType) => {
    switch (type) {
      case 'door': return <Truck className="w-4 h-4" />;
      case 'pickup': return <Package className="w-4 h-4" />;
      case 'unavailable': return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1a1a2e] text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-4xl font-bold flex items-center gap-3">
            <MapPin className="w-9 h-9 text-[#e8b85d]" /> Delivery Zones
          </h1>
          <p className="text-gray-300 mt-2">Manage where door delivery and pickup options are available</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Summary cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Door Delivery Zones', count: zones.filter(z => z.deliveryType === 'door').length, color: 'text-green-600 bg-green-50' },
            { label: 'Pickup Only Zones', count: zones.filter(z => z.deliveryType === 'pickup').length, color: 'text-amber-600 bg-amber-50' },
            { label: 'Total Pincodes', count: zones.reduce((s, z) => s + z.pincodes.length, 0), color: 'text-blue-600 bg-blue-50' },
          ].map(c => (
            <div key={c.label} className="card p-5">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-3xl font-bold mt-1 ${c.color.split(' ')[0]}`}>{c.count}</p>
            </div>
          ))}
        </div>

        {/* Add Zone button */}
        {!showAddForm && (
          <button onClick={() => setShowAddForm(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Delivery Zone
          </button>
        )}

        {/* Add Zone Form */}
        {showAddForm && (
          <div className="card p-6">
            <h2 className="font-semibold text-[#1a1a2e] text-lg mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" /> New Delivery Zone
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Zone Name *</label>
                <input className="input-field" placeholder="e.g. Chennai City" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Delivery Type *</label>
                <select className="input-field" value={form.deliveryType}
                  onChange={e => setForm(f => ({ ...f, deliveryType: e.target.value as DeliveryType }))}>
                  {DELIVERY_TYPES.map(dt => (
                    <option key={dt.value} value={dt.value}>{dt.label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Pincodes (comma-separated or ranges like 600001-600050)
                </label>
                <textarea className="input-field resize-none" rows={3} placeholder="600001-600130, 600200, 600205"
                  value={form.pincodeRange} onChange={e => setForm(f => ({ ...f, pincodeRange: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Estimated Days</label>
                <input className="input-field" type="number" min={1} max={60} value={form.estimatedDays}
                  onChange={e => setForm(f => ({ ...f, estimatedDays: parseInt(e.target.value) || 7 }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Note (optional)</label>
                <input className="input-field" placeholder="e.g. Pickup from warehouse" value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={handleAdd} className="btn-primary inline-flex items-center gap-2">
                <Save className="w-4 h-4" /> Add Zone
              </button>
              <button onClick={() => setShowAddForm(false)} className="btn-outline inline-flex items-center gap-2">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Zones List */}
        <div className="space-y-4">
          {zones.map(zone => {
            const isEditing = editingId === zone.id;
            const typeInfo = DELIVERY_TYPES.find(dt => dt.value === zone.deliveryType)!;
            const [addPinInput, setAddPinInput] = ['' , () => {}]; // placeholder, handled below

            return (
              <div key={zone.id} className="card p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(zone.deliveryType)}
                    {isEditing ? (
                      <input className="input-field text-lg font-semibold" value={zone.name}
                        onChange={e => updateZone(zone.id, { name: e.target.value })} />
                    ) : (
                      <h3 className="font-semibold text-[#1a1a2e] text-lg">{zone.name}</h3>
                    )}
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={() => handleEditSave(zone.id)} className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setZones(getDeliveryZones()); setEditingId(null); }}
                          className="text-gray-400 hover:bg-gray-50 p-1.5 rounded-lg">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingId(zone.id)} className="text-gray-400 hover:text-[#1a1a2e] hover:bg-gray-50 p-1.5 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(zone.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span>{zone.pincodes.length} pincodes</span>
                  <span>•</span>
                  {isEditing ? (
                    <span className="flex items-center gap-2">
                      <label className="text-xs">Days:</label>
                      <input type="number" className="input-field w-20 py-1 text-sm" value={zone.estimatedDays}
                        onChange={e => updateZone(zone.id, { estimatedDays: parseInt(e.target.value) || 7 })} />
                    </span>
                  ) : (
                    <span>~{zone.estimatedDays} days delivery</span>
                  )}
                  {zone.note && (
                    <>
                      <span>•</span>
                      <span className="text-amber-600">{zone.note}</span>
                    </>
                  )}
                </div>

                {isEditing && (
                  <>
                    {/* Delivery type selector */}
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Delivery Type</label>
                      <select className="input-field w-48" value={zone.deliveryType}
                        onChange={e => updateZone(zone.id, { deliveryType: e.target.value as DeliveryType })}>
                        {DELIVERY_TYPES.map(dt => (
                          <option key={dt.value} value={dt.value}>{dt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Add pincodes */}
                    <AddPincodesInput onAdd={(input) => handleAddPincodes(zone.id, input)} />

                    {/* Pincode list */}
                    {zone.pincodes.length > 0 && (
                      <div className="mt-3 max-h-40 overflow-y-auto">
                        <div className="flex flex-wrap gap-1.5">
                          {zone.pincodes.slice(0, 100).map(p => (
                            <span key={p} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md">
                              {p}
                              <button onClick={() => handleRemovePincode(zone.id, p)} className="text-gray-400 hover:text-red-500">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                          {zone.pincodes.length > 100 && (
                            <span className="text-xs text-gray-400 py-1">+{zone.pincodes.length - 100} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {!isEditing && zone.pincodes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {zone.pincodes.slice(0, 10).map(p => (
                      <span key={p} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">{p}</span>
                    ))}
                    {zone.pincodes.length > 10 && (
                      <span className="text-xs text-gray-400 py-1">+{zone.pincodes.length - 10} more</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {zones.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">No delivery zones configured</p>
            <p className="text-sm mt-1">Add zones to enable delivery availability checking</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AddPincodesInput({ onAdd }: { onAdd: (input: string) => void }) {
  const [value, setValue] = useState('');

  return (
    <div className="flex gap-2">
      <input className="input-field flex-1 text-sm" placeholder="Add pincodes: 600001-600050, 600200"
        value={value} onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && value.trim()) {
            onAdd(value);
            setValue('');
          }
        }} />
      <button onClick={() => { if (value.trim()) { onAdd(value); setValue(''); } }}
        className="btn-primary px-4 text-sm shrink-0">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
