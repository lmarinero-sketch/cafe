import React, { useState } from 'react';
import {
  Award,
  Gift,
  Check,
  Sparkles,
  UserCheck,
  Plus,
  X,
  Pencil,
  Trash2,
  Coins,
  Search,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Reward } from '../types';
import { formatCurrency } from '../utils/currency';

export const RewardsPage: React.FC = () => {
  const {
    rewards,
    customers,
    redeemReward,
    addReward,
    updateRewardData,
    deleteRewardData,
    isLoadingRewards,
  } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pointsCost: 250,
    category: 'Cafetería',
    isAvailable: true,
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Parity rule: 100 points = $1,000 ($10 = 1 pt)
  const POINTS_PARITY_RATIO = 10;
  const pointsToCashEquivalent = (pts: number) => pts * POINTS_PARITY_RATIO;

  const handleRedeem = async (rewardId: string) => {
    if (!selectedCustomer) return;
    await redeemReward(selectedCustomer.id, rewardId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingReward) {
      await updateRewardData(editingReward.id, formData);
      setEditingReward(null);
    } else {
      await addReward(formData);
    }
    setIsModalOpen(false);
    setFormData({ name: '', description: '', pointsCost: 250, category: 'Cafetería', isAvailable: true });
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description,
      pointsCost: reward.pointsCost,
      category: reward.category,
      isAvailable: reward.isAvailable,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteRewardData(id);
    setConfirmDeleteId(null);
  };

  // Filter rewards
  const filteredRewards = rewards.filter((r) => {
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoriesList = ['all', 'Cafetería', 'Pastelería', 'Descuentos', 'Combos', 'Merchandising'];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner & Club Parity */}
      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-700" /> Plan Fidelización
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 flex items-center gap-1 shadow-xs">
              <Coins className="w-3 h-3 text-amber-700" /> Paridad Oficial: 100 Pts = $1.000 Consumidos ($10 = 1 pt)
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark font-serif">
            Catálogo de Recompensas & Canjes
          </h2>
          <p className="text-xs text-brand-brown/90 max-w-2xl leading-relaxed">
            Gestioná los beneficios canjeables del Club de Puntos. Los socios acumulan 1 punto por cada $10 consumidos en cualquier modalidad y pueden redimirlos directamente en caja o salón.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingReward(null);
            setFormData({ name: '', description: '', pointsCost: 250, category: 'Cafetería', isAvailable: true });
            setIsModalOpen(true);
          }}
          className="py-2.5 px-4 rounded-xl bg-brand-brown hover:bg-brand-dark text-white font-extrabold text-xs transition-colors shadow-soft flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 text-brand-yellow" />
          Nueva Recompensa
        </button>
      </div>

      {/* Customer Selector Bar for Instant Redemption Test */}
      <div className="bg-brand-card p-5 rounded-2xl border border-brand-secondary shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-cream border border-brand-secondary flex items-center justify-center text-brand-brown shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-brand-dark">Socio Seleccionado para Canje:</h4>
            <p className="text-[11px] text-brand-brown/80">
              Elegí un socio para verificar qué premios puede canjear con su saldo actual
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCustomer ? selectedCustomer.id : ''}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full sm:w-72 px-3.5 py-2.5 rounded-xl border border-brand-secondary bg-brand-bg text-xs font-extrabold text-brand-dark focus:outline-none shadow-xs"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} ({c.points} pts - Nivel {c.level})
              </option>
            ))}
          </select>

          {selectedCustomer && (
            <div className="bg-emerald-50 border border-emerald-300 px-3.5 py-2 rounded-xl text-xs font-extrabold text-emerald-950 shrink-0 flex items-center gap-1.5 shadow-xs">
              <span>⭐ {selectedCustomer.points} pts</span>
              <span className="text-[10px] text-emerald-700 font-normal">
                ({formatCurrency(pointsToCashEquivalent(selectedCustomer.points))})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-brown text-brand-card shadow-soft'
                  : 'bg-brand-card text-brand-dark border border-brand-secondary hover:bg-brand-secondary/40'
              }`}
            >
              {cat === 'all' ? 'Todos los Premios' : cat}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-brand-brown/60 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar recompensa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-brand-secondary bg-brand-card text-xs font-bold text-brand-dark focus:outline-none"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoadingRewards && (
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-12 shadow-soft text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-brand-secondary/40 rounded w-1/4 mx-auto"></div>
            <div className="h-3 bg-brand-secondary/30 rounded w-1/3 mx-auto"></div>
          </div>
          <p className="text-xs text-brand-brown/70 mt-3 font-bold">Cargando catálogo de recompensas...</p>
        </div>
      )}

      {/* Rewards Catalog Grid */}
      {!isLoadingRewards && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredRewards.map((r) => {
            const canAfford = selectedCustomer ? selectedCustomer.points >= r.pointsCost : false;
            const pointsDiff = selectedCustomer ? r.pointsCost - selectedCustomer.points : r.pointsCost;

            return (
              <div
                key={r.id}
                className={`bg-brand-card rounded-2xl border p-5 shadow-soft space-y-4 flex flex-col justify-between transition-all duration-200 ${
                  canAfford
                    ? 'border-emerald-500/60 ring-1 ring-emerald-500/20 hover:shadow-soft-lg'
                    : 'border-brand-secondary hover:border-brand-brown/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-brown bg-brand-cream px-2.5 py-1 rounded-md border border-brand-secondary/70">
                      {r.category}
                    </span>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-amber-950 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 inline-block font-mono">
                        ⭐ {r.pointsCost} pts
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-brand-dark font-serif">{r.name}</h3>
                    <p className="text-xs text-brand-brown/80 leading-relaxed mt-1">{r.description}</p>
                  </div>

                  <div className="bg-brand-cream/80 p-2 rounded-xl border border-brand-secondary/50 text-[11px] flex items-center justify-between text-brand-brown">
                    <span>Equivalencia oficial:</span>
                    <strong className="text-brand-dark">{formatCurrency(pointsToCashEquivalent(r.pointsCost))}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-brand-secondary/60 space-y-2">
                  <button
                    onClick={() => handleRedeem(r.id)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      canAfford
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-soft'
                        : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <Gift className="w-4 h-4 text-brand-yellow" />
                    {canAfford ? 'Canjear Premio' : `Faltan ${pointsDiff} pts`}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEdit(r)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-brand-bg border border-brand-secondary text-brand-dark font-bold text-[11px] hover:bg-brand-secondary/40 transition-colors flex items-center justify-center gap-1"
                    >
                      <Pencil className="w-3 h-3" /> Editar
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(r.id)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[11px] hover:bg-rose-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Create/Edit Reward */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border-2 border-brand-brown p-6 max-w-md w-full shadow-soft-lg space-y-4">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <h3 className="text-base font-extrabold text-brand-dark font-serif">
                {editingReward ? 'Editar Recompensa' : 'Nueva Recompensa del Club'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-extrabold text-brand-dark mb-1">Nombre del Premio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Capuchino con Arte Latte"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-bold text-brand-dark"
                />
              </div>

              <div>
                <label className="block font-extrabold text-brand-dark mb-1">Descripción</label>
                <textarea
                  placeholder="Detalle de lo que incluye el premio..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs resize-none h-16"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-brand-dark mb-1">Costo en Puntos *</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    required
                    value={formData.pointsCost}
                    onChange={(e) => setFormData({ ...formData, pointsCost: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-extrabold text-sm text-brand-dark"
                  />
                  <span className="text-[10px] text-brand-brown/80 mt-1 block">
                    Equivale a {formatCurrency(pointsToCashEquivalent(formData.pointsCost))}
                  </span>
                </div>

                <div>
                  <label className="block font-extrabold text-brand-dark mb-1">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-bold text-brand-dark"
                  >
                    <option value="Cafetería">Cafetería</option>
                    <option value="Pastelería">Pastelería</option>
                    <option value="Descuentos">Descuentos</option>
                    <option value="Combos">Combos</option>
                    <option value="Merchandising">Merchandising</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark hover:bg-brand-secondary/30 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-brown hover:bg-brand-dark text-white font-extrabold text-xs transition shadow-soft flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Guardar Recompensa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border-2 border-rose-500 p-6 max-w-sm w-full shadow-soft-lg space-y-4 text-center">
            <h3 className="text-base font-extrabold text-brand-dark">¿Eliminar recompensa?</h3>
            <p className="text-xs text-brand-brown/80">Esta acción retirará el premio del catálogo de canjes del Club.</p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark hover:bg-brand-secondary/30 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-700 text-white font-extrabold text-xs hover:bg-rose-800 transition shadow-soft"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
