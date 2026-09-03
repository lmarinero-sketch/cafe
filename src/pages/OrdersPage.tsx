import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  MapPin,
  Phone,
  Banknote,
  RotateCcw,
  AlertTriangle,
  ClipboardList,
  UtensilsCrossed,
  Sparkles,
  Calendar,
  History,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus, PaymentMethod } from '../types';
import { formatCurrency, formatDate } from '../utils/currency';
import { isOrderInCurrentShift, getShiftDisplayLabel, getOperationalDate } from '../utils/shiftUtils';
import { OrderHistoryView } from '../components/orders/OrderHistoryView';
import { OrderReceiptModal } from '../components/orders/OrderReceiptModal';
import { useToast } from '../context/ToastContext';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { orders, updateOrderStatus, updateOrderTip, addTransaction, cashRegisters, redeemGiftCard, getGiftCardByCode } = useApp();

  const activeTab = searchParams.get('tab') === 'historial' ? 'historial' : 'vivo';

  const [chargingOrder, setChargingOrder] = useState<Order | null>(null);
  const [cancelingOrderConfirm, setCancelingOrderConfirm] = useState<Order | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('efectivo');
  const [tipMode, setTipMode] = useState<'none' | '10' | '15' | 'custom'>('10');
  const [customTipAmount, setCustomTipAmount] = useState<number>(0);
  const [giftCardCodeInput, setGiftCardCodeInput] = useState<string>('');
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const activeRegister = cashRegisters.find((r) => r.status === 'abierta');

  // Filter orders for the CURRENT active shift / operational day
  const currentShiftOrders = useMemo(() => {
    return orders.filter((o) => isOrderInCurrentShift(o, activeRegister));
  }, [orders, activeRegister]);

  const isRegisterFromPreviousDay = (openedAtIso?: string): boolean => {
    if (!openedAtIso) return false;
    const openedDate = new Date(openedAtIso);
    const now = new Date();
    const openedDay = new Date(openedDate.getFullYear(), openedDate.getMonth(), openedDate.getDate()).getTime();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return openedDay < today;
  };

  const columns: { status: OrderStatus; title: string; color: string }[] = [
    { status: 'nuevo', title: 'Nuevo', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    { status: 'confirmado', title: 'Confirmado', color: 'bg-blue-100 text-blue-900 border-blue-300' },
    { status: 'en_preparacion', title: 'En preparación', color: 'bg-purple-100 text-purple-900 border-purple-300' },
    { status: 'listo', title: 'Listo', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    { status: 'en_camino', title: 'En camino', color: 'bg-sky-100 text-sky-900 border-sky-300' },
    { status: 'entregado', title: 'Entregado', color: 'bg-gray-100 text-gray-800 border-gray-300' },
    { status: 'cancelado', title: 'Cancelados', color: 'bg-rose-100 text-rose-950 border-rose-300' },
  ];

  const getPreviousStatus = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case 'confirmado':
        return 'nuevo';
      case 'en_preparacion':
        return 'confirmado';
      case 'listo':
        return 'en_preparacion';
      case 'en_camino':
        return 'listo';
      case 'entregado':
        return 'en_camino';
      default:
        return null;
    }
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case 'nuevo':
        return 'confirmado';
      case 'confirmado':
        return 'en_preparacion';
      case 'en_preparacion':
        return 'listo';
      case 'listo':
        return 'en_camino';
      case 'en_camino':
        return 'entregado';
      default:
        return null;
    }
  };

  const handleCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargingOrder || !activeRegister) return;

    if (selectedPayment === 'giftcard') {
      if (!giftCardCodeInput.trim()) {
        showToast('Código Requerido', 'Por favor ingresá el código de la Gift Card.', 'error');
        return;
      }
      const card = getGiftCardByCode(giftCardCodeInput);
      if (!card) {
        showToast('Tarjeta No Encontrada', 'No se encontró ninguna Gift Card con el código ingresado.', 'error');
        return;
      }
      if (card.currentBalance < chargingOrder.total) {
        showToast(
          'Saldo Insuficiente en Gift Card',
          `La tarjeta tiene ${formatCurrency(card.currentBalance)} y el pedido es de ${formatCurrency(chargingOrder.total)}.`,
          'error'
        );
        return;
      }

      const redeemRes = redeemGiftCard(
        giftCardCodeInput,
        chargingOrder.total,
        chargingOrder.id,
        chargingOrder.code,
        chargingOrder.tableName || chargingOrder.type,
        `Cobro de Pedido ${chargingOrder.code}`
      );

      if (!redeemRes.success) {
        showToast('Error al canjear', redeemRes.message, 'error');
        return;
      }
    }

    const isCashier = user?.role === 'cajero' || user?.role === 'admin' || !user?.role;
    const suggested10 = Math.round(chargingOrder.total * 0.1);
    const suggested15 = Math.round(chargingOrder.total * 0.15);
    const tipAmount = isCashier
      ? tipMode === '10'
        ? suggested10
        : tipMode === '15'
        ? suggested15
        : tipMode === 'custom'
        ? customTipAmount
        : 0
      : 0;

    const tipPercentage =
      tipAmount > 0 && chargingOrder.total > 0
        ? tipMode === '10'
          ? 10
          : tipMode === '15'
          ? 15
          : Math.round((tipAmount / chargingOrder.total) * 100)
        : 0;

    const tipRegisteredBy = user ? `${user.name} (${user.role || 'cajero'})` : 'Cajero de Turno';
    const grandTotal = chargingOrder.total + tipAmount;

    // Impact caja
    addTransaction({
      registerId: activeRegister.id,
      orderId: chargingOrder.id,
      type: 'ingreso',
      amount: grandTotal,
      paymentMethod: selectedPayment,
      description:
        selectedPayment === 'giftcard'
          ? `Cobro Pedido ${chargingOrder.code} con Gift Card ${giftCardCodeInput.toUpperCase()}${tipAmount > 0 ? ` [Propina: ${formatCurrency(tipAmount)}]` : ''}`
          : `Cobro Pedido ${chargingOrder.code}${tipAmount > 0 ? ` [Propina: ${formatCurrency(tipAmount)}]` : ''}`,
      registeredBy: tipRegisteredBy,
    });

    const orderPaid: Order = {
      ...chargingOrder,
      paymentMethod: selectedPayment,
      status: 'entregado',
      tipAmount,
      tipPercentage,
      tipRegisteredBy: tipAmount > 0 ? tipRegisteredBy : undefined,
      tipRegisteredAt: tipAmount > 0 ? new Date().toISOString() : undefined,
    };

    updateOrderStatus(chargingOrder.id, 'entregado');
    if (tipAmount > 0) {
      updateOrderTip(chargingOrder.id, tipAmount, tipPercentage, tipRegisteredBy);
    }

    setChargingOrder(null);
    setGiftCardCodeInput('');
    setTipMode('10');
    setCustomTipAmount(0);
    setReceiptOrder(orderPaid);
  };

  const handleTabChange = (tab: 'vivo' | 'historial') => {
    if (tab === 'historial') {
      setSearchParams({ tab: 'historial' });
    } else {
      setSearchParams({});
    }
  };

  const shiftLabel = getShiftDisplayLabel();

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Bar & Tab Switcher */}
      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-brand-brown/70 uppercase tracking-wider">
              Control de Pedidos & Cocina
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              🟢 Corte a las 05:00 hs
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-brand-dark">
            {activeTab === 'vivo' ? 'Comanda en Vivo & Tablero de Pedidos' : 'Historial General de Pedidos'}
          </h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            {activeTab === 'vivo'
              ? `Jornada Operativa Actual: ${shiftLabel} (${currentShiftOrders.length} pedidos hoy)`
              : `Registro completo de todos los pedidos históricos (${orders.length} pedidos totales)`}
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center gap-2 bg-brand-bg p-1 rounded-2xl border border-brand-secondary w-full md:w-auto">
          <button
            type="button"
            onClick={() => handleTabChange('vivo')}
            className={`flex-1 md:flex-initial py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'vivo'
                ? 'bg-brand-brown text-white shadow-soft'
                : 'text-brand-brown hover:text-brand-dark hover:bg-brand-secondary/30'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Comanda en Vivo</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeTab === 'vivo' ? 'bg-white/20 text-white' : 'bg-brand-secondary text-brand-dark'}`}>
              {currentShiftOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('historial')}
            className={`flex-1 md:flex-initial py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'historial'
                ? 'bg-brand-brown text-white shadow-soft'
                : 'text-brand-brown hover:text-brand-dark hover:bg-brand-secondary/30'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial General</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeTab === 'historial' ? 'bg-white/20 text-white' : 'bg-brand-secondary text-brand-dark'}`}>
              {orders.length}
            </span>
          </button>
        </div>
      </div>

      {/* Render based on Active Tab */}
      {activeTab === 'historial' ? (
        /* HISTORIAL GENERAL DE PEDIDOS */
        <OrderHistoryView orders={orders} onUpdateOrderStatus={updateOrderStatus} />
      ) : (
        /* COMANDA EN VIVO / TABLERO KANBAN DE LA JORNADA */
        <div className="space-y-6">
          {/* Banner Informativo de Jornada y Reinicio Diario */}
          <div className="bg-emerald-50/70 border border-emerald-300 p-4 rounded-2xl text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold shrink-0 border border-emerald-200">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-emerald-900">
                  Jornada de Hoy: {shiftLabel}
                </p>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  Los pedidos mostrados corresponden exclusivamente a esta jornada. Los pedidos anteriores se conservan archivados en el Historial.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleTabChange('historial')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-emerald-200" />
              <span>Ver Historial Completo</span>
            </button>
          </div>

          {/* Banner Advertencia de Caja Cerrada */}
          {!activeRegister && (
            <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl text-amber-950 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                <div className="text-xs">
                  <span className="font-extrabold">⚠️ Caja Cerrada:</span> Para registrar el cobro de pedidos entregados es necesario abrir un turno en Tesorería.
                </div>
              </div>
              <button
                onClick={() => navigate('/caja')}
                className="px-3 py-1.5 rounded-xl bg-amber-800 text-white font-bold text-xs hover:bg-amber-900 transition shrink-0 shadow-xs"
              >
                Abrir Caja
              </button>
            </div>
          )}

          {/* Banner Advertencia de Caja Abierta de Jornada Anterior */}
          {activeRegister && isRegisterFromPreviousDay(activeRegister.openedAt) && (
            <div className="bg-amber-50 border-2 border-amber-500 p-4 rounded-2xl text-amber-950 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 animate-pulse" />
                <div className="text-xs">
                  <span className="font-extrabold">⚠️ Caja Abierta de una Jornada Anterior:</span> La caja activa fue abierta el <strong>{formatDate(activeRegister.openedAt)} hs</strong> ({activeRegister.openedBy}). Te recomendamos hacer el arqueo en Tesorería.
                </div>
              </div>
              <button
                onClick={() => navigate('/caja')}
                className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition shrink-0 shadow-xs"
              >
                Cerrar Caja Anterior
              </button>
            </div>
          )}

          {/* Kanban Board Columns */}
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {columns.map((col) => {
              const colOrders = currentShiftOrders.filter((o) => o.status === col.status);
              return (
                <div
                  key={col.status}
                  className="w-72 shrink-0 bg-brand-card rounded-2xl border border-brand-secondary p-4 shadow-soft space-y-3 flex flex-col justify-between"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between border-b border-brand-secondary pb-2">
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${col.color}`}>
                      {col.title}
                    </span>
                    <span className="text-xs font-bold text-brand-dark">{colOrders.length}</span>
                  </div>

                  {/* Orders List */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                    {colOrders.length === 0 ? (
                      <p className="text-center text-xs text-brand-brown/60 py-6 font-medium">Sin pedidos</p>
                    ) : (
                      colOrders.map((ord) => {
                        const next = getNextStatus(ord.status);
                        const prev = getPreviousStatus(ord.status);
                        return (
                          <div
                            key={ord.id}
                            className="bg-brand-bg rounded-xl p-3 border border-brand-secondary/70 space-y-2 text-xs shadow-xs hover:border-brand-brown/40 transition"
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-brand-brown font-mono">{ord.code}</span>
                              <span className="text-[10px] text-brand-dark uppercase bg-brand-cream px-2 py-0.5 rounded border">
                                {ord.tableName || ord.type}
                              </span>
                            </div>

                            <div className="space-y-1.5 pt-1 border-t border-brand-secondary/40">
                              {ord.items.map((it, i) => (
                                <div key={i} className="space-y-0.5 text-[11px] text-brand-dark">
                                  <div className="flex justify-between font-medium">
                                    <span>
                                      {it.quantity}x {it.productName}
                                    </span>
                                    <span className="font-bold">{formatCurrency(it.unitPrice * it.quantity)}</span>
                                  </div>
                                  {it.compositeItems && it.compositeItems.length > 0 && (
                                    <div className="pl-2 border-l-2 border-amber-400 bg-amber-50/60 py-0.5 px-1 rounded text-[10px] text-amber-950 font-medium space-y-0.5 my-0.5">
                                      {it.compositeItems.map((ci, cidx) => (
                                        <div key={cidx} className="flex items-center gap-1">
                                          <span className="text-amber-700 font-black">•</span>
                                          <span>{ci.quantity * it.quantity}x {ci.productName}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className="text-[11px] text-brand-brown/90 space-y-0.5 pt-1 border-t border-brand-secondary/40">
                              <p className="font-bold text-brand-dark">{ord.customerName}</p>
                              {ord.address && <p className="text-[10px] truncate">📍 {ord.address}</p>}
                              <p className="text-[10px] capitalize">Pago: {ord.paymentMethod}</p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-brand-secondary/40">
                              <span className="font-extrabold text-brand-dark text-xs">
                                {formatCurrency(ord.total)}
                              </span>

                              <div className="flex items-center gap-1">
                                {ord.status === 'cancelado' ? (
                                  <button
                                    onClick={() => updateOrderStatus(ord.id, 'nuevo')}
                                    className="py-1 px-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-extrabold transition-colors flex items-center gap-1 shadow-xs"
                                    title="Reactivar pedido"
                                  >
                                    <RotateCcw className="w-3 h-3 text-brand-yellow" /> Reactivar
                                  </button>
                                ) : (
                                  <>
                                    {prev && (
                                      <button
                                        onClick={() => updateOrderStatus(ord.id, prev)}
                                        className="p-1.5 rounded-lg bg-brand-bg hover:bg-brand-secondary/40 text-brand-brown border border-brand-secondary/80 transition-colors"
                                        title="Retroceder estado"
                                      >
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {next && (
                                      <button
                                        onClick={() => {
                                          if (next === 'entregado') {
                                            setChargingOrder(ord);
                                            setSelectedPayment(ord.paymentMethod);
                                          } else {
                                            updateOrderStatus(ord.id, next);
                                          }
                                        }}
                                        className={`py-1 px-2.5 rounded-lg text-brand-card text-[10px] font-bold transition-colors flex items-center gap-1 ${
                                          next === 'entregado' ? 'bg-brand-green hover:bg-emerald-800' : 'bg-brand-brown hover:bg-brand-dark'
                                        }`}
                                      >
                                        {next === 'entregado' ? 'Cobrar' : 'Avanzar'} <ArrowRight className="w-3 h-3" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => setCancelingOrderConfirm(ord)}
                                      className="p-1 rounded text-rose-700 hover:bg-rose-100"
                                      title="Cancelar pedido"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Confirmación de Cancelación */}
      {cancelingOrderConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border-2 border-rose-500 p-6 w-full max-w-md shadow-soft-lg space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto border border-rose-300">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-brand-dark">¿Cancelar Pedido {cancelingOrderConfirm.code}?</h3>
              <p className="text-xs text-brand-brown/80 mt-2 leading-relaxed">
                Estás a punto de cancelar el pedido de <strong>{cancelingOrderConfirm.customerName}</strong> ({cancelingOrderConfirm.tableName || 'Takeaway'}).
                El pedido pasará al estado <span className="font-extrabold text-rose-700">Cancelado</span> y la mesa actualizará su estado en tiempo real.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelingOrderConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark hover:bg-brand-secondary/30 transition"
              >
                No, Volver
              </button>
              <button
                type="button"
                onClick={() => {
                  updateOrderStatus(cancelingOrderConfirm.id, 'cancelado');
                  setCancelingOrderConfirm(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-700 text-white font-extrabold text-xs hover:bg-rose-800 transition shadow-soft"
              >
                Sí, Cancelar Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cobrar */}
      {chargingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 w-full max-w-sm shadow-soft-lg space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Banknote className="w-5 h-5 text-brand-green" />
              <h3 className="text-lg font-bold text-brand-dark">Cobrar Pedido</h3>
            </div>

            <div className="bg-brand-cream p-4 rounded-xl border border-brand-secondary text-sm space-y-2">
              <div className="flex justify-between text-brand-brown text-xs">
                <span>Pedido:</span> <strong>{chargingOrder.code}</strong>
              </div>
              <div className="flex justify-between text-brand-brown text-xs">
                <span>Cliente:</span> <strong>{chargingOrder.customerName}</strong>
              </div>
              <div className="flex justify-between text-lg mt-2 pt-2 border-t border-brand-secondary/40">
                <span className="font-bold text-brand-dark">Total:</span>{' '}
                <strong className="text-brand-dark">{formatCurrency(chargingOrder.total)}</strong>
              </div>
            </div>

            {!activeRegister ? (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl font-medium">
                No hay una caja abierta. Ve a Tesorería para abrir turno antes de cobrar.
              </div>
            ) : (
              <form onSubmit={handleCharge} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1">Confirmar Método de Pago</label>
                  <select
                    value={selectedPayment}
                    onChange={(e) => setSelectedPayment(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none capitalize text-xs font-bold"
                  >
                    <option value="efectivo">💵 Efectivo</option>
                    <option value="transferencia">🏦 Transferencia</option>
                    <option value="mercadopago">📲 MercadoPago</option>
                    <option value="debito">💳 Débito</option>
                    <option value="credito">💳 Crédito</option>
                    <option value="giftcard">🎁 Gift Card / Tarjeta de Regalo</option>
                  </select>
                </div>

                {selectedPayment === 'giftcard' && (
                  <div className="p-3 bg-brand-cream rounded-xl border border-brand-secondary space-y-2 animate-fade-in text-xs">
                    <label className="block font-extrabold text-brand-dark text-[11px] uppercase tracking-wider">
                      Código de Gift Card Virtual
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: GIFT-8921-MAG"
                      value={giftCardCodeInput}
                      onChange={(e) => setGiftCardCodeInput(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-brand-card border border-brand-secondary rounded-xl font-mono font-extrabold text-xs text-brand-dark tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                    />

                    {giftCardCodeInput.trim() && (() => {
                      const matched = getGiftCardByCode(giftCardCodeInput);
                      if (!matched) {
                        return (
                          <p className="text-[11px] font-bold text-rose-600">
                            ✕ No existe ninguna Gift Card con este código.
                          </p>
                        );
                      }
                      const hasEnough = matched.currentBalance >= chargingOrder.total;
                      return (
                        <div className="p-2.5 bg-brand-card rounded-lg border border-brand-secondary space-y-1">
                          <div className="flex justify-between font-bold text-[11px]">
                            <span>Para: <strong>{matched.recipientName}</strong></span>
                            <span className={hasEnough ? 'text-emerald-800' : 'text-rose-600'}>
                              Saldo: {formatCurrency(matched.currentBalance)}
                            </span>
                          </div>
                          {hasEnough ? (
                            <p className="text-[10px] text-emerald-800 font-bold">
                              ✓ Saldo suficiente para cubrir el pedido ({formatCurrency(chargingOrder.total)}).
                            </p>
                          ) : (
                            <p className="text-[10px] text-rose-600 font-bold">
                              ⚠️ Saldo insuficiente ({formatCurrency(matched.currentBalance)} disponible).
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* ── PROPINA DEL SERVICIO (10% Sugerido) ── */}
                {(() => {
                  const isCashier = user?.role === 'cajero' || user?.role === 'admin' || !user?.role;
                  const suggested10 = Math.round(chargingOrder.total * 0.1);
                  const suggested15 = Math.round(chargingOrder.total * 0.15);
                  const currentTipValue =
                    tipMode === '10'
                      ? suggested10
                      : tipMode === '15'
                      ? suggested15
                      : tipMode === 'custom'
                      ? customTipAmount
                      : 0;

                  return (
                    <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-300 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                          <span>🪙 Propina del Servicio</span>
                          <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-400">
                            10% Sugerido
                          </span>
                        </label>
                        <span className="text-[10px] text-amber-900 font-bold">
                          {isCashier ? `Cajero: ${user?.name || 'En turno'}` : 'Solo Cajero'}
                        </span>
                      </div>

                      {!isCashier ? (
                        <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium flex items-center gap-2">
                          <span>🔒</span>
                          <span>El registro de si hubo propina corresponde exclusivamente al Cajero al percibir el cobro.</span>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-4 gap-1.5 text-xs">
                            <button
                              type="button"
                              onClick={() => setTipMode('none')}
                              className={`py-2 px-1 rounded-xl font-bold border transition-all text-center ${
                                tipMode === 'none'
                                  ? 'bg-brand-dark text-white border-brand-dark shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <span className="block text-[11px]">Sin propina</span>
                              <span className="text-[9px] opacity-70">$0</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setTipMode('10')}
                              className={`py-2 px-1 rounded-xl font-black border transition-all text-center relative ${
                                tipMode === '10'
                                  ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-400'
                                  : 'bg-white text-amber-950 border-amber-300 hover:bg-amber-50'
                              }`}
                            >
                              <span className="block text-[11px]">⭐ 10%</span>
                              <span className="text-[9px] font-mono">{formatCurrency(suggested10)}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setTipMode('15')}
                              className={`py-2 px-1 rounded-xl font-bold border transition-all text-center ${
                                tipMode === '15'
                                  ? 'bg-brand-dark text-white border-brand-dark shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <span className="block text-[11px]">15%</span>
                              <span className="text-[9px] font-mono">{formatCurrency(suggested15)}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setTipMode('custom')}
                              className={`py-2 px-1 rounded-xl font-bold border transition-all text-center ${
                                tipMode === 'custom'
                                  ? 'bg-brand-dark text-white border-brand-dark shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <span className="block text-[11px]">Otro $</span>
                              <span className="text-[9px] opacity-70">Libre</span>
                            </button>
                          </div>

                          {tipMode === 'custom' && (
                            <div className="pt-1">
                              <input
                                type="number"
                                min={0}
                                step={50}
                                placeholder="Ingresá monto de propina $"
                                value={customTipAmount || ''}
                                onChange={(e) => setCustomTipAmount(Math.max(0, Number(e.target.value)))}
                                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                              />
                            </div>
                          )}

                          {/* Resumen Total con Propina */}
                          <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200 text-xs space-y-1">
                            <div className="flex justify-between text-gray-600 text-[11px]">
                              <span>Consumo Pedido:</span>
                              <span className="font-bold text-gray-800">{formatCurrency(chargingOrder.total)}</span>
                            </div>
                            {currentTipValue > 0 && (
                              <div className="flex justify-between text-emerald-800 font-bold text-[11px]">
                                <span>Propina ({tipMode === '10' ? '10%' : tipMode === '15' ? '15%' : `${Math.round((currentTipValue / chargingOrder.total) * 100)}%`}):</span>
                                <span>+{formatCurrency(currentTipValue)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-black text-sm text-brand-dark pt-1 border-t border-gray-200">
                              <span>Total a Cobrar:</span>
                              <span className="text-emerald-900 font-mono text-base">
                                {formatCurrency(chargingOrder.total + currentTipValue)}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setChargingOrder(null);
                      setGiftCardCodeInput('');
                      setTipMode('10');
                      setCustomTipAmount(0);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark hover:bg-brand-secondary/30 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-brand-green text-brand-card font-bold text-xs hover:bg-emerald-800 transition"
                  >
                    Confirmar y Entregar
                  </button>
                </div>
              </form>
            )}

            {!activeRegister && (
              <button
                type="button"
                onClick={() => setChargingOrder(null)}
                className="w-full py-2.5 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark hover:bg-brand-secondary/30 transition mt-2"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de Comprobante de Pago (A4 y 58mm) */}
      <OrderReceiptModal
        order={receiptOrder}
        isOpen={!!receiptOrder}
        onClose={() => setReceiptOrder(null)}
        staffName={user ? `${user.name} (${user.role})` : undefined}
      />
    </div>
  );
};
