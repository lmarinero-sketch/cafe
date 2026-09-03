import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, ArrowLeft, Search, Star, Sparkles, BookOpen, Smartphone, Download, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/currency';
import { PrintableMenuModal } from '../components/menu/PrintableMenuModal';

export const TraditionalMenuPage: React.FC = () => {
  const { products, categories } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(`cat-sec-${catId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F3] text-[#1A2E1E] font-sans pb-20 max-w-md mx-auto relative border-x border-[#D2E0D0] shadow-soft-lg selection:bg-[#D2E0D0]">
      {/* Mobile Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#D2E0D0] p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => navigate('/menu')}
            className="p-2 rounded-xl bg-[#EBF1EA] text-[#2F5233] hover:bg-[#D2E0D0]/50 transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#2F5233] text-[#FFFDF8] hover:bg-[#1A2E1E] transition-colors flex items-center gap-1.5 text-xs font-bold shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Descargar Carta PDF
          </button>
        </div>

        {/* Traditional Menu Brand Header */}
        <div className="text-center py-2 space-y-1">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#2F5233] mx-auto shadow-soft bg-white">
            <img src="/logo_hilos_de_amor.jpg" alt="Hilos de Amor" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-extrabold text-[#1A2E1E] tracking-tight font-serif">Hilos de Amor</h1>
          <p className="text-xs text-[#2F5233] font-serif italic">Pastelería Artesanal & Encordado</p>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#2F5233]/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en el menú..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#D2E0D0] bg-[#EBF1EA] text-xs focus:outline-none focus:ring-2 focus:ring-[#2F5233]/30"
          />
        </div>
      </header>

      {/* Category Jumper Index (Horizontal Scroll) */}
      <nav className="sticky top-[152px] z-30 bg-[#EBF1EA] border-b border-[#D2E0D0] px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-xs">
        <button
          onClick={() => scrollToCategory('all')}
          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeCategory === 'all'
              ? 'bg-[#2F5233] text-[#FFFDF8] shadow-xs'
              : 'bg-[#FFFFFF] text-[#1A2E1E] border border-[#D2E0D0]'
          }`}
        >
          Todo el Menú
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => scrollToCategory(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-[#2F5233] text-[#FFFDF8] shadow-xs'
                : 'bg-[#FFFFFF] text-[#1A2E1E] border border-[#D2E0D0]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </nav>

      {/* Traditional Menu Body */}
      <main className="p-4 space-y-8">
        {categories.map((cat) => {
          const catProducts = products.filter((p) => {
            const matchesCat = p.categoryId === cat.id;
            const matchesSearch =
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
          });

          if (catProducts.length === 0) return null;

          return (
            <section key={cat.id} id={`cat-sec-${cat.id}`} className="space-y-4 scroll-mt-48">
              {/* Traditional Category Divider Header */}
              <div className="text-center space-y-1 py-2 border-b-2 border-[#2F5233]/20">
                <h2 className="text-base font-extrabold text-[#2F5233] uppercase tracking-widest font-serif">
                  — {cat.name} —
                </h2>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {catProducts.map((item) => {
                  const isOut = !item.isAvailable;
                  return (
                    <article
                      key={item.id}
                      className={`bg-[#FFFFFF] rounded-2xl p-4 border shadow-xs transition-all ${
                        isOut ? 'border-rose-200 opacity-75' : 'border-[#D2E0D0]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-[#1A2E1E]">{item.name}</h3>
                            {item.isComposite && (
                              <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-1.5 py-0.2 rounded">
                                📦 Combo
                              </span>
                            )}
                            {item.isFeatured && !isOut && !item.isComposite && (
                              <span className="text-[9px] bg-[#D8E4C3] text-[#2F5233] font-extrabold px-1.5 py-0.2 rounded">
                                ★ Destacado
                              </span>
                            )}
                            {isOut && (
                              <span className="text-[9px] bg-rose-100 text-rose-800 font-extrabold px-1.5 py-0.2 rounded">
                                Agotado
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#2F5233]/90 leading-relaxed font-serif">
                            {item.description}
                          </p>
                          {item.isComposite && item.compositeItems && item.compositeItems.length > 0 && (
                            <p className="text-[11px] text-amber-900 font-bold bg-amber-50 p-1.5 rounded-lg border border-amber-200/70">
                              Incluye: {item.compositeItems.map((ci) => `${ci.quantity}x ${ci.productName}`).join(' + ')}
                            </p>
                          )}
                        </div>

                        {/* Price Display */}
                        <div className="text-right shrink-0">
                          <span className="text-sm font-extrabold text-[#2F5233] font-mono">
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                      </div>

                      {/* Product Image preview */}
                      <div className="mt-3 pt-3 border-t border-[#D2E0D0]/50 flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className={`w-14 h-14 rounded-xl object-cover bg-[#EBF1EA] border border-[#D2E0D0] ${
                            isOut ? 'grayscale opacity-75' : ''
                          }`}
                        />
                        <div className="text-[10px] text-[#2F5233]/80 space-y-0.5">
                          <p className="font-semibold">Disponible para:</p>
                          <p className="capitalize font-mono">
                            {item.channels.join(' • ')}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Read-only Traditional Footer Notice */}
        <footer className="bg-[#EBF1EA] rounded-2xl border border-[#D2E0D0] p-4 text-center space-y-3">
          <p className="text-xs font-bold text-[#1A2E1E]">📖 Menú de Lectura Tradicional</p>
          <p className="text-[11px] text-[#2F5233]/80 leading-relaxed">
            Si querés realizar un pedido directamente desde tu celular, utilizá el Menú Interactivo de Pedidos o descargá la carta en PDF para imprimir.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="py-2.5 px-4 rounded-xl border border-[#2F5233] text-[#2F5233] bg-white font-bold text-xs hover:bg-[#D8E4C3]/40 transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-[#2F5233]" /> Descargar / Imprimir Carta (PDF)
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="py-2.5 px-4 rounded-xl bg-[#2F5233] text-[#FFFDF8] font-bold text-xs hover:bg-[#1A2E1E] transition-colors shadow-soft"
            >
              Ir al Menú Interactivo de Pedidos
            </button>
          </div>
          <div className="pt-2 border-t border-[#D2E0D0]/60">
            <a
              href="https://www.growlabs.lat"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-[#2F5233] hover:text-[#1A2E1E] hover:underline inline-flex items-center gap-1"
            >
              Diseñado por <span className="text-emerald-900 font-extrabold">Grow Labs</span> 🚀
            </a>
          </div>
        </footer>
      </main>

      {/* Modal de Impresión / PDF */}
      <PrintableMenuModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
};

