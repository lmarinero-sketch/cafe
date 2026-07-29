import React, { useState } from 'react';
import { RefreshCw, Search, ArrowUpDown, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductRotation } from '../types';
import { formatCurrency, formatPercent } from '../utils/currency';

export const RotationPage: React.FC = () => {
  const { products } = useApp();
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const rotationData: ProductRotation[] = products.map((p, index) => {
    const unitsSold = 45 + ((index * 27) % 300);
    const revenue = unitsSold * p.price;
    const daysWithoutSales = index % 8 === 0 ? 7 : (index % 4);
    let rotationLevel: ProductRotation['rotationLevel'] = 'media';
    if (unitsSold > 180) rotationLevel = 'alta';
    else if (unitsSold < 70 || daysWithoutSales >= 5) rotationLevel = 'baja';

    return {
      productId: p.id,
      productName: p.name,
      categoryName: p.categoryName || 'General',
      unitsSold,
      salesShare: Math.round(((revenue / 2500000) * 100) * 10) / 10,
      daysWithoutSales,
      salesFrequency: rotationLevel === 'alta' ? 'Diaria (Múltiple)' : rotationLevel === 'media' ? 'Semanal' : 'Ocasional',
      revenue,
      margin: 55 + (index % 12),
      rotationLevel,
    };
  });

  const filteredRotation = rotationData.filter((r) => {
    const matchesLevel = filterLevel === 'all' || r.rotationLevel === filterLevel;
    const matchesSearch = r.productName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const getRotationBadge = (level: ProductRotation['rotationLevel']) => {
    switch (level) {
      case 'alta':
        return 'bg-brand-green/30 text-emerald-950 border-brand-green';
      case 'media':
        return 'bg-brand-yellow/40 text-brand-dark border-brand-yellow';
      case 'baja':
        return 'bg-brand-red/30 text-rose-950 border-brand-red';
    }
  };

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
          <h2 className="text-2xl font-extrabold text-brand-dark">Rotación & Velocidad de Productos</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Matriz de frecuencia de venta, días sin rotación e impacto sobre el margen del comercio
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['all', 'alta', 'media', 'baja'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                filterLevel === lvl
                  ? 'bg-brand-brown text-brand-card shadow-soft'
                  : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40'
              }`}
            >
              {lvl === 'all' ? 'Todos los niveles' : `Rotación ${lvl}`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-brand-brown/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Rotation Table */}
      <div className="bg-brand-card rounded-2xl border border-brand-secondary shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-brand-cream border-b border-brand-secondary/80 text-brand-dark uppercase tracking-wider text-[10px] font-extrabold">
                <th className="p-3.5">Producto</th>
                <th className="p-3.5">Unidades Vendidas</th>
                <th className="p-3.5">Cuota de Ventas</th>
                <th className="p-3.5">Días sin Venta</th>
                <th className="p-3.5">Frecuencia</th>
                <th className="p-3.5">Facturación</th>
                <th className="p-3.5">Margen</th>
                <th className="p-3.5 text-right">Nivel de Rotación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-secondary/60">
              {filteredRotation.map((r) => (
                <tr key={r.productId} className="hover:bg-brand-bg/50 transition-colors">
                  <td className="p-3.5 font-bold text-brand-dark">{r.productName}</td>
                  <td className="p-3.5 font-extrabold text-brand-brown">{r.unitsSold} u.</td>
                  <td className="p-3.5 text-brand-dark">{r.salesShare}%</td>
                  <td className="p-3.5 font-bold text-brand-brown/90">{r.daysWithoutSales} días</td>
                  <td className="p-3.5 text-brand-brown">{r.salesFrequency}</td>
                  <td className="p-3.5 font-bold text-brand-dark">{formatCurrency(r.revenue)}</td>
                  <td className="p-3.5 font-bold text-emerald-900">{r.margin}%</td>
                  <td className="p-3.5 text-right">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getRotationBadge(
                        r.rotationLevel
                      )}`}
                    >
                      Rotación {r.rotationLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
