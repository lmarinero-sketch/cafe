import React, { useState } from 'react';
import { Award, Gift, Check, Sparkles, UserCheck, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Reward } from '../types';
import { formatCurrency } from '../utils/currency';

export const RewardsPage: React.FC = () => {
  const { rewards, customers, redeemReward, addReward, updateRewardData, deleteRewardData, isLoadingRewards } = useApp();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
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

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleRedeem = async (rewardId: string) => {
    if (!selectedCustomerId) return;
    await redeemReward(selectedCustomerId, rewardId);
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

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Banner */}
      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-brand-green/30 px-2 py-0.5 rounded">
              Plan Fidelización
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-brand-dark">Puntos & Catálogo de Recompensas</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Configuración del programa de lealtad y canje simulado de premios en caja
          </p>
        </div>

        <button
          onClick={() => {
            setEditingReward(null);
            setFormData({ name: '', description: '', pointsCost: 250, category: 'Cafetería', isAvailable: true });
            setIsModalOpen(true);
          }}
          className="py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-all duration-200 shadow-soft flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-brand-yellow" />
          Nueva recompensa
        </button>
      </div>

      {/* Customer selector bar for simulating reward redemption */}
      <div className="bg-brand-card p-5 rounded-2xl border border-brand-secondary shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <UserCheck className="w-5 h-5 text-brand-brown" />
          <div>
            <h4 className="text-xs font-bold text-brand-dark">Simular Canje para Cliente:</h4>
            <p className="text-[11px] text-brand-brown/80">Seleccioná un socio de la lista para probar la redención</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs font-bold text-brand-dark focus:outline-none"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} ({c.points} pts - Nivel {c.level})
              </option>
            ))}
          </select>

          {selectedCustomer && (
            <div className="bg-brand-yellow/30 px-3 py-1.5 rounded-xl border border-brand-yellow text-xs font-extrabold text-brand-dark shrink-0">
              ⭐ {selectedCustomer.points} pts
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoadingRewards && (
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-8 shadow-soft text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-brand-secondary/40 rounded w-1/3 mx-auto"></div>
            <div className="h-3 bg-brand-secondary/30 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-xs text-brand-brown/70 mt-3">Cargando recompensas...</p>
        </div>
      )}

      {/* Rewards Catalog Grid */}
      {!isLoadingRewards && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rewards.map((r) => {
            const canAfford = selectedCustomer ? selectedCustomer.points >= r.pointsCost : false;
            return (
              <div
                key={r.id}
                className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft space-y-3 flex flex-col justify-between hover:border-brand-brown/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown bg-brand-cream px-2 py-0.5 rounded border border-brand-secondary/60">
                      {r.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-extrabold text-brand-brown bg-brand-yellow/40 px-2 py-0.5 rounded">
                        {r.pointsCost} pts
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-brand-dark mt-1">{r.name}</h3>
                  <p className="text-xs text-brand-brown/80 leading-relaxed">{r.description}</p>
                </div>

                <div className="pt-3 border-t border-brand-secondary/60 space-y-2">
                  <button
                    onClick={() => handleRedeem(r.id)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      canAfford
                        ? 'bg-brand-brown text-brand-card hover:bg-brand-dark shadow-soft'
                        : 'bg-brand-bg text-brand-dark/40 border border-brand-secondary/40 cursor-not-allowed'
                    }`}
                  >
                    <Gift className="w-4 h-4 text-brand-yellow" />
                    {canAfford ? 'Canjear Premio' : 'Puntos insuficientes'}
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
                      className="flex-1 py-1.5 px-2 rounded-lg bg-red-50 border border-red-200 text-red-700 font-bold text-[11px] hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 max-w-md w-full shadow-soft-lg space-y-4">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <h3 className="text-base font-bold text-brand-dark">
                {editingReward ? 'Editar Recompensa' : 'Nueva Recompensa'}
              </h3>
              <button
                onClick={() => { setIsModalOpen(false); setEditingReward(null); }}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-brand-dark mb-1">Nombre del beneficio</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Café Espresso Gratis"
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del beneficio..."
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Costo en Puntos</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.pointsCost}
                    onChange={(e) => setFormData({ ...formData, pointsCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none font-bold"
                  >
                    <option value="Cafetería">Cafetería</option>
                    <option value="Pastelería">Pastelería</option>
                    <option value="Descuentos">Descuentos</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Promociones">Promociones</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="rounded"
                />
                <label className="font-bold text-brand-dark">Disponible para canje</label>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold hover:bg-brand-dark transition-colors"
                >
                  {editingReward ? 'Guardar cambios' : 'Crear recompensa'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingReward(null); }}
                  className="py-2.5 px-4 rounded-xl border border-brand-secondary font-bold text-brand-dark hover:bg-brand-secondary/30"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 max-w-sm w-full shadow-soft-lg space-y-4">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <h3 className="text-base font-bold text-brand-dark">¿Eliminar recompensa?</h3>
            </div>
            <p className="text-xs text-brand-brown">
              Esta acción eliminará la recompensa del catálogo permanentemente.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors text-xs"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-brand-secondary font-bold text-brand-dark hover:bg-brand-secondary/30 text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
