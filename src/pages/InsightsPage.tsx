import React from 'react';
import { Lightbulb, AlertTriangle, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/currency';

export const InsightsPage: React.FC = () => {
  const { insights } = useApp();

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
          <h2 className="text-2xl font-extrabold text-brand-dark">Insights & Oportunidades Detectadas</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Recomendaciones automáticas basadas en reglas para maximizar la rentabilidad del negocio
          </p>
        </div>
      </div>

      {/* Insights List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft space-y-3 flex flex-col justify-between hover:border-brand-brown/40 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                    ins.type === 'alert'
                      ? 'bg-brand-red/30 text-rose-900 border-brand-red'
                      : ins.type === 'opportunity'
                      ? 'bg-brand-yellow/40 text-brand-dark border-brand-yellow'
                      : 'bg-brand-green/30 text-emerald-950 border-brand-green'
                  }`}
                >
                  {ins.type === 'alert' ? '🚨 Alerta' : ins.type === 'opportunity' ? '💡 Oportunidad' : '📈 Rendimiento'}
                </span>
                <span className="text-[10px] text-brand-brown/70">{formatDate(ins.date)}</span>
              </div>

              <h3 className="text-sm font-bold text-brand-dark">{ins.title}</h3>
              <p className="text-xs text-brand-brown/90 leading-relaxed">{ins.description}</p>
            </div>

            <div className="pt-3 border-t border-brand-secondary/60 flex items-center justify-between">
              {ins.metric && (
                <span className="text-xs font-extrabold text-brand-brown bg-brand-cream px-2.5 py-1 rounded-lg border border-brand-secondary/60">
                  {ins.metric}
                </span>
              )}
              {ins.actionText && (
                <button className="py-1.5 px-3 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors flex items-center gap-1">
                  {ins.actionText} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
