import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coffee, Sparkles, MapPin, Clock, Phone, Gift, Award, ChevronRight, Wifi, Zap,
  Star, BookOpen, Smartphone, Heart, ChevronLeft, ShoppingBag, Scissors, Cake,
  Send, Instagram, ExternalLink, MessageCircle, ArrowRight
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { Branch, SiteSection } from '../types';
import * as branchesService from '../services/branches.service';
import * as siteContentService from '../services/siteContent.service';

// ============================================================
// DATA & COLLAGES (Modelo B Premium)
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

const BAKERY_COLLAGE = [
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
];

const MACRAME_COLLAGE = [
  'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1528458909336-e7a0adfac1d5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80',
];

export interface PromotionalWebsitePageProps {
  customContent?: Record<string, string>;
  isEditorMode?: boolean;
  onSelectSection?: (section: SiteSection) => void;
  activeSection?: SiteSection;
}

export const PromotionalWebsitePage: React.FC<PromotionalWebsitePageProps> = ({
  customContent,
  isEditorMode,
  onSelectSection,
  activeSection,
}) => {
  const navigate = useNavigate();
  const [joinedClub, setJoinedClub] = useState(false);
  const [memberPhone, setMemberPhone] = useState('');
  const [selectedSuc, setSelectedSuc] = useState<string | null>(null);
  const [productPage, setProductPage] = useState(0);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [fetchedContent, setFetchedContent] = useState<Record<string, string>>({});

  useEffect(() => {
    branchesService.getActiveBranches().then((data) => {
      setBranches(data);
      if (data.length > 0) setSelectedSuc(data[0].id);
    });
    if (!customContent) {
      siteContentService.getContentMap().then((map) => setFetchedContent(map));
    }
  }, [customContent]);

  const content = customContent || fetchedContent;

  const heroBadge = content.hero_badge || '✨ Pastelería de Autor & Encordado Artesanal';
  const heroTitle = content.hero_title || 'PASTELERÍA DE AUTOR & ENCORDADO ARTESANAL EN SAN JUAN';
  const heroSubtitle = content.hero_subtitle || 'Donde el sabor se encuentra con el arte';
  const heroCtaPrimary = content.hero_cta_primary || 'DESCUBRE NUESTRA COLECCIÓN';

  const aboutTitle = content.about_title || 'Dos pasiones, un solo lugar';
  const aboutPillar1Title = content.about_pillar1_title || 'Sabores Auténticos';
  const aboutPillar1Desc = content.about_pillar1_desc || 'Recetas de pastelería gourmet de autor, mascarpone, frutos rojos de San Juan y café de especialidad 100% arábica.';
  const aboutPillar2Title = content.about_pillar2_title || 'Encordado Único';
  const aboutPillar2Desc = content.about_pillar2_desc || 'Textiles de fibra natural, talleres presenciales de macramé y accesorios confeccionados con hilos de algodón egipcio.';

  const offersTitle = content.offers_title || '🔥 Ofertas Especiales del Día';
  const offersSubtitle = content.offers_subtitle || 'Aprovechá descuentos exclusivos por tiempo limitado';
  const offer1Name = content.offer1_name || 'Combo Medialunas 2x1 🥐';
  const offer1Desc = content.offer1_desc || 'Llevate 6 medialunas calentitas de manteca pura con tu espresso.';
  const offer1Price = content.offer1_price || '2800';
  const offer1Badge = content.offer1_badge || '🔥 50% OFF';
  const offer1Image = content.offer1_image || BAKERY_COLLAGE[1];

  const recTitle = content.rec_title || '⭐ Recomendaciones del Chef Barista';
  const recSubtitle = content.rec_subtitle || 'Nuestra selección exclusiva de especialidades de autor';
  const rec1Name = content.rec1_name || 'Cheesecake Frutos del Valle 🍰';
  const rec1Desc = content.rec1_desc || 'Mermelada artesanal de frutos rojos de San Juan sobre masa sablee crocante.';
  const rec1Price = content.rec1_price || '5200';
  const rec1Badge = content.rec1_badge || '👑 Favorito';
  const rec1Image = content.rec1_image || BAKERY_COLLAGE[3];

  const clubTitle = content.club_title || 'Sumate a nuestro Club de Fidelidad';
  const clubSubtitle = content.club_subtitle || 'Acumulá puntos en cada consumo, accedé a beneficios exclusivos en tu cumpleaños y disfrutá de refill ilimitado en café de filtro.';

  const footerDesc = content.footer_desc || 'Pastelería artesanal, café de especialidad y talleres de encordado en San Juan, Argentina.';
  const footerCopyright = content.footer_copyright || '© 2026 Hilos de Amor • Gourmet & Artesanal • San Juan, Argentina';

  const handleJoinClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberPhone) return;
    setJoinedClub(true);
  };

  const productsPerPage = 4;
  const totalPages = Math.ceil(productosDestacados.length / productsPerPage);
  const visibleProducts = productosDestacados.slice(productPage * productsPerPage, (productPage + 1) * productsPerPage);

  const activeSuc = branches.find((s) => s.id === selectedSuc) || branches[0];

  return (
    <div className="min-h-screen bg-[#0F2417] text-[#FAFAF7] font-sans selection:bg-[#E5C378] selection:text-[#0F2417]">
      {/* ============================================================ */}
      {/* LUXURY NAVBAR (Modelo B Premium) */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 bg-[#0F2417]/95 backdrop-blur-md border-b border-[#E5C378]/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Nav Links Left */}
          <nav className="hidden lg:flex items-center gap-6 text-[11px] font-bold tracking-widest text-[#E5C378] uppercase">
            <a href="#inicio" className="hover:text-white transition-colors border-b-2 border-[#E5C378] pb-0.5">INICIO</a>
            <a href="#pasteleria" className="hover:text-white transition-colors">PASTELERÍA</a>
            <a href="#artesanias" className="hover:text-white transition-colors">ARTESANÍAS</a>
          </nav>

          {/* Centered Monogram Logo */}
          <div
            onClick={() => navigate('/sitio-promocional')}
            className="cursor-pointer flex flex-col items-center group text-center"
          >
            <div className="flex items-center gap-2">
              <span className="font-serif italic text-2xl font-extrabold text-[#E5C378] tracking-widest group-hover:scale-105 transition-transform">
                H&A
              </span>
            </div>
            <h1 className="text-xs font-extrabold text-[#FAFAF7] uppercase tracking-[0.25em] font-serif leading-tight">
              HILOS DE AMOR
            </h1>
            <p className="text-[9px] font-serif italic text-[#C5A059] tracking-wider">
              Gourmet & Artesanal • San Juan
            </p>
          </div>

          {/* Nav Links Right */}
          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden lg:flex items-center gap-6 text-[11px] font-bold tracking-widest text-[#E5C378] uppercase">
              <a href="#nosotros" className="hover:text-white transition-colors">SOBRE NOSOTROS</a>
              <a href="#contacto" className="hover:text-white transition-colors">CONTACTO</a>
            </nav>

            <button
              onClick={() => navigate('/menu')}
              className="py-2 px-4 rounded-full bg-[#E5C378] hover:bg-[#d4b064] text-[#0F2417] font-extrabold text-xs tracking-wider uppercase transition-all shadow-md flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#0F2417]" /> Menú Digital
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* S1: HERO BANNER LUXURY (Modelo B Premium) */}
      {/* ============================================================ */}
      <section id="inicio" className="relative py-20 sm:py-32 px-4 overflow-hidden border-b border-[#E5C378]/20">
        {/* Background Image with Dark Emerald Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=80"
            alt="Hilos de Amor Workshop"
            className="w-full h-full object-cover opacity-25 filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F2417] via-[#0F2417]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-block">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.2em] text-[#E5C378] bg-[#1A3825]/90 px-4 py-1.5 rounded-full border border-[#E5C378]/40 shadow-md">
              {heroBadge}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#FAFAF7] font-serif uppercase tracking-[0.08em] leading-tight max-w-4xl mx-auto drop-shadow-md">
            {heroTitle}
          </h2>

          <p className="text-sm sm:text-lg text-[#C5A059] italic font-serif max-w-2xl mx-auto tracking-wide">
            {heroSubtitle}
          </p>

          <div className="pt-4 flex justify-center">
            <a
              href="#coleccion"
              className="py-3.5 px-8 sm:px-10 rounded-full bg-[#E5C378] hover:bg-[#D4AF37] text-[#0F2417] font-extrabold text-xs sm:text-sm tracking-[0.15em] uppercase transition-all shadow-xl hover:scale-105 inline-flex items-center gap-2"
            >
              {heroCtaPrimary} <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S2: TWO FEATURE COLLAGES (Modelo B Premium Grid) */}
      {/* ============================================================ */}
      <section id="coleccion" className="py-16 sm:py-24 px-4 bg-[#142C1E] border-b border-[#E5C378]/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          
          {/* LEFT FEATURE: PASTELERÍA GOURMET */}
          <div className="bg-[#0F2417] rounded-3xl p-6 sm:p-8 border border-[#E5C378]/30 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-3">
              <img src={BAKERY_COLLAGE[0]} alt="Pastelería 1" className="rounded-2xl h-40 w-full object-cover shadow-md border border-[#E5C378]/20 hover:scale-102 transition-transform" />
              <img src={BAKERY_COLLAGE[1]} alt="Pastelería 2" className="rounded-2xl h-40 w-full object-cover shadow-md border border-[#E5C378]/20 hover:scale-102 transition-transform" />
              <img src={BAKERY_COLLAGE[2]} alt="Pastelería 3" className="rounded-2xl h-36 w-full object-cover shadow-md border border-[#E5C378]/20 hover:scale-102 transition-transform" />
              <img src={BAKERY_COLLAGE[3]} alt="Pastelería 4" className="rounded-2xl h-36 w-full object-cover shadow-md border border-[#E5C378]/20 hover:scale-102 transition-transform" />
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#C5A059]">
                PASTELERÍA GOURMET
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#FAFAF7] font-serif">
                {aboutPillar1Title}
              </h3>
              <p className="text-xs sm:text-sm text-[#C5A059]/90 leading-relaxed font-serif">
                {aboutPillar1Desc}
              </p>
              <a
                href="#productos"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#E5C378] hover:text-white uppercase tracking-wider transition-colors pt-1"
              >
                Ver Pasteles <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* RIGHT FEATURE: ARTESANÍA DE AUTOR */}
          <div className="bg-[#0F2417] rounded-3xl p-6 sm:p-8 border border-[#E5C378]/30 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-3">
              <img src={MACRAME_COLLAGE[0]} alt="Encordado 1" className="rounded-2xl h-40 w-full object-cover shadow-md border border-[#E5C378]/20 hover:scale-102 transition-transform" />
              <img src={MACRAME_COLLAGE[1]} alt="Encordado 2" className="rounded-2xl h-40 w-full object-cover shadow-md border border-[#E5C378]/20 hover:scale-102 transition-transform" />
              <img src={MACRAME_COLLAGE[2]} alt="Encordado 3" className="rounded-2xl h-36 w-full object-cover shadow-md border border-[#E5C378]/20 hover:scale-102 transition-transform" />
              <img src={MACRAME_COLLAGE[3]} alt="Encordado 4" className="rounded-2xl h-36 w-full object-cover shadow-md border border-[#E5C378]/20 hover:scale-102 transition-transform" />
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#C5A059]">
                ARTESANÍA DE AUTOR
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#FAFAF7] font-serif">
                {aboutPillar2Title}
              </h3>
              <p className="text-xs sm:text-sm text-[#C5A059]/90 leading-relaxed font-serif">
                {aboutPillar2Desc}
              </p>
              <a
                href="#contacto"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#E5C378] hover:text-white uppercase tracking-wider transition-colors pt-1"
              >
                Ver Encordado & Talleres <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* S3: OFERTAS & RECOMENDADOS (Luxury Cards) */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 px-4 bg-[#0F2417] border-b border-[#E5C378]/20">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* OFERTAS */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.2em] text-[#0F2417] bg-[#E5C378] px-3.5 py-1 rounded-full shadow-md">
                {offersTitle}
              </span>
              <p className="text-xs sm:text-sm text-[#C5A059] font-serif italic">{offersSubtitle}</p>
            </div>

            <div className="max-w-xl mx-auto bg-[#173322] rounded-3xl border border-[#E5C378]/40 p-5 sm:p-7 shadow-xl flex flex-col sm:flex-row items-center gap-5">
              <img src={offer1Image} alt={offer1Name} className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-md shrink-0 border border-[#E5C378]/30" />
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-[10px] font-extrabold bg-[#E5C378] text-[#0F2417] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {offer1Badge}
                  </span>
                </div>
                <h4 className="text-lg font-extrabold text-[#FAFAF7] font-serif">{offer1Name}</h4>
                <p className="text-xs text-[#C5A059] leading-relaxed">{offer1Desc}</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
                  <span className="text-xl font-extrabold text-[#E5C378] font-mono">{formatCurrency(parseInt(offer1Price) || 2800)}</span>
                  <button
                    onClick={() => navigate('/menu')}
                    className="py-2 px-4 rounded-full bg-[#E5C378] text-[#0F2417] text-xs font-extrabold hover:bg-[#D4AF37] transition-all uppercase tracking-wider shadow-sm"
                  >
                    Pedir Oferta
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RECOMENDADOS */}
          <div className="space-y-6 pt-6 border-t border-[#E5C378]/20">
            <div className="text-center space-y-2">
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.2em] text-[#E5C378] bg-[#1A3825] px-3.5 py-1 rounded-full border border-[#E5C378]/40">
                {recTitle}
              </span>
              <p className="text-xs sm:text-sm text-[#C5A059] font-serif italic">{recSubtitle}</p>
            </div>

            <div className="max-w-xl mx-auto bg-[#173322] rounded-3xl border border-[#E5C378]/40 p-5 sm:p-7 shadow-xl flex flex-col sm:flex-row items-center gap-5">
              <img src={rec1Image} alt={rec1Name} className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-md shrink-0 border border-[#E5C378]/30" />
              <div className="space-y-2 text-center sm:text-left flex-1">
                <span className="text-[10px] font-extrabold bg-[#C5A059] text-[#0F2417] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {rec1Badge}
                </span>
                <h4 className="text-lg font-extrabold text-[#FAFAF7] font-serif">{rec1Name}</h4>
                <p className="text-xs text-[#C5A059] leading-relaxed">{rec1Desc}</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
                  <span className="text-xl font-extrabold text-[#E5C378] font-mono">{formatCurrency(parseInt(rec1Price) || 5200)}</span>
                  <button
                    onClick={() => navigate('/menu')}
                    className="py-2 px-4 rounded-full border border-[#E5C378] text-[#E5C378] hover:bg-[#E5C378] hover:text-[#0F2417] text-xs font-extrabold transition-all uppercase tracking-wider shadow-sm"
                  >
                    Probar Recomendado
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* S4: CLUB FIDELIZACIÓN (Luxury Gold Card) */}
      {/* ============================================================ */}
      <section id="club" className="py-16 sm:py-24 px-4 bg-[#142C1E] border-b border-[#E5C378]/20">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#173322] via-[#0F2417] to-[#1A3825] rounded-3xl p-8 sm:p-12 border-2 border-[#E5C378]/50 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#E5C378]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="inline-block">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#0F2417] bg-[#E5C378] px-3.5 py-1 rounded-full shadow-md">
              👑 CLUB DE SOCIOS
            </span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-extrabold text-[#FAFAF7] font-serif uppercase tracking-wider">
            {clubTitle}
          </h3>

          <p className="text-xs sm:text-base text-[#C5A059] font-serif italic max-w-xl mx-auto">
            {clubSubtitle}
          </p>

          <form onSubmit={handleJoinClub} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="tel"
              value={memberPhone}
              onChange={(e) => setMemberPhone(e.target.value)}
              placeholder="Ingresá tu WhatsApp (+54...)"
              className="flex-1 px-4 py-3.5 rounded-full bg-[#0F2417] border border-[#E5C378]/40 text-xs text-white placeholder:text-[#C5A059]/60 focus:outline-none focus:border-[#E5C378]"
            />
            <button
              type="submit"
              className="py-3.5 px-8 rounded-full bg-[#E5C378] hover:bg-[#D4AF37] text-[#0F2417] font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              Registrarme
            </button>
          </form>

          {joinedClub && (
            <div className="bg-emerald-900/60 border border-emerald-500 text-emerald-200 p-3 rounded-2xl text-xs font-bold animate-fade-in">
              ¡Bienvenido al Club! En breve te enviaremos tu voucher por WhatsApp. 🎁
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOOTER LUXURY (Modelo B Premium) */}
      {/* ============================================================ */}
      <footer id="contacto" className="py-12 px-4 bg-[#0A1A10] text-[#C5A059] border-t border-[#E5C378]/20 text-center space-y-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-col items-center justify-center">
            <span className="font-serif italic text-3xl font-extrabold text-[#E5C378]">H&A</span>
            <h4 className="text-xs font-extrabold text-[#FAFAF7] uppercase tracking-[0.25em] font-serif mt-1">HILOS DE AMOR</h4>
            <p className="text-[10px] italic text-[#C5A059] mt-0.5">{footerDesc}</p>
          </div>

          <div className="pt-4 border-t border-[#E5C378]/10 text-[11px] font-mono text-[#C5A059]/70 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>{footerCopyright}</span>
            <a
              href="https://www.growlabs.lat"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1 font-bold"
            >
              Diseñado por <strong className="text-[#E5C378]">Grow Labs</strong> ✨
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
