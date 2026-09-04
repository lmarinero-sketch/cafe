export type PlanType = 'esencial' | 'gestion' | 'fidelizacion';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
}

export type Channel = 'salon' | 'retiro' | 'delivery';

export interface CompositeItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice?: number;
}

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
  isComposite?: boolean; // Producto compuesto / combo
  compositeItems?: CompositeItem[]; // Lista de productos que integran el combo
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
  isComposite?: boolean;
  compositeItems?: CompositeItem[];
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

export type PaymentMethod = 'efectivo' | 'transferencia' | 'credito' | 'debito' | 'mercadopago' | 'giftcard';

export interface CashTransaction {
  id: string;
  registerId: string;
  orderId?: string;
  type: 'ingreso' | 'egreso';
  amount: number;
  paymentMethod: PaymentMethod | 'varios';
  description: string;
  timestamp: string;
  registeredBy?: string;
  role?: string;
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
  notes?: string;
  paymentMethod: PaymentMethod;
  customerId?: string;
  pointsEarned?: number;
  registerId?: string;
  tipAmount?: number;
  tipPercentage?: number;
  tipPaymentMethod?: PaymentMethod;
  tipRegisteredBy?: string;
  tipRegisteredAt?: string;
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


// ============================================================
// AUDIT & ACTIVITY LOGS
// ============================================================

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  module: string;
  action: 'login' | 'logout' | 'Clic' | 'Crear' | 'Actualizar' | 'Eliminar' | 'Visualizar';
  details: string;
}

export interface UserActivityStats {
  userId: string;
  userName: string;
  totalSessions: number;
  totalHours: string;
  lastActive: string;
  clicksLast24h: number;
  hoursLast24h: string;
}

export interface ModuleUsage {
  moduleName: string;
  hours: string;
  minutes: string;
  userCount: number;
}

// ============================================================
// TARJETAS DE REGALO / GIFT CARDS VIRTUALES
// ============================================================

export type GiftCardTheme = 'clasica' | 'dorada' | 'cumpleanos' | 'especial';
export type GiftCardStatus = 'activa' | 'canjeada_parcial' | 'agotada' | 'vencida' | 'cancelada';

export interface GiftCardUsage {
  id: string;
  date: string;
  orderId?: string;
  orderCode?: string;
  amountUsed: number;
  remainingBalance: number;
  location?: string;
  notes?: string;
}

export interface GiftCard {
  id: string;
  code: string; // e.g. "GIFT-7492-CAF"
  initialAmount: number;
  currentBalance: number;
  purchaserName: string;
  purchaserPhone?: string;
  purchaserEmail?: string;
  recipientName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  message?: string;
  theme: GiftCardTheme;
  status: GiftCardStatus;
  createdAt: string;
  expiresAt?: string;
  usageHistory: GiftCardUsage[];
}

// ============================================================
// FACTURAS DEL EQUIPO DE DESARROLLO (MIS FACTURAS)
// ============================================================

export type InvoiceStatus = 'paid' | 'pending' | 'overdue';
export type InvoiceCategory = 'abono_mensual' | 'desarrollo' | 'soporte' | 'infraestructura' | 'otro';

export interface DeveloperInvoice {
  id: string;
  invoiceNumber: string; // ej. "FAC-2026-001" o "B-0001-00000042"
  title: string; // ej. "Abono Mensual Plan Gestión - Marzo 2026"
  category: InvoiceCategory;
  amount: number;
  issueDate: string; // "YYYY-MM-DD"
  dueDate?: string; // "YYYY-MM-DD"
  status: InvoiceStatus;
  fileUrl?: string; // URL pública o base64 data URI del archivo PDF / Imagen
  fileName?: string;
  fileType?: 'pdf' | 'image';
  notes?: string;
  paidAt?: string;
  uploadedBy?: string;
  createdAt: string;
  updatedAt?: string;
}
