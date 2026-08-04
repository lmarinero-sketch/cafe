import React from 'react';
import { Smartphone, LogOut, ShieldCheck, Clock, CalendarDays, BookOpen, ExternalLink } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-brand-card/90 backdrop-blur-md border-b border-brand-secondary/80 px-4 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-brown shadow-soft group-hover:scale-105 transition-transform bg-white shrink-0">
              <img src="/logo_hilos_de_amor.jpg" alt="Hilos de Amor" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-brand-dark leading-tight flex items-center gap-1.5 font-serif">
                {user?.name || 'Hilos de Amor'}
              </h1>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] text-brand-brown font-semibold">Pastelería y Encordado •</p>
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

          {/* Mobile Plan Badge */}
          <div className="md:hidden">
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
              {planLabels[plan] || 'Fidelización'}
            </span>
          </div>
        </div>

        {/* Plan Contratado + Countdown (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {subscription?.isBonified && (
            <div className="bg-brand-bg rounded-xl border border-brand-secondary p-2.5 flex items-center gap-3 min-w-[280px]">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-brand-dark">{planLabels[subscription.planId]}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                    Bonificado
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-brand-brown">
                    Pagás {planLabels[subscription.payingPlanId]} {formatCurrency(subscription.monthlyPrice)}/mes
                  </span>
                </div>
                <div className="mt-1.5">
                  <div className="flex items-center justify-between text-[10px] mb-0.5">
                    <span className="font-bold text-brand-dark flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {daysRemaining} días restantes
                    </span>
                    <span className="text-brand-brown flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" /> {subscription.endDate.split('-').reverse().join('/')}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-brand-secondary/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${100 - progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate('/editor-web')}
            className="hidden sm:flex py-1.5 px-3 rounded-lg bg-brand-yellow text-brand-dark font-bold text-xs items-center gap-1.5 transition-colors hover:bg-brand-yellow/80 border border-brand-yellow/80"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-brown" />
            Editor Web
          </button>

          <button
            onClick={() => window.open('/sitio-promocional', '_blank')}
            className="hidden sm:flex py-1.5 px-3 rounded-lg bg-brand-bg hover:bg-brand-secondary/40 text-brand-dark border border-brand-secondary font-bold text-xs items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-brown" />
            Ver Sitio Web
          </button>

          <button
            onClick={() => window.open('/menu', '_blank')}
            className="hidden sm:flex py-1.5 px-3 rounded-lg bg-brand-bg hover:bg-brand-secondary/50 text-brand-dark border border-brand-secondary font-medium text-xs items-center gap-1.5 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-brand-brown" />
            Menú Digital
          </button>

          <button
            onClick={handleLogout}
            className="py-1.5 px-3 rounded-lg text-brand-brown hover:text-red-700 hover:bg-red-50 font-medium text-xs flex items-center gap-1.5 transition-colors border border-transparent hover:border-red-200"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>

      {/* Mobile Plan Countdown */}
      {subscription?.isBonified && (
        <div className="md:hidden mt-2 bg-brand-bg rounded-xl border border-brand-secondary p-2.5 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-brand-dark">{planLabels[subscription.planId]}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Bonificado
              </span>
              <span className="text-[10px] text-brand-brown font-bold ml-auto">{daysRemaining} días</span>
            </div>
            <div className="w-full h-1 bg-brand-secondary/50 rounded-full overflow-hidden mt-1">
              <div className="h-full rounded-full bg-emerald-600" style={{ width: `${100 - progress}%` }} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
