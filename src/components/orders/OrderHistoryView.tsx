import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  ShoppingBag,
  UtensilsCrossed,
  Truck,
  RotateCcw,
  LayoutGrid,
  List,
  ChevronRight,
  ArrowUpDown,
  Receipt,
  Printer,
} from 'lucide-react';
import { Order, OrderStatus, OrderType, PaymentMethod } from '../../types';
import { formatCurrency, formatDate } from '../../utils/currency';
import { DatePreset, filterOrdersByDate, getOperationalDate } from '../../utils/shiftUtils';
import { OrderDetailModal } from './OrderDetailModal';
import { OrderReceiptModal } from './OrderReceiptModal';

interface OrderHistoryViewProps {
  orders: Order[];
  onUpdateOrderStatus?: (orderId: string, status: OrderStatus) => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({ orders, onUpdateOrderStatus }) => {
  const [datePreset, setDatePreset] = useState<DatePreset>('todos');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [selectedPayment, setSelectedPayment] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // Filter pipeline
  const filteredOrders = useMemo(() => {
    // 1. Date Filter
    let result = filterOrdersByDate(orders, datePreset, customFrom, customTo);

    // 2. Status Filter
    if (selectedStatus !== 'todos') {
      result = result.filter((o) => o.status === selectedStatus);
    }

    // 3. Channel / Type Filter
    if (selectedType !== 'todos') {
      result = result.filter((o) => o.type === selectedType);
    }

    // 4. Payment Method Filter
    if (selectedPayment !== 'todos') {
      result = result.filter((o) => o.paymentMethod === selectedPayment);
    }

    // 5. Search Text Filter (code, customer name, phone, table, waiter)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((o) => {
        const codeMatch = o.code?.toLowerCase().includes(term);
        const nameMatch = o.customerName?.toLowerCase().includes(term);
        const phoneMatch = o.customerPhone?.toLowerCase().includes(term);
        const tableMatch = o.tableName?.toLowerCase().includes(term);
        const waiterMatch = o.waiterName?.toLowerCase().includes(term);
        const itemMatch = o.items?.some((it) => it.productName.toLowerCase().includes(term));
        return codeMatch || nameMatch || phoneMatch || tableMatch || waiterMatch || itemMatch;
      });
    }

