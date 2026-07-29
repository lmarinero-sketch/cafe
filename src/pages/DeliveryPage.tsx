import React from 'react';
import { Truck, MapPin, Phone, User, CreditCard, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/currency';

export const DeliveryPage: React.FC = () => {
  const { orders, updateOrderStatus } = useApp();

  const deliveryOrders = orders.filter((o) => o.type === 'delivery');

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Bar */}
      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-dark">Despacho & Delivery</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Gestión de envíos a domicilio y repartidores ({deliveryOrders.length} envíos totales)
          </p>
        </div>
      </div>

      {/* Delivery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deliveryOrders.map((ord) => (
          <div
            key={ord.id}
            className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-brand-brown text-sm">{ord.code}</span>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-brand-yellow/30 text-brand-dark">
                  {ord.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1 bg-brand-bg p-3 rounded-xl border border-brand-secondary/60">
                <p className="font-bold text-brand-dark flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-brown" /> {ord.customerName}
                </p>
                <p className="text-[11px] text-brand-brown/90 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-brand-brown" /> {ord.customerPhone}
                </p>
                {ord.address && (
                  <p className="text-[11px] text-brand-dark font-medium flex items-start gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-brown shrink-0 mt-0.5" />
                    <span>
                      {ord.address} {ord.addressRef && `(${ord.addressRef})`}
                    </span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <p className="font-bold text-brand-dark">Productos:</p>
                {ord.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] text-brand-brown">
                    <span>
                      {it.quantity}x {it.productName}
                    </span>
                    <span className="font-bold">{formatCurrency(it.unitPrice * it.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="bg-brand-cream p-2.5 rounded-xl border border-brand-secondary/60 space-y-1">
                <div className="flex justify-between text-[11px] text-brand-brown">
                  <span>Costo de envío:</span>
                  <span>{formatCurrency(ord.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-brand-dark text-xs pt-1 border-t border-brand-secondary/40">
                  <span>Total:</span>
                  <span>{formatCurrency(ord.total)}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-brand-secondary/60 flex items-center justify-between">
              <span className="text-[10px] text-brand-brown/70">{formatDate(ord.createdAt)}</span>
              {ord.status !== 'entregado' && (
                <button
                  onClick={() => updateOrderStatus(ord.id, 'en_camino')}
                  className="py-1.5 px-3 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors flex items-center gap-1"
                >
                  <Truck className="w-3.5 h-3.5 text-brand-yellow" /> Enviar en camino
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
