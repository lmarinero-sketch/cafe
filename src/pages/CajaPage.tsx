import React, { useState, useMemo } from 'react';
import { Wallet, Plus, ArrowDownToLine, ArrowUpFromLine, History, CreditCard, Send, Check, Printer, FileText, AlertTriangle, ShieldCheck, FileSpreadsheet, User, Clock, MessageSquare, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Utensils, ShoppingBag, Coins, Sparkles, Search, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, formatShortDate } from '../utils/currency';
import { CashRegister, CashTransaction, PaymentMethod, Order } from '../types';
import { isOrderInCurrentShift } from '../utils/shiftUtils';
import { OrderReceiptModal } from '../components/orders/OrderReceiptModal';

export const CajaPage: React.FC = () => {
  const { cashRegisters, cashTransactions, openRegister, closeRegister, addTransaction, orders } = useApp();
  const { user } = useAuth();

  const [isOpeningModal, setIsOpeningModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [isTxModal, setIsTxModal] = useState(false);
  const [selectedReceiptRegister, setSelectedReceiptRegister] = useState<CashRegister | null>(null);
  const [activeTab, setActiveTab] = useState<'actual' | 'historial' | 'propinas'>('actual');
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Tips & Service Pool states
  const [selectedTipReceiptOrder, setSelectedTipReceiptOrder] = useState<Order | null>(null);
  const [tipsScope, setTipsScope] = useState<'turno' | 'hoy' | 'todos'>('turno');
  const [tipSearchTerm, setTipSearchTerm] = useState('');

  const [openedBy, setOpenedBy] = useState('');
  const [initialBalance, setInitialBalance] = useState(0);

  // Closing & Arqueo state
  const [closedBy, setClosedBy] = useState('');
  const [finalBalance, setFinalBalance] = useState(0);
  const [closingNotes, setClosingNotes] = useState('');

  // Transaction form state
  const [txType, setTxType] = useState<'ingreso' | 'egreso'>('ingreso');
  const [txAmount, setTxAmount] = useState(0);
  const [txMethod, setTxMethod] = useState<PaymentMethod | 'varios'>('efectivo');
  const [txDesc, setTxDesc] = useState('');

  const activeRegister = cashRegisters.find(r => r.status === 'abierta');

  const liveMovementItems = useMemo(() => {
    if (!activeRegister) return [];

    const txList = cashTransactions.filter((tx) => tx.registerId === activeRegister.id);
    const recordedOrderIds = new Set(txList.map((tx) => tx.orderId).filter(Boolean));

    const autoOrderTxs = orders
      .filter((o) => {
        if (o.status === 'cancelado') return false;
        if (o.registerId === activeRegister.id) return !recordedOrderIds.has(o.id);
        return (
          new Date(o.createdAt).getTime() >= new Date(activeRegister.openedAt).getTime() &&
          !recordedOrderIds.has(o.id)
        );
      })
      .map((o) => ({
        id: `auto-tx-${o.id}`,
        registerId: activeRegister.id,
        orderId: o.id,
        type: 'ingreso' as const,
        amount: o.total,
        paymentMethod: o.paymentMethod || 'efectivo',
        description: `Cobro Pedido ${o.code} (${o.tableId ? 'Mesa' : o.type || 'QR'})`,
        timestamp: o.createdAt,
        registeredBy: o.waiterName || 'Atención en Salón / QR',
      }));

    const combined = [...txList, ...autoOrderTxs];
    return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activeRegister, cashTransactions, orders]);

  const calcTotals = (registerId?: string) => {
    let targetTxs = liveMovementItems;
    if (registerId && registerId !== activeRegister?.id) {
      targetTxs = cashTransactions.filter((tx) => tx.registerId === registerId);
    }

    let efectivo = 0,
      mercadopago = 0,
      tarjetas = 0,
      transferencias = 0,
      giftcards = 0,
      egresos = 0;

    targetTxs.forEach((tx) => {
      if (tx.type === 'egreso') {
        egresos += tx.amount;
        if (tx.paymentMethod === 'efectivo') efectivo -= tx.amount;
      } else {
        if (tx.paymentMethod === 'efectivo') efectivo += tx.amount;
        else if (tx.paymentMethod === 'mercadopago') mercadopago += tx.amount;
        else if (tx.paymentMethod === 'transferencia') transferencias += tx.amount;
        else if (tx.paymentMethod === 'credito' || tx.paymentMethod === 'debito') tarjetas += tx.amount;
        else if (tx.paymentMethod === 'giftcard') giftcards += tx.amount;
      }
    });

    return {
      efectivo,
      mercadopago,
      tarjetas,
      transferencias,
      giftcards,
      egresos,
      totalVentas: efectivo + mercadopago + tarjetas + transferencias + giftcards - egresos,
    };
  };

  const totals = calcTotals();
  const expectedCash = (activeRegister?.initialBalance || 0) + totals.efectivo;

  const handleOpenRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const responsible = openedBy.trim() || user?.name || 'Cajero';
    openRegister(responsible, initialBalance);
    setIsOpeningModal(false);
    setOpenedBy('');
    setInitialBalance(0);
  };

  const handleStartClosing = () => {
    setClosedBy(user?.name || activeRegister?.openedBy || 'Cajero');
    setFinalBalance(expectedCash);
    setClosingNotes('');
    setIsClosingModal(true);
  };

  const handleConfirmCloseRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRegister) return;
    const diff = finalBalance - expectedCash;
    closeRegister(activeRegister.id, finalBalance, closedBy, expectedCash, diff, closingNotes);
    setIsClosingModal(false);

    // Show Printable Receipt Modal immediately for the newly closed register
    const updated = {
      ...activeRegister,
      status: 'cerrada' as const,
      closedAt: new Date().toISOString(),
      finalBalance,
      cashPhysicalCount: finalBalance,
      closedBy: closedBy || user?.name || activeRegister.openedBy,
      expectedBalance: expectedCash,
      difference: diff,
      notes: closingNotes,
    };
    setSelectedReceiptRegister(updated);
  };

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRegister || txAmount <= 0) return;
    addTransaction({
      registerId: activeRegister.id,
      type: txType,
      amount: txAmount,
      paymentMethod: txMethod,
      description: txDesc || (txType === 'ingreso' ? 'Ingreso manual' : 'Egreso manual'),
      registeredBy: user ? `${user.name} (${user.role})` : 'Cajero',
    });
    setIsTxModal(false);
    setTxAmount(0);
    setTxDesc('');
  };

  const handlePrintPDF = (register: CashRegister) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const regTotals = calcTotals(register.id);
    const regOrders = orders.filter(o => new Date(o.createdAt).getTime() >= new Date(register.openedAt).getTime() && (register.closedAt ? new Date(o.createdAt).getTime() <= new Date(register.closedAt).getTime() : true));

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprobante Cierre Z - Caja #${register.id.slice(-6).toUpperCase()}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap');
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              padding: 40px;
              color: #1A2E1E;
              background-color: #FFFFFF;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #2F5233;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: #2F5233;
              font-weight: 800;
            }
            .header p {
              margin: 4px 0 0 0;
              font-size: 13px;
              color: #765747;
            }
            .badge-title {
              display: inline-block;
              background: #2F5233;
              color: #FFF;
              padding: 4px 16px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 800;
              margin-top: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .grid-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 25px;
              background: #F8F6F0;
              padding: 16px;
              border-radius: 12px;
              border: 1px solid #E8DFD8;
            }
            .info-item {
              font-size: 13px;
            }
            .info-item label {
              font-weight: 700;
              color: #765747;
              display: block;
              font-size: 11px;
              text-transform: uppercase;
            }
            .info-item span {
              font-weight: 800;
              color: #1A2E1E;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
            }
            th, td {
              padding: 10px 12px;
              text-align: left;
              font-size: 13px;
              border-bottom: 1px solid #E8DFD8;
            }
            th {
              background: #2F5233;
              color: #FFFFFF;
              font-weight: 800;
              text-transform: uppercase;
              font-size: 11px;
            }
            .arqueo-box {
              background: #FFF8E7;
              border: 2px solid #D4AF37;
              border-radius: 16px;
              padding: 20px;
              margin-bottom: 25px;
            }
            .arqueo-row {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              margin-bottom: 8px;
            }
            .arqueo-row.total {
              font-size: 16px;
              font-weight: 800;
              border-top: 2px solid #D4AF37;
              padding-top: 10px;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px dashed #765747;
              font-size: 12px;
              color: #765747;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HILOS DE AMOR</h1>
            <p>Pastelería & Encordado — Sistema Gastronómico</p>
            <div class="badge-title">Comprobante Cierre de Caja (Cierre Z)</div>
          </div>

          <div class="grid-info">
            <div class="info-item">
              <label>Apertura de Caja</label>
              <span>${formatDate(register.openedAt)} hs por ${register.openedBy}</span>
            </div>
            <div class="info-item">
              <label>Cierre de Caja</label>
              <span>${register.closedAt ? formatDate(register.closedAt) : 'En curso'} hs por ${register.closedBy || register.openedBy}</span>
            </div>
          </div>

          <h3 style="color:#2F5233; margin-bottom:10px;">📊 Desglose de Facturación e Ingresos</h3>
          <table>
            <thead>
              <tr>
                <th>Concepto / Método de Pago</th>
                <th style="text-align:right;">Monto Acumulado</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>💵 Fondo Inicial de Caja</td><td style="text-align:right; font-weight:700;">${formatCurrency(register.initialBalance)}</td></tr>
              <tr><td>💵 Ventas en Efectivo</td><td style="text-align:right; font-weight:700;">${formatCurrency(regTotals.efectivo)}</td></tr>
              <tr><td>📱 Ventas MercadoPago</td><td style="text-align:right; font-weight:700;">${formatCurrency(regTotals.mercadopago)}</td></tr>
              <tr><td>💳 Ventas Tarjetas (Débito/Crédito)</td><td style="text-align:right; font-weight:700;">${formatCurrency(regTotals.tarjetas)}</td></tr>
              <tr><td>🏦 Ventas Transferencias</td><td style="text-align:right; font-weight:700;">${formatCurrency(regTotals.transferencias)}</td></tr>
              <tr><td>🔻 Retiros y Egresos de Caja</td><td style="text-align:right; font-weight:700; color:#B91C1C;">-${formatCurrency(regTotals.egresos)}</td></tr>
            </tbody>
          </table>

          <div class="arqueo-box">
            <h3 style="margin-top:0; color:#2F5233;">⚖️ Balance & Arqueo Final de Efectivo</h3>
            <div class="arqueo-row"><span>Efectivo Esperado por Sistema:</span> <strong>${formatCurrency(register.expectedBalance || (register.initialBalance + regTotals.efectivo))}</strong></div>
            <div class="arqueo-row"><span>Efectivo Declarado (Conteo Físico):</span> <strong>${formatCurrency(register.finalBalance || 0)}</strong></div>
            <div class="arqueo-row total">
              <span>Resultado del Arqueo:</span>
              <span style="color: ${(register.difference || 0) >= 0 ? '#15803D' : '#B91C1C'};">
                ${(register.difference || 0) === 0 ? '✓ Balance Exacto ($0)' : (register.difference || 0) > 0 ? `+${formatCurrency(register.difference || 0)} (Sobrante)` : `${formatCurrency(register.difference || 0)} (Faltante)`}
              </span>
            </div>
          </div>

          ${register.notes ? `
            <div style="background:#F4EBE1; padding:15px; border-radius:12px; margin-bottom:25px; border:1px solid #E8DFD8;">
              <strong style="color:#765747; font-size:12px; display:block; text-transform:uppercase;">Novedades / Observaciones del Cierre:</strong>
              <p style="margin:5px 0 0 0; font-size:13px;">${register.notes}</p>
            </div>
          ` : ''}

          <h3 style="color:#2F5233; margin-bottom:10px;">📋 Pedidos Cobrados en el Turno (${regOrders.length})</h3>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Mesa / Tipo</th>
                <th>Atendido / Cobrado Por</th>
                <th>Método Pago</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${regOrders.map(o => `
                <tr>
                  <td><strong>${o.code}</strong></td>
                  <td>${o.tableName || (o.type === 'delivery' ? 'Delivery' : 'Mostrador')}</td>
                  <td><strong>${o.waiterName || 'Salón / QR'}</strong></td>
                  <td style="text-transform:capitalize;">${o.paymentMethod}</td>
                  <td style="text-align:right; font-weight:800;">${formatCurrency(o.total)}</td>
                </tr>
              `).join('')}
              ${regOrders.length === 0 ? '<tr><td colspan="5" style="text-align:center; color:#888;">Sin pedidos registrados en este turno.</td></tr>' : ''}
            </tbody>
          </table>

          <div class="footer">
            <p>Firma Responsable Cierre: _______________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Firma Supervisión: _______________________</p>
            <p style="margin-top:10px;">Hilos de Amor • Documento de Control Interno de Tesorería</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const isRegisterFromPreviousDay = (openedAtIso?: string): boolean => {
    if (!openedAtIso) return false;
    const openedDate = new Date(openedAtIso);
    const now = new Date();
    const openedDay = new Date(openedDate.getFullYear(), openedDate.getMonth(), openedDate.getDate()).getTime();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return openedDay < today;
  };

  const getDaysAgoFormatted = (openedAtIso: string): string => {
    const openedDate = new Date(openedAtIso);
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - openedDate.getTime());
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays >= 2) return `hace ${diffDays} días (${diffHours} hs abierta)`;
    if (diffDays === 1) return `ayer (${diffHours} hs abierta)`;
    return `hace ${diffHours} horas`;
  };

  // ─────────────────────────────────────────────────────────────
  // GESTIÓN DE PROPINAS & POZO DE SERVICIO (AUDITORÍA COMPLETA)
  // ─────────────────────────────────────────────────────────────
  const allTipsOrders = useMemo(() => {
    return orders.filter((o) => (o.tipAmount && o.tipAmount > 0) || Boolean(o.tipRegisteredBy));
  }, [orders]);

  const filteredTipsOrders = useMemo(() => {
    let list = allTipsOrders;

    if (tipsScope === 'turno') {
      if (activeRegister) {
        list = list.filter((o) => isOrderInCurrentShift(o, activeRegister));
      } else {
        const todayStr = new Date().toISOString().slice(0, 10);
        list = list.filter((o) => (o.createdAt || '').slice(0, 10) === todayStr);
      }
    } else if (tipsScope === 'hoy') {
      const todayStr = new Date().toISOString().slice(0, 10);
      list = list.filter((o) => (o.createdAt || '').slice(0, 10) === todayStr);
    }

    if (tipSearchTerm.trim()) {
      const term = tipSearchTerm.toLowerCase().trim();
      list = list.filter((o) => {
        const codeMatch = o.code?.toLowerCase().includes(term);
        const cashierMatch = o.tipRegisteredBy?.toLowerCase().includes(term);
        const waiterMatch = o.waiterName?.toLowerCase().includes(term);
        const tableMatch = o.tableName?.toLowerCase().includes(term);
        const custMatch = o.customerName?.toLowerCase().includes(term);
        return codeMatch || cashierMatch || waiterMatch || tableMatch || custMatch;
      });
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allTipsOrders, tipsScope, tipSearchTerm, activeRegister]);

  const totalTipAmount = useMemo(() => {
    return filteredTipsOrders.reduce((sum, o) => sum + (o.tipAmount || 0), 0);
  }, [filteredTipsOrders]);

  const averageTipAmount = useMemo(() => {
    if (filteredTipsOrders.length === 0) return 0;
    return Math.round(totalTipAmount / filteredTipsOrders.length);
  }, [filteredTipsOrders, totalTipAmount]);

  const handlePrintTipReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rows = filteredTipsOrders
      .map(
        (o) => `
      <tr>
        <td style="padding: 7px 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; font-family: monospace;">#${o.code}</td>
        <td style="padding: 7px 8px; border-bottom: 1px solid #e5e7eb;">${formatDate(o.createdAt)}</td>
        <td style="padding: 7px 8px; border-bottom: 1px solid #e5e7eb;">${o.tableName || o.type.toUpperCase()}</td>
        <td style="padding: 7px 8px; border-bottom: 1px solid #e5e7eb;">${o.waiterName || 'Salón'}</td>
        <td style="padding: 7px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${formatCurrency(o.total)}</td>
        <td style="padding: 7px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 800; color: #065f46;">+${formatCurrency(o.tipAmount || 0)} (${o.tipPercentage || 10}%)</td>
        <td style="padding: 7px 8px; border-bottom: 1px solid #e5e7eb; font-weight: 700; color: #1e293b;">${o.tipRegisteredBy || 'Cajero de Turno'}</td>
      </tr>
    `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Propinas - Café Magnolia</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #111827; font-size: 12px; }
          h1 { font-size: 20px; margin: 0 0 4px 0; color: #2b1810; }
          .header { margin-bottom: 20px; border-bottom: 2px solid #2b1810; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
          th { background: #f3f4f6; padding: 8px; text-align: left; font-weight: 800; text-transform: uppercase; font-size: 10px; border-bottom: 2px solid #d1d5db; }
          .kpis { display: flex; gap: 14px; margin-bottom: 18px; }
          .kpi { border: 1px solid #e5e7eb; padding: 10px 14px; border-radius: 10px; background: #fafaf9; }
          .sig-box { margin-top: 55px; display: flex; justify-content: space-between; padding: 0 40px; }
          .sig-line { width: 220px; border-top: 1px dashed #374151; text-align: center; padding-top: 6px; font-size: 11px; font-weight: 600; color: #374151; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CAFÉ MAGNOLIA - PLANILLA DE CONTROL DE PROPINAS</h1>
          <div style="font-size: 11px; color: #4b5563;">Hilos de Amor Resto & Café • Área de Tesorería & Salón</div>
          <div style="font-size: 11px; color: #4b5563; margin-top: 3px;">
            <strong>Emisión:</strong> ${new Date().toLocaleString()} | <strong>Alcance:</strong> ${
      tipsScope === 'turno' ? 'Turno Actual de Caja' : tipsScope === 'hoy' ? 'Jornada de Hoy' : 'Histórico Total'
    }
          </div>
        </div>

        <div class="kpis">
          <div class="kpi">
            <div style="font-size: 10px; color: #6b7280; font-weight: bold; text-transform: uppercase;">Pozo Total Propinas</div>
            <div style="font-size: 18px; font-weight: 900; color: #065f46;">${formatCurrency(totalTipAmount)}</div>
          </div>
          <div class="kpi">
            <div style="font-size: 10px; color: #6b7280; font-weight: bold; text-transform: uppercase;">Tickets con Propina</div>
            <div style="font-size: 18px; font-weight: 900; color: #111827;">${filteredTipsOrders.length}</div>
          </div>
          <div class="kpi">
            <div style="font-size: 10px; color: #6b7280; font-weight: bold; text-transform: uppercase;">Promedio por Ticket</div>
            <div style="font-size: 18px; font-weight: 900; color: #111827;">${formatCurrency(averageTipAmount)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Fecha / Hora</th>
              <th>Mesa / Canal</th>
              <th>Mozo</th>
              <th style="text-align: right;">Consumo</th>
              <th style="text-align: right;">Propina Sugerida</th>
              <th>Cajero Registrador</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="sig-box">
          <div class="sig-line">Firma Cajero en Turno</div>
          <div class="sig-line">Firma Encargado / Auditor</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown bg-brand-yellow/40 px-2 py-0.5 rounded">
              Tesorería & Auditoría
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-brand-dark">Control de Caja & Arqueo</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Registro con hora de apertura/cierre, arqueo de efectivo y comprobante de Cierre Z
          </p>
        </div>

        {!activeRegister ? (
          <button
            onClick={() => {
              setOpenedBy(user?.name || '');
              setInitialBalance(0);
              setIsOpeningModal(true);
            }}
            className="py-2.5 px-5 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-all duration-200 shadow-soft flex items-center gap-2"
          >
            <Wallet className="w-4 h-4 text-brand-yellow" />
            Abrir Turno de Caja
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsTxModal(true)}
              className="py-2.5 px-4 rounded-xl border border-brand-secondary text-brand-dark font-bold text-xs hover:bg-brand-secondary/40 transition-all shadow-soft flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Movimiento
            </button>
            <button
              onClick={handleStartClosing}
              className="py-2.5 px-5 rounded-xl bg-brand-dark text-brand-card font-bold text-xs hover:bg-brand-dark/80 transition-all duration-200 shadow-soft flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-brand-green" />
              Arqueo & Cerrar Caja
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto bg-brand-card p-3 rounded-2xl border border-brand-secondary shadow-soft">
        <button
          onClick={() => setActiveTab('actual')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'actual'
              ? 'bg-brand-brown text-brand-card shadow-soft'
              : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40'
          }`}
        >
          Turno Actual
        </button>
        <button
          onClick={() => setActiveTab('propinas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'propinas'
              ? 'bg-brand-brown text-brand-card shadow-soft'
              : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40'
          }`}
        >
          <Coins className="w-3.5 h-3.5 text-amber-300" />
          <span>Propinas & Pozo de Servicio</span>
          {allTipsOrders.length > 0 && (
            <span className="bg-amber-400 text-amber-950 font-mono text-[10px] px-1.5 py-0.5 rounded-full font-black">
              {allTipsOrders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('historial')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'historial'
              ? 'bg-brand-brown text-brand-card shadow-soft'
              : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40'
          }`}
        >
          Historial de Cajas & Comprobantes Z
        </button>
      </div>

      {activeTab === 'actual' ? (
        activeRegister ? (
        <>
          {/* Cuadro de Alerta Destacada: Caja Abierta del Día Anterior */}
          {isRegisterFromPreviousDay(activeRegister.openedAt) && (
            <div className="bg-amber-50 border-2 border-amber-500 text-amber-950 p-5 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-amber-200/90 rounded-2xl text-amber-900 shrink-0 border border-amber-400 shadow-xs">
                  <AlertTriangle className="w-7 h-7 text-amber-800 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-300 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-400">
                      ⚠️ Atención: Turno Anterior Sin Cerrar
                    </span>
                    <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Abierta {getDaysAgoFormatted(activeRegister.openedAt)}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-amber-950">
                    La caja quedó abierta desde una jornada anterior
                  </h3>
                  <p className="text-xs text-amber-900/90 leading-relaxed max-w-2xl">
                    Esta caja fue abierta el <strong>{formatDate(activeRegister.openedAt)} hs</strong> por <strong>{activeRegister.openedBy}</strong> con un fondo de <strong>{formatCurrency(activeRegister.initialBalance)}</strong> y no se registró su cierre al finalizar el día. 
                    Te recomendamos hacer el arqueo y cierre ahora para que las ventas de hoy inicien con un turno limpio.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <button
                  onClick={handleStartClosing}
                  className="w-full md:w-auto px-5 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <Check className="w-4 h-4 text-amber-200" />
                  <span>Arqueo & Cerrar Caja Anterior</span>
                </button>
              </div>
            </div>
          )}

          {/* Info Banner box */}
          <div className="bg-emerald-950 text-brand-card p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-soft border border-emerald-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800/80 text-brand-yellow flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-extrabold text-brand-yellow uppercase tracking-wider">Caja Abierta</p>
                  <span className="inline-flex items-center gap-1 bg-emerald-800/90 text-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-600/60">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    EN VIVO
                  </span>
                </div>
                <p className="text-sm font-bold text-white">Apertura: {formatDate(activeRegister.openedAt)} hs</p>
                <p className="text-xs text-emerald-200">Responsable: <strong className="text-white">{activeRegister.openedBy}</strong></p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-right">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">Fondo Inicial</span>
                <span className="text-lg font-extrabold text-white">{formatCurrency(activeRegister.initialBalance)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-brand-card p-5 rounded-2xl border border-brand-secondary shadow-soft space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-brown">Efectivo en Caja</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-brand-dark">{formatCurrency(expectedCash)}</p>
              <p className="text-[10px] text-brand-brown/80">Fondo: {formatCurrency(activeRegister.initialBalance)} • Ingresos: {formatCurrency(totals.efectivo)}</p>
            </div>
            
            <div className="bg-brand-card p-5 rounded-2xl border border-brand-secondary shadow-soft space-y-2">
              <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-brand-brown" /><p className="text-xs font-bold uppercase tracking-wider text-brand-brown">Tarjetas</p></div>
              <p className="text-2xl font-bold text-brand-dark">{formatCurrency(totals.tarjetas)}</p>
            </div>

            <div className="bg-brand-card p-5 rounded-2xl border border-brand-secondary shadow-soft space-y-2">
              <div className="flex items-center gap-2"><Send className="w-4 h-4 text-brand-brown" /><p className="text-xs font-bold uppercase tracking-wider text-brand-brown">Transferencias</p></div>
              <p className="text-2xl font-bold text-brand-dark">{formatCurrency(totals.transferencias)}</p>
            </div>

            <div className="bg-brand-card p-5 rounded-2xl border border-brand-secondary shadow-soft space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-brown">MercadoPago</p>
              <p className="text-2xl font-bold text-brand-dark">{formatCurrency(totals.mercadopago)}</p>
            </div>

            <div className="bg-brand-card p-5 rounded-2xl border border-brand-secondary shadow-soft space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-brown">Gift Cards / Vouchers</p>
              <p className="text-2xl font-bold text-brand-dark">{formatCurrency(totals.giftcards)}</p>
            </div>
          </div>

          <div className="bg-brand-card rounded-2xl border border-brand-secondary shadow-soft overflow-hidden">
            <div className="p-4 border-b border-brand-secondary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-brand-dark flex items-center gap-2">
                  <History className="w-4 h-4" /> Movimientos del Turno
                </h3>
                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live Sync ({liveMovementItems.length})
                </span>
              </div>
              <span className="text-xs text-brand-brown/80">Total Recaudado: <strong className="text-brand-dark">{formatCurrency(totals.totalVentas)}</strong></span>
            </div>
            
            <div className="divide-y divide-brand-secondary/40 max-h-[450px] overflow-y-auto">
              {liveMovementItems.length === 0 ? (
                <div className="p-8 text-center text-sm text-brand-brown/60">No hay movimientos registrados en este turno.</div>
              ) : (
                liveMovementItems.map((tx) => {
                  const isExpanded = expandedTxId === tx.id;
                  const matchedOrder = tx.orderId
                    ? orders.find((o) => o.id === tx.orderId)
                    : orders.find((o) => tx.description.includes(o.code));

                  return (
                    <div key={tx.id} className="transition-colors border-b border-brand-secondary/30 last:border-0">
                      {/* Main Clickable Row */}
                      <div
                        onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                        className="p-4 flex items-center justify-between hover:bg-brand-bg/60 cursor-pointer select-none group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl border ${tx.type === 'ingreso' ? 'bg-brand-green/20 border-brand-green text-emerald-800' : 'bg-red-100 border-red-200 text-red-800'}`}>
                            {tx.type === 'ingreso' ? <ArrowDownToLine className="w-4 h-4" /> : <ArrowUpFromLine className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-brand-dark text-sm group-hover:text-emerald-950 transition-colors">
                                {tx.description}
                              </p>
                              {matchedOrder?.tableName && (
                                <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-brand-cream text-brand-dark border border-brand-secondary">
                                  {matchedOrder.tableName}
                                </span>
                              )}
                              {(tx.registeredBy || matchedOrder?.waiterName) && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 shadow-xs">
                                  👤 {tx.registeredBy || matchedOrder?.waiterName}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-brand-brown/80 capitalize flex items-center gap-1.5 mt-0.5">
                              <span>{formatDate(tx.timestamp)} hs</span>
                              <span>•</span>
                              <span className="font-semibold">{tx.paymentMethod}</span>
                              {matchedOrder?.customerName && (
                                <>
                                  <span>•</span>
                                  <span className="text-brand-dark font-medium">{matchedOrder.customerName}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <p className={`font-extrabold text-sm ${tx.type === 'ingreso' ? 'text-brand-dark' : 'text-red-700'}`}>
                              {tx.type === 'ingreso' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </p>
                            <span className="text-[10px] text-brand-brown/70 underline group-hover:text-brand-brown font-semibold">
                              {isExpanded ? 'Ocultar detalles' : 'Ver pedido y mozo'}
                            </span>
                          </div>
                          <div className="p-1 rounded-lg bg-brand-bg text-brand-brown group-hover:bg-brand-secondary/40 transition-colors">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Panel Desplegable */}
                      {isExpanded && (
                        <div className="bg-brand-bg/90 border-t border-brand-secondary/60 p-4 space-y-4 text-xs animate-fade-in">
                          {/* Grid de 3 Columnas: Pedido, Cliente y Atendido Por */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* 1. Pedido y Ubicación */}
                            <div className="bg-white p-3.5 rounded-xl border border-brand-secondary/60 space-y-2 shadow-xs">
                              <div className="flex items-center justify-between border-b border-brand-secondary/40 pb-1.5">
                                <span className="font-extrabold text-brand-dark flex items-center gap-1.5">
                                  <Utensils className="w-4 h-4 text-brand-brown" />
                                  {matchedOrder ? `Pedido ${matchedOrder.code}` : tx.description}
                                </span>
                                {matchedOrder && (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-green/30 text-emerald-950 border border-brand-green/60">
                                    {matchedOrder.status}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1.5 text-brand-dark/90">
                                <p className="flex items-center justify-between">
                                  <span className="text-brand-brown font-semibold">Ubicación / Mesa:</span>
                                  <strong className="text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    {matchedOrder?.tableName || (matchedOrder?.tableId ? `Mesa ${matchedOrder.tableId}` : matchedOrder?.type || 'QR / Carta Digital')}
                                  </strong>
                                </p>
                                <p className="flex items-center justify-between">
                                  <span className="text-brand-brown font-semibold">Tipo de Pedido:</span>
                                  <span className="capitalize font-bold">{matchedOrder?.type || 'Salón'}</span>
                                </p>
                                <p className="flex items-center justify-between">
                                  <span className="text-brand-brown font-semibold">Medio de Pago:</span>
                                  <span className="capitalize font-bold text-brand-brown">{tx.paymentMethod}</span>
                                </p>
                              </div>
                            </div>

                            {/* 2. Datos del Cliente */}
                            <div className="bg-white p-3.5 rounded-xl border border-brand-secondary/60 space-y-2 shadow-xs">
                              <div className="flex items-center justify-between border-b border-brand-secondary/40 pb-1.5">
                                <span className="font-extrabold text-brand-dark flex items-center gap-1.5">
                                  <User className="w-4 h-4 text-brand-brown" />
                                  Datos del Cliente
                                </span>
                                {matchedOrder?.pointsEarned ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                    +{matchedOrder.pointsEarned} pts
                                  </span>
                                ) : null}
                              </div>
                              <div className="space-y-1.5 text-brand-dark/90">
                                <p className="flex items-center justify-between">
                                  <span className="text-brand-brown font-semibold">Nombre:</span>
                                  <strong className="text-brand-dark">{matchedOrder?.customerName || 'Cliente de Salón / QR'}</strong>
                                </p>
                                {matchedOrder?.customerPhone && (
                                  <p className="flex items-center justify-between">
                                    <span className="text-brand-brown font-semibold">Teléfono:</span>
                                    <span>{matchedOrder.customerPhone}</span>
                                  </p>
                                )}
                                {matchedOrder?.address && (
                                  <p className="flex items-center justify-between">
                                    <span className="text-brand-brown font-semibold">Dirección:</span>
                                    <span className="truncate max-w-[140px]">{matchedOrder.address}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* 3. Usuario que Atendió */}
                            <div className="bg-white p-3.5 rounded-xl border border-brand-secondary/60 space-y-2 shadow-xs">
                              <div className="flex items-center justify-between border-b border-brand-secondary/40 pb-1.5">
                                <span className="font-extrabold text-brand-dark flex items-center gap-1.5">
                                  <ShieldCheck className="w-4 h-4 text-emerald-800" />
                                  Atendido / Procesado Por
                                </span>
                              </div>
                              <div className="space-y-1.5 text-brand-dark/90">
                                <p className="flex items-center justify-between">
                                  <span className="text-brand-brown font-semibold">Usuario Responsable:</span>
                                  <strong className="text-brand-dark">{matchedOrder?.waiterName || matchedOrder?.waiterId || activeRegister?.openedBy || user?.name || 'Cajero / Mozo de Turno'}</strong>
                                </p>
                                <p className="flex items-center justify-between">
                                  <span className="text-brand-brown font-semibold">Fecha y Hora:</span>
                                  <span>{formatDate(tx.timestamp)} hs</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Detalle de Productos del Pedido */}
                          {matchedOrder && matchedOrder.items && matchedOrder.items.length > 0 && (
                            <div className="bg-white p-3.5 rounded-xl border border-brand-secondary/60 space-y-2 shadow-xs">
                              <h4 className="font-bold text-brand-dark flex items-center gap-1.5 text-xs border-b border-brand-secondary/40 pb-1.5">
                                <ShoppingBag className="w-4 h-4 text-brand-brown" /> Productos Comprados ({matchedOrder.items.length})
                              </h4>
                              <div className="divide-y divide-brand-secondary/30">
                                {matchedOrder.items.map((it, idx) => (
                                  <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-md bg-brand-cream text-brand-dark font-extrabold text-[10px] flex items-center justify-center border border-brand-secondary">
                                        {it.quantity}x
                                      </span>
                                      <span className="font-semibold text-brand-dark">{it.productName}</span>
                                      {it.notes && <span className="text-[10px] text-brand-brown/70 italic">({it.notes})</span>}
                                    </div>
                                    <div className="text-right">
                                      <span className="text-brand-brown text-[11px] mr-2">{formatCurrency(it.unitPrice)} c/u</span>
                                      <strong className="text-brand-dark">{formatCurrency(it.unitPrice * it.quantity)}</strong>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="pt-2 border-t border-brand-secondary/60 flex items-center justify-between font-extrabold text-xs">
                                <span>Total Recaudado:</span>
                                <span className="text-emerald-900 text-sm">{formatCurrency(matchedOrder.total)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-brand-card p-12 rounded-2xl border border-brand-secondary shadow-soft text-center flex flex-col items-center justify-center space-y-4">
          <Wallet className="w-12 h-12 text-brand-brown/40" />
          <div>
            <h3 className="text-lg font-bold text-brand-dark">Sin Caja Abierta</h3>
            <p className="text-sm text-brand-brown/80 mt-1 max-w-sm mx-auto">Debes iniciar un turno de caja para registrar ingresos, egresos y procesar cobros de pedidos.</p>
          </div>
          <button
            onClick={() => {
              setOpenedBy(user?.name || '');
              setInitialBalance(0);
              setIsOpeningModal(true);
            }}
            className="mt-2 py-3 px-6 rounded-xl bg-brand-brown text-brand-card font-bold hover:bg-brand-dark transition-all duration-200 shadow-soft"
          >
            Abrir Caja Ahora
          </button>
        </div>
        )
      ) : activeTab === 'propinas' ? (
        /* VISTA DE PROPINAS & POZO DE SERVICIO */
        <div className="space-y-4 animate-fade-in">
          {/* Header Card con Filtros y Botón de Reporte */}
          <div className="bg-brand-card p-5 rounded-2xl border border-brand-secondary shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl border border-amber-300 shadow-xs shrink-0">
                <Coins className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-brand-dark">
                    Propinas & Pozo de Servicio
                  </h3>
                  <span className="text-[10px] bg-amber-200 text-amber-950 font-black px-2 py-0.5 rounded-full border border-amber-300">
                    ⭐ 10% Sugerido
                  </span>
                </div>
                <p className="text-xs text-brand-brown/80 mt-0.5 max-w-xl">
                  Auditoría completa de propinas recibidas por pedido, con desglose del consumo, porcentaje aplicado y el <strong>cajero responsable que registró la propina</strong>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
              <button
                onClick={handlePrintTipReport}
                disabled={filteredTipsOrders.length === 0}
                className="py-2.5 px-4 rounded-xl bg-brand-brown hover:bg-brand-dark text-white font-bold text-xs shadow-soft flex items-center justify-center gap-2 transition-all disabled:opacity-50 w-full sm:w-auto"
                title="Imprimir planilla para el reparto del pozo de propinas entre mozos y personal"
              >
                <Printer className="w-4 h-4 text-brand-yellow" />
                Imprimir Planilla de Reparto
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft">
              <div className="flex items-center justify-between text-brand-brown/80 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Pozo Total Propinas</span>
                <Coins className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xl font-black text-emerald-800 font-mono">
                {formatCurrency(totalTipAmount)}
              </p>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                {tipsScope === 'turno' ? 'En el turno actual' : tipsScope === 'hoy' ? 'En la jornada de hoy' : 'En todo el historial'}
              </p>
            </div>

            <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft">
              <div className="flex items-center justify-between text-brand-brown/80 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Tickets con Propina</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl font-black text-brand-dark font-mono">
                {filteredTipsOrders.length}
              </p>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                Pedidos con propina voluntaria
              </p>
            </div>

            <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft">
              <div className="flex items-center justify-between text-brand-brown/80 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Promedio por Ticket</span>
                <Wallet className="w-4 h-4 text-brand-brown" />
              </div>
              <p className="text-xl font-black text-brand-dark font-mono">
                {formatCurrency(averageTipAmount)}
              </p>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                Monto medio por comensal
              </p>
            </div>

            <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft">
              <div className="flex items-center justify-between text-brand-brown/80 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Cajero en Turno</span>
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              </div>
              <p className="text-sm font-extrabold text-brand-dark truncate">
                {activeRegister?.openedBy || user?.name || 'Cajero de Turno'}
              </p>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                ✓ Perfil habilitado para registrar
              </p>
            </div>
          </div>

          {/* Toolbar de Filtros y Búsqueda */}
          <div className="bg-brand-card p-3 rounded-2xl border border-brand-secondary shadow-soft flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              <button
                onClick={() => setTipsScope('turno')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  tipsScope === 'turno'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40'
                }`}
              >
                Turno Actual
              </button>
              <button
                onClick={() => setTipsScope('hoy')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  tipsScope === 'hoy'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40'
                }`}
              >
                Jornada de Hoy
              </button>
              <button
                onClick={() => setTipsScope('todos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  tipsScope === 'todos'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40'
                }`}
              >
                Todo el Historial ({allTipsOrders.length})
              </button>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-brand-brown/50 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar ticket, cajero, mozo, mesa..."
                value={tipSearchTerm}
                onChange={(e) => setTipSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-brand-secondary bg-brand-bg text-xs font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* Tabla Detallada de Pedidos con Propina */}
          <div className="bg-brand-card rounded-2xl border border-brand-secondary shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-brand-bg/80 border-b border-brand-secondary text-brand-brown/80 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="p-3.5">Ticket</th>
                    <th className="p-3.5">Fecha / Hora</th>
                    <th className="p-3.5">Mesa / Canal</th>
                    <th className="p-3.5">Mozo</th>
                    <th className="p-3.5 text-right">Consumo</th>
                    <th className="p-3.5 text-right">Propina Recaudada</th>
                    <th className="p-3.5 text-right">Total Cobrado</th>
                    <th className="p-3.5">Registrado por (Cajero)</th>
                    <th className="p-3.5">Medio de Pago</th>
                    <th className="p-3.5 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-secondary/40">
                  {filteredTipsOrders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-brand-brown/60 text-xs">
                        <Coins className="w-10 h-10 mx-auto mb-2 text-brand-brown/30" />
                        <p className="font-bold text-sm text-brand-dark">No hay propinas registradas</p>
                        <p className="text-brand-brown/70 mt-1">No se encontraron pedidos con propina en el rango seleccionado.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTipsOrders.map((ord) => {
                      const grandTotal = ord.total + (ord.tipAmount || 0);
                      return (
                        <tr key={ord.id} className="hover:bg-brand-bg/50 transition-colors">
                          <td className="p-3.5 font-mono font-extrabold text-brand-dark">
                            #{ord.code}
                          </td>
                          <td className="p-3.5 text-brand-brown whitespace-nowrap">
                            {formatDate(ord.createdAt)} hs
                          </td>
                          <td className="p-3.5 font-bold text-brand-dark">
                            {ord.tableName ? (
                              <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-200">
                                {ord.tableName}
                              </span>
                            ) : (
                              <span className="uppercase text-[11px] text-brand-brown">
                                {ord.type}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-brand-dark font-medium">
                            {ord.waiterName || 'Salón / Mostrador'}
                          </td>
                          <td className="p-3.5 text-right font-bold text-gray-700">
                            {formatCurrency(ord.total)}
                          </td>
                          <td className="p-3.5 text-right">
                            <span className="inline-flex items-center gap-1 font-mono font-extrabold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-300">
                              +{formatCurrency(ord.tipAmount || 0)}
                              <span className="text-[10px] text-emerald-700 font-bold">
                                ({ord.tipPercentage || 10}%)
                              </span>
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-mono font-black text-brand-dark text-sm">
                            {formatCurrency(grandTotal)}
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-950 flex items-center justify-center text-[10px] font-bold border border-amber-300 shrink-0">
                                👤
                              </span>
                              <div>
                                <span className="font-extrabold text-brand-dark block text-[11px]">
                                  {ord.tipRegisteredBy || 'Cajero de Turno'}
                                </span>
                                {ord.tipRegisteredAt && (
                                  <span className="text-[10px] text-gray-400">
                                    {formatDate(ord.tipRegisteredAt)} hs
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 capitalize font-semibold text-brand-brown">
                            {ord.paymentMethod}
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => setSelectedTipReceiptOrder(ord)}
                              className="p-1.5 rounded-xl bg-brand-bg hover:bg-brand-secondary/40 text-brand-dark border border-brand-secondary transition-all"
                              title="Ver Comprobante Digital"
                            >
                              <Eye className="w-4 h-4 text-brand-brown" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* HISTORIAL DE CAJAS & COMPROBANTES */
        <div className="bg-brand-card rounded-2xl border border-brand-secondary shadow-soft overflow-hidden">
          <div className="p-4 border-b border-brand-secondary">
            <h3 className="font-bold text-brand-dark flex items-center gap-2">
              <History className="w-5 h-5 text-brand-brown" /> Historial de Cajas & Comprobantes Z
            </h3>
          </div>
          <div className="divide-y divide-brand-secondary/40">
            {cashRegisters.filter(r => r.status === 'cerrada').sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime()).map(reg => (
              <div key={reg.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-brand-bg transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-brand-dark text-sm">Caja #{reg.id.slice(-6).toUpperCase()}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">Cerrada</span>
                  </div>
                  <p className="text-xs text-brand-brown/80">
                    Apertura: <strong>{formatDate(reg.openedAt)} hs</strong> ({reg.openedBy})
                  </p>
                  <p className="text-xs text-brand-brown/80">
                    Cierre: <strong>{reg.closedAt ? formatDate(reg.closedAt) : 'Sin datos'} hs</strong> ({reg.closedBy || reg.openedBy})
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-brand-brown/80">Esperado: {formatCurrency(reg.expectedBalance || reg.initialBalance)}</p>
                    <p className="text-sm font-extrabold text-brand-dark">Conteo Físico: {formatCurrency(reg.finalBalance || 0)}</p>
                    {reg.difference !== undefined && (
                      <p className={`text-[11px] font-bold ${reg.difference === 0 ? 'text-emerald-700' : reg.difference > 0 ? 'text-blue-700' : 'text-red-700'}`}>
                        {reg.difference === 0 ? '✓ Balance Exacto' : reg.difference > 0 ? `+${formatCurrency(reg.difference)} (Sobrante)` : `${formatCurrency(reg.difference)} (Faltante)`}
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setSelectedReceiptRegister(reg)}
                    className="py-2 px-3 rounded-xl bg-brand-brown text-brand-card hover:bg-brand-dark font-bold text-xs shadow-soft flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <FileText className="w-4 h-4 text-brand-yellow" />
                    Comprobante Z
                  </button>
                </div>
              </div>
            ))}
            {cashRegisters.filter(r => r.status === 'cerrada').length === 0 && (
              <div className="p-12 text-center text-sm text-brand-brown/60">No hay registros de cajas cerradas.</div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Apertura de Caja */}
      {isOpeningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 w-full max-w-md shadow-soft-lg space-y-4">
            <div className="flex items-center gap-2 border-b border-brand-secondary pb-3">
              <Wallet className="w-5 h-5 text-brand-brown" />
              <h3 className="text-base font-bold text-brand-dark">Apertura de Turno de Caja</h3>
            </div>
            <form onSubmit={handleOpenRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Fecha y Hora de Apertura</label>
                <div className="px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs font-mono font-bold text-brand-brown">
                  {formatDate(new Date().toISOString())} hs
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Responsable de Apertura</label>
                <input 
                  required 
                  type="text" 
                  value={openedBy} 
                  onChange={e => setOpenedBy(e.target.value)} 
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-bold text-xs focus:outline-none" 
                  placeholder="Nombre de usuario" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Fondo de Caja Inicial (Efectivo)</label>
                <input 
                  required 
                  type="number" 
                  min={0} 
                  value={initialBalance} 
                  onChange={e => setInitialBalance(Number(e.target.value))} 
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-bold text-base text-brand-dark focus:outline-none" 
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsOpeningModal(false)} className="flex-1 py-2.5 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark hover:bg-brand-secondary/40">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors shadow-soft">Abrir Caja</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Arqueo y Cierre de Caja */}
      {isClosingModal && activeRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 w-full max-w-lg shadow-soft-lg space-y-4 my-8">
            <div className="flex items-center gap-2 border-b border-brand-secondary pb-3">
              <Check className="w-5 h-5 text-brand-brown" />
              <h3 className="text-base font-bold text-brand-dark">Arqueo y Cierre de Turno de Caja</h3>
            </div>

            <div className="bg-brand-cream p-4 rounded-xl border border-brand-secondary text-xs space-y-2">
              <div className="flex justify-between"><span className="text-brand-brown">Hora de Apertura:</span> <strong className="text-brand-dark">{formatDate(activeRegister.openedAt)} hs</strong></div>
              <div className="flex justify-between"><span className="text-brand-brown">Hora de Cierre:</span> <strong className="text-brand-dark">{formatDate(new Date().toISOString())} hs</strong></div>
              <div className="flex justify-between border-t border-brand-secondary/60 pt-2"><span className="text-brand-brown font-bold">Efectivo Esperado por Sistema:</span> <strong className="text-brand-dark text-sm">{formatCurrency(expectedCash)}</strong></div>
            </div>

            <form onSubmit={handleConfirmCloseRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Responsable del Cierre</label>
                <input 
                  required 
                  type="text" 
                  value={closedBy} 
                  onChange={e => setClosedBy(e.target.value)} 
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-bold text-xs" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Conteo Físico de Efectivo Real en Caja</label>
                <input 
                  required 
                  type="number" 
                  min={0} 
                  value={finalBalance} 
                  onChange={e => setFinalBalance(Number(e.target.value))} 
                  className="w-full px-3 py-2.5 text-xl font-extrabold rounded-xl border-2 border-brand-brown bg-brand-bg text-brand-dark focus:outline-none" 
                />
              </div>

              {/* Diferencia Calculada */}
              {(() => {
                const diff = finalBalance - expectedCash;
                return (
                  <div className={`p-3 rounded-xl border text-xs flex items-center justify-between font-bold ${
                    diff === 0 ? 'bg-emerald-100 text-emerald-950 border-emerald-300' :
                    diff > 0 ? 'bg-blue-100 text-blue-950 border-blue-300' :
                    'bg-red-100 text-red-950 border-red-300'
                  }`}>
                    <span>Resultado del Arqueo:</span>
                    <span className="text-sm font-extrabold">
                      {diff === 0 ? '✓ Exacto ($0)' : diff > 0 ? `+${formatCurrency(diff)} (Sobrante)` : `${formatCurrency(diff)} (Faltante)`}
                    </span>
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Novedades / Observaciones del Cierre</label>
                <textarea 
                  rows={2} 
                  value={closingNotes} 
                  onChange={e => setClosingNotes(e.target.value)} 
                  placeholder="Detallar cualquier faltante, sobrante o eventualidad ocurrida en el turno..." 
                  className="w-full px-3 py-2 text-xs rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsClosingModal(false)} className="flex-1 py-2.5 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark hover:bg-brand-secondary/40">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-dark text-brand-card font-bold text-xs hover:bg-brand-dark/80 transition-colors shadow-soft">Confirmar Cierre & Generar Comprobante Z</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Comprobante Cierre Z / Exportar PDF */}
      {selectedReceiptRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 w-full max-w-2xl shadow-soft-lg space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-brand-brown" />
                <div>
                  <h3 className="text-lg font-extrabold text-brand-dark">Comprobante de Cierre Z</h3>
                  <p className="text-xs text-brand-brown/80">Caja #{selectedReceiptRegister.id.slice(-6).toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setSelectedReceiptRegister(null)} className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark">✕</button>
            </div>

            {/* Content Preview */}
            <div className="bg-brand-bg p-5 rounded-2xl border border-brand-secondary space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-brand-secondary pb-3">
                <div>
                  <span className="text-brand-brown font-bold block text-[10px] uppercase">Apertura</span>
                  <span className="font-extrabold text-brand-dark">{formatDate(selectedReceiptRegister.openedAt)} hs</span>
                  <p className="text-brand-brown">Por: {selectedReceiptRegister.openedBy}</p>
                </div>
                <div>
                  <span className="text-brand-brown font-bold block text-[10px] uppercase">Cierre</span>
                  <span className="font-extrabold text-brand-dark">{selectedReceiptRegister.closedAt ? formatDate(selectedReceiptRegister.closedAt) : 'En curso'} hs</span>
                  <p className="text-brand-brown">Por: {selectedReceiptRegister.closedBy || selectedReceiptRegister.openedBy}</p>
                </div>
              </div>

              {/* Balance Summary */}
              {(() => {
                const regTotals = calcTotals(selectedReceiptRegister.id);
                return (
                  <div className="space-y-2">
                    <h4 className="font-bold text-brand-dark uppercase text-[11px] text-brand-brown">Resumen por Método de Pago:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-bold">
                      <div className="bg-brand-card p-2 rounded-xl border border-brand-secondary">💵 Efectivo: {formatCurrency(regTotals.efectivo)}</div>
                      <div className="bg-brand-card p-2 rounded-xl border border-brand-secondary">📱 MercadoPago: {formatCurrency(regTotals.mercadopago)}</div>
                      <div className="bg-brand-card p-2 rounded-xl border border-brand-secondary">💳 Tarjetas: {formatCurrency(regTotals.tarjetas)}</div>
                      <div className="bg-brand-card p-2 rounded-xl border border-brand-secondary">🏦 Transferencias: {formatCurrency(regTotals.transferencias)}</div>
                      <div className="bg-brand-card p-2 rounded-xl border border-brand-secondary text-red-700">🔻 Egresos: -{formatCurrency(regTotals.egresos)}</div>
                      <div className="bg-brand-yellow/30 p-2 rounded-xl border border-brand-yellow font-extrabold text-brand-dark"> Total: {formatCurrency(regTotals.totalVentas)}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Arqueo Summary */}
              <div className="bg-brand-cream p-4 rounded-xl border border-brand-secondary space-y-1">
                <div className="flex justify-between"><span>Efectivo Esperado:</span> <strong>{formatCurrency(selectedReceiptRegister.expectedBalance || selectedReceiptRegister.initialBalance)}</strong></div>
                <div className="flex justify-between"><span>Conteo Real Declarado:</span> <strong>{formatCurrency(selectedReceiptRegister.finalBalance || 0)}</strong></div>
                <div className="flex justify-between border-t border-brand-secondary/60 pt-1 font-extrabold">
                  <span>Resultado Arqueo:</span>
                  <span className={(selectedReceiptRegister.difference || 0) >= 0 ? 'text-emerald-800' : 'text-red-700'}>
                    {(selectedReceiptRegister.difference || 0) === 0 ? '✓ Balance Exacto ($0)' : (selectedReceiptRegister.difference || 0) > 0 ? `+${formatCurrency(selectedReceiptRegister.difference || 0)} (Sobrante)` : `${formatCurrency(selectedReceiptRegister.difference || 0)} (Faltante)`}
                  </span>
                </div>
              </div>

              {selectedReceiptRegister.notes && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-950">
                  <strong className="block font-bold text-[10px] uppercase text-amber-800">Novedades:</strong>
                  {selectedReceiptRegister.notes}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 gap-2">
              <button 
                onClick={() => setSelectedReceiptRegister(null)} 
                className="py-2.5 px-4 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark hover:bg-brand-secondary/40"
              >
                Cerrar
              </button>
              <button 
                onClick={() => handlePrintPDF(selectedReceiptRegister)} 
                className="py-2.5 px-5 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors shadow-soft flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-brand-yellow" />
                Imprimir / Exportar Comprobante PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Transacción Manual */}
      {isTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 w-full max-w-md shadow-soft-lg space-y-4">
            <h3 className="text-base font-bold text-brand-dark">Nuevo Movimiento Manual</h3>
            <form onSubmit={handleAddTx} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setTxType('ingreso')} className={`py-2 rounded-xl text-xs font-bold border ${txType === 'ingreso' ? 'bg-brand-green/20 border-brand-green text-emerald-900 font-extrabold' : 'bg-brand-bg border-brand-secondary text-brand-dark'}`}>Ingreso</button>
                <button type="button" onClick={() => setTxType('egreso')} className={`py-2 rounded-xl text-xs font-bold border ${txType === 'egreso' ? 'bg-red-100 border-red-300 text-red-900 font-extrabold' : 'bg-brand-bg border-brand-secondary text-brand-dark'}`}>Egreso</button>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Monto ($)</label>
                <input 
                  required 
                  type="text" 
                  value={txAmount ? new Intl.NumberFormat('es-AR').format(txAmount) : ''} 
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setTxAmount(val ? parseInt(val, 10) : 0);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-bold text-base focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Método de Pago</label>
                <select value={txMethod} onChange={e => setTxMethod(e.target.value as PaymentMethod)} className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-bold text-xs focus:outline-none capitalize">
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="mercadopago">MercadoPago</option>
                  <option value="giftcard">Gift Card</option>
                  <option value="debito">Débito</option>
                  <option value="credito">Crédito</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Descripción / Concepto</label>
                <input required type="text" value={txDesc} onChange={e => setTxDesc(e.target.value)} placeholder="Ej. Pago a proveedor de harinas" className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-bold text-xs focus:outline-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsTxModal(false)} className="flex-1 py-2.5 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark hover:bg-brand-secondary/40">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors shadow-soft">Guardar Movimiento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Comprobante de Pago para Propinas */}
      {selectedTipReceiptOrder && (
        <OrderReceiptModal
          isOpen={true}
          order={selectedTipReceiptOrder}
          onClose={() => setSelectedTipReceiptOrder(null)}
        />
      )}
    </div>
  );
};
