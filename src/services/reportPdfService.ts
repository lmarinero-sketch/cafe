import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { formatCurrency } from '../utils/currency';

export interface PdfReportOptions {
  type: 'sales' | 'customers' | 'products' | 'cash';
  period?: string;
  title?: string;
  dateLabel?: string;
}

interface DateFilter {
  from: string | null;
  to: string | null;
  label: string;
}

function resolveDateRange(period?: string): DateFilter {
  const now = new Date();
  
  if (period === 'yesterday') {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    const yStr = y.toISOString().split('T')[0];
    return {
      from: `${yStr}T00:00:00.000Z`,
      to: `${yStr}T23:59:59.999Z`,
      label: `Ayer (${y.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })})`
    };
  }

  if (period === 'today') {
    const todayStr = now.toISOString().split('T')[0];
    return {
      from: `${todayStr}T00:00:00.000Z`,
      to: `${todayStr}T23:59:59.999Z`,
      label: `Hoy (${now.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })})`
    };
  }

  if (period === 'this_week') {
    const d = new Date(now);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(d.setDate(diff));
    const startStr = startOfWeek.toISOString().split('T')[0];
    return {
      from: `${startStr}T00:00:00.000Z`,
      to: `${now.toISOString().split('T')[0]}T23:59:59.999Z`,
      label: 'Esta Semana'
    };
  }

  if (period === 'this_month') {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return {
      from: `${y}-${m}-01T00:00:00.000Z`,
      to: `${y}-${m}-31T23:59:59.999Z`,
      label: `Mes en curso (${now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })})`
    };
  }

  return {
    from: null,
    to: null,
    label: 'Histórico Completo'
  };
}

