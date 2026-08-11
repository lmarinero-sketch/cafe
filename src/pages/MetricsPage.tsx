import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  PieChart as PieIcon,
  BarChart2,
  Users,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/currency';

export const MetricsPage: React.FC = () => {
  const { orders, products, categories } = useApp();

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const avgTicket = totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount) : 0;

  // Chart Data: Sales per category
  const categorySalesMap: Record<string, number> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const catId = product.categoryId;
        categorySalesMap[catId] = (categorySalesMap[catId] || 0) + (item.quantity * item.unitPrice);
      }
    });
  });

  const categoryData = Object.entries(categorySalesMap).map(([catId, value]) => {
    const cat = categories.find(c => c.id === catId);
    return { name: cat ? cat.name : 'Otros', value };
  }).sort((a, b) => b.value - a.value);

  // Chart Data: Sales by Channel
  const channelSalesMap: Record<string, number> = {};
  orders.forEach(order => {
    const channel = order.type === 'salon' ? 'Salón' : order.type === 'delivery' ? 'Delivery' : 'Para llevar';
    channelSalesMap[channel] = (channelSalesMap[channel] || 0) + order.total;
  });
  
  const channelColors = ['#8C6A5D', '#F4A261', '#2A9D8F'];
  const channelData = Object.entries(channelSalesMap).map(([name, value], index) => ({ name, value, color: channelColors[index % channelColors.length] })).sort((a, b) => b.value - a.value);

  // Top Selling Products Chart Data
  const productSalesMap: Record<string, number> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      productSalesMap[item.productName] = (productSalesMap[item.productName] || 0) + item.quantity;
    });
  });
  const topProductsData = Object.entries(productSalesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, unidades]) => ({ name, unidades }));

  const COLORS = ['#765747', '#4A352C', '#F4D58D', '#B7C9A8', '#EADBC8', '#DFA7A0'];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Top Banner */}
      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown bg-brand-yellow/40 px-2 py-0.5 rounded">
              Plan Gestión
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-brand-dark">Métricas & Indicadores de Rendimiento (KPI)</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Análisis consolidado de facturación, canales de venta y preferencias del cliente
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft">
          <span className="text-xs font-semibold text-brand-brown/80">Facturación Acumulada</span>
          <h3 className="text-2xl font-extrabold text-brand-dark mt-1">{formatCurrency(totalSales)}</h3>
          <p className="text-[11px] text-emerald-800 font-semibold mt-1">Total de {totalOrdersCount} pedidos</p>
        </div>

        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft">
          <span className="text-xs font-semibold text-brand-brown/80">Ticket Promedio</span>
          <h3 className="text-2xl font-extrabold text-brand-dark mt-1">{formatCurrency(avgTicket)}</h3>
          <p className="text-[11px] text-brand-brown/80 mt-1">Por comanda generada</p>
        </div>

        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft">
          <span className="text-xs font-semibold text-brand-brown/80">Producto Más Vendido</span>
          <h3 className="text-lg font-extrabold text-brand-dark mt-1">{topProductsData.length > 0 ? topProductsData[0].name : 'Sin ventas'}</h3>
          <p className="text-[11px] text-brand-brown/80 mt-1">{topProductsData.length > 0 ? `${topProductsData[0].unidades} unidades` : '0 unidades'}</p>
        </div>

        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft">
          <span className="text-xs font-semibold text-brand-brown/80">Canal Principal</span>
          <h3 className="text-lg font-extrabold text-brand-dark mt-1">{channelData.length > 0 ? channelData[0].name : 'N/A'}</h3>
          <p className="text-[11px] text-brand-brown/80 mt-1">{channelData.length > 0 ? `${Math.round((channelData[0].value / totalSales) * 100)}% de ingresos` : '-'}</p>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products Bar Chart */}
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 shadow-soft space-y-4">
          <h3 className="text-base font-bold text-brand-dark">Productos Más Vendidos (Unidades)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#EADBC8" />
                <XAxis type="number" stroke="#4A352C" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#4A352C" fontSize={11} width={110} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFDF8', borderRadius: '12px', border: '1px solid #EADBC8', fontSize: '12px' }} />
                <Bar dataKey="unidades" fill="#765747" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Pie Chart */}
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 shadow-soft space-y-4">
          <h3 className="text-base font-bold text-brand-dark">Distribución de Ventas por Canal</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => [formatCurrency(val), 'Ventas']} contentStyle={{ backgroundColor: '#FFFDF8', borderRadius: '12px', border: '1px solid #EADBC8', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-xs font-bold text-brand-dark">
            {channelData.map((ch, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ch.color }} />
                <span>{ch.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
