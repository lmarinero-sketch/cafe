import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from 'lucide-react';

interface ModuleOnboardingProps {
  title: string;
  subtitle: string;
  steps: string[];
  requiredPlan?: 'esencial' | 'gestion' | 'fidelizacion';
}

export const ModuleOnboardingBanner: React.FC<ModuleOnboardingProps> = ({
  title,
  subtitle,
  steps,
  requiredPlan,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const planBadges = {
    esencial: { label: 'Plan Esencial', color: 'bg-brand-secondary/60 text-brand-dark' },
    gestion: { label: 'Plan Gestión', color: 'bg-brand-yellow/40 text-brand-dark border border-brand-yellow' },
    fidelizacion: { label: 'Plan Fidelización', color: 'bg-brand-green/30 text-emerald-950 border border-brand-green' },
  };

  return (
    <div className="bg-brand-card rounded-2xl border border-brand-secondary/90 p-4 shadow-soft space-y-3 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-yellow/30 border border-brand-yellow flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5 text-brand-brown" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-dark">
                Guía de Uso: {title}
              </h3>
              {requiredPlan && (
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${planBadges[requiredPlan].color}`}>
                  {planBadges[requiredPlan].label}
                </span>
              )}
            </div>
            <p className="text-[11px] text-brand-brown/80 font-medium">{subtitle}</p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg text-brand-dark/70 hover:text-brand-dark hover:bg-brand-bg transition-colors flex items-center gap-1 text-xs font-bold"
        >
          <span>{isOpen ? 'Ocultar guía' : 'Ver guía'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="pt-2 border-t border-brand-secondary/60 animate-fade-in">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand-brown mb-2">
            💡 ¿Qué hacer en este módulo y cómo hacerlo paso a paso?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {steps.map((stepText, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-brand-cream border border-brand-secondary/70 flex items-start gap-2 text-xs"
              >
                <span className="w-5 h-5 rounded-full bg-brand-brown text-brand-card font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-[11px] text-brand-dark leading-relaxed font-medium">
                  {stepText}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