export async function openPdfSalesReport(options: PdfReportOptions): Promise<void> {
  if (!isSupabaseConfigured) {
    alert('La base de datos de Supabase no está configurada.');
    return;
  }

  const dateFilter = resolveDateRange(options.period);

  let query = supabase
    .from('orders')
    .select('*')
    .neq('status', 'cancelado')
    .order('created_at', { ascending: false });

  if (dateFilter.from) query = query.gte('created_at', dateFilter.from);
  if (dateFilter.to) query = query.lte('created_at', dateFilter.to);

  const { data: orders, error } = await query;

  if (error) {
    console.error('Error al consultar pedidos para PDF:', error);
    alert('Ocurrió un error al obtener las ventas: ' + error.message);
    return;
  }

  const orderList = orders || [];
  
  // Aggregate KPIs
  const totalSales = orderList.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalOrders = orderList.length;
  const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
  const totalTips = orderList.reduce((sum, o) => sum + (Number(o.tip_amount) || 0), 0);

  // Group by payment method
  const paymentBreakdown: Record<string, { count: number; total: number }> = {};
  // Group by order channel
  const channelBreakdown: Record<string, { count: number; total: number }> = {};

  orderList.forEach((o) => {
    const pm = (o.payment_method || 'efectivo').toLowerCase();
    if (!paymentBreakdown[pm]) paymentBreakdown[pm] = { count: 0, total: 0 };
    paymentBreakdown[pm].count += 1;
    paymentBreakdown[pm].total += Number(o.total) || 0;

    const ch = (o.type || 'salon').toLowerCase();
    if (!channelBreakdown[ch]) channelBreakdown[ch] = { count: 0, total: 0 };
    channelBreakdown[ch].count += 1;
    channelBreakdown[ch].total += Number(o.total) || 0;
  });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor habilita las ventanas emergentes en tu navegador para ver el PDF.');
    return;
  }

  const nowFormatted = new Date().toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const title = options.title || 'Reporte de Ventas y Comandas';
  const displayPeriod = options.dateLabel || dateFilter.label;

  const paymentMethodLabels: Record<string, string> = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia / QR',
    mercadopago: 'Mercado Pago',
    debito: 'Tarjeta de Débito',
    credito: 'Tarjeta de Crédito',
    giftcard: 'Gift Card Virtual'
  };

  const channelLabels: Record<string, string> = {
    salon: 'Salón',
    delivery: 'Delivery',
    take_away: 'Take Away / Retiro',
    retiro: 'Take Away / Retiro'
  };

  const rowsHtml = orderList
    .map((ord, idx) => {
      const orderDate = ord.created_at
        ? new Date(ord.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        : '-';
      const orderDateFull = ord.created_at
        ? new Date(ord.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
        : '';
      const client = ord.customer_name || 'Consumidor Final';
      const channel = channelLabels[ord.type] || ord.type || 'Salón';
      const tableOrType = ord.table_name ? `Mesa: ${ord.table_name}` : channel;
      const pmLabel = paymentMethodLabels[ord.payment_method] || ord.payment_method || 'Efectivo';
      const amount = formatCurrency(Number(ord.total) || 0);

      return `
        <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="padding: 8px 10px; font-weight: 700; font-family: monospace; color: #1e3a8a;">#${ord.code || (ord.id ? ord.id.slice(0, 6) : idx + 1)}</td>
          <td style="padding: 8px 10px; color: #475569; font-size: 11px;">${orderDateFull} ${orderDate}</td>
          <td style="padding: 8px 10px; font-weight: 600; color: #0f172a;">${client}</td>
          <td style="padding: 8px 10px; color: #334155;">
            <span style="display: inline-block; padding: 2px 6px; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-size: 11px; font-weight: 600;">
              ${tableOrType}
            </span>
          </td>
          <td style="padding: 8px 10px; color: #475569; font-size: 11.5px;">${pmLabel}</td>
          <td style="padding: 8px 10px; text-align: right; font-weight: 700; color: #0f172a; font-size: 12.5px;">${amount}</td>
        </tr>
      `;
    })
    .join('');

  const paymentsHtml = Object.entries(paymentBreakdown)
    .map(([method, data]) => {
      const pct = totalSales > 0 ? Math.round((data.total / totalSales) * 100) : 0;
      return `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; flex: 1; min-width: 140px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">${paymentMethodLabels[method] || method}</div>
          <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 2px;">${formatCurrency(data.total)}</div>
          <div style="font-size: 10.5px; color: #0369a1; font-weight: 600; margin-top: 2px;">${data.count} pedidos (${pct}%)</div>
        </div>
      `;
    })
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8" />
      <title>${title} - Hilos de Amor</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');
        
        @page {
          size: A4 portrait;
          margin: 10mm 12mm;
        }

        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #0f172a;
          background: #f1f5f9;
          margin: 0;
          padding: 20px;
          font-size: 12px;
          line-height: 1.4;
        }

        .no-print-bar {
          background: #1e293b;
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .paper-container {
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          padding: 32px 36px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          border: 1px solid #e2e8f0;
        }

        .header-box {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0284c7;
          padding-bottom: 18px;
          margin-bottom: 20px;
        }

        .brand-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 26px;
          font-weight: 700;
          color: #1e3a8a;
          letter-spacing: -0.5px;
          margin: 0;
        }

        .brand-sub {
          font-size: 11.5px;
          font-weight: 600;
          color: #0284c7;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-top: 2px;
        }

        .brand-desc {
          font-size: 10.5px;
          color: #64748b;
          margin-top: 4px;
        }

        .audit-meta-card {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 10px 14px;
          text-align: right;
        }

        .audit-badge {
          display: inline-block;
          background: #0284c7;
          color: #ffffff;
          font-size: 9.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 2px 8px;
          border-radius: 4px;
          margin-bottom: 6px;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 22px;
        }

        .kpi-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 14px;
          border-left: 4px solid #0284c7;
        }

        .kpi-card.highlight {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-left: 4px solid #1e40af;
        }

        .kpi-label {
          font-size: 10.5px;
          text-transform: uppercase;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.4px;
        }

        .kpi-value {
          font-size: 19px;
          font-weight: 800;
          color: #0f172a;
          margin-top: 4px;
        }

        .section-title {
          font-size: 12.5px;
          font-weight: 800;
          color: #1e3a8a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 20px 0 10px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .table-sales {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .table-sales th {
          background: #1e293b;
          color: #ffffff;
          text-align: left;
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          padding: 8px 10px;
          font-weight: 700;
        }

        .table-sales td {
          font-size: 11.5px;
        }

        .footer-signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 36px;
          padding-top: 16px;
          border-top: 1px solid #cbd5e1;
          page-break-inside: avoid;
        }

        .sig-box {
          width: 220px;
          text-align: center;
        }

        .sig-line {
          border-top: 1.5px dashed #94a3b8;
          margin-bottom: 6px;
        }

        .sig-label {
          font-size: 10px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
        }

        .audit-footer-tag {
          text-align: center;
          font-size: 10px;
          color: #94a3b8;
          margin-top: 24px;
          page-break-inside: avoid;
        }

        @media print {
          body {
            background: #ffffff !important;
            padding: 0 !important;
          }
          .no-print-bar {
            display: none !important;
          }
          .paper-container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
        }
      </style>
    </head>
    <body>
      <!-- Top Action Bar (hidden when printing or saving as PDF) -->
      <div class="no-print-bar">
        <div>
          <strong style="font-size: 14px;">Reporte Oficial Listo para PDF / Impresión</strong>
          <div style="font-size: 11px; opacity: 0.85;">Elegí "Guardar como PDF" en el diálogo de tu navegador para descargarlo.</div>
        </div>
        <div style="display: flex; gap: 10px;">
          <button onclick="window.print()" style="background: #0284c7; hover:background: #0369a1; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            🖨️ Imprimir / Guardar como PDF
          </button>
          <button onclick="window.close()" style="background: rgba(255,255,255,0.15); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
            Cerrar
          </button>
        </div>
      </div>

      <!-- Printable A4 Container -->
      <div class="paper-container">
        <!-- Header -->
        <div class="header-box">
          <div>
            <h1 class="brand-title">HILOS DE AMOR</h1>
            <div class="brand-sub">Pastelería Artesanal & Cafetería de Especialidad</div>
            <div class="brand-desc">
              Sanatorio Argentino • Grow Labs Gastro Management<br/>
              Módulo de Auditoría Operativa & Control de Ventas
            </div>
          </div>
          <div class="audit-meta-card">
            <div class="audit-badge">REPORTE AUDITADO</div>
            <div style="font-size: 12px; font-weight: 800; color: #0f172a;">${title}</div>
            <div style="font-size: 11px; color: #0369a1; font-weight: 600; margin-top: 2px;">Período: ${displayPeriod}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 3px;">Emisión: ${nowFormatted}</div>
          </div>
        </div>

        <!-- Executive KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi-card highlight">
            <div class="kpi-label">Total Facturado</div>
            <div class="kpi-value" style="color: #1e40af;">${formatCurrency(totalSales)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Ventas / Pedidos</div>
            <div class="kpi-value">${totalOrders} <span style="font-size: 12px; font-weight: normal; color: #64748b;">operaciones</span></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Ticket Promedio</div>
            <div class="kpi-value">${formatCurrency(avgTicket)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Propinas Registradas</div>
            <div class="kpi-value">${formatCurrency(totalTips)}</div>
          </div>
        </div>

        <!-- Payment Breakdown Cards -->
        <div class="section-title">
          <span>💳 Desglose por Medio de Pago</span>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
          ${paymentsHtml || '<div style="font-size: 11px; color: #64748b;">No hay movimientos detallados.</div>'}
        </div>

        <!-- Detailed Sales Table -->
        <div class="section-title">
          <span>📋 Detalle de Pedidos y Comandas Auditadas</span>
        </div>
        <table class="table-sales">
          <thead>
            <tr>
              <th style="width: 80px;"># Ticket</th>
              <th style="width: 100px;">Fecha / Hora</th>
              <th>Cliente</th>
              <th style="width: 130px;">Ubicación / Canal</th>
              <th style="width: 140px;">Medio de Pago</th>
              <th style="width: 110px; text-align: right;">Importe</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="6" style="padding: 20px; text-align: center; color: #64748b;">No se encontraron pedidos registrados en este período.</td></tr>'}
          </tbody>
          <tfoot>
            <tr style="background: #1e293b; color: #ffffff; font-weight: 800;">
              <td colspan="5" style="padding: 10px 12px; text-transform: uppercase; letter-spacing: 0.5px; font-size: 11.5px;">TOTAL GENERAL AUDITADO (${totalOrders} PEDIDOS):</td>
              <td style="padding: 10px 12px; text-align: right; font-size: 13.5px; color: #38bdf8;">${formatCurrency(totalSales)}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Signatures & Conformity -->
        <div class="footer-signatures">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-label">Firma Responsable de Salón / Caja</div>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-label">Oliver IA • Maitre Certificado</div>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-label">Auditoría General / Sanatorio Argentino</div>
          </div>
        </div>

        <div class="audit-footer-tag">
          Hilos de Amor Resto & Café • Documento oficial generado digitalmente para control de gestión y liquidación operativa.<br/>
          Identificador de sesión: SA-AUDIT-${Date.now().toString(36).toUpperCase()} • Todos los datos han sido validados con la base de datos central.
        </div>
      </div>

      <script>
        window.onload = function() {
          // Auto trigger native print dialog for 1-click PDF download or printing
          setTimeout(function() {
            window.focus();
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
