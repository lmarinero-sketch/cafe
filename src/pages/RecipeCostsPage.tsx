import React, { useState } from 'react';
import { Calculator, Sparkles, AlertTriangle, ArrowRight, Check, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatPercent } from '../utils/currency';

export const RecipeCostsPage: React.FC = () => {
  const { products, getRecipeCostForProduct, updateProduct } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const recipeCost = getRecipeCostForProduct(selectedProductId);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleApplySuggestedPrice = () => {
    if (!selectedProduct || !recipeCost) return;
    updateProduct(selectedProduct.id, { price: recipeCost.suggestedPrice });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Banner */}
      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown bg-brand-yellow/40 px-2 py-0.5 rounded">
              Plan Gestión
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-brand-dark">Recetas, Escandallos & Costos</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Cálculo automático de costo total, merma, margen objetivo y recomendación de precios de venta
          </p>
        </div>
      </div>

      {/* Main Grid: Selector & Product Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Product List Selector */}
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-brown">
            Seleccionar Producto
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {products.map((p) => {
              const isActive = p.id === selectedProductId;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    isActive
                      ? 'bg-brand-brown text-brand-card border-brand-brown shadow-soft'
                      : 'bg-brand-bg text-brand-dark border-brand-secondary/60 hover:border-brand-brown/40'
                  }`}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover bg-brand-card shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold truncate">{p.name}</h4>
                    <p className={`text-[11px] font-extrabold mt-0.5 ${isActive ? 'text-brand-yellow' : 'text-brand-brown'}`}>
                      {formatCurrency(p.price)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Recipe Cost Calculation Cards */}
        {recipeCost && selectedProduct ? (
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Cards Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft">
                <span className="text-[11px] font-bold text-brand-brown/80">Costo Total Calculado</span>
                <h3 className="text-2xl font-extrabold text-brand-dark mt-1">
                  {formatCurrency(recipeCost.totalCost)}
                </h3>
                <p className="text-[10px] text-brand-brown/70 mt-1">Materia prima + empaque</p>
              </div>

              <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft">
                <span className="text-[11px] font-bold text-brand-brown/80">Precio Actual en Menú</span>
                <h3 className="text-2xl font-extrabold text-brand-dark mt-1">
                  {formatCurrency(recipeCost.currentPrice)}
                </h3>
                <p className="text-[10px] text-emerald-800 font-semibold mt-1">
                  Margen bruto: {recipeCost.grossMargin}%
                </p>
              </div>

              <div className="bg-brand-card p-4 rounded-2xl border-2 border-brand-yellow shadow-soft">
                <span className="text-[11px] font-bold text-brand-brown">Precio Sugerido (60% margen)</span>
                <h3 className="text-2xl font-extrabold text-brand-brown mt-1">
                  {formatCurrency(recipeCost.suggestedPrice)}
                </h3>
                <p className="text-[10px] text-brand-brown font-bold mt-1">
                  Dif: {formatCurrency(recipeCost.priceDiff)}
                </p>
              </div>
            </div>

            {/* Ingredients Escandallo Table */}
            <div className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-brand-dark">
                  Escandallo de Insumos: {selectedProduct.name}
                </h3>
                {recipeCost.priceDiff > 0 && (
                  <button
                    onClick={handleApplySuggestedPrice}
                    className="py-2 px-3 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors shadow-soft flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-brand-yellow" />
                    Actualizar a precio sugerido ({formatCurrency(recipeCost.suggestedPrice)})
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-brand-cream border-b border-brand-secondary/80 text-brand-dark uppercase tracking-wider text-[10px] font-extrabold">
                      <th className="p-3">Ingrediente</th>
                      <th className="p-3">Cantidad Usada</th>
                      <th className="p-3">Merma</th>
                      <th className="p-3 text-right">Costo Insumo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-secondary/60">
                    {recipeCost.recipeItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-bold text-brand-dark">{item.ingredientName}</td>
                        <td className="p-3 text-brand-brown">
                          {item.usageQty} {item.usageUnit}
                        </td>
                        <td className="p-3 text-rose-800 font-bold">{item.wastePercentage}%</td>
                        <td className="p-3 text-right font-extrabold text-brand-dark">
                          {formatCurrency(item.itemCost)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="p-3 font-bold text-brand-brown">Costo de Empaque / Descartables</td>
                      <td className="p-3 text-brand-brown">1 unidad</td>
                      <td className="p-3 text-brand-brown">0%</td>
                      <td className="p-3 text-right font-extrabold text-brand-dark">
                        {formatCurrency(recipeCost.packagingCost)}
                      </td>
                    </tr>
                    <tr className="bg-brand-bg font-extrabold">
                      <td colSpan={3} className="p-3 text-brand-dark text-xs uppercase">
                        Costo Total Neto del Producto
                      </td>
                      <td className="p-3 text-right text-brand-brown text-sm">
                        {formatCurrency(recipeCost.totalCost)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Profitability summary banner */}
              <div className="p-4 bg-brand-cream rounded-xl border border-brand-secondary flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-brand-dark">Ganancia Bruta Estimada por Unidad:</span>
                  <p className="text-brand-brown/80 mt-0.5">
                    Precio actual ({formatCurrency(selectedProduct.price)}) - Costo total ({formatCurrency(recipeCost.totalCost)})
                  </p>
                </div>
                <span className="text-lg font-extrabold text-emerald-950 bg-brand-green/30 px-3.5 py-1 rounded-xl border border-brand-green">
                  {formatCurrency(recipeCost.grossProfit)}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
