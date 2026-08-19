import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  PlanType,
  Product,
  Category,
  Table,
  Order,
  Ingredient,
  Customer,
  Reward,
  Campaign,
  Automation,
  Insight,
  Manual,
  SupportTicket,
  OrderStatus,
  RecipeCost,
  Branch,
  StaffUser,
  Sector,
} from '../types';
import { initialCategories } from '../data/seeds/categories.seed';
import { initialManuals } from '../data/manuals/systemManuals';
import { initialProducts } from '../data/seeds/products.seed';
import { initialTables } from '../data/seeds/tables.seed';
import { initialOrders } from '../data/seeds/orders.seed';
import { initialIngredients } from '../data/seeds/ingredients.seed';
import { initialCustomers } from '../data/seeds/customers.seed';
import { initialCampaigns } from '../data/seeds/campaigns.seed';
import { initialAutomations } from '../data/seeds/automations.seed';
import { calculateNormalizedCost, calculateRecipeCostDetails } from '../utils/costEngine';
import { formatCurrency } from '../utils/currency';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

// Supabase Services
import * as customersService from '../services/customers.service';
import * as rewardsService from '../services/rewards.service';
import * as campaignsService from '../services/campaigns.service';
import * as automationsService from '../services/automations.service';
import * as redemptionsService from '../services/redemptions.service';
import * as branchesService from '../services/branches.service';
import * as staffService from '../services/staff.service';
import * as productsService from '../services/products.service';
import * as tablesService from '../services/tables.service';
import * as ordersService from '../services/orders.service';
import * as ingredientsService from '../services/ingredients.service';

interface LockModalState {
  isOpen: boolean;
  requiredPlan: PlanType;
  featureName: string;
}

interface AppContextType {
  plan: PlanType;
  setPlan: (plan: PlanType) => void;
  categories: Category[];
  products: Product[];
  tables: Table[];
  orders: Order[];
  ingredients: Ingredient[];
  customers: Customer[];
  rewards: Reward[];
  campaigns: Campaign[];
  automations: Automation[];
  insights: Insight[];
  manuals: Manual[];
  tickets: SupportTicket[];
  branches: Branch[];
  staffUsers: StaffUser[];
  tableSectors: Sector[];
  cashRegisters: import('../types').CashRegister[];
  cashTransactions: import('../types').CashTransaction[];
  autoPriceUpdate: boolean;
  setAutoPriceUpdate: (val: boolean) => void;
  affectedProductsAlert: string[];
  lockModal: LockModalState;
  closeLockModal: () => void;
  checkPlanAccess: (requiredPlan: PlanType, featureName: string) => boolean;
  isTutorialOpen: boolean;
  openTutorialModal: () => void;
  closeTutorialModal: () => void;

  // Loading states
  isLoadingCustomers: boolean;
  isLoadingRewards: boolean;
  isLoadingCampaigns: boolean;
  isLoadingAutomations: boolean;
  isLoadingBranches: boolean;

  // Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  toggleProductStatus: (id: string) => void;
  
  addTable: (table: Omit<Table, 'id' | 'qrCode'>) => boolean;
  updateTable: (id: string, table: Partial<Table>) => boolean;
  updateTableStatus: (id: string, status: Table['status']) => void;
  deleteTable: (id: string) => boolean;

