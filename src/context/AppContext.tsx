import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
} from '../types';
import { initialCategories } from '../data/seeds/categories.seed';
import { initialProducts } from '../data/seeds/products.seed';
import { initialTables } from '../data/seeds/tables.seed';
import { initialIngredients } from '../data/seeds/ingredients.seed';
import { initialOrders } from '../data/seeds/orders.seed';
import { initialCustomers } from '../data/seeds/customers.seed';
import { initialRewards } from '../data/seeds/rewards.seed';
import { initialCampaigns } from '../data/seeds/campaigns.seed';
import { initialAutomations } from '../data/seeds/automations.seed';
import { initialInsights } from '../data/seeds/insights.seed';
import { initialManuals } from '../data/manuals/systemManuals';
import { calculateNormalizedCost, calculateRecipeCostDetails } from '../utils/costEngine';
import { useToast } from './ToastContext';

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
  autoPriceUpdate: boolean;
  setAutoPriceUpdate: (val: boolean) => void;
  affectedProductsAlert: string[];
  lockModal: LockModalState;
  closeLockModal: () => void;
  checkPlanAccess: (requiredPlan: PlanType, featureName: string) => boolean;
  isTutorialOpen: boolean;
  openTutorialModal: () => void;
  closeTutorialModal: () => void;

  // Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  toggleProductStatus: (id: string) => void;
  
  addTable: (table: Omit<Table, 'id' | 'qrCode'>) => void;
  updateTable: (id: string, table: Partial<Table>) => void;
  updateTableStatus: (id: string, status: Table['status']) => void;

  createOrder: (order: Omit<Order, 'id' | 'code' | 'createdAt' | 'status'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'updatedAt' | 'normalizedCost'>) => void;
  updateIngredientPrice: (id: string, newPurchasePrice: number) => void;

  addCustomer: (customer: Omit<Customer, 'id' | 'registrationDate' | 'points' | 'level' | 'purchaseCount' | 'totalSpent' | 'averageTicket' | 'lastPurchaseDate' | 'usedPromotionsCount'>) => Customer;
  addCustomerPoints: (customerId: string, pointsAmount: number) => void;
  redeemReward: (customerId: string, rewardId: string) => boolean;

  createCampaign: (campaign: Omit<Campaign, 'id' | 'status' | 'conversionRate'>) => void;
  simulateCampaignSend: (campaignId: string) => void;
  toggleAutomation: (automationId: string) => void;

  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => string;

  resetDemoData: () => void;
  getRecipeCostForProduct: (productId: string) => RecipeCost | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PLAN: 'cafe_magnolia_plan',
  PRODUCTS: 'cafe_magnolia_products',
  TABLES: 'cafe_magnolia_tables',
  ORDERS: 'cafe_magnolia_orders',
  INGREDIENTS: 'cafe_magnolia_ingredients',
  CUSTOMERS: 'cafe_magnolia_customers',
  CAMPAIGNS: 'cafe_magnolia_campaigns',
  AUTOMATIONS: 'cafe_magnolia_automations',
  TICKETS: 'cafe_magnolia_tickets',
  AUTO_PRICE: 'cafe_magnolia_auto_price',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [plan, setPlanState] = useState<PlanType>(() => {
    return (localStorage.getItem(STORAGE_KEYS.PLAN) as PlanType) || 'fidelizacion';
  });

  const [autoPriceUpdate, setAutoPriceUpdateState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTO_PRICE);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TABLES);
    return saved ? JSON.parse(saved) : initialTables;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
    return saved ? JSON.parse(saved) : initialIngredients;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
    return saved ? JSON.parse(saved) : initialCampaigns;
  });

  const [automations, setAutomations] = useState<Automation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTOMATIONS);
    return saved ? JSON.parse(saved) : initialAutomations;
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return saved ? JSON.parse(saved) : [];
  });

  const [affectedProductsAlert, setAffectedProductsAlert] = useState<string[]>([]);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [lockModal, setLockModal] = useState<LockModalState>({
    isOpen: false,
    requiredPlan: 'gestion',
    featureName: '',
  });

  const openTutorialModal = () => setIsTutorialOpen(true);
  const closeTutorialModal = () => setIsTutorialOpen(false);

  // Sync state to LocalStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PLAN, plan); }, [plan]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AUTO_PRICE, JSON.stringify(autoPriceUpdate)); }, [autoPriceUpdate]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables)); }, [tables]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredients)); }, [ingredients]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns)); }, [campaigns]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AUTOMATIONS, JSON.stringify(automations)); }, [automations]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets)); }, [tickets]);

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

  // Products
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now()}`;
    const category = initialCategories.find((c) => c.id === productData.categoryId);
    const newProduct: Product = {
      ...productData,
      id,
      categoryName: category ? category.name : 'General',
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast('Producto creado', `"${newProduct.name}" se agregó correctamente.`, 'success');
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...productData } : p))
    );
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

  // Tables
  const addTable = (tableData: Omit<Table, 'id' | 'qrCode'>) => {
    const id = `tbl-${Date.now()}`;
    const num = tableData.number.replace(/\D/g, '') || '99';
    const newTable: Table = {
      ...tableData,
      id,
      qrCode: `QR-TBL-${num}`,
    };
    setTables((prev) => [...prev, newTable]);
    showToast('Mesa creada', `${newTable.number} agregada al sector ${newTable.sector}.`, 'success');
  };

  const updateTable = (id: string, tableData: Partial<Table>) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...tableData } : t)));
    showToast('Mesa actualizada', 'Los datos de la mesa fueron guardados.', 'success');
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

  // Orders
  const createOrder = (orderData: Omit<Order, 'id' | 'code' | 'createdAt' | 'status'>): Order => {
    const id = `ord-${Date.now()}`;
    const codeNumber = Math.floor(1000 + Math.random() * 9000);
    const code = `ORD-${codeNumber}`;
    const pointsEarned = Math.round(orderData.total * 0.05);

    const newOrder: Order = {
      ...orderData,
      id,
      code,
      createdAt: new Date().toISOString(),
      status: 'nuevo',
      pointsEarned,
    };

    setOrders((prev) => [newOrder, ...prev]);

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

  // Ingredients & Cost Recalculation
  const addIngredient = (ingData: Omit<Ingredient, 'id' | 'updatedAt' | 'normalizedCost'>) => {
    const id = `ing-${Date.now()}`;
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
      affected.push('Café Espresso', 'Café con Leche', 'Capuchino', 'Combo Desayuno Magnolia');
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

  // Customers & Loyalty
  const addCustomer = (customerData: Omit<Customer, 'id' | 'registrationDate' | 'points' | 'level' | 'purchaseCount' | 'totalSpent' | 'averageTicket' | 'lastPurchaseDate' | 'usedPromotionsCount'>): Customer => {
    const id = `cli-${Date.now()}`;
    const newCustomer: Customer = {
      ...customerData,
      id,
      registrationDate: new Date().toISOString(),
      purchaseCount: 0,
      totalSpent: 0,
      averageTicket: 0,
      lastPurchaseDate: new Date().toISOString(),
      points: 150, // Welcome bonus points
      level: 'Inicial',
      usedPromotionsCount: 0,
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast('¡Cliente registrado!', `${newCustomer.firstName} ${newCustomer.lastName} recibió 150 puntos de bienvenida.`, 'success');
    return newCustomer;
  };

  const addCustomerPoints = (customerId: string, pointsAmount: number) => {
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
  };

  const redeemReward = (customerId: string, rewardId: string): boolean => {
    const customer = customers.find((c) => c.id === customerId);
    const reward = initialRewards.find((r) => r.id === rewardId);

    if (!customer || !reward) return false;

    if (customer.points < reward.pointsCost) {
      showToast('Puntos insuficientes', `El cliente tiene ${customer.points} puntos pero el beneficio requiere ${reward.pointsCost}.`, 'error');
      return false;
    }

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

    showToast('¡Beneficio Canjeado!', `Se canjeó "${reward.name}" para ${customer.firstName}.`, 'success');
    return true;
  };

  // WhatsApp & Marketing
  const createCampaign = (campaignData: Omit<Campaign, 'id' | 'status' | 'conversionRate'>) => {
    const id = `cmp-${Date.now()}`;
    const newCampaign: Campaign = {
      ...campaignData,
      id,
      status: 'programado',
      conversionRate: 0,
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    showToast('Campaña programada', `"${newCampaign.name}" se enviará al segmento: ${newCampaign.segment}.`, 'success');
  };

  const simulateCampaignSend = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((cmp) => (cmp.id === campaignId ? { ...cmp, status: 'enviado' } : cmp))
    );
    showToast('Simulación de WhatsApp', 'Mensaje enviado. Actualizando estado a "Entregado"...', 'info');

    setTimeout(() => {
      setCampaigns((prev) =>
        prev.map((cmp) => (cmp.id === campaignId ? { ...cmp, status: 'entregado' } : cmp))
      );
    }, 2000);

    setTimeout(() => {
      setCampaigns((prev) =>
        prev.map((cmp) => (cmp.id === campaignId ? { ...cmp, status: 'leido', conversionRate: 48 } : cmp))
      );
      showToast('Simulación completada', 'Los destinatarios leyeron el mensaje de WhatsApp.', 'success');
    }, 4000);
  };

  const toggleAutomation = (automationId: string) => {
    setAutomations((prev) =>
      prev.map((aut) => {
        if (aut.id === automationId) {
          const nextStatus = aut.status === 'activa' ? 'pausada' : 'activa';
          showToast('Automatización actualizada', `"${aut.name}" ahora está ${nextStatus}.`, 'info');
          return { ...aut, status: nextStatus };
        }
        return aut;
      })
    );
  };

  // Support
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

  // Factory Reset
  const resetDemoData = () => {
    localStorage.clear();
    setPlanState('fidelizacion');
    setAutoPriceUpdateState(true);
    setProducts(initialProducts);
    setTables(initialTables);
    setOrders(initialOrders);
    setIngredients(initialIngredients);
    setCustomers(initialCustomers);
    setCampaigns(initialCampaigns);
    setAutomations(initialAutomations);
    setTickets([]);
    setAffectedProductsAlert([]);
    showToast('Demo Reiniciada', 'Todos los datos ficticios se restablecieron a su estado inicial.', 'info');
  };

  const getRecipeCostForProduct = (productId: string): RecipeCost | null => {
    const product = products.find((p) => p.id === productId);
    if (!product) return null;

    let items = [];
    if (product.name.includes('Café')) {
      items = [
        {
          ingredientId: 'ing-1',
          ingredientName: 'Café en Grano Arábica',
          usageQty: 18,
          usageUnit: 'gramo' as const,
          wastePercentage: 3,
          itemCost: 18 * 24 * 1.03, // ~ 445
        },
        {
          ingredientId: 'ing-2',
          ingredientName: 'Leche Entera La Serenísima',
          usageQty: 200,
          usageUnit: 'mililitro' as const,
          wastePercentage: 2,
          itemCost: 200 * 1.2 * 1.02, // ~ 244
        },
      ];
    } else if (product.name.includes('Medialunas')) {
      items = [
        {
          ingredientId: 'ing-4',
          ingredientName: 'Harina 0000 Pastelera',
          usageQty: 120,
          usageUnit: 'gramo' as const,
          wastePercentage: 2,
          itemCost: 120 * 0.74 * 1.02,
        },
        {
          ingredientId: 'ing-3',
          ingredientName: 'Manteca Purísima',
          usageQty: 60,
          usageUnit: 'gramo' as const,
          wastePercentage: 4,
          itemCost: 60 * 9.5 * 1.04,
        },
      ];
    } else {
      items = [
        {
          ingredientId: 'ing-6',
          ingredientName: 'Queso Mascarpone',
          usageQty: 80,
          usageUnit: 'gramo' as const,
          wastePercentage: 3,
          itemCost: 80 * 14.2 * 1.03,
        },
        {
          ingredientId: 'ing-7',
          ingredientName: 'Frutos Rojos Congelados',
          usageQty: 40,
          usageUnit: 'gramo' as const,
          wastePercentage: 5,
          itemCost: 40 * 8.0 * 1.05,
        },
      ];
    }

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
        rewards: initialRewards,
        campaigns,
        automations,
        insights: initialInsights,
        manuals: initialManuals,
        tickets,
        autoPriceUpdate,
        setAutoPriceUpdate,
        affectedProductsAlert,
        lockModal,
        closeLockModal,
        checkPlanAccess,
        isTutorialOpen,
        openTutorialModal,
        closeTutorialModal,
        addProduct,
        updateProduct,
        toggleProductStatus,
        addTable,
        updateTable,
        updateTableStatus,
        createOrder,
        updateOrderStatus,
        addIngredient,
        updateIngredientPrice,
        addCustomer,
        addCustomerPoints,
        redeemReward,
        createCampaign,
        simulateCampaignSend,
        toggleAutomation,
        createSupportTicket,
        resetDemoData,
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
