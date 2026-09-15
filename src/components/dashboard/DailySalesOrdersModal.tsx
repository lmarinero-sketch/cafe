import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Search,
  Receipt,
  Eye,
  Clock,
  CheckCircle2,
  DollarSign,
  UtensilsCrossed,
  Truck,
  ShoppingBag,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Order, OrderStatus, OrderType, PaymentMethod } from '../../types';
import { formatCurrency, formatDate } from '../../utils/currency';
import { OrderDetailModal } from '../orders/OrderDetailModal';
import { OrderReceiptModal } from '../orders/OrderReceiptModal';

interface DailySalesOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export const DailySalesOrdersModal: React.FC<DailySalesOrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | OrderType>('all');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);

  // Consider orders for the day (e.g. today's date in local Argentina time, or all recent orders if test orders were cleaned)
  const todayLocalStr = new Date().toLocaleDateString('en-CA');

  const todayOrders = useMemo(() => {
    // If orders contain today's date, prioritize today's orders.
    // If not, fallback to all non-purged orders.
    const filteredToday = orders.filter((o) => {
      try {
        const orderDate = new Date(o.createdAt).toLocaleDateString('en-CA');
        return orderDate === todayLocalStr;
      } catch {
        return false;
      }
    });

    return filteredToday.length > 0 ? filteredToday : orders;
  }, [orders, todayLocalStr]);

  // Statistics calculation
  const totalSalesDelivered = useMemo(() => {
    return todayOrders
      .filter((o) => o.status !== 'cancelado')
      .reduce((sum, o) => sum + o.total, 0);
  }, [todayOrders]);

  const deliveredCount = todayOrders.filter((o) => o.status === 'entregado').length;
  const inProgressCount = todayOrders.filter(
    (o) => o.status === 'nuevo' || o.status === 'confirmado' || o.status === 'en_preparacion' || o.status === 'en_camino' || o.status === 'listo'
  ).length;
  const cancelledCount = todayOrders.filter((o) => o.status === 'cancelado').length;

  // Breakdown by payment method
  const paymentBreakdown = useMemo(() => {
    const acc: Record<string, { count: number; total: number }> = {};
    todayOrders
      .filter((o) => o.status !== 'cancelado')
      .forEach((o) => {
        const method = o.paymentMethod || 'efectivo';
        if (!acc[method]) acc[method] = { count: 0, total: 0 };
        acc[method].count += 1;
        acc[method].total += o.total;
      });
    return acc;
  }, [todayOrders]);

  // Filtered orders list for the table
  const filteredOrders = useMemo(() => {
    return todayOrders.filter((o) => {
      // Status filter
      if (selectedStatusFilter !== 'all' && o.status !== selectedStatusFilter) {
        return false;
      }
      // Type filter
      if (selectedTypeFilter !== 'all' && o.type !== selectedTypeFilter) {
        return false;
      }
      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const codeMatches = o.code.toLowerCase().includes(q);
      const customerMatches = (o.customerName || '').toLowerCase().includes(q);
      const phoneMatches = (o.customerPhone || '').includes(q);
      const tableMatches = (o.tableName || '').toLowerCase().includes(q);
      const itemMatches = o.items.some((it) => it.productName.toLowerCase().includes(q));

      return codeMatches || customerMatches || phoneMatches || tableMatches || itemMatches;
    });
  }, [todayOrders, selectedStatusFilter, selectedTypeFilter, searchQuery]);

  if (!isOpen) return null;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'nuevo':
        return { text: 'Nuevo', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'confirmado':
        return { text: 'Confirmado', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'en_preparacion':
        return { text: 'En Preparación', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'listo':
        return { text: 'Listo', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'en_camino':
        return { text: 'En Camino', bg: 'bg-sky-100 text-sky-900 border-sky-300' };
      case 'entregado':
        return { text: 'Cobrado / Entregado', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' };
      case 'cancelado':
        return { text: 'Cancelado', bg: 'bg-rose-100 text-rose-950 border-rose-300' };
      default:
        return { text: status, bg: 'bg-brand-secondary text-brand-dark' };
    }
  };

  const getChannelIcon = (type: OrderType) => {
    switch (type) {
      case 'salon':
        return <UtensilsCrossed className="w-3.5 h-3.5 text-brand-brown" />;
      case 'delivery':
        return <Truck className="w-3.5 h-3.5 text-rose-600" />;
      case 'retiro':
        return <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-brand-dark/50 backdrop-blur-xs animate-fade-in">
        <div className="bg-brand-card rounded-3xl border border-brand-secondary p-5 sm:p-7 w-full max-w-5xl shadow-soft-lg space-y-5 max-h-[92vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-brand-secondary/80 pb-4 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-green/30 text-emerald-800 border border-emerald-300">
                  Ventas del Día
                </span>
                <span className="text-xs font-bold text-brand-brown/80">
                  {todayOrders.length} pedidos registrados
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-brand-dark font-serif flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-emerald-800 shrink-0" />
                Detalle y Lista de Pedidos del Día
              </h2>
              <p className="text-xs text-brand-brown/80 mt-0.5">
                Revisá la facturación, los métodos de pago y el estado de cada pedido de la jornada.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-brand-dark/60 hover:text-brand-dark hover:bg-brand-secondary/40 transition-colors"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-emerald-900 block">Total Facturado</span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-900 block mt-0.5">
                {formatCurrency(totalSalesDelivered)}
              </span>
              <span className="text-[10px] text-emerald-800 font-semibold">Excluye pedidos cancelados</span>
            </div>

            <div className="p-3 bg-brand-bg rounded-2xl border border-brand-secondary shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-brand-brown/80 block">Cobrados / Listos</span>
              <span className="text-lg sm:text-xl font-extrabold text-brand-dark block mt-0.5">
                {deliveredCount} <span className="text-xs font-medium text-brand-brown">pedidos</span>
              </span>
              <span className="text-[10px] text-emerald-800 font-semibold">✓ Concluidos</span>
            </div>

            <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-amber-900 block">En Curso</span>
              <span className="text-lg sm:text-xl font-extrabold text-amber-950 block mt-0.5">
                {inProgressCount} <span className="text-xs font-medium text-amber-800">activos</span>
              </span>
              <span className="text-[10px] text-amber-900 font-semibold">En cocina o despacho</span>
            </div>

            <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-200 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-rose-900 block">Cancelados</span>
              <span className="text-lg sm:text-xl font-extrabold text-rose-950 block mt-0.5">
                {cancelledCount} <span className="text-xs font-medium text-rose-800">anulados</span>
              </span>
              <span className="text-[10px] text-rose-800 font-semibold">No suman a la venta</span>
            </div>
          </div>

          {/* Payment Methods Breakdown Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0 text-xs">
            <span className="text-[11px] font-bold text-brand-brown/80 shrink-0">Medios de Pago:</span>
            {Object.entries(paymentBreakdown).map(([method, data]) => (
              <span
                key={method}
                className="px-2.5 py-1 rounded-xl bg-brand-cream border border-brand-secondary text-brand-dark font-bold text-[11px] whitespace-nowrap flex items-center gap-1.5 shrink-0"
              >
                <span className="capitalize">{method}</span>:
                <strong className="text-brand-brown font-extrabold">{formatCurrency(data.total)}</strong>
                <span className="text-[10px] text-brand-brown/60">({data.count})</span>
              </span>
            ))}
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por código (#ORD-...), cliente, mesa o producto..."
                className="w-full pl-9 pr-4 py-2 bg-brand-bg rounded-xl border border-brand-secondary text-xs font-medium text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-brand-bg rounded-xl border border-brand-secondary text-xs font-bold text-brand-dark focus:outline-none shrink-0"
              >
                <option value="all">Todos los estados</option>
                <option value="entregado">Cobrados / Entregados</option>
                <option value="en_preparacion">En preparación</option>
                <option value="nuevo">Nuevos</option>
                <option value="cancelado">Cancelados</option>
              </select>

              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value as any)}
                className="px-3 py-2 bg-brand-bg rounded-xl border border-brand-secondary text-xs font-bold text-brand-dark focus:outline-none shrink-0"
              >
                <option value="all">Todos los canales</option>
                <option value="salon">🍽️ Salón</option>
                <option value="delivery">🛵 Delivery</option>
                <option value="retiro">🛍️ Retiro</option>
              </select>
            </div>
          </div>

          {/* Orders List / Table */}
          <div className="flex-1 overflow-y-auto pr-1 border border-brand-secondary/60 rounded-2xl bg-brand-bg/50">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-sm font-bold text-brand-dark">No se encontraron pedidos con ese criterio.</p>
                <p className="text-xs text-brand-brown/70">
                  {searchQuery ? 'Intentá con otro término de búsqueda.' : 'No hay pedidos cargados en este momento.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-brand-secondary/60">
                {filteredOrders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  const itemsCount = order.items.reduce((s, it) => s + it.quantity, 0);
                  const itemsSummary = order.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ');

                  return (
                    <div
                      key={order.id}
                      className="p-3.5 sm:p-4 hover:bg-brand-card/80 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      {/* Left: Code, Time, Channel, Customer */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-extrabold text-sm text-brand-dark">
                            #{order.code}
                          </span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                            {badge.text}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-brand-brown bg-brand-cream px-2 py-0.5 rounded-md border border-brand-secondary/60">
                            {getChannelIcon(order.type)}
                            <span>{order.tableName || order.type.toUpperCase()}</span>
                          </span>
                          <span className="text-[11px] text-brand-brown/70 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(order.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Customer Info */}
                        <p className="font-bold text-brand-dark text-xs truncate">
                          {order.customerName || 'Cliente de Salón'}
                          {order.customerPhone ? (
                            <span className="text-brand-brown/70 font-normal ml-1">({order.customerPhone})</span>
                          ) : null}
                        </p>

                        {/* Items description preview */}
                        <p className="text-[11px] text-brand-brown/80 truncate leading-relaxed">
                          <strong className="text-brand-dark">{itemsCount} items:</strong> {itemsSummary}
                        </p>
                      </div>

                      {/* Right: Payment Method, Total & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-secondary/40">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] uppercase font-bold text-brand-brown/70 block">
                            {order.paymentMethod || 'Efectivo'}
                          </span>
                          <span className="text-base font-extrabold text-brand-brown">
                            {formatCurrency(order.total)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForReceipt(order)}
                            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-brand-secondary bg-brand-card hover:bg-brand-secondary/30 text-brand-brown font-bold text-xs transition-colors flex items-center gap-1 shadow-xs"
                            title="Ver Comprobante / Ticket de Pago"
                          >
                            <Receipt className="w-3.5 h-3.5 text-emerald-800" />
                            <span className="hidden sm:inline">Ticket</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedOrderForDetail(order)}
                            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-brand-brown text-brand-card hover:bg-brand-dark font-bold text-xs transition-colors flex items-center gap-1 shadow-soft"
                            title="Ver Detalle Completo de la Comanda"
                          >
                            <Eye className="w-3.5 h-3.5 text-brand-yellow" />
                            <span className="hidden sm:inline">Detalle</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-brand-secondary/80 shrink-0 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/historial-pedidos');
                }}
                className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl border border-brand-secondary bg-brand-card hover:bg-brand-secondary/40 text-brand-dark font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Ver en Historial General Completo</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-brown" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/pedidos');
                }}
                className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl border border-brand-secondary bg-brand-card hover:bg-brand-secondary/40 text-brand-dark font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Ir a Comandas de Salón</span>
                <UtensilsCrossed className="w-3.5 h-3.5 text-brand-brown" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-2 px-5 rounded-xl bg-brand-brown text-brand-card font-bold hover:bg-brand-dark transition-colors shadow-soft"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Nested Order Detail Modal */}
      {selectedOrderForDetail && (
        <OrderDetailModal
          order={selectedOrderForDetail}
          onClose={() => setSelectedOrderForDetail(null)}
        />
      )}

      {/* Nested Order Receipt Modal */}
      {selectedOrderForReceipt && (
        <OrderReceiptModal
          order={selectedOrderForReceipt}
          isOpen={Boolean(selectedOrderForReceipt)}
          onClose={() => setSelectedOrderForReceipt(null)}
        />
      )}
    </>
  );
};
