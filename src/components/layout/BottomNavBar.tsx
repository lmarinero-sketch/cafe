import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  SquareCheckBig,
  UtensilsCrossed,
  QrCode,
  Wallet,
  Menu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const BottomNavBar: React.FC = () => {
  const location = useLocation();
  const { tables, orders } = useApp();
  const { user } = useAuth();

  const userRole = user?.role || 'admin';
  const isCajaAllowed = userRole === 'admin' || userRole === 'cajero';

  // Conteos en vivo para badges rápidos de mozo
  const occupiedTables = tables.filter((t) => t.status === 'ocupada').length;
  const activeOrders = orders.filter(
    (o) => o.status === 'nuevo' || o.status === 'confirmado' || o.status === 'en_preparacion' || o.status === 'listo'
  ).length;

  const handleOpenMobileSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'));
  };

  // Ocultar la barra en la vista pública de carta tradicional o ticket si no están logueados
  if (location.pathname.startsWith('/ticket') || location.pathname.startsWith('/comprobante')) {
    return null;
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-secondary/80 shadow-lg px-2 py-1.5 safe-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Mesas */}
        <NavLink
          to="/mesas"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              isActive
                ? 'text-brand-brown font-extrabold scale-105'
                : 'text-brand-dark/70 hover:text-brand-dark'
            }`
          }
        >
          <div className="relative">
            <SquareCheckBig className="w-5 h-5" />
            {occupiedTables > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-600 text-white font-extrabold text-[9px] flex items-center justify-center border border-white">
                {occupiedTables}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-bold">Mesas</span>
        </NavLink>

        {/* Pedidos */}
        <NavLink
          to="/pedidos"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              isActive
                ? 'text-brand-brown font-extrabold scale-105'
                : 'text-brand-dark/70 hover:text-brand-dark'
            }`
          }
        >
          <div className="relative">
            <UtensilsCrossed className="w-5 h-5" />
            {activeOrders > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-emerald-700 text-white font-extrabold text-[9px] flex items-center justify-center border border-white">
                {activeOrders}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-bold">Pedidos</span>
        </NavLink>

        {/* Carta Digital */}
        <NavLink
          to="/menu"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-brand-brown font-extrabold scale-105'
                : 'text-brand-dark/70 hover:text-brand-dark'
            }`
          }
        >
          <QrCode className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold">Menú</span>
        </NavLink>

        {/* Caja (solo visible para admin/cajero) */}
        {isCajaAllowed && (
          <NavLink
            to="/caja"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-brand-brown font-extrabold scale-105'
                  : 'text-brand-dark/70 hover:text-brand-dark'
              }`
            }
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-bold">Caja</span>
          </NavLink>
        )}

        {/* Menú Más */}
        <button
          type="button"
          onClick={handleOpenMobileSidebar}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-brand-dark/70 hover:text-brand-dark transition-all"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold">Más</span>
        </button>
      </div>
    </nav>
  );
};
