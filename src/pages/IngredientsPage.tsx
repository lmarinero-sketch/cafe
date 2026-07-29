import React, { useState } from 'react';
import { Plus, Search, Edit, Apple, AlertTriangle, ArrowUpDown, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Ingredient, IngredientUnit } from '../types';
import { formatCurrency, formatDate } from '../utils/currency';

export const IngredientsPage: React.FC = () => {
  const {
    ingredients,
    addIngredient,
    updateIngredientPrice,
    autoPriceUpdate,
    setAutoPriceUpdate,
    affectedProductsAlert,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPriceIng, setEditingPriceIng] = useState<Ingredient | null>(null);
  const [newPriceInput, setNewPriceInput] = useState<number>(24000);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Cafetería',
    purchaseUnit: 'kilogramo' as IngredientUnit,
    usageUnit: 'gramo' as IngredientUnit,
    purchaseQty: 1,
    purchasePrice: 24000,
    supplier: 'Proveedor Central',
    wastePercentage: 3,
  });

  const filteredIngredients = ingredients.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdatePrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriceIng) return;
    updateIngredientPrice(editingPriceIng.id, newPriceInput);
    setEditingPriceIng(null);
  };

  const handleCreateIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.purchasePrice) return;
    addIngredient(formData);
    setIsModalOpen(false);
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
          <h2 className="text-2xl font-extrabold text-brand-dark">Ingredientes & Insumos</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Control de materias primas, mermas y normalización de costos por unidad de uso ({ingredients.length} insumos)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto price update toggle button */}
          <button
            onClick={() => setAutoPriceUpdate(!autoPriceUpdate)}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
              autoPriceUpdate
                ? 'bg-brand-green/30 text-emerald-950 border-brand-green'
                : 'bg-brand-yellow/40 text-brand-dark border-brand-yellow'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>{autoPriceUpdate ? 'Modo: Recálculo Automático' : 'Modo: Revisión Manual'}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-all duration-200 shadow-soft flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4 text-brand-yellow" />
            Nuevo ingrediente
          </button>
        </div>
      </div>

      {/* Affected products alert box */}
      {affectedProductsAlert.length > 0 && (
        <div className="bg-brand-yellow/30 border border-brand-yellow p-4 rounded-2xl flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-brand-dark">
              Última actualización impactó en {affectedProductsAlert.length} productos:
            </h4>
            <p className="text-brand-brown/90 mt-0.5">
              {affectedProductsAlert.join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-brand-brown/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ingrediente o categoría..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Ingredients Table */}
      <div className="bg-brand-card rounded-2xl border border-brand-secondary shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-brand-cream border-b border-brand-secondary/80 text-brand-dark uppercase tracking-wider text-[10px] font-extrabold">
                <th className="p-3.5">Ingrediente</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Unidad Compra</th>
                <th className="p-3.5">Precio Compra</th>
                <th className="p-3.5">Proveedor</th>
                <th className="p-3.5">Merma</th>
                <th className="p-3.5">Costo Normalizado</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-secondary/60">
              {filteredIngredients.map((ing) => (
                <tr key={ing.id} className="hover:bg-brand-bg/50 transition-colors">
                  <td className="p-3.5 font-bold text-brand-dark">{ing.name}</td>
                  <td className="p-3.5 text-brand-brown/80">{ing.category}</td>
                  <td className="p-3.5 text-brand-dark">
                    {ing.purchaseQty} {ing.purchaseUnit}
                  </td>
                  <td className="p-3.5 font-extrabold text-brand-brown">
                    {formatCurrency(ing.purchasePrice)}
                  </td>
                  <td className="p-3.5 text-brand-brown/80">{ing.supplier}</td>
                  <td className="p-3.5 font-bold text-rose-800">{ing.wastePercentage}%</td>
                  <td className="p-3.5 font-extrabold text-emerald-900 bg-brand-green/20 rounded">
                    ${ing.normalizedCost.toFixed(2)} / {ing.usageUnit}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        setEditingPriceIng(ing);
                        setNewPriceInput(ing.purchasePrice);
                      }}
                      className="py-1 px-2.5 rounded-lg bg-brand-bg border border-brand-secondary text-brand-brown hover:text-brand-dark text-[11px] font-bold transition-colors"
                    >
                      Actualizar precio
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Price Modal */}
      {editingPriceIng && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 max-w-sm w-full space-y-4 shadow-soft-lg">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <h3 className="text-base font-bold text-brand-dark">Actualizar Precio de Compra</h3>
              <button
                onClick={() => setEditingPriceIng(null)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePrice} className="space-y-3 text-xs">
              <p className="font-bold text-brand-dark">{editingPriceIng.name}</p>
              <p className="text-brand-brown/80">
                Unidad: {editingPriceIng.purchaseQty} {editingPriceIng.purchaseUnit}
              </p>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Nuevo precio de compra ($ ARS)</label>
                <input
                  type="number"
                  required
                  value={newPriceInput}
                  onChange={(e) => setNewPriceInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-extrabold text-sm focus:outline-none"
                />
              </div>

              <div className="bg-brand-cream p-2.5 rounded-xl border border-brand-secondary/60 text-[11px] text-brand-brown">
                💡 El costo normalizado se recalculará automáticamente. Todos los productos vinculados serán notificados.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold hover:bg-brand-dark transition-colors"
                >
                  Guardar cambio
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPriceIng(null)}
                  className="py-2.5 px-4 rounded-xl border border-brand-secondary font-bold text-brand-dark hover:bg-brand-secondary/30"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Ingredient */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 max-w-md w-full shadow-soft-lg space-y-4">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <h3 className="text-base font-bold text-brand-dark">Nuevo Ingrediente</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIngredient} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-brand-dark mb-1">Nombre del ingrediente</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Café en Grano Arábica"
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Unidad de compra</label>
                  <select
                    value={formData.purchaseUnit}
                    onChange={(e) => setFormData({ ...formData, purchaseUnit: e.target.value as IngredientUnit })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                  >
                    <option value="kilogramo">Kilogramo (kg)</option>
                    <option value="litro">Litro (l)</option>
                    <option value="docena">Docena</option>
                    <option value="unidad">Unidad</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-brand-dark mb-1">Unidad de uso</label>
                  <select
                    value={formData.usageUnit}
                    onChange={(e) => setFormData({ ...formData, usageUnit: e.target.value as IngredientUnit })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                  >
                    <option value="gramo">Gramo (g)</option>
                    <option value="mililitro">Mililitro (ml)</option>
                    <option value="unidad">Unidad</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Precio de compra ($ ARS)</label>
                  <input
                    type="number"
                    required
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Porcentaje de merma (%)</label>
                  <input
                    type="number"
                    value={formData.wastePercentage}
                    onChange={(e) => setFormData({ ...formData, wastePercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Proveedor</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Ej. Cafés del Sur S.A."
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold hover:bg-brand-dark transition-colors"
                >
                  Guardar ingrediente
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-brand-secondary font-bold text-brand-dark hover:bg-brand-secondary/30"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
