import React from 'react';
import { Settings, RotateCcw, ShieldCheck, DollarSign, Store } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsPage: React.FC = () => {
  const { plan, setPlan, resetDemoData } = useApp();

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Banner */}
      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-dark">Configuración General</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Ajustes del comercio ficticio, divisa y restauración de datos de la demo
          </p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Trade Information */}
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
            <Store className="w-4 h-4 text-brand-brown" /> Datos del Comercio
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-brand-dark mb-1">Nombre Comercial</label>
              <input
                type="text"
                disabled
                value="Café Magnolia"
                className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-brand-brown font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-brand-dark mb-1">Moneda del Sistema</label>
                <input
                  type="text"
                  disabled
                  value="Peso Argentino ($ ARS)"
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-brand-brown font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-brand-dark mb-1">Teléfono Institucional</label>
                <input
                  type="text"
                  disabled
                  value="+54 9 11 4000-8800"
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-brand-brown font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Demo Reset Card */}
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2 text-rose-800">
            <RotateCcw className="w-5 h-5" />
            <h3 className="text-sm font-bold">Restauración de Demo</h3>
          </div>
          <p className="text-xs text-brand-brown/90 leading-relaxed">
            Si realizaste modificaciones durante las simulaciones y deseas volver al estado inicial completo con todos los productos, mesas, insumos y clientes originales:
          </p>

          <button
            onClick={resetDemoData}
            className="py-3 px-5 rounded-xl bg-brand-red/30 border border-brand-red text-rose-950 font-bold text-xs hover:bg-brand-red/50 transition-colors shadow-soft flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Reiniciar toda la demo ahora
          </button>
        </div>
      </div>
    </div>
  );
};
