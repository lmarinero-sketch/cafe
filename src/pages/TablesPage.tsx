import React, { useState } from 'react';
import { Plus, QrCode, Users, ExternalLink, X, SquareCheckBig, UtensilsCrossed } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Table, TableStatus } from '../types';
import { ModuleOnboardingBanner } from '../components/common/ModuleOnboardingBanner';

export const TablesPage: React.FC = () => {
  const { tables, tableSectors, addTable, updateTableStatus } = useApp();

  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQrTable, setSelectedQrTable] = useState<Table | null>(null);

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

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'disponible':
        return 'bg-brand-green/40 text-emerald-900 border-brand-green';
      case 'reservada':
        return 'bg-brand-yellow text-brand-dark border-brand-yellow';
      case 'ocupada':
        return 'bg-brand-secondary text-brand-dark border-brand-brown/40';
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
        {filteredTables.map((t) => (
          <div
            key={t.id}
            className={`bg-brand-card rounded-2xl border p-5 shadow-soft flex flex-col justify-between space-y-4 hover:border-brand-brown/40 transition-all ${
              t.status === 'disponible'
                ? 'border-brand-green/60'
                : t.status === 'reservada'
                ? 'border-brand-yellow/80'
                : 'border-brand-brown/40'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-brand-dark font-serif">{t.number}</span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                    t.status
                  )}`}
                >
                  {t.status}
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
        ))}
      </div>

      {/* Modal QR Previewer */}
      {selectedQrTable && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 max-w-sm w-full text-center space-y-4 shadow-soft-lg">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <h3 className="text-base font-bold text-brand-dark">Código QR {selectedQrTable.number}</h3>
              <button
                onClick={() => setSelectedQrTable(null)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Real QR graphic */}
            <div className="bg-brand-cream p-6 rounded-2xl border border-brand-secondary flex flex-col items-center justify-center space-y-2">
              <div className="w-44 h-44 bg-white p-3 rounded-xl shadow-soft flex items-center justify-center border-2 border-brand-dark overflow-hidden">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/menu?table=' + selectedQrTable.id)}`}
                  alt={`QR Mesa ${selectedQrTable.number}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs font-bold text-brand-dark">{selectedQrTable.number}</p>
              <p className="text-[10px] text-brand-brown/80 capitalize">
                Sector: {selectedQrTable.sector} • {selectedQrTable.capacity} personas
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(window.location.origin + '/menu?table=' + selectedQrTable.id)}`;
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>QR ${selectedQrTable.number}</title>
                          <style>
                            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
                            img { max-width: 300px; margin-bottom: 20px; }
                            h1 { color: #2F5233; margin: 0 0 10px 0; font-size: 24px; }
                            p { color: #555; font-size: 14px; margin: 0; }
                            @media print {
                              @page { margin: 0; size: auto; }
                              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                            }
                          </style>
                        </head>
                        <body>
                          <h1>Hilos de Amor</h1>
                          <img src="${qrUrl}" onload="window.print();window.close()" />
                          <h2>${selectedQrTable.number}</h2>
                          <p>Sector: ${selectedQrTable.sector}</p>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-brand-dark border border-brand-secondary font-bold text-xs hover:bg-brand-secondary/30 transition-colors shadow-soft flex items-center justify-center gap-2"
              >
                Imprimir QR
              </button>
              
              <button
                onClick={() => {
                  window.open(`/menu?table=${selectedQrTable.id}`, '_blank');
                  setSelectedQrTable(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors shadow-soft flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4 text-brand-yellow" />
                Abrir menú asociado a esta mesa
              </button>
            </div>
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
