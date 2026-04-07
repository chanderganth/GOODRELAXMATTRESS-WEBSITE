'use client';

import { DragEvent, useMemo, useState } from 'react';
import type { MattressConfig, MattressLayer, DensityCategory, FabricType, HardnessLevel, LayerType } from '@/lib/types';
import {
  calculatePrice, DENSITY_INFO, HARDNESS_INFO, LAYER_INFO, FABRIC_INFO, STANDARD_SIZES, formatPrice, getLayerAddonPrice, getSizeAdjustedAddonPrice,
} from '@/lib/priceCalculator';
import { useCart } from '@/context/CartContext';
import { generatePDFQuotation } from '@/components/PDFQuotation';
import BarcodePreview from '@/components/BarcodeGenerator';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowRight, ArrowUp, ArrowDown, FileText, ShoppingCart, Info, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';

const DEFAULT_CONFIG: MattressConfig = {
  size: { length: 78, width: 60, thickness: 6 },
  density: '32D_Epic',
  layers: [{ type: 'foam', thickness: 4, label: 'High-Density Foam' }],
  fabric: 'cotton',
  hardness: 'medium',
};

const LAYER_ORDER_LABELS = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];

function getLayerOrderLabel(index: number): string {
  return `${LAYER_ORDER_LABELS[index] || `${index + 1}th`} Layer`;
}

