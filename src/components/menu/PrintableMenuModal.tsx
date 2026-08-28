import React, { useRef } from 'react';
import { X, Printer, Download, Sparkles, Coffee, BookOpen, QrCode, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/currency';
import { Category, Product } from '../../types';

interface PrintableMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableMenuModal: React.FC<PrintableMenuModalProps> = ({ isOpen, onClose }) => {
  const { categories, products } = useApp();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const publicLink = `${window.location.origin}/menu`;

  // Helper to generate a 100% reliable, self-contained, high-resolution HTML printable document
  const generateMenuPrintHTML = (cats: Category[], prods: Product[], link: string) => {
    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Carta Menú - Hilos de Amor</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap');
            
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }

            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
              background-color: #FAF7F2;
              color: #2C221E;
              padding: 20px;
              line-height: 1.4;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .sheet {
              max-width: 820px;
              margin: 0 auto;
              background: #FAF7F2;
            }

            /* Header */
            .header-banner {
              background: linear-gradient(135deg, #122315 0%, #244128 100%);
              color: #FFFDF8;
              border-radius: 20px;
              padding: 28px 24px;
              text-align: center;
              margin-bottom: 20px;
              border: 2px solid #D8E4C3;
              box-shadow: 0 4px 15px rgba(0,0,0,0.06);
            }

            .badge {
              display: inline-block;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #244128;
              background-color: #D8E4C3;
              padding: 4px 14px;
              border-radius: 20px;
              margin-bottom: 8px;
            }

            .title {
              font-family: 'Playfair Display', serif;
              font-size: 36px;
              font-weight: 800;
              color: #FFFDF8;
              letter-spacing: -0.5px;
              margin-bottom: 4px;
            }

            .subtitle {
              font-size: 12px;
              color: #E2EAD2;
              font-weight: 600;
              letter-spacing: 0.5px;
            }

            .sub-info-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 2px solid #2F5233;
              border-bottom: 2px solid #2F5233;
              padding: 8px 12px;
              margin-bottom: 24px;
              font-size: 11px;
              font-weight: 700;
              color: #2F5233;
              background-color: #EBF1EA;
              border-radius: 8px;
            }

            /* Highlight Showcase */
            .showcase-box {
              background-color: #F3EBDD;
              border: 1px solid #D8CBB6;
              border-left: 4px solid #765747;
              border-radius: 12px;
              padding: 12px 16px;
              margin-bottom: 24px;
              font-size: 11px;
              color: #4A352C;
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .showcase-box strong {
              color: #1A2E1E;
              font-size: 12px;
            }

            /* Categories */
            .category-section {
              margin-bottom: 28px;
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .category-header {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 14px;
            }

            .category-header .line {
              flex: 1;
              height: 2px;
              background: #2F5233;
              opacity: 0.3;
            }

            .category-title {
              font-family: 'Playfair Display', serif;
              font-size: 15px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #FFF;
              background-color: #2F5233;
              padding: 4px 16px;
              border-radius: 20px;
            }

            /* Products Grid */
            .products-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }

            .product-card {
              background-color: #FFFFFF;
              border: 1px solid #E0D8C3;
              border-radius: 12px;
              padding: 10px 12px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .product-header {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              gap: 8px;
              margin-bottom: 4px;
            }

            .product-name {
              font-size: 12px;
              font-weight: 700;
              color: #1A2E1E;
            }

            .product-star {
              color: #D97706;
              font-size: 10px;
              font-weight: 800;
            }

            .product-price {
              font-family: monospace;
              font-size: 13px;
              font-weight: 800;
              color: #2F5233;
              white-space: nowrap;
            }

            .product-desc {
              font-size: 10.5px;
              color: #6B5B52;
              line-height: 1.3;
            }

            /* Footer */
            .menu-footer {
              margin-top: 32px;
              padding-top: 16px;
              border-top: 2px solid #2F5233;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              color: #2F5233;
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .footer-left strong {
              color: #1A2E1E;
            }

            .footer-right {
              text-align: right;
              font-weight: 700;
            }

            @media print {
              body {
                background: #FAF7F2 !important;
                padding: 0 !important;
              }
              @page {
                size: A4 portrait;
                margin: 12mm 10mm 12mm 10mm;
              }
              .page-break-inside-avoid {
                break-inside: avoid;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <!-- Header Banner -->
            <div class="header-banner">
              <div class="badge">Pastelería & Cafetería de Especialidad</div>
              <h1 class="title">Hilos de Amor</h1>
              <p class="subtitle">Carta de Salón • San Juan, Argentina</p>
            </div>

            <!-- Sub Header -->
            <div class="sub-info-bar">
              <span>☕ Granos 100% Arábica Seleccionados</span>
              <span>•</span>
              <span>🥐 Elaboración 100% Artesanal y Fresca del Día</span>
              <span>•</span>
              <span>✨ Club de Puntos Activo</span>
            </div>

            <!-- Showcase -->
            <div class="showcase-box">
              <strong>✨ Experiencia Hilos de Amor:</strong> Todos nuestros cafés son calibrados a diario y extraídos en el punto justo. Consultá a nuestro personal por opciones sin TACC y leches vegetales.
            </div>

            <!-- Categories and Products -->
            ${cats
              .map((cat) => {
                const catProds = prods.filter((p) => p.categoryId === cat.id);
                if (catProds.length === 0) return '';

                return `
                  <div class="category-section">
                    <div class="category-header">
                      <div class="line"></div>
                      <h2 class="category-title">${cat.name}</h2>
                      <div class="line"></div>
                    </div>

                    <div class="products-grid">
                      ${catProds
                        .map(
                          (item) => `
                        <div class="product-card">
                          <div>
                            <div class="product-header">
                              <span class="product-name">
                                ${item.name}
                                ${item.isFeatured ? '<span class="product-star">★</span>' : ''}
                              </span>
                              <span class="product-price">$ ${item.price.toLocaleString('es-AR')}</span>
                            </div>
                            ${item.description ? `<p class="product-desc">${item.description}</p>` : ''}
                          </div>
                        </div>
                      `
                        )
                        .join('')}
                    </div>
                  </div>
                `;
              })
              .join('')}

            <!-- Footer -->
            <div class="menu-footer">
              <div class="footer-left">
                <p>📱 <strong>Menú Digital Interactivo:</strong> ${link}</p>
                <p style="color: #6B5B52; font-size: 10px; margin-top: 2px;">Escaneá el código QR en la mesa para pedir o consultar promociones.</p>
              </div>
              <div class="footer-right">
                <p>HILOS DE AMOR • 2026</p>
                <p style="font-size: 9.5px; color: #765747;">Precios con IVA incluido en Pesos Argentinos (ARS)</p>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    // Open clean isolated print window (eliminates any React modal flexbox/fixed clipping issues)
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const htmlContent = generateMenuPrintHTML(categories, products, publicLink);
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else {
      // Fallback to in-window print if popup was blocked
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in print:static print:block print:inset-auto print:overflow-visible print:bg-white print:p-0">
      {/* Container Dialog */}
      <div className="bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#E5DEC9] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-[#2C221E] print:max-h-none print:w-full print:block print:overflow-visible print:border-none print:shadow-none print:bg-transparent">
        
        {/* Modal Toolbar (Hidden during print) */}
        <div className="bg-[#1A2E1E] text-white p-4 flex items-center justify-between shadow-md print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2F5233] rounded-xl">
              <BookOpen className="w-5 h-5 text-[#D8E4C3]" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#FFFDF8] font-serif">Carta Física para Imprimir / PDF</h2>
              <p className="text-xs text-[#D8E4C3]/80">Formato A4 optimizado con todos los productos y precios actualizados ({products.length} productos)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all transform active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Descargar PDF</span>
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

        {/* Scrollable Modal Body (On-screen visual preview) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F4EFDF]/40 print:overflow-visible print:p-0 print:block print:bg-transparent">
          
          {/* Printable Document Sheet */}
          <div
            id="printable-menu-area"
            ref={printRef}
            className="bg-[#FAF7F2] text-[#2C221E] font-sans p-6 sm:p-10 rounded-xl shadow-lg border border-[#E0D8C3] max-w-[800px] mx-auto space-y-8"
          >
            {/* Header section */}
            <div className="space-y-4 text-center">
              <div className="bg-gradient-to-br from-[#122315] via-[#244128] to-[#122315] rounded-2xl p-8 text-white text-center shadow-sm border-2 border-[#D8E4C3]">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#244128] bg-[#D8E4C3] px-3 py-1 rounded-full inline-block mb-2">
                  Pastelería Artesanal & Cafetería de Especialidad
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif text-[#FFFDF8] drop-shadow-sm">
                  Hilos de Amor
                </h1>
                <p className="text-xs text-[#E2EAD2] font-semibold mt-1">
                  Carta Oficial de Salón • San Juan, Argentina
                </p>
              </div>

              {/* Sub-header info bar */}
              <div className="flex flex-wrap items-center justify-between border-y-2 border-[#2F5233]/20 py-2.5 px-3 text-xs text-[#2F5233] font-bold bg-[#EBF1EA] rounded-lg">
                <div className="flex items-center gap-1.5">
                  <Coffee className="w-4 h-4 text-[#2F5233]" />
                  <span>Granos 100% Arábica</span>
                </div>
                <span>•</span>
                <div>
                  <span>San Juan, Argentina</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Elaboración Fresca del Día</span>
                </div>
              </div>
            </div>

            {/* Menu Items Grouped by Category */}
            <div className="space-y-8">
              {categories.map((cat) => {
                const catProducts = products.filter((p) => p.categoryId === cat.id);
                if (catProducts.length === 0) return null;

                return (
                  <section key={cat.id} className="space-y-4">
                    {/* Category Divider Title */}
                    <div className="flex items-center gap-3">
                      <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#2F5233]/40" />
                      <h2 className="text-sm font-extrabold uppercase tracking-widest text-white font-serif px-4 py-1.5 bg-[#2F5233] rounded-full shadow-xs">
                        {cat.name}
                      </h2>
                      <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#2F5233]/40" />
                    </div>

                    {/* Products Grid (2 columns on medium screens / print) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {catProducts.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white p-3.5 rounded-xl border border-[#E0D8C3] flex flex-col justify-between hover:border-[#2F5233]/40 transition-colors shadow-xs"
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
            <div className="pt-6 border-t-2 border-[#2F5233]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-[#1A2E1E]">
                  <QrCode className="w-4 h-4 text-[#2F5233]" />
                  <span>Menú Digital Interactivo</span>
                </div>
                <p className="text-[11px] text-[#2F5233]/80 font-serif">
                  Ingresá desde tu celular: <span className="font-mono font-bold text-[#1A2E1E]">{publicLink}</span>
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
        <div className="bg-[#FAF7F2] border-t border-[#E5DEC9] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#765747] print:hidden">
          <span>💡 Al hacer clic en "Imprimir / Descargar PDF", se abrirá el generador de PDF en alta resolución listo para imprimir o guardar.</span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" /> Descargar PDF
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-[#D2C5A5] text-[#2C221E] font-bold hover:bg-[#EBF1EA] transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
