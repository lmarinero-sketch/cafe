import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PlanType } from '../../types';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  requiredPlan: PlanType;
}

export const Sidebar: React.FC = () => {
  const { plan, checkPlanAccess } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: SidebarItem[] = [
    { name: 'Inicio', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, requiredPlan: 'esencial' },
    { name: 'Productos', path: '/productos', icon: <ShoppingBag className="w-4 h-4" />, requiredPlan: 'esencial' },
    { name: 'Categorías', path: '/categorias', icon: <Grid className="w-4 h-4" />, requiredPlan: 'esencial' },
    { name: 'Mesas', path: '/mesas', icon: <SquareCheckBig className="w-4 h-4" />, requiredPlan: 'esencial' },
    { name: 'Menú Digital', path: '/menu', icon: <QrCode className="w-4 h-4" />, requiredPlan: 'esencial' },
    { name: 'Carta Tradicional', path: '/carta-tradicional', icon: <BookOpen className="w-4 h-4" />, requiredPlan: 'esencial' },
    { name: 'Sitio Promocional', path: '/sitio-promocional', icon: <Globe className="w-4 h-4" />, requiredPlan: 'esencial' },
    { name: 'Pedidos', path: '/pedidos', icon: <UtensilsCrossed className="w-4 h-4" />, requiredPlan: 'esencial' },
    { name: 'Delivery', path: '/delivery', icon: <Truck className="w-4 h-4" />, requiredPlan: 'esencial' },
    
    // Plan Gestión
    { name: 'Ingredientes', path: '/ingredientes', icon: <Apple className="w-4 h-4" />, requiredPlan: 'gestion' },
    { name: 'Recetas y Costos', path: '/recetas', icon: <Calculator className="w-4 h-4" />, requiredPlan: 'gestion' },
    { name: 'Métricas', path: '/metricas', icon: <BarChart3 className="w-4 h-4" />, requiredPlan: 'gestion' },
    { name: 'Insights', path: '/insights', icon: <Lightbulb className="w-4 h-4" />, requiredPlan: 'gestion' },
    
    // Plan Fidelización
    { name: 'Clientes', path: '/clientes', icon: <Users className="w-4 h-4" />, requiredPlan: 'fidelizacion' },
    { name: 'Puntos y Recompensas', path: '/puntos', icon: <Award className="w-4 h-4" />, requiredPlan: 'fidelizacion' },
    { name: 'Tarjetas Virtuales', path: '/tarjetas', icon: <CreditCard className="w-4 h-4" />, requiredPlan: 'fidelizacion' },
    { name: 'WhatsApp', path: '/whatsapp', icon: <MessageSquare className="w-4 h-4" />, requiredPlan: 'fidelizacion' },
    { name: 'Automatizaciones', path: '/automatizaciones', icon: <Zap className="w-4 h-4" />, requiredPlan: 'fidelizacion' },
    
    // Standard
    { name: 'Manuales', path: '/manuales', icon: <BookOpen className="w-4 h-4" />, requiredPlan: 'esencial' },
    { name: 'Configuración', path: '/configuracion', icon: <Settings className="w-4 h-4" />, requiredPlan: 'esencial' },
  ];

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
          className="fixed inset-0 z-40 bg-brand-dark/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-brand-card border-r border-brand-secondary/80 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* Header Link to Public Landing */}
          <div
            onClick={() => {
              navigate('/planes');
              setMobileOpen(false);
            }}
            className="p-3 rounded-xl bg-brand-cream border border-brand-secondary/60 cursor-pointer hover:border-brand-brown/40 transition-colors flex items-center justify-between group"
          >
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-brown/80 tracking-wider">
                Presentación Comercial
              </span>
              <h4 className="text-xs font-bold text-brand-dark group-hover:text-brand-brown flex items-center gap-1">
                Ver 3 Planes Comerciales
              </h4>
            </div>
            <Store className="w-4 h-4 text-brand-brown shrink-0" />
          </div>

          {/* Navigation Sections */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-brand-brown/60 uppercase tracking-wider mb-2">
              Gestión Operativa (Esencial)
            </p>
            {navItems.slice(0, 7).map((item) => {
              const locked = isPlanLocked(item.requiredPlan);
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-brown text-brand-card font-bold shadow-soft'
                      : 'text-brand-dark/80 hover:bg-brand-secondary/40 hover:text-brand-dark'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  {locked && <Lock className="w-3.5 h-3.5 text-brand-brown/50" />}
                </NavLink>
              );
            })}
          </div>

          {/* Plan Gestión Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[10px] font-bold text-brand-brown/60 uppercase tracking-wider">
                Costos & Inteligencia (Gestión)
              </p>
              {isPlanLocked('gestion') && (
                <span className="text-[9px] bg-brand-yellow/40 text-brand-brown font-bold px-1.5 py-0.2 rounded">
                  Plan Gestión
                </span>
              )}
            </div>
            {navItems.slice(7, 11).map((item) => {
              const locked = isPlanLocked(item.requiredPlan);
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-brown text-brand-card font-bold shadow-soft'
                      : locked
                      ? 'text-brand-dark/50 hover:bg-brand-secondary/20'
                      : 'text-brand-dark/80 hover:bg-brand-secondary/40 hover:text-brand-dark'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  {locked && <Lock className="w-3.5 h-3.5 text-brand-brown/70" />}
                </NavLink>
              );
            })}
          </div>

          {/* Plan Fidelización Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[10px] font-bold text-brand-brown/60 uppercase tracking-wider">
                Fidelización & Marketing
              </p>
              {isPlanLocked('fidelizacion') && (
                <span className="text-[9px] bg-brand-green/40 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                  Plan Fidelización
                </span>
              )}
            </div>
            {navItems.slice(11, 16).map((item) => {
              const locked = isPlanLocked(item.requiredPlan);
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-brown text-brand-card font-bold shadow-soft'
                      : locked
                      ? 'text-brand-dark/50 hover:bg-brand-secondary/20'
                      : 'text-brand-dark/80 hover:bg-brand-secondary/40 hover:text-brand-dark'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  {locked && <Lock className="w-3.5 h-3.5 text-brand-brown/70" />}
                </NavLink>
              );
            })}
          </div>

          {/* Standard Section */}
          <div className="space-y-1 pt-2 border-t border-brand-secondary/60">
            {navItems.slice(16).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-brown text-brand-card font-bold shadow-soft'
                      : 'text-brand-dark/80 hover:bg-brand-secondary/40 hover:text-brand-dark'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-brand-secondary/60 bg-brand-bg/50 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-green/30 text-emerald-800 font-bold flex items-center justify-center text-xs">
              CM
            </div>
            <div className="overflow-hidden">
              <h5 className="text-xs font-bold text-brand-dark truncate">Café Magnolia</h5>
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
