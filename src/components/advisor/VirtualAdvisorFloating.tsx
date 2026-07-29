import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Send,
  BookOpen,
  Headphones,
  Search,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  FileText,
  PhoneCall,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Manual, SupportTicket } from '../../types';

export const VirtualAdvisorFloating: React.FC = () => {
  const { manuals, createSupportTicket, tickets } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'consultar' | 'manuales' | 'soporte'>('consultar');

  // Consultar Chat state
  const [chatMessages, setChatMessages] = useState<
    { sender: 'bot' | 'user'; text: string; time: string }[]
  >([
    {
      sender: 'bot',
      text: '¡Hola! Soy el Asesor Virtual de Hilos de Amor. ¿En qué puedo ayudarte hoy? Podés seleccionar una de las preguntas frecuentes abajo o escribir tu duda.',
      time: 'Ahora',
    },
  ]);
  const [queryInput, setQueryInput] = useState('');

  // Manuals state
  const [manualSearch, setManualSearch] = useState('');
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);

  // Support Ticket Form state
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    phone: '',
    reason: 'Consulta general',
    description: '',
    priority: 'media' as SupportTicket['priority'],
  });
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  // FAQ preset list
  const presetQuestions = [
    '¿Cómo creo un producto?',
    '¿Cómo creo una mesa?',
    '¿Cómo modifico el menú?',
    '¿Cómo actualizo un ingrediente?',
    '¿Cómo se calcula el precio sugerido?',
    '¿Cómo funcionan los puntos?',
    '¿Cómo creo una promoción?',
    '¿Cómo programo un mensaje?',
    '¿Cómo contacto a soporte?',
  ];

  const handleSendQuery = (textToSend?: string) => {
    const text = textToSend || queryInput;
    if (!text.trim()) return;

    // Add user message
    const userMsg = { sender: 'user' as const, text, time: 'Ahora' };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setQueryInput('');

    // Search answer in manuals base
    setTimeout(() => {
      const q = text.toLowerCase();
      let foundAnswer = '';

      if (q.includes('producto') || q.includes('creo un producto')) {
        foundAnswer = 'Para crear un producto: Ingresá a la sección "Productos" en el menú lateral, hacé clic en "Nuevo producto", completá el nombre, categoría, precio, imagen y seleccioná si estará disponible para Salón, Retiro o Delivery.';
      } else if (q.includes('mesa')) {
        foundAnswer = 'Para crear una mesa: Accedé a "Mesas", hacé clic en "Agregar mesa", seleccioná el número, capacidad y sector (Salón, Patio, Terraza o Vereda). Desde allí podés generar su código QR ficticio.';
      } else if (q.includes('menú') || q.includes('menu') || q.includes('carta')) {
        foundAnswer = 'Para modificar el menú digital: Todos los cambios que realices en el módulo "Productos" (precios, descripciones, disponibilidad) se reflejan inmediatamente en la carta pública en tiempo real.';
      } else if (q.includes('ingrediente')) {
        foundAnswer = 'Para actualizar un ingrediente (Plan Gestión): Abrí "Ingredientes", editá el precio de compra o porcentaje de merma. Si tenés activa la actualización automática, se recalcularán los precios de venta de todos los productos afectados.';
      } else if (q.includes('sugerido') || q.includes('precio sugerido') || q.includes('costo')) {
        foundAnswer = 'El precio sugerido se calcula con la fórmula: Precio Sugerido = Costo Total / (1 - Margen Objetivo). Ejemplo: Costo de $2.000 con margen objetivo del 60% genera un precio sugerido de $5.000.';
      } else if (q.includes('puntos')) {
        foundAnswer = 'Los puntos se acumulan automáticamente por cada compra de un cliente registrado. Por defecto, cada $100 gastados otorgan 5 puntos. Luego el cliente puede canjearlos por premios en la sección "Puntos y Recompensas".';
      } else if (q.includes('promoción') || q.includes('promocion')) {
        foundAnswer = 'Para crear una promoción: Podés armar productos especiales en "Productos" (Categoría Promociones) o configurar recompensas en "Puntos y Recompensas".';
      } else if (q.includes('mensaje') || q.includes('whatsapp')) {
        foundAnswer = 'Para programar un mensaje por WhatsApp (Plan Fidelización): Ingresá al módulo "WhatsApp", seleccioná una plantilla (Bienvenida, Cumpleaños, etc.), elegí el segmento de clientes destinatarios y programá la fecha de envío.';
      } else if (q.includes('soporte')) {
        foundAnswer = 'Podés contactar a soporte desde la tercera pestaña "Soporte" de este Asesor Virtual o simulando un envío directo por WhatsApp.';
      } else {
        // Try searching in manuals steps
        const matchingManual = manuals.find((m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.steps.some((s) => s.toLowerCase().includes(q))
        );

        if (matchingManual) {
          foundAnswer = `De acuerdo al manual "${matchingManual.title}": ${matchingManual.steps[0]}`;
        } else {
          foundAnswer = 'No encontré una respuesta específica en los manuales. Si querés, podés enviar esta consulta al equipo de soporte.';
        }
      }

      setChatMessages((prev) => [...prev, { sender: 'bot', text: foundAnswer, time: 'Ahora' }]);
    }, 600);
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.name || !ticketForm.email || !ticketForm.description) return;

    const ticketId = createSupportTicket({
      name: ticketForm.name,
      email: ticketForm.email,
      phone: ticketForm.phone,
      reason: ticketForm.reason,
      description: ticketForm.description,
      priority: ticketForm.priority,
    });

    setSubmittedTicketId(ticketId);
    setTicketForm({
      name: '',
      email: '',
      phone: '',
      reason: 'Consulta general',
      description: '',
      priority: 'media',
    });
  };

  const filteredManuals = manuals.filter(
    (m) =>
      m.title.toLowerCase().includes(manualSearch.toLowerCase()) ||
      m.category.toLowerCase().includes(manualSearch.toLowerCase()) ||
      m.description.toLowerCase().includes(manualSearch.toLowerCase())
  );

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 left-5 z-[9990] py-3 px-5 rounded-full bg-brand-brown text-brand-card font-bold text-sm shadow-soft-lg hover:bg-brand-dark hover:scale-105 transition-all duration-200 flex items-center gap-2.5 border-2 border-brand-yellow/60"
      >
        <Sparkles className="w-5 h-5 text-brand-yellow animate-pulse" />
        <span>Asesor virtual</span>
      </button>

      {/* Slide-over Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex justify-end bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-brand-card h-full shadow-soft-lg flex flex-col justify-between border-l border-brand-secondary">
            {/* Top Bar */}
            <div className="p-4 border-b border-brand-secondary bg-brand-cream flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-brown text-brand-card flex items-center justify-center font-bold">
                  🤖
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark leading-tight">Asesor Virtual</h3>
                  <p className="text-xs text-brand-brown/80 font-medium">Asistencia 24/7 de Hilos de Amor</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-brand-dark/60 hover:text-brand-dark hover:bg-brand-secondary/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation Bar */}
            <div className="flex items-center border-b border-brand-secondary bg-brand-bg px-4 py-2 gap-2">
              <button
                onClick={() => setActiveTab('consultar')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'consultar'
                    ? 'bg-brand-brown text-brand-card shadow-soft'
                    : 'text-brand-dark/70 hover:bg-brand-secondary/40'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Consultar
              </button>
              <button
                onClick={() => setActiveTab('manuales')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'manuales'
                    ? 'bg-brand-brown text-brand-card shadow-soft'
                    : 'text-brand-dark/70 hover:bg-brand-secondary/40'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Manuales
              </button>
              <button
                onClick={() => setActiveTab('soporte')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'soporte'
                    ? 'bg-brand-brown text-brand-card shadow-soft'
                    : 'text-brand-dark/70 hover:bg-brand-secondary/40'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                Soporte
              </button>
            </div>

            {/* Tab Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* TAB 1: CONSULTAR */}
              {activeTab === 'consultar' && (
                <div className="flex flex-col h-full justify-between space-y-4">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[380px]">
                    {chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-brand-brown text-brand-card rounded-br-none shadow-soft'
                              : 'bg-brand-bg text-brand-dark border border-brand-secondary rounded-bl-none'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <span className="block text-[9px] opacity-60 text-right mt-1">{msg.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Preset Questions Pills */}
                  <div className="space-y-2 pt-2 border-t border-brand-secondary/60">
                    <p className="text-[11px] font-semibold text-brand-brown/80">Preguntas sugeridas:</p>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                      {presetQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendQuery(q)}
                          className="text-[11px] bg-brand-cream hover:bg-brand-secondary text-brand-dark px-2.5 py-1 rounded-full border border-brand-secondary/80 transition-colors text-left"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Box */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
                      placeholder="Escribí tu consulta aquí..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-brand-secondary bg-brand-bg text-xs focus:outline-none focus:ring-2 focus:ring-brand-brown/40"
                    />
                    <button
                      onClick={() => handleSendQuery()}
                      className="p-2.5 rounded-xl bg-brand-brown text-brand-card hover:bg-brand-dark transition-colors shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: MANUALES */}
              {activeTab === 'manuales' && (
                <div className="space-y-4">
                  {selectedManual ? (
                    <div className="space-y-4 animate-fade-in">
                      <button
                        onClick={() => setSelectedManual(null)}
                        className="text-xs font-bold text-brand-brown hover:underline flex items-center gap-1"
                      >
                        ← Volver a la lista de manuales
                      </button>

                      <div className="bg-brand-cream rounded-xl p-4 border border-brand-secondary">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown bg-brand-yellow/40 px-2 py-0.5 rounded">
                          {selectedManual.category}
                        </span>
                        <h3 className="text-base font-bold text-brand-dark mt-2">{selectedManual.title}</h3>
                        <p className="text-xs text-brand-brown/90 mt-1">{selectedManual.description}</p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-brown">
                          Pasos a seguir:
                        </h4>
                        {selectedManual.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-brand-bg rounded-xl border border-brand-secondary/60">
                            <span className="w-5 h-5 rounded-full bg-brand-brown text-brand-card font-bold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <p className="text-xs text-brand-dark leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>

                      {selectedManual.faqs.length > 0 && (
                        <div className="space-y-2 pt-3 border-t border-brand-secondary/60">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-brown">
                            Preguntas frecuentes del tema:
                          </h4>
                          {selectedManual.faqs.map((faq, idx) => (
                            <div key={idx} className="p-3 bg-brand-card rounded-xl border border-brand-secondary/60 text-xs">
                              <p className="font-bold text-brand-dark">Q: {faq.question}</p>
                              <p className="text-brand-brown/90 mt-1">A: {faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-brand-brown/60" />
                        <input
                          type="text"
                          value={manualSearch}
                          onChange={(e) => setManualSearch(e.target.value)}
                          placeholder="Buscar en los manuales..."
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs focus:outline-none focus:ring-2 focus:ring-brand-brown/40"
                        />
                      </div>

                      {/* Manual List Cards */}
                      <div className="space-y-2.5">
                        {filteredManuals.map((man) => (
                          <div
                            key={man.id}
                            onClick={() => setSelectedManual(man)}
                            className="p-3.5 rounded-xl bg-brand-bg border border-brand-secondary/70 hover:border-brand-brown/50 cursor-pointer transition-all duration-150 shadow-xs hover:shadow-soft"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-brand-brown uppercase">
                                {man.category}
                              </span>
                              <FileText className="w-3.5 h-3.5 text-brand-brown/70" />
                            </div>
                            <h4 className="text-xs font-bold text-brand-dark">{man.title}</h4>
                            <p className="text-[11px] text-brand-brown/80 line-clamp-2 mt-0.5">
                              {man.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SOPORTE */}
              {activeTab === 'soporte' && (
                <div className="space-y-4">
                  {submittedTicketId ? (
                    <div className="bg-brand-green/20 border border-brand-green p-4 rounded-xl text-center space-y-3 animate-fade-in">
                      <CheckCircle2 className="w-10 h-10 text-emerald-800 mx-auto" />
                      <h4 className="text-sm font-bold text-brand-dark">¡Consulta registrada con éxito!</h4>
                      <p className="text-xs text-brand-dark/80">
                        Se ha asignado el código de seguimiento:
                      </p>
                      <span className="inline-block px-3 py-1 bg-brand-card text-brand-brown font-mono font-bold text-sm rounded-lg border border-brand-secondary">
                        #{submittedTicketId}
                      </span>
                      <p className="text-[11px] text-brand-brown/80">
                        Un representante técnico responderá a tu correo a la brevedad.
                      </p>
                      <button
                        onClick={() => setSubmittedTicketId(null)}
                        className="py-2 px-4 bg-brand-brown text-brand-card text-xs font-bold rounded-xl hover:bg-brand-dark transition-colors"
                      >
                        Enviar otra consulta
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleTicketSubmit} className="space-y-3">
                      <div className="bg-brand-cream p-3 rounded-xl border border-brand-secondary/60 text-xs">
                        <p className="font-bold text-brand-dark">¿Necesitás ayuda personalizada?</p>
                        <p className="text-brand-brown/80 mt-0.5">
                          Enviá tu ticket de soporte simulado o contactá directamente por WhatsApp.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-brand-dark mb-1">Nombre completo</label>
                        <input
                          type="text"
                          required
                          value={ticketForm.name}
                          onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                          placeholder="Ej. Juan Pérez"
                          className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs focus:outline-none focus:ring-2 focus:ring-brand-brown/40"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-brand-dark mb-1">Correo electrónico</label>
                          <input
                            type="email"
                            required
                            value={ticketForm.email}
                            onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                            placeholder="juan@ejemplo.com"
                            className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs focus:outline-none focus:ring-2 focus:ring-brand-brown/40"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-brand-dark mb-1">Teléfono</label>
                          <input
                            type="tel"
                            value={ticketForm.phone}
                            onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                            placeholder="+54911..."
                            className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs focus:outline-none focus:ring-2 focus:ring-brand-brown/40"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-brand-dark mb-1">Motivo de consulta</label>
                        <select
                          value={ticketForm.reason}
                          onChange={(e) => setTicketForm({ ...ticketForm, reason: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs focus:outline-none focus:ring-2 focus:ring-brand-brown/40"
                        >
                          <option value="Consulta general">Consulta general</option>
                          <option value="Duda sobre recetas y precios">Duda sobre recetas y precios</option>
                          <option value="Problema con el menú digital">Problema con el menú digital</option>
                          <option value="Solicitud de demo personalizada">Solicitud de demo personalizada</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-brand-dark mb-1">Descripción detallada</label>
                        <textarea
                          required
                          rows={3}
                          value={ticketForm.description}
                          onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                          placeholder="Explicá tu inquietud aquí..."
                          className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs focus:outline-none focus:ring-2 focus:ring-brand-brown/40"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" /> Enviar consulta
                        </button>
                        <button
                          type="button"
                          onClick={() => window.open('https://wa.me/5491100000000', '_blank')}
                          className="py-2.5 px-4 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <PhoneCall className="w-3.5 h-3.5" /> WhatsApp
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Ticket History */}
                  {tickets.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-brand-secondary/60">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-brown">
                        Historial de tickets simulados ({tickets.length}):
                      </h4>
                      <div className="space-y-2 max-h-36 overflow-y-auto">
                        {tickets.map((tick) => (
                          <div key={tick.id} className="p-2.5 rounded-xl bg-brand-bg border border-brand-secondary text-xs flex items-center justify-between">
                            <div>
                              <span className="font-mono font-bold text-brand-brown">#{tick.id}</span>
                              <p className="text-[11px] text-brand-dark">{tick.reason}</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-yellow/30 text-brand-dark uppercase">
                              {tick.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
