// ==================== PRODUCT TYPES ====================
export type DensityCategory = '28D_Rare' | '32D_Epic' | '40D_Legendary';

export type LayerType = 'foam' | 'memoryFoam' | 'latex' | 'coir' | 'spring';

export type FabricType = 'cotton' | 'velvet' | 'bamboo' | 'knitted';

export type HardnessLevel = 'soft' | 'medium' | 'firm';

export interface ProductColor {
  name: string;    // e.g. "Maroon", "Navy Blue"
  hex: string;     // e.g. "#800000"
  image?: string;  // optional image showing mattress in that color
}

export interface QuiltPattern {
  name: string;    // e.g. "Diamond", "Wave", "Classic"
  image: string;   // image of the quilt pattern
}

export interface Product {
  id: string;
  name: string;
  category: DensityCategory;
  description: string;
  basePrice: number;
  densityAddition: number;
  features: string[];
  images: string[];
  colors: ProductColor[];
  quiltPatterns: QuiltPattern[];
  thickness: number;
  isActive: boolean;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== MATTRESS BUILDER TYPES ====================
export interface MattressSize {
  length: number; // inches
  width: number;  // inches
  thickness: number; // inches
}

export interface MattressLayer {
  type: LayerType;
  thickness: number; // inches
  label: string;
}

export interface MattressConfig {
  size: MattressSize;
  density: DensityCategory;
  layers: MattressLayer[];
  fabric: FabricType;
  hardness: HardnessLevel;
  customNote?: string;
}

export interface PriceBreakdown {
  sqft: number;
  basePrice: number;
  densityAddition: number;
  layerPrice: number;
  fabricPrice: number;
  hardnessAddition: number;
  subtotal: number;
  gstAmount: number;
  totalPrice: number;
}

// ==================== PRICING CONFIG ====================
export interface PricingConfig {
  basePricePerSqft: number;
  densityAdditions: Record<DensityCategory, number>;
  hardnessLevels: Record<HardnessLevel, number>;
  layerPrices: Record<LayerType, number>;
  fabricPrices: Record<FabricType, number>;
  gstRate: number;
}

// ==================== ORDER TYPES ====================
export type OrderStatus = 'pending' | 'confirmed' | 'in_production' | 'quality_check' | 'dispatched' | 'delivered' | 'cancelled';

export type ProductionStatus = 'not_started' | 'foam_cutting' | 'layer_assembly' | 'fabric_wrapping' | 'finishing' | 'qc_passed' | 'packed';

export interface Customer {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  pincode?: string;
}

export interface OrderTimeline {
  status: string;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  mattress: MattressConfig;
  priceBreakdown: PriceBreakdown;
  totalPrice: number;
  status: OrderStatus;
  productionStatus: ProductionStatus;
  timeline: OrderTimeline[];
  barcode?: string;
  notes?: string;
  expectedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== CART TYPES ====================
export interface CartItem {
  id: string;
  type: 'standard' | 'custom';
  product?: Product;
  mattressConfig?: MattressConfig;
  priceBreakdown: PriceBreakdown;
  quantity: number;
  customNote?: string;
}

// ==================== STOCK TYPES ====================
export interface StockItem {
  quantity: number;
  unit: string;
  threshold: number;
}

export type StockInventory = Record<string, StockItem>;

// ==================== CUSTOMER STORE TYPES ====================
export interface CustomerRecord extends Customer {
  totalOrders: number;
  totalSpent: number;
  orders?: Order[];
  createdAt: string;
  updatedAt: string;
}

// ==================== ADMIN STATS ====================
export interface DashboardStats {
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  statusCounts: Record<string, number>;
  recentOrders: Order[];
}

// ==================== RECOMMENDATION ====================
export interface MattressRecommendation {
  density: DensityCategory;
  hardness: HardnessLevel;
  layers: LayerType[];
  reason: string;
  priceRange: { min: number; max: number };
}
