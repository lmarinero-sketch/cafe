import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coffee,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  Gift,
  Award,
  ChevronRight,
  Wifi,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
  BookOpen,
  Smartphone,
  Heart,
  Store,
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export const PromotionalWebsitePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSucursalId, setSelectedSucursalId] = useState('suc-1');
  const [joinedClub, setJoinedClub] = useState(false);
  const [memberPhone, setMemberPhone] = useState('');

  const sucursalesMapDetails: Record<string, { mapUrl: string; distance: string; directions: string }> = {
    'suc-1': {
      mapUrl: 'https://maps.google.com/maps?q=-31.5375,-68.5255&z=17&output=embed',
      distance: 'A 50 metros de la Plaza 25 de Mayo (Peatonal Tucumán 145 Sur)',
      directions: 'Caminando 1 minuto desde la fuente de la Plaza 25 de Mayo hacia Peatonal Tucumán.',
    },
    'suc-2': {
      mapUrl: 'https://maps.google.com/maps?q=-31.5360,-68.5480&z=15&output=embed',
      distance: 'A 8 minutos de la Plaza 25 de Mayo (Av. Ignacio de la Roza 1840 Oeste)',
      directions: 'Desde Plaza 25 de Mayo, dirígete al Oeste por Av. Ignacio de la Roza hasta Paseo Del Bono.',
    },
    'suc-3': {
      mapUrl: 'https://maps.google.com/maps?q=-31.5320,-68.5620&z=14&output=embed',
      distance: 'A 12 minutos de la Plaza 25 de Mayo (Av. Libertador 3200 Oeste)',
      directions: 'Desde Plaza 25 de Mayo, toma Av. Libertador San Martín hacia Desamparados.',
    },
  };

  const handleJoinClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberPhone) return;
    setJoinedClub(true);
  };

  const sucursalesSanJuan = [
    {
      id: 'suc-1',
      name: 'Sucursal Peatonal Tucumán',
      zone: 'Capital, San Juan',
      address: 'Tucumán 145 Sur (Frente a Plaza 25 de Mayo)',
      phone: '(264) 422-8900',
      hours: 'Lunes a Sábados: 07:00 a 22:00 hs',
      badge: 'Casa Central',
      features: ['Terraza Climatizada', 'WiFi Fibra 300MB', 'Take Away Rápido'],
    },
    {
      id: 'suc-2',
      name: 'Sucursal Del Bono Shopping',
      zone: 'Rivadavia, San Juan',
      address: 'Av. Ignacio de la Roza 1840 Oeste (Paseo Del Bono)',
      phone: '(264) 433-1200',
      hours: 'Todos los días: 08:00 a 00:00 hs',
      badge: 'Zona Coworking',
      features: ['Estacionamiento Gratuito', 'Espacio Coworking', 'Sector Pet Friendly'],
    },
    {
      id: 'suc-3',
      name: 'Sucursal Paseo San Juan',
      zone: 'Desamparados, San Juan',
      address: 'Av. Libertador General San Martín 3200 Oeste',
      phone: '(264) 441-7500',
      hours: 'Lunes a Domingos: 08:00 a 23:00 hs',
      badge: 'Drive-Thru',
      features: ['Servicio Auto-Café', 'Jardín al aire libre', 'Pastelería en vivo'],
    },
  ];

  const beneficiosClub = [
    {
      icon: <Gift className="w-6 h-6 text-brand-brown" />,
      title: 'Café de Bienvenida Gratis',
      desc: 'Al registrarte en el Club Magnolia recibís un voucher por un espresso de especialidad a tu elección.',
    },
    {
      icon: <Award className="w-6 h-6 text-brand-brown" />,
      title: '10% Cashback en Puntos',
      desc: 'Cada compra que realizás acumula puntos canjeables por medialunas, tortas o desayunos completos.',
    },
    {
      icon: <Heart className="w-6 h-6 text-brand-brown" />,
      title: 'Agasajo de Cumpleaños 2x1',
      desc: 'Te regalamos una porción de pastelería artesanal y 2x1 en toda la carta el día de tu cumpleaños.',
    },
    {
      icon: <Zap className="w-6 h-6 text-brand-brown" />,
      title: 'Reservas & Mesas Prioritarias',
      desc: 'Acceso exclusivo a reservas sin espera en los sectores Terraza y Coworking de San Juan.',
    },
    {
      icon: <Wifi className="w-6 h-6 text-brand-brown" />,
      title: 'Coworking Premium & WiFi 5G',
      desc: 'Tomas de energía en cada mesa, iluminación natural y café de filtro libre en tus mañanas de trabajo.',
    },
    {
      icon: <Star className="w-6 h-6 text-brand-brown" />,
      title: 'Refill Filtro Sin Cargo',
      desc: 'Disfrutá de refill ilimitado en tu café de filtro de especialidad a partir de tu 5ta visita mensual.',
    },
  ];

  const promociones = [
    {
      id: 'prom-1',
      title: 'Mañanas de Magnolia',
      tag: 'Más Vendido',
      price: 3200,
      detail: 'Capuchino de especialidad + 2 Medialunas hojaldradas de manteca pura.',
      schedule: 'Todos los días de 07:00 a 11:00 hs',
    },
    {
      id: 'prom-2',
      title: 'Combo Nano Banana Launch 🍌',
      tag: 'Novedad Exclusiva',
      price: 5800,
      detail: 'Edición limitada de Nano Banana Coffee + Porción de Cheesecake casero de frutos rojos.',
      schedule: 'Disponible todo el día en sucursales San Juan',
    },
    {
      id: 'prom-3',
      title: 'Tarde de Amigos 2x1 🍰',
      tag: 'Jueves Especiales',
      price: 4100,
      detail: '2x1 en todas las porciones de pastelería artesanal acompañando tu bebida favorita.',
      schedule: 'Todos los jueves de 16:00 a 19:00 hs',
    },
    {
      id: 'prom-4',
      title: 'Combo Executive Coworking',
      tag: 'Ideal Trabajo',
      price: 7800,
      detail: 'Café tostado origen + Sandwich Focaccia con jamón crudo y rucula + Jugo de naranja exprimido.',
      schedule: 'Lunes a Viernes de 12:00 a 16:00 hs',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F1E7] text-[#4A352C] font-sans selection:bg-[#EADBC8] pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#EADBC8] px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#2F5233] shadow-soft bg-white shrink-0">
              <img src="/logo_hilos_de_amor.jpg" alt="Hilos de Amor" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#1A2E1E] leading-tight flex items-center gap-1.5 font-serif">
                Hilos de Amor
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#E2EAC7] text-[#2F5233] border border-[#8FA887]">
                  San Juan, Arg 🇦🇷
                </span>
              </h1>
              <a
                href="https://www.growlabs.lat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-[#2F5233] hover:underline flex items-center gap-1"
              >
                <span className="w-4 h-4 rounded-full overflow-hidden border border-[#D6E2D4] inline-block shrink-0 bg-white">
                  <img src="/logogrow.png" alt="Grow Labs" className="w-full h-full object-cover" />
                </span>
                Diseñado por <span className="text-emerald-900 font-extrabold">Grow Labs</span> ✨
              </a>
            </div>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/menu')}
              className="py-2 px-3.5 rounded-xl bg-[#2F5233] text-[#FFFDF8] font-bold text-xs hover:bg-[#1A2E1E] transition-all shadow-soft flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#D8E4C3]" /> Pedir en Menú Digital
            </button>
            <button
              onClick={() => navigate('/carta-tradicional')}
              className="hidden sm:flex py-2 px-3.5 rounded-xl bg-[#EBF1EA] text-[#1A2E1E] border border-[#D2E0D0] font-bold text-xs hover:bg-[#D2E0D0]/40 transition-colors items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#2F5233]" /> Carta Tradicional
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden py-12 px-4 bg-gradient-to-b from-[#FFFDF8] to-[#F4F7F3] border-b border-[#D2E0D0]">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#2F5233] bg-[#D8E4C3]/40 px-3.5 py-1.5 rounded-full border border-[#D8E4C3]">
            ✨ Pastelería de Autor & Encordado en San Juan
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1A2E1E] tracking-tight leading-tight max-w-3xl mx-auto font-serif">
            Hilos de Amor — Pastelería Artesanal & Encordado
          </h2>

          <p className="text-sm sm:text-base text-[#2F5233] max-w-2xl mx-auto font-medium leading-relaxed">
            Descubrí la combinación perfecta entre dulzura artesanal, especialidades de pastelería y la calidez de nuestro espacio en San Juan.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#club-magnolia"
              className="py-3 px-6 rounded-xl bg-[#2F5233] text-[#FFFDF8] font-extrabold text-xs sm:text-sm hover:bg-[#1A2E1E] transition-all shadow-soft-lg flex items-center gap-2"
            >
              <Gift className="w-4 h-4 text-[#D8E4C3]" /> Sumate al Club de Beneficios
            </a>
            <a
              href="#sucursales"
              className="py-3 px-6 rounded-xl bg-[#FFFDF8] text-[#1A2E1E] border border-[#D2E0D0] font-bold text-xs sm:text-sm hover:bg-[#EBF1EA] transition-all shadow-xs flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-[#2F5233]" /> Ver Sucursales en San Juan
            </a>
          </div>
        </div>
      </section>

      {/* Featured Star Product: NANO BANANA COFFEE 🍌☕ */}
      <section className="py-12 px-4 max-w-5xl mx-auto">
        <div className="bg-[#FFFDF8] rounded-3xl border-2 border-[#F4D58D] p-6 sm:p-10 shadow-soft-lg grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#765747] bg-[#F4D58D] px-3 py-1 rounded-full shadow-xs">
                🍌 Lanzamiento Exclusivo 2026
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                Edición de Autor
              </span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#4A352C] font-serif">
              Nano Banana Coffee ☕🍌
            </h3>

            <p className="text-xs sm:text-sm text-[#765747] leading-relaxed font-medium">
              Una creación revolucionaria de nuestros barista masters: doble espresso 100% arábica emulsionado con crema aterciopelada de banana orgánica de Cuyo, terminado con un toque de canela y lluvia de cacao amargo.
            </p>

            <div className="bg-[#FAF5EE] p-4 rounded-2xl border border-[#EADBC8] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#765747]">Precio Especial Lanzamiento:</span>
                <span className="text-xl font-extrabold text-[#765747] font-mono">{formatCurrency(4500)}</span>
              </div>
              <p className="text-[11px] text-[#765747]/80 italic">
                * Disponible exclusivamente en nuestras 3 sucursales de San Juan y para pedido por Menú Digital.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => navigate('/menu')}
                className="py-3 px-5 rounded-xl bg-[#765747] text-[#FFFDF8] font-bold text-xs hover:bg-[#4A352C] transition-all shadow-soft flex items-center gap-2"
              >
                Probá el Nano Banana hoy <ArrowRight className="w-4 h-4 text-[#F4D58D]" />
              </button>
            </div>
          </div>

          {/* Generated AI Image */}
          <div className="relative group">
            <div className="rounded-2xl overflow-hidden border-2 border-[#EADBC8] shadow-soft-lg bg-[#FAF5EE]">
              <img
                src="/nano_banana_coffee.png"
                alt="Nano Banana Coffee Gourmet"
                className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-[#FFFDF8]/90 backdrop-blur-md p-3 rounded-xl border border-[#EADBC8] text-center shadow-xs">
              <p className="text-xs font-bold text-[#4A352C]">🍌 Nano Banana Coffee — Preparado en vivo</p>
              <p className="text-[10px] text-[#765747]">Fotografía real de nuestro producto de autor</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section: Club Magnolia 🌟 */}
      <section id="club-magnolia" className="py-12 px-4 bg-[#FFFDF8] border-y border-[#EADBC8]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#765747] bg-[#F4D58D]/40 px-3 py-1 rounded-full">
              🌟 Beneficios Exclusivos
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#4A352C] font-serif">
              ¿Por qué ser parte del Club Magnolia?
            </h3>
            <p className="text-xs sm:text-sm text-[#765747] max-w-xl mx-auto">
              Sumate gratis en segundos y empezá a disfrutar de recompensas especiales desde tu primera visita en San Juan.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beneficiosClub.map((b, idx) => (
              <div
                key={idx}
                className="bg-[#FAF5EE] rounded-2xl p-5 border border-[#EADBC8] space-y-3 hover:border-[#765747]/40 transition-all shadow-xs"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FFFDF8] border border-[#EADBC8] flex items-center justify-center shadow-xs">
                  {b.icon}
                </div>
                <h4 className="text-sm font-extrabold text-[#4A352C]">{b.title}</h4>
                <p className="text-xs text-[#765747] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

          {/* Form Join Club */}
          <div className="bg-[#FAF5EE] rounded-2xl border border-[#EADBC8] p-6 max-w-xl mx-auto text-center space-y-4 shadow-soft">
            <h4 className="text-base font-extrabold text-[#4A352C]">
              🎁 ¡Registrate ahora y recibí tu Café de Bienvenida Gratis!
            </h4>
            {joinedClub ? (
              <div className="bg-emerald-100 border border-emerald-300 text-emerald-950 p-4 rounded-xl text-xs space-y-1 font-bold">
                <p className="text-sm">🎉 ¡Felicitaciones! Ya sos parte del Club Magnolia.</p>
                <p className="font-normal text-[11px]">Presentá tu teléfono al pedir en cualquiera de nuestras sucursales de San Juan.</p>
              </div>
            ) : (
              <form onSubmit={handleJoinClub} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input
                  type="tel"
                  required
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                  placeholder="Tu celular WhatsApp (ej. 264...)"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#EADBC8] bg-[#FFFDF8] text-xs focus:outline-none focus:ring-2 focus:ring-[#765747]/30 font-bold"
                />
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-[#765747] text-[#FFFDF8] font-bold text-xs hover:bg-[#4A352C] transition-all shadow-soft whitespace-nowrap"
                >
                  Unirme al Club
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Promotions Section 🥐🍰 */}
      <section className="py-12 px-4 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#765747] bg-[#F4D58D]/40 px-3 py-1 rounded-full">
            🥐 Promociones Especiales
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#4A352C] font-serif">
            Promociones del Mes en San Juan
          </h3>
          <p className="text-xs sm:text-sm text-[#765747]">
            Combinaciones preparadas con la mejor calidad gastronómica al mejor precio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {promociones.map((p) => (
            <div
              key={p.id}
              className="bg-[#FFFDF8] rounded-2xl border border-[#EADBC8] p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#765747]/40 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#F4D58D] text-[#765747]">
                    {p.tag}
                  </span>
                  <span className="text-base font-extrabold text-[#765747] font-mono">
                    {formatCurrency(p.price)}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-[#4A352C]">{p.title}</h4>
                <p className="text-xs text-[#765747] leading-relaxed">{p.detail}</p>
              </div>

              <div className="pt-3 border-t border-[#EADBC8]/60 flex items-center justify-between text-[11px] text-[#765747]/80">
                <span className="flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5" /> {p.schedule}
                </span>
                <button
                  onClick={() => navigate('/menu')}
                  className="font-bold text-[#765747] hover:underline"
                >
                  Pedir ahora &gt;
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Branches in San Juan, Argentina 📍🇦🇷 */}
      <section id="sucursales" className="py-12 px-4 bg-[#FFFDF8] border-t border-[#EADBC8]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#765747] bg-[#F4D58D]/40 px-3 py-1 rounded-full">
              📍 Ubicaciones en San Juan
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#4A352C] font-serif">
              Nuestras 3 Sucursales en San Juan, Argentina 🇦🇷
            </h3>
            <p className="text-xs sm:text-sm text-[#765747] max-w-xl mx-auto">
              Te esperamos en nuestros espacios diseñados para vivir la verdadera experiencia del café.
            </p>
          </div>

          {/* Sucursales Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sucursalesSanJuan.map((suc) => {
              const isSelected = selectedSucursalId === suc.id;
              return (
                <div
                  key={suc.id}
                  onClick={() => setSelectedSucursalId(suc.id)}
                  className={`rounded-2xl border p-5 shadow-xs space-y-4 flex flex-col justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#FFFDF8] border-2 border-[#765747] shadow-soft-lg scale-[1.02]'
                      : 'bg-[#FAF5EE] border-[#EADBC8] hover:border-[#765747]/40'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-[#765747] text-[#FFFDF8]' : 'bg-[#EADBC8] text-[#765747]'
                      }`}>
                        {suc.badge}
                      </span>
                      <span className="text-xs font-bold text-[#765747]">{suc.zone}</span>
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-[#4A352C]">{suc.name}</h4>
                      <p className="text-xs text-[#765747] mt-1 font-medium flex items-start gap-1">
                        <MapPin className="w-4 h-4 shrink-0 text-[#765747] mt-0.5" />
                        <span>{suc.address}</span>
                      </p>
                    </div>

                    <div className="space-y-1 text-xs text-[#765747]/90 pt-2 border-t border-[#EADBC8]/60">
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#765747]" /> {suc.phone}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#765747]" /> {suc.hours}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {suc.features.map((f, i) => (
                        <span key={i} className="text-[9px] font-bold bg-[#FFFDF8] text-[#765747] px-2 py-0.5 rounded border border-[#EADBC8]">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/menu');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#765747] text-[#FFFDF8] font-bold text-xs hover:bg-[#4A352C] transition-all text-center shadow-xs flex items-center justify-center gap-1"
                  >
                    <Store className="w-3.5 h-3.5 text-[#F4D58D]" /> Pedir en esta sucursal
                  </button>
                </div>
              );
            })}
          </div>

          {/* Interactive Google Map Preview Container for Selected Branch */}
          {(() => {
            const activeSuc = sucursalesSanJuan.find((s) => s.id === selectedSucursalId) || sucursalesSanJuan[0];
            const mapInfo = sucursalesMapDetails[activeSuc.id];

            return (
              <div className="bg-[#FAF5EE] rounded-3xl border-2 border-[#EADBC8] p-6 shadow-soft space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#EADBC8] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#765747] text-[#FFFDF8] flex items-center justify-center font-bold text-lg shadow-xs">
                      📍
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#765747] bg-[#F4D58D] px-2.5 py-0.5 rounded-full">
                        Mapa Interactivo en Vivo
                      </span>
                      <h4 className="text-base font-extrabold text-[#4A352C] mt-0.5">{activeSuc.name}</h4>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeSuc.name + ' ' + activeSuc.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-4 rounded-xl bg-[#765747] text-[#FFFDF8] font-bold text-xs hover:bg-[#4A352C] transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <MapPin className="w-4 h-4 text-[#F4D58D]" /> Abrir en Google Maps
                  </a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                  {/* Embedded Interactive Map */}
                  <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-[#EADBC8] shadow-inner h-72 sm:h-80 bg-white relative">
                    <iframe
                      title={`Mapa de ${activeSuc.name}`}
                      src={mapInfo.mapUrl}
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>

                  {/* Branch Location Card Info */}
                  <div className="space-y-4 bg-[#FFFDF8] p-5 rounded-2xl border border-[#EADBC8] shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold text-[#765747] uppercase tracking-wider">Dirección Exacta:</span>
                      <p className="text-sm font-extrabold text-[#4A352C] mt-0.5">{activeSuc.address}</p>
                      <p className="text-xs text-[#765747] font-semibold">{activeSuc.zone}</p>
                    </div>

                    <div className="space-y-1 text-xs text-[#765747] pt-3 border-t border-[#EADBC8]">
                      <p className="font-bold text-[#4A352C]">📞 Teléfono para reservas:</p>
                      <p className="font-mono text-xs font-bold text-[#765747]">{activeSuc.phone}</p>
                    </div>

                    <div className="space-y-1 text-xs text-[#765747] pt-3 border-t border-[#EADBC8]">
                      <p className="font-bold text-[#4A352C]">⏰ Horarios de atención:</p>
                      <p className="text-xs font-medium">{activeSuc.hours}</p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => navigate('/menu')}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#765747] text-[#FFFDF8] font-bold text-xs hover:bg-[#4A352C] transition-all shadow-soft flex items-center justify-center gap-2"
                      >
                        <Store className="w-4 h-4 text-[#F4D58D]" /> Pedir Menú Digital en esta Sucursal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#4A352C] text-[#FAF5EE] py-8 px-4 border-t border-[#765747]">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#765747] text-[#FFFDF8] flex items-center justify-center font-bold text-base border border-[#F4D58D]">
              ☕
            </div>
            <h4 className="text-base font-extrabold text-[#FFFDF8]">Café Magnolia San Juan</h4>
          </div>

          <p className="text-xs text-[#FAF5EE]/80 max-w-md mx-auto">
            Cafetería de especialidad, pastelería artesanal y la mejor experiencia de servicio en San Juan, Argentina.
          </p>

          <div className="pt-4 border-t border-[#765747]/60 flex items-center justify-center gap-2 text-xs">
            <span>© 2026 Café Magnolia •</span>
            <a
              href="https://www.growlabs.lat"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#F4D58D] hover:underline flex items-center gap-1"
            >
              <span className="w-4 h-4 rounded-full overflow-hidden border border-[#EADBC8] inline-block shrink-0 bg-white">
                <img src="/logogrow.png" alt="Grow Labs" className="w-full h-full object-cover" />
              </span>
              Diseñado por <span className="text-emerald-300 font-extrabold">Grow Labs</span> 🚀
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
