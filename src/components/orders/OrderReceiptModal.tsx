import React, { useState } from 'react';
import {
  X,
  Printer,
  FileText,
  Receipt,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Download,
  UtensilsCrossed,
  Truck,
  ShoppingBag,
  CreditCard,
  Banknote,
  Gift,
  QrCode,
  Smartphone,
} from 'lucide-react';
import { Order, PaymentMethod } from '../../types';
import { formatCurrency, formatDate } from '../../utils/currency';

interface OrderReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  staffName?: string;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
  staffName,
}) => {
  const [format, setFormat] = useState<'58mm' | 'a4'>('58mm');

  if (!isOpen || !order) return null;

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

  // Generate Clean HTML for Thermal 58mm Printing
  const generateThermal58mmHTML = (ord: Order) => {
    const qrData = encodeURIComponent(`COMPROBANTE:${ord.code}:${ord.total}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrData}`;

    const itemsHtml = ord.items
      .map(
        (it) => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 11px;">
          <div style="flex: 1; padding-right: 4px;">
            <strong>${it.quantity}x</strong> ${it.productName}
            ${it.notes ? `<div style="font-size: 9px; color: #555; padding-left: 10px;">• ${it.notes}</div>` : ''}
          </div>
          <div style="text-align: right; white-space: nowrap; font-weight: bold;">
            ${formatCurrency(it.unitPrice * it.quantity)}
          </div>
        </div>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Ticket #${ord.code}</title>
        <style>
          @page {
            size: 58mm auto;
            margin: 0mm;
          }
          body {
            font-family: 'Courier New', Courier, monospace, ui-monospace;
            width: 58mm;
            max-width: 58mm;
            margin: 0 auto;
            padding: 8px 6px 16px 6px;
            color: #000;
            background: #fff;
            font-size: 11px;
            line-height: 1.25;
            box-sizing: border-box;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .double-divider { border-top: 2px solid #000; margin: 6px 0; }
          .non-fiscal-banner {
            border: 1px solid #000;
            padding: 4px 2px;
            margin: 6px 0;
            font-size: 10px;
            font-weight: 900;
            text-align: center;
            letter-spacing: 0.5px;
          }
          .qr-container {
            text-align: center;
            margin: 8px 0;
          }
          .qr-container img {
            width: 80px;
            height: 80px;
          }
          @media print {
            body { padding: 4px 2px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="text-center font-bold" style="font-size: 14px; letter-spacing: 1px;">CAFÉ MAGNOLIA</div>
        <div class="text-center" style="font-size: 10px;">Hilos de Amor Resto & Café</div>
        <div class="text-center" style="font-size: 9px; color: #333;">Av. Principal 1234 • CABA</div>
        <div class="text-center" style="font-size: 9px;">Tel: (011) 5432-1980</div>
        
        <div class="non-fiscal-banner">
          *** COMPROBANTE NO FISCAL ***<br/>
          DOCUMENTO NO VÁLIDO COMO FACTURA
        </div>

        <div style="font-size: 10px;">
          <div><strong>Ticket:</strong> #${ord.code}</div>
          <div><strong>Fecha:</strong> ${orderDateStr} ${orderTimeStr}</div>
          <div><strong>Tipo:</strong> ${ord.tableName ? `Mesa: ${ord.tableName}` : ord.type.toUpperCase()}</div>
          <div><strong>Cliente:</strong> ${ord.customerName || 'Consumidor Final'}</div>
          ${ord.customerPhone ? `<div><strong>Tel:</strong> ${ord.customerPhone}</div>` : ''}
          ${staffName ? `<div><strong>Atendido:</strong> ${staffName}</div>` : ''}
        </div>

        <div class="divider"></div>
        <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: bold; margin-bottom: 4px;">
          <span>CANT / ARTICULO</span>
          <span>IMPORTE</span>
        </div>
        <div class="divider"></div>

        ${itemsHtml}

        <div class="divider"></div>
        <div style="display: flex; justify-content: space-between; font-size: 10px;">
          <span>SUBTOTAL:</span>
          <span>${formatCurrency(ord.subtotal || ord.total)}</span>
        </div>
        ${ord.deliveryFee ? `
          <div style="display: flex; justify-content: space-between; font-size: 10px;">
            <span>ENVÍO:</span>
            <span>${formatCurrency(ord.deliveryFee)}</span>
          </div>
        ` : ''}
        
        <div class="double-divider"></div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 900;">
          <span>TOTAL:</span>
          <span>${formatCurrency(ord.total)}</span>
        </div>
        <div class="double-divider"></div>

        <div style="font-size: 10px; margin-top: 4px;">
          <div><strong>FORMA DE PAGO:</strong> ${getPaymentMethodLabel(ord.paymentMethod).toUpperCase()}</div>
          <div style="color: #222; margin-top: 2px;">⭐ Puntos del Club: +${pointsEarned} pts</div>
        </div>

        <div class="qr-container">
          <img src="${qrUrl}" alt="QR Comprobante" />
          <div style="font-size: 8px; color: #555;">Verificación Digital</div>
        </div>

        <div class="divider"></div>
        <div class="text-center font-bold" style="font-size: 10px;">¡GRACIAS POR TU VISITA!</div>
        <div class="text-center" style="font-size: 9px; color: #444; margin-top: 2px;">
          Seguinos en Instagram: @cafemagnolia
        </div>
        <div class="text-center" style="font-size: 8px; color: #666; margin-top: 6px;">
          Comprobante de consumo interno.<br/>
          Sin validez tributaria.
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;
  };

  // Generate Clean HTML for Full A4 PDF / Printing
  const generateA4HTML = (ord: Order) => {
    const qrData = encodeURIComponent(`COMPROBANTE:${ord.code}:${ord.total}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`;

    const itemsRows = ord.items
      .map(
        (it, idx) => `
        <tr style="border-bottom: 1px solid #e5e7eb; background: ${idx % 2 === 0 ? '#fafafa' : '#ffffff'};">
          <td style="padding: 10px 12px; font-weight: 800; color: #1f2937; width: 60px; text-align: center;">${it.quantity}</td>
          <td style="padding: 10px 12px; color: #111827;">
            <div style="font-weight: 700;">${it.productName}</div>
            ${it.notes ? `<div style="font-size: 11px; color: #6b7280; margin-top: 2px;">Nota: ${it.notes}</div>` : ''}
          </td>
          <td style="padding: 10px 12px; text-align: right; color: #4b5563;">${formatCurrency(it.unitPrice)}</td>
          <td style="padding: 10px 12px; text-align: right; font-weight: 800; color: #111827;">${formatCurrency(it.unitPrice * it.quantity)}</td>
        </tr>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Comprobante de Pago #${ord.code} - Café Magnolia</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1f2937;
            background: #fff;
            margin: 0;
            padding: 20px;
            font-size: 13px;
            line-height: 1.5;
          }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .non-fiscal-alert {
            background: #fffbeb;
            border: 2px dashed #f59e0b;
            color: #b45309;
            padding: 10px 16px;
            border-radius: 8px;
            text-align: center;
            font-weight: 800;
            font-size: 13px;
            letter-spacing: 0.5px;
            margin-bottom: 24px;
          }
          .data-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 14px 18px;
            margin-bottom: 20px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }
          .items-table th {
            background: #2b1810;
            color: #fff;
            text-align: left;
            padding: 10px 12px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .totals-table { width: 280px; margin-left: auto; border-collapse: collapse; }
          .totals-table td { padding: 6px 8px; }
          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 11px;
            color: #6b7280;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <table class="header-table">
          <tr>
            <td style="vertical-align: top; width: 60%;">
              <div style="font-size: 24px; font-weight: 900; color: #2b1810; font-family: serif; letter-spacing: -0.5px;">
                CAFÉ MAGNOLIA
              </div>
              <div style="font-size: 13px; color: #78350f; font-weight: 700;">Hilos de Amor Gastro-Platform</div>
              <div style="font-size: 12px; color: #4b5563; margin-top: 4px;">
                Av. Principal 1234, Ciudad Autónoma de Buenos Aires<br/>
                Tel: (011) 5432-1980 • Email: contacto@cafemagnolia.com.ar<br/>
                IVA Responsable No Inscripto / Control Interno
              </div>
            </td>
            <td style="vertical-align: top; text-align: right;">
              <div style="background: #2b1810; color: #fff; padding: 12px 18px; border-radius: 8px; display: inline-block; text-align: right;">
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #fde68a;">COMPROBANTE DE PAGO</div>
                <div style="font-size: 20px; font-weight: 900; font-family: monospace;">#${ord.code}</div>
                <div style="font-size: 11px; color: #f3f4f6; margin-top: 2px;">Fecha: ${orderDateStr} ${orderTimeStr}</div>
              </div>
            </td>
          </tr>
        </table>

        <!-- Banner NO FISCAL -->
        <div class="non-fiscal-alert">
          ⚠️ DOCUMENTO NO VÁLIDO COMO FACTURA • COMPROBANTE DE CONTROL INTERNO DE CONSUMO
        </div>

        <!-- Meta Grid -->
        <div class="data-box">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
              <td style="width: 33%; vertical-align: top;">
                <strong style="color: #6b7280; text-transform: uppercase; font-size: 10px; display: block;">DATOS DEL CLIENTE</strong>
                <div style="font-size: 14px; font-weight: 800; color: #111827; margin-top: 2px;">${ord.customerName || 'Consumidor Final'}</div>
                ${ord.customerPhone ? `<div style="color: #4b5563;">Tel: ${ord.customerPhone}</div>` : ''}
              </td>
              <td style="width: 33%; vertical-align: top;">
                <strong style="color: #6b7280; text-transform: uppercase; font-size: 10px; display: block;">UBICACIÓN / MODALIDAD</strong>
                <div style="font-size: 14px; font-weight: 800; color: #111827; margin-top: 2px;">
                  ${ord.tableName ? `Salón - ${ord.tableName}` : ord.type === 'retiro' ? 'Retiro en Mostrador / Take Away' : 'Envío Delivery'}
                </div>
                ${ord.address ? `<div style="color: #4b5563;">Dir: ${ord.address} ${ord.addressRef ? `(${ord.addressRef})` : ''}</div>` : ''}
              </td>
              <td style="width: 33%; vertical-align: top; text-align: right;">
                <strong style="color: #6b7280; text-transform: uppercase; font-size: 10px; display: block;">FORMA DE PAGO & ESTADO</strong>
                <div style="font-size: 13px; font-weight: 800; color: #065f46; margin-top: 2px;">
                  💳 ${getPaymentMethodLabel(ord.paymentMethod)}
                </div>
                <div style="color: #059669; font-size: 11px; font-weight: 700;">● Pago Confirmado / Entregado</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Table Items -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="text-align: center;">Cant.</th>
              <th>Descripción del Producto</th>
              <th style="text-align: right;">P. Unitario</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <!-- Totals & QR Section -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr>
            <td style="vertical-align: top; width: 55%;">
              <div style="display: flex; align-items: center; gap: 14px; background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; width: fit-content;">
                <img src="${qrUrl}" alt="QR" style="width: 70px; height: 70px; border-radius: 4px;" />
                <div style="font-size: 11px; color: #4b5563;">
                  <strong style="color: #111827; display: block; font-size: 12px;">Comprobante Digital</strong>
                  Escanéa para validar el pedido.<br/>
                  ⭐ <strong>+${pointsEarned} Puntos</strong> acumulados en Club Fidelización.
                </div>
              </div>
            </td>
            <td style="vertical-align: top; width: 45%;">
              <table class="totals-table">
                <tr>
                  <td style="color: #6b7280; font-weight: 600;">Subtotal:</td>
                  <td style="text-align: right; font-weight: 700; color: #111827;">${formatCurrency(ord.subtotal || ord.total)}</td>
                </tr>
                ${ord.deliveryFee ? `
                  <tr>
                    <td style="color: #6b7280; font-weight: 600;">Costo de Envío:</td>
                    <td style="text-align: right; font-weight: 700; color: #111827;">${formatCurrency(ord.deliveryFee)}</td>
                  </tr>
                ` : ''}
                <tr style="border-top: 2px solid #111827; border-bottom: 2px solid #111827;">
                  <td style="font-size: 16px; font-weight: 900; color: #2b1810; padding: 10px 8px;">TOTAL ABONADO:</td>
                  <td style="text-align: right; font-size: 18px; font-weight: 900; color: #065f46; padding: 10px 8px;">${formatCurrency(ord.total)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <div class="footer">
          <p style="margin: 0; font-weight: 700; color: #374151;">¡Muchas gracias por su preferencia! Esperamos recibirlo pronto nuevamente.</p>
          <p style="margin: 4px 0 0 0;">
            Este documento constituye un comprobante no fiscal emitido electrónicamente como constancia de control y entrega interna.
          </p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = format === '58mm' ? generateThermal58mmHTML(order) : generateA4HTML(order);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleShareWhatsApp = () => {
    const itemsList = order.items.map((i) => `• ${i.quantity}x ${i.productName} (${formatCurrency(i.unitPrice * i.quantity)})`).join('\n');
    const msg = `🧾 *COMPROBANTE DE CONSUMO #${order.code}*\n*Café Magnolia - Hilos de Amor*\n_(Documento no válido como factura)_\n\n📅 Fecha: ${orderDateStr} ${orderTimeStr}\n👤 Cliente: ${order.customerName}\n📍 Modalidad: ${order.tableName || order.type.toUpperCase()}\n\n*Detalle del Pedido:*\n${itemsList}\n\n💰 *TOTAL ABONADO:* ${formatCurrency(order.total)}\n💳 *Medio de Pago:* ${getPaymentMethodLabel(order.paymentMethod)}\n⭐ *Puntos Club Ganados:* +${pointsEarned} pts\n\n¡Muchas gracias por tu visita! ☕✨`;
    const cleanPhone = (order.customerPhone || '').replace(/\D/g, '');
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-brand-dark/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-brand-card rounded-3xl border border-brand-secondary w-full max-w-2xl shadow-soft-lg overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-brand-secondary flex items-center justify-between bg-gradient-to-r from-brand-card to-brand-cream shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300 shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-brand-dark font-serif">Comprobante de Pago</h3>
                <span className="font-mono text-xs font-black bg-brand-secondary/60 text-brand-dark px-2 py-0.5 rounded-md border border-brand-secondary">
                  #{order.code}
                </span>
              </div>
              <p className="text-xs text-brand-brown/80">
                Seleccioná el formato para imprimir o compartir
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-brand-secondary/40 text-brand-brown transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Selector Bar */}
        <div className="p-4 bg-brand-cream border-b border-brand-secondary flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-brand-dark">Formato:</span>
            <div className="flex bg-brand-card p-1 rounded-xl border border-brand-secondary shadow-inner">
              <button
                type="button"
                onClick={() => setFormat('58mm')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  format === '58mm'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-brand-brown hover:text-brand-dark'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                Ticket Térmico (58mm)
              </button>
              <button
                type="button"
                onClick={() => setFormat('a4')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  format === 'a4'
                    ? 'bg-brand-brown text-white shadow-xs'
                    : 'text-brand-brown hover:text-brand-dark'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Hoja A4 (PDF Estándar)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-extrabold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Documento No Válido Como Factura</span>
          </div>
        </div>

        {/* Document Live Preview Canvas */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-brand-bg/50 space-y-4 flex justify-center">
          {format === '58mm' ? (
            /* ── PREVIEW TICKET TÉRMICO 58MM ── */
            <div className="w-[300px] bg-white text-black p-5 rounded-2xl shadow-md border border-gray-300 font-mono text-[11px] space-y-3 leading-tight select-none">
              <div className="text-center space-y-0.5">
                <h4 className="text-sm font-black tracking-wider">CAFÉ MAGNOLIA</h4>
                <p className="text-[10px] text-gray-700">Hilos de Amor Resto & Café</p>
                <p className="text-[9px] text-gray-500">Av. Principal 1234 • CABA</p>
                <p className="text-[9px] text-gray-500">Tel: (011) 5432-1980</p>
              </div>

              <div className="border border-dashed border-black p-2 text-center text-[10px] font-black my-2 tracking-tight">
                *** COMPROBANTE NO FISCAL ***<br />
                DOCUMENTO NO VÁLIDO COMO FACTURA
              </div>

              <div className="text-[10px] space-y-0.5">
                <div><strong>Ticket:</strong> #{order.code}</div>
                <div><strong>Fecha:</strong> {orderDateStr} {orderTimeStr}</div>
                <div><strong>Ubicación:</strong> {order.tableName || order.type.toUpperCase()}</div>
                <div><strong>Cliente:</strong> {order.customerName || 'Consumidor Final'}</div>
                {order.customerPhone && <div><strong>Tel:</strong> {order.customerPhone}</div>}
              </div>

              <div className="border-t border-dashed border-gray-400 pt-2 space-y-1">
                <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-gray-200">
                  <span>CANT ARTICULO</span>
                  <span>IMPORTE</span>
                </div>
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate pr-2">
                      <strong>{it.quantity}x</strong> {it.productName}
                    </span>
                    <span className="font-bold shrink-0">{formatCurrency(it.unitPrice * it.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-400 pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>{formatCurrency(order.subtotal || order.total)}</span>
                </div>
                {order.deliveryFee ? (
                  <div className="flex justify-between">
                    <span>ENVÍO:</span>
                    <span>{formatCurrency(order.deliveryFee)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm font-black border-t-2 border-black pt-1">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-400 pt-2 text-[10px] space-y-0.5">
                <div><strong>MEDIO DE PAGO:</strong> {getPaymentMethodLabel(order.paymentMethod).toUpperCase()}</div>
                <div className="text-gray-700">⭐ Puntos Club Fidelización: +{pointsEarned} pts</div>
              </div>

              <div className="text-center pt-2 space-y-1">
                <div className="w-16 h-16 bg-white p-1 border border-gray-300 mx-auto rounded">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                      `COMPROBANTE:${order.code}:${order.total}`
                    )}`}
                    alt="QR"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="font-bold text-[10px]">¡GRACIAS POR TU VISITA!</p>
                <p className="text-[8px] text-gray-500">Comprobante de consumo interno sin validez fiscal</p>
              </div>
            </div>
          ) : (
            /* ── PREVIEW HOJA A4 (PDF) ── */
            <div className="w-full bg-white text-gray-900 p-6 sm:p-8 rounded-2xl shadow-md border border-gray-300 space-y-5 text-xs">
              <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                <div>
                  <h3 className="text-xl font-black font-serif text-brand-dark">CAFÉ MAGNOLIA</h3>
                  <p className="text-xs text-amber-900 font-bold">Hilos de Amor Gastro-Platform</p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Av. Principal 1234, CABA • Tel: (011) 5432-1980<br />
                    contacto@cafemagnolia.com.ar
                  </p>
                </div>
                <div className="text-right bg-brand-dark text-white p-3 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-amber-300 tracking-wider block">
                    COMPROBANTE DE PAGO
                  </span>
                  <span className="font-mono text-base font-black">#{order.code}</span>
                  <span className="text-[10px] text-gray-300 block">{orderDateStr} {orderTimeStr}</span>
                </div>
              </div>

              {/* NON FISCAL BANNER */}
              <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-xl text-center text-amber-950 font-extrabold text-xs">
                ⚠️ DOCUMENTO NO VÁLIDO COMO FACTURA • COMPROBANTE DE CONTROL INTERNO DE CONSUMO
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Cliente</span>
                  <span className="font-extrabold text-gray-900 text-sm">{order.customerName || 'Consumidor Final'}</span>
                  {order.customerPhone && <span className="text-gray-600 block text-[11px]">📱 {order.customerPhone}</span>}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Ubicación / Modalidad</span>
                  <span className="font-extrabold text-gray-900">
                    {order.tableName ? `Salón: ${order.tableName}` : order.type === 'retiro' ? 'Mostrador Take Away' : 'Envío Delivery'}
                  </span>
                  {order.address && <span className="text-gray-600 block text-[11px]">{order.address}</span>}
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Forma de Pago</span>
                  <span className="font-extrabold text-emerald-800 text-sm">
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </span>
                  <span className="text-emerald-700 text-[10px] font-bold block">✓ Pago Registrado</span>
                </div>
              </div>

              {/* Table of items */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-dark text-white uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-12">Cant.</th>
                      <th className="py-2.5 px-3">Descripción</th>
                      <th className="py-2.5 px-3 text-right">P. Unitario</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items.map((it, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                        <td className="py-2 px-3 text-center font-bold">{it.quantity}</td>
                        <td className="py-2 px-3">
                          <span className="font-bold text-gray-900">{it.productName}</span>
                          {it.notes && <span className="text-[10px] text-gray-500 block">• {it.notes}</span>}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-600">{formatCurrency(it.unitPrice)}</td>
                        <td className="py-2 px-3 text-right font-extrabold text-gray-900">
                          {formatCurrency(it.unitPrice * it.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="flex justify-between items-end pt-2 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white p-1 border border-gray-300 rounded-lg">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                        `COMPROBANTE:${order.code}:${order.total}`
                      )}`}
                      alt="QR"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[11px] text-gray-600">
                    <span className="font-bold text-gray-900 block">Comprobante Digital Verificado</span>
                    ⭐ Sumaste <strong>+{pointsEarned} Puntos</strong> en el Club.
                  </div>
                </div>

                <div className="w-56 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(order.subtotal || order.total)}</span>
                  </div>
                  {order.deliveryFee ? (
                    <div className="flex justify-between text-gray-600">
                      <span>Costo de Envío:</span>
                      <span className="font-bold text-gray-900">{formatCurrency(order.deliveryFee)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-base font-black text-brand-dark pt-1 border-t-2 border-gray-900">
                    <span>TOTAL:</span>
                    <span className="text-emerald-800">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-brand-card border-t border-brand-secondary flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark hover:bg-brand-secondary/30 transition order-2 sm:order-1"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-soft transition flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4 text-brand-yellow" />
              WhatsApp
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-extrabold text-xs shadow-soft transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4 text-brand-yellow" />
              Imprimir ({format === '58mm' ? 'Ticket 58mm' : 'Hoja A4'})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
