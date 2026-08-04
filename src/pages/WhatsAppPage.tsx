import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Plus,
  Clock,
  CheckCheck,
  Play,
  Sparkles,
  Search,
  Phone,
  Paperclip,
  Smile,
  Mic,
  MoreVertical,
  Check,
  Gift,
  Award,
  UserCheck,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { formatCurrency } from '../utils/currency';
import { ModuleOnboardingBanner } from '../components/common/ModuleOnboardingBanner';

interface WhatsAppChatMessage {
  id: string;
  sender: 'customer' | 'business';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export const WhatsAppPage: React.FC = () => {
  const { campaigns, createCampaign, simulateCampaignSend, deleteCampaignData, isLoadingCampaigns, customers, addCustomerPoints } = useApp();

  const [confirmDeleteCampaignId, setConfirmDeleteCampaignId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'crm' | 'campaigns'>('crm');

  // Selected customer for 1-on-1 WhatsApp Chat
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || 'cli-1');
  const [chatSearch, setChatSearch] = useState('');

  // Local Chat Messages per customer
  const [chatMessages, setChatMessages] = useState<Record<string, WhatsAppChatMessage[]>>({
    'cli-1': [
      {
        id: 'm1',
        sender: 'customer',
        text: '¡Hola Café Magnolia! Buenas tardes. Quería consultar si tienen disponible una mesa en el sector Terraza para hoy a las 19:30 hs. Somos 4 personas. ☕',
        timestamp: '10:42 hs',
      },
      {
        id: 'm2',
        sender: 'business',
        text: '¡Hola Sofía! ¡Sí, por supuesto! Te dejamos reservada la Mesa 08 en la Terraza a tu nombre. ¡Los esperamos!',
        timestamp: '10:45 hs',
        status: 'read',
      },
    ],
    'cli-2': [
      {
        id: 'm3',
        sender: 'customer',
        text: 'Muchas gracias por los 150 puntos de bienvenida! ¿Cuándo vence la promo?',
        timestamp: '09:15 hs',
      },
      {
        id: 'm4',
        sender: 'business',
        text: '¡Hola Martín! Los puntos no vencen y podés canjearlos cuando gustes en cualquiera de nuestras 3 sucursales de San Juan.',
        timestamp: '09:18 hs',
        status: 'read',
      },
    ],
    'cli-3': [
      {
        id: 'm5',
        sender: 'customer',
        text: 'Hola! Quiero hacer un pedido para delivery de 2 Capuchinos y 1 Cheesecake por favor.',
        timestamp: 'Ayer',
      },
    ],
  });

  const [inputMessage, setInputMessage] = useState('');

  // Campaign Form State
  const [campaignName, setCampaignName] = useState('Promoción Especial Finde');
  const [templateName, setTemplateName] = useState('Promoción semanal');
  const [segment, setSegment] = useState('Clientes con > 400 puntos');
  const [campaignMsg, setCampaignMsg] = useState(
    'Hola {{nombre}}. Tenés {{puntos}} puntos disponibles. Esta semana podés canjearlos por un café y una medialuna. Te esperamos.'
  );

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];
  const activeMessages = chatMessages[selectedCustomer?.id || 'cli-1'] || [
    {
      id: 'm-default',
      sender: 'customer',
      text: `Hola Café Magnolia, soy ${selectedCustomer?.firstName}. Quisiera consultar por la carta del día.`,
      timestamp: '11:00 hs',
    },
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || !selectedCustomer) return;

