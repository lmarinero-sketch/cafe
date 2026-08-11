import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, QrCode, Users, ExternalLink, X, SquareCheckBig, UtensilsCrossed, Receipt, ShoppingBag, ArrowRight, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Table, TableStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/currency';
import { ModuleOnboardingBanner } from '../components/common/ModuleOnboardingBanner';

export const TablesPage: React.FC = () => {
  const navigate = useNavigate();
  const { tables, tableSectors, addTable, updateTableStatus, orders } = useApp();
  const [selectedHistoryTable, setSelectedHistoryTable] = useState<Table | null>(null);

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

  const [formData, setFormData] = useState({
    number: 'Mesa 13',
    capacity: 4,
    sector: 'terraza',
    status: 'disponible' as TableStatus,
  });

  const filteredTables = tables.filter(
    (t) => selectedSector === 'all' || t.sector === selectedSector
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number) return;
    addTable(formData);
    setIsModalOpen(false);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-dark">Gestión de Mesas & Códigos QR</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Visualización gráfica de sectores, capacidad y comandos asociados ({tables.length} mesas)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="py-2.5 px-4 rounded-xl border-2 border-brand-brown text-brand-brown font-bold text-xs hover:bg-brand-brown/10 transition-all duration-200 flex items-center gap-2"
          >
            Administrar Sectores
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-all duration-200 shadow-soft flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-brand-yellow" />
            Agregar mesa
          </button>
        </div>
      </div>

      {/* Sector Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto bg-brand-card p-3 rounded-2xl border border-brand-secondary shadow-soft">
        <button
          onClick={() => setSelectedSector('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedSector === 'all'
              ? 'bg-brand-brown text-brand-card shadow-soft'
              : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40'
          }`}
        >
          Todos los sectores
        </button>
        {tableSectors.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setSelectedSector(sec.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedSector === sec.id
                ? 'bg-brand-brown text-brand-card shadow-soft'
                : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40'
            }`}
          >
            {sec.label}
          </button>
        ))}
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
              </div>

            {/* Actions & QR Trigger */}
            <div className="pt-3 border-t border-brand-secondary/60 space-y-3">
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
                  onClick={() => window.open(`/menu?table=${t.id}&admin=true`, '_blank')}
                  className="w-full py-2 px-3 rounded-xl bg-brand-brown hover:bg-brand-dark text-brand-card font-bold text-xs shadow-soft flex items-center justify-center gap-1.5 transition-colors"
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
                    return (
                      <div key={ord.id} className="p-4 rounded-xl border border-brand-secondary bg-brand-bg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-brand-dark">{ord.code}</span>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                : 'bg-amber-100 text-amber-950 border-amber-300'
                            }`}
                          >
                            {isPaid ? '✓ Cobrado' : `Pendiente (${ord.status})`}
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
                          {!isPaid && (
                            <button
                              onClick={() => {
                                setSelectedHistoryTable(null);
                                navigate('/pedidos');
                              }}
                              className="py-1 px-3 rounded-lg bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors flex items-center gap-1 shadow-xs"
                            >
                              Ir a cobrar <ArrowRight className="w-3.5 h-3.5 text-brand-yellow" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}
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
                  placeholder="Ej. Mesa 13"
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
                  <label className="block font-bold text-brand-dark mb-1">Sector</label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                  >
                    {tableSectors.map((sec) => (
                      <option key={sec.id} value={sec.id}>{sec.label}</option>
                    ))}
                  </select>
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
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold hover:bg-brand-dark transition-colors"
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
    </div>
  );
};
