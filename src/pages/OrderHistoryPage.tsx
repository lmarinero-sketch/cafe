import React from 'react';
import { useApp } from '../context/AppContext';
import { OrderHistoryView } from '../components/orders/OrderHistoryView';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, History, Clock } from 'lucide-react';
import { getShiftDisplayLabel } from '../utils/shiftUtils';

export const OrderHistoryPage: React.FC = () => {
  const { orders, updateOrderStatus } = useApp();
  const navigate = useNavigate();
  const shiftLabel = getShiftDisplayLabel();

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Bar */}
      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-brand-brown/70 uppercase tracking-wider">
              Auditoría & Registro de Ventas
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-yellow/40 text-brand-dark border border-brand-yellow/60">
              Historial Completo
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-brand-dark">Historial General de Pedidos</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Consultá, filtrá y exportá todos los pedidos realizados ({orders.length} pedidos totales).
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/pedidos')}
          className="py-2.5 px-4 rounded-xl bg-brand-brown text-white font-bold text-xs hover:bg-brand-dark transition shadow-soft flex items-center gap-2"
        >
          <UtensilsCrossed className="w-4 h-4 text-brand-yellow" />
          <span>Ir a Comanda en Vivo de Hoy</span>
        </button>
      </div>

      {/* Main History Component */}
      <OrderHistoryView orders={orders} onUpdateOrderStatus={updateOrderStatus} />
    </div>
  );
};
