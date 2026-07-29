import React, { useState } from 'react';
import { CreditCard, QrCode, Share2, Wallet, Gift, Award, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

export const VirtualCardsPage: React.FC = () => {
  const { customers } = useApp();
  const { showToast } = useToast();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');

  const customer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const handleWalletAction = (actionName: string) => {
    showToast(`Acción simulada: ${actionName}`, `Se ejecutó "${actionName}" para la tarjeta de ${customer.firstName}.`, 'success');
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
          <h2 className="text-2xl font-extrabold text-brand-dark">Tarjeta Virtual de Socio Digital</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Visualizador de credencial digital optimizada para Apple Wallet y Google Wallet
          </p>
        </div>

        {/* Customer Switcher */}
        <select
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl border border-brand-secondary bg-brand-card font-bold text-xs text-brand-dark focus:outline-none shadow-soft"
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName} (Nivel {c.level})
            </option>
          ))}
        </select>
      </div>

      {/* Main Virtual Card Mobile Display */}
      {customer && (
        <div className="max-w-md mx-auto space-y-6">
          {/* DIGITAL CARD GRAPHIC CONTAINER */}
          <div className="bg-gradient-to-br from-[#1A2E1E] via-[#2F5233] to-[#1A2E1E] rounded-3xl p-6 text-brand-card shadow-soft-lg border-2 border-brand-yellow/40 space-y-6 relative overflow-hidden transform hover:scale-[1.01] transition-transform">
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-44 h-44 bg-brand-yellow/20 rounded-full blur-3xl pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-brand-yellow shrink-0 bg-white">
                  <img src="/logo_hilos_de_amor.jpg" alt="Hilos de Amor" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight font-serif">Hilos de Amor</h3>
                  <p className="text-[10px] text-brand-yellow font-semibold uppercase tracking-wider">
                    Socio VIP Club
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-yellow text-brand-dark uppercase tracking-wider shadow-xs">
                Nivel {customer.level}
              </span>
            </div>

            {/* Member Info & Points */}
            <div className="space-y-1">
              <span className="text-[10px] text-brand-secondary uppercase tracking-widest block">
                Titular de la tarjeta
              </span>
              <h2 className="text-xl font-extrabold tracking-wide">
                {customer.firstName} {customer.lastName}
              </h2>
              <p className="text-xs font-mono text-brand-secondary/90">Nº Socio: #{customer.id}</p>
            </div>

            {/* QR Code Graphic & Points Balance */}
            <div className="bg-brand-card/10 backdrop-blur-md rounded-2xl p-4 border border-brand-secondary/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-brand-yellow font-bold uppercase tracking-wider block">
                  Puntos Disponibles
                </span>
                <h3 className="text-2xl font-extrabold text-brand-card mt-0.5">
                  ⭐ {customer.points} <span className="text-xs font-normal text-brand-secondary">pts</span>
                </h3>
                <p className="text-[10px] text-brand-secondary mt-1">
                  Próxima recompensa a los 500 pts
                </p>
              </div>

              {/* Mock QR */}
              <div className="w-16 h-16 bg-white p-1.5 rounded-xl shadow-xs shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect x="0" y="0" width="100" height="100" fill="#FFFFFF" />
                  <rect x="10" y="10" width="30" height="30" fill="#4A352C" />
                  <rect x="60" y="10" width="30" height="30" fill="#4A352C" />
                  <rect x="10" y="60" width="30" height="30" fill="#4A352C" />
                  <rect x="45" y="45" width="20" height="20" fill="#765747" />
                </svg>
              </div>
            </div>
          </div>

          {/* SIMULATED ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleWalletAction('Agregar a Billetera (Apple/Google)')}
              className="py-3 px-4 rounded-2xl bg-brand-card border border-brand-secondary hover:border-brand-brown/50 text-brand-dark font-bold text-xs shadow-soft flex items-center justify-center gap-2 transition-all"
            >
              <Wallet className="w-4 h-4 text-brand-brown" />
              Agregar a billetera
            </button>

            <button
              onClick={() => handleWalletAction('Ver Recompensas')}
              className="py-3 px-4 rounded-2xl bg-brand-card border border-brand-secondary hover:border-brand-brown/50 text-brand-dark font-bold text-xs shadow-soft flex items-center justify-center gap-2 transition-all"
            >
              <Gift className="w-4 h-4 text-brand-brown" />
              Ver recompensas
            </button>

            <button
              onClick={() => handleWalletAction('Usar Beneficio en Caja')}
              className="py-3 px-4 rounded-2xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark shadow-soft flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-brand-yellow" />
              Usar beneficio
            </button>

            <button
              onClick={() => handleWalletAction('Compartir Tarjeta')}
              className="py-3 px-4 rounded-2xl bg-brand-card border border-brand-secondary hover:border-brand-brown/50 text-brand-dark font-bold text-xs shadow-soft flex items-center justify-center gap-2 transition-all"
            >
              <Share2 className="w-4 h-4 text-brand-brown" />
              Compartir tarjeta
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
