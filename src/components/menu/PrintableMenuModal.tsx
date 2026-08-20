import React, { useRef } from 'react';
import { X, Printer, Download, Sparkles, Coffee, BookOpen, QrCode } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/currency';

interface PrintableMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableMenuModal: React.FC<PrintableMenuModalProps> = ({ isOpen, onClose }) => {
  const { categories, products } = useApp();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const publicLink = `${window.location.origin}/menu`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      {/* Container Dialog */}
      <div className="bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#E5DEC9] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-[#2C221E]">
        
        {/* Modal Toolbar (Hidden during print) */}
        <div className="bg-[#1A2E1E] text-white p-4 flex items-center justify-between shadow-md print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2F5233] rounded-xl">
              <BookOpen className="w-5 h-5 text-[#D8E4C3]" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#FFFDF8]">Carta Física para Imprimir / PDF</h2>
              <p className="text-xs text-[#D8E4C3]/80">Vista previa del documento en formato A4 optimizado</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#2F5233] hover:bg-[#3D6943] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all transform active:scale-95"
            >
              <Printer className="w-4 h-4" /> Imprimir / Guardar PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F4EFDF]/40 print:p-0 print:overflow-visible print:bg-white">
          
          {/* Print Style Injector */}
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-menu-area, #printable-menu-area * {
                visibility: visible;
              }
              #printable-menu-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 0;
                background-color: #FAF7F2 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              @page {
                size: A4 portrait;
                margin: 10mm;
              }
              .page-break-inside-avoid {
                break-inside: avoid;
                page-break-inside: avoid;
              }
            }
          `}</style>

          {/* Printable Document Sheet */}
          <div
            id="printable-menu-area"
            ref={printRef}
            className="bg-[#FAF7F2] text-[#2C221E] font-sans p-6 sm:p-10 rounded-xl shadow-lg border border-[#E0D8C3] max-w-[800px] mx-auto space-y-8 print:shadow-none print:border-none print:rounded-none"
          >
            {/* Header section with AI generated banner image */}
            <div className="space-y-4 text-center">
              <div className="relative rounded-2xl overflow-hidden shadow-sm border border-[#D2C5A5] h-48 sm:h-56 bg-[#2F5233]">
                <img
                  src="/menu_header_banner.jpg"
                  alt="Hilos de Amor Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E1E]/90 via-[#1A2E1E]/30 to-transparent flex flex-col justify-end p-6 text-white text-left">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#D8E4C3] bg-[#2F5233]/70 backdrop-blur-md px-3 py-1 rounded-full w-fit mb-1 border border-[#D8E4C3]/40">
                    Pastelería Artesanal & Encordado
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif text-[#FFFDF8] drop-shadow-sm">
                    Hilos de Amor
                  </h1>
                </div>
              </div>

              {/* Sub-header info bar */}
              <div className="flex flex-wrap items-center justify-between border-y-2 border-[#2F5233]/20 py-2.5 px-2 text-xs text-[#2F5233] font-semibold">
                <div className="flex items-center gap-1.5">
                  <Coffee className="w-4 h-4 text-[#2F5233]" />
                  <span>Cafetería de Especialidad</span>
                </div>
                <span>•</span>
                <div>
                  <span>San Juan, Argentina</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Productos 100% Frescos & Elaborados en el Día</span>
                </div>
              </div>
            </div>

            {/* Featured Showcase Highlight with second AI Image */}
            <div className="bg-[#EBF1EA] border border-[#C6D8C2] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-xs page-break-inside-avoid">
              <img
                src="/menu_artisan_coffee.jpg"
                alt="Café & Tostones Especialidad"
                className="w-full sm:w-36 h-28 object-cover rounded-xl border border-[#B3CBAE] shrink-0"
              />
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-[#2F5233]">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Recomendación de la Casa</span>
                </div>
                <h3 className="font-serif font-bold text-sm text-[#1A2E1E]">
                  Experiencia de Especialidad & Tostones en Pan de Masa Madre
                </h3>
                <p className="text-xs text-[#2F5233]/85 leading-relaxed italic">
                  Acompañá tus momentos con nuestro espresso extraído al punto justo y panadería recién horneada.
                </p>
              </div>
            </div>

            {/* Menu Items Grouped by Category */}
            <div className="space-y-8">
              {categories.map((cat) => {
                const catProducts = products.filter((p) => p.categoryId === cat.id && p.isAvailable);
                if (catProducts.length === 0) return null;

                return (
                  <section key={cat.id} className="space-y-4 page-break-inside-avoid">
                    {/* Category Divider Title */}
                    <div className="flex items-center gap-3">
                      <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#2F5233]/40" />
                      <h2 className="text-sm font-extrabold uppercase tracking-widest text-[#2F5233] font-serif px-3 py-1 bg-[#EBF1EA] border border-[#C6D8C2] rounded-lg">
                        {cat.name}
                      </h2>
                      <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#2F5233]/40" />
                    </div>

                    {/* Products Grid (2 columns on medium screens / print) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                      {catProducts.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white/80 p-3 rounded-xl border border-[#E0D8C3] flex flex-col justify-between hover:border-[#2F5233]/40 transition-colors shadow-2xs page-break-inside-avoid"
                        >
                          <div className="space-y-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="font-bold text-xs text-[#1A2E1E] flex items-center gap-1">
                                {item.name}
                                {item.isFeatured && (
                                  <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-1 rounded">
                                    ★
                                  </span>
                                )}
                              </span>
                              <span className="font-mono font-extrabold text-xs text-[#2F5233] shrink-0">
                                {formatCurrency(item.price)}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-[11px] text-[#554740] font-serif leading-snug">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            {/* Footer with QR Code & Branding */}
            <div className="pt-6 border-t-2 border-[#2F5233]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left page-break-inside-avoid">
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-[#1A2E1E]">
                  <QrCode className="w-4 h-4 text-[#2F5233]" />
                  <span>Escaneá para Pedir desde tu Celular</span>
                </div>
                <p className="text-[11px] text-[#2F5233]/80 font-serif">
                  Ingresá a nuestro menú interactivo: <span className="font-mono font-bold text-[#1A2E1E]">{publicLink}</span>
                </p>
              </div>

              <div className="text-right shrink-0 bg-[#EBF1EA] px-4 py-2 rounded-xl border border-[#C6D8C2]">
                <p className="text-[10px] text-[#2F5233]/80 font-bold uppercase tracking-wider">
                  Hilos de Amor • 2026
                </p>
                <p className="text-[10px] text-[#1A2E1E] font-extrabold">
                  Desarrollado con Grow Labs 🚀
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#FAF7F2] border-t border-[#E5DEC9] p-4 flex items-center justify-between text-xs text-[#765747] print:hidden">
          <span>💡 Consejo: Selecciona "Guardar como PDF" en el menú de impresión de tu navegador.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#D2C5A5] text-[#2C221E] font-bold hover:bg-[#EBF1EA] transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
