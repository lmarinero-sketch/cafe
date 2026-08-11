export type PlanType = 'esencial' | 'gestion' | 'fidelizacion';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
}

export type Channel = 'salon' | 'retiro' | 'delivery';

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
  channels: Channel[];
  cost?: number; // Costo total calculado si aplica
  suggestedPrice?: number;
  recipeItems?: RecipeIngredient[];
}

export interface Sector {
  id: string;
  name: string;
  label: string;
}
export type TableStatus = 'disponible' | 'ocupada' | 'reservada';

export interface Table {
  id: string;
  number: string; // e.g. "Mesa 01"
  capacity: number;
  sector: string;
  status: TableStatus;
  qrCode: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
}

export type OrderType = 'salon' | 'retiro' | 'delivery';
export type OrderStatus = 
  | 'nuevo' 
  | 'confirmado' 
  | 'en_preparacion' 
  | 'listo' 
  | 'en_camino' 
  | 'entregado' 
  | 'cancelado';

export type PaymentMethod = 'efectivo' | 'transferencia' | 'credito' | 'debito' | 'mercadopago';

export interface CashTransaction {
  id: string;
  registerId: string;
  orderId?: string;
  type: 'ingreso' | 'egreso';
  amount: number;
  paymentMethod: PaymentMethod | 'varios';
  description: string;
  timestamp: string;
}

export interface CashRegister {
  id: string;
  openedAt: string;
  closedAt?: string;
  openedBy: string;
  closedBy?: string;
  initialBalance: number;
  finalBalance?: number;
  expectedBalance?: number;
  difference?: number;
  cashPhysicalCount?: number;
  notes?: string;
  status: 'abierta' | 'cerrada';
}

export interface Order {
  id: string;
  code: string;
  createdAt: string;
  tableId?: string;
  tableName?: string;
  waiterId?: string;
  waiterName?: string;
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerName: string;
  customerPhone: string;
  address?: string;
  addressRef?: string;
  paymentMethod: PaymentMethod;
  customerId?: string;
  pointsEarned?: number;
}

export type IngredientUnit = 
  | 'kilogramo' 
  | 'gramo' 
  | 'litro' 
  | 'mililitro' 
  | 'unidad' 
  | 'docena' 
  | 'porcion';

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  purchaseUnit: IngredientUnit;
  usageUnit: IngredientUnit;
  purchaseQty: number; // e.g. 1
  purchasePrice: number; // e.g. 24000
  supplier: string;
  wastePercentage: number; // e.g. 5 (%)
  updatedAt: string;
  normalizedCost: number; // Costo por unidad de uso normalizado
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  usageQty: number;
  usageUnit: IngredientUnit;
  wastePercentage: number;
  itemCost: number;
}

export interface RecipeCost {
  productId: string;
  productName: string;
  recipeItems: RecipeIngredient[];
  packagingCost: number;
  otherDirectCosts: number;
  targetMargin: number; // e.g. 0.60 for 60%
  totalCost: number;
  suggestedPrice: number;
  currentPrice: number;
  grossMargin: number; // %
  grossProfit: number;
  priceDiff: number;
}

export interface ProductRotation {
  productId: string;
  productName: string;
  categoryName: string;
  unitsSold: number;
  salesShare: number; // %
  daysWithoutSales: number;
  salesFrequency: string; // e.g. "Diaria", "Semanal"
  revenue: number;
  margin: number; // %
  rotationLevel: 'alta' | 'media' | 'baja';
}

export interface Insight {
  id: string;
  type: 'alert' | 'opportunity' | 'performance';
  title: string;
  description: string;
  date: string;
  metric?: string;
  actionText?: string;
}

export type CustomerLevel = 'Inicial' | 'Frecuente' | 'Preferencial' | 'VIP';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string;
  registrationDate: string;
  purchaseCount: number;
  totalSpent: number;
  averageTicket: number;
  lastPurchaseDate: string;
  points: number;
  level: CustomerLevel;
  usedPromotionsCount: number;
  marketingConsent: boolean;
  favoriteProduct?: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  isAvailable: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  templateName: string;
  scheduledAt: string;
  status: 'programado' | 'enviado' | 'entregado' | 'leido';
  recipientsCount: number;
  segment: string;
  message: string;
  conversionRate?: number;
}

export interface Automation {
  id: string;
  name: string;
  condition: string;
  segment: string;
  message: string;
  status: 'activa' | 'pausada';
  nextRun: string;
  estimatedRecipients: number;
  executedCount: number;
}

export interface ManualFaq {
  question: string;
  answer: string;
}

export interface Manual {
  id: string;
  category: string;
  title: string;
  description: string;
  steps: string[];
  faqs: ManualFaq[];
}

export interface SupportTicket {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  reason: string;
  description: string;
  priority: 'baja' | 'media' | 'alta';
  status: 'abierto' | 'en_proceso' | 'resuelto';
}

export interface LoyaltyConfig {
  pointsPerPeso: number; // e.g. 0.05 points per peso spent
  birthdayBonusPoints: number;
  referralPoints: number;
  expirationDays: number;
}

export interface Redemption {
  id: string;
  customerId: string;
  rewardId: string;
  pointsSpent: number;
  redeemedAt: string;
}

// ============================================================
// BRANCH (Sucursales configurables)
// ============================================================
export interface Branch {
  id: string;
  name: string;
  address: string;
  zone: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  hours: string;
  badge: string;
  features: string[];
  mapQuery: string;
  mapUrl?: string; // Para el iframe de Google Maps
  isActive: boolean;
  createdAt?: string;
}

// ============================================================
// SITE CONTENT (Mini-CMS para el sitio web)
// ============================================================
export type SiteSection = 'hero' | 'about' | 'offers' | 'recommended' | 'promos' | 'product_star' | 'club' | 'testimonials' | 'footer' | 'social';
export type SiteContentType = 'text' | 'image_url' | 'json';

export interface SiteContent {
  id: string;
  section: SiteSection;
  key: string;
  value: string;
  type: SiteContentType;
  label: string;
  sortOrder: number;
}

export interface StaffUser {
  id: string;
  name: string;
  role: 'admin' | 'cajero' | 'mozo' | 'cocina';
  email: string;
  password?: string;
  status: 'active' | 'inactive';
}
