import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, QrCode, Users, ExternalLink, X, SquareCheckBig, UtensilsCrossed, Receipt, ShoppingBag, ArrowRight, ArrowLeft, Clock, AlertCircle, CheckCircle2, RotateCcw, AlertTriangle, RefreshCw, Banknote, Edit3, Trash2, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Table, TableStatus, OrderStatus, Order, PaymentMethod } from '../types';
import { formatCurrency, formatDate } from '../utils/currency';
import { ModuleOnboardingBanner } from '../components/common/ModuleOnboardingBanner';

export const TablesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { tables, tableSectors, addTable, updateTable, deleteTable, updateTableStatus, updateOrderStatus, orders, addTransaction, cashRegisters, addSector, updateSector, deleteSector } = useApp();
  const [selectedHistoryTable, setSelectedHistoryTable] = useState<Table | null>(null);
  const [cancelledAlertOrder, setCancelledAlertOrder] = useState<Order | null>(null);
  const [lastCancelledCount, setLastCancelledCount] = useState<number>(0);

  const [chargingOrder, setChargingOrder] = useState<Order | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('efectivo');

  // Sector management states
  const [isSectorsModalOpen, setIsSectorsModalOpen] = useState(false);
  const [newSectorInput, setNewSectorInput] = useState('');
  const [editingSectorId, setEditingSectorId] = useState<string | null>(null);
  const [editingSectorName, setEditingSectorName] = useState('');
  const [isAddingNewSectorInline, setIsAddingNewSectorInline] = useState(false);
  const [inlineNewSectorName, setInlineNewSectorName] = useState('');

  const activeRegister = cashRegisters.find((r) => r.status === 'abierta');

  const handleChargeTableOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargingOrder || !activeRegister) return;

    addTransaction({
      registerId: activeRegister.id,
      orderId: chargingOrder.id,
      type: 'ingreso',
      amount: chargingOrder.total,
      paymentMethod: selectedPayment,
      description: `Cobro Pedido ${chargingOrder.code}`,
      registeredBy: user ? `${user.name} (${user.role})` : 'Atención en Salón / QR',
    });

    updateOrderStatus(chargingOrder.id, 'entregado');

    if (chargingOrder.tableId) {
      const otherUnpaid = orders.filter(
        (o) => o.tableId === chargingOrder.tableId && o.id !== chargingOrder.id && o.status !== 'entregado' && o.status !== 'cancelado'
      );
      if (otherUnpaid.length === 0) {
        updateTableStatus(chargingOrder.tableId, 'disponible');
      }
    }

    setChargingOrder(null);
  };

  // Monitor canceled orders for centered popup alert
  useEffect(() => {
    const cancelledOrders = orders.filter((o) => o.status === 'cancelado');
    if (cancelledOrders.length > lastCancelledCount && lastCancelledCount > 0) {
      const latest = cancelledOrders[0];
      if (latest) setCancelledAlertOrder(latest);
    }
    setLastCancelledCount(cancelledOrders.length);
  }, [orders, lastCancelledCount]);

  const isRegisterFromPreviousDay = (openedAtIso?: string): boolean => {
    if (!openedAtIso) return false;
    const openedDate = new Date(openedAtIso);
    const now = new Date();
    const openedDay = new Date(openedDate.getFullYear(), openedDate.getMonth(), openedDate.getDate()).getTime();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return openedDay < today;
  };

  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQrTable, setSelectedQrTable] = useState<Table | null>(null);
  const [qrTemplate, setQrTemplate] = useState<'elegant' | 'card' | 'totem'>('elegant');

  const generatePrintHTML = (table: Table, template: 'elegant' | 'card' | 'totem') => {
    const logoUrl = `${window.location.origin}/logo_hilos_de_amor.jpg`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(window.location.origin + '/menu?table=' + table.id)}`;

    if (template === 'elegant') {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Ficha QR - ${table.number}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@500;700;800&display=swap');
              body {
                margin: 0;
                padding: 40px 20px;
                background-color: #F8F6F0;
                font-family: 'Plus Jakarta Sans', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                box-sizing: border-box;
              }
              .card {
                width: 360px;
                background: #FFFFFF;
                border-radius: 28px;
                box-shadow: 0 15px 35px rgba(47,82,51,0.12);
                border: 3px solid #2F5233;
                overflow: hidden;
                text-align: center;
                position: relative;
              }
              .card-header {
                background: linear-gradient(135deg, #1A2E1E 0%, #2F5233 100%);
                color: #FFFFFF;
                padding: 30px 20px 45px 20px;
                position: relative;
              }
              .logo-wrap {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                border: 3px solid #D4AF37;
                overflow: hidden;
                margin: 0 auto 10px auto;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                background: #FFF;
              }
              .logo-wrap img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
              .brand-title {
                font-family: 'Playfair Display', serif;
                font-size: 22px;
                font-weight: 700;
                margin: 0;
                letter-spacing: 0.5px;
              }
              .brand-subtitle {
                font-size: 11px;
                color: #E8DFD8;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                margin-top: 4px;
              }
              .qr-container {
                margin: -25px auto 15px auto;
                background: #FFFFFF;
                width: 220px;
                height: 220px;
                border-radius: 20px;
                padding: 15px;
                box-sizing: border-box;
                box-shadow: 0 8px 25px rgba(0,0,0,0.08);
                border: 2px solid #E8DFD8;
                position: relative;
                z-index: 10;
              }
              .qr-container img {
                width: 100%;
                height: 100%;
                object-fit: contain;
              }
              .table-badge {
                font-family: 'Playfair Display', serif;
                font-size: 28px;
                font-weight: 700;
                color: #2F5233;
                margin: 10px 0 2px 0;
              }
              .sector-info {
                font-size: 12px;
                color: #765747;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 15px;
              }
              .cta-box {
                background: #F4EBE1;
                border-radius: 14px;
                padding: 12px 16px;
                margin: 0 24px 24px 24px;
                border: 1px solid #E8DFD8;
              }
              .cta-box p {
                margin: 0;
                font-size: 12px;
                color: #2F5233;
                font-weight: 700;
                line-height: 1.4;
              }
              @media print {
                @page { size: auto; margin: 0; }
                body { background: white; padding: 0; }
                .card { box-shadow: none; }
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="card-header">
                <div class="logo-wrap">
                  <img src="${logoUrl}" alt="Logo" />
                </div>
                <h1 class="brand-title">Hilos de Amor</h1>
                <div class="brand-subtitle">Pastelería & Encordado</div>
              </div>
              <div class="qr-container">
                <img src="${qrUrl}" onload="window.print();window.close();" />
              </div>
              <div class="table-badge">${table.number}</div>
              <div class="sector-info">Sector: ${table.sector}</div>
              <div class="cta-box">
                <p>📱 Escaneá con tu celular para ver el menú y realizar tu pedido</p>
              </div>
            </div>
          </body>
        </html>
      `;
    } else if (template === 'card') {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Adhesivo QR - ${table.number}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;800&display=swap');
              body {
                margin: 0;
                padding: 40px;
                background-color: #F8F6F0;
                font-family: 'Plus Jakarta Sans', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              .sticker {
                width: 320px;
                background: #FDFBF7;
                border-radius: 24px;
                border: 4px double #4A352C;
                padding: 24px;
                text-align: center;
                box-shadow: 0 10px 25px rgba(0,0,0,0.06);
              }
              .header-flex {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                margin-bottom: 16px;
              }
              .header-flex img {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                border: 2px solid #2F5233;
              }
              .header-flex h2 {
                margin: 0;
                font-size: 16px;
                color: #2F5233;
                font-weight: 800;
              }
              .qr-box {
                background: #FFF;
                border: 2px solid #2F5233;
                border-radius: 16px;
                padding: 12px;
                margin: 0 auto 16px auto;
                width: 200px;
                height: 200px;
                box-sizing: border-box;
              }
              .qr-box img {
                width: 100%;
                height: 100%;
              }
              .table-title {
                background: #2F5233;
                color: #FFF;
                padding: 6px 16px;
                border-radius: 20px;
                display: inline-block;
                font-size: 14px;
                font-weight: 800;
                letter-spacing: 1px;
                margin-bottom: 8px;
              }
              .sub {
                font-size: 11px;
                color: #765747;
                font-weight: 700;
                margin: 0;
              }
              @media print {
                @page { size: auto; margin: 0; }
                body { background: white; padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="sticker">
              <div class="header-flex">
                <img src="${logoUrl}" />
                <h2>HILOS DE AMOR</h2>
              </div>
              <div class="qr-box">
                <img src="${qrUrl}" onload="window.print();window.close();" />
              </div>
              <div class="table-title">${table.number.toUpperCase()}</div>
              <p class="sub">¡Pedí directamente desde tu celular!</p>
            </div>
          </body>
        </html>
      `;
    } else {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Standee QR - ${table.number}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
              body {
                margin: 0;
                padding: 30px;
                background-color: #F8F6F0;
                font-family: 'Plus Jakarta Sans', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              .totem {
                width: 300px;
                background: #FFFFFF;
                border-radius: 20px;
                border: 2px solid #D4AF37;
                overflow: hidden;
                box-shadow: 0 12px 30px rgba(0,0,0,0.1);
                text-align: center;
              }
              .top-bar {
                background: #2F5233;
                padding: 20px 15px;
                color: #FFF;
              }
              .top-bar img {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: 2px solid #FFF;
                margin-bottom: 6px;
              }
              .top-bar h3 {
                margin: 0;
                font-size: 18px;
              }
              .body-content {
                padding: 20px;
              }
              .steps {
                text-align: left;
                background: #F4EBE1;
                padding: 10px 14px;
                border-radius: 12px;
                font-size: 11px;
                color: #4A352C;
                margin-bottom: 15px;
                line-height: 1.6;
              }
              .qr-wrap {
                width: 180px;
                height: 180px;
                margin: 0 auto 10px auto;
                border: 2px solid #2F5233;
                border-radius: 14px;
                padding: 8px;
              }
              .qr-wrap img {
                width: 100%;
                height: 100%;
              }
              .table-num {
                font-size: 20px;
                font-weight: 800;
                color: #2F5233;
                margin-top: 5px;
              }
              @media print {
                @page { size: auto; margin: 0; }
                body { background: white; padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="totem">
              <div class="top-bar">
                <img src="${logoUrl}" />
                <h3>Hilos de Amor</h3>
              </div>
              <div class="body-content">
                <div class="steps">
                  1️⃣ Escaneá el código QR<br/>
                  2️⃣ Elegí del menú digital<br/>
                  3️⃣ ¡Recibí tu pedido en la mesa!
                </div>
                <div class="qr-wrap">
                  <img src="${qrUrl}" onload="window.print();window.close();" />
                </div>
                <div class="table-num">${table.number}</div>
              </div>
            </div>
          </body>
        </html>
      `;
    }
  };

  const getNextTableNumber = () => {
    let maxNum = 0;
    tables.forEach((t) => {
      const match = t.number.match(/\d+/);
      if (match) {
        const val = parseInt(match[0], 10);
        if (val > maxNum) maxNum = val;
      }
    });
    return `Mesa ${maxNum + 1}`;
  };

  const [formData, setFormData] = useState({
    number: 'Mesa 1',
    capacity: 4,
    sector: 'terraza',
    status: 'disponible' as TableStatus,
  });

  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editFormData, setEditFormData] = useState({
    number: '',
    capacity: 4,
    sector: 'Salón Principal',
  });
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);

  const handleOpenEditModal = (t: Table) => {
    setEditingTable(t);
    setEditFormData({
      number: t.number,
      capacity: t.capacity,
      sector: t.sector,
    });
    setIsAddingNewSectorInline(false);
    setInlineNewSectorName('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable || !editFormData.number.trim()) return;
    const success = updateTable(editingTable.id, editFormData);
    if (success) {
      setEditingTable(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (tableToDelete) {
      deleteTable(tableToDelete.id);
      setTableToDelete(null);
    }
  };

  const handleOpenAddModal = () => {
    let initialSector = 'Salón Principal';
    if (selectedSector !== 'all') {
      const match = tableSectors.find((s) => s.id === selectedSector);
      initialSector = match ? (match.label || match.name) : selectedSector;
    } else if (tableSectors.length > 0) {
      initialSector = tableSectors[0].label || tableSectors[0].name;
    }

    setFormData({
      number: getNextTableNumber(),
      capacity: 4,
      sector: initialSector,
      status: 'disponible',
    });
    setIsAddingNewSectorInline(false);
    setInlineNewSectorName('');
    setIsModalOpen(true);
  };

  const filteredTables = tables.filter((t) => {
    if (selectedSector === 'all') return true;
    const matchSec = tableSectors.find((s) => s.id === selectedSector);
    const target = (matchSec?.label || matchSec?.name || selectedSector).toLowerCase();
    return t.sector.trim().toLowerCase() === target || t.sector.trim().toLowerCase() === selectedSector.toLowerCase();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number.trim()) return;
    const success = addTable(formData);
    if (success) {
      setIsModalOpen(false);
    }
  };

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

  const getKanbanBadge = (status: OrderStatus) => {
    switch (status) {
      case 'nuevo':
        return { text: '✨ Nuevo', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'confirmado':
        return { text: '🔵 Confirmado', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'en_preparacion':
        return { text: '🍳 En Preparación', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'listo':
        return { text: '🔔 Listo p/ Servir', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'en_camino':
        return { text: '🛵 En Camino', color: 'bg-sky-100 text-sky-900 border-sky-300' };
      case 'entregado':
        return { text: '✓ Entregado', color: 'bg-gray-100 text-gray-800 border-gray-300' };
      case 'cancelado':
        return { text: '❌ Cancelado', color: 'bg-rose-100 text-rose-950 border-rose-300' };
      default:
        return { text: status, color: 'bg-brand-cream text-brand-dark border-brand-secondary' };
    }
  };

  const getStatusBadge = (status: TableStatus, hasPendingPayment?: boolean, pendingTotal?: number) => {
    switch (status) {
      case 'disponible':
        return 'bg-emerald-100 text-emerald-950 border-emerald-300';
      case 'reservada':
        return 'bg-amber-100 text-amber-950 border-amber-300';
      case 'ocupada':
        if (hasPendingPayment) {
          return 'bg-amber-500 text-white border-amber-600 font-extrabold animate-pulse';
        }
        return 'bg-emerald-700 text-white border-emerald-800 font-extrabold';
      default:
        return 'bg-brand-cream text-brand-dark';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-brand-card p-4 sm:p-6 rounded-2xl border border-brand-secondary shadow-soft">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-dark">Gestión de Mesas & Códigos QR</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Visualización gráfica de sectores, capacidad y comandos asociados ({tables.length} mesas)
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsSectorsModalOpen(true)}
              className="w-full sm:w-auto py-2.5 px-3 sm:px-4 rounded-xl border-2 border-brand-brown text-brand-brown font-bold text-xs hover:bg-brand-brown/10 transition-all duration-200 flex items-center justify-center gap-2 shadow-xs"
            >
              <Layers className="w-4 h-4 text-brand-brown shrink-0" />
              <span>Administrar Sectores</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="w-full sm:w-auto py-2.5 px-3 sm:px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-all duration-200 shadow-soft flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-brand-yellow shrink-0" />
              <span className="whitespace-nowrap">Agregar mesa</span>
            </button>
          </div>
        )}
      </div>

      {/* Banner Advertencia de Caja Cerrada */}
      {!activeRegister && (
        <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-2xl text-amber-950 flex items-center justify-between gap-4 shadow-soft">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm text-amber-950">⚠️ Caja Cerrada</h4>
              <p className="text-xs text-amber-900 mt-0.5">
                La caja del sistema está cerrada. Abrí la caja en Tesorería para habilitar el registro de nuevos pedidos y cobros.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/caja')}
            className="px-4 py-2 rounded-xl bg-amber-800 text-white font-extrabold text-xs hover:bg-amber-900 transition shrink-0 shadow-xs"
          >
            Ir a Tesorería
          </button>
        </div>
      )}

      {/* Banner Advertencia de Caja Abierta de Jornada Anterior */}
      {activeRegister && isRegisterFromPreviousDay(activeRegister.openedAt) && (
        <div className="bg-amber-50 border-2 border-amber-500 p-4 rounded-2xl text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 animate-pulse" />
            <div>
              <h4 className="font-extrabold text-sm text-amber-950">⚠️ Caja Abierta de una Jornada Anterior</h4>
              <p className="text-xs text-amber-900 mt-0.5">
                La caja activa fue abierta el <strong>{formatDate(activeRegister.openedAt)} hs</strong> ({activeRegister.openedBy}) y quedó pendiente de cierre. Te sugerimos realizar el arqueo en Tesorería.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/caja')}
            className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-xs transition shrink-0 shadow-xs flex items-center gap-1.5"
          >
            <span>Arqueo & Cerrar Caja</span>
          </button>
        </div>
      )}

      {/* Sector Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto bg-brand-card p-3 rounded-2xl border border-brand-secondary shadow-soft">
        <button
          onClick={() => setSelectedSector('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedSector === 'all'
              ? 'bg-brand-brown text-brand-card shadow-soft'
              : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40'
          }`}
        >
          <span>Todos los sectores</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            selectedSector === 'all' ? 'bg-white/20 text-white' : 'bg-brand-secondary/60 text-brand-brown'
          }`}>
            {tables.length}
          </span>
        </button>
        {tableSectors.map((sec) => {
          const secLabel = (sec.label || sec.name || sec.id).toLowerCase();
          const count = tables.filter(
            (t) => t.sector.trim().toLowerCase() === secLabel || t.sector.trim().toLowerCase() === sec.id.toLowerCase()
          ).length;

          return (
            <button
              key={sec.id}
              onClick={() => setSelectedSector(sec.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedSector === sec.id
                  ? 'bg-brand-brown text-brand-card shadow-soft'
                  : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40'
              }`}
            >
              <span>{sec.label || sec.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedSector === sec.id ? 'bg-white/20 text-white' : 'bg-brand-secondary/60 text-brand-brown'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tables Visual Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTables.map((t) => {
          const tableOrders = orders.filter((o) => o.tableId === t.id);
          const pendingOrders = tableOrders.filter((o) => o.status !== 'entregado' && o.status !== 'cancelado');
          const hasPendingPayment = pendingOrders.length > 0;
          const pendingTotal = pendingOrders.reduce((sum, o) => sum + o.total, 0);

          return (
            <div
              key={t.id}
              className={`bg-brand-card rounded-2xl border p-5 shadow-soft flex flex-col justify-between space-y-4 hover:border-brand-brown/40 transition-all ${
                t.status === 'ocupada'
                  ? hasPendingPayment
                    ? 'border-2 border-amber-500 bg-amber-50/20 shadow-md'
                    : 'border-2 border-emerald-600 bg-emerald-50/20 shadow-soft'
                  : t.status === 'disponible'
                  ? 'border-brand-green/60'
                  : 'border-brand-yellow/80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-brand-dark font-serif">{t.number}</span>
                    
                    {/* Botón Circular de Pedidos Anteriores */}
                    <button
                      onClick={() => setSelectedHistoryTable(t)}
                      title="Pedidos anteriores"
                      className="w-7 h-7 rounded-full bg-brand-bg hover:bg-brand-brown hover:text-brand-card border border-brand-secondary text-brand-brown transition-all shadow-xs flex items-center justify-center relative group shrink-0"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      {tableOrders.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-brown text-brand-card font-extrabold text-[9px] flex items-center justify-center border border-white">
                          {tableOrders.length}
                        </span>
                      )}
                      <span className="absolute bottom-full mb-1 hidden group-hover:block whitespace-nowrap bg-brand-dark text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-soft z-20 pointer-events-none">
                        Pedidos anteriores
                      </span>
                    </button>

                    {/* Acciones de Edición & Eliminación (Solo Admin) */}
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(t)}
                          className="p-1 rounded-lg hover:bg-brand-secondary/60 text-brand-brown transition-colors"
                          title="Editar mesa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTableToDelete(t)}
                          className="p-1 rounded-lg hover:bg-rose-100 text-rose-700 transition-colors"
                          title="Eliminar mesa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      t.status,
                      hasPendingPayment,
                      pendingTotal
                    )}`}
                  >
                    {t.status === 'ocupada'
                      ? hasPendingPayment
                        ? `Por Cobrar (${formatCurrency(pendingTotal)})`
                        : '✓ Cobrado'
                      : t.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-brand-brown/80">
                  <span className="capitalize bg-brand-cream px-2.5 py-1 rounded-lg border border-brand-secondary/60 font-semibold">
                    {t.sector}
                  </span>
                  <span className="flex items-center gap-1 font-bold">
                    <Users className="w-3.5 h-3.5 text-brand-brown" /> {t.capacity} personas
                  </span>
                </div>

                {/* Banner indicativo de estado de cobro */}
                {t.status === 'ocupada' && (
                  <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border ${
                    hasPendingPayment
                      ? 'bg-amber-100/90 text-amber-950 border-amber-300'
                      : 'bg-emerald-100/90 text-emerald-950 border-emerald-300'
                  }`}>
                    <span className="flex items-center gap-1.5 text-[11px]">
                      {hasPendingPayment ? (
                        <>
                          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                          Cuenta Pendiente
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          Mesa Cobrada
                        </>
                      )}
                    </span>
                    <span className="font-extrabold">
                      {hasPendingPayment ? formatCurrency(pendingTotal) : 'Sin saldo'}
                    </span>
                  </div>
                )}

                {/* Comanda en Vivo por Kanban en la Mesa */}
                {pendingOrders.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-brand-secondary/60">
                    <span className="text-[10px] font-extrabold text-brand-brown/80 uppercase tracking-wider block">
                      Estado Kanban en Vivo:
                    </span>
                    {pendingOrders.map((po) => {
                      const kb = getKanbanBadge(po.status);
                      const prevSt = getPreviousStatus(po.status);
                      const nextSt = getNextStatus(po.status);
                      return (
                        <div
                          key={po.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs bg-brand-bg p-2.5 rounded-xl border border-brand-secondary/80 shadow-xs gap-2"
                        >
                          <span className="font-mono font-extrabold text-brand-dark">{po.code}</span>
                          <div className="flex items-center gap-1 flex-wrap w-full sm:w-auto justify-end">
                            {prevSt && (
                              <button
                                onClick={() => updateOrderStatus(po.id, prevSt)}
                                className="p-1.5 rounded-lg bg-brand-bg hover:bg-brand-secondary/40 text-brand-brown border border-brand-secondary/80 transition-colors"
                                title="Retroceder estado"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${kb.color}`}>
                              {kb.text}
                            </span>
                            {nextSt && (
                              <button
                                onClick={() => {
                                  if (nextSt === 'entregado') {
                                    setChargingOrder(po);
                                    setSelectedPayment(po.paymentMethod);
                                  } else {
                                    updateOrderStatus(po.id, nextSt);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-brand-brown hover:bg-brand-dark text-white transition-colors"
                                title="Avanzar estado"
                              >
                                <ArrowRight className="w-3.5 h-3.5 text-brand-yellow" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setChargingOrder(po);
                                setSelectedPayment(po.paymentMethod);
                              }}
                              className="py-1 px-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[10px] shadow-xs flex items-center gap-1 transition-all shrink-0 ml-auto sm:ml-0"
                              title="Cobrar este pedido"
                            >
                              <Banknote className="w-3 h-3 text-brand-yellow" /> Cobrar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            {/* Actions & QR Trigger */}
            <div className="pt-3 border-t border-brand-secondary/60 space-y-3">
              {hasPendingPayment && (
                <button
                  onClick={() => {
                    const firstPending = pendingOrders[0];
                    if (firstPending) {
                      setChargingOrder(firstPending);
                      setSelectedPayment(firstPending.paymentMethod);
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Banknote className="w-4 h-4 text-brand-yellow" />
                  Cobrar Mesa ({formatCurrency(pendingTotal)})
                </button>
              )}

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => updateTableStatus(t.id, 'disponible')}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    t.status === 'disponible'
                      ? 'bg-brand-green text-emerald-950 font-extrabold shadow-xs'
                      : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/30'
                  }`}
                >
                  Libre
                </button>
                <button
                  onClick={() => updateTableStatus(t.id, 'ocupada')}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    t.status === 'ocupada'
                      ? 'bg-brand-brown text-brand-card font-extrabold shadow-xs'
                      : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/30'
                  }`}
                >
                  Ocupada
                </button>
                <button
                  onClick={() => updateTableStatus(t.id, 'reservada')}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    t.status === 'reservada'
                      ? 'bg-brand-yellow text-brand-dark font-extrabold shadow-xs'
                      : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/30'
                  }`}
                >
                  Reserva
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedQrTable(t)}
                  className="w-full py-2 px-3 rounded-xl bg-brand-bg hover:bg-brand-secondary/40 text-brand-dark border border-brand-secondary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <QrCode className="w-4 h-4 text-brand-brown shrink-0" />
                  <span className="whitespace-nowrap">Código QR</span>
                </button>
                <button
                  disabled={!activeRegister}
                  onClick={() => {
                    if (activeRegister) {
                      window.open(`/menu?table=${t.id}&admin=true`, '_blank');
                    }
                  }}
                  title={!activeRegister ? "Caja cerrada: Abrí turno en Tesorería para tomar pedidos" : "Tomar pedido"}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs shadow-soft flex items-center justify-center gap-1.5 transition-colors ${
                    !activeRegister
                      ? 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed'
                      : 'bg-brand-brown hover:bg-brand-dark text-brand-card'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4 text-brand-yellow shrink-0" />
                  <span className="whitespace-nowrap">Tomar Pedido</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
      </div>

      {/* Modal QR Previewer & Print Templates */}
      {selectedQrTable && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 max-w-md w-full text-center space-y-4 shadow-soft-lg">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
                <QrCode className="w-5 h-5 text-brand-brown" /> Código QR {selectedQrTable.number}
              </h3>
              <button
                onClick={() => setSelectedQrTable(null)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Selector */}
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold text-brand-brown uppercase tracking-wider block">
                Seleccionar Estilo de Ficha para Imprimir:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setQrTemplate('elegant')}
                  className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-center ${
                    qrTemplate === 'elegant'
                      ? 'bg-brand-brown text-brand-card border-brand-brown shadow-xs'
                      : 'bg-brand-bg text-brand-dark border-brand-secondary hover:bg-brand-secondary/30'
                  }`}
                >
                  🌿 Elegante
                </button>
                <button
                  onClick={() => setQrTemplate('card')}
                  className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-center ${
                    qrTemplate === 'card'
                      ? 'bg-brand-brown text-brand-card border-brand-brown shadow-xs'
                      : 'bg-brand-bg text-brand-dark border-brand-secondary hover:bg-brand-secondary/30'
                  }`}
                >
                  ☕ Ficha
                </button>
                <button
                  onClick={() => setQrTemplate('totem')}
                  className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-center ${
                    qrTemplate === 'totem'
                      ? 'bg-brand-brown text-brand-card border-brand-brown shadow-xs'
                      : 'bg-brand-bg text-brand-dark border-brand-secondary hover:bg-brand-secondary/30'
                  }`}
                >
                  📱 Tótem
                </button>
              </div>
            </div>

            {/* Live Preview of Selected Template */}
            <div className="bg-brand-cream p-5 rounded-2xl border border-brand-secondary flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center gap-2 bg-brand-card px-3 py-1.5 rounded-full border border-brand-secondary shadow-xs">
                <img src="/logo_hilos_de_amor.jpg" alt="Hilos de Amor" className="w-5 h-5 rounded-full object-cover border border-brand-brown" />
                <span className="text-xs font-bold text-brand-dark font-serif">Hilos de Amor</span>
              </div>

              <div className="w-40 h-40 bg-white p-2.5 rounded-xl shadow-soft flex items-center justify-center border-2 border-brand-dark overflow-hidden">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/menu?table=' + selectedQrTable.id)}`}
                  alt={`QR Mesa ${selectedQrTable.number}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-extrabold text-brand-dark font-serif">{selectedQrTable.number}</p>
                <p className="text-[10px] text-brand-brown/80 capitalize font-medium">
                  Sector: {selectedQrTable.sector} • {selectedQrTable.capacity} personas
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  const printHtml = generatePrintHTML(selectedQrTable, qrTemplate);
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(printHtml);
                    printWindow.document.close();
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors shadow-soft flex items-center justify-center gap-2"
              >
                🖨️ Imprimir Ficha de Mesa ({qrTemplate === 'elegant' ? 'Elegante' : qrTemplate === 'card' ? 'Ficha' : 'Tótem'})
              </button>
              
              <button
                onClick={() => {
                  window.open(`/menu?table=${selectedQrTable.id}`, '_blank');
                  setSelectedQrTable(null);
                }}
                className="w-full py-2 px-4 rounded-xl bg-brand-card text-brand-dark border border-brand-secondary font-bold text-xs hover:bg-brand-secondary/30 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4 text-brand-brown" />
                Abrir menú asociado a esta mesa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Order History per Table */}
      {selectedHistoryTable && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border-2 border-brand-brown p-6 max-w-lg w-full shadow-soft-lg space-y-4 max-h-[85vh] flex flex-col relative">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3 shrink-0">
              <h3 className="text-base font-extrabold text-brand-dark font-serif flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand-brown" />
                Historial de Pedidos: {selectedHistoryTable.number}
              </h3>
              <button
                onClick={() => setSelectedHistoryTable(null)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {orders.filter((o) => o.tableId === selectedHistoryTable.id).length === 0 ? (
                <div className="text-center py-8 text-brand-brown/60 space-y-2">
                  <ShoppingBag className="w-8 h-8 mx-auto text-brand-secondary" />
                  <p className="text-xs font-bold">No hay pedidos registrados para esta mesa</p>
                </div>
              ) : (
                orders
                  .filter((o) => o.tableId === selectedHistoryTable.id)
                  .map((ord) => {
                    const isPaid = ord.status === 'entregado';
                    const isCancelled = ord.status === 'cancelado';
                    const kb = getKanbanBadge(ord.status);

                    return (
                      <div key={ord.id} className={`p-4 rounded-xl border space-y-2 ${isCancelled ? 'border-rose-300 bg-rose-50/30' : 'border-brand-secondary bg-brand-bg'}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-brand-dark">{ord.code}</span>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${kb.color}`}
                          >
                            {kb.text}
                          </span>
                        </div>
                        <p className="text-[10px] text-brand-brown/80 font-mono">
                          {formatDate(ord.createdAt)}
                        </p>
                        <div className="text-xs space-y-1 py-1.5 border-t border-b border-brand-secondary/60">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-brand-dark">
                              <span>
                                {item.quantity}x {item.productName}
                              </span>
                              <span className="font-bold">{formatCurrency(item.unitPrice * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-extrabold text-brand-brown">
                            Total: {formatCurrency(ord.total)}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {isCancelled ? (
                              <button
                                onClick={() => {
                                  updateOrderStatus(ord.id, 'nuevo');
                                  setSelectedHistoryTable(null);
                                }}
                                className="py-1 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-colors flex items-center gap-1 shadow-xs"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-brand-yellow" /> Reactivar Pedido
                              </button>
                            ) : !isPaid ? (
                              <>
                                <button
                                  onClick={() => {
                                    updateOrderStatus(ord.id, 'cancelado');
                                    setSelectedHistoryTable(null);
                                  }}
                                  className="py-1 px-2.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-colors"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedHistoryTable(null);
                                    navigate('/pedidos');
                                  }}
                                  className="py-1 px-3 rounded-lg bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors flex items-center gap-1 shadow-xs"
                                >
                                  Ir a cobrar <ArrowRight className="w-3.5 h-3.5 text-brand-yellow" />
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modal Advertencia Cancelación Centrado en Pantalla */}
      {cancelledAlertOrder && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-brand-dark/70 backdrop-blur-md animate-fade-in">
          <div className="bg-brand-card rounded-2xl border-4 border-rose-600 p-6 max-w-md w-full shadow-soft-lg space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto border-2 border-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-brand-dark">¡ATENCIÓN! Pedido Cancelado</h3>
              <p className="text-xs text-brand-brown/90 mt-2 leading-relaxed">
                Se ha registrado la cancelación del pedido <strong className="text-rose-700">{cancelledAlertOrder.code}</strong>{' '}
                asociado a <strong>{cancelledAlertOrder.tableName || 'Mesa'}</strong> por un valor de{' '}
                <strong className="text-brand-dark">{formatCurrency(cancelledAlertOrder.total)}</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCancelledAlertOrder(null)}
              className="w-full py-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-xs shadow-md transition-all uppercase tracking-wider"
            >
              Entendido / Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Modal Cobrar Pedido de Mesa */}
      {chargingOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border-2 border-emerald-600 p-6 w-full max-w-md shadow-soft-lg space-y-4">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-extrabold text-brand-dark font-serif">Cobrar Pedido {chargingOrder.code}</h3>
              </div>
              <button onClick={() => setChargingOrder(null)} className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-brand-cream p-4 rounded-xl border border-brand-secondary/80 text-xs space-y-2">
              <div className="flex justify-between text-brand-brown">
                <span>Mesa / Cliente:</span>
                <strong>{chargingOrder.tableName || 'Mesa'} • {chargingOrder.customerName}</strong>
              </div>
              <div className="space-y-1 py-2 border-t border-b border-brand-secondary/60">
                {chargingOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-brand-dark">
                    <span>{it.quantity}x {it.productName}</span>
                    <span className="font-bold">{formatCurrency(it.unitPrice * it.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm font-extrabold text-brand-dark pt-1">
                <span>Total a cobrar:</span>
                <span className="text-emerald-800 text-base">{formatCurrency(chargingOrder.total)}</span>
              </div>
            </div>

            {!activeRegister ? (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl font-bold">
                ⚠️ No hay una caja abierta en Tesorería. Abrí un turno antes de cobrar.
              </div>
            ) : (
              <form onSubmit={handleChargeTableOrder} className="space-y-3">
                <div>
                  <label className="block text-xs font-extrabold text-brand-dark mb-1">Método de Pago</label>
                  <select
                    value={selectedPayment}
                    onChange={(e) => setSelectedPayment(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs font-bold text-brand-dark focus:outline-none capitalize"
                  >
                    <option value="efectivo">💵 Efectivo</option>
                    <option value="transferencia">🏦 Transferencia</option>
                    <option value="mercadopago">📲 MercadoPago</option>
                    <option value="debito">💳 Débito</option>
                    <option value="credito">💳 Crédito</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setChargingOrder(null)}
                    className="flex-1 py-2.5 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark hover:bg-brand-secondary/30 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-700 text-white font-extrabold text-xs hover:bg-emerald-800 transition shadow-soft flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Confirmar Pago
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Add Table Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 max-w-md w-full shadow-soft-lg space-y-4">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <h3 className="text-base font-bold text-brand-dark">Agregar Mesa</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-brand-dark mb-1">Número o nombre</label>
                <input
                  type="text"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="Ej. Mesa 13, Barra 2, VIP 1"
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Capacidad (personas)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-brand-dark">Sector</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewSectorInline(!isAddingNewSectorInline)}
                      className="text-[10px] text-brand-brown font-bold hover:underline"
                    >
                      {isAddingNewSectorInline ? 'Elegir lista' : '+ Nuevo'}
                    </button>
                  </div>

                  {isAddingNewSectorInline ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="Ej. Balcón"
                        value={inlineNewSectorName}
                        onChange={(e) => setInlineNewSectorName(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-xl border border-brand-secondary bg-brand-bg text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (inlineNewSectorName.trim()) {
                            addSector({ name: inlineNewSectorName.trim(), label: inlineNewSectorName.trim() });
                            setFormData({ ...formData, sector: inlineNewSectorName.trim() });
                            setInlineNewSectorName('');
                            setIsAddingNewSectorInline(false);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-brand-brown text-white font-bold text-[10px] hover:bg-brand-dark transition shrink-0"
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <select
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none capitalize"
                    >
                      {tableSectors.map((sec) => (
                        <option key={sec.id} value={sec.label || sec.name}>
                          {sec.label || sec.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Estado inicial</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TableStatus })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                >
                  <option value="disponible">Disponible (Verde)</option>
                  <option value="reservada">Reservada (Amarillo)</option>
                  <option value="ocupada">Ocupada (Marrón)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold hover:bg-brand-dark transition-colors shadow-soft"
                >
                  Crear mesa
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-brand-secondary font-bold text-brand-dark hover:bg-brand-secondary/30"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Mesa (Solo Admin) */}
      {editingTable && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-5 max-w-md w-full shadow-soft-lg space-y-4">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-2">
              <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-brown" /> Editar Mesa: {editingTable.number}
              </h3>
              <button
                onClick={() => setEditingTable(null)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-brand-dark mb-1">Nombre / Número de Mesa</label>
                <input
                  type="text"
                  required
                  value={editFormData.number}
                  onChange={(e) => setEditFormData({ ...editFormData, number: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Capacidad (personas)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editFormData.capacity}
                    onChange={(e) => setEditFormData({ ...editFormData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-brand-dark">Sector</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewSectorInline(!isAddingNewSectorInline)}
                      className="text-[10px] text-brand-brown font-bold hover:underline"
                    >
                      {isAddingNewSectorInline ? 'Elegir lista' : '+ Nuevo'}
                    </button>
                  </div>

                  {isAddingNewSectorInline ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="Ej. Balcón"
                        value={inlineNewSectorName}
                        onChange={(e) => setInlineNewSectorName(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-xl border border-brand-secondary bg-brand-bg text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (inlineNewSectorName.trim()) {
                            addSector({ name: inlineNewSectorName.trim(), label: inlineNewSectorName.trim() });
                            setEditFormData({ ...editFormData, sector: inlineNewSectorName.trim() });
                            setInlineNewSectorName('');
                            setIsAddingNewSectorInline(false);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-brand-brown text-white font-bold text-[10px] hover:bg-brand-dark transition shrink-0"
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <select
                      value={editFormData.sector}
                      onChange={(e) => setEditFormData({ ...editFormData, sector: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none capitalize"
                    >
                      {!tableSectors.some(s => (s.label || s.name).toLowerCase() === editFormData.sector.toLowerCase()) && (
                        <option value={editFormData.sector}>{editFormData.sector}</option>
                      )}
                      {tableSectors.map((sec) => (
                        <option key={sec.id} value={sec.label || sec.name}>
                          {sec.label || sec.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold hover:bg-brand-dark transition-colors shadow-soft"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTable(null)}
                  className="py-2.5 px-4 rounded-xl border border-brand-secondary font-bold text-brand-dark hover:bg-brand-secondary/30"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación de Mesa (Solo Admin) */}
      {tableToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border-2 border-rose-300 p-6 max-w-sm w-full shadow-soft-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-brand-dark">¿Eliminar {tableToDelete.number}?</h3>
              <p className="text-xs text-brand-brown/80 mt-1">
                Esta acción eliminará la mesa y su código QR asignado del sector <span className="font-bold">{tableToDelete.sector}</span>.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-xs shadow-soft transition-colors"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setTableToDelete(null)}
                className="py-2.5 px-4 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark hover:bg-brand-secondary/30"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Administrar Sectores */}
      {isSectorsModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border-2 border-brand-brown p-6 max-w-lg w-full shadow-soft-lg space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-cream border border-brand-secondary flex items-center justify-center text-brand-brown">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-dark font-serif">Administrar Sectores</h3>
                  <p className="text-[11px] text-brand-brown/80">Crea, renombra y organiza los sectores del local</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSectorsModalOpen(false);
                  setEditingSectorId(null);
                }}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario Agregar Nuevo Sector */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newSectorInput.trim()) return;
                addSector({ name: newSectorInput.trim(), label: newSectorInput.trim() });
                setNewSectorInput('');
              }}
              className="flex gap-2 shrink-0 bg-brand-cream/60 p-3 rounded-xl border border-brand-secondary/70"
            >
              <input
                type="text"
                placeholder="Nombre del nuevo sector (ej. Salón VIP, Barra, Jardín)..."
                value={newSectorInput}
                onChange={(e) => setNewSectorInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs font-medium text-brand-dark focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition shadow-soft flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4 text-brand-yellow" />
                <span>Agregar</span>
              </button>
            </form>

            {/* Listado de Sectores */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              <p className="text-[11px] font-bold text-brand-brown uppercase tracking-wider px-1">
                Sectores Configurados ({tableSectors.length})
              </p>
              {tableSectors.length === 0 ? (
                <p className="text-xs text-center text-brand-brown/60 py-6">No hay sectores configurados.</p>
              ) : (
                tableSectors.map((sec) => {
                  const secName = sec.label || sec.name;
                  const assignedTables = tables.filter(
                    (t) => t.sector.trim().toLowerCase() === secName.trim().toLowerCase() ||
                           t.sector.trim().toLowerCase() === sec.id.toLowerCase()
                  );
                  const isEditingThis = editingSectorId === sec.id;

                  return (
                    <div
                      key={sec.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-brand-bg border border-brand-secondary/80 hover:border-brand-brown/40 transition gap-3"
                    >
                      {isEditingThis ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingSectorName}
                            onChange={(e) => setEditingSectorName(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 rounded-lg border border-brand-brown bg-white text-xs font-bold text-brand-dark focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (editingSectorName.trim()) {
                                updateSector(sec.id, { label: editingSectorName.trim(), name: editingSectorName.trim() });
                                setEditingSectorId(null);
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSectorId(null)}
                            className="px-2.5 py-1.5 rounded-lg border border-brand-secondary text-xs text-brand-dark hover:bg-brand-secondary/30 transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-brand-dark capitalize">{secName}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-card text-brand-brown border border-brand-secondary">
                              {assignedTables.length} {assignedTables.length === 1 ? 'mesa' : 'mesas'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSectorId(sec.id);
                                setEditingSectorName(secName);
                              }}
                              className="p-1.5 rounded-lg hover:bg-brand-secondary text-brand-brown transition"
                              title="Renombrar sector"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (assignedTables.length > 0) {
                                  if (window.confirm(`El sector "${secName}" tiene ${assignedTables.length} mesas asignadas. Al eliminarlo, las mesas se reasignarán automáticamente. ¿Deseas continuar?`)) {
                                    deleteSector(sec.id);
                                  }
                                } else {
                                  deleteSector(sec.id);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-700 transition"
                              title="Eliminar sector"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-brand-secondary/60 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsSectorsModalOpen(false);
                  setEditingSectorId(null);
                }}
                className="px-5 py-2 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition shadow-soft"
              >
                Listo / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