  createOrder: (order: Omit<Order, 'id' | 'code' | 'createdAt' | 'status'>) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'updatedAt' | 'normalizedCost'>) => void;
  updateIngredientPrice: (id: string, newPurchasePrice: number) => void;
  updateIngredient: (id: string, ingredientData: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;

  // Customer CRUD (Supabase)
  addCustomer: (customer: Omit<Customer, 'id' | 'registrationDate' | 'points' | 'level' | 'purchaseCount' | 'totalSpent' | 'averageTicket' | 'lastPurchaseDate' | 'usedPromotionsCount'>) => Promise<Customer | null>;
  updateCustomerData: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addCustomerPoints: (customerId: string, pointsAmount: number) => void;
  redeemReward: (customerId: string, rewardId: string) => Promise<boolean>;

  // Reward CRUD (Supabase)
  addReward: (reward: Omit<Reward, 'id'>) => Promise<void>;
  updateRewardData: (id: string, data: Partial<Reward>) => Promise<void>;
  deleteRewardData: (id: string) => Promise<void>;

  // Campaign CRUD (Supabase)
  createCampaign: (campaign: Omit<Campaign, 'id' | 'status' | 'conversionRate'>) => Promise<void>;
  updateCampaignData: (id: string, data: Partial<Campaign>) => Promise<void>;
  deleteCampaignData: (id: string) => Promise<void>;
  simulateCampaignSend: (campaignId: string) => void;

  // Automation CRUD (Supabase)
  addAutomation: (automation: Omit<Automation, 'id'>) => Promise<void>;
  updateAutomationData: (id: string, data: Partial<Automation>) => Promise<void>;
  deleteAutomationData: (id: string) => Promise<void>;
  toggleAutomation: (automationId: string) => void;

  // Branch CRUD (Supabase)
  addBranch: (branch: Omit<Branch, 'id' | 'createdAt'>) => Promise<void>;
  updateBranchData: (id: string, data: Partial<Branch>) => Promise<void>;
  deleteBranchData: (id: string) => Promise<void>;

  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => string;

  // Caja (Cash Register)
  openRegister: (openedBy: string, initialBalance: number) => void;
  closeRegister: (
    registerId: string,
    finalBalance: number,
    closedBy?: string,
    expectedBalance?: number,
    difference?: number,
    notes?: string
  ) => void;
  addTransaction: (transaction: Omit<import('../types').CashTransaction, 'id' | 'timestamp'>) => void;

  addStaffUser: (user: Omit<StaffUser, 'id'>) => void;
  updateStaffUser: (id: string, data: Partial<StaffUser>) => void;
  deleteStaffUser: (id: string) => void;

  addSector: (sector: Omit<Sector, 'id'>) => void;
  updateSector: (id: string, data: Partial<Sector>) => void;
  deleteSector: (id: string) => void;

  getRecipeCostForProduct: (productId: string) => RecipeCost | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PLAN: 'hilos_de_amor_plan',
  PRODUCTS: 'hilos_de_amor_products',
  TABLES: 'hilos_de_amor_tables',
  ORDERS: 'hilos_de_amor_orders',
  INGREDIENTS: 'hilos_de_amor_ingredients',
  CUSTOMERS: 'hilos_de_amor_customers',
  CAMPAIGNS: 'hilos_de_amor_campaigns',
  AUTOMATIONS: 'hilos_de_amor_automations',
  TICKETS: 'hilos_de_amor_tickets',
  AUTO_PRICE: 'hilos_de_amor_auto_price',
  CASH_REGISTERS: 'hilos_de_amor_cash_registers',
  CASH_TRANSACTIONS: 'hilos_de_amor_cash_transactions',
  STAFF_USERS: 'hilos_de_amor_staff_users',
  TABLE_SECTORS: 'hilos_de_amor_table_sectors',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { user } = useAuth();

  // Plan comes from authenticated user's subscription, fallback to fidelizacion
  const [plan, setPlanState] = useState<PlanType>(() => {
    return user?.subscription?.planId || (localStorage.getItem(STORAGE_KEYS.PLAN) as PlanType) || 'fidelizacion';
  });

  const [autoPriceUpdate, setAutoPriceUpdateState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTO_PRICE);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Actualizar items almacenados con sus categorías oficiales según initialProducts
        const synced = parsed.map((p: Product) => {
          const seedMatch = initialProducts.find((sp) => sp.id === p.id);
          if (seedMatch) {
            return {
              ...p,
              categoryId: seedMatch.categoryId,
              categoryName: seedMatch.categoryName,
            };
          }
          return p;
        });

        // Incorporar cualquier producto del seed que no estuviera guardado previamente
        const missingSeedItems = initialProducts.filter(
          (sp) => !synced.some((p: Product) => p.id === sp.id)
        );

        const merged = [...synced, ...missingSeedItems];
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged));
        return merged;
      }
      return initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [tables, setTables] = useState<Table[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TABLES);
      const parsed = saved ? JSON.parse(saved) : null;
      const list: Table[] = Array.isArray(parsed) && parsed.length > 0 ? parsed : initialTables;

      const uniqueTables: Table[] = [];
      const seenNumbers = new Set<string>();
      const seenIds = new Set<string>();

      list.forEach((t, idx) => {
        let numStr = t.number?.trim() || `Mesa ${idx + 1}`;
        let lowerNum = numStr.toLowerCase();
        let counter = 1;

        while (seenNumbers.has(lowerNum)) {
          const matchNumber = numStr.match(/\d+/);
          const baseName = numStr.replace(/\d+$/, '').trim() || 'Mesa';
          const nextVal = matchNumber ? parseInt(matchNumber[0], 10) + counter : idx + 1 + counter;
          numStr = `${baseName} ${nextVal}`;
          lowerNum = numStr.toLowerCase();
          counter++;
        }

        let tableId = t.id && !seenIds.has(t.id) ? t.id : `tbl-auto-${idx + 1}-${Date.now()}`;
        seenNumbers.add(lowerNum);
        seenIds.add(tableId);

        uniqueTables.push({
          ...t,
          id: tableId,
          number: numStr,
          qrCode: t.qrCode || `QR-TBL-${tableId.slice(-6)}`,
        });
      });

      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(uniqueTables));
      return uniqueTables;
    } catch {
      return initialTables;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialOrders;
    } catch {
      return initialOrders;
    }
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialIngredients;
    } catch {
      return initialIngredients;
    }
  });

  // Supabase-backed states (Plan Fidelización)
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [rewards, setRewards] = useState<Reward[]>([]);

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
    return saved ? JSON.parse(saved) : initialCampaigns;
  });

  const [automations, setAutomations] = useState<Automation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTOMATIONS);
    return saved ? JSON.parse(saved) : initialAutomations;
  });

  const [branches, setBranches] = useState<Branch[]>([]);

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return saved ? JSON.parse(saved) : [];
  });

  const [cashRegisters, setCashRegisters] = useState<import('../types').CashRegister[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASH_REGISTERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [cashTransactions, setCashTransactions] = useState<import('../types').CashTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASH_TRANSACTIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(() => {
    const OFFICIAL_USERS: StaffUser[] = [
      { id: 'usr-admin-grow', name: 'Administrador', role: 'admin', email: 'admin@growlabs.lat', status: 'active' },
      { id: 'usr-cajero-grow', name: 'Cajero', role: 'cajero', email: 'cajero@growlabs.lat', status: 'active' },
      { id: 'usr-mozo-grow', name: 'Mozo', role: 'mozo', email: 'mozo@growlabs.lat', status: 'active' },
    ];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STAFF_USERS);
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const updated = OFFICIAL_USERS.map((off) => {
          const match = parsed.find((p: StaffUser) => p.email?.trim().toLowerCase() === off.email);
          return match ? { ...match, ...off } : off;
        });
        const extra = parsed.filter((p: StaffUser) => !OFFICIAL_USERS.some((off) => off.email === p.email?.trim().toLowerCase()));
        const merged = [...updated, ...extra];
        localStorage.setItem(STORAGE_KEYS.STAFF_USERS, JSON.stringify(merged));
        return merged;
      }
      return OFFICIAL_USERS;
    } catch {
      return OFFICIAL_USERS;
    }
  });

  const [tableSectors, setTableSectors] = useState<Sector[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TABLE_SECTORS);
    return saved ? JSON.parse(saved) : [
      { id: 'salon', name: 'salon', label: 'Salón Principal' },
      { id: 'patio', name: 'patio', label: 'Patio Central' },
      { id: 'terraza', name: 'terraza', label: 'Terraza' },
      { id: 'vereda', name: 'vereda', label: 'Vereda' },
    ];
  });

  const [affectedProductsAlert, setAffectedProductsAlert] = useState<string[]>([]);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [lockModal, setLockModal] = useState<LockModalState>({
    isOpen: false,
    requiredPlan: 'gestion',
    featureName: '',
  });

  // Loading states for Supabase
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [isLoadingAutomations, setIsLoadingAutomations] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  const openTutorialModal = () => setIsTutorialOpen(true);
  const closeTutorialModal = () => setIsTutorialOpen(false);

  // Realtime Live Syncing across tabs & windows
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    const handleSync = () => {
      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      const savedTables = localStorage.getItem(STORAGE_KEYS.TABLES);
      if (savedTables) setTables(JSON.parse(savedTables));
    };

    window.addEventListener('storage', handleSync);
    const interval = setInterval(handleSync, 2000);

    return () => {
      window.removeEventListener('storage', handleSync);
      clearInterval(interval);
    };
  }, []);

  // ============================================================
  // SUPABASE: Initial data fetch
  // ============================================================
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const fetchData = async () => {
      setIsLoadingCustomers(true);
      setIsLoadingRewards(true);
      setIsLoadingCampaigns(true);
      setIsLoadingAutomations(true);
      setIsLoadingBranches(true);

      try {
        const [dbCustomers, dbRewards, dbCampaigns, dbAutomations, dbBranches, dbStaff, dbProducts, dbTables, dbOrders, dbIngredients] = await Promise.all([
          customersService.getCustomers(),
          rewardsService.getRewards(),
          campaignsService.getCampaigns(),
          automationsService.getAutomations(),
          branchesService.getBranches(),
          staffService.getStaffUsers(),
          productsService.getProducts(),
          tablesService.getTables(),
          ordersService.getOrders(),
          ingredientsService.getIngredients(),
        ]);

        setCustomers(dbCustomers);
        setRewards(dbRewards);
        setCampaigns(dbCampaigns);
        setAutomations(dbAutomations);
        setBranches(dbBranches);
        if (dbStaff && dbStaff.length > 0) setStaffUsers(dbStaff);
        if (dbProducts && dbProducts.length > 0) setProducts(dbProducts);
        if (dbTables && dbTables.length > 0) setTables(dbTables);
        if (dbOrders && dbOrders.length > 0) setOrders(dbOrders);
        if (dbIngredients && dbIngredients.length > 0) setIngredients(dbIngredients);
      } catch (err) {
        console.error('Error fetching data from Supabase:', err);
      } finally {
        setIsLoadingCustomers(false);
        setIsLoadingRewards(false);
        setIsLoadingCampaigns(false);
        setIsLoadingAutomations(false);
        setIsLoadingBranches(false);
      }
    };

    fetchData();
  }, []);

  // Sync non-Supabase state to LocalStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PLAN, plan); }, [plan]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AUTO_PRICE, JSON.stringify(autoPriceUpdate)); }, [autoPriceUpdate]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables)); }, [tables]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredients)); }, [ingredients]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets)); }, [tickets]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CASH_REGISTERS, JSON.stringify(cashRegisters)); }, [cashRegisters]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CASH_TRANSACTIONS, JSON.stringify(cashTransactions)); }, [cashTransactions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STAFF_USERS, JSON.stringify(staffUsers)); }, [staffUsers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TABLE_SECTORS, JSON.stringify(tableSectors)); }, [tableSectors]);

  // Also keep localStorage as cache for Supabase entities (offline fallback)
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns)); }, [campaigns]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AUTOMATIONS, JSON.stringify(automations)); }, [automations]);

  const setPlan = (newPlan: PlanType) => {
    setPlanState(newPlan);
    const planLabels = {
      esencial: 'Plan Esencial',
      gestion: 'Plan Gestión',
      fidelizacion: 'Plan Fidelización',
    };
    showToast(`Plan activado: ${planLabels[newPlan]}`, 'Las funciones correspondientes fueron actualizadas.', 'info');
  };

  const setAutoPriceUpdate = (val: boolean) => {
    setAutoPriceUpdateState(val);
    showToast(
      val ? 'Modo de actualización automática activado' : 'Modo de revisión manual activado',
      val ? 'Los precios sugeridos se actualizarán al cambiar insumos.' : 'Deberás revisar los precios manualmente tras aumentos de insumos.',
      'info'
    );
  };

  const checkPlanAccess = (requiredPlan: PlanType, featureName: string): boolean => {
    const levels: Record<PlanType, number> = {
      esencial: 1,
      gestion: 2,
      fidelizacion: 3,
    };

    if (levels[plan] >= levels[requiredPlan]) {
      return true;
    }

    setLockModal({
      isOpen: true,
      requiredPlan,
      featureName,
    });
    return false;
  };

  const closeLockModal = () => {
    setLockModal((prev) => ({ ...prev, isOpen: false }));
  };

  // ============================================================
  // PRODUCTS (LocalStorage - unchanged)
  // ============================================================
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const category = initialCategories.find((c) => c.id === productData.categoryId);
    const newProdData = {
      ...productData,
      categoryName: category ? category.name : 'General',
    };
    const created = await productsService.createProduct(newProdData);
    if (created) {
      setProducts((prev) => [created, ...prev]);
      showToast('Producto creado', `"${created.name}" se agregó correctamente.`, 'success');
    } else {
      const id = crypto.randomUUID();
      const fallback: Product = { ...newProdData, id };
      setProducts((prev) => [fallback, ...prev]);
      showToast('Producto creado', `"${fallback.name}" se agregó correctamente.`, 'success');
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...productData } : p))
    );
    await productsService.updateProduct(id, productData);
    showToast('Producto actualizado', 'Los cambios fueron guardados.', 'success');
  };

  const toggleProductStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const next = !p.isAvailable;
          showToast(
            next ? 'Producto disponible' : 'Producto no disponible',
            `"${p.name}" ${next ? 'ahora es visible' : 'se ocultó'} en la carta digital.`,
            next ? 'success' : 'warning'
          );
          return { ...p, isAvailable: next };
        }
        return p;
      })
    );
  };

  // ============================================================
  // TABLES (LocalStorage - unchanged)
  // ============================================================
  const addTable = (tableData: Omit<Table, 'id' | 'qrCode'>): boolean => {
    const cleanNumber = tableData.number.trim();
    const existing = tables.find(
      (t) => t.number.trim().toLowerCase() === cleanNumber.toLowerCase()
    );
    if (existing) {
      showToast(
        'Nombre de Mesa en uso',
        `Ya existe una mesa con el nombre "${cleanNumber}". Cada mesa debe tener un nombre o número único.`,
        'error'
      );
      return false;
    }

    const id = `tbl-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const num = cleanNumber.replace(/\D/g, '') || id.slice(-4);
    const newTable: Table = {
      ...tableData,
      number: cleanNumber,
      id,
      qrCode: `QR-TBL-${num}`,
    };
    setTables((prev) => [...prev, newTable]);
    showToast('Mesa creada', `${newTable.number} agregada al sector ${newTable.sector}.`, 'success');
    return true;
  };

  const updateTable = (id: string, tableData: Partial<Table>): boolean => {
    if (tableData.number) {
      const cleanNumber = tableData.number.trim();
      const existing = tables.find(
        (t) => t.id !== id && t.number.trim().toLowerCase() === cleanNumber.toLowerCase()
      );
      if (existing) {
        showToast(
          'Nombre de Mesa en uso',
          `Ya existe otra mesa registrada como "${cleanNumber}". Elegí un nombre o número único.`,
          'error'
        );
        return false;
      }
    }
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...tableData } : t)));
    showToast('Mesa actualizada', 'Los datos de la mesa fueron guardados.', 'success');
    return true;
  };

  const updateTableStatus = (id: string, status: Table['status']) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          showToast('Estado de mesa modificado', `${t.number} ahora está ${status}.`, 'info');
          return { ...t, status };
        }
        return t;
      })
    );
  };

  const deleteTable = (id: string): boolean => {
    const target = tables.find((t) => t.id === id);
    if (!target) return false;
    setTables((prev) => prev.filter((t) => t.id !== id));
    showToast('Mesa eliminada', `${target.number} fue eliminada del sistema.`, 'info');
    return true;
  };

  // ============================================================
  // ORDERS (LocalStorage - unchanged)
  // ============================================================
  const createOrder = (orderData: Omit<Order, 'id' | 'code' | 'createdAt' | 'status'>): Order | null => {
    const activeRegister = cashRegisters.find((r) => r.status === 'abierta');

    if (!activeRegister) {
      showToast('Caja Cerrada', 'No se pueden ingresar pedidos porque la caja se encuentra cerrada.', 'error');
      return null;
    }

    const id = crypto.randomUUID();
    const codeNumber = Math.floor(1000 + Math.random() * 9000);
    const code = `ORD-${codeNumber}`;
    const pointsEarned = Math.floor(orderData.total / 1000);

    const resolvedTable = orderData.tableId ? tables.find((t) => t.id === orderData.tableId) : null;
    const resolvedTableName = orderData.tableName || (resolvedTable ? resolvedTable.number : undefined);
    const resolvedWaiterName = orderData.waiterName || (user ? `${user.name} (${user.role})` : 'Atención en Salón / QR');

    const newOrder: Order = {
      ...orderData,
      id,
      code,
      tableName: resolvedTableName,
      waiterName: resolvedWaiterName,
      registerId: activeRegister.id,
      createdAt: new Date().toISOString(),
      status: 'nuevo',
      pointsEarned,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Registrar movimiento de caja en vivo instantáneamente
    const newTx: import('../types').CashTransaction = {
      id: `tx-ord-${id}`,
      registerId: activeRegister.id,
      orderId: id,
      type: 'ingreso',
      amount: newOrder.total,
      paymentMethod: newOrder.paymentMethod || 'efectivo',
      description: `Cobro Pedido ${code}`,
      timestamp: new Date().toISOString(),
      registeredBy: resolvedWaiterName,
    };
    setCashTransactions((prev) => [newTx, ...prev]);

    // If order linked to table, update table status to 'ocupada'
    if (newOrder.tableId) {
      setTables((prev) =>
        prev.map((t) => (t.id === newOrder.tableId ? { ...t, status: 'ocupada' } : t))
      );
    }

    // Auto update client points if customer linked
    if (newOrder.customerId) {
      addCustomerPoints(newOrder.customerId, pointsEarned);
    }

    showToast('¡Pedido recibido!', `Pedido ${code} generado exitosamente.`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          showToast('Estado de pedido actualizado', `${ord.code} se cambió a "${status}".`, 'info');
          return { ...ord, status };
        }
        return ord;
      })
    );
  };

  // ============================================================
  // INGREDIENTS & Cost Recalculation (LocalStorage - unchanged)
  // ============================================================
  const addIngredient = (ingData: Omit<Ingredient, 'id' | 'updatedAt' | 'normalizedCost'>) => {
    const id = crypto.randomUUID();
    const normalizedCost = calculateNormalizedCost(
      ingData.purchasePrice,
      ingData.purchaseQty,
      ingData.purchaseUnit,
      ingData.usageUnit
    );

    const newIngredient: Ingredient = {
      ...ingData,
      id,
      updatedAt: new Date().toISOString(),
      normalizedCost,
    };

    setIngredients((prev) => [...prev, newIngredient]);
    showToast('Ingrediente agregado', `"${newIngredient.name}" guardado.`, 'success');
  };

  const updateIngredient = (id: string, ingData: Partial<Ingredient>) => {
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id === id) {
          const updated = { ...ing, ...ingData, updatedAt: new Date().toISOString() };
          updated.normalizedCost = calculateNormalizedCost(
            updated.purchasePrice,
            updated.purchaseQty,
            updated.purchaseUnit,
            updated.usageUnit
          );
          return updated;
        }
        return ing;
      })
    );
    showToast('Ingrediente actualizado', 'Los cambios se guardaron correctamente.', 'success');
  };

  const deleteIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
    showToast('Ingrediente eliminado', 'El ingrediente ha sido eliminado.', 'info');
  };

  const updateIngredientPrice = (id: string, newPurchasePrice: number) => {
    let ingredientName = '';
    const updatedIngredients = ingredients.map((ing) => {
      if (ing.id === id) {
        ingredientName = ing.name;
        const normalizedCost = calculateNormalizedCost(
          newPurchasePrice,
          ing.purchaseQty,
          ing.purchaseUnit,
          ing.usageUnit
        );
        return {
          ...ing,
          purchasePrice: newPurchasePrice,
          normalizedCost,
          updatedAt: new Date().toISOString(),
        };
      }
      return ing;
    });

    setIngredients(updatedIngredients);

    // Identify affected products (e.g., Coffee, Capuchino, Cheesecake, etc.)
    const affected: string[] = [];
    if (ingredientName.toLowerCase().includes('café')) {
      affected.push('Café Espresso', 'Café con Leche', 'Capuchino', 'Combo Desayuno Hilos de Amor');
    } else if (ingredientName.toLowerCase().includes('leche')) {
      affected.push('Café con Leche', 'Capuchino', 'Combo Merienda Completa');
    } else if (ingredientName.toLowerCase().includes('mascarpone') || ingredientName.toLowerCase().includes('frutos')) {
      affected.push('Cheesecake de Frutos Rojos');
    } else if (ingredientName.toLowerCase().includes('carne') || ingredientName.toLowerCase().includes('pollo')) {
      affected.push('Hamburguesa Artesanal', 'Empanadas de Carne (Docena)', 'Ensalada Caesar Pollo');
    } else {
      affected.push('Café con Leche', 'Medialunas de Manteca');
    }

    setAffectedProductsAlert(affected);

    if (autoPriceUpdate) {
      // Auto recalculate products suggested selling price
      setProducts((prev) =>
        prev.map((p) => {
          if (affected.includes(p.name)) {
            const newCost = Math.round((p.cost || 1000) * 1.22);
            const newSuggested = Math.round(newCost / 0.40);
            return {
              ...p,
              cost: newCost,
              suggestedPrice: newSuggested,
              price: newSuggested, // Auto updated selling price
            };
          }
          return p;
        })
      );
      showToast(
        '¡Precios de venta recalculados!',
        `Se actualizaron los costos y precios sugeridos de ${affected.length} productos vinculados a "${ingredientName}".`,
        'success'
      );
    } else {
      showToast(
        'Alerta de costos',
        `El aumento de "${ingredientName}" afecta a ${affected.length} productos. Modo de revisión manual activo.`,
        'warning'
      );
    }
  };

  // ============================================================
  // CUSTOMERS & LOYALTY (Supabase-backed)
  // ============================================================
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'registrationDate' | 'points' | 'level' | 'purchaseCount' | 'totalSpent' | 'averageTicket' | 'lastPurchaseDate' | 'usedPromotionsCount'>): Promise<Customer | null> => {
    if (isSupabaseConfigured) {
      const dbCustomer = await customersService.createCustomer(customerData);
      if (dbCustomer) {
        setCustomers((prev) => [dbCustomer, ...prev]);
        showToast('¡Cliente registrado!', `${dbCustomer.firstName} ${dbCustomer.lastName} recibió 150 puntos de bienvenida.`, 'success');
        return dbCustomer;
      } else {
        showToast('Error', 'No se pudo registrar el cliente en la base de datos.', 'error');
        return null;
      }
    }

    // LocalStorage fallback
    const id = crypto.randomUUID();
    const newCustomer: Customer = {
      ...customerData,
      id,
      registrationDate: new Date().toISOString(),
      purchaseCount: 0,
      totalSpent: 0,
      averageTicket: 0,
      lastPurchaseDate: new Date().toISOString(),
      points: 150,
      level: 'Inicial',
      usedPromotionsCount: 0,
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast('¡Cliente registrado!', `${newCustomer.firstName} ${newCustomer.lastName} recibió 150 puntos de bienvenida.`, 'success');
    return newCustomer;
  };

  const updateCustomerData = async (id: string, data: Partial<Customer>): Promise<void> => {
    if (isSupabaseConfigured) {
      const updated = await customersService.updateCustomer(id, data);
      if (updated) {
        setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
        showToast('Cliente actualizado', 'Los datos del cliente fueron guardados.', 'success');
        return;
      } else {
        showToast('Error', 'No se pudo actualizar el cliente.', 'error');
        return;
      }
    }
    // LocalStorage fallback
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    showToast('Cliente actualizado', 'Los datos del cliente fueron guardados.', 'success');
  };

  const deleteCustomer = async (id: string): Promise<void> => {
    if (isSupabaseConfigured) {
      const success = await customersService.deleteCustomer(id);
      if (success) {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
        showToast('Cliente eliminado', 'El registro fue borrado correctamente.', 'success');
        return;
      } else {
        showToast('Error', 'No se pudo eliminar el cliente.', 'error');
        return;
      }
    }
    // LocalStorage fallback
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast('Cliente eliminado', 'El registro fue borrado correctamente.', 'success');
  };

  const addCustomerPoints = (customerId: string, pointsAmount: number) => {
    // Optimistic update
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newPoints = c.points + pointsAmount;
          let level: Customer['level'] = c.level;
          if (newPoints > 3000) level = 'VIP';
          else if (newPoints > 1500) level = 'Preferencial';
          else if (newPoints > 500) level = 'Frecuente';

          return {
            ...c,
            points: newPoints,
            level,
            purchaseCount: c.purchaseCount + 1,
          };
        }
        return c;
      })
    );

    // Persist to Supabase in background
    if (isSupabaseConfigured) {
      customersService.addCustomerPoints(customerId, pointsAmount).catch(console.error);
    }
  };

  const redeemReward = async (customerId: string, rewardId: string): Promise<boolean> => {
    const customer = customers.find((c) => c.id === customerId);
    const reward = rewards.find((r) => r.id === rewardId);

    if (!customer || !reward) return false;

    if (customer.points < reward.pointsCost) {
      showToast('Puntos insuficientes', `El cliente tiene ${customer.points} puntos pero el beneficio requiere ${reward.pointsCost}.`, 'error');
      return false;
    }

    // Optimistic update
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              points: c.points - reward.pointsCost,
              usedPromotionsCount: c.usedPromotionsCount + 1,
            }
          : c
      )
    );

    // Persist to Supabase
    if (isSupabaseConfigured) {
      await customersService.updateCustomer(customerId, {
        points: customer.points - reward.pointsCost,
        usedPromotionsCount: customer.usedPromotionsCount + 1,
      });
      await redemptionsService.createRedemption(customerId, rewardId, reward.pointsCost);
    }

    showToast('¡Beneficio Canjeado!', `Se canjeó "${reward.name}" para ${customer.firstName}.`, 'success');
    return true;
  };

  // ============================================================
  // REWARDS CRUD (Supabase-backed)
  // ============================================================
  const addReward = async (rewardData: Omit<Reward, 'id'>): Promise<void> => {
    if (isSupabaseConfigured) {
      const dbReward = await rewardsService.createReward(rewardData);
      if (dbReward) {
        setRewards((prev) => [...prev, dbReward]);
        showToast('Recompensa creada', `"${dbReward.name}" agregada al catálogo.`, 'success');
        return;
      } else {
        showToast('Error', 'No se pudo crear la recompensa.', 'error');
        return;
      }
    }
    // Fallback
    const id = crypto.randomUUID();
    setRewards((prev) => [...prev, { ...rewardData, id }]);
    showToast('Recompensa creada', `"${rewardData.name}" agregada al catálogo.`, 'success');
  };

  const updateRewardData = async (id: string, data: Partial<Reward>): Promise<void> => {
    if (isSupabaseConfigured) {
      const updated = await rewardsService.updateReward(id, data);
      if (updated) {
        setRewards((prev) => prev.map((r) => (r.id === id ? updated : r)));
        showToast('Recompensa actualizada', 'Los cambios fueron guardados.', 'success');
        return;
      } else {
        showToast('Error', 'No se pudo actualizar la recompensa.', 'error');
        return;
      }
    }
    setRewards((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    showToast('Recompensa actualizada', 'Los cambios fueron guardados.', 'success');
  };

  const deleteRewardData = async (id: string): Promise<void> => {
    if (isSupabaseConfigured) {
      const success = await rewardsService.deleteReward(id);
      if (success) {
        setRewards((prev) => prev.filter((r) => r.id !== id));
        showToast('Recompensa eliminada', 'Se eliminó del catálogo.', 'success');
        return;
      } else {
        showToast('Error', 'No se pudo eliminar la recompensa.', 'error');
        return;
      }
    }
    setRewards((prev) => prev.filter((r) => r.id !== id));
    showToast('Recompensa eliminada', 'Se eliminó del catálogo.', 'success');
  };

  // ============================================================
  // CAMPAIGNS (Supabase-backed)
  // ============================================================
  const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'status' | 'conversionRate'>): Promise<void> => {
    if (isSupabaseConfigured) {
      const dbCampaign = await campaignsService.createCampaign(campaignData);
      if (dbCampaign) {
        setCampaigns((prev) => [dbCampaign, ...prev]);
        showToast('Campaña programada', `"${dbCampaign.name}" se enviará al segmento: ${dbCampaign.segment}.`, 'success');
        return;
      } else {
        showToast('Error', 'No se pudo crear la campaña.', 'error');
        return;
      }
    }
    // Fallback
    const id = crypto.randomUUID();
    const newCampaign: Campaign = {
      ...campaignData,
      id,
      status: 'programado',
      conversionRate: 0,
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    showToast('Campaña programada', `"${newCampaign.name}" se enviará al segmento: ${newCampaign.segment}.`, 'success');
  };

  const updateCampaignData = async (id: string, data: Partial<Campaign>): Promise<void> => {
    if (isSupabaseConfigured) {
      const updated = await campaignsService.updateCampaign(id, data);
      if (updated) {
        setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
        showToast('Campaña actualizada', 'Los cambios fueron guardados.', 'success');
        return;
      } else {
        showToast('Error', 'No se pudo actualizar la campaña.', 'error');
        return;
      }
    }
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    showToast('Campaña actualizada', 'Los cambios fueron guardados.', 'success');
  };

  const deleteCampaignData = async (id: string): Promise<void> => {
    if (isSupabaseConfigured) {
      const success = await campaignsService.deleteCampaign(id);
      if (success) {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
        showToast('Campaña eliminada', 'La campaña fue borrada correctamente.', 'success');
        return;
      } else {
        showToast('Error', 'No se pudo eliminar la campaña.', 'error');
        return;
      }
    }
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    showToast('Campaña eliminada', 'La campaña fue borrada correctamente.', 'success');
  };

  const simulateCampaignSend = (campaignId: string) => {
    // Optimistic update
    setCampaigns((prev) =>
      prev.map((cmp) => (cmp.id === campaignId ? { ...cmp, status: 'enviado' as const } : cmp))
    );
    showToast('Simulación de WhatsApp', 'Mensaje enviado. Actualizando estado a "Entregado"...', 'info');

    if (isSupabaseConfigured) {
      campaignsService.updateCampaignStatus(campaignId, 'enviado').catch(console.error);
    }

    setTimeout(() => {
      setCampaigns((prev) =>
        prev.map((cmp) => (cmp.id === campaignId ? { ...cmp, status: 'entregado' as const } : cmp))
      );
      if (isSupabaseConfigured) {
        campaignsService.updateCampaignStatus(campaignId, 'entregado').catch(console.error);
      }
    }, 2000);

    setTimeout(() => {
      setCampaigns((prev) =>
        prev.map((cmp) => (cmp.id === campaignId ? { ...cmp, status: 'leido' as const, conversionRate: 48 } : cmp))
      );
      if (isSupabaseConfigured) {
        campaignsService.updateCampaignStatus(campaignId, 'leido', 48).catch(console.error);
      }
      showToast('Simulación completada', 'Los destinatarios leyeron el mensaje de WhatsApp.', 'success');
    }, 4000);
  };

  // ============================================================
  // AUTOMATIONS (Supabase-backed)
  // ============================================================
  const addAutomation = async (automationData: Omit<Automation, 'id'>): Promise<void> => {
    if (isSupabaseConfigured) {
      const dbAutomation = await automationsService.createAutomation(automationData);
      if (dbAutomation) {
        setAutomations((prev) => [dbAutomation, ...prev]);
        showToast('Automatización creada', `"${dbAutomation.name}" configurada.`, 'success');
        return;
      } else {
        showToast('Error', 'No se pudo crear la automatización.', 'error');
        return;
      }
    }
    const id = `aut-${Date.now()}`;
    setAutomations((prev) => [{ ...automationData, id }, ...prev]);
    showToast('Automatización creada', `"${automationData.name}" configurada.`, 'success');
  };

  const updateAutomationData = async (id: string, data: Partial<Automation>): Promise<void> => {
    if (isSupabaseConfigured) {
      const updated = await automationsService.updateAutomation(id, data);
      if (updated) {
        setAutomations((prev) => prev.map((a) => (a.id === id ? updated : a)));
        showToast('Automatización actualizada', 'Los cambios fueron guardados.', 'success');
        return;
      } else {
        showToast('Error', 'No se pudo actualizar la automatización.', 'error');
        return;
      }
    }
    setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
    showToast('Automatización actualizada', 'Los cambios fueron guardados.', 'success');
  };

  const deleteAutomationData = async (id: string): Promise<void> => {
    if (isSupabaseConfigured) {
      const success = await automationsService.deleteAutomation(id);
      if (success) {
        setAutomations((prev) => prev.filter((a) => a.id !== id));
        showToast('Automatización eliminada', 'El flujo fue borrado correctamente.', 'success');
        return;
      } else {
        showToast('Error', 'No se pudo eliminar la automatización.', 'error');
        return;
      }
    }
    setAutomations((prev) => prev.filter((a) => a.id !== id));
    showToast('Automatización eliminada', 'El flujo fue borrado correctamente.', 'success');
  };

  const toggleAutomation = (automationId: string) => {
    setAutomations((prev) =>
      prev.map((aut) => {
        if (aut.id === automationId) {
          const nextStatus = aut.status === 'activa' ? 'pausada' : 'activa';
          showToast('Automatización actualizada', `"${aut.name}" ahora está ${nextStatus}.`, 'info');

          // Persist to Supabase
          if (isSupabaseConfigured) {
            automationsService.toggleAutomationStatus(automationId, aut.status).catch(console.error);
          }

          return { ...aut, status: nextStatus as Automation['status'] };
        }
        return aut;
      })
    );
  };

  // ============================================================
  // SUPPORT (LocalStorage - unchanged)
  // ============================================================
  const createSupportTicket = (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>): string => {
    const id = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: SupportTicket = {
      ...ticketData,
      id,
      createdAt: new Date().toISOString(),
      status: 'abierto',
    };
    setTickets((prev) => [newTicket, ...prev]);
    showToast('Consulta enviada a Soporte', `Se generó el ticket #${id}. Te responderemos a la brevedad.`, 'success');
    return id;
  };

  // ============================================================
  // BRANCHES CRUD (Supabase)
  // ============================================================
  const addBranch = async (branchData: Omit<Branch, 'id' | 'createdAt'>) => {
    if (!isSupabaseConfigured) return;
    const created = await branchesService.createBranch(branchData);
    if (created) {
      setBranches((prev) => [...prev, created]);
      showToast('Sucursal creada', `"${created.name}" fue agregada correctamente.`, 'success');
    }
  };

  const updateBranchData = async (id: string, data: Partial<Branch>) => {
    if (!isSupabaseConfigured) return;
    const updated = await branchesService.updateBranch(id, data);
    if (updated) {
      setBranches((prev) => prev.map((b) => (b.id === id ? updated : b)));
      showToast('Sucursal actualizada', `Los datos fueron guardados.`, 'success');
    }
  };

  const deleteBranchData = async (id: string) => {
    if (!isSupabaseConfigured) return;
    const deleted = await branchesService.deleteBranch(id);
    if (deleted) {
      setBranches((prev) => prev.filter((b) => b.id !== id));
      showToast('Sucursal eliminada', 'La sucursal fue removida del sistema.', 'info');
    }
  };

  // ============================================================
  // STAFF & SECTORS
  // ============================================================
  const addStaffUser = async (userData: Omit<StaffUser, 'id'>) => {
    const created = await staffService.createStaffUser(userData);
    const newUser: StaffUser = created || { ...userData, id: crypto.randomUUID() };
    setStaffUsers((prev) => [...prev, newUser]);
    showToast('Usuario creado', `Se agregó al usuario ${newUser.name}.`, 'success');
  };

  const updateStaffUser = async (id: string, data: Partial<StaffUser>) => {
    await staffService.updateStaffUserInDb(id, data);
    setStaffUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    showToast('Usuario actualizado', 'Los datos del usuario fueron guardados.', 'success');
  };

  const deleteStaffUser = async (id: string) => {
    await staffService.deleteStaffUserFromDb(id);
    setStaffUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('Usuario eliminado', 'El usuario ha sido removido del sistema.', 'info');
  };

  const addSector = (sectorData: Omit<Sector, 'id'>) => {
    const newSector: Sector = { ...sectorData, id: crypto.randomUUID() };
    setTableSectors((prev) => [...prev, newSector]);
    showToast('Sector creado', `Se agregó el sector ${newSector.label}.`, 'success');
  };

  const updateSector = (id: string, data: Partial<Sector>) => {
    setTableSectors((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    showToast('Sector actualizado', 'Los datos del sector fueron guardados.', 'success');
  };

  const deleteSector = (id: string) => {
    setTableSectors((prev) => prev.filter((s) => s.id !== id));
    showToast('Sector eliminado', 'El sector ha sido removido del sistema.', 'info');
  };

  // ============================================================
  // CONTEXT VALUE
  // ============================================================
  const openRegister = (openedBy: string, initialBalance: number) => {
    const newRegister: import('../types').CashRegister = {
      id: `reg-${Date.now()}`,
      openedAt: new Date().toISOString(),
      openedBy,
      initialBalance,
      status: 'abierta',
    };
    setCashRegisters((prev) => [newRegister, ...prev]);
    showToast('Caja abierta', `Turno iniciado por ${openedBy} con ${formatCurrency(initialBalance)}`, 'success');
  };

  const closeRegister = (
    registerId: string,
    finalBalance: number,
    closedBy?: string,
    expectedBalance?: number,
    difference?: number,
    notes?: string
  ) => {
    setCashRegisters((prev) =>
      prev.map((reg) => {
        if (reg.id === registerId) {
          return {
            ...reg,
            status: 'cerrada',
            closedAt: new Date().toISOString(),
            finalBalance,
            cashPhysicalCount: finalBalance,
            closedBy: closedBy || reg.openedBy,
            expectedBalance,
            difference,
            notes,
          };
        }
        return reg;
      })
    );
    showToast('Caja cerrada', 'El turno ha sido cerrado correctamente y el comprobante está listo.', 'success');
  };

  const addTransaction = (tx: Omit<import('../types').CashTransaction, 'id' | 'timestamp'>) => {
    const newTx: import('../types').CashTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setCashTransactions((prev) => [newTx, ...prev]);
  };

  const getRecipeCostForProduct = (productId: string): RecipeCost | null => {
    const product = products.find((p) => p.id === productId);
    if (!product) return null;

    const items = product.recipeItems || [];

    return calculateRecipeCostDetails(
      product.id,
      product.name,
      items,
      150, // packaging
      100, // other direct
      0.60, // 60% margin
      product.price
    );
  };


  return (
    <AppContext.Provider
      value={{
        plan,
        setPlan,
        categories: initialCategories,
        products,
        tables,
        orders,
        ingredients,
        customers,
        rewards,
        campaigns,
        automations,
        insights: [],
        manuals: initialManuals,
        tickets,
        branches,
        staffUsers,
        tableSectors,
        cashRegisters,
        cashTransactions,
        autoPriceUpdate,
        setAutoPriceUpdate,
        affectedProductsAlert,
        lockModal,
        closeLockModal,
        checkPlanAccess,
        isTutorialOpen,
        openTutorialModal,
        closeTutorialModal,
        isLoadingCustomers,
        isLoadingRewards,
        isLoadingCampaigns,
        isLoadingAutomations,
        isLoadingBranches,
        addProduct,
        updateProduct,
        toggleProductStatus,
        addTable,
        updateTable,
        updateTableStatus,
        deleteTable,
        createOrder,
        updateOrderStatus,
        addIngredient,
        updateIngredientPrice,
        updateIngredient,
        deleteIngredient,
        addCustomer,
        updateCustomerData,
        deleteCustomer,
        addCustomerPoints,
        redeemReward,
        addReward,
        updateRewardData,
        deleteRewardData,
        createCampaign,
        updateCampaignData,
        deleteCampaignData,
        simulateCampaignSend,
        addAutomation,
        updateAutomationData,
        deleteAutomationData,
        toggleAutomation,
        addBranch,
        updateBranchData,
        deleteBranchData,
        createSupportTicket,
        openRegister,
        closeRegister,
        addTransaction,
        addStaffUser,
        updateStaffUser,
        deleteStaffUser,
        addSector,
        updateSector,
        deleteSector,
        getRecipeCostForProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
