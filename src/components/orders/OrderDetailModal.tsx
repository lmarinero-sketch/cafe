import React, { useState } from 'react';
import { X, Printer, Clock, User, Phone, MapPin, CreditCard, Banknote, ShoppingBag, UtensilsCrossed, Truck, CheckCircle2, RotateCcw, Award, Receipt } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/currency';
import { OrderReceiptModal } from './OrderReceiptModal';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, status: OrderStatus) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose, onUpdateStatus }) => {
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  if (!order) return null;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'nuevo':
        return { text: 'Nuevo', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'confirmado':
        return { text: 'Confirmado', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'en_preparacion':
        return { text: 'En Preparación', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'listo':
        return { text: 'Listo para Servir/Entregar', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'en_camino':
        return { text: 'En Camino (Delivery)', bg: 'bg-sky-100 text-sky-900 border-sky-300' };
      case 'entregado':
        return { text: 'Entregado / Cobrado', bg: 'bg-gray-100 text-gray-800 border-gray-300' };
      case 'cancelado':
        return { text: 'Cancelado', bg: 'bg-rose-100 text-rose-950 border-rose-300' };
      default:
        return { text: status, bg: 'bg-brand-secondary text-brand-dark' };
    }
  };

  const statusBadge = getStatusBadge(order.status);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-brand-card rounded-3xl border border-brand-secondary p-6 w-full max-w-lg shadow-soft-lg space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-brand-secondary/70 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-extrabold text-brand-dark">{order.code}</span>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}>
                {statusBadge.text}
              </span>
            </div>
            <p className="text-xs text-brand-brown/80 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-brown" />
              <span>{formatDate(order.createdAt)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-brand-secondary/40 text-brand-brown hover:text-brand-dark transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Meta / Context */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-brand-bg p-3.5 rounded-2xl border border-brand-secondary/60">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-brand-brown/70 tracking-wider">Canal / Ubicación</span>
            <div className="flex items-center gap-1.5 font-bold text-brand-dark">
              {order.type === 'salon' ? (
                <UtensilsCrossed className="w-4 h-4 text-brand-brown" />
              ) : order.type === 'delivery' ? (
                <Truck className="w-4 h-4 text-sky-700" />
              ) : (
                <ShoppingBag className="w-4 h-4 text-amber-700" />
              )}
              <span className="capitalize">{order.tableName || (order.type === 'retiro' ? 'Retiro en Mostrador' : 'Envío Delivery')}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-brand-brown/70 tracking-wider">Atendido por</span>
            <p className="font-bold text-brand-dark truncate">{order.waiterName || 'Personal de Turno'}</p>
          </div>

          <div className="col-span-2 pt-2 border-t border-brand-secondary/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-brand-brown/70 tracking-wider">Cliente</span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <p className="font-extrabold text-brand-dark flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-brown" />
                {order.customerName}
              </p>
              {order.customerPhone && (
                <p className="text-brand-brown flex items-center gap-1 font-mono text-[11px]">
                  <Phone className="w-3 h-3 text-brand-brown" />
                  {order.customerPhone}
                </p>
              )}
            </div>
            {order.address && (
              <p className="text-[11px] text-brand-dark flex items-start gap-1 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-brand-brown shrink-0 mt-0.5" />
                <span>{order.address} {order.addressRef && `(${order.addressRef})`}</span>
              </p>
            )}
          </div>
        </div>

        {/* Products List Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-brand-dark px-1">
            <span>Detalle de Productos</span>
            <span>{order.items.reduce((sum, it) => sum + it.quantity, 0)} unidades</span>
          </div>

          <div className="border border-brand-secondary/70 rounded-2xl overflow-hidden bg-brand-card divide-y divide-brand-secondary/40">
            {order.items.map((it, idx) => (
              <div key={idx} className="p-3 text-xs flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-brand-cream border border-brand-secondary/80 flex items-center justify-center font-extrabold text-brand-dark text-xs shrink-0">
                    {it.quantity}x
                  </span>
                  <div>
                    <p className="font-bold text-brand-dark">{it.productName}</p>
                    {it.notes && (
                      <p className="text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                        Nota: {it.notes}
                      </p>
                    )}
                    <p className="text-[10px] text-brand-brown/70">{formatCurrency(it.unitPrice)} c/u</p>
                  </div>
                </div>
                <span className="font-extrabold text-brand-dark text-xs shrink-0">
                  {formatCurrency(it.unitPrice * it.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-brand-cream/80 p-4 rounded-2xl border border-brand-secondary/70 space-y-2 text-xs">
          <div className="flex justify-between text-brand-brown">
            <span>Subtotal de productos:</span>
            <span>{formatCurrency(order.subtotal || order.total - (order.deliveryFee || 0))}</span>
          </div>

          {(order.deliveryFee || 0) > 0 && (
            <div className="flex justify-between text-brand-brown">
              <span>Costo de envío (Delivery):</span>
              <span>{formatCurrency(order.deliveryFee)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-extrabold text-brand-dark pt-2 border-t border-brand-secondary/60">
            <span>Total del Pedido:</span>
            <span className="text-base text-brand-dark">{formatCurrency(order.total)}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-brand-brown/90 pt-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Banknote className="w-3.5 h-3.5 text-brand-green" /> Medio de pago: <strong className="capitalize text-brand-dark">{order.paymentMethod}</strong>
            </span>
            {(order.pointsEarned || 0) > 0 && (
              <span className="flex items-center gap-1 text-emerald-800 font-bold">
                <Award className="w-3.5 h-3.5 text-brand-yellow" /> +{order.pointsEarned} pts
              </span>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsReceiptModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-soft"
          >
            <Receipt className="w-4 h-4 text-brand-yellow" /> Imprimir Comprobante
          </button>

          {order.status === 'cancelado' && onUpdateStatus && (
            <button
              type="button"
              onClick={() => {
                onUpdateStatus(order.id, 'nuevo');
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-soft"
            >
              <RotateCcw className="w-4 h-4 text-brand-yellow" /> Reactivar Pedido
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-brand-brown hover:bg-brand-dark text-white font-bold text-xs transition"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal Comprobante A4 / Térmico 58mm */}
      <OrderReceiptModal
        order={order}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
};
