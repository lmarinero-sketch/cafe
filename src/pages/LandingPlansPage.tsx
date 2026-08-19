import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, ArrowRight, ShieldCheck, Star, Zap, GraduationCap, Gift, Layers, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PlanType } from '../types';
import { formatCurrency } from '../utils/currency';

export const LandingPlansPage: React.FC = () => {
  const { setPlan } = useApp();
  const navigate = useNavigate();

  const handleSelectPlan = (planId: PlanType) => {
    setPlan(planId);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark font-sans py-12 px-4 pb-20">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-secondary/50 border border-brand-secondary text-brand-brown text-xs font-bold uppercase tracking-wider shadow-xs">
            🧁🧵 Hilos de Amor • Pastelería y Encordado
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight">
            Planes Comerciales & Canon Mensual
          </h1>
          <p className="text-base md:text-lg text-brand-brown/90 leading-relaxed font-normal">
            Elegí la solución ideal para tu local gastronómico. Transparencia total sin comisiones ocultas por venta.
          </p>
        </div>

        {/* 3 Commercial Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* PLAN 1: ESENCIAL */}
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-8 shadow-soft flex flex-col justify-between hover:border-brand-brown/40 transition-all duration-300 relative">
            <div className="space-y-6">
              <div className="space-y-2 border-b border-brand-secondary/60 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-brown/70">
                  Plan Inicial
                </span>
                <h3 className="text-2xl font-extrabold text-brand-dark">Plan Esencial</h3>
                <div className="pt-2">
                  <span className="text-3xl font-extrabold text-brand-brown font-mono">{formatCurrency(100000)}</span>
                  <span className="text-xs text-brand-brown/80 font-bold"> / mes</span>
                </div>
                <p className="text-xs text-brand-brown/90 pt-1">
                  Ideal para digitalizar la carta, recibir pedidos y controlar mesas con código QR.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-dark">Funcionalidades Incluidas:</p>
                <ul className="space-y-2.5 text-xs text-brand-dark">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>Administración de Productos & Categorías</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>Mesas QR por sectores (Salón, Patio, Terraza)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>Menú Digital Móvil (Autogestión de pedidos)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>Carta Tradicional de Solo Lectura</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>Panel de Pedidos & Kanban de Delivery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>Asesor Virtual 24/7 con Manuales</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => handleSelectPlan('esencial')}
                className="w-full py-3 px-4 rounded-xl border border-brand-brown text-brand-brown font-bold text-sm hover:bg-brand-brown hover:text-brand-card transition-all duration-200 shadow-xs flex items-center justify-center gap-2"
              >
                Probar Plan Esencial <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PLAN 2: GESTIÓN (RECOMENDADO) */}
          <div className="bg-brand-card rounded-2xl border-2 border-brand-brown p-8 shadow-soft-lg flex flex-col justify-between relative transform md:-translate-y-3">
            {/* Recommended Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-brown text-brand-yellow px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-soft flex items-center gap-1 whitespace-nowrap">
              <Star className="w-3.5 h-3.5 fill-brand-yellow" /> Más Popular • Recomendado
            </div>

            <div className="space-y-6">
              <div className="space-y-2 border-b border-brand-secondary pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-brown">
                  Nivel Profesional
                </span>
                <h3 className="text-2xl font-extrabold text-brand-dark">Plan Gestión</h3>
                <div className="pt-2">
                  <span className="text-3xl font-extrabold text-brand-brown font-mono">{formatCurrency(150000)}</span>
                  <span className="text-xs text-brand-brown/80 font-bold"> / mes</span>
                </div>
                <p className="text-xs text-brand-brown/90 pt-1">
                  Control absoluto de escandallos, margen bruto y recálculo automático de precios por insumos.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                  Todo lo del Plan Esencial más:
                </p>
                <ul className="space-y-2.5 text-xs text-brand-dark">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>Ingredientes & Normalización de Unidades</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>Recetas, Escandallos & Costos de Empaque</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>Precios Sugeridos & Recálculo Automático por Inflación</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>Métricas Totales KPI & Gráficos Recharts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>Matriz de Rotación de Productos & Insights</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => handleSelectPlan('gestion')}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-sm hover:bg-brand-dark transition-all duration-200 shadow-soft flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-brand-yellow" />
                Probar Plan Gestión
              </button>
            </div>
          </div>

          {/* PLAN 3: FIDELIZACIÓN */}
          <div className="bg-brand-card rounded-2xl border-2 border-emerald-800/40 p-8 shadow-soft flex flex-col justify-between hover:border-emerald-800 transition-all duration-300 relative">
            <div className="space-y-6">
              <div className="space-y-2 border-b border-brand-secondary/60 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Nivel Full Crecimiento
                </span>
                <h3 className="text-2xl font-extrabold text-brand-dark">Plan Fidelización</h3>
                <div className="pt-2">
                  <span className="text-3xl font-extrabold text-emerald-900 font-mono">{formatCurrency(200000)}</span>
                  <span className="text-xs text-brand-brown/80 font-bold"> / mes</span>
                </div>
                <p className="text-xs text-brand-brown/90 pt-1">
                  Automatización de marketing por WhatsApp, tarjeta virtual de socios y CRM de alta facturación.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                  Todo lo del Plan Gestión más:
                </p>
                <ul className="space-y-2.5 text-xs text-brand-dark">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>CRM de Clientes, Nivel VIP & Analytics Top Spenders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>Puntos, Recompensas & Tarjeta Virtual QR</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>Simulador de WhatsApp & Automatizaciones</span>
                  </li>
                  <li className="flex items-start gap-2 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <Gift className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                    <span className="font-extrabold text-emerald-950">
                      BONIFICADO: Sitio Web Promocional + Club de Socios sin costo mensual extra*
                    </span>
                  </li>
                </ul>
                <p className="text-[10px] text-brand-brown/70 italic pt-1">
                  * El canon mensual incluye la página promocional y club de socios. La compra del dominio propio web (.com / .com.ar) corre por cuenta del cliente.
                </p>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => handleSelectPlan('fidelizacion')}
                className="w-full py-3 px-4 rounded-xl bg-brand-green/30 border border-brand-green text-emerald-950 font-extrabold text-sm hover:bg-brand-green/60 transition-all duration-200 shadow-xs flex items-center justify-center gap-2"
              >
                Probar Plan Fidelización <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* SPECIAL SERVICE: SETUP & ONBOARDING BY GROW LABS */}
        <div className="bg-brand-card rounded-3xl border-2 border-brand-yellow p-8 shadow-soft-lg space-y-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-brand-secondary pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-brand-dark bg-brand-yellow px-3 py-1 rounded-full shadow-xs">
                  🚀 Puesta en Marcha Llave en Mano
                </span>
                <span className="text-xs font-bold text-brand-brown bg-brand-cream px-2.5 py-1 rounded-full border border-brand-secondary">
                  Servicio Opcional en Cualquiera de los Planes
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
                Configuración Total & Capacitación 1 a 1 por Grow Labs
              </h2>
              <p className="text-xs sm:text-sm text-brand-brown/90 max-w-2xl">
                ¿Querés despreocuparte por completo de la carga inicial? El equipo de Grow Labs configura tu local entero y te enseña paso a paso a usar cada módulo del sistema.
              </p>
            </div>

            <div className="bg-brand-cream p-4 rounded-2xl border border-brand-secondary text-center shrink-0 min-w-[200px]">
              <span className="text-[10px] font-bold text-brand-brown uppercase tracking-wider block">Costo Único (Pago por única vez)</span>
              <span className="text-3xl font-extrabold text-brand-dark font-mono block mt-1">{formatCurrency(200000)}</span>
              <span className="text-[10px] text-emerald-800 font-extrabold block mt-0.5">Sin ningún tipo de costo recurrente</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3 bg-brand-bg p-5 rounded-2xl border border-brand-secondary/80">
              <div className="flex items-center gap-2 text-brand-dark font-extrabold text-sm">
                <Zap className="w-5 h-5 text-brand-brown" />
                <span>1. Carga & Configuración Completa del Sistema</span>
              </div>
              <ul className="space-y-2 text-xs text-brand-brown/90">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Alta de toda la carta de productos, fotos y categorías.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Configuración gráfica de sectores de mesas y códigos QR.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Carga de ingredientes, escandallos y márgenes de receta.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Personalización institucional con tu marca y colores.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 bg-brand-bg p-5 rounded-2xl border border-brand-secondary/80">
              <div className="flex items-center gap-2 text-brand-dark font-extrabold text-sm">
                <GraduationCap className="w-5 h-5 text-brand-brown" />
                <span>2. Capacitación 1 a 1 & Acompañamiento</span>
              </div>
              <ul className="space-y-2 text-xs text-brand-brown/90">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Entrenamiento dedicado para dueños, encuestadores y cajeros.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Explicación práctica paso a paso de cada sección operativa.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Soporte prioritario durante las primeras semanas de inicio.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Entrega de instructivos y manuales personalizados.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Commercial Banner & Grow Labs Credits */}
        <div className="bg-brand-cream rounded-2xl border border-brand-secondary p-6 text-center max-w-3xl mx-auto space-y-3 shadow-xs">
          <h4 className="text-sm font-bold text-brand-dark">¿Buscás una propuesta personalizada para tu comercio?</h4>
          <p className="text-xs text-brand-brown/80">
            El equipo de Grow Labs adapta la plataforma a los requerimientos específicos de tu sucursal para optimizar tu operación diaria en producción.
          </p>
          <div className="pt-2">
            <a
              href="https://www.growlabs.lat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-brown text-brand-card font-extrabold text-xs hover:bg-brand-dark transition-all shadow-soft"
            >
              <span className="w-5 h-5 rounded-full overflow-hidden border border-brand-secondary inline-block shrink-0 bg-white">
                <img src="/logogrow.png" alt="Grow Labs" className="w-full h-full object-cover" />
              </span>
              Diseñado & Desarrollado por <span className="text-brand-yellow font-bold">Grow Labs</span> 🚀
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
