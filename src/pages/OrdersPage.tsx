import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ArrowLeft, CheckCircle2, Clock, Truck, XCircle, MapPin, Phone, Banknote, RotateCcw, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus, PaymentMethod } from '../types';
import { formatCurrency, formatDate } from '../utils/currency';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders, updateOrderStatus, addTransaction, cashRegisters } = useApp();
  const [chargingOrder, setChargingOrder] = useState<Order | null>(null);
  const [cancelingOrderConfirm, setCancelingOrderConfirm] = useState<Order | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('efectivo');

  const activeRegister = cashRegisters.find(r => r.status === 'abierta');

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
    
    // Impact caja
    addTransaction({
      registerId: activeRegister.id,
      orderId: chargingOrder.id,
      type: 'ingreso',
      amount: chargingOrder.total,
      paymentMethod: selectedPayment,
      description: `Cobro Pedido ${chargingOrder.code}`,
      registeredBy: user ? `${user.name} (${user.role})` : 'Cajero',
    });

    updateOrderStatus(chargingOrder.id, 'entregado');
    setChargingOrder(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Bar */}
      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-dark">Panel de Pedidos & Comanda de Cocina</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Seguimiento en tiempo real por Kanban ({orders.length} pedidos totales)
          </p>
        </div>
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
          const colOrders = orders.filter((o) => o.status === col.status);
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
                        className="bg-brand-bg rounded-xl p-3 border border-brand-secondary/70 space-y-2 text-xs shadow-xs"
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-brand-brown font-mono">{ord.code}</span>
                          <span className="text-[10px] text-brand-dark uppercase bg-brand-cream px-2 py-0.5 rounded border">
                            {ord.tableName || ord.type}
                          </span>
                        </div>

                        <div className="space-y-1 pt-1 border-t border-brand-secondary/40">
                          {ord.items.map((it, i) => (
                            <div key={i} className="flex justify-between text-[11px] text-brand-dark">
                              <span>
                                {it.quantity}x {it.productName}
                              </span>
                              <span className="font-bold">{formatCurrency(it.unitPrice * it.quantity)}</span>
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
                                    className={`py-1 px-2.5 rounded-lg text-brand-card text-[10px] font-bold transition-colors flex items-center gap-1 ${next === 'entregado' ? 'bg-brand-green hover:bg-emerald-800' : 'bg-brand-brown hover:bg-brand-dark'}`}
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
              <div className="flex justify-between text-brand-brown text-xs"><span>Pedido:</span> <strong>{chargingOrder.code}</strong></div>
              <div className="flex justify-between text-brand-brown text-xs"><span>Cliente:</span> <strong>{chargingOrder.customerName}</strong></div>
              <div className="flex justify-between text-lg mt-2 pt-2 border-t border-brand-secondary/40"><span className="font-bold text-brand-dark">Total:</span> <strong className="text-brand-dark">{formatCurrency(chargingOrder.total)}</strong></div>
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
                    onChange={e => setSelectedPayment(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none capitalize"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="mercadopago">MercadoPago</option>
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setChargingOrder(null)} className="flex-1 py-2.5 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark hover:bg-brand-secondary/30 transition">Cancelar</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-green text-brand-card font-bold text-xs hover:bg-emerald-800 transition">Confirmar y Entregar</button>
                </div>
              </form>
            )}
            
            {!activeRegister && (
               <button type="button" onClick={() => setChargingOrder(null)} className="w-full py-2.5 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark hover:bg-brand-secondary/30 transition mt-2">Cerrar</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
