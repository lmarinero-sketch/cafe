import React from 'react';
import { Smartphone, LogOut, ShieldCheck, Clock, Menu } from 'lucide-react';
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

  const handleToggleSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Hamburger (Mobile only) + Brand Logo */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSidebar}
            className="lg:hidden p-1.5 rounded-xl bg-brand-bg text-brand-dark hover:bg-brand-secondary/40 border border-brand-secondary/70 transition shrink-0"
            title="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <img
              src="/logo_hilos_de_amor.jpg"
              alt="Hilos de Amor"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-brand-secondary object-cover shadow-xs"
            />
            <span className="font-extrabold text-brand-dark text-sm sm:text-base font-serif tracking-tight truncate max-w-[130px] sm:max-w-none">
              Hilos de Amor
            </span>
          </div>
        </div>

        {/* Center: Plan Contratado + Countdown (Desktop only) */}
        <div className="hidden lg:flex items-center gap-3">
          {subscription?.isBonified && (
            <div className="bg-emerald-50/60 hover:bg-emerald-50/90 border border-emerald-200/80 rounded-2xl px-3.5 py-1.5 flex items-center gap-3 shadow-xs transition-colors min-w-[300px]">
              <div className="w-7 h-7 rounded-lg bg-[#2F5233] text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-900">{planLabels[subscription.planId]}</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-600 text-white uppercase tracking-wider">
                      Bonificado
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Clock className="w-3 h-3 text-emerald-700" /> {daysRemaining}d restantes
                  </span>
                </div>

                <div className="w-full h-1 bg-emerald-200/70 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full bg-[#2F5233] transition-all duration-500"
                    style={{ width: `${100 - progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: User Chip & Logout Action */}
        <div className="flex items-center gap-2 shrink-0">
          {user && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-xl bg-brand-bg/80 border border-brand-secondary text-xs">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand-brown text-brand-card font-extrabold flex items-center justify-center text-[10px] shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex items-center gap-1">
                <span className="hidden sm:inline font-extrabold text-brand-dark">{user.name}</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${
                  user.role === 'admin' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                  user.role === 'cajero' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                  user.role === 'cocina' ? 'bg-orange-100 text-orange-900 border-orange-300' :
                  'bg-blue-100 text-blue-900 border-blue-300'
                }`}>
                  {user.role === 'admin' ? 'Admin' :
                   user.role === 'cajero' ? 'Cajero' :
                   user.role === 'cocina' ? 'Cocina' : 'Mozo'}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-500 hover:text-red-700 hover:bg-red-50/80 font-bold text-xs flex items-center gap-1 transition-all border border-transparent hover:border-red-200/60"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};
