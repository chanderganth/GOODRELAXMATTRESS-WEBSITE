import type {
  MattressConfig, MattressSize, PriceBreakdown, PricingConfig,
  DensityCategory, HardnessLevel, LayerType, FabricType,
  MattressRecommendation,
} from './types';

const BASE_REFERENCE_SQFT = (78 / 12) * (60 / 12); // Queen baseline (32.5 sqft)
const BASE_REFERENCE_THICKNESS = 6;
const BASE_LAYER_REFERENCE_THICKNESS = 2;
const PRICING_STORAGE_KEY = 'goodrelax_pricing_config';

// ==================== DEFAULT PRICING CONFIG ====================
export const DEFAULT_PRICING: PricingConfig = {
  basePricePerSqft: 800,
  densityAdditions: { '28D_Rare': 0, '32D_Epic': 500, '40D_Legendary': 700 },
  hardnessLevels: { soft: 5, medium: 10, firm: 15 },
  layerPrices: { foam: 0, memoryFoam: 1500, latex: 2000, coir: 800, spring: 2500 },
  fabricPrices: { cotton: 0, velvet: 1200, bamboo: 1800, knitted: 600 },
  gstRate: 18,
};

function mergePricingConfig(partialConfig: Partial<PricingConfig>): PricingConfig {
  return {
    ...DEFAULT_PRICING,
    ...partialConfig,
    densityAdditions: {
      ...DEFAULT_PRICING.densityAdditions,
      ...(partialConfig.densityAdditions || {}),
    },
    hardnessLevels: {
      ...DEFAULT_PRICING.hardnessLevels,
      ...(partialConfig.hardnessLevels || {}),
    },
    layerPrices: {
      ...DEFAULT_PRICING.layerPrices,
      ...(partialConfig.layerPrices || {}),
    },
    fabricPrices: {
      ...DEFAULT_PRICING.fabricPrices,
      ...(partialConfig.fabricPrices || {}),
    },
  };
}

export function getActivePricingConfig(): PricingConfig {
  if (typeof window === 'undefined') return DEFAULT_PRICING;

  try {
    const stored = window.localStorage.getItem(PRICING_STORAGE_KEY);
    if (!stored) return DEFAULT_PRICING;
    const parsed = JSON.parse(stored) as Partial<PricingConfig>;
    return mergePricingConfig(parsed);
  } catch (_) {
    return DEFAULT_PRICING;
  }
}

export function saveActivePricingConfig(config: PricingConfig): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(config));
}

// ==================== PRICE CALCULATOR ====================
export function calculatePrice(config: MattressConfig, pricing: PricingConfig = DEFAULT_PRICING): PriceBreakdown {
  const effectivePricing = pricing === DEFAULT_PRICING ? getActivePricingConfig() : pricing;
  const { size, density, layers, fabric, hardness } = config;

  // Convert inches to feet for sqft calculation
  const sqft = (size.length / 12) * (size.width / 12);
  const sizeFactor = sqft / BASE_REFERENCE_SQFT;
  const totalLayerThickness = layers.reduce((sum, layer) => sum + layer.thickness, 0);
  const effectiveThickness = totalLayerThickness || size.thickness || BASE_REFERENCE_THICKNESS;
  const thicknessFactor = effectiveThickness / BASE_REFERENCE_THICKNESS;

  // Base price scales with mattress footprint and overall thickness.
  const basePrice = sqft * effectivePricing.basePricePerSqft * thicknessFactor;

  // Density addition scales with the amount of dense material used.
  const densityAddition = sqft * (effectivePricing.densityAdditions[density] || 0) * thicknessFactor;

  // Premium layer prices scale with mattress size and each layer's thickness.
  const layerPrice = layers.reduce((sum, layer) => {
    const layerThicknessFactor = layer.thickness / BASE_LAYER_REFERENCE_THICKNESS;
    return sum + ((effectivePricing.layerPrices[layer.type] || 0) * sizeFactor * layerThicknessFactor);
  }, 0);

  // Fabric price scales with mattress size
  const fabricPrice = (effectivePricing.fabricPrices[fabric] || 0) * sizeFactor;

  // Subtotal before hardness
  const preHardness = basePrice + densityAddition + layerPrice + fabricPrice;

  // Hardness addition (% of preHardness)
  const hardnessPct = effectivePricing.hardnessLevels[hardness] || 0;
  const hardnessAddition = (preHardness * hardnessPct) / 100;

  const subtotal = preHardness + hardnessAddition;

  // GST
  const gstAmount = (subtotal * effectivePricing.gstRate) / 100;

  const totalPrice = subtotal + gstAmount;

  return {
    sqft: parseFloat(sqft.toFixed(2)),
    basePrice: Math.round(basePrice),
    densityAddition: Math.round(densityAddition),
    layerPrice: Math.round(layerPrice),
    fabricPrice: Math.round(fabricPrice),
    hardnessAddition: Math.round(hardnessAddition),
    subtotal: Math.round(subtotal),
    gstAmount: Math.round(gstAmount),
    totalPrice: Math.round(totalPrice),
  };
}

// ==================== DENSITY LABELS ====================
export const DENSITY_INFO: Record<DensityCategory, { label: string; badge: string; color: string; bgColor: string; addPerSqft: number }> = {
  '28D_Rare': {
    label: 'Rare',
    badge: 'RARE',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    addPerSqft: 0,
  },
  '32D_Epic': {
    label: 'Epic',
    badge: 'EPIC',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    addPerSqft: 500,
  },
  '40D_Legendary': {
    label: 'Legendary',
    badge: 'LEGENDARY',
    color: 'text-gold-600',
    bgColor: 'bg-amber-50',
    addPerSqft: 700,
  },
};