    const newMsg: WhatsAppChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'business',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
    };

    setChatMessages((prev) => ({
      ...prev,
      [selectedCustomer.id]: [...(prev[selectedCustomer.id] || []), newMsg],
    }));

    setInputMessage('');
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    createCampaign({
      name: campaignName,
      templateName,
      scheduledAt: new Date().toISOString(),
      recipientsCount: 48,
      segment,
      message: campaignMsg,
    });
  };

  const filteredChatCustomers = customers.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    return fullName.includes(chatSearch.toLowerCase()) || c.phone.includes(chatSearch);
  });

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
      {/* Module Onboarding Banner */}
      <ModuleOnboardingBanner
        title="WhatsApp CRM & Campañas"
        subtitle="Chat 1 a 1 en tiempo real con clientes estilo WhatsApp Web y simulador de mensajes masivos"
        requiredPlan="fidelizacion"
        steps={[
          'Chateá en directo con tus clientes en la pestaña "Chat WhatsApp 1 a 1 (CRM)".',
          'Enviá atenciones, cupones de descuento y confirmaciones de mesa en 1 solo clic.',
          'Diseñá y enviá campañas masivas por segmentos en la pestaña "Campañas Masivas".',
        ]}
      />

      {/* Header Banner & Tab Switcher */}
      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-brand-green/30 px-2 py-0.5 rounded">
              Plan Fidelización
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-brand-dark">WhatsApp CRM & Campañas</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Gestión integral de atención al cliente y mensajería omnicanal
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex items-center gap-1.5 bg-brand-bg p-1 rounded-xl border border-brand-secondary w-full md:w-auto">
          <button
            onClick={() => setActiveTab('crm')}
            className={`flex-1 md:flex-initial py-2 px-4 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'crm'
                ? 'bg-brand-brown text-brand-card shadow-soft'
                : 'text-brand-dark/80 hover:bg-brand-secondary/40'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Chat WhatsApp 1 a 1 (CRM)
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex-1 md:flex-initial py-2 px-4 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'campaigns'
                ? 'bg-brand-brown text-brand-card shadow-soft'
                : 'text-brand-dark/80 hover:bg-brand-secondary/40'
            }`}
          >
            <Send className="w-4 h-4 text-brand-yellow" />
            Campañas Masivas
          </button>
        </div>
      </div>

      {/* TAB 1: WHATSAPP WEB CRM INTERFACE */}
      {activeTab === 'crm' && (
        <div className="bg-[#FFFDF8] rounded-2xl border-2 border-brand-secondary shadow-soft-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
          {/* Left Column: Customer Conversations List (3.5 cols) */}
          <div className="md:col-span-4 lg:col-span-4 border-r border-[#D6E2D4] bg-[#EEF4EC] flex flex-col justify-between">
            {/* Header & Search */}
            <div className="p-3 border-b border-[#D6E2D4] space-y-3 bg-[#EEF4EC]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    💬
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-brand-dark">Chats WhatsApp</h3>
                    <p className="text-[10px] text-brand-brown font-medium">Atención directa a socios</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300">
                  En línea
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-brand-brown/60" />
                <input
                  type="text"
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  placeholder="Buscar o iniciar chat..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#D6E2D4] bg-[#FFFFFF] text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700/40"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#D6E2D4]/60">
              {filteredChatCustomers.map((c) => {
                const isSelected = c.id === selectedCustomerId;
                const msgs = chatMessages[c.id] || [];
                const lastMsg = msgs[msgs.length - 1]?.text || 'Conversación iniciada...';
                const lastTime = msgs[msgs.length - 1]?.timestamp || 'Hoy';

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomerId(c.id)}
                    className={`p-3 cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-[#FFFDF8] border-l-4 border-l-emerald-700 shadow-xs'
                        : 'hover:bg-[#FFFDF8]/70'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-brown text-brand-card font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                      {c.firstName.charAt(0)}{c.lastName.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-brand-dark truncate">
                          {c.firstName} {c.lastName}
                        </h4>
                        <span className="text-[10px] text-brand-brown/70 shrink-0 font-mono">{lastTime}</span>
                      </div>

                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-[11px] text-brand-brown/80 truncate leading-snug font-serif">
                          {lastMsg}
                        </p>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 border border-purple-200 shrink-0 ml-1">
                          {c.level}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Chat Window (8 cols) */}
          <div className="md:col-span-8 lg:col-span-8 flex flex-col justify-between bg-[#E5DDD5]/40 relative">
            {/* Chat Top Header Bar */}
            <div className="p-3 bg-[#FFFDF8] border-b border-[#EADBC8] flex items-center justify-between shadow-xs z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-brown text-brand-card font-bold flex items-center justify-center text-sm shadow-xs">
                  {selectedCustomer.firstName.charAt(0)}{selectedCustomer.lastName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-brand-dark">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </h3>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                      Nivel {selectedCustomer.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    {selectedCustomer.phone} • En línea por WhatsApp
                  </p>
                </div>
              </div>

              {/* Quick Customer Info & Actions */}
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline-block text-[11px] font-extrabold text-brand-brown bg-brand-yellow/30 px-2.5 py-1 rounded-lg border border-brand-yellow/80">
                  ⭐ {selectedCustomer.points} pts acumulados
                </span>
                <button
                  onClick={() => {
                    addCustomerPoints(selectedCustomer.id, 200);
                    handleSendMessage(`🎁 ¡Te acreditamos 200 puntos de regalo en tu cuenta! Saldo actual: ${selectedCustomer.points + 200} pts.`);
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-emerald-800 text-white font-extrabold text-xs hover:bg-emerald-900 transition-colors shadow-xs flex items-center gap-1"
                >
                  <Award className="w-3.5 h-3.5 text-brand-yellow" /> +200 Pts
                </button>
              </div>
            </div>

            {/* Chat Body: Messages Area with WhatsApp Chat Pattern */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F0EBE3] min-h-[380px]">
              {/* Date Header Badge */}
              <div className="text-center my-2">
                <span className="text-[10px] font-extrabold bg-[#FFFDF8] text-[#765747] px-3 py-1 rounded-full shadow-xs border border-[#EADBC8]">
                  HOY — ATENCIÓN DIRECTA WHATSAPP
                </span>
              </div>

              {/* Customer Stats Info Card */}
              <div className="bg-[#FFFDF8]/90 border border-[#EADBC8] p-3 rounded-xl max-w-sm mx-auto text-center space-y-1 shadow-xs">
                <p className="text-xs font-bold text-brand-dark">
                  👤 Socio registrado: {selectedCustomer.firstName} {selectedCustomer.lastName}
                </p>
                <p className="text-[11px] text-brand-brown">
                  Facturación acumulada: <span className="font-bold text-brand-dark">{formatCurrency(selectedCustomer.totalSpent)}</span> ({selectedCustomer.purchaseCount} compras)
                </p>
              </div>

              {/* Messages Bubbles */}
              {activeMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'business' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md p-3 rounded-2xl shadow-xs text-xs space-y-1 relative ${
                      m.sender === 'business'
                        ? 'bg-[#D9FDD3] text-brand-dark rounded-tr-none border border-emerald-200'
                        : 'bg-[#FFFDF8] text-brand-dark rounded-tl-none border border-[#EADBC8]'
                    }`}
                  >
                    <p className="leading-relaxed font-medium">{m.text}</p>
                    <div className="flex items-center justify-end gap-1 text-[9px] text-brand-brown/70 font-mono pt-0.5">
                      <span>{m.timestamp}</span>
                      {m.sender === 'business' && (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-600 inline shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Response Chips Footer Bar */}
            <div className="bg-[#FAF5EE] px-3 py-2 border-t border-[#EADBC8] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-extrabold text-brand-brown shrink-0">Plantillas Rápidas:</span>
              <button
                onClick={() => handleSendMessage('☕ ¡Hola! Confirmado, te reservamos la Mesa 08 en la Terraza para hoy. ¡Te esperamos!')}
                className="px-2.5 py-1 rounded-lg bg-[#FFFDF8] text-brand-dark border border-[#EADBC8] text-[10px] font-bold hover:bg-brand-yellow/30 whitespace-nowrap shadow-xs"
              >
                ☕ Confirmar Mesa 08
              </button>
              <button
                onClick={() => handleSendMessage('🎁 ¡Hola! Por ser cliente preferencial te regalamos un Voucher del 20% OFF en tu próxima visita.')}
                className="px-2.5 py-1 rounded-lg bg-[#FFFDF8] text-brand-dark border border-[#EADBC8] text-[10px] font-bold hover:bg-brand-yellow/30 whitespace-nowrap shadow-xs"
              >
                🎁 Enviar 20% OFF
              </button>
              <button
                onClick={() => handleSendMessage('🎂 ¡Feliz Cumpleaños! Pasá por cualquiera de nuestras sucursales en San Juan y reclamá tu torta gratis.')}
                className="px-2.5 py-1 rounded-lg bg-[#FFFDF8] text-brand-dark border border-[#EADBC8] text-[10px] font-bold hover:bg-brand-yellow/30 whitespace-nowrap shadow-xs"
              >
                🎂 Regalo Cumpleaños
              </button>
            </div>

            {/* Message Input Controls */}
            <div className="p-3 bg-[#FFFDF8] border-t border-[#EADBC8] flex items-center gap-2">
              <button className="p-2 text-brand-brown/70 hover:text-brand-dark transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <button className="p-2 text-brand-brown/70 hover:text-brand-dark transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Escribí un mensaje..."
                className="flex-1 px-4 py-2 rounded-xl border border-[#EADBC8] bg-[#FAF5EE] text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
              />

              <button
                onClick={() => handleSendMessage()}
                className="p-2.5 rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-soft"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CAMPAIGN SIMULATION & TEMPLATES */}
      {activeTab === 'campaigns' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaign Creation Form */}
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-brown">
              Programar Campaña Masiva de WhatsApp
            </h3>

            <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
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
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none font-bold"
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
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none font-bold"
                >
                  <option value="Clientes con > 400 puntos">Clientes con &gt; 400 puntos</option>
                  <option value="Nivel VIP">Nivel VIP</option>
                  <option value="Sin compras > 30 días">Sin compras &gt; 30 días</option>
                  <option value="Cumpleañeros de Julio">Cumpleañeros de Julio</option>
                  <option value="Todos los socios">Todos los socios registrados</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Mensaje de plantilla</label>
                <textarea
                  rows={4}
                  value={campaignMsg}
                  onChange={(e) => setCampaignMsg(e.target.value)}
                  className="w-full p-3 rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold hover:bg-brand-dark transition-colors flex items-center justify-center gap-2 shadow-soft"
              >
                <Plus className="w-4 h-4 text-brand-yellow" /> Programar envío
              </button>
            </form>
          </div>

          {/* Campaigns List & Live Simulation */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-brown">
              Campañas Programadas y Enviadas ({campaigns.length})
            </h3>

            <div className="space-y-3">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-brand-dark">{camp.name}</h4>
                      <p className="text-[11px] text-brand-brown/80">Segmento: {camp.segment}</p>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusBadge(camp.status)}`}>
                      {camp.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-brand-bg p-3 rounded-xl border border-brand-secondary/60 text-xs font-serif italic text-brand-dark">
                    "{camp.message}"
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-brand-brown font-semibold">
                      Destinatarios: {camp.recipientsCount} personas
                    </span>
                    <div className="flex items-center gap-1.5">
                      {camp.status !== 'leido' && (
                        <button
                          onClick={() => simulateCampaignSend(camp.id)}
                          className="py-1.5 px-3 rounded-xl bg-emerald-800 text-white font-bold hover:bg-emerald-900 transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" /> Simular Envío
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmDeleteCampaignId(camp.id)}
                        className="py-1.5 px-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold hover:bg-red-100 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete Campaign */}
      {confirmDeleteCampaignId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 max-w-sm w-full shadow-soft-lg space-y-4">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <h3 className="text-base font-bold text-brand-dark">¿Eliminar campaña?</h3>
            </div>
            <p className="text-xs text-brand-brown">
              Esta acción eliminará la campaña permanentemente de la base de datos.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  await deleteCampaignData(confirmDeleteCampaignId);
                  setConfirmDeleteCampaignId(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors text-xs"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setConfirmDeleteCampaignId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-brand-secondary font-bold text-brand-dark hover:bg-brand-secondary/30 text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
