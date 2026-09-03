import React, { useState, useMemo } from 'react';
import { Calculator, Sparkles, Plus, Trash2, Edit2, ArrowRight, Check, TrendingUp, Package, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatPercent } from '../utils/currency';
import { RecipeIngredient, IngredientUnit } from '../types';

export const RecipeCostsPage: React.FC = () => {
  const { products, ingredients, getRecipeCostForProduct, updateProduct } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const recipeCost = getRecipeCostForProduct(selectedProductId);

  // Consolidated cost for composite products / combos
  const compositeCost = useMemo(() => {
    if (!selectedProduct?.isComposite || !selectedProduct.compositeItems) return null;
    let total = 0;
    const breakdown = selectedProduct.compositeItems.map((ci) => {
      const prodRef = products.find((p) => p.id === ci.productId);
      const singleCost = prodRef?.cost || getRecipeCostForProduct(ci.productId)?.totalCost || 0;
      const subtotalCost = singleCost * ci.quantity;
      total += subtotalCost;
      return {
        ...ci,
        singleCost,
        subtotalCost,
        sellingPrice: prodRef?.price || 0,
      };
    });
    const margin =
      selectedProduct.price > 0
        ? Math.round(((selectedProduct.price - total) / selectedProduct.price) * 100)
        : 0;
    return {
      totalCost: total,
      breakdown,
      margin,
    };
  }, [selectedProduct, products, getRecipeCostForProduct]);

  // Local state for editing the recipe
  const [editingItems, setEditingItems] = useState<RecipeIngredient[]>([]);

  const handleStartEdit = () => {
    if (!selectedProduct) return;
    setEditingItems(selectedProduct.recipeItems || []);
    setIsEditing(true);
  };

  const handleAddIngredient = () => {
    if (ingredients.length === 0) return;
    const first = ingredients[0];
    setEditingItems([...editingItems, {
      ingredientId: first.id,
      ingredientName: first.name,
      usageQty: 1,
      usageUnit: first.usageUnit,
      wastePercentage: first.wastePercentage,
      itemCost: first.normalizedCost,
    }]);
  };

  const handleUpdateItem = (index: number, field: keyof RecipeIngredient, value: any) => {
    const updated = [...editingItems];
    
    if (field === 'ingredientId') {
      const ing = ingredients.find(i => i.id === value);
      if (ing) {
        updated[index] = {
          ...updated[index],
          ingredientId: ing.id,
          ingredientName: ing.name,
          usageUnit: ing.usageUnit,
          wastePercentage: ing.wastePercentage,
          itemCost: ing.normalizedCost * updated[index].usageQty * (1 + ing.wastePercentage / 100),
        };
      }
    } else if (field === 'usageQty') {
      const num = Number(value);
      updated[index].usageQty = num;
      const ing = ingredients.find(i => i.id === updated[index].ingredientId);
      if (ing) {
        updated[index].itemCost = ing.normalizedCost * num * (1 + updated[index].wastePercentage / 100);
      }
    } else if (field === 'wastePercentage') {
      const num = Number(value);
      updated[index].wastePercentage = num;
      const ing = ingredients.find(i => i.id === updated[index].ingredientId);
      if (ing) {
        updated[index].itemCost = ing.normalizedCost * updated[index].usageQty * (1 + num / 100);
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    
    setEditingItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setEditingItems(editingItems.filter((_, i) => i !== index));
  };

  const handleSaveRecipe = () => {
    if (!selectedProduct) return;
    updateProduct(selectedProduct.id, { recipeItems: editingItems });
    setIsEditing(false);
  };

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
                  onClick={() => {
                    setSelectedProductId(p.id);
                    setIsEditing(false);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    isActive
                      ? 'bg-brand-brown text-brand-card border-brand-brown shadow-soft'
                      : 'bg-brand-bg text-brand-dark border-brand-secondary/60 hover:border-brand-brown/40'
                  }`}
                >
                  <img
                    src={p.image || '/products/espresso.svg'}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover bg-brand-card shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold truncate">{p.name}</h4>
                      {p.isComposite && (
                        <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-1.5 py-0.2 rounded shrink-0">
                          COMBO
                        </span>
                      )}
                    </div>
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
              <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-brand-brown/80">
                    {selectedProduct.isComposite ? 'Costo Consolidado Combo' : 'Costo Total Calculado'}
                  </span>
                  <h3 className="text-2xl font-extrabold text-brand-dark mt-1">
                    {formatCurrency(selectedProduct.isComposite ? compositeCost?.totalCost || 0 : recipeCost.totalCost)}
                  </h3>
                  <p className="text-[10px] text-brand-brown/70 mt-1">
                    {selectedProduct.isComposite ? 'Suma de recetas componentes' : 'Materia prima + empaque'}
                  </p>
                </div>
              </div>

              <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold text-brand-brown/80">Precio Actual en Menú</span>
                    <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded">
                      ✓ Vinc. Productos
                    </span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-brand-dark mt-1">
                    {formatCurrency(selectedProduct.price)}
                  </h3>
                  <p className="text-[10px] text-emerald-800 font-semibold mt-1">
                    Margen bruto: {selectedProduct.isComposite ? compositeCost?.margin || 0 : recipeCost.grossMargin}%
                  </p>
                </div>

                <button
                  onClick={() => {
                    const input = prompt(`Modificar precio de "${selectedProduct.name}" para la sección Productos ($):`, selectedProduct.price.toString());
                    if (input && !isNaN(Number(input)) && Number(input) >= 0) {
                      updateProduct(selectedProduct.id, { price: Number(input) });
                    }
                  }}
                  className="w-full py-2 px-2.5 rounded-xl bg-brand-bg hover:bg-brand-secondary/40 text-brand-dark font-bold text-[11px] border border-brand-secondary flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-brand-brown shrink-0" /> Cambiar Precio en Productos
                </button>
              </div>

              <div className="bg-brand-card p-4 rounded-2xl border-2 border-brand-yellow shadow-soft flex flex-col justify-between space-y-3">
                {selectedProduct.isComposite ? (() => {
                  const totalSuelto = compositeCost?.breakdown.reduce((s, i) => s + i.sellingPrice * i.quantity, 0) || 0;
                  const ahorro = totalSuelto > selectedProduct.price ? totalSuelto - selectedProduct.price : 0;
                  const porcentaje = totalSuelto > 0 ? Math.round((ahorro / totalSuelto) * 100) : 0;
                  return (
                    <div>
                      <span className="text-[11px] font-bold text-amber-900">Total Comprado Suelto</span>
                      <h3 className="text-2xl font-extrabold text-amber-950 mt-1">
                        {formatCurrency(totalSuelto)}
                      </h3>
                      <p className="text-[10px] text-emerald-800 font-extrabold mt-1">
                        Ahorro cliente: {formatCurrency(ahorro)} ({porcentaje}% OFF)
                      </p>
                    </div>
                  );
                })() : (
                  <>
                    <div>
                      <span className="text-[11px] font-bold text-brand-brown">Precio Sugerido (60% margen)</span>
                      <h3 className="text-2xl font-extrabold text-brand-brown mt-1">
                        {formatCurrency(recipeCost.suggestedPrice)}
                      </h3>
                      <p className="text-[10px] text-brand-brown font-bold mt-1">
                        Dif: {formatCurrency(recipeCost.priceDiff)}
                      </p>
                    </div>

                    <button
                      onClick={handleApplySuggestedPrice}
                      className="w-full py-2 px-2.5 rounded-xl bg-brand-brown text-brand-card hover:bg-brand-dark font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow-soft"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-brand-yellow shrink-0" /> Aplicar Sugerido a Productos
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* If Composite Product, show composite components breakdown table */}
            {selectedProduct.isComposite ? (
              <div className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-600" />
                      <span>Composición y Costos del Combo: {selectedProduct.name}</span>
                    </h3>
                    <p className="text-xs text-brand-brown/80 mt-0.5">
                      El costo se calcula sumando el costo de receta de cada producto componente.
                    </p>
                  </div>
                  <span className="text-xs font-black text-amber-950 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full">
                    {selectedProduct.compositeItems?.reduce((s, i) => s + i.quantity, 0) || 0} ítems incluidos
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-amber-100/70 border-b border-amber-300 text-amber-950 uppercase tracking-wider text-[10px] font-extrabold">
                        <th className="p-3">Producto Componente</th>
                        <th className="p-3 text-center">Cantidad</th>
                        <th className="p-3 text-right">Costo Unitario</th>
                        <th className="p-3 text-right">Costo Subtotal</th>
                        <th className="p-3 text-right">Precio Venta Suelto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-200/60">
                      {compositeCost?.breakdown.map((item, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/50">
                          <td className="p-3 font-bold text-brand-dark">{item.productName}</td>
                          <td className="p-3 text-center font-bold font-mono">{item.quantity}</td>
                          <td className="p-3 text-right text-brand-brown font-mono">{formatCurrency(item.singleCost)}</td>
                          <td className="p-3 text-right font-extrabold text-amber-950 font-mono">{formatCurrency(item.subtotalCost)}</td>
                          <td className="p-3 text-right text-gray-500 font-mono line-through">{formatCurrency(item.sellingPrice * item.quantity)}</td>
                        </tr>
                      ))}
                      <tr className="bg-amber-100/90 font-black">
                        <td colSpan={3} className="p-3 text-amber-950 uppercase text-xs">
                          Costo Consolidado Total
                        </td>
                        <td className="p-3 text-right text-amber-950 text-sm font-mono">
                          {formatCurrency(compositeCost?.totalCost || 0)}
                        </td>
                        <td className="p-3 text-right text-xs text-gray-700 font-mono">
                          Suelto: {formatCurrency(compositeCost?.breakdown.reduce((s, i) => s + i.sellingPrice * i.quantity, 0) || 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {/* Ingredients Escandallo Table (Only for simple products) */}
            {!selectedProduct.isComposite && (
            <div className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-brand-dark">
                  Escandallo de Insumos: {selectedProduct.name}
                </h3>
                <div className="flex gap-2">
                  {!isEditing && (
                    <button
                      onClick={handleStartEdit}
                      className="py-1.5 px-3 rounded-xl border border-brand-secondary text-brand-dark font-bold text-xs hover:bg-brand-secondary/40 transition-colors shadow-soft flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Editar Receta
                    </button>
                  )}
                  {recipeCost.priceDiff > 0 && !isEditing && (
                    <button
                      onClick={handleApplySuggestedPrice}
                      className="py-1.5 px-3 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors shadow-soft flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-brand-yellow" />
                      Usar Sugerido ({formatCurrency(recipeCost.suggestedPrice)})
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="bg-brand-cream border border-brand-secondary rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-brand-brown/5 border-b border-brand-secondary/60 text-brand-dark uppercase tracking-wider text-[10px] font-extrabold">
                          <th className="p-3">Ingrediente</th>
                          <th className="p-3 w-24">Cantidad</th>
                          <th className="p-3 w-20">Unidad</th>
                          <th className="p-3 w-20">Merma %</th>
                          <th className="p-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-secondary/60">
                        {editingItems.map((item, idx) => (
                          <tr key={idx} className="bg-brand-card">
                            <td className="p-2">
                              <select
                                value={item.ingredientId}
                                onChange={(e) => handleUpdateItem(idx, 'ingredientId', e.target.value)}
                                className="w-full px-2 py-1.5 rounded-lg border border-brand-secondary bg-brand-bg text-brand-dark focus:outline-none"
                              >
                                {ingredients.map(ing => (
                                  <option key={ing.id} value={ing.id}>{ing.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={item.usageQty}
                                onChange={(e) => handleUpdateItem(idx, 'usageQty', e.target.value)}
                                className="w-full px-2 py-1.5 rounded-lg border border-brand-secondary bg-brand-bg text-brand-dark focus:outline-none"
                              />
                            </td>
                            <td className="p-2 text-brand-brown/80 font-medium">
                              {item.usageUnit}
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min={0}
                                step="1"
                                value={item.wastePercentage}
                                onChange={(e) => handleUpdateItem(idx, 'wastePercentage', e.target.value)}
                                className="w-full px-2 py-1.5 rounded-lg border border-brand-secondary bg-brand-bg text-brand-dark focus:outline-none"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700 p-1">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {editingItems.length === 0 && (
                      <div className="p-4 text-center text-xs text-brand-brown/60">
                        No hay ingredientes en esta receta.
                      </div>
                    )}
                    <div className="p-2 border-t border-brand-secondary/60 bg-brand-card">
                      <button
                        onClick={handleAddIngredient}
                        className="w-full py-2 rounded-lg border border-dashed border-brand-brown/40 text-brand-brown font-bold text-xs hover:bg-brand-cream transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Agregar Ingrediente
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="py-2 px-4 rounded-xl border border-brand-secondary text-brand-dark font-bold text-xs hover:bg-brand-secondary/40 transition-colors shadow-soft"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveRecipe}
                      className="py-2 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors shadow-soft flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 text-brand-yellow" />
                      Guardar Receta
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                        {recipeCost.recipeItems.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-brand-brown/60 text-xs">
                              Esta receta no tiene ingredientes. Haz clic en "Editar Receta" para agregarlos.
                            </td>
                          </tr>
                        ) : (
                          recipeCost.recipeItems.map((item, idx) => (
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
                          ))
                        )}
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
                </>
              )}
            </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