export default function BuilderPage() {
  const [config, setConfig] = useState<MattressConfig>(DEFAULT_CONFIG);
  const [customSize, setCustomSize] = useState(false);
  const [step, setStep] = useState(1);
  const [showBarcode, setShowBarcode] = useState(false);
  const [draggedLayerIndex, setDraggedLayerIndex] = useState<number | null>(null);
  const { addCustom } = useCart();

  const priceBreakdown = useMemo(() => calculatePrice(config), [config]);

  const updateLayers = (updater: (layers: MattressLayer[]) => MattressLayer[]) => {
    setConfig(currentConfig => {
      const nextLayers = updater(currentConfig.layers);
      const nextThickness = nextLayers.reduce((sum, layer) => sum + layer.thickness, 0);

      return {
        ...currentConfig,
        layers: nextLayers,
        size: {
          ...currentConfig.size,
          thickness: nextThickness,
        },
      };
    });
  };

  // Size handling
  const handleSizePreset = (length: number, width: number) => {
    if (length === 0) { setCustomSize(true); return; }
    setCustomSize(false);
    setConfig(c => ({ ...c, size: { ...c.size, length, width } }));
  };

  // Layer handling
  const addLayer = (type: LayerType) => {
    if (config.layers.length >= 5) { toast.error('Maximum 5 layers allowed'); return; }
    const newLayer: MattressLayer = { type, thickness: 2, label: LAYER_INFO[type].label };
    updateLayers(layers => [...layers, newLayer]);
  };

  const removeLayer = (index: number) => {
    if (config.layers.length <= 1) { toast.error('At least one layer required'); return; }
    updateLayers(layers => layers.filter((_, layerIndex) => layerIndex !== index));
  };

  const updateLayerThickness = (index: number, thickness: number) => {
    const safeThickness = Number.isFinite(thickness) ? Math.min(8, Math.max(1, thickness)) : 1;
    updateLayers(layers => (
      layers.map((layer, layerIndex) => layerIndex === index ? { ...layer, thickness: safeThickness } : layer)
    ));
  };

  const moveLayer = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= config.layers.length || fromIndex === toIndex) return;

    updateLayers(layers => {
      const nextLayers = [...layers];
      const [movedLayer] = nextLayers.splice(fromIndex, 1);
      nextLayers.splice(toIndex, 0, movedLayer);
      return nextLayers;
    });
  };

  const handleLayerDragStart = (index: number) => {
    setDraggedLayerIndex(index);
  };

  const handleLayerDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleLayerDrop = (targetIndex: number) => {
    if (draggedLayerIndex === null) return;
    moveLayer(draggedLayerIndex, targetIndex);
    setDraggedLayerIndex(null);
  };

  const handleLayerDragEnd = () => {
    setDraggedLayerIndex(null);
  };

  const totalThickness = config.layers.reduce((s, l) => s + l.thickness, 0);

  const handleAddToCart = () => {
    addCustom(config, '');
    toast.success('Custom mattress added to cart!');
  };

  const handleDownloadPDF = () => {
    generatePDFQuotation(config, priceBreakdown);
    toast.success('PDF quotation downloaded!');
  };

  const steps = ['Size', 'Density', 'Layers', 'Fabric & Hardness', 'Summary'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a1a2e] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-4xl font-bold mb-2">Custom Mattress Builder</h1>
          <p className="text-gray-300">Configure every detail and get instant pricing</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-0 py-3 no-scrollbar">
            {steps.map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(i + 1)}
                className={`flex items-center shrink-0 gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg mr-1 ${
                  step === i + 1 ? 'bg-[#1a1a2e] text-white' : step > i + 1 ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step > i + 1 ? 'bg-green-100 text-green-600' : step === i + 1 ? 'bg-white text-[#1a1a2e]' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > i + 1 ? '✓' : i + 1}
                </span>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-3 gap-8">
        {/* Left — Configuration */}
        <div className="lg:col-span-2 space-y-6">

          {/* Step 1: Size */}
          <div className={`card p-6 ${step !== 1 && 'opacity-90'}`}>
            <button className="w-full flex items-center justify-between" onClick={() => setStep(1)}>
              <h2 className="font-semibold text-[#1a1a2e] text-lg flex items-center gap-2">
                <span className="w-7 h-7 bg-[#1a1a2e] text-white rounded-full flex items-center justify-center text-sm">1</span>
                Mattress Size
              </h2>
              {step === 1 ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {step === 1 && (
              <div className="mt-5 space-y-4">
                <p className="text-sm text-gray-500">Select a standard size or enter custom dimensions</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {STANDARD_SIZES.map(s => (
                    <button
                      key={s.label}
                      onClick={() => handleSizePreset(s.length, s.width)}
                      className={`text-left p-3 rounded-xl border-2 text-sm transition-all ${
                        !customSize && config.size.length === s.length && config.size.width === s.width
                          ? 'border-[#1a1a2e] bg-[#1a1a2e]/5'
                          : s.label === 'Custom' && customSize
                          ? 'border-[#1a1a2e] bg-[#1a1a2e]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-800">{s.label.split(' ')[0]}</div>
                      {s.length > 0 && <div className="text-gray-500 text-xs mt-0.5">{s.length}×{s.width} in</div>}
                    </button>
                  ))}
                </div>
                {customSize && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Length (inches)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={config.size.length}
                        min={30}
                        max={100}
                        onChange={e => setConfig(c => ({ ...c, size: { ...c.size, length: Number(e.target.value) } }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Width (inches)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={config.size.width}
                        min={24}
                        max={84}
                        onChange={e => setConfig(c => ({ ...c, size: { ...c.size, width: Number(e.target.value) } }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Thickness (inches)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={config.size.thickness}
                        readOnly
                      />
                      <p className="text-xs text-gray-400 mt-1">Auto-calculated from your layer stack.</p>
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <button onClick={() => setStep(2)} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Density */}
          <div className={`card p-6 ${step !== 2 && 'opacity-90'}`}>
            <button className="w-full flex items-center justify-between" onClick={() => setStep(2)}>
              <h2 className="font-semibold text-[#1a1a2e] text-lg flex items-center gap-2">
                <span className="w-7 h-7 bg-[#1a1a2e] text-white rounded-full flex items-center justify-center text-sm">2</span>
                Density Selection
              </h2>
              {step === 2 ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {step === 2 && (
              <div className="mt-5 space-y-3">
                {(Object.keys(DENSITY_INFO) as DensityCategory[]).map(key => {
                  const info = DENSITY_INFO[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setConfig(c => ({ ...c, density: key }))}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        config.density === key ? 'border-[#1a1a2e] bg-[#1a1a2e]/5' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${info.bgColor} ${info.color}`}>{info.badge}</span>
                          <span className="font-semibold text-gray-800">{info.label}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {priceBreakdown.densityAddition === 0 ? 'Base' : `+${formatPrice(priceBreakdown.densityAddition)}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
                <div className="flex justify-end mt-2">
                  <button onClick={() => setStep(3)} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Layers */}
          <div className={`card p-6 ${step !== 3 && 'opacity-90'}`}>
            <button className="w-full flex items-center justify-between" onClick={() => setStep(3)}>
              <h2 className="font-semibold text-[#1a1a2e] text-lg flex items-center gap-2">
                <span className="w-7 h-7 bg-[#1a1a2e] text-white rounded-full flex items-center justify-center text-sm">3</span>
                Layer Customization
              </h2>
              {step === 3 ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {step === 3 && (
              <div className="mt-5 space-y-4">
                {/* Layer Visualizer */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 mb-3">CROSS-SECTION VIEW</p>
                  <div className="w-full rounded-xl overflow-hidden border border-gray-200">
                    {[...config.layers].reverse().map((layer, i) => {
                      const info = LAYER_INFO[layer.type];
                      const heightPct = Math.max((layer.thickness / totalThickness) * 100, 8);
                      const layerIndexFromTop = config.layers.length - 1 - i;
                      return (
                        <div
                          key={i}
                          className="flex items-center px-4 border-b border-white/50 last:border-0"
                          style={{ height: `${Math.round(heightPct * 0.8 + 28)}px`, backgroundColor: info.color }}
                        >
                          <span className="text-xs font-medium text-gray-700">{getLayerOrderLabel(layerIndexFromTop)}: {info.label} ({layer.thickness}&quot;)</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Top layer is shown first in the list below.</p>
                  <p className="text-xs text-gray-400 mt-2 text-right">Total: {totalThickness}&quot; selected</p>
                </div>

                {/* Current Layers */}
                <div className="space-y-2">
                  {config.layers.map((layer, i) => {
                    const info = LAYER_INFO[layer.type];
                    const layerPrice = info.price > 0 ? getLayerAddonPrice(info.price, config.size, layer.thickness) : 0;
                    return (
                      <div
                        key={`${layer.type}-${i}`}
                        draggable
                        onDragStart={() => handleLayerDragStart(i)}
                        onDragOver={handleLayerDragOver}
                        onDrop={() => handleLayerDrop(i)}
                        onDragEnd={handleLayerDragEnd}
                        className={`flex items-center gap-3 p-3 bg-white border rounded-xl transition-shadow ${draggedLayerIndex === i ? 'border-[#1a1a2e] shadow-sm' : 'border-gray-200'}`}
                      >
                        <button
                          type="button"
                          aria-label={`Drag ${info.label}`}
                          className="p-1 text-gray-400 cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <div className="w-3 h-8 rounded shrink-0" style={{ backgroundColor: info.color, border: '1px solid #e2e8f0' }} />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-800">{info.label}</div>
                          <div className="text-xs text-gray-500">
                            {getLayerOrderLabel(i)} • {info.price > 0 ? `${layer.thickness}&quot; • +${formatPrice(layerPrice)}` : `${layer.thickness}&quot; • Included`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => moveLayer(i, i - 1)}
                              disabled={i === 0}
                              className="p-1 text-gray-400 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                              aria-label={`Move ${info.label} up`}
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveLayer(i, i + 1)}
                              disabled={i === config.layers.length - 1}
                              className="p-1 text-gray-400 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                              aria-label={`Move ${info.label} down`}
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                          <input
                            type="number"
                            className="w-16 text-center input-field py-1.5 text-sm"
                            value={layer.thickness}
                            min={1}
                            max={8}
                            onChange={e => updateLayerThickness(i, Number(e.target.value))}
                          />
                          <span className="text-xs text-gray-400">in</span>
                          <button
                            type="button"
                            onClick={() => removeLayer(i)}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Layer */}
                {config.layers.length < 5 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1.5">
                      <Plus className="w-4 h-4" /> Add a Layer
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.keys(LAYER_INFO) as LayerType[]).map(type => {
                        const info = LAYER_INFO[type];
                        return (
                          <button
                            key={type}
                            onClick={() => addLayer(type)}
                            className="p-3 text-left rounded-xl border border-gray-200 hover:border-[#1a1a2e] hover:bg-[#1a1a2e]/5 transition-all"
                          >
                            <div className="w-6 h-3 rounded mb-1.5" style={{ backgroundColor: info.color, border: '1px solid #e2e8f0' }} />
                            <div className="text-xs font-medium text-gray-700">{info.label}</div>
                            <div className="text-xs text-gray-400">
                              {info.price > 0 ? `From ${formatPrice(getLayerAddonPrice(info.price, config.size, 2))}` : 'Free'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button onClick={() => setStep(4)} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Step 4: Fabric & Hardness */}
          <div className={`card p-6 ${step !== 4 && 'opacity-90'}`}>
            <button className="w-full flex items-center justify-between" onClick={() => setStep(4)}>
              <h2 className="font-semibold text-[#1a1a2e] text-lg flex items-center gap-2">
                <span className="w-7 h-7 bg-[#1a1a2e] text-white rounded-full flex items-center justify-center text-sm">4</span>
                Fabric & Hardness
              </h2>
              {step === 4 ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {step === 4 && (
              <div className="mt-5 space-y-6">
                {/* Fabric */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Fabric Selection</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(FABRIC_INFO) as FabricType[]).map(key => {
                      const info = FABRIC_INFO[key];
                      return (
                        <button
                          key={key}
                          onClick={() => setConfig(c => ({ ...c, fabric: key }))}
                          className={`p-4 text-left rounded-xl border-2 transition-all ${
                            config.fabric === key ? 'border-[#1a1a2e] bg-[#1a1a2e]/5' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-sm text-gray-800">{info.label}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{info.description}</div>
                          <div className="text-xs font-medium text-[#e8b85d] mt-1">
                            {info.price === 0 ? 'Included' : `+${formatPrice(getSizeAdjustedAddonPrice(info.price, config.size))}`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hardness */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Hardness Level</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(HARDNESS_INFO) as HardnessLevel[]).map(key => {
                      const info = HARDNESS_INFO[key];
                      return (
                        <button
                          key={key}
                          onClick={() => setConfig(c => ({ ...c, hardness: key }))}
                          className={`p-4 text-center rounded-xl border-2 transition-all ${
                            config.hardness === key ? 'border-[#1a1a2e] bg-[#1a1a2e]/5' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-1">{info.icon}</div>
                          <div className="font-medium text-sm text-gray-800">{info.label}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{info.description}</div>
                          <div className="text-xs font-medium text-[#e8b85d] mt-1">+{info.pct}%</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={() => setStep(5)} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
                    Review Summary <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Step 5: Summary */}
          {step === 5 && (
            <div className="card p-6">
              <h2 className="font-semibold text-[#1a1a2e] text-lg flex items-center gap-2 mb-5">
                <span className="w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                Your Configuration
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 uppercase mb-3">Specs</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Size</span><span className="font-medium">{config.size.length}×{config.size.width}×{config.size.thickness}&quot;</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Density</span><span className="font-medium">{DENSITY_INFO[config.density].label}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Fabric</span><span className="font-medium">{FABRIC_INFO[config.fabric].label}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Hardness</span><span className="font-medium">{HARDNESS_INFO[config.hardness].label}</span></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 uppercase mb-3">Layers ({config.layers.length})</p>
                  <div className="space-y-1.5">
                    {config.layers.map((l, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded shrink-0" style={{ backgroundColor: LAYER_INFO[l.type].color, border: '1px solid #e2e8f0' }} />
                        <span className="text-gray-700">{getLayerOrderLabel(i)}: {LAYER_INFO[l.type].label} ({l.thickness}&quot;)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Barcode Preview */}
              {showBarcode && (
                <div className="mb-6">
                  <BarcodePreview
                    text={`GRM-CUSTOM-${Date.now()}`}
                    label="Custom Order Reference"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button onClick={handleAddToCart} className="btn-primary flex items-center gap-2 flex-1 justify-center">
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
                <button onClick={handleDownloadPDF} className="btn-outline flex items-center gap-2 flex-1 justify-center">
                  <FileText className="w-4 h-4" /> Download Quote
                </button>
                <button
                  onClick={() => setShowBarcode(!showBarcode)}
                  className="border border-gray-200 text-gray-600 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Info className="w-4 h-4" /> Barcode
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right — Price Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-32">
            <h3 className="font-semibold text-[#1a1a2e] text-lg mb-5">Price Summary</h3>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Base Price</span>
                <span>{formatPrice(priceBreakdown.basePrice)}</span>
              </div>
              {priceBreakdown.densityAddition > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Density ({DENSITY_INFO[config.density].label})</span>
                  <span>+{formatPrice(priceBreakdown.densityAddition)}</span>
                </div>
              )}
              {priceBreakdown.layerPrice > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Premium Layers</span>
                  <span>+{formatPrice(priceBreakdown.layerPrice)}</span>
                </div>
              )}
              {priceBreakdown.fabricPrice > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Fabric Upgrade</span>
                  <span>+{formatPrice(priceBreakdown.fabricPrice)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Hardness ({HARDNESS_INFO[config.hardness].label} +{HARDNESS_INFO[config.hardness].pct}%)</span>
                <span>+{formatPrice(priceBreakdown.hardnessAddition)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-medium text-gray-700">
                <span>Subtotal</span>
                <span>{formatPrice(priceBreakdown.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>GST (18%)</span>
                <span>+{formatPrice(priceBreakdown.gstAmount)}</span>
              </div>
            </div>
            <div className="bg-[#1a1a2e] text-white rounded-xl p-4 flex justify-between items-center">
              <span className="font-semibold">Total Price</span>
              <span className="text-2xl font-bold text-[#e8b85d]">{formatPrice(priceBreakdown.totalPrice)}</span>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">GST included • Free delivery</p>

            {/* Quick Actions */}
            <div className="mt-5 space-y-2">
              <button onClick={handleAddToCart} className="w-full btn-primary flex items-center justify-center gap-2 text-sm py-3">
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
              <button onClick={handleDownloadPDF} className="w-full btn-outline flex items-center justify-center gap-2 text-sm py-3">
                <FileText className="w-4 h-4" /> Get PDF Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
