import React, { useState } from 'react';
import { Plus, QrCode, Users, ExternalLink, X, SquareCheckBig } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Table, TableSector, TableStatus } from '../types';
import { ModuleOnboardingBanner } from '../components/common/ModuleOnboardingBanner';

export const TablesPage: React.FC = () => {
  const { tables, addTable, updateTableStatus } = useApp();

  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQrTable, setSelectedQrTable] = useState<Table | null>(null);

  const [formData, setFormData] = useState({
    number: 'Mesa 13',
    capacity: 4,
    sector: 'terraza' as TableSector,
    status: 'disponible' as TableStatus,
  });

  const sectors: { id: TableSector | 'all'; label: string }[] = [
    { id: 'all', label: 'Todos los sectores' },
    { id: 'salon', label: 'Salón' },
    { id: 'patio', label: 'Patio' },
    { id: 'terraza', label: 'Terraza' },
    { id: 'vereda', label: 'Vereda' },
  ];

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

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-all duration-200 shadow-soft flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-brand-yellow" />
          Agregar mesa
        </button>
      </div>

      {/* Sector Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto bg-brand-card p-3 rounded-2xl border border-brand-secondary shadow-soft">
        {sectors.map((sec) => (
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-dark">{t.number}</span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                    t.status
                  )}`}
                >
                  {t.status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-brand-brown/80">
                <span className="capitalize bg-brand-cream px-2 py-0.5 rounded border border-brand-secondary/60">
                  {t.sector}
                </span>
                <span className="flex items-center gap-1 font-bold">
                  <Users className="w-3.5 h-3.5" /> {t.capacity} personas
                </span>
              </div>
            </div>

            {/* Actions & QR Trigger */}
            <div className="pt-3 border-t border-brand-secondary/60 space-y-2">
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => updateTableStatus(t.id, 'disponible')}
                  className={`py-1 rounded text-[10px] font-bold ${
                    t.status === 'disponible'
                      ? 'bg-brand-green text-emerald-950 font-extrabold'
                      : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/30'
                  }`}
                >
                  Libre
                </button>
                <button
                  onClick={() => updateTableStatus(t.id, 'ocupada')}
                  className={`py-1 rounded text-[10px] font-bold ${
                    t.status === 'ocupada'
                      ? 'bg-brand-brown text-brand-card font-extrabold'
                      : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/30'
                  }`}
                >
                  Ocupada
                </button>
                <button
                  onClick={() => updateTableStatus(t.id, 'reservada')}
                  className={`py-1 rounded text-[10px] font-bold ${
                    t.status === 'reservada'
                      ? 'bg-brand-yellow text-brand-dark font-extrabold'
                      : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/30'
                  }`}
                >
                  Reserva
                </button>
              </div>

              <button
                onClick={() => setSelectedQrTable(t)}
                className="w-full py-1.5 rounded-xl bg-brand-bg hover:bg-brand-secondary/40 text-brand-dark border border-brand-secondary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-brand-brown" /> Ver Código QR
              </button>
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

            {/* Mock QR graphic */}
            <div className="bg-brand-cream p-6 rounded-2xl border border-brand-secondary flex flex-col items-center justify-center space-y-2">
              <div className="w-44 h-44 bg-white p-3 rounded-xl shadow-soft flex items-center justify-center border-2 border-brand-dark">
                {/* SVG QR Code Illustration */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect x="0" y="0" width="100" height="100" fill="#FFFFFF" />
                  <rect x="10" y="10" width="25" height="25" fill="#4A352C" />
                  <rect x="15" y="15" width="15" height="15" fill="#FFFFFF" />
                  <rect x="18" y="18" width="9" height="9" fill="#4A352C" />

                  <rect x="65" y="10" width="25" height="25" fill="#4A352C" />
                  <rect x="70" y="15" width="15" height="15" fill="#FFFFFF" />
                  <rect x="73" y="18" width="9" height="9" fill="#4A352C" />

                  <rect x="10" y="65" width="25" height="25" fill="#4A352C" />
                  <rect x="15" y="70" width="15" height="15" fill="#FFFFFF" />
                  <rect x="18" y="73" width="9" height="9" fill="#4A352C" />

                  <rect x="45" y="45" width="10" height="10" fill="#4A352C" />
                  <rect x="60" y="60" width="15" height="15" fill="#4A352C" />
                  <rect x="40" y="70" width="15" height="15" fill="#765747" />
                </svg>
              </div>
              <p className="text-xs font-bold text-brand-dark">{selectedQrTable.number}</p>
              <p className="text-[10px] text-brand-brown/80 capitalize">
                Sector: {selectedQrTable.sector} • {selectedQrTable.capacity} personas
              </p>
            </div>

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
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value as TableSector })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                  >
                    <option value="salon">Salón</option>
                    <option value="patio">Patio</option>
                    <option value="terraza">Terraza</option>
                    <option value="vereda">Vereda</option>
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
