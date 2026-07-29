import React, { useState } from 'react';
import { Sparkles, RotateCcw, Smartphone, ShieldCheck, Check, PlayCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PlanType } from '../../types';
import { useNavigate } from 'react-router-dom';
import { InteractiveTutorialModal } from './InteractiveTutorialModal';

export const HeaderPlanSwitcher: React.FC = () => {
  const { plan, setPlan, resetDemoData } = useApp();
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const navigate = useNavigate();

  const plans: { id: PlanType; label: string; badge?: string }[] = [
    { id: 'esencial', label: 'Plan Esencial' },
    { id: 'gestion', label: 'Plan Gestión', badge: 'Recomendado' },
    { id: 'fidelizacion', label: 'Plan Fidelización' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-brand-card/90 backdrop-blur-md border-b border-brand-secondary/80 px-4 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Commercial Plan Selector */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-brown text-brand-card flex items-center justify-center font-bold text-lg shadow-soft group-hover:scale-105 transition-transform">
              ☕
            </div>
            <div>
              <h1 className="text-base font-bold text-brand-dark leading-tight flex items-center gap-1.5">
                Café Magnolia
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-brand-secondary/50 text-brand-brown">
                  Demo
                </span>
              </h1>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] text-brand-brown/70 font-medium">Plataforma Gastronómica •</p>
                <a
                  href="https://www.growlabs.lat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-brand-brown hover:text-brand-dark hover:underline flex items-center gap-1.5"
                >
                  <span className="w-5 h-5 rounded-full overflow-hidden border border-brand-secondary inline-block shrink-0 shadow-xs bg-white">
                    <img src="/logogrow.png" alt="Grow Labs" className="w-full h-full object-cover" />
                  </span>
                  <span>Diseñado por <span className="text-emerald-800 font-extrabold">Grow Labs</span> ✨</span>
                </a>
              </div>
            </div>
          </div>

          {/* Mobile Plan Label Badge */}
          <div className="md:hidden">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-brand-yellow/30 text-brand-dark border border-brand-yellow/50">
              {plan === 'esencial' ? 'Esencial' : plan === 'gestion' ? 'Gestión' : 'Fidelización'}
            </span>
          </div>
        </div>

        {/* Plan Switcher Pills */}
        <div className="flex items-center bg-brand-bg rounded-xl p-1 border border-brand-secondary/70 shadow-inner w-full md:w-auto overflow-x-auto">
          {plans.map((p) => {
            const isActive = plan === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPlan(p.id)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-brown text-brand-card shadow-soft'
                    : 'text-brand-dark/80 hover:text-brand-dark hover:bg-brand-secondary/40'
                }`}
              >
                {isActive && <Check className="w-3.5 h-3.5 text-brand-yellow stroke-[3]" />}
                {p.label}
                {p.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      isActive ? 'bg-brand-yellow text-brand-dark' : 'bg-brand-yellow/40 text-brand-brown'
                    }`}
                  >
                    {p.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="py-1.5 px-3 rounded-lg bg-brand-yellow text-brand-dark font-extrabold text-xs flex items-center gap-1.5 transition-transform hover:scale-105 shadow-soft border border-brand-yellow/80"
          >
            <PlayCircle className="w-4 h-4 text-brand-brown fill-brand-yellow" />
            <span>Tutorial Interactivo</span>
          </button>

          {plan !== 'fidelizacion' && (
            <button
              onClick={() => navigate('/planes')}
              className="hidden sm:flex py-1.5 px-3 rounded-lg bg-brand-bg hover:bg-brand-secondary/40 text-brand-dark border border-brand-secondary font-bold text-xs items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-brown" />
              Mejorar mi plan
            </button>
          )}

          <button
            onClick={() => window.open('/menu', '_blank')}
            className="hidden sm:flex py-1.5 px-3 rounded-lg bg-brand-bg hover:bg-brand-secondary/50 text-brand-dark border border-brand-secondary font-medium text-xs items-center gap-1.5 transition-colors"
            title="Abrir vista pública del menú digital en celular"
          >
            <Smartphone className="w-3.5 h-3.5 text-brand-brown" />
            Menú Digital
          </button>

          <button
            onClick={resetDemoData}
            className="hidden md:flex py-1.5 px-3 rounded-lg text-brand-brown hover:text-brand-dark hover:bg-brand-red/20 font-medium text-xs items-center gap-1.5 transition-colors"
            title="Restablecer todos los datos ficticios originales"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reiniciar
          </button>
        </div>
      </div>

      {/* Interactive Step-by-Step Tutorial Modal */}
      <InteractiveTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </header>
  );
};
