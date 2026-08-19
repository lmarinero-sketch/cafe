import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  SquareCheckBig,
  Truck,
  Sparkles,
  Smartphone,
  ExternalLink,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Lightbulb,
  ChevronRight,
  Utensils,
  BarChart3,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/currency';
import { ModuleOnboardingBanner } from '../components/common/ModuleOnboardingBanner';

export const DashboardPage: React.FC = () => {
  const {
    plan,
    orders,
    tables,
    products,
    insights,
    affectedProductsAlert,
    checkPlanAccess,
    openTutorialModal,
  } = useApp();
  const navigate = useNavigate();

  // Metrics summary
  const todayOrders = orders.slice(0, 15);
  const totalSalesToday = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'nuevo' || o.status === 'confirmado' || o.status === 'en_preparacion'
  ).length;
  const occupiedTablesCount = tables.filter((t) => t.status === 'ocupada').length;
  const pendingDeliveryCount = orders.filter(
    (o) => o.type === 'delivery' && (o.status === 'nuevo' || o.status === 'en_preparacion')
  ).length;

  const featuredProduct = products.find((p) => p.isFeatured) || products[0];

  // Calculate Sales evolution for past 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const salesChartData = last7Days.map(dateStr => {
    const dayOrders = orders.filter(o => o.createdAt.startsWith(dateStr));
    const ventas = dayOrders.reduce((sum, o) => sum + o.total, 0);
    const dateObj = new Date(dateStr + 'T12:00:00');
    const dayName = new Intl.DateTimeFormat('es-AR', { weekday: 'short' }).format(dateObj);
    return { day: dayName.charAt(0).toUpperCase() + dayName.slice(1), ventas };
  });

  // Calculate Top Selling Products
  const productSales: Record<string, number> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      productSales[item.productName] = (productSales[item.productName] || 0) + item.quantity;
    });
  });

  const colors = ['#2F5233', '#4A6B48', '#6A8765', '#9BB598', '#C3D6C1'];
  const topProductsChartData = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, unidades], index) => ({
      name,
      unidades,
      fill: colors[index % colors.length]
    }));

  const planLabels = {
    esencial: 'Plan Esencial',
    gestion: 'Plan Gestión',
    fidelizacion: 'Plan Fidelización',
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Module Onboarding Banner */}
      <ModuleOnboardingBanner
        title="Inicio & Tablero Principal"
        subtitle="Resumen ejecutivo del día, facturación, pedidos activos y gráficos de ventas"
        steps={[
          'Revisá los KPIs en tiempo real (Ventas del día, Pedidos activos y Mesas ocupadas).',
          'Analizá los dos gráficos interactivos: Evolución semanal y Productos más vendidos.',
          'Probá la autogestión abriendo el "Menú Digital QR" o administrá la carta desde "Productos".',
        ]}
      />

      {/* Top Banner & Greeting */}
      <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-brown/80">
              Panel Principal
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-yellow/30 text-brand-dark border border-brand-yellow/60">
              {planLabels[plan]}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-brand-dark font-serif">
            ¡Buenas tardes, Equipo Hilos de Amor! 🧁🧵
          </h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Resumen operativo y comercial en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <button
            onClick={openTutorialModal}
            className="flex-1 md:flex-initial py-2.5 px-4 rounded-xl bg-brand-yellow text-brand-dark border border-brand-yellow font-extrabold text-xs hover:scale-105 transition-all shadow-soft flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-brand-brown fill-brand-yellow" />
            Tutorial Interactivo
          </button>
          <button
            onClick={() => window.open('/menu', '_blank')}
            className="flex-1 md:flex-initial py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-all duration-200 shadow-soft flex items-center justify-center gap-2"
          >
            <Smartphone className="w-4 h-4 text-brand-yellow" />
            Menú Digital QR
          </button>
          <button
            onClick={() => navigate('/editor-web')}
            className="py-2.5 px-3 rounded-xl bg-brand-yellow text-brand-dark border border-brand-yellow/80 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 hover:bg-brand-yellow/80"
            title="Editar sitio web"
          >
            <ExternalLink className="w-4 h-4" />
            Editor Web
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ventas del día */}
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft hover:border-brand-brown/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-brown/80">Ventas del Día</span>
            <div className="w-9 h-9 rounded-xl bg-brand-green/30 text-emerald-800 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-brand-dark mt-2">
            {formatCurrency(totalSalesToday)}
          </h3>
          <p className="text-[11px] text-emerald-800 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14% vs ayer
          </p>
        </div>

        {/* Card 2: Pedidos Activos */}
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft hover:border-brand-brown/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-brown/80">Pedidos Activos</span>
            <div className="w-9 h-9 rounded-xl bg-brand-yellow/30 text-brand-brown flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-brand-dark mt-2">{activeOrdersCount}</h3>
          <p className="text-[11px] text-brand-brown/80 mt-1">En cocina y caja</p>
        </div>

        {/* Card 3: Mesas Ocupadas */}
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft hover:border-brand-brown/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-brown/80">Mesas Ocupadas</span>
            <div className="w-9 h-9 rounded-xl bg-brand-secondary text-brand-dark flex items-center justify-center">
              <SquareCheckBig className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-brand-dark mt-2">
            {occupiedTablesCount} <span className="text-sm font-normal text-brand-brown/70">/ {tables.length}</span>
          </h3>
          <p className="text-[11px] text-brand-brown/80 mt-1">Sectores salón y terraza</p>
        </div>

        {/* Card 4: Delivery Pendientes */}
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft hover:border-brand-brown/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-brown/80">Delivery Pendientes</span>
            <div className="w-9 h-9 rounded-xl bg-brand-red/30 text-rose-800 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-brand-dark mt-2">{pendingDeliveryCount}</h3>
          <p className="text-[11px] text-brand-brown/80 mt-1">Esperando despacho</p>
        </div>
      </div>

      {/* Alerts Section (if any affected products) */}
      {affectedProductsAlert.length > 0 && (
        <div className="bg-brand-yellow/30 border border-brand-yellow p-4 rounded-2xl flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-brand-dark">
              Alerta de modificación de insumos ({affectedProductsAlert.length} productos afectados)
            </h4>
            <p className="text-brand-brown/90 mt-0.5">
              Los productos {affectedProductsAlert.join(', ')} requieren revisión de precio sugerido por aumento de ingredientes.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: 2 Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Sales Evolution */}
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-brand-dark">Evolución de Ventas Semanales</h3>
              <p className="text-xs text-brand-brown/80">Comparativa de ingresos diarios en ARS</p>
            </div>
            <button
              onClick={() => checkPlanAccess('gestion', 'Métricas') && navigate('/metricas')}
              className="text-xs font-bold text-brand-brown hover:underline flex items-center gap-1"
            >
              Ver métricas completas <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2F5233" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2F5233" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#D6E2D4" />
                <XAxis dataKey="day" stroke="#1A2E1E" fontSize={12} />
                <YAxis stroke="#1A2E1E" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), 'Ventas']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #D6E2D4', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="ventas" stroke="#2F5233" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Selling Products BarChart */}
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-brand-dark">Ranking: Productos Más Vendidos</h3>
              <p className="text-xs text-brand-brown/80">Unidades vendidas acumuladas este mes</p>
            </div>
            <button
              onClick={() => checkPlanAccess('gestion', 'Rotación') && navigate('/rotation')}
              className="text-xs font-bold text-brand-brown hover:underline flex items-center gap-1"
            >
              Ver rotación <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#D6E2D4" />
                <XAxis type="number" stroke="#1A2E1E" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#1A2E1E" fontSize={11} width={115} />
                <Tooltip
                  formatter={(val: number) => [`${val} unidades`, 'Vendidas']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #D6E2D4', fontSize: '12px' }}
                />
                <Bar dataKey="unidades" radius={[0, 8, 8, 0]}>
                  {topProductsChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
          {/* Featured Product Card */}
          {featuredProduct && (
            <div className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown bg-brand-yellow/40 px-2 py-0.5 rounded">
                ⭐ Producto Destacado
              </span>
              <div className="flex items-center gap-4">
                <img
                  src={featuredProduct.image || '/products/espresso.svg'}
                  alt={featuredProduct.name || 'Producto'}
                  className="w-16 h-16 rounded-xl object-cover bg-brand-bg border border-brand-secondary shrink-0"
                />
                <div>
                  <h4 className="text-sm font-bold text-brand-dark">{featuredProduct.name}</h4>
                  <p className="text-xs text-brand-brown font-bold mt-0.5">
                    {formatCurrency(featuredProduct.price)}
                  </p>
                  <p className="text-[11px] text-brand-brown/70 line-clamp-1 mt-0.5">
                    {featuredProduct.description}
                  </p>
                </div>
              </div>
            </div>
          )}


      {/* Insights Section */}
      <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-brand-brown" />
            <h3 className="text-base font-bold text-brand-dark">Oportunidades & Insights del Negocio</h3>
          </div>
          <button
            onClick={() => checkPlanAccess('gestion', 'Insights') && navigate('/insights')}
            className="text-xs font-bold text-brand-brown hover:underline"
          >
            Ver todos los insights
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.slice(0, 3).map((ins) => (
            <div
              key={ins.id}
              className="p-4 rounded-xl bg-brand-cream border border-brand-secondary/70 space-y-2 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown bg-brand-yellow/40 px-2 py-0.5 rounded">
                  {ins.type}
                </span>
                <h4 className="text-xs font-bold text-brand-dark mt-1.5">{ins.title}</h4>
                <p className="text-[11px] text-brand-brown/90 mt-1 leading-relaxed">
                  {ins.description}
                </p>
              </div>
              {ins.actionText && (
                <span className="text-[11px] font-bold text-brand-brown flex items-center gap-1 pt-1">
                  {ins.actionText} <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
