import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  ShoppingBag,
  Users,
  Scissors,
  Cake,
  Send,
  Instagram,
  ExternalLink,
  Quote,
  Shield,
  MessageCircle,
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { Branch } from '../types';
import * as branchesService from '../services/branches.service';

// ============================================================
// DATA
// ============================================================

const productosDestacados = [
  { name: 'Café Espresso', price: 2400, image: '/products/espresso.svg', category: 'Cafetería', badge: 'Clásico' },
  { name: 'Capuchino', price: 3800, image: '/products/capuchino.svg', category: 'Cafetería', badge: 'Popular' },
  { name: 'Medialunas de Manteca', price: 2800, image: '/products/medialunas.svg', category: 'Pastelería', badge: 'Recién Horneadas' },
  { name: 'Cheesecake de Frutos Rojos', price: 5200, image: '/products/cheesecake.svg', category: 'Pastelería', badge: 'Especialidad' },
  { name: 'Combo Desayuno Magnolia', price: 6800, image: '/products/combo-desayuno.svg', category: 'Combos', badge: 'Más Pedido' },
  { name: 'Hamburguesa Artesanal', price: 8500, image: '/products/hamburguesa.svg', category: 'Almuerzos', badge: 'Gourmet' },
  { name: 'Torta de Chocolate', price: 4800, image: '/products/torta-chocolate.svg', category: 'Pastelería', badge: 'De Autor' },
  { name: 'Limonada Casera', price: 3000, image: '/products/limonada.svg', category: 'Bebidas', badge: 'Fresca' },
];

const testimonios = [
  {
    name: 'Carolina R.',
    role: 'Clienta frecuente',
    text: 'Las medialunas de manteca son las mejores de San Juan. El programa de puntos es un golazo, ya canjeé 3 veces.',
    rating: 5,
  },
  {
    name: 'Martín G.',
    role: 'Socio VIP',
    text: 'El espacio coworking de la sucursal Del Bono es increíble. Café de filtro libre + WiFi rápido = mañanas productivas.',
    rating: 5,
  },
  {
    name: 'Valeria S.',
    role: 'Emprendedora',
    text: 'Los talleres de encordado son hermosos. Aprendí a hacer pulseras y ahora las vendo en mi local. ¡Gracias Hilos de Amor!',
    rating: 5,
  },
];

const beneficiosClub = [
  {
    icon: <Gift className="w-5 h-5" />,
    title: 'Café de Bienvenida Gratis',
    desc: 'Al registrarte recibís un voucher por un espresso de especialidad.',
  },
  {
    icon: <Award className="w-5 h-5" />,
    title: '10% Cashback en Puntos',
    desc: 'Cada compra acumula puntos canjeables por medialunas, tortas o combos.',
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: 'Agasajo de Cumpleaños 2x1',
    desc: 'Porción de pastelería gratis y 2x1 en toda la carta el día de tu cumple.',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Reservas Prioritarias',
    desc: 'Acceso exclusivo a reservas sin espera en Terraza y Coworking.',
  },
  {
    icon: <Wifi className="w-5 h-5" />,
    title: 'Coworking Premium & WiFi',
    desc: 'Tomas de energía, iluminación natural y café de filtro libre.',
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: 'Refill Filtro Sin Cargo',
    desc: 'Refill ilimitado en café de filtro a partir de tu 5ta visita mensual.',
  },
];

const promociones = [
  { title: 'Mañanas de Magnolia', tag: 'Más Vendido', price: 3200, detail: 'Capuchino + 2 Medialunas de manteca.', schedule: '07:00 - 11:00 hs' },
  { title: 'Combo Nano Banana 🍌', tag: 'Novedad', price: 5800, detail: 'Nano Banana Coffee + Cheesecake de frutos rojos.', schedule: 'Todo el día' },
  { title: 'Tarde de Amigos 2x1 🍰', tag: 'Jueves', price: 4100, detail: '2x1 en pastelería artesanal con tu bebida.', schedule: 'Jueves 16-19 hs' },
  { title: 'Combo Executive', tag: 'Coworking', price: 7800, detail: 'Café + Focaccia jamón crudo + Jugo exprimido.', schedule: 'Lun-Vie 12-16 hs' },
];