export const HARDNESS_INFO: Record<HardnessLevel, { label: string; description: string; icon: string; pct: number }> = {
  soft: { label: 'Soft', description: 'Plush & pressure-relieving', icon: '🌙', pct: 5 },
  medium: { label: 'Medium', description: 'Balanced comfort & support', icon: '⚖️', pct: 10 },
  firm: { label: 'Firm', description: 'Orthopedic back support', icon: '💪', pct: 15 },
};

export const LAYER_INFO: Record<LayerType, { label: string; description: string; price: number; color: string }> = {
  foam: { label: 'High-Density Foam', description: 'Base support layer', price: 0, color: '#e2e8f0' },
  memoryFoam: { label: 'Memory Foam', description: 'Body-contouring comfort', price: 1500, color: '#fde68a' },
  latex: { label: 'Natural Latex', description: 'Responsive & breathable', price: 2000, color: '#d1fae5' },
  coir: { label: 'Coir (Natural)', description: 'Firm natural support', price: 800, color: '#fed7aa' },
  spring: { label: 'Pocket Spring', description: 'Individual spring support', price: 2500, color: '#ddd6fe' },
};

export const FABRIC_INFO: Record<FabricType, { label: string; description: string; price: number }> = {
  cotton: { label: 'Cotton Fabric', description: 'Breathable & affordable', price: 0 },
  velvet: { label: 'Premium Velvet', description: 'Luxurious soft touch', price: 1200 },
  bamboo: { label: 'Bamboo Fabric', description: 'Hypoallergenic & cooling', price: 1800 },
  knitted: { label: 'Knitted Stretch', description: 'Flexible & durable', price: 600 },
};

// ==================== STANDARD SIZES ====================
export const STANDARD_SIZES = [
  { label: 'Single (72×36 in)', length: 72, width: 36 },
  { label: 'Double (72×48 in)', length: 72, width: 48 },
  { label: 'Queen (78×60 in)', length: 78, width: 60 },
  { label: 'King (78×72 in)', length: 78, width: 72 },
  { label: 'Diwan (72×42 in)', length: 72, width: 42 },
  { label: 'Custom', length: 0, width: 0 },
];

// ==================== RECOMMENDATIONS ====================
export function getMattressRecommendation(
  sleepPosition: string,
  bodyWeight: string,
  preference: string,
): MattressRecommendation {
  if (sleepPosition === 'side' || preference === 'soft') {
    return {
      density: '32D_Epic',
      hardness: 'soft',
      layers: ['memoryFoam', 'foam'],
      reason: 'Memory foam provides pressure relief for side sleepers, contouring to hips and shoulders.',
      priceRange: { min: 18000, max: 28000 },
    };
  }
  if (sleepPosition === 'back' && bodyWeight === 'heavy') {
    return {
      density: '40D_Legendary',
      hardness: 'firm',
      layers: ['foam', 'coir', 'spring'],
      reason: 'Firm coir and spring layers provide maximum lumbar support for back sleepers.',
      priceRange: { min: 30000, max: 50000 },
    };
  }
  if (preference === 'luxury' || sleepPosition === 'combination') {
    return {
      density: '40D_Legendary',
      hardness: 'medium',
      layers: ['latex', 'memoryFoam', 'foam'],
      reason: 'Latex on top + memory foam provides luxury feel with perfect motion isolation.',
      priceRange: { min: 35000, max: 60000 },
    };
  }
  // Default medium recommendation
  return {
    density: '32D_Epic',
    hardness: 'medium',
    layers: ['memoryFoam', 'foam'],
    reason: 'Balanced medium firmness suits most sleepers with excellent comfort and durability.',
    priceRange: { min: 20000, max: 35000 },
  };
}

// ==================== FORMAT HELPERS ====================
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getExpectedDelivery(days = 7): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getSizeAdjustedAddonPrice(basePrice: number, size: MattressSize): number {
  const sqft = (size.length / 12) * (size.width / 12);
  const sizeFactor = sqft / BASE_REFERENCE_SQFT;
  return Math.round(basePrice * sizeFactor);
}

export function getLayerAddonPrice(basePrice: number, size: MattressSize, thickness: number): number {
  const sizeAdjustedPrice = getSizeAdjustedAddonPrice(basePrice, size);
  return Math.round(sizeAdjustedPrice * (thickness / BASE_LAYER_REFERENCE_THICKNESS));
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string; step: number }> = {
  pending: { label: 'Order Placed', color: 'bg-yellow-100 text-yellow-800', step: 1 },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', step: 2 },
  in_production: { label: 'In Production', color: 'bg-purple-100 text-purple-800', step: 3 },
  quality_check: { label: 'Quality Check', color: 'bg-indigo-100 text-indigo-800', step: 4 },
  dispatched: { label: 'Dispatched', color: 'bg-orange-100 text-orange-800', step: 5 },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', step: 6 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', step: 0 },
};

export const PRODUCTION_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-700' },
  foam_cutting: { label: 'Foam Cutting', color: 'bg-blue-100 text-blue-700' },
  layer_assembly: { label: 'Layer Assembly', color: 'bg-yellow-100 text-yellow-700' },
  fabric_wrapping: { label: 'Fabric Wrapping', color: 'bg-pink-100 text-pink-700' },
  finishing: { label: 'Finishing', color: 'bg-purple-100 text-purple-700' },
  qc_passed: { label: 'QC Passed', color: 'bg-green-100 text-green-700' },
  packed: { label: 'Packed', color: 'bg-teal-100 text-teal-700' },
};
