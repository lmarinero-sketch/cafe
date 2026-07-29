import React, { useState } from 'react';
import { Award, Gift, Check, Sparkles, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/currency';

export const RewardsPage: React.FC = () => {
  const { rewards, customers, redeemReward } = useApp();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleRedeem = (rewardId: string) => {
    if (!selectedCustomerId) return;
    redeemReward(selectedCustomerId, rewardId);
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

      {/* Rewards Catalog Grid */}
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
                  <span className="text-xs font-extrabold text-brand-brown bg-brand-yellow/40 px-2 py-0.5 rounded">
                    {r.pointsCost} pts
                  </span>
                </div>

                <h3 className="text-sm font-bold text-brand-dark mt-1">{r.name}</h3>
                <p className="text-xs text-brand-brown/80 leading-relaxed">{r.description}</p>
              </div>

              <div className="pt-3 border-t border-brand-secondary/60">
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
