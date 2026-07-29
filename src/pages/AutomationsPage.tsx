import React from 'react';
import { Zap, Play, Pause, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AutomationsPage: React.FC = () => {
  const { automations, toggleAutomation } = useApp();

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
          <h2 className="text-2xl font-extrabold text-brand-dark">Automatizaciones de Marketing</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Flujos automáticos activados por eventos (Registro, Cumpleaños, Inactividad, Saldo de Puntos)
          </p>
        </div>
      </div>

      {/* Automations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automations.map((aut) => (
          <div
            key={aut.id}
            className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown bg-brand-cream px-2 py-0.5 rounded border border-brand-secondary/60">
                  {aut.segment}
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                    aut.status === 'activa'
                      ? 'bg-brand-green/30 text-emerald-950 border-brand-green'
                      : 'bg-brand-yellow/40 text-brand-dark border-brand-yellow'
                  }`}
                >
                  {aut.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-brand-dark">{aut.name}</h3>
              <p className="text-[11px] text-brand-brown/80">⚡ Disparador: {aut.condition}</p>

              <div className="p-3 bg-brand-bg rounded-xl border border-brand-secondary/60 text-brand-dark leading-relaxed">
                "{aut.message}"
              </div>
            </div>

            <div className="pt-3 border-t border-brand-secondary/60 flex items-center justify-between text-xs">
              <span className="text-[10px] text-brand-brown font-bold">
                Ejecutados: {aut.executedCount} envíos
              </span>

              <button
                onClick={() => toggleAutomation(aut.id)}
                className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors ${
                  aut.status === 'activa'
                    ? 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40 border border-brand-secondary'
                    : 'bg-brand-brown text-brand-card hover:bg-brand-dark'
                }`}
              >
                {aut.status === 'activa' ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-brand-yellow" /> Activar
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