    // Sort descending by creation date
    return [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, datePreset, customFrom, customTo, selectedStatus, selectedType, selectedPayment, searchTerm]);

  // KPI Metrics calculation
  const metrics = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const deliveredOrders = filteredOrders.filter((o) => o.status === 'entregado');
    const canceledOrders = filteredOrders.filter((o) => o.status === 'cancelado');
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
    const averageTicket = deliveredOrders.length > 0 ? Math.round(totalRevenue / deliveredOrders.length) : 0;
    const completionRate = totalOrders > 0 ? Math.round((deliveredOrders.length / totalOrders) * 100) : 0;

    return {
      totalOrders,
      deliveredCount: deliveredOrders.length,
      canceledCount: canceledOrders.length,
      totalRevenue,
      averageTicket,
      completionRate,
    };
  }, [filteredOrders]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;

    const headers = [
      'Código',
      'Fecha',
      'Hora',
      'Cliente',
      'Teléfono',
      'Tipo / Mesa',
      'Mozo / Cajero',
      'Medio de Pago',
      'Subtotal',
      'Envío',
      'Total',
      'Estado',
      'Items',
    ];

    const rows = filteredOrders.map((o) => {
      const d = new Date(o.createdAt);
      const fecha = d.toLocaleDateString('es-AR');
      const hora = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      const itemsStr = o.items.map((it) => `${it.quantity}x ${it.productName}`).join(' | ');

      return [
        `"${o.code}"`,
        `"${fecha}"`,
        `"${hora}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.customerPhone || ''}"`,
        `"${o.tableName || o.type}"`,
        `"${(o.waiterName || '').replace(/"/g, '""')}"`,
        `"${o.paymentMethod}"`,
        o.subtotal || o.total - (o.deliveryFee || 0),
        o.deliveryFee || 0,
        o.total,
        `"${o.status}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `historial_pedidos_${getOperationalDate()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        return { text: 'Entregado', bg: 'bg-gray-100 text-gray-800 border-gray-300' };
      case 'cancelado':
        return { text: 'Cancelado', bg: 'bg-rose-100 text-rose-950 border-rose-300' };
      default:
        return { text: status, bg: 'bg-brand-secondary text-brand-dark border-brand-secondary' };
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft space-y-1">
          <p className="text-[11px] font-bold text-brand-brown/70 uppercase tracking-wider">Facturado (Cobrado)</p>
          <p className="text-xl font-extrabold text-brand-dark">{formatCurrency(metrics.totalRevenue)}</p>
          <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {metrics.deliveredCount} pedidos entregados
          </p>
        </div>

        <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft space-y-1">
          <p className="text-[11px] font-bold text-brand-brown/70 uppercase tracking-wider">Total de Pedidos</p>
          <p className="text-xl font-extrabold text-brand-dark">{metrics.totalOrders}</p>
          <p className="text-[10px] text-brand-brown/80 font-medium">Registrados en el filtro</p>
        </div>

        <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft space-y-1">
          <p className="text-[11px] font-bold text-brand-brown/70 uppercase tracking-wider">Ticket Promedio</p>
          <p className="text-xl font-extrabold text-brand-dark">{formatCurrency(metrics.averageTicket)}</p>
          <p className="text-[10px] text-brand-brown/80 font-medium">Por pedido finalizado</p>
        </div>

        <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft space-y-1">
          <p className="text-[11px] font-bold text-brand-brown/70 uppercase tracking-wider">Tasa de Entrega</p>
          <p className="text-xl font-extrabold text-emerald-800">{metrics.completionRate}%</p>
          <p className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {metrics.deliveredCount} de {metrics.totalOrders}
          </p>
        </div>

        <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft space-y-1 col-span-2 sm:col-span-1">
          <p className="text-[11px] font-bold text-brand-brown/70 uppercase tracking-wider">Cancelados</p>
          <p className="text-xl font-extrabold text-rose-700">{metrics.canceledCount}</p>
          <p className="text-[10px] text-rose-600 font-medium flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Pedidos anulados
          </p>
        </div>
      </div>

      {/* Filter Control Box */}
      <div className="bg-brand-card p-5 rounded-2xl border border-brand-secondary shadow-soft space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-brand-brown/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código (ORD-...), cliente, teléfono, mesa o producto..."
              className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark placeholder-brand-brown/50 focus:outline-none focus:ring-2 focus:ring-brand-yellow/60"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-brown/60 hover:text-brand-dark"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode & Export */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex bg-brand-bg rounded-xl p-1 border border-brand-secondary">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition flex items-center gap-1 font-bold ${
                  viewMode === 'table' ? 'bg-brand-card text-brand-dark shadow-xs' : 'text-brand-brown hover:text-brand-dark'
                }`}
                title="Vista de Tabla"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Tabla</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs transition flex items-center gap-1 font-bold ${
                  viewMode === 'cards' ? 'bg-brand-card text-brand-dark shadow-xs' : 'text-brand-brown hover:text-brand-dark'
                }`}
                title="Vista de Tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Tarjetas</span>
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={filteredOrders.length === 0}
              className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs shrink-0"
              title="Descargar listado filtrado a Excel/CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-brand-secondary/60">
          {/* Date Preset */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-brand-brown/70 mb-1">
              Período / Jornada
            </label>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as DatePreset)}
              className="w-full px-3 py-1.5 rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark text-xs focus:outline-none"
            >
              <option value="todos">Todo el Historial</option>
              <option value="hoy">Hoy (Jornada Actual)</option>
              <option value="ayer">Ayer</option>
              <option value="ultimos_7_dias">Últimos 7 Días</option>
              <option value="este_mes">Este Mes</option>
              <option value="personalizado">Personalizado (Rango)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-brand-brown/70 mb-1">
              Estado del Pedido
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark text-xs focus:outline-none"
            >
              <option value="todos">Todos los Estados</option>
              <option value="entregado">Entregados / Cobrados</option>
              <option value="listo">Listos</option>
              <option value="en_preparacion">En Preparación</option>
              <option value="en_camino">En Camino (Delivery)</option>
              <option value="confirmado">Confirmados</option>
              <option value="nuevo">Nuevos</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </div>

          {/* Channel / Type Filter */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-brand-brown/70 mb-1">
              Canal / Tipo
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark text-xs focus:outline-none"
            >
              <option value="todos">Todos los Canales</option>
              <option value="salon">Salón / Mesas</option>
              <option value="retiro">Retiro / Takeaway</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-brand-brown/70 mb-1">
              Medio de Pago
            </label>
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark text-xs focus:outline-none capitalize"
            >
              <option value="todos">Todos los Medios</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="mercadopago">MercadoPago</option>
              <option value="debito">Débito</option>
              <option value="credito">Crédito</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Row */}
        {datePreset === 'personalizado' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 bg-brand-bg p-3 rounded-xl border border-brand-secondary/70">
            <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-brown" /> Rango de Fechas Operativas:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-brown">Desde:</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-brand-secondary bg-brand-card text-brand-dark"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-brown">Hasta:</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-brand-secondary bg-brand-card text-brand-dark"
              />
            </div>
          </div>
        )}
      </div>

      {/* Orders List Content */}
      {filteredOrders.length === 0 ? (
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-12 text-center space-y-3 shadow-soft">
          <div className="w-12 h-12 rounded-full bg-brand-bg text-brand-brown flex items-center justify-center mx-auto border border-brand-secondary">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-brand-dark">No se encontraron pedidos</h3>
          <p className="text-xs text-brand-brown/80 max-w-sm mx-auto">
            No hay pedidos que coincidan con los filtros seleccionados. Probá modificando el rango de fecha o los términos de búsqueda.
          </p>
          {(datePreset !== 'todos' || selectedStatus !== 'todos' || selectedType !== 'todos' || searchTerm) && (
            <button
              onClick={() => {
                setDatePreset('todos');
                setSelectedStatus('todos');
                setSelectedType('todos');
                setSelectedPayment('todos');
                setSearchTerm('');
              }}
              className="px-4 py-2 rounded-xl bg-brand-brown text-white text-xs font-bold hover:bg-brand-dark transition"
            >
              Restablecer Filtros
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-brand-card rounded-2xl border border-brand-secondary shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-brand-bg/80 border-b border-brand-secondary text-brand-brown uppercase text-[10px] font-extrabold tracking-wider">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Fecha & Hora</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Canal / Mesa</th>
                  <th className="py-3 px-4">Medio de Pago</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-secondary/40 font-medium text-brand-dark">
                {filteredOrders.map((ord) => {
                  const badge = getStatusBadge(ord.status);
                  return (
                    <tr
                      key={ord.id}
                      onClick={() => setSelectedOrderForDetail(ord)}
                      className="hover:bg-brand-secondary/20 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-extrabold text-brand-brown">
                        {ord.code}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-brand-brown/90 whitespace-nowrap">
                        {formatDate(ord.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-brand-dark">{ord.customerName}</div>
                        {ord.customerPhone && (
                          <div className="text-[10px] text-brand-brown font-mono">{ord.customerPhone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-[11px] capitalize bg-brand-bg px-2 py-0.5 rounded border border-brand-secondary/60">
                          {ord.type === 'salon' ? (
                            <UtensilsCrossed className="w-3 h-3 text-brand-brown" />
                          ) : ord.type === 'delivery' ? (
                            <Truck className="w-3 h-3 text-sky-700" />
                          ) : (
                            <ShoppingBag className="w-3 h-3 text-amber-700" />
                          )}
                          {ord.tableName || ord.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize text-[11px] text-brand-brown">
                        {ord.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-brand-brown max-w-xs truncate">
                        {ord.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-brand-dark text-xs whitespace-nowrap">
                        {formatCurrency(ord.total)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.text}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReceiptOrder(ord);
                            }}
                            className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition shadow-xs"
                            title="Imprimir / Ver Comprobante"
                          >
                            <Receipt className="w-3.5 h-3.5 text-amber-800" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrderForDetail(ord);
                            }}
                            className="p-1.5 rounded-lg bg-brand-bg hover:bg-brand-secondary text-brand-brown hover:text-brand-dark border border-brand-secondary transition"
                            title="Ver Detalle Completo"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((ord) => {
            const badge = getStatusBadge(ord.status);
            return (
              <div
                key={ord.id}
                onClick={() => setSelectedOrderForDetail(ord)}
                className="bg-brand-card rounded-2xl border border-brand-secondary p-4 shadow-soft space-y-3 cursor-pointer hover:border-brand-brown/50 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-brand-brown text-sm">{ord.code}</span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                      {badge.text}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-brand-brown/80 border-b border-brand-secondary/40 pb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(ord.createdAt)}
                    </span>
                    <span className="capitalize font-bold text-brand-dark">
                      {ord.tableName || ord.type}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <p className="font-bold text-brand-dark">{ord.customerName}</p>
                    {ord.customerPhone && <p className="text-[10px] text-brand-brown font-mono">{ord.customerPhone}</p>}
                    {ord.address && <p className="text-[10px] text-brand-brown truncate">📍 {ord.address}</p>}
                  </div>

                  <div className="space-y-1 bg-brand-bg p-2.5 rounded-xl border border-brand-secondary/60 text-[11px]">
                    {ord.items.slice(0, 3).map((it, idx) => (
                      <div key={idx} className="flex justify-between text-brand-dark">
                        <span>
                          {it.quantity}x {it.productName}
                        </span>
                        <span className="font-bold">{formatCurrency(it.unitPrice * it.quantity)}</span>
                      </div>
                    ))}
                    {ord.items.length > 3 && (
                      <p className="text-[10px] text-brand-brown text-center pt-0.5">
                        +{ord.items.length - 3} producto(s) más...
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-brand-secondary/40 flex items-center justify-between text-xs gap-2">
                  <div>
                    <span className="text-[10px] text-brand-brown capitalize">Pago: {ord.paymentMethod}</span>
                    <p className="font-extrabold text-brand-dark text-sm">{formatCurrency(ord.total)}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReceiptOrder(ord);
                      }}
                      className="py-1.5 px-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      title="Ticket / Comprobante"
                    >
                      <Receipt className="w-3.5 h-3.5 text-amber-800" />
                      <span>Ticket</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrderForDetail(ord);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-brand-bg hover:bg-brand-secondary text-brand-brown hover:text-brand-dark border border-brand-secondary text-xs font-bold transition flex items-center gap-1"
                    >
                      <span>Detalle</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrderForDetail && (
        <OrderDetailModal
          order={selectedOrderForDetail}
          onClose={() => setSelectedOrderForDetail(null)}
          onUpdateStatus={onUpdateOrderStatus}
        />
      )}

      {/* Order Receipt Modal (A4 & 58mm Thermal) */}
      <OrderReceiptModal
        order={receiptOrder}
        isOpen={!!receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />
    </div>
  );
};
