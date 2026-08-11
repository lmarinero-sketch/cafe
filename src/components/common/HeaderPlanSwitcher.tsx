import React from 'react';
import { Smartphone, LogOut, ShieldCheck, Clock, CalendarDays, BookOpen, ExternalLink, SquarePen, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth, getBonificationDaysRemaining, getBonificationProgress } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';

export const HeaderPlanSwitcher: React.FC = () => {
  const { plan } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const subscription = user?.subscription;
  const daysRemaining = subscription ? getBonificationDaysRemaining(subscription) : 0;
  const progress = subscription ? getBonificationProgress(subscription) : 0;

  const planLabels: Record<string, string> = {
    esencial: 'Plan Esencial',
    gestion: 'Plan Gestión',
    fidelizacion: 'Plan Fidelización',
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="md:hidden">
          {/* Mobile Plan Badge placeholder if needed */}
        </div>

        {/* Plan Contratado + Countdown (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {subscription?.isBonified && (
            <div className="bg-emerald-50/60 hover:bg-emerald-50/90 border border-emerald-200/80 rounded-2xl px-3.5 py-2 flex items-center gap-3.5 shadow-xs transition-colors min-w-[310px]">
              <div className="w-8 h-8 rounded-xl bg-[#2F5233] text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-900">{planLabels[subscription.planId]}</span>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-600 text-white uppercase tracking-wider shadow-xs">
                      Bonificado
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Clock className="w-3 h-3 text-emerald-700" /> {daysRemaining}d restantes
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mt-1">
                  <span>Pagás {planLabels[subscription.payingPlanId]} ({formatCurrency(subscription.monthlyPrice)}/mes)</span>
                </div>

                <div className="w-full h-1.5 bg-emerald-200/70 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full rounded-full bg-[#2F5233] transition-all duration-500"
                    style={{ width: `${100 - progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 flex-wrap">

          <button
            onClick={handleLogout}
            className="py-2 px-3 rounded-xl text-slate-500 hover:text-red-700 hover:bg-red-50/80 font-semibold text-xs flex items-center gap-1.5 transition-all border border-transparent hover:border-red-200/60"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>

      {/* Mobile Plan Countdown */}
      {subscription?.isBonified && (
        <div className="md:hidden mt-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200/80 p-2.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#2F5233] text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 justify-between">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-900">{planLabels[subscription.planId]}</span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-600 text-white uppercase">
                  Bonificado
                </span>
              </div>
              <span className="text-[10px] text-emerald-800 font-bold">{daysRemaining} días restantes</span>
            </div>
            <div className="w-full h-1 bg-emerald-200 rounded-full overflow-hidden mt-1.5">
              <div className="h-full rounded-full bg-[#2F5233]" style={{ width: `${100 - progress}%` }} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
