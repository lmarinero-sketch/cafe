import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  X,
  Send,
  Sparkles,
  Download,
  RotateCcw,
  BookOpen,
  Headphones,
  Bot,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Printer,
  HelpCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { askOliver, generateAndTriggerExcel, openPdfSalesReport, ChatMessage, PdfReportInfo } from '../../services/oliverAssistantService';
import { useApp } from '../../context/AppContext';
import { Manual, SupportTicket } from '../../types';

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

export const VirtualAdvisorFloating: React.FC = () => {
  const location = useLocation();
  const { manuals, createSupportTicket } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'oliver' | 'manuales' | 'soporte'>('oliver');
  
  // Chat state
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '¡Hola! 👋 Soy **Oliver**, tu Maitre Ejecutivo y Asistente IA en **Hilos de Amor** (potenciado por Grow Labs).\n\nPuedo consultar cualquier dato en tiempo real (ventas, pedidos, combos con lógica Y/O, clientes, mesas, caja), auditar las **Ventas del Día**, generar **Reportes Oficiales en PDF** listos para imprimir con membrete institucional, exportar planillas **Excel (.xlsx)**, o responder cualquier duda gastronómica y operativa.\n\n¿En qué te puedo asesorar hoy?',
      time: 'Ahora'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  // Manuals and support state
  const [manualSearch, setManualSearch] = useState('');
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    phone: '',
    reason: 'Consulta general',
    description: '',
    priority: 'media' as SupportTicket['priority'],
  });
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && activeTab === 'oliver') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab, loading]);

  // Dynamic quick action suggestions based on active route
  const getContextualQuickActions = () => {
    const p = location.pathname;
    if (p.includes('caja')) {
      return [
        { label: '💰 Balance de caja actual', prompt: '¿Cuál es el estado y balance actual de la caja?' },
        { label: '📥 Exportar Arqueo a Excel', prompt: 'Generame un reporte Excel con todos los movimientos de caja.' },
        { label: '💸 Registrar egreso', prompt: 'Quiero registrar un egreso de caja por compra de insumos.' }
      ];
    }
    if (p.includes('order') || p.includes('delivery')) {
      return [
        { label: '📊 Ventas del Día y Pedidos', prompt: '¿Cómo puedo ver y auditar la lista de pedidos de ventas del día?' },
        { label: '📄 Reporte PDF de Ventas', prompt: 'Generame un reporte en PDF de las ventas con la estética oficial del restaurante.' },
        { label: '🧾 Órdenes recientes', prompt: '¿Cuáles fueron los últimos pedidos registrados y cuál es el monto total?' },
        { label: '📥 Exportar Ventas a Excel', prompt: 'Generame un reporte Excel con todas las ventas y pedidos.' },
        { label: '⏳ Pedidos pendientes', prompt: '¿Hay algún pedido pendiente en preparación o entrega?' }
      ];
    }
    if (p.includes('table')) {
      return [
        { label: '🪑 Mesas disponibles', prompt: '¿Cuántas mesas tenemos disponibles y cuántas están ocupadas?' },
        { label: '📱 ¿Cómo funciona el Menú QR?', prompt: '¿Cómo funciona el código QR de las mesas para clientes y para mozos?' },
        { label: '🔄 Liberar mesa', prompt: 'Quiero cambiar el estado de una mesa a disponible.' }
      ];
    }
    if (p.includes('product') || p.includes('menu')) {
      return [
        { label: '🌟 Combos y Opciones (Y/O)', prompt: '¿Qué combos y promociones tenemos activos y qué opciones permiten elegir?' },
        { label: '📋 Resumen de carta y precios', prompt: '¿Cuántos productos hay en la carta y cuáles son las categorías?' },
        { label: '📥 Exportar Menú a Excel', prompt: 'Generá un archivo Excel de todos los productos de la carta y sus precios.' },
        { label: '➕ Crear nuevo plato', prompt: 'Quiero crear un nuevo plato en la carta de Hilos de Amor.' }
      ];
    }
    if (p.includes('customer') || p.includes('reward')) {
      return [
        { label: '👥 Cartera de clientes', prompt: '¿Cuántos clientes tenemos registrados y cuál es el promedio de visitas?' },
        { label: '🏆 Top clientes por puntos', prompt: '¿Cuáles son los 5 clientes con mayor puntaje acumulado?' },
        { label: '📥 Exportar Clientes a Excel', prompt: 'Exportame la cartera de clientes y sus puntos en formato Excel.' }
      ];
    }
    if (p.includes('ingredient') || p.includes('recipe')) {
      return [
        { label: '📦 Stock de insumos', prompt: '¿Cuáles son los ingredientes con mayor costo de compra y mermas?' },
        { label: '📥 Exportar Insumos a Excel', prompt: 'Generame un archivo Excel de insumos, costos normalizados y mermas.' },
        { label: '➕ Dar de alta ingrediente', prompt: 'Quiero dar de alta un nuevo ingrediente.' }
      ];
    }
    // Default dashboard actions
    return [
      { label: '🌟 Combos y Opciones (Y/O)', prompt: '¿Qué combos y promociones tenemos activos y qué opciones permiten elegir?' },
      { label: '📊 Ventas del Día y Pedidos', prompt: '¿Cómo puedo ver y auditar la lista de ventas del día en el sistema?' },
      { label: '📄 Reporte PDF de Ventas', prompt: 'Generame un reporte en PDF de las ventas con toda la estética del proyecto.' },
      { label: '📱 Menú QR y Mozos', prompt: '¿Cómo funciona el código QR de las mesas para clientes y para mozos?' },
      { label: '📥 Exportar Ventas a Excel', prompt: 'Generame un reporte Excel con todas las ventas registradas.' }
    ];
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: DisplayMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    };

    const newDisplayMessages = [...messages, userMessage];
    setMessages(newDisplayMessages);
    if (!customText) setInput('');
    setLoading(true);

    try {
      // Map to service ChatMessage format
      const historyForService: ChatMessage[] = newDisplayMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await askOliver(historyForService, location.pathname);

      let finalContent = response.reply;
      if (response.exportTag && !finalContent.includes(response.exportTag)) {
        finalContent += `\n\n${response.exportTag}`;
      }

      const assistantMessage: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: finalContent,
        time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚠️ Ocurrió un error inesperado al conectar con el servidor. Por favor reintentá en unos momentos.',
          time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExcelDownloadClick = async (type: string, filename: string, title: string) => {
    setDownloadingType(type);
    try {
      await generateAndTriggerExcel(type, filename, title);
    } catch (err) {
      console.error('Error re-downloading Excel:', err);
    } finally {
      setDownloadingType(null);
    }
  };

  const handlePdfReportClick = async (report: { type: string; filename: string; title: string; period: string; dateLabel: string }) => {
    try {
      await openPdfSalesReport({
        type: report.type as any,
        period: report.period,
        title: report.title,
        dateLabel: report.dateLabel
      });
    } catch (err) {
      console.error('Error generating PDF report:', err);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'reset',
        role: 'assistant',
        content: '¡Conversación reiniciada! 👋 Soy **Oliver**, listo para responder consultas, consultar la base de datos o generar tus reportes en PDF y Excel.',
        time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
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

  // Render markdown text with download card parsing
  const renderMessageContent = (rawText: string) => {
    const excelTagRegex = /\[DESCARGAR_EXCEL:([^:]+):([^:]+):([^\]]+)\]/g;
    const excelMatches: { type: string; filename: string; title: string }[] = [];
    let match;

    while ((match = excelTagRegex.exec(rawText)) !== null) {
      excelMatches.push({
        type: match[1],
        filename: match[2],
        title: match[3]
      });
    }

    const pdfTagRegex = /\[DESCARGAR_PDF:([^:]+):([^:]+):([^:]+):([^:]+):([^\]]+)\]/g;
    const pdfMatches: { type: string; filename: string; title: string; period: string; dateLabel: string }[] = [];
    let pdfMatch;

    while ((pdfMatch = pdfTagRegex.exec(rawText)) !== null) {
      pdfMatches.push({
        type: pdfMatch[1],
        filename: pdfMatch[2],
        title: pdfMatch[3],
        period: pdfMatch[4],
        dateLabel: decodeURIComponent(pdfMatch[5])
      });
    }

    const cleanText = rawText
      .replace(excelTagRegex, '')
      .replace(pdfTagRegex, '')
      .trim();

    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {cleanText.split('\n').map((line, i) => {
          if (!line.trim()) return <div key={i} className="h-1.5" />;
          
          const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('• ') || line.trim().startsWith('* ');
          const lineContent = isBullet ? line.trim().substring(2) : line;

          return (
            <div key={i} className={isBullet ? 'flex items-start gap-2 ml-1 text-slate-700' : 'text-slate-800'}>
              {isBullet && <span className="text-blue-600 font-bold mt-0.5">•</span>}
              <div>
                {lineContent.split(/(\*\*.*?\*\*)/).map((part, j) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
                  }
                  return part;
                })}
              </div>
            </div>
          );
        })}

        {/* Render interactive PDF Report Cards if present */}
        {pdfMatches.map((pm, idx) => (
          <div key={`pdf-${idx}`} className="mt-3 p-3.5 bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/90 border border-blue-200/90 rounded-xl shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <FileText size={19} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                      Reporte Oficial PDF
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-medium">Formato A4 Auditado</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1">{pm.title}</div>
                  <div className="text-[11px] text-blue-700 font-semibold">{pm.dateLabel}</div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handlePdfReportClick(pm)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-lg text-xs font-bold transition-all shadow shadow-blue-600/20 cursor-pointer"
            >
              <Printer size={14} className="shrink-0" />
              <span>Ver e Imprimir / Guardar como PDF</span>
            </button>
          </div>
        ))}

        {/* Render interactive Excel Download Cards if present */}
        {excelMatches.map((em, idx) => (
          <div key={idx} className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950">{em.title}</div>
                  <div className="text-[11px] text-emerald-700">{em.filename}</div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleExcelDownloadClick(em.type, em.filename, em.title)}
              disabled={downloadingType === em.type}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-lg text-xs font-bold transition-all shadow shadow-emerald-700/20 cursor-pointer disabled:opacity-50"
            >
              <Download size={14} className="shrink-0" />
              <span>{downloadingType === em.type ? 'Generando archivo...' : 'Descargar Archivo Excel (.xlsx)'}</span>
            </button>
          </div>
        ))}
      </div>
    );
  };

  const quickActions = getContextualQuickActions();

  return (
    <>
      {/* Floating Trigger Button with Oliver 3D Avatar */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-[9990] flex items-center gap-3">
          {/* Subtle invitation chip */}
          <div 
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg border border-slate-200/80 text-xs font-semibold text-slate-700 hover:text-blue-700 cursor-pointer transition-all hover:scale-105"
          >
            <Sparkles size={14} className="text-amber-500 animate-pulse" />
            <span>Consultale a Oliver</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="relative group w-14 h-14 rounded-full bg-white p-0.5 shadow-xl border-2 border-blue-600/30 hover:border-blue-600 hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            title="Abrir Asistente Virtual Oliver"
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 relative">
              <img
                src="/oliver-avatar.jpg"
                alt="Oliver - Chef Ejecutivo y Maitre IA"
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Active Online Status Badge */}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
            
            {/* Ping effect */}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping opacity-75 pointer-events-none" />
          </button>
        </div>
      )}

      {/* Main Chat Drawer / Window */}
      {isOpen && (
        <div 
          className={`fixed z-[9999] transition-all duration-300 flex flex-col bg-white shadow-2xl border border-slate-200/80 rounded-2xl overflow-hidden font-sans ${
            isExpanded
              ? 'inset-4 sm:inset-10 max-w-5xl mx-auto h-[calc(100vh-5rem)]'
              : 'bottom-5 right-5 w-[94vw] sm:w-[460px] h-[640px] max-h-[88vh]'
          }`}
        >
          {/* Header (Limpia y Clínica - Azul Institucional & Acentos Cálidos) */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-md bg-white shrink-0">
                <img
                  src="/oliver-avatar.jpg"
                  alt="Oliver"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white tracking-wide">Oliver</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-400/30">
                    Maitre IA
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>En línea • Hilos de Amor</span>
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1 text-slate-300">
              <button
                type="button"
                onClick={handleClearChat}
                title="Reiniciar chat"
                className="p-1.5 hover:bg-white/10 rounded-lg hover:text-white transition-colors"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Reducir tamaño' : 'Maximizar'}
                className="hidden sm:block p-1.5 hover:bg-white/10 rounded-lg hover:text-white transition-colors"
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Cerrar"
                className="p-1.5 hover:bg-white/10 rounded-lg hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Oliver IA, Manuales, Soporte) */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 px-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('oliver')}
              className={`flex-1 py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'oliver'
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bot size={14} />
              <span>Oliver IA</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manuales')}
              className={`flex-1 py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'manuales'
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen size={14} />
              <span>Manuales</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('soporte')}
              className={`flex-1 py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'soporte'
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Headphones size={14} />
              <span>Soporte</span>
            </button>
          </div>

          {/* Tab 1: Oliver IA Main Chat */}
          {activeTab === 'oliver' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30">
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-slate-200 shadow-sm shrink-0 mt-0.5">
                        <img
                          src="/oliver-avatar.jpg"
                          alt="Oliver"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        renderMessageContent(msg.content)
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                      <div
                        className={`text-[10px] mt-1.5 flex justify-end font-medium ${
                          msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                        }`}
                      >
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator with Oliver typing animation */}
                {loading && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-slate-200 shadow-sm shrink-0 mt-0.5">
                      <img
                        src="/oliver-avatar.jpg"
                        alt="Oliver"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs p-3 shadow-sm flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <div className="flex gap-1 items-center">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                      </div>
                      <span className="text-slate-600 ml-1">Oliver está consultando la base de datos...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Contextual Quick Actions Chips */}
              {messages.length <= 4 && !loading && (
                <div className="p-2.5 border-t border-slate-200/80 bg-white shrink-0">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1.5 px-1 flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-500" />
                    <span>Sugerencias rápidas para esta pantalla:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {quickActions.map((qa, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendMessage(qa.prompt)}
                        className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 hover:border-blue-300 py-1.5 px-2.5 rounded-lg transition-all text-left font-medium active:scale-98"
                      >
                        {qa.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Preguntale lo que sea a Oliver o pedile un PDF/Excel..."
                    disabled={loading}
                    className="flex-1 py-2.5 px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer shrink-0"
                  >
                    <Send size={16} />
                  </button>
                </form>
                <div className="text-[10px] text-slate-400 text-center mt-1.5">
                  Oliver consulta la base de datos de Hilos de Amor y genera reportes oficiales en PDF y Excel.
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Manuales Base */}
          {activeTab === 'manuales' && (
            <div className="flex-1 overflow-y-auto p-4 bg-white flex flex-col min-h-0">
              <input
                type="text"
                value={manualSearch}
                onChange={(e) => setManualSearch(e.target.value)}
                placeholder="Buscar manual o guía operativa..."
                className="w-full py-2 px-3 mb-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {selectedManual ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setSelectedManual(null)}
                    className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
                  >
                    ← Volver a la lista de manuales
                  </button>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedManual.title}</h4>
                  <p className="text-xs text-slate-600">{selectedManual.description}</p>
                  <div className="space-y-2 mt-2">
                    {selectedManual.steps.map((step, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700">
                        <strong className="text-blue-700">Paso {idx + 1}:</strong> {step}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {manuals
                    .filter(m => m.title.toLowerCase().includes(manualSearch.toLowerCase()) || m.description.toLowerCase().includes(manualSearch.toLowerCase()))
                    .map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedManual(m)}
                        className="p-3 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 rounded-xl cursor-pointer transition-all"
                      >
                        <div className="font-semibold text-xs text-slate-800">{m.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{m.description}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Soporte Form */}
          {activeTab === 'soporte' && (
            <div className="flex-1 overflow-y-auto p-4 bg-white flex flex-col min-h-0">
              {submittedTicketId ? (
                <div className="my-auto text-center py-6 space-y-3">
                  <CheckCircle2 size={40} className="text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-slate-900 text-base">¡Ticket Registrado!</h4>
                  <p className="text-xs text-slate-600">
                    Tu consulta fue ingresada con el código <strong>#{submittedTicketId.slice(0, 6)}</strong>. El equipo de soporte de Grow Labs te contactará a la brevedad.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmittedTicketId(null)}
                    className="mt-2 py-2 px-4 bg-blue-600 text-white text-xs font-bold rounded-xl"
                  >
                    Enviar otra consulta
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-3">
                  <div className="text-xs text-slate-500">
                    ¿Tenés algún inconveniente que Oliver no pueda resolver? Escribinos y el equipo de Grow Labs te responderá de inmediato.
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Nombre completo *</label>
                    <input
                      type="text"
                      required
                      value={ticketForm.name}
                      onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                      className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Correo electrónico *</label>
                    <input
                      type="email"
                      required
                      value={ticketForm.email}
                      onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                      className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Descripción del problema *</label>
                    <textarea
                      required
                      rows={4}
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                      className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      placeholder="Detallanos qué sucedió..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Enviar Ticket a Soporte
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
