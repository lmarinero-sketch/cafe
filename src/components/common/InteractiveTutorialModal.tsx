import React, { useState } from 'react';
import { Sparkles, X, ChevronRight, ChevronLeft, CheckCircle2, Store, Coffee, Calculator, Users, MessageSquare, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const InteractiveTutorialModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { setPlan } = useApp();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: '1. Presentación Comercial & Selector de Planes',
      badge: 'Introducción Comercial',
      icon: <Store className="w-5 h-5 text-brand-brown" />,
      description: 'Aprendé a alternar entre los tres planes de software y presentar la propuesta comercial a un cliente.',
      instructions: [
        'En el encabezado superior podés cambiar entre Plan Esencial, Plan Gestión y Plan Fidelización en tiempo real.',
        'Al intentar ingresar a un módulo bloqueado en un plan inferior, se desplegará el modal de actualización.',
        'Presioná "Ver 3 Planes Comerciales" para mostrar la página pública con las tarjetas comparativas.',
      ],
      actionText: 'Ir a Selector de Planes',
      action: () => navigate('/planes'),
    },
    {
      title: '2. Plan Esencial: Menú Digital & Pedidos',
      badge: 'Operación Básica',
      icon: <Coffee className="w-5 h-5 text-brand-brown" />,
      description: 'Flujo completo de digitalización de carta, mesas QR y recepción de comandas en tiempo real.',
      instructions: [
        'Ingresá a "Productos" y creá o editá un producto (ej. Capuchino Especial a $3.800).',
        'Navegá a "Mesas", seleccioná "Mesa 08" en Terraza y presioná "Ver Código QR".',
        'Abrí el menú digital pre-vinculado y confirmá un pedido con observaciones para cocina.',
        'Observá el pedido en el Kanban de "Pedidos". Movelos a "En preparación" y "Entregado".',
      ],
      actionText: 'Ir a Productos & Mesas',
      action: () => {
        setPlan('esencial');
        navigate('/productos');
      },
    },
    {
      title: '3. Plan Gestión: Costos & Recálculo Automático',
      badge: 'Inteligencia de Negocio',
      icon: <Calculator className="w-5 h-5 text-brand-brown" />,
      description: 'Control de escandallos, mermas, margen bruto del 60% y recálculo automático de precios.',
      instructions: [
        'Cambia al "Plan Gestión" en el selector superior.',
        'Ingresá a "Ingredientes" y actualizá el precio del "Café en Grano Arábica" de $24.000 a $30.000.',
        'Observá la alerta amarilla notificando la afectación de los 4 productos vinculados.',
        'Abrí "Recetas y Costos", elegí "Café con Leche" y aplicá el precio sugerido para mantener el 60% de margen.',
        'Explorá los gráficos ejecutivos en "Métricas", la "Matriz de Rotación" y las "Insights del Negocio".',
      ],
      actionText: 'Ir a Insumos & Recetas',
      action: () => {
        setPlan('gestion');
        navigate('/ingredientes');
      },
    },
    {
      title: '4. Plan Fidelización: CRM, WhatsApp & Tarjeta QR',
      badge: 'Fidelización & Marketing',
      icon: <Users className="w-5 h-5 text-emerald-800" />,
      description: 'Recompensas de socios, campañas masivas simuladas de WhatsApp y tarjetas digitales.',
      instructions: [
        'Activa el "Plan Fidelización" en la barra superior.',
        'Ingresá a "Clientes" para ver la segmentación por niveles (Inicial, Frecuente, Preferencial, VIP).',
        'Abrí "Puntos y Recompensas" y simulá el canje de 350 puntos por un "Café Espresso Gratis".',
        'Ir a "Tarjetas Virtuales" y visualizá la credencial digital móvil con QR y saldo de puntos.',
        'Ingresá a "WhatsApp", elegí la plantilla "Nuevos Puntos" e iniciá la simulación de envío en vivo.',
      ],
      actionText: 'Ir a Tarjetas & WhatsApp',
      action: () => {
        setPlan('fidelizacion');
        navigate('/tarjetas');
      },
    },
    {
      title: '5. Asesor Virtual 24/7 & Soporte',
      badge: 'Asistencia Integrada',
      icon: <MessageSquare className="w-5 h-5 text-brand-brown" />,
      description: 'Resolución de dudas mediante Inteligencia Artificial local, manuales y tickets.',
      instructions: [
        'Hacé clic en el botón flotante "Asesor virtual" en el extremo inferior izquierdo.',
        'Escribí "¿Cómo actualizo un ingrediente?" o hacé clic en las preguntas sugeridas.',
        'Accedé a la pestaña "Manuales" para navegar por los 11 manuales del sistema.',
        'En la pestaña "Soporte", enviá una consulta simulada para generar el número `#TICK-xxxx`.',
      ],
      actionText: 'Abrir Manuales',
      action: () => navigate('/manuales'),
    },
  ];

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[999999] flex items-start justify-center pt-20 pb-6 px-4 bg-brand-dark/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-brand-card rounded-2xl border-2 border-brand-brown p-5 max-w-xl w-full max-h-[calc(100vh-7rem)] flex flex-col justify-between shadow-soft-lg relative">
        {/* Step Selector Dots / Bar */}
        <div className="flex items-center justify-between border-b border-brand-secondary pb-3 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {steps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-extrabold transition-all whitespace-nowrap ${
                  currentStep === idx
                    ? 'bg-brand-brown text-brand-card shadow-soft'
                    : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40'
                }`}
              >
                Paso {idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Body Container with scroll if needed */}
        <div className="overflow-y-auto py-3 space-y-3 pr-1 flex-1">
          {/* Step Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-yellow/40 border border-brand-yellow flex items-center justify-center shrink-0">
              {step.icon}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-brown bg-brand-yellow/40 px-2 py-0.5 rounded">
                {step.badge}
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-brand-dark mt-0.5">{step.title}</h3>
            </div>
          </div>

          <p className="text-xs text-brand-brown/90 font-medium leading-relaxed">{step.description}</p>

          <div className="space-y-2 bg-brand-bg p-3 rounded-xl border border-brand-secondary/80 text-xs">
            <h4 className="font-extrabold text-brand-dark uppercase text-[10px] tracking-wider">
              Acciones guiadas a realizar:
            </h4>
            <ul className="space-y-1.5">
              {step.instructions.map((inst, idx) => (
                <li key={idx} className="flex items-start gap-2 text-brand-dark leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-brand-secondary shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className={`flex-1 sm:flex-none py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                currentStep === 0
                  ? 'opacity-40 cursor-not-allowed border-brand-secondary text-brand-dark/40'
                  : 'border-brand-secondary text-brand-dark hover:bg-brand-secondary/30'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
              className={`flex-1 sm:flex-none py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                currentStep === steps.length - 1
                  ? 'opacity-40 cursor-not-allowed border-brand-secondary text-brand-dark/40'
                  : 'border-brand-secondary text-brand-dark hover:bg-brand-secondary/30'
              }`}
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              step.action();
            }}
            className="w-full sm:w-auto py-2 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-all shadow-soft flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-yellow" /> {step.actionText}
          </button>
        </div>
      </div>
    </div>
  );
};