// ============================================================
// COMPONENT
// ============================================================

export const PromotionalWebsitePage: React.FC = () => {
  const navigate = useNavigate();
  const [joinedClub, setJoinedClub] = useState(false);
  const [memberPhone, setMemberPhone] = useState('');
  const [selectedSuc, setSelectedSuc] = useState<string | null>(null);
  const [productPage, setProductPage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    setIsVisible(true);
    branchesService.getActiveBranches().then((data) => {
      setBranches(data);
      if (data.length > 0) setSelectedSuc(data[0].id);
    });
  }, []);

  const handleJoinClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberPhone) return;
    setJoinedClub(true);
  };

  const productsPerPage = 4;
  const totalPages = Math.ceil(productosDestacados.length / productsPerPage);
  const visibleProducts = productosDestacados.slice(productPage * productsPerPage, (productPage + 1) * productsPerPage);

  const activeSuc = branches.find((s) => s.id === selectedSuc) || branches[0];
  const mainWhatsapp = branches.length > 0 ? branches[0].whatsapp : '';

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#1A2E1E] font-sans selection:bg-[#D8E4C3] overflow-x-hidden">

      {/* ============================================================ */}
      {/* S0: NAVBAR (sticky, responsive) */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 bg-[#FFFDF8]/95 backdrop-blur-lg border-b border-[#D2E0D0]/80 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#2F5233] shadow-sm bg-white shrink-0">
              <img src="/logo_hilos_de_amor.jpg" alt="Hilos de Amor" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-[#1A2E1E] leading-tight flex items-center gap-1.5 font-serif">
                Hilos de Amor
                <span className="hidden sm:inline text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#E2EAC7] text-[#2F5233] border border-[#8FA887]">
                  San Juan 🇦🇷
                </span>
              </h1>
              <a
                href="https://www.growlabs.lat" target="_blank" rel="noopener noreferrer"
                className="hidden sm:flex text-[10px] font-bold text-[#2F5233] hover:underline items-center gap-1"
              >
                <span className="w-3.5 h-3.5 rounded-full overflow-hidden border border-[#D6E2D4] inline-block shrink-0 bg-white">
                  <img src="/logogrow.png" alt="Grow Labs" className="w-full h-full object-cover" />
                </span>
                Diseñado por <span className="text-emerald-900 font-extrabold">Grow Labs</span>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/menu')}
              className="py-2 px-3 sm:px-4 rounded-xl bg-[#2F5233] text-[#FFFDF8] font-bold text-[11px] sm:text-xs hover:bg-[#1A2E1E] transition-all shadow-sm flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#D8E4C3]" /> <span className="hidden xs:inline">Pedir</span> Menú
            </button>
            <button
              onClick={() => navigate('/carta-tradicional')}
              className="hidden md:flex py-2 px-3.5 rounded-xl bg-[#EBF1EA] text-[#1A2E1E] border border-[#D2E0D0] font-bold text-xs hover:bg-[#D2E0D0]/40 transition-colors items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#2F5233]" /> Carta
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* S1: HERO (full screen, responsive) */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F4F7F3] via-[#FFFDF8] to-[#E8EFE6]" />
        <div className="absolute top-20 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-[#D8E4C3]/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-[#F4D58D]/15 rounded-full blur-3xl" />

        <div className={`relative max-w-6xl mx-auto px-4 py-16 sm:py-24 lg:py-32 text-center space-y-6 sm:space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-[#2F5233] bg-[#D8E4C3]/40 px-3.5 py-1.5 rounded-full border border-[#D8E4C3]">
            ✨ Pastelería de Autor & Encordado Artesanal
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A2E1E] tracking-tight leading-[1.1] max-w-4xl mx-auto font-serif">
            Cada bocado, un <span className="text-[#2F5233]">hilo de amor</span> que conecta lo artesanal con vos
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-[#2F5233] max-w-2xl mx-auto font-medium leading-relaxed">
            Pastelería artesanal, café de especialidad y talleres de encordado en San Juan, Argentina. Viví la experiencia de lo hecho con cariño.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="#club"
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-[#2F5233] text-[#FFFDF8] font-extrabold text-sm hover:bg-[#1A2E1E] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4 text-[#D8E4C3]" /> Sumate al Club
            </a>
            <a
              href="#productos"
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-[#FFFDF8] text-[#1A2E1E] border-2 border-[#D2E0D0] font-bold text-sm hover:bg-[#EBF1EA] transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-[#2F5233]" /> Ver Productos
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-[#D8E4C3] border-2 border-[#FFFDF8] flex items-center justify-center text-[10px] font-bold text-[#2F5233]">
                  {['SM', 'CA', 'MG', 'VR', 'LP'][i - 1]}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-3.5 h-3.5 fill-[#F4D58D] text-[#F4D58D]" />)}
              </div>
              <p className="text-[11px] text-[#2F5233] font-bold">+1.200 socios en San Juan</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S2: QUÉ HACEMOS — Dos Pilares */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 px-4 bg-[#F4F7F3] border-y border-[#D2E0D0]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#2F5233] bg-[#D8E4C3]/40 px-3 py-1 rounded-full">
              Nuestra Esencia
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A2E1E] font-serif">
              Dos pasiones, un solo lugar
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Pilar 1: Pastelería */}
            <div className="group bg-[#FFFDF8] rounded-3xl border border-[#D2E0D0] p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300 space-y-4 hover:border-[#2F5233]/30">
              <div className="w-14 h-14 rounded-2xl bg-[#E2EAC7] border border-[#D8E4C3] flex items-center justify-center">
                <Cake className="w-7 h-7 text-[#2F5233]" />
              </div>
              <h4 className="text-xl sm:text-2xl font-extrabold text-[#1A2E1E] font-serif">Pastelería de Autor</h4>
              <p className="text-sm text-[#2F5233] leading-relaxed">
                Medialunas de manteca pura horneadas cada mañana, cheesecakes artesanales, tortas de chocolate belga y café de especialidad 100% arábica. Todo hecho en casa, sin conservantes, con ingredientes seleccionados de San Juan.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {['Café de Especialidad', 'Medialunas', 'Cheesecakes', 'Tortas de Autor'].map((t) => (
                  <span key={t} className="text-[10px] font-bold bg-[#E2EAC7] text-[#2F5233] px-2.5 py-1 rounded-full border border-[#D8E4C3]">
                    ✓ {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Pilar 2: Encordado */}
            <div className="group bg-[#FFFDF8] rounded-3xl border border-[#D2E0D0] p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300 space-y-4 hover:border-[#2F5233]/30">
              <div className="w-14 h-14 rounded-2xl bg-[#F4D58D]/30 border border-[#F4D58D]/60 flex items-center justify-center">
                <Scissors className="w-7 h-7 text-[#765747]" />
              </div>
              <h4 className="text-xl sm:text-2xl font-extrabold text-[#1A2E1E] font-serif">Encordado Artesanal</h4>
              <p className="text-sm text-[#2F5233] leading-relaxed">
                Talleres presenciales de macramé, pulseras tejidas y accesorios con hilos de algodón egipcio. Aprendé una nueva técnica mientras disfrutás un café. Ideales para grupos, cumpleaños y después del trabajo.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {['Macramé', 'Pulseras Tejidas', 'Talleres Grupales', 'Materiales Premium'].map((t) => (
                  <span key={t} className="text-[10px] font-bold bg-[#F4D58D]/30 text-[#765747] px-2.5 py-1 rounded-full border border-[#F4D58D]/60">
                    ✓ {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S3: PRODUCTOS DESTACADOS (carousel/grid, responsive) */}
      {/* ============================================================ */}
      <section id="productos" className="py-16 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#765747] bg-[#F4D58D]/30 px-3 py-1 rounded-full">
                🥐 Nuestra Carta
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E1E] font-serif">Productos Destacados</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setProductPage((p) => Math.max(0, p - 1))}
                disabled={productPage === 0}
                className="w-9 h-9 rounded-xl border border-[#D2E0D0] flex items-center justify-center hover:bg-[#EBF1EA] disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-[#2F5233]" />
              </button>
              <span className="text-xs font-bold text-[#2F5233]">{productPage + 1}/{totalPages}</span>
              <button
                onClick={() => setProductPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={productPage === totalPages - 1}
                className="w-9 h-9 rounded-xl border border-[#D2E0D0] flex items-center justify-center hover:bg-[#EBF1EA] disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4 text-[#2F5233]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {visibleProducts.map((p, idx) => (
              <div
                key={p.name}
                className="group bg-[#FFFDF8] rounded-2xl border border-[#D2E0D0] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:border-[#2F5233]/30 flex flex-col"
              >
                <div className="relative bg-[#F4F7F3] p-4 sm:p-6 flex items-center justify-center h-32 sm:h-40">
                  <img src={p.image} alt={p.name} className="w-16 sm:w-20 h-16 sm:h-20 object-contain group-hover:scale-110 transition-transform duration-300" />
                  <span className="absolute top-2 right-2 text-[9px] font-extrabold bg-[#2F5233] text-[#FFFDF8] px-2 py-0.5 rounded-full">
                    {p.badge}
                  </span>
                </div>
                <div className="p-3 sm:p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#2F5233]/70 uppercase tracking-wider">{p.category}</span>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1A2E1E] leading-tight">{p.name}</h4>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm sm:text-base font-extrabold text-[#2F5233] font-mono">{formatCurrency(p.price)}</span>
                    <button
                      onClick={() => navigate('/menu')}
                      className="text-[10px] font-bold text-[#765747] hover:text-[#2F5233] transition-colors"
                    >
                      Pedir →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => navigate('/menu')}
              className="py-3 px-6 rounded-xl bg-[#EBF1EA] text-[#1A2E1E] border border-[#D2E0D0] font-bold text-xs hover:bg-[#D2E0D0]/50 transition-all inline-flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-[#2F5233]" /> Ver Carta Completa
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S4: PRODUCTO ESTRELLA — Nano Banana Coffee */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-[#FFFDF8] to-[#F4F7F3]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#FFFDF8] rounded-3xl border-2 border-[#F4D58D] p-6 sm:p-10 shadow-lg grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center relative overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#F4D58D]/15 rounded-full blur-3xl" />

            <div className="space-y-4 relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#765747] bg-[#F4D58D] px-3 py-1 rounded-full shadow-xs">
                  🍌 Lanzamiento 2026
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                  Edición de Autor
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A2E1E] font-serif">
                Nano Banana Coffee ☕🍌
              </h3>

              <p className="text-xs sm:text-sm text-[#765747] leading-relaxed font-medium">
                Doble espresso 100% arábica emulsionado con crema aterciopelada de banana orgánica, terminado con canela y cacao amargo. Una experiencia única.
              </p>

              <div className="bg-[#FAF5EE] p-4 rounded-2xl border border-[#EADBC8] flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#765747]">Precio lanzamiento:</span>
                <span className="text-2xl font-extrabold text-[#765747] font-mono">{formatCurrency(4500)}</span>
              </div>

              <button
                onClick={() => navigate('/menu')}
                className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-[#765747] text-[#FFFDF8] font-bold text-sm hover:bg-[#4A352C] transition-all shadow-md flex items-center justify-center gap-2"
              >
                Probalo hoy <ArrowRight className="w-4 h-4 text-[#F4D58D]" />
              </button>
            </div>

            <div className="relative group order-first lg:order-last">
              <div className="rounded-2xl overflow-hidden border-2 border-[#EADBC8] shadow-lg bg-[#FAF5EE]">
                <img
                  src="/nano_banana_coffee.png" alt="Nano Banana Coffee"
                  className="w-full h-56 sm:h-72 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute bottom-3 left-3 right-3 bg-[#FFFDF8]/90 backdrop-blur-md p-2.5 rounded-xl border border-[#EADBC8] text-center">
                <p className="text-[11px] font-bold text-[#4A352C]">🍌 Preparado en vivo por nuestros baristas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S5: CLUB DE BENEFICIOS */}
      {/* ============================================================ */}
      <section id="club" className="py-16 sm:py-20 px-4 bg-[#1A2E1E] text-[#FFFDF8]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#F4D58D]">
              🌟 Club de Beneficios
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#FFFDF8] font-serif">
              ¿Por qué ser parte del Club?
            </h3>
            <p className="text-xs sm:text-sm text-[#D8E4C3] max-w-xl mx-auto">
              Registrate gratis y empezá a disfrutar desde tu primera visita.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {beneficiosClub.map((b, idx) => (
              <div
                key={idx}
                className="bg-[#FFFDF8]/[0.06] backdrop-blur-sm rounded-2xl p-5 border border-[#FFFDF8]/10 space-y-3 hover:bg-[#FFFDF8]/[0.1] hover:border-[#F4D58D]/30 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#2F5233] border border-[#FFFDF8]/10 flex items-center justify-center text-[#F4D58D]">
                  {b.icon}
                </div>
                <h4 className="text-sm font-extrabold text-[#FFFDF8]">{b.title}</h4>
                <p className="text-xs text-[#D8E4C3]/80 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

          {/* Registration Form */}
          <div className="bg-[#FFFDF8]/[0.08] backdrop-blur-sm rounded-2xl border border-[#FFFDF8]/10 p-6 sm:p-8 max-w-lg mx-auto text-center space-y-4">
            <h4 className="text-base sm:text-lg font-extrabold text-[#FFFDF8]">
              🎁 Registrate y recibí tu Café Gratis
            </h4>
            {joinedClub ? (
              <div className="bg-emerald-900/50 border border-emerald-500/30 text-emerald-100 p-4 rounded-xl text-xs space-y-1 font-bold">
                <p className="text-sm">🎉 ¡Ya sos parte del Club!</p>
                <p className="font-normal text-[11px] text-emerald-200/80">Presentá tu teléfono en caja en cualquier sucursal.</p>
              </div>
            ) : (
              <form onSubmit={handleJoinClub} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input
                  type="tel" required
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                  placeholder="Tu celular WhatsApp (264...)"
                  className="flex-1 px-4 py-3 rounded-xl border border-[#FFFDF8]/20 bg-[#FFFDF8]/10 text-[#FFFDF8] text-xs font-bold placeholder:text-[#D8E4C3]/50 focus:outline-none focus:ring-2 focus:ring-[#F4D58D]/40"
                />
                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-[#F4D58D] text-[#1A2E1E] font-extrabold text-xs hover:bg-[#e8c96f] transition-all shadow-md whitespace-nowrap"
                >
                  Unirme Gratis
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S6: PROMOCIONES DEL MES */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#765747] bg-[#F4D58D]/30 px-3 py-1 rounded-full">
              🥐 Promociones
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E1E] font-serif">
              Promociones del Mes
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {promociones.map((p, idx) => (
              <div
                key={idx}
                className="bg-[#FFFDF8] rounded-2xl border border-[#D2E0D0] p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-[#2F5233]/30 hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#F4D58D] text-[#765747]">
                      {p.tag}
                    </span>
                    <span className="text-base font-extrabold text-[#2F5233] font-mono">{formatCurrency(p.price)}</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-extrabold text-[#1A2E1E]">{p.title}</h4>
                  <p className="text-xs text-[#2F5233]/80 leading-relaxed">{p.detail}</p>
                </div>
                <div className="pt-3 border-t border-[#D2E0D0]/60 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 font-semibold text-[#765747]">
                    <Clock className="w-3.5 h-3.5" /> {p.schedule}
                  </span>
                  <button onClick={() => navigate('/menu')} className="font-bold text-[#2F5233] hover:underline">
                    Pedir →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S7: TESTIMONIOS */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 px-4 bg-[#F4F7F3] border-y border-[#D2E0D0]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#2F5233] bg-[#D8E4C3]/40 px-3 py-1 rounded-full">
              💬 Testimonios
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E1E] font-serif">
              Lo que dicen nuestros socios
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonios.map((t, idx) => (
              <div
                key={idx}
                className="bg-[#FFFDF8] rounded-2xl border border-[#D2E0D0] p-5 sm:p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <Quote className="w-8 h-8 text-[#D8E4C3]" />
                <p className="text-xs sm:text-sm text-[#2F5233] leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center justify-between pt-3 border-t border-[#D2E0D0]/60">
                  <div>
                    <p className="text-xs font-extrabold text-[#1A2E1E]">{t.name}</p>
                    <p className="text-[10px] text-[#2F5233]/70">{t.role}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#F4D58D] text-[#F4D58D]" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S8: SUCURSALES + MAPA */}
      {/* ============================================================ */}
      <section id="sucursales" className="py-16 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#765747] bg-[#F4D58D]/30 px-3 py-1 rounded-full">
              📍 Ubicaciones
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E1E] font-serif">
              Nuestras {branches.length} Sucursales en San Juan 🇦🇷
            </h3>
          </div>

          {/* Sucursales Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {branches.map((suc) => {
              const isActive = selectedSuc === suc.id;
              return (
                <div
                  key={suc.id}
                  onClick={() => setSelectedSuc(suc.id)}
                  className={`rounded-2xl border p-4 sm:p-5 space-y-3 cursor-pointer transition-all duration-300 ${
                    isActive
                      ? 'bg-[#FFFDF8] border-2 border-[#2F5233] shadow-lg scale-[1.02]'
                      : 'bg-[#F4F7F3] border-[#D2E0D0] hover:border-[#2F5233]/30 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      isActive ? 'bg-[#2F5233] text-[#FFFDF8]' : 'bg-[#D8E4C3] text-[#2F5233]'
                    }`}>
                      {suc.badge}
                    </span>
                    <span className="text-[11px] font-bold text-[#2F5233]">{suc.zone}</span>
                  </div>

                  <h4 className="text-sm font-extrabold text-[#1A2E1E]">{suc.name}</h4>
                  <p className="text-[11px] text-[#2F5233] flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {suc.address}
                  </p>

                  <div className="space-y-1 text-[11px] text-[#2F5233]/80 pt-2 border-t border-[#D2E0D0]/60">
                    <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {suc.phone}</p>
                    <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> {suc.hours}</p>
                  </div>

                  {/* WhatsApp + Instagram links */}
                  <div className="flex items-center gap-2 pt-1">
                    {suc.whatsapp && (
                      <a
                        href={`https://wa.me/${suc.whatsapp}?text=${encodeURIComponent('¡Hola! Quiero hacer un pedido 🍰')}`}
                        target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-green-600 text-white font-bold text-[10px] hover:bg-green-700 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </a>
                    )}
                    {suc.instagram && (
                      <a
                        href={`https://instagram.com/${suc.instagram}`}
                        target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-[10px] hover:opacity-90 transition-opacity"
                      >
                        <Instagram className="w-3 h-3" /> Instagram
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {suc.features.map((f) => (
                      <span key={f} className="text-[9px] font-bold bg-[#FFFDF8] text-[#2F5233] px-2 py-0.5 rounded border border-[#D2E0D0]">
                        ✓ {f}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); navigate('/menu'); }}
                    className="w-full py-2 px-3 rounded-xl bg-[#2F5233] text-[#FFFDF8] font-bold text-[11px] hover:bg-[#1A2E1E] transition-all text-center flex items-center justify-center gap-1"
                  >
                    <Store className="w-3.5 h-3.5 text-[#D8E4C3]" /> Pedir aquí
                  </button>
                </div>
              );
            })}
          </div>

          {/* Interactive Map */}
          {activeSuc && (
            <div className="bg-[#FFFDF8] rounded-3xl border border-[#D2E0D0] p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2F5233] text-[#FFFDF8] flex items-center justify-center font-bold text-lg">📍</div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#765747] bg-[#F4D58D] px-2.5 py-0.5 rounded-full">
                      Mapa Interactivo
                    </span>
                    <h4 className="text-sm font-extrabold text-[#1A2E1E] mt-0.5">{activeSuc.name}</h4>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeSuc.mapQuery || activeSuc.name + ' ' + activeSuc.address + ' San Juan Argentina')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="py-2 px-4 rounded-xl bg-[#2F5233] text-[#FFFDF8] font-bold text-xs hover:bg-[#1A2E1E] transition-all shadow-xs flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#D8E4C3]" /> Abrir en Maps
                </a>
              </div>

              <div className="rounded-2xl overflow-hidden border border-[#D2E0D0] h-56 sm:h-72 lg:h-80 bg-[#F4F7F3]">
                <iframe
                  title={`Mapa de ${activeSuc.name}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(activeSuc.mapQuery || activeSuc.address + ' San Juan Argentina')}&z=15&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOOTER */}
      {/* ============================================================ */}
      <footer className="bg-[#1A2E1E] text-[#FFFDF8] py-10 sm:py-14 px-4 border-t border-[#2F5233]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#F4D58D] bg-white">
                  <img src="/logo_hilos_de_amor.jpg" alt="Hilos de Amor" className="w-full h-full object-cover" />
                </div>
                <h4 className="text-base font-extrabold font-serif">Hilos de Amor</h4>
              </div>
              <p className="text-xs text-[#D8E4C3]/70 leading-relaxed">
                Pastelería artesanal, café de especialidad y talleres de encordado en San Juan, Argentina.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-[#F4D58D]">Acceso Rápido</h5>
              <ul className="space-y-2 text-xs text-[#D8E4C3]/80">
                <li><a href="#productos" className="hover:text-[#FFFDF8] transition-colors">Productos</a></li>
                <li><a href="#club" className="hover:text-[#FFFDF8] transition-colors">Club de Beneficios</a></li>
                <li><a href="#sucursales" className="hover:text-[#FFFDF8] transition-colors">Sucursales</a></li>
                <li><button onClick={() => navigate('/menu')} className="hover:text-[#FFFDF8] transition-colors">Menú Digital</button></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-[#F4D58D]">Contacto</h5>
              <ul className="space-y-2 text-xs text-[#D8E4C3]/80">
                <li className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> (264) 422-8900</li>
                <li className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> San Juan, Argentina</li>
                <li className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Lun-Dom 07:00 - 23:00</li>
              </ul>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-[#F4D58D]">Pedí ahora</h5>
              <button
                onClick={() => navigate('/menu')}
                className="w-full py-3 px-4 rounded-xl bg-[#2F5233] text-[#FFFDF8] font-bold text-xs border border-[#FFFDF8]/10 hover:bg-[#3a6a3e] transition-all flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-[#D8E4C3]" /> Abrir Menú Digital
              </button>
              <button
                onClick={() => navigate('/carta-tradicional')}
                className="w-full py-2.5 px-4 rounded-xl border border-[#FFFDF8]/10 text-[#D8E4C3] font-bold text-xs hover:bg-[#FFFDF8]/5 transition-all flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Ver Carta Tradicional
              </button>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-6 border-t border-[#FFFDF8]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#D8E4C3]/60">
            <span>© 2026 Hilos de Amor • Pastelería & Encordado • San Juan, Argentina</span>
            <a
              href="https://www.growlabs.lat" target="_blank" rel="noopener noreferrer"
              className="font-bold text-[#F4D58D] hover:underline flex items-center gap-1"
            >
              <span className="w-4 h-4 rounded-full overflow-hidden border border-[#F4D58D]/30 inline-block shrink-0 bg-white">
                <img src="/logogrow.png" alt="Grow Labs" className="w-full h-full object-cover" />
              </span>
              Diseñado por <span className="text-emerald-400 font-extrabold">Grow Labs</span> 🚀
            </a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      {mainWhatsapp && (
        <a
          href={`https://wa.me/${mainWhatsapp}?text=${encodeURIComponent('¡Hola! Quiero hacer un pedido 🍰')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          title="Escribinos por WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute right-full mr-3 whitespace-nowrap py-1.5 px-3 rounded-lg bg-[#1A2E1E] text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            ¡Escribinos! 💬
          </span>
        </a>
      )}
    </div>
  );
};
