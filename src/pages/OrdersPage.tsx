import React, { useState } from 'react';
import { ShoppingBag, ArrowRight, CheckCircle2, Clock, Truck, XCircle, MapPin, Phone, Banknote } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus, PaymentMethod } from '../types';
import { formatCurrency, formatDate } from '../utils/currency';

export const OrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, addTransaction, cashRegisters } = useApp();
  const [chargingOrder, setChargingOrder] = useState<Order | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('efectivo');

  const activeRegister = cashRegisters.find(r => r.status === 'abierta');

  const columns: { status: OrderStatus; title: string; color: string }[] = [
    { status: 'nuevo', title: 'Nuevo', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    { status: 'confirmado', title: 'Confirmado', color: 'bg-blue-100 text-blue-900 border-blue-300' },
    { status: 'en_preparacion', title: 'En preparación', color: 'bg-purple-100 text-purple-900 border-purple-300' },
    { status: 'listo', title: 'Listo', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    { status: 'en_camino', title: 'En camino', color: 'bg-sky-100 text-sky-900 border-sky-300' },
    { status: 'entregado', title: 'Entregado', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  ];

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
                              onClick={() => updateOrderStatus(ord.id, 'cancelado')}
                              className="p-1 rounded text-rose-700 hover:bg-rose-100"
                              title="Cancelar pedido"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
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
