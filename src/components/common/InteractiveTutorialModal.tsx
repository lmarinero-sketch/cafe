import React, { useState, useEffect } from 'react';
import { 
  Sparkles, X, ChevronRight, ChevronLeft, CheckCircle2, Store, Coffee, 
  Calculator, Users, MessageSquare, ExternalLink, ShieldCheck, DollarSign, 
  UtensilsCrossed, Flame, Clock, AlertCircle, QrCode, Receipt
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type RoleCategory = 'admin' | 'cajero' | 'mozo' | 'cocina' | 'general';

interface Step {
  title: string;
  badge: string;
  icon: React.ReactNode;
  description: string;
  instructions: string[];
  actionText: string;
  action: () => void;
}

export const InteractiveTutorialModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { setPlan } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState<RoleCategory>(() => {
    return (user?.role as RoleCategory) || 'admin';
  });
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (user?.role) {
      setActiveRole(user.role as RoleCategory);
    }
  }, [user]);

  useEffect(() => {
    setCurrentStep(0);
  }, [activeRole]);

  if (!isOpen) return null;

  const roleTutorials: Record<RoleCategory, { name: string; icon: React.ReactNode; steps: Step[] }> = {
    admin: {
      name: 'Administrador',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-700" />,
      steps: [
        {
          title: '1. Configuración General & Sucursales',
          badge: 'Administración Central',
          icon: <Store className="w-5 h-5 text-brand-brown" />,
          description: 'Ajustá el nombre del negocio, sucursales físicas, horarios y redes sociales.',
          instructions: [
            'Entrá al módulo "Configuración" para editar los datos institucionales de la empresa.',
            'Creá o gestioná las sucursales con su dirección, zona y mapa Google interactivo integrado.',
            'Cambiá entre los planes de software para evaluar el nivel de funciones habilitadas.',
          ],
          actionText: 'Ir a Configuración',
          action: () => { onClose(); navigate('/configuracion'); },
        },
        {
          title: '2. Gestión de Personal & Permisos',
          badge: 'Seguridad y Accesos',
          icon: <Users className="w-5 h-5 text-brand-brown" />,
          description: 'Alta de colaboradores y asignación de roles operativos (Cajero, Mozo, Cocina, Admin).',
          instructions: [
            'En "Configuración > Personal y Roles", agregá nuevos empleados con su email y contraseña.',
            'Asignales su rol específico (Cajero, Mozo, Cocina) para restringir o habilitar módulos.',
            'Los usuarios oficiales del sistema están resguardados por Supabase Auth contra borrado accidental.',
          ],
          actionText: 'Ir a Personal y Roles',
          action: () => { onClose(); navigate('/configuracion'); },
        },
        {
          title: '3. Insumos, Recetas & Control de Margen',
          badge: 'Inteligencia de Costos',
          icon: <Calculator className="w-5 h-5 text-brand-brown" />,
          description: 'Definición de mermas, ingredientes, margen bruto (60%) y recálculo automático de precios.',
          instructions: [
            'Ingresá a "Ingredientes" para actualizar precios de compra de materias primas.',
            'Observá la alerta en vivo recálculo de precios sugeridos al aumentar insumos clave.',
            'En "Recetas y Costos", asociá ingredientes a los productos de la carta para asegurar rentabilidad.',
          ],
          actionText: 'Ir a Insumos & Recetas',
          action: () => { setPlan('gestion'); onClose(); navigate('/ingredientes'); },
        },
        {
          title: '4. Executive Dashboard & CRM Fidelización',
          badge: 'Analítica y Marketing',
          icon: <Sparkles className="w-5 h-5 text-emerald-800" />,
          description: 'Análisis de ventas en tiempo real, matriz de rotación, clientes VIP y WhatsApp.',
          instructions: [
            'Revisá el módulo "Métricas" para auditar facturación, ticket promedio e Insights automáticos.',
            'Explorá "Clientes" para segmentar miembros por consumo (Inicial, Frecuente, Preferencial, VIP).',
            'Simulá el envío de plantillas promocionales masivas en el módulo de "WhatsApp".',
          ],
          actionText: 'Ir a Métricas Executives',
          action: () => { setPlan('fidelizacion'); onClose(); navigate('/metricas'); },
        },
      ],
    },
    cajero: {
      name: 'Cajero',
      icon: <DollarSign className="w-4 h-4 text-emerald-700" />,
      steps: [
        {
          title: '1. Apertura de Caja & Fondo Inicial',
          badge: 'Apertura de Turno',
          icon: <DollarSign className="w-5 h-5 text-emerald-800" />,
          description: 'Habilitá la caja registradora declarando el saldo inicial en efectivo para dar cambio.',
          instructions: [
            'Navegá al módulo "Caja".',
            'Presioná el botón "Abrir Caja" e ingresá el fondo de caja inicial en efectivo ($ ARS).',
            'Sin caja abierta, el sistema bloqueará el ingreso y cobro de nuevos pedidos.',
          ],
          actionText: 'Ir a Control de Caja',
          action: () => { onClose(); navigate('/caja'); },
        },
        {
          title: '2. Recepción & Cobro de Pedidos',
          badge: 'Cobros y Facturación',
          icon: <Receipt className="w-5 h-5 text-brand-brown" />,
          description: 'Cobrá las comandas recibidas por Salón, Retiro o Delivery con múltiples medios de pago.',
          instructions: [
            'Verificá la lista de pedidos pendientes enviados por mozos o pedidos web.',
            'Elegí el medio de pago: Efectivo, Transferencia bancaria, Mercado Pago o Tarjeta.',
            'El cobro se imputa instantáneamente en el balance acumulado del turno.',
          ],
          actionText: 'Ver Pedidos por Cobrar',
          action: () => { onClose(); navigate('/pedidos'); },
        },
        {
          title: '3. Movimientos Manuales de Efectivo',
          badge: 'Arqueo en Vivo',
          icon: <Calculator className="w-5 h-5 text-brand-brown" />,
          description: 'Registrá ingresos o egresos extraordinarios de efectivo durante el turno.',
          instructions: [
            'Presioná "Nuevo Movimiento" para ingresar compras menores (ej. hielo, insumos rápidos).',
            'Categorizá la transacción como Ingreso o Egreso con su descripción correspondiente.',
            'Revisá el resumen histórico de la caja para evitar diferencias al cierre.',
          ],
          actionText: 'Ir a Registrar Movimiento',
          action: () => { onClose(); navigate('/caja'); },
        },
        {
          title: '4. Arqueo Físico & Cierre de Caja',
          badge: 'Cierre de Turno',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-700" />,
          description: 'Realizá el recuento físico de billetes y emiti el reporte final de cierre.',
          instructions: [
            'Al finalizar el turno, hacé clic en "Cerrar Caja".',
            'Ingresá el conteo físico real de billetes en efectivo.',
            'El sistema auditará la diferencia (sobrante o faltante) y emitirá el resumen de caja.',
          ],
          actionText: 'Ir a Cerrar Turno',
          action: () => { onClose(); navigate('/caja'); },
        },
      ],
    },
    mozo: {
      name: 'Mozo',
      icon: <UtensilsCrossed className="w-4 h-4 text-brand-brown" />,
      steps: [
        {
          title: '1. Grilla de Salón & Estado de Mesas',
          badge: 'Gestión de Salón',
          icon: <UtensilsCrossed className="w-5 h-5 text-brand-brown" />,
          description: 'Mapeo visual de mesas por sectores (Salón Principal, Patio, Terraza, Vereda).',
          instructions: [
            'Ingresá al módulo "Mesas" y seleccioná el sector donde se ubicaron los comensales.',
            'Hacé clic sobre la tarjeta de la mesa para marcarla como "Ocupada".',
            'Verificá la capacidad y estado en tiempo real de cada comanda activa.',
          ],
          actionText: 'Ir al Mapa de Mesas',
          action: () => { onClose(); navigate('/mesas'); },
        },
        {
          title: '2. Toma de Comanda & Notas para Cocina',
          badge: 'Toma de Pedidos',
          icon: <Coffee className="w-5 h-5 text-brand-brown" />,
          description: 'Carga rápida de platos y bebidas con observaciones especiales para cocina.',
          instructions: [
            'Seleccioná los artículos solicitados por el cliente desde la comanda rápida.',
            'Ingresá notas particulares (ej. "sin azúcar", "té bien caliente", "sin sal").',
            'Confirmá el pedido para enviarlo instantáneamente al tablero de Cocina (KDS).',
          ],
          actionText: 'Tomar Pedido de Mesa',
          action: () => { onClose(); navigate('/mesas'); },
        },
        {
          title: '3. Self-Ordering QR de Mesa',
          badge: 'Atención con Celular',
          icon: <QrCode className="w-5 h-5 text-brand-brown" />,
          description: 'Permití que los clientes escaneen y pidan directamente desde sus smartphones.',
          instructions: [
            'Hacé clic en "Ver Código QR" dentro de la tarjeta de la mesa.',
            'El cliente podrá escanear la carta interactiva y generar pedidos vinculados a su mesa.',
          ],
          actionText: 'Ver Códigos QR de Mesa',
          action: () => { onClose(); navigate('/mesas'); },
        },
        {
          title: '4. Solicitud de Cuenta & Liberación',
          badge: 'Despacho de Mesa',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-700" />,
          description: 'Solicitud de cobro al Cajero y cierre del ciclo de atención.',
          instructions: [
            'Al pedir la cuenta, notificá la mesa al Cajero para procesar el pago.',
            'Una vez cobrada y desocupada la mesa, pasá el estado a "Disponible" para recibir nuevos clientes.',
          ],
          actionText: 'Ir a Mapa de Mesas',
          action: () => { onClose(); navigate('/mesas'); },
        },
      ],
    },
    cocina: {
      name: 'Cocina',
      icon: <Flame className="w-4 h-4 text-orange-600" />,
      steps: [
        {
          title: '1. Comandera KDS & Recepción de Pedidos',
          badge: 'Control de Producción',
          icon: <Flame className="w-5 h-5 text-orange-600" />,
          description: 'Recepción visual organizada de órdenes entrantes por horario de llegada.',
          instructions: [
            'Ingresá al módulo "Pedidos" (Pantalla KDS de Cocina).',
            'Revisá la columna "Nuevo" donde ingresan las comandas enviadas por mozos, retiro o delivery.',
          ],
          actionText: 'Ir a Comandera Cocina',
          action: () => { onClose(); navigate('/pedidos'); },
        },
        {
          title: '2. Inicio de Preparación & Tiempos',
          badge: 'Platos en Marcha',
          icon: <Clock className="w-5 h-5 text-brand-brown" />,
          description: 'Marca el inicio de elaboración para control del tiempo de servicio.',
          instructions: [
            'Al empezar a cocinar los platos de la comanda, cambiá el estado a "En preparación".',
            'El contador de tiempo te permitirá controlar la demora de elaboración en cocina.',
          ],
          actionText: 'Ver Comandas Activas',
          action: () => { onClose(); navigate('/pedidos'); },
        },
        {
          title: '3. Observaciones Especiales & Alérgenos',
          badge: 'Calidad de Emplatado',
          icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
          description: 'Verificación cuidadosa de indicaciones del cliente (alérgenos, cocción).',
          instructions: [
            'Revisá las notas destacadas en amarillo (ej. "sin gluten", "término medio", "sin sal").',
            'Asegurá la calidad antes de marcar la orden como terminada.',
          ],
          actionText: 'Revisar Comandas KDS',
          action: () => { onClose(); navigate('/pedidos'); },
        },
        {
          title: '4. Despacho & Notificación "Listo"',
          badge: 'Plato Despachado',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-700" />,
          description: 'Aviso instantáneo a mozos o repartidores al completar el plato.',
          instructions: [
            'Cuando la orden esté lista para servir o enviar, hacé clic en "Listo".',
            'Esto notificará automáticamente al mozo en salón o al repartidor de delivery.',
          ],
          actionText: 'Ir al Tablero KDS',
          action: () => { onClose(); navigate('/pedidos'); },
        },
      ],
    },
    general: {
      name: 'Tour General (Planes)',
      icon: <Sparkles className="w-4 h-4 text-brand-brown" />,
      steps: [
        {
          title: '1. Presentación Comercial & Planes',
          badge: 'Introducción Comercial',
          icon: <Store className="w-5 h-5 text-brand-brown" />,
          description: 'Aprendé a alternar entre los tres planes de software y presentar la propuesta comercial a un cliente.',
          instructions: [
            'En el encabezado superior podés cambiar entre Plan Esencial, Plan Gestión y Plan Fidelización en tiempo real.',
            'Al intentar ingresar a un módulo bloqueado en un plan inferior, se desplegará el modal de actualización.',
            'Presioná "Ver 3 Planes Comerciales" para mostrar la página pública con las tarjetas comparativas.',
          ],
          actionText: 'Ir a Selector de Planes',
          action: () => { onClose(); navigate('/planes'); },
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
          action: () => { setPlan('esencial'); onClose(); navigate('/productos'); },
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
          ],
          actionText: 'Ir a Insumos & Recetas',
          action: () => { setPlan('gestion'); onClose(); navigate('/ingredientes'); },
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
          ],
          actionText: 'Ir a Tarjetas & WhatsApp',
          action: () => { setPlan('fidelizacion'); onClose(); navigate('/tarjetas'); },
        },
      ],
    },
  };

  const currentTutorial = roleTutorials[activeRole] || roleTutorials.admin;
  const steps = currentTutorial.steps;
  const step = steps[currentStep] || steps[0];

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-brand-card rounded-2xl border-2 border-brand-brown p-6 max-w-xl w-full max-h-[88vh] flex flex-col justify-between shadow-soft-lg relative overflow-hidden">
        
        {/* Role Selector Header */}
        <div className="space-y-3 border-b border-brand-secondary pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-brand-yellow/40 border border-brand-yellow flex items-center justify-center text-brand-brown">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-extrabold text-brand-dark uppercase tracking-wider">Tutorial Guiado por Perfil</h3>
                <p className="text-[11px] text-brand-brown font-medium">Elegí un rol para explorar sus funciones paso a paso</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-brand-dark/60 hover:text-brand-dark hover:bg-brand-secondary/40 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role selector buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {(Object.keys(roleTutorials) as RoleCategory[]).map((roleKey) => {
              const r = roleTutorials[roleKey];
              const isActive = activeRole === roleKey;
              return (
                <button
                  key={roleKey}
                  onClick={() => setActiveRole(roleKey)}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                    isActive
                      ? 'bg-brand-brown text-brand-card border-brand-brown shadow-xs'
                      : 'bg-brand-bg text-brand-dark border-brand-secondary/80 hover:bg-brand-secondary/40'
                  }`}
                >
                  {r.icon}
                  <span>{r.name}</span>
                </button>
              );
            })}
          </div>

          {/* Step Navigation Dots */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {steps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-extrabold transition-all whitespace-nowrap ${
                  currentStep === idx
                    ? 'bg-brand-dark text-white shadow-xs'
                    : 'bg-brand-bg text-brand-brown hover:bg-brand-secondary/50'
                }`}
              >
                Paso {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Step Body Container */}
        <div className="overflow-y-auto py-3 space-y-3 pr-1 flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-yellow/40 border border-brand-yellow flex items-center justify-center shrink-0">
              {step.icon}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-brown bg-brand-yellow/40 px-2 py-0.5 rounded border border-brand-yellow/50">
                {step.badge}
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-brand-dark mt-0.5">{step.title}</h3>
            </div>
          </div>

          <p className="text-xs text-brand-brown/90 font-medium leading-relaxed">{step.description}</p>

          <div className="space-y-2 bg-brand-bg p-3.5 rounded-xl border border-brand-secondary/80 text-xs">
            <h4 className="font-extrabold text-brand-dark uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Acciones operativas guiadas:
            </h4>
            <ul className="space-y-1.5">
              {step.instructions.map((inst, idx) => (
                <li key={idx} className="flex items-start gap-2 text-brand-dark leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-brand-brown/10 text-brand-brown font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
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
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-extrabold text-xs hover:bg-brand-dark transition-all shadow-soft flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-yellow" /> {step.actionText}
          </button>
        </div>
      </div>
    </div>
  );
};

