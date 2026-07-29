import React, { useState } from 'react';
import { MessageSquare, Send, Plus, Clock, CheckCheck, Play, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WhatsAppPage: React.FC = () => {
  const { campaigns, createCampaign, simulateCampaignSend } = useApp();

  const [campaignName, setCampaignName] = useState('Promoción Especial Finde');
  const [templateName, setTemplateName] = useState('Promoción semanal');
  const [segment, setSegment] = useState('Clientes con > 400 puntos');
  const [message, setMessage] = useState(
    'Hola {{nombre}}. Tenés {{puntos}} puntos disponibles. Esta semana podés canjearlos por un café y una medialuna. Te esperamos.'
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createCampaign({
      name: campaignName,
      templateName,
      scheduledAt: new Date().toISOString(),
      recipientsCount: 48,
      segment,
      message,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'leido':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'entregado':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'enviado':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Banner */}
      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-brand-green/30 px-2 py-0.5 rounded">
              Plan Fidelización
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-brand-dark">Simulador de WhatsApp & Campañas</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Plataforma preparada para integración oficial con API de WhatsApp (BuilderBot / Meta API)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Creation Form */}
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-brown">
            Programar Campaña de WhatsApp
          </h3>

          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-brand-dark mb-1">Nombre de campaña</label>
              <input
                type="text"
                required
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-dark mb-1">Plantilla de WhatsApp</label>
              <select
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
              >
                <option value="Bienvenida">Bienvenida a Nuevos Socios</option>
                <option value="Cumpleaños">Felicitación de Cumpleaños</option>
                <option value="Cliente inactivo">Recuperación Cliente Inactivo</option>
                <option value="Nuevos puntos">Aviso de Saldo de Puntos</option>
                <option value="Recompensa disponible">Recompensa Lista para Canje</option>
                <option value="Promoción semanal">Promoción Semanal</option>
                <option value="Combo especial">Combo Especial Almuerzo</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-brand-dark mb-1">Segmento destinatario</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
              >
                <option value="Clientes con > 400 puntos">Clientes con &gt; 400 puntos</option>
                <option value="Nuevos registrados (últimos 7 días)">Nuevos registrados (7 días)</option>
                <option value="Cumpleañeros de Julio">Cumpleañeros del Mes</option>
                <option value="Sin compras > 30 días">Sin compras &gt; 30 días</option>
                <option value="Todos los clientes activos">Todos los clientes activos</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-brand-dark mb-1">Mensaje de plantilla</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold hover:bg-brand-dark transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-brand-yellow" /> Programar envío
            </button>
          </form>
        </div>

        {/* Campaign Execution List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-brown">
            Campañas Programadas y Enviadas ({campaigns.length})
          </h3>

          <div className="space-y-3">
            {campaigns.map((cmp) => (
              <div
                key={cmp.id}
                className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-brand-dark">{cmp.name}</h4>
                    <p className="text-[11px] text-brand-brown/80">Segmento: {cmp.segment}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(cmp.status)}`}>
                    {cmp.status}
                  </span>
                </div>

                <div className="p-3 bg-brand-cream rounded-xl border border-brand-secondary text-xs text-brand-dark leading-relaxed font-mono">
                  "{cmp.message}"
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-brand-secondary/60">
                  <span className="text-[11px] font-bold text-brand-brown">
                    Destinatarios: {cmp.recipientsCount} personas
                  </span>

                  {cmp.status !== 'leido' && (
                    <button
                      onClick={() => simulateCampaignSend(cmp.id)}
                      className="py-1.5 px-3 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Simular Envío
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
