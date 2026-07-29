import React from 'react';
import { Lock, Sparkles, X, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PlanType } from '../../types';

export const FeatureLockModal: React.FC = () => {
  const { lockModal, closeLockModal, setPlan } = useApp();

  if (!lockModal.isOpen) return null;

  const planTitles: Record<PlanType, string> = {
    esencial: 'Plan Esencial',
    gestion: 'Plan Gestión',
    fidelizacion: 'Plan Fidelización',
  };

  const planPrices: Record<PlanType, string> = {
    esencial: '$ 100.000 / mes',
    gestion: '$ 150.000 / mes',
    fidelizacion: '$ 200.000 / mes (Incluye Sitio Web Promocional)',
  };

  const planDescriptions: Record<PlanType, string> = {
    esencial: 'Digitalización básica de carta y pedidos.',
    gestion: 'Control de costos, insumos, escandallos, margen bruto y métricas avanzadas ($ 150.000 / mes).',
    fidelizacion: 'CRM de clientes, sistema de puntos, tarjetas virtuales QR, automatizaciones y sitio web promocional bonificado ($ 200.000 / mes).',
  };

  const isGestion = lockModal.requiredPlan === 'gestion';

  const handleUpgrade = () => {
    setPlan(lockModal.requiredPlan);
    closeLockModal();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 max-w-md w-full shadow-soft-lg relative overflow-hidden">
        {/* Top Banner Accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-yellow/30 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={closeLockModal}
          className="absolute top-4 right-4 text-brand-dark/50 hover:text-brand-dark p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-brand-yellow/20 border border-brand-yellow flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6 text-brand-brown" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-brown/80">
              Módulo Restringido
            </span>
            <h3 className="text-lg font-bold text-brand-dark">
              {lockModal.featureName || 'Función Bloqueada'}
            </h3>
          </div>
        </div>

        <div className="bg-brand-bg/60 rounded-xl p-4 border border-brand-secondary/60 mb-6">
          <p className="text-sm font-semibold text-brand-dark mb-1">
            {isGestion
              ? 'Esta función está disponible desde el Plan Gestión'
              : 'Esta función está disponible en el Plan Fidelización'}
          </p>
          <p className="text-xs text-brand-brown/90 leading-relaxed">
            {planDescriptions[lockModal.requiredPlan]}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleUpgrade}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-brand-brown text-brand-card font-semibold text-sm hover:bg-brand-dark transition-all duration-200 shadow-soft flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-brand-yellow" />
            Mejorar a {planTitles[lockModal.requiredPlan]}
          </button>
          <button
            onClick={closeLockModal}
            className="w-full sm:w-auto py-3 px-4 rounded-xl border border-brand-secondary text-brand-dark font-medium text-sm hover:bg-brand-secondary/30 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
