import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Grid,
  SquareCheckBig,
  QrCode,
  UtensilsCrossed,
  Truck,
  Apple,
  Calculator,
  BarChart3,
  Lightbulb,
  Users,
  Award,
  CreditCard,
  MessageSquare,
  Zap,
  BookOpen,
  Settings,
  Lock,
  Menu,
  X,
  Store,
  Globe,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PlanType } from '../../types';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  requiredPlan: PlanType;
  allowedRoles?: ('admin' | 'cajero' | 'mozo' | 'cocina')[];
}

export const Sidebar: React.FC = () => {
  const { plan, checkPlanAccess } = useApp();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = user?.role || 'admin';

  interface NavSection {
    title: string;
    badge?: string;
    badgePlan?: PlanType;
    items: SidebarItem[];
  }

  const navSections: NavSection[] = [
    {
      title: 'Gestión Operativa',
      items: [
        { name: 'Inicio', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, requiredPlan: 'esencial', allowedRoles: ['admin', 'cajero', 'mozo', 'cocina'] },
        { name: 'Productos', path: '/productos', icon: <ShoppingBag className="w-4 h-4" />, requiredPlan: 'esencial', allowedRoles: ['admin', 'cajero', 'mozo', 'cocina'] },
        { name: 'Categorías', path: '/categorias', icon: <Grid className="w-4 h-4" />, requiredPlan: 'esencial', allowedRoles: ['admin', 'cajero', 'mozo', 'cocina'] },
        { name: 'Mesas', path: '/mesas', icon: <SquareCheckBig className="w-4 h-4" />, requiredPlan: 'esencial', allowedRoles: ['admin', 'cajero', 'mozo', 'cocina'] },
        { name: 'Menú Digital', path: '/menu', icon: <QrCode className="w-4 h-4" />, requiredPlan: 'esencial', allowedRoles: ['admin', 'cajero', 'mozo', 'cocina'] },
        { name: 'Pedidos', path: '/pedidos', icon: <UtensilsCrossed className="w-4 h-4" />, requiredPlan: 'esencial', allowedRoles: ['admin', 'cajero', 'mozo', 'cocina'] },
        { name: 'Delivery', path: '/delivery', icon: <Truck className="w-4 h-4" />, requiredPlan: 'esencial', allowedRoles: ['admin', 'cajero', 'mozo', 'cocina'] },
      ],
    },
    {
      title: 'Tesorería & Ingresos',
      items: [
        { name: 'Caja', path: '/caja', icon: <Wallet className="w-4 h-4 shrink-0" />, requiredPlan: 'esencial', allowedRoles: ['admin', 'cajero'] },
      ],
    },
    {
      title: 'Costos & Inteligencia',
      badge: 'Plan Gestión',
      badgePlan: 'gestion',
      items: [
        { name: 'Ingredientes', path: '/ingredientes', icon: <Apple className="w-4 h-4 shrink-0" />, requiredPlan: 'gestion', allowedRoles: ['admin', 'cocina'] },
        { name: 'Recetas y Costos', path: '/recetas', icon: <Calculator className="w-4 h-4 shrink-0" />, requiredPlan: 'gestion', allowedRoles: ['admin', 'cocina'] },
        { name: 'Métricas', path: '/metricas', icon: <BarChart3 className="w-4 h-4 shrink-0" />, requiredPlan: 'gestion', allowedRoles: ['admin'] },
        { name: 'Insights', path: '/insights', icon: <Lightbulb className="w-4 h-4 shrink-0" />, requiredPlan: 'gestion', allowedRoles: ['admin'] },
      ],
    },
    {
      title: 'Fidelización & Marketing',
      badge: 'Plan Fidelización',
      badgePlan: 'fidelizacion',
      items: [
        { name: 'Sitio Promocional', path: '/sitio-promocional', icon: <Globe className="w-4 h-4" />, requiredPlan: 'fidelizacion', allowedRoles: ['admin'] },
        { name: 'Editor Web', path: '/editor-web', icon: <Settings className="w-4 h-4" />, requiredPlan: 'fidelizacion', allowedRoles: ['admin'] },
        { name: 'Clientes', path: '/clientes', icon: <Users className="w-4 h-4" />, requiredPlan: 'fidelizacion', allowedRoles: ['admin'] },
        { name: 'Puntos y Recompensas', path: '/puntos', icon: <Award className="w-4 h-4" />, requiredPlan: 'fidelizacion', allowedRoles: ['admin'] },
        { name: 'Tarjetas Virtuales', path: '/tarjetas', icon: <CreditCard className="w-4 h-4" />, requiredPlan: 'fidelizacion', allowedRoles: ['admin'] },
      ],
    },
    {
      title: 'Sistema & Personal',
      items: [
        { name: 'Usuarios y Equipo', path: '/configuracion', icon: <Users className="w-4 h-4" />, requiredPlan: 'esencial', allowedRoles: ['admin'] },
        { name: 'Manuales', path: '/manuales', icon: <BookOpen className="w-4 h-4" />, requiredPlan: 'esencial', allowedRoles: ['admin'] },
        { name: 'Configuración', path: '/configuracion', icon: <Settings className="w-4 h-4" />, requiredPlan: 'esencial', allowedRoles: ['admin'] },
      ],
    },
  ];

  const visibleNavSections = navSections
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((item) => !item.allowedRoles || item.allowedRoles.includes(userRole)),
    }))
    .filter((sec) => sec.items.length > 0);

  const handleNavClick = (e: React.MouseEvent, item: SidebarItem) => {
    if (!checkPlanAccess(item.requiredPlan, item.name)) {
      e.preventDefault();
    } else {
      setMobileOpen(false);
    }
  };

  const isPlanLocked = (requiredPlan: PlanType): boolean => {
    const levels: Record<PlanType, number> = { esencial: 1, gestion: 2, fidelizacion: 3 };
    return levels[plan] < levels[requiredPlan];
  };

  return (
    <>
      {/* Mobile Topbar Toggle */}
      <div className="lg:hidden bg-brand-card border-b border-brand-secondary/80 p-3 flex items-center justify-between">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-brand-bg text-brand-dark hover:bg-brand-secondary/50 flex items-center gap-2 text-sm font-semibold"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span>Menú de Navegación</span>
        </button>
        <button
          onClick={() => navigate('/planes')}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-brown text-brand-card flex items-center gap-1"
        >
          <Store className="w-3.5 h-3.5" /> Planes
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-brand-dark/40 backdrop-blur-xs z-40 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full bg-brand-card border-r border-brand-secondary flex flex-col justify-between transition-all duration-300 shadow-soft-lg lg:shadow-none ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div className="p-4 space-y-6 overflow-y-auto flex-1 no-scrollbar">
          {/* Brand Logo & Header */}
          <div className="flex items-center justify-between relative border-b border-brand-secondary/60 pb-4">
            <div
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img
                src="/logo_hilos_de_amor.jpg"
                alt="Logo Hilos de Amor"
                className="w-10 h-10 rounded-full border border-brand-secondary object-cover shadow-soft group-hover:scale-105 transition-transform"
              />
              {!isCollapsed && (
                <div>
                  <h1 className="font-extrabold text-brand-dark text-base leading-tight font-serif">
                    Hilos de Amor
                  </h1>
                  <p className="text-[10px] text-brand-brown/80 font-medium">Pastelería & Encordado</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="hidden lg:flex p-1.5 rounded-lg hover:bg-brand-secondary/50 text-brand-dark/60 hover:text-brand-dark transition-colors shrink-0"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
            {isCollapsed && (
              <button
                onClick={() => setIsCollapsed(false)}
                className="hidden lg:flex absolute top-4 -right-3 p-1 rounded-full bg-brand-card border border-brand-secondary shadow-soft hover:bg-brand-secondary/50 text-brand-dark/60 hover:text-brand-dark transition-colors z-50"
              >
                <Menu className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dynamic Navigation Sections */}
          <div className="space-y-4">
            {visibleNavSections.map((sec, idx) => (
              <div key={idx} className="space-y-1">
                <div className={`flex items-center justify-between px-3 mb-1.5 ${isCollapsed ? 'hidden' : 'flex'}`}>
                  <p className="text-[10px] font-bold text-brand-brown/60 uppercase tracking-wider">
                    {sec.title}
                  </p>
                  {sec.badgePlan && isPlanLocked(sec.badgePlan) && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${sec.badgePlan === 'fidelizacion' ? 'bg-brand-green/40 text-emerald-800' : 'bg-brand-yellow/40 text-brand-brown'}`}>
                      {sec.badge}
                    </span>
                  )}
                </div>

                {sec.items.map((item) => {
                  const locked = isPlanLocked(item.requiredPlan);
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.name + item.path}
                      to={item.path}
                      onClick={(e) => handleNavClick(e, item)}
                      title={isCollapsed ? item.name : undefined}
                      className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-brand-brown text-brand-card font-bold shadow-soft'
                          : locked
                          ? 'text-brand-dark/50 hover:bg-brand-secondary/20'
                          : 'text-brand-dark/80 hover:bg-brand-secondary/40 hover:text-brand-dark'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        {!isCollapsed && <span>{item.name}</span>}
                      </div>
                      {!isCollapsed && locked && <Lock className="w-3.5 h-3.5 text-brand-brown/70 shrink-0" />}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-brand-secondary/60 bg-brand-bg/50 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-green/30 text-emerald-800 font-bold flex items-center justify-center text-xs">
              CM
            </div>
            <div className="overflow-hidden">
              <h5 className="text-xs font-bold text-brand-dark truncate">Hilos de Amor</h5>
              <p className="text-[10px] text-brand-brown/80 truncate">Sucursal Recoleta</p>
            </div>
          </div>

          <div className="pt-2 border-t border-brand-secondary/40 text-center">
            <a
              href="https://www.growlabs.lat"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-brand-brown hover:text-brand-dark hover:underline inline-flex items-center gap-1.5"
            >
              <span className="w-5 h-5 rounded-full overflow-hidden border border-brand-secondary inline-block shrink-0 shadow-xs bg-white">
                <img src="/logogrow.png" alt="Grow Labs" className="w-full h-full object-cover" />
              </span>
              <span>Diseñado por <span className="text-emerald-800 font-extrabold">Grow Labs</span> 🚀</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
