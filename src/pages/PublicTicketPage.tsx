import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Receipt,
  Printer,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UtensilsCrossed,
  Truck,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Coffee,
  Sparkles,
  Award,
} from 'lucide-react';
import { Order, PaymentMethod } from '../types';
import { formatCurrency, formatDate } from '../utils/currency';
import { useApp } from '../context/AppContext';
import { getOrderByCode } from '../services/orders.service';

export const PublicTicketPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { orders } = useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      if (!code) {
        setIsLoading(false);
        return;
      }

      const cleanCode = code.trim().toUpperCase();

      // 1. Try finding in current app state (in memory or localStorage)
      const cached = orders.find((o) => o.code.toUpperCase() === cleanCode);
      if (cached) {
        if (isMounted) {
          setOrder(cached);
          setIsLoading(false);
        }
        return;
      }

      // 2. Query from Supabase directly
      try {
        const remoteOrder = await getOrderByCode(cleanCode);
        if (isMounted) {
          setOrder(remoteOrder);
        }
      } catch (err) {
        console.error('Error fetching ticket order:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [code, orders]);

  const getPaymentMethodLabel = (pm: PaymentMethod | string | undefined) => {
    switch (pm) {
      case 'efectivo':
        return 'Efectivo';
      case 'transferencia':
        return 'Transferencia Bancaria / QR';
      case 'mercadopago':
        return 'Mercado Pago';
      case 'debito':
        return 'Tarjeta de Débito';
      case 'credito':
        return 'Tarjeta de Crédito';
      case 'giftcard':
        return 'Gift Card Virtual (Saldo)';
      default:
        return pm || 'Efectivo';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!order) return;
    const url = window.location.href;
    const itemsList = order.items
      .map((i) => `• ${i.quantity}x ${i.productName} (${formatCurrency(i.unitPrice * i.quantity)})`)
      .join('\n');

    const msg = `🧾 *COMPROBANTE DE CONSUMO #${order.code}*\n*Café Magnolia - Hilos de Amor*\n_(Documento no válido como factura)_\n\n👤 Cliente: ${order.customerName}\n📍 Modalidad: ${order.tableName || order.type.toUpperCase()}\n\n*Detalle del Pedido:*\n${itemsList}\n\n💰 *TOTAL:* ${formatCurrency(order.total)}\n💳 *Medio de Pago:* ${getPaymentMethodLabel(order.paymentMethod)}\n\n👉 *Ver Comprobante Digital:* ${url}\n\n¡Gracias por tu visita! ☕✨`;

    const cleanPhone = (order.customerPhone || '').replace(/\D/g, '');
    const waUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f4ee] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-amber-600 border-t-transparent animate-spin mb-4" />
        <p className="text-amber-950 font-bold text-sm tracking-wide">Cargando comprobante digital...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f7f4ee] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 border border-amber-300 shadow-sm">
          <Receipt className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-extrabold text-amber-950 font-serif">Comprobante no encontrado</h1>
        <p className="text-xs text-amber-900/80 max-w-sm mt-2">
          No pudimos localizar el ticket con el código <strong>{code}</strong>. Es posible que el código sea incorrecto o que el pedido haya sido cancelado.
        </p>
        <Link
          to="/menu"
          className="mt-6 px-6 py-2.5 rounded-xl bg-amber-800 text-white font-extrabold text-xs shadow-md hover:bg-amber-900 transition flex items-center gap-2"
        >
          <Coffee className="w-4 h-4" />
          <span>Ver Menú Digital</span>
        </Link>
      </div>
    );
  }

  const pointsEarned = Math.floor(order.total / 10);
  const orderTimeStr = new Date(order.createdAt).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const orderDateStr = new Date(order.createdAt).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#f3efe6] text-gray-900 font-sans p-3 sm:p-6 flex flex-col items-center justify-center print:bg-white print:p-0">
      <div className="w-full max-w-md space-y-4">
        {/* Top Floating App Bar */}
        <div className="flex items-center justify-between px-2 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black font-serif text-amber-950 tracking-tight">CAFÉ MAGNOLIA</span>
            <span className="text-[10px] font-extrabold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
              Ticket Digital
            </span>
          </div>
          <Link
            to="/menu"
            className="text-xs font-extrabold text-amber-900 hover:text-amber-950 flex items-center gap-1 bg-white/80 px-3 py-1.5 rounded-xl border border-amber-200 shadow-xs backdrop-blur-xs transition"
          >
            <span>Carta Online</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* The Digital Paper Receipt Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-amber-200/80 overflow-hidden relative print:shadow-none print:border-none print:rounded-none">
          {/* Header Strip with Zigzag edge effect on bottom */}
          <div className="bg-[#2b1810] text-white p-6 text-center space-y-2 relative">
            <div className="w-12 h-12 rounded-2xl bg-white/10 mx-auto flex items-center justify-center border border-white/20 mb-1">
              <Coffee className="w-6 h-6 text-amber-300" />
            </div>
            <h2 className="text-xl font-black font-serif tracking-wider text-amber-100">CAFÉ MAGNOLIA</h2>
            <p className="text-[11px] text-amber-200/80 font-medium">Hilos de Amor Resto & Café Gourmet</p>
            <p className="text-[10px] text-gray-300">
              Av. Principal 1234, CABA • Tel: (011) 5432-1980
            </p>

            <div className="pt-2 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 bg-emerald-950/80 text-emerald-300 text-[10px] font-extrabold px-3 py-1 rounded-full border border-emerald-500/40">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Pago Confirmado
              </span>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-4">
            {/* Non-Fiscal Notice */}
            <div className="bg-amber-50 border border-dashed border-amber-300 p-2.5 rounded-xl text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1.5 text-amber-900 font-extrabold text-[11px] uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Documento No Válido Como Factura</span>
              </div>
              <p className="text-[10px] text-amber-800/80">Comprobante de consumo interno y entrega</p>
            </div>

            {/* Ticket Metadata Grid */}
            <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Número de Ticket</span>
                <span className="font-mono text-sm font-extrabold text-amber-950">#{order.code}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Fecha y Hora</span>
                <span className="font-extrabold text-gray-900 text-[11px]">
                  {orderDateStr} {orderTimeStr}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Ubicación / Modalidad</span>
                <span className="font-extrabold text-gray-900 flex items-center gap-1 mt-0.5">
                  {order.type === 'salon' ? (
                    <UtensilsCrossed className="w-3.5 h-3.5 text-amber-800" />
                  ) : order.type === 'delivery' ? (
                    <Truck className="w-3.5 h-3.5 text-sky-700" />
                  ) : (
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                  )}
                  {order.tableName || order.type.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Cliente</span>
                <span className="font-extrabold text-gray-900 truncate block">
                  {order.customerName || 'Consumidor Final'}
                </span>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between font-extrabold text-[10px] text-gray-500 uppercase tracking-wider pb-1 border-b border-gray-200">
                <span>Cant. / Detalle</span>
                <span>Total</span>
              </div>

              <div className="divide-y divide-gray-100">
                {order.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex items-start justify-between gap-2 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-amber-900 mr-0.5 font-extrabold">{it.quantity}x</span>
                        <span>{it.productName}</span>
                        {it.isComposite && (
                          <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-1.5 py-0.2 rounded">
                            📦 COMBO
                          </span>
                        )}
                      </div>
                      {it.compositeItems && it.compositeItems.length > 0 && (
                        <div className="text-[10px] text-amber-950 font-medium bg-amber-50/90 p-1.5 rounded-lg border border-amber-200/80 ml-5 my-1 space-y-0.5">
                          <span className="font-extrabold uppercase text-[9px] text-amber-900 block">Incluye:</span>
                          {it.compositeItems.map((ci, cidx) => (
                            <div key={cidx} className="flex items-center gap-1">
                              <span className="text-amber-700 font-black">•</span>
                              <span>{ci.quantity * it.quantity}x {ci.productName}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {it.notes && (
                        <p className="text-[10px] text-gray-500 italic pl-5">• {it.notes}</p>
                      )}
                      <div className="text-[10px] text-gray-400 pl-5">
                        {formatCurrency(it.unitPrice)} c/u
                      </div>
                    </div>
                    <span className="font-extrabold text-gray-900 whitespace-nowrap pt-0.5">
                      {formatCurrency(it.unitPrice * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="border-t-2 border-dashed border-gray-300 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal Consumo:</span>
                <span className="font-bold text-gray-900">{formatCurrency(order.subtotal || order.total)}</span>
              </div>
              {order.deliveryFee ? (
                <div className="flex justify-between text-gray-600">
                  <span>Costo de Envío:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(order.deliveryFee)}</span>
                </div>
              ) : null}
              {order.tipAmount && order.tipAmount > 0 ? (
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Propina del Servicio ({order.tipPercentage || 10}%):</span>
                  <span>+{formatCurrency(order.tipAmount)}</span>
                </div>
              ) : null}

              <div className="flex justify-between items-baseline pt-2 border-t-2 border-gray-900">
                <div>
                  <span className="text-sm font-black text-amber-950 block">TOTAL ABONADO</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">
                    Medio: {getPaymentMethodLabel(order.paymentMethod)}
                    {order.tipRegisteredBy && ` • Propina reg. por: ${order.tipRegisteredBy}`}
                  </span>
                </div>
                <span className="text-xl font-black text-emerald-800 font-mono">
                  {formatCurrency(order.total + (order.tipAmount || 0))}
                </span>
              </div>
            </div>

            {/* Loyalty Banner */}
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-[11px] block">Club Fidelización Hilos de Amor</span>
                  <span className="text-[10px] text-emerald-800">Sumaste puntos con esta compra</span>
                </div>
              </div>
              <span className="font-mono font-black text-emerald-900 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-xs">
                +{pointsEarned} pts
              </span>
            </div>

            {/* Footer Notice */}
            <div className="text-center pt-2 text-gray-500 text-[10px] space-y-1">
              <p className="font-bold text-gray-700">¡Muchas gracias por elegir Café Magnolia!</p>
              <p className="text-[9px]">Seguinos en Instagram: @cafemagnolia</p>
              <p className="text-[8px] text-gray-400">
                Ticket digital generado electrónicamente • Sin validez fiscal
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="space-y-2.5 print:hidden">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-3 px-4 rounded-2xl bg-white hover:bg-amber-50 text-amber-950 border border-amber-300 font-extrabold text-xs shadow-xs transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4 text-amber-800" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 text-amber-200" />
              <span>WhatsApp</span>
            </button>
          </div>

          <Link
            to="/menu"
            className="w-full py-3 px-4 rounded-2xl bg-amber-900 hover:bg-amber-950 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 text-center"
          >
            <Coffee className="w-4 h-4 text-amber-300" />
            <span>Ver Carta & Hacer Otro Pedido</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
