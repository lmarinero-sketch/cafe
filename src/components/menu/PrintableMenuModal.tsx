import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  BookOpen,
  FileText,
  Settings2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/currency';
import { Category, Product } from '../../types';

interface PrintableMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ComboPosition = 'top' | 'after-cafeteria' | 'bottom' | 'inline' | 'hidden';

interface MenuPrintConfig {
  comboPosition: ComboPosition;
  categoryOrder: string[];
  hiddenCategoryIds: string[];
  title: string;
  subtitle: string;
  experienceText: string;
  footerNote: string;
  repeatHeaderOnAllPages: boolean;
}

const STORAGE_KEY = 'hilos_de_amor_printable_menu_config';

export const PrintableMenuModal: React.FC<PrintableMenuModalProps> = ({ isOpen, onClose }) => {
  const { categories, products } = useApp();
  const printRef = useRef<HTMLDivElement>(null);

  const [showConfig, setShowConfig] = useState(false);
  const [wordExportSuccess, setWordExportSuccess] = useState(false);

  // Configuration state
  const [config, setConfig] = useState<MenuPrintConfig>(() => {
    const defaultConfig: MenuPrintConfig = {
      comboPosition: 'top',
      categoryOrder: categories.map((c) => c.id),
      hiddenCategoryIds: [],
      title: 'Hilos de Amor',
      subtitle: 'Maison de Café de Especialidad & Pastelería de Autor',
      experienceText:
        'Todos nuestros productos son elaborados artesanalmente en el día, honrando la tradición repostera con materias primas de excelencia.',
      footerNote: 'Precios expresados en Pesos Argentinos (ARS) • IVA Incluido',
      repeatHeaderOnAllPages: true,
    };

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const currentIds = categories.map((c) => c.id);
        const savedOrder = Array.isArray(parsed.categoryOrder) ? parsed.categoryOrder : [];
        const mergedOrder = [
          ...savedOrder.filter((id: string) => currentIds.includes(id)),
          ...currentIds.filter((id) => !savedOrder.includes(id)),
        ];

        return {
          ...defaultConfig,
          ...parsed,
          repeatHeaderOnAllPages: parsed.repeatHeaderOnAllPages !== undefined ? parsed.repeatHeaderOnAllPages : true,
          categoryOrder: mergedOrder.length > 0 ? mergedOrder : defaultConfig.categoryOrder,
        };
      }
    } catch {
      // fallback to default
    }
    return defaultConfig;
  });

  // Keep categoryOrder in sync if categories change
  useEffect(() => {
    const currentIds = categories.map((c) => c.id);
    setConfig((prev) => {
      const existing = prev.categoryOrder.filter((id) => currentIds.includes(id));
      const missing = currentIds.filter((id) => !existing.includes(id));
      if (existing.length + missing.length !== prev.categoryOrder.length) {
        return { ...prev, categoryOrder: [...existing, ...missing] };
      }
      return prev;
    });
  }, [categories]);

  // Persist configuration in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('Could not save menu print config', e);
    }
  }, [config]);

  if (!isOpen) return null;

  // Helper to detect if a product is a combo
  const isProductCombo = (p: Product) => {
    return (
      Boolean(p.isComposite) ||
      p.categoryId === 'combos' ||
      p.categoryName?.toLowerCase().includes('combo') ||
      p.name.toLowerCase().startsWith('combo ') ||
      p.name.toLowerCase().startsWith('promo ')
    );
  };

  // Extract combos & sorted categories
  const allCombos = products.filter((p) => p.isAvailable && isProductCombo(p));

  // Ordered categories based on config
  const orderedCategories = config.categoryOrder
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is Category => c !== undefined && !config.hiddenCategoryIds.includes(c.id));

  // Category products helper: if comboPosition !== 'inline', remove combos from category list
  const getProductsForCategory = (catId: string) => {
    return products.filter((p) => {
      if (!p.isAvailable || p.categoryId !== catId) return false;
      if (config.comboPosition !== 'inline' && isProductCombo(p)) return false;
      return true;
    });
  };

  // Reorder categories handlers
  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...config.categoryOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setConfig((prev) => ({ ...prev, categoryOrder: newOrder }));
  };

  const toggleCategoryVisibility = (catId: string) => {
    setConfig((prev) => {
      const isHidden = prev.hiddenCategoryIds.includes(catId);
      return {
        ...prev,
        hiddenCategoryIds: isHidden
          ? prev.hiddenCategoryIds.filter((id) => id !== catId)
          : [...prev.hiddenCategoryIds, catId],
      };
    });
  };

  const resetConfig = () => {
    const defaultConfig: MenuPrintConfig = {
      comboPosition: 'top',
      categoryOrder: categories.map((c) => c.id),
      hiddenCategoryIds: [],
      title: 'Hilos de Amor',
      subtitle: 'Maison de Café de Especialidad & Pastelería de Autor',
      experienceText:
        'Todos nuestros productos son elaborados artesanalmente en el día, honrando la tradición repostera con materias primas de excelencia.',
      footerNote: 'Precios expresados en Pesos Argentinos (ARS) • IVA Incluido',
      repeatHeaderOnAllPages: true,
    };
    setConfig(defaultConfig);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Helper to format Roman numerals for categories
  const toRoman = (num: number): string => {
    const romanMap = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    return romanMap[num - 1] || `${num}.`;
  };

  // =========================================================================
  // LUXURY HAUTE-GASTRONOMIE PRINT HTML (PDF)
  // =========================================================================
  const generateMenuPrintHTML = () => {
    // Render Combos / Maridajes HTML Block
    const renderCombosHTML = () => {
      if (allCombos.length === 0 || config.comboPosition === 'hidden' || config.comboPosition === 'inline') {
        return '';
      }

      return `
        <div class="combos-curated-box">
          <div class="combos-box-inner">
            <div class="combos-crest">✦ &nbsp; SELECCIÓN DE LA CASA &nbsp; ✦</div>
            <h2 class="combos-title">Maridajes & Experiencias de Salón</h2>
            <div class="combos-desc-bar">Combinaciones sugeridas por nuestro barista y maestro pastelero</div>

            <div class="products-grid-curated">
              ${allCombos
                .map(
                  (item) => `
                <div class="product-item-curated">
                  <div class="product-header-line">
                    <span class="product-name-curated">
                      <span class="duo-tag">DÚO</span> ${item.name}
                      ${item.isFeatured ? '<span class="star-accent">✦</span>' : ''}
                    </span>
                    <span class="dot-leader"></span>
                    <span class="product-price-curated">$ ${item.price.toLocaleString('es-AR')}</span>
                  </div>
                  ${item.description ? `<div class="product-desc-curated">${item.description}</div>` : ''}
                  ${
                    item.compositeItems && item.compositeItems.length > 0
                      ? `
                    <div class="combo-composition">
                      <span class="composition-label">Maridaje:</span> ${item.compositeItems
                        .map((ci) => `${ci.quantity > 1 ? ci.quantity + 'x ' : ''}${ci.productName}`)
                        .join(' + ')}
                    </div>
                  `
                      : ''
                  }
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </div>
      `;
    };

    // Render Category HTML Block
    const renderCategoryHTML = (cat: Category, index: number) => {
      const catProds = getProductsForCategory(cat.id);
      if (catProds.length === 0) return '';

      return `
        <div class="category-block">
          <div class="category-header-curated">
            <div class="hairline"></div>
            <h2 class="category-heading">${toRoman(index + 1)}. &nbsp; ${cat.name.toUpperCase()}</h2>
            <div class="hairline"></div>
          </div>

          <div class="products-grid-curated">
            ${catProds
              .map(
                (item) => `
              <div class="product-item-curated">
                <div class="product-header-line">
                  <span class="product-name-curated">
                    ${item.name}
                    ${item.isFeatured ? '<span class="star-accent">✦</span>' : ''}
                  </span>
                  <span class="dot-leader"></span>
                  <span class="product-price-curated">$ ${item.price.toLocaleString('es-AR')}</span>
                </div>
                ${item.description ? `<div class="product-desc-curated">${item.description}</div>` : ''}
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    };

    // Assemble sections in user order
    let bodyCategoriesHTML = '';
    const cafeteriaCat = orderedCategories.find(
      (c) => c.slug === 'cafeteria' || c.name.toLowerCase().includes('café') || c.name.toLowerCase().includes('cafeter')
    );

    if (config.comboPosition === 'top') {
      bodyCategoriesHTML += renderCombosHTML();
      bodyCategoriesHTML += orderedCategories.map((c, i) => renderCategoryHTML(c, i)).join('');
    } else if (config.comboPosition === 'after-cafeteria' && cafeteriaCat) {
      orderedCategories.forEach((cat, i) => {
        bodyCategoriesHTML += renderCategoryHTML(cat, i);
        if (cat.id === cafeteriaCat.id) {
          bodyCategoriesHTML += renderCombosHTML();
        }
      });
    } else if (config.comboPosition === 'bottom') {
      bodyCategoriesHTML += orderedCategories.map((c, i) => renderCategoryHTML(c, i)).join('');
      bodyCategoriesHTML += renderCombosHTML();
    } else {
      // inline or hidden
      bodyCategoriesHTML += orderedCategories.map((c, i) => renderCategoryHTML(c, i)).join('');
    }

    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Carta Menú - ${config.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Montserrat:wght@300;400;500;600;700&display=swap');
            
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }

            @page {
              size: A4 portrait;
              margin: 8mm 9mm 8mm 9mm;
            }

            html, body {
              font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
              background-color: #FAF8F5;
              color: #1A1412;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              line-height: 1.35;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .sheet {
              width: 100%;
              max-width: 100%;
              margin: 0;
              padding: 0;
              background: #FAF8F5;
            }

            /* Main Print Page Table for seamless repeating headers across all pages */
            .print-page-table {
              width: 100%;
              border-collapse: collapse;
              border-spacing: 0;
              margin: 0;
              padding: 0;
              background: transparent;
            }

            .print-page-table > thead {
              display: ${config.repeatHeaderOnAllPages ? 'table-header-group' : 'table-row-group'};
            }

            .print-page-table > tfoot {
              display: table-footer-group;
            }

            .print-page-table > thead > tr > td {
              padding: 0 0 10px 0;
              border: none;
              vertical-align: top;
            }

            .print-page-table > tbody > tr > td {
              padding: 0;
              border: none;
              vertical-align: top;
            }

            .print-page-table > tfoot > tr > td {
              padding: 12px 0 0 0;
              border: none;
              vertical-align: bottom;
            }

            /* Haute Pâtisserie Editorial Header */
            .editorial-header {
              text-align: center;
              padding: 10px 0 6px 0;
              border-bottom: 1.5px solid #C5A880;
              margin-bottom: 12px;
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .crest-tag {
              font-family: 'Montserrat', sans-serif;
              font-size: 8px;
              font-weight: 700;
              letter-spacing: 0.35em;
              text-transform: uppercase;
              color: #A07844;
              margin-bottom: 3px;
            }

            .brand-title {
              font-family: 'Cormorant Garamond', Georgia, serif;
              font-size: 30px;
              font-weight: 700;
              letter-spacing: 0.20em;
              color: #122315;
              text-transform: uppercase;
              margin: 0 0 2px 0;
              line-height: 1.1;
            }

            .brand-subtitle {
              font-family: 'Montserrat', sans-serif;
              font-size: 8.5px;
              font-weight: 500;
              letter-spacing: 0.22em;
              text-transform: uppercase;
              color: #7A6F66;
              margin-bottom: 8px;
            }

            .double-french-rule {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
              margin: 6px auto;
              width: 80%;
            }

            .rule-line {
              flex: 1;
              height: 0.75px;
              background-color: #C5A880;
            }

            .rule-diamond {
              font-size: 8px;
              color: #A07844;
            }

            .editorial-attributes {
              font-family: 'Montserrat', sans-serif;
              font-size: 8px;
              font-weight: 600;
              letter-spacing: 0.16em;
              text-transform: uppercase;
              color: #5C524A;
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 14px;
              margin-top: 5px;
            }

            .editorial-attributes span.bullet {
              color: #C5A880;
              font-size: 9px;
            }

            .experience-quote {
              font-family: 'Cormorant Garamond', Georgia, serif;
              font-style: italic;
              font-size: 11px;
              color: #6E645D;
              text-align: center;
              margin: 6px auto 2px auto;
              max-width: 90%;
              line-height: 1.3;
            }

            /* Combos Curated Box (Haute Box) */
            .combos-curated-box {
              border: 1px solid #C5A880;
              padding: 2.5px;
              margin-bottom: 14px;
              background-color: #FBF8F2;
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .combos-box-inner {
              border: 0.5px solid #D8C3A5;
              padding: 9px 12px;
              text-align: center;
            }

            .combos-crest {
              font-family: 'Montserrat', sans-serif;
              font-size: 7.5px;
              font-weight: 700;
              letter-spacing: 0.28em;
              color: #A07844;
              text-transform: uppercase;
              margin-bottom: 1px;
            }

            .combos-title {
              font-family: 'Cormorant Garamond', Georgia, serif;
              font-size: 14px;
              font-weight: 700;
              letter-spacing: 0.12em;
              text-transform: uppercase;
              color: #122315;
              margin-bottom: 1px;
            }

            .combos-desc-bar {
              font-family: 'Montserrat', sans-serif;
              font-size: 7.5px;
              letter-spacing: 0.08em;
              color: #7A6F66;
              margin-bottom: 8px;
            }

            /* Categories */
            .category-block {
              margin-bottom: 12px;
              break-inside: auto;
              page-break-inside: auto;
            }

            .category-header-curated {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-top: 8px;
              margin-bottom: 6px;
              break-inside: avoid;
              page-break-inside: avoid;
              break-after: avoid;
              page-break-after: avoid;
            }

            .hairline {
              flex: 1;
              height: 0.75px;
              background-color: #C5A880;
              opacity: 0.7;
            }

            .category-heading {
              font-family: 'Cormorant Garamond', Georgia, serif;
              font-size: 13px;
              font-weight: 700;
              letter-spacing: 0.24em;
              text-transform: uppercase;
              color: #122315;
              white-space: nowrap;
            }

            /* Product Grid & Dotted Leaders Layout */
            .products-grid-curated {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 4px 16px;
              width: 100%;
            }

            .product-item-curated {
              padding: 3px 0;
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .product-header-line {
              display: flex;
              align-items: baseline;
              width: 100%;
              gap: 4px;
            }

            .product-name-curated {
              font-family: 'Cormorant Garamond', Georgia, serif;
              font-size: 12px;
              font-weight: 700;
              color: #1A1412;
              white-space: nowrap;
            }

            .star-accent {
              color: #A07844;
              font-size: 9px;
              margin-left: 2px;
            }

            .duo-tag {
              font-family: 'Montserrat', sans-serif;
              font-size: 7px;
              font-weight: 800;
              letter-spacing: 0.1em;
              color: #8A5E2E;
              background: #F3EBDD;
              border: 0.5px solid #D8C3A5;
              padding: 0.5px 3px;
              border-radius: 2px;
              vertical-align: middle;
              margin-right: 3px;
            }

            .dot-leader {
              flex: 1;
              border-bottom: 1px dotted #CBBFB0;
              height: 1px;
              min-width: 10px;
              margin-bottom: 2px;
            }

            .product-price-curated {
              font-family: 'Cormorant Garamond', Georgia, serif;
              font-size: 12.5px;
              font-weight: 700;
              color: #8C6239;
              white-space: nowrap;
            }

            .product-desc-curated {
              font-family: 'Montserrat', sans-serif;
              font-size: 8px;
              font-weight: 400;
              color: #6E645D;
              line-height: 1.25;
              margin-top: 1px;
              padding-right: 6px;
            }

            .combo-composition {
              font-family: 'Montserrat', sans-serif;
              font-size: 7.5px;
              color: #4A423D;
              background: #F4EFE6;
              border-left: 2px solid #C5A880;
              padding: 2px 5px;
              margin-top: 2px;
              line-height: 1.2;
            }

            .composition-label {
              font-weight: 700;
              color: #8C6239;
              text-transform: uppercase;
              font-size: 7px;
              letter-spacing: 0.05em;
            }

            /* Footer */
            .editorial-footer {
              border-top: 1px solid #C5A880;
              padding-top: 6px;
              margin-top: 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-family: 'Montserrat', sans-serif;
              font-size: 8px;
              letter-spacing: 0.08em;
              color: #7A6F66;
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .footer-brand {
              font-family: 'Cormorant Garamond', serif;
              font-weight: 700;
              font-size: 10px;
              letter-spacing: 0.14em;
              text-transform: uppercase;
              color: #122315;
            }

            @media print {
              @page {
                size: A4 portrait;
                margin: 8mm 9mm 8mm 9mm;
              }
              html, body {
                background: #FAF8F5 !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
              }
              .sheet {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .print-page-table {
                width: 100% !important;
              }
              .print-page-table > thead {
                display: ${config.repeatHeaderOnAllPages ? 'table-header-group !important' : 'table-row-group !important'};
              }
              .print-page-table > tfoot {
                display: table-footer-group !important;
              }
              .category-block, .combos-curated-box {
                break-inside: auto !important;
                page-break-inside: auto !important;
              }
              .category-header-curated {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                break-after: avoid !important;
                page-break-after: avoid !important;
              }
              .product-item-curated, .editorial-header, .editorial-footer {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <table class="print-page-table">
              <thead>
                <tr>
                  <td>
                    <!-- Haute Pâtisserie Editorial Header -->
                    <div class="editorial-header">
                      <div class="crest-tag">✦ &nbsp; MAISON DE CAFÉ & HAUTE PÂTISSERIE &nbsp; ✦</div>
                      <h1 class="brand-title">${config.title}</h1>
                      <div class="brand-subtitle">${config.subtitle}</div>

                      <div class="double-french-rule">
                        <div class="rule-line"></div>
                        <div class="rule-diamond">✦</div>
                        <div class="rule-line"></div>
                      </div>

                      <div class="editorial-attributes">
                        <span>Granos 100% Arábica de Altura</span>
                        <span class="bullet">•</span>
                        <span>Cocina Artesanal Libre de Gluten</span>
                        <span class="bullet">•</span>
                        <span>San Juan, Argentina</span>
                      </div>

                      ${
                        config.experienceText
                          ? `
                        <p class="experience-quote">
                          « ${config.experienceText} »
                        </p>
                      `
                          : ''
                      }
                    </div>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <!-- Categories and Combos Content -->
                    ${bodyCategoriesHTML}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>
                    <!-- Footer Tradicional -->
                    <div class="editorial-footer">
                      <div class="footer-brand">${config.title} • Carta Oficial de Salón</div>
                      <div class="footer-note">${config.footerNote}</div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
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

  // =========================================================================
  // LUXURY WORD (.DOC) EXPORT
  // =========================================================================
  const handleExportWord = () => {
    // Helper to generate 2-column editorial Word table with dotted leaders
    const generateWordProductsTable = (items: Product[]) => {
      let rows = '';
      for (let i = 0; i < items.length; i += 2) {
        const item1 = items[i];
        const item2 = items[i + 1];

        const renderCell = (it?: Product) => {
          if (!it) {
            return `<td style="width: 50%; padding: 4pt 8pt; border: none;"></td>`;
          }

          const includesHTML =
            it.compositeItems && it.compositeItems.length > 0
              ? `<div style="font-family: 'Century Gothic', Arial, sans-serif; font-size: 7.5pt; color: #4A423D; background-color: #F4EFE6; border-left: 2pt solid #C5A880; padding: 2pt 5pt; margin-top: 2pt;">
                   <strong style="color: #8C6239;">MARIDAJE:</strong> ${it.compositeItems
                     .map((ci) => `${ci.quantity > 1 ? ci.quantity + 'x ' : ''}${ci.productName}`)
                     .join(' + ')}
                 </div>`
              : '';

          return `
            <td style="width: 50%; padding: 4pt 8pt; vertical-align: top; border: none;">
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 1pt;">
                <tr>
                  <td style="font-family: 'Garamond', Georgia, serif; font-size: 11pt; font-weight: bold; color: #1A1412; text-align: left; padding: 0;">
                    ${it.name} ${it.isFeatured ? '<span style="color: #A07844;">✦</span>' : ''}
                  </td>
                  <td style="border-bottom: 1pt dotted #CBBFB0; width: 30%; padding: 0 4pt;"></td>
                  <td style="font-family: 'Garamond', Georgia, serif; font-size: 11pt; font-weight: bold; color: #8C6239; text-align: right; white-space: nowrap; padding: 0;">
                    $ ${it.price.toLocaleString('es-AR')}
                  </td>
                </tr>
              </table>
              ${
                it.description
                  ? `<div style="font-family: 'Century Gothic', Arial, sans-serif; font-size: 8pt; color: #6E645D; line-height: 1.25; margin-top: 1pt;">${it.description}</div>`
                  : ''
              }
              ${includesHTML}
            </td>
          `;
        };

        rows += `
          <tr>
            ${renderCell(item1)}
            ${renderCell(item2)}
          </tr>
        `;
      }

      return `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8pt;">
          ${rows}
        </table>
      `;
    };

    // Render combos section for Word
    const renderCombosWord = () => {
      if (allCombos.length === 0 || config.comboPosition === 'hidden' || config.comboPosition === 'inline') {
        return '';
      }

      return `
        <div style="border: 1pt solid #C5A880; background-color: #FBF8F2; padding: 3pt; margin-bottom: 12pt;">
          <table style="width: 100%; border: 0.5pt solid #D8C3A5; border-collapse: collapse; padding: 6pt;">
            <tr>
              <td style="text-align: center; padding: 6pt 4pt 4pt 4pt;">
                <div style="font-family: 'Century Gothic', Arial, sans-serif; font-size: 7.5pt; font-weight: bold; letter-spacing: 2pt; color: #A07844;">
                  ✦ SELECCIÓN DE LA CASA ✦
                </div>
                <div style="font-family: 'Garamond', Georgia, serif; font-size: 13pt; font-weight: bold; color: #122315; text-transform: uppercase;">
                  Maridajes & Experiencias de Salón
                </div>
                <div style="font-family: 'Century Gothic', Arial, sans-serif; font-size: 7.5pt; color: #7A6F66; margin-bottom: 6pt;">
                  Combinaciones sugeridas por nuestro barista y maestro pastelero
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 2pt 4pt 6pt 4pt;">
                ${generateWordProductsTable(allCombos)}
              </td>
            </tr>
          </table>
        </div>
      `;
    };

    // Render category section for Word
    const renderCategoryWord = (cat: Category, index: number) => {
      const catProds = getProductsForCategory(cat.id);
      if (catProds.length === 0) return '';

      return `
        <div style="margin-top: 8pt; margin-bottom: 4pt;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 6pt;">
            <tr>
              <td style="border-bottom: 1pt solid #C5A880; width: 25%;"></td>
              <td style="font-family: 'Garamond', Georgia, serif; font-size: 11.5pt; font-weight: bold; text-transform: uppercase; color: #122315; text-align: center; padding: 2pt 12pt; width: 50%;">
                ${toRoman(index + 1)}. &nbsp; ${cat.name.toUpperCase()}
              </td>
              <td style="border-bottom: 1pt solid #C5A880; width: 25%;"></td>
            </tr>
          </table>
          ${generateWordProductsTable(catProds)}
        </div>
      `;
    };

    // Build Word body
    let wordSectionsHTML = '';
    const cafeteriaCat = orderedCategories.find(
      (c) => c.slug === 'cafeteria' || c.name.toLowerCase().includes('café') || c.name.toLowerCase().includes('cafeter')
    );

    if (config.comboPosition === 'top') {
      wordSectionsHTML += renderCombosWord();
      wordSectionsHTML += orderedCategories.map((c, i) => renderCategoryWord(c, i)).join('');
    } else if (config.comboPosition === 'after-cafeteria' && cafeteriaCat) {
      orderedCategories.forEach((cat, i) => {
        wordSectionsHTML += renderCategoryWord(cat, i);
        if (cat.id === cafeteriaCat.id) {
          wordSectionsHTML += renderCombosWord();
        }
      });
    } else if (config.comboPosition === 'bottom') {
      wordSectionsHTML += orderedCategories.map((c, i) => renderCategoryWord(c, i)).join('');
      wordSectionsHTML += renderCombosWord();
    } else {
      wordSectionsHTML += orderedCategories.map((c, i) => renderCategoryWord(c, i)).join('');
    }

    const wordHTML = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>Carta Menú - ${config.title}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page WordSection1 {
              size: 595.3pt 841.9pt; /* A4 */
              margin: 28.3pt 28.3pt 28.3pt 28.3pt;
              mso-header-margin: 14.1pt;
              mso-footer-margin: 14.1pt;
              mso-paper-source: 0;
            }
            div.WordSection1 {
              page: WordSection1;
            }
            body {
              font-family: 'Garamond', Georgia, serif;
              color: #1A1412;
              background-color: #FAF8F5;
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body style="background-color: #FAF8F5; margin: 0; padding: 10pt;">
          <div class="WordSection1">
            <table style="width: 100%; border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0;">
              <thead>
                <tr style="${config.repeatHeaderOnAllPages ? 'mso-table-header: yes;' : ''} page-break-inside: avoid;">
                  <td style="padding-bottom: 8pt;">
                    <!-- Editorial Header -->
                    <table style="width: 100%; border-bottom: 1.5pt solid #C5A880; border-collapse: collapse; margin-bottom: 8pt; text-align: center;">
                      <tr>
                        <td style="padding: 6pt 10pt 8pt 10pt; text-align: center;">
                          <div style="font-family: 'Century Gothic', Arial, sans-serif; font-size: 7.5pt; font-weight: bold; letter-spacing: 3pt; color: #A07844; text-transform: uppercase;">
                            ✦ MAISON DE CAFÉ & HAUTE PÂTISSERIE ✦
                          </div>
                          <div style="font-family: 'Garamond', Georgia, serif; font-size: 26pt; font-weight: bold; letter-spacing: 4pt; color: #122315; text-transform: uppercase; margin: 2pt 0;">
                            ${config.title}
                          </div>
                          <div style="font-family: 'Century Gothic', Arial, sans-serif; font-size: 8pt; letter-spacing: 2pt; text-transform: uppercase; color: #7A6F66; margin-bottom: 6pt;">
                            ${config.subtitle}
                          </div>
                          <div style="font-family: 'Century Gothic', Arial, sans-serif; font-size: 7.5pt; letter-spacing: 1.5pt; text-transform: uppercase; color: #5C524A;">
                            Granos 100% Arábica de Altura &nbsp;•&nbsp; Cocina Libre de Gluten &nbsp;•&nbsp; San Juan, Argentina
                          </div>
                          ${
                            config.experienceText
                              ? `
                            <div style="font-family: 'Garamond', Georgia, serif; font-style: italic; font-size: 10pt; color: #6E645D; margin-top: 5pt;">
                              « ${config.experienceText} »
                            </div>
                          `
                              : ''
                          }
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <!-- Main Content Sections -->
                    ${wordSectionsHTML}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr style="page-break-inside: avoid;">
                  <td style="padding-top: 8pt;">
                    <!-- Footer -->
                    <table style="width: 100%; border-top: 1pt solid #C5A880; margin-top: 6pt; padding-top: 4pt; font-family: 'Century Gothic', Arial, sans-serif; font-size: 7.5pt; color: #7A6F66;">
                      <tr>
                        <td style="text-align: left; font-family: 'Garamond', Georgia, serif; font-weight: bold; font-size: 9pt; color: #122315;">
                          ${config.title} • Carta Oficial de Salón
                        </td>
                        <td style="text-align: right; color: #765747;">
                          ${config.footerNote}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + wordHTML], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanTitle = config.title.replace(/\s+/g, '_');
    link.download = `Carta_Menu_Editorial_${cleanTitle}_${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setWordExportSuccess(true);
    setTimeout(() => setWordExportSuccess(false), 3500);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const htmlContent = generateMenuPrintHTML();
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in print:static print:block print:inset-auto print:overflow-visible print:bg-white print:p-0">
      {/* Container Dialog */}
      <div className="bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#D8C7B0] w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden text-[#1A1412] print:max-h-none print:w-full print:block print:overflow-visible print:border-none print:shadow-none print:bg-transparent">
        {/* Modal Toolbar (Hidden during print) */}
        <div className="bg-[#122315] text-[#FAF8F5] p-4 flex flex-wrap items-center justify-between gap-3 shadow-md print:hidden border-b border-[#C5A880]/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#244128] rounded-xl border border-[#C5A880]/40">
              <BookOpen className="w-5 h-5 text-[#E6D4B8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-[#FFFDF8] font-serif tracking-wide">
                  Carta de Salón Editorial &bull; Alta Gama
                </h2>
                <span className="text-[10px] bg-[#C5A880] text-[#122315] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Formato A4
                </span>
              </div>
              <p className="text-xs text-[#D8E4C3]/80">
                Diseño Haute Pâtisserie &bull; {products.filter((p) => p.isAvailable).length} productos disponibles &bull; {allCombos.length} maridajes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle Configurator Button */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                showConfig
                  ? 'bg-[#C5A880] text-[#122315] shadow-md font-extrabold ring-2 ring-[#E6D4B8]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Ajustar orden de categorías, maridajes y textos"
            >
              <Settings2 className="w-4 h-4" />
              <span>{showConfig ? 'Cerrar Ajustes' : 'Personalizar Carta'}</span>
            </button>

            {/* Word Export Button */}
            <button
              onClick={handleExportWord}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95 ${
                wordExportSuccess
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#2A4B30] hover:bg-[#345D3B] text-[#FFFDF8] border border-[#C5A880]/40'
              }`}
              title="Descargar documento Word (.doc) editable en Microsoft Word o Google Docs"
            >
              {wordExportSuccess ? <Check className="w-4 h-4 text-emerald-200" /> : <FileText className="w-4 h-4 text-[#E6D4B8]" />}
              <span>{wordExportSuccess ? '¡Word Descargado!' : 'Descargar en Word (.doc)'}</span>
            </button>

            {/* Print / PDF Button */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#8C6239] hover:bg-[#A07042] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
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

        {/* Collapsible Customizer Drawer */}
        {showConfig && (
          <div className="bg-[#F4EFE6] border-b border-[#D8C7B0] p-4 text-[#1A1412] space-y-4 print:hidden animate-fade-in shadow-inner max-h-[38vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#D8C7B0]/80 pb-2">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-[#8C6239]" />
                <h3 className="font-extrabold text-sm text-[#122315] font-serif">
                  Configuración de Estilo y Orden Editorial
                </h3>
              </div>
              <button
                onClick={resetConfig}
                className="text-xs text-[#7A6F66] hover:text-[#122315] flex items-center gap-1 font-semibold underline underline-offset-2"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restablecer valores de autor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 1. Ubicación de Maridajes */}
              <div className="bg-white p-3 rounded-xl border border-[#D8C7B0] shadow-xs space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C6239]">
                  <Sparkles className="w-4 h-4 text-[#A07844]" />
                  <span>Maridajes & Selección</span>
                </div>
                <p className="text-[11px] text-[#6E645D] leading-tight">
                  Sección destacada con filete de autor para evitar mezclar con pastelería individual.
                </p>
                <select
                  value={config.comboPosition}
                  onChange={(e) => setConfig({ ...config, comboPosition: e.target.value as ComboPosition })}
                  className="w-full text-xs font-serif font-bold bg-[#FAF8F5] border border-[#D8C7B0] rounded-lg p-2 focus:ring-2 focus:ring-[#8C6239] outline-none text-[#1A1412]"
                >
                  <option value="top">✦ Al inicio (Portada de degustación)</option>
                  <option value="after-cafeteria">☕ Después de Cafetería</option>
                  <option value="bottom">📌 Al final de la carta</option>
                  <option value="inline">🔀 Dentro de su categoría original</option>
                  <option value="hidden">🚫 No incluir en carta física</option>
                </select>
              </div>

              {/* 2. Textos de Encabezado */}
              <div className="bg-white p-3 rounded-xl border border-[#D8C7B0] shadow-xs space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#122315]">
                  <FileText className="w-4 h-4 text-[#8C6239]" />
                  <span>Membrete de Salón</span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[10px] font-bold text-[#7A6F66] uppercase">Título de la Casa</label>
                    <input
                      type="text"
                      value={config.title}
                      onChange={(e) => setConfig({ ...config, title: e.target.value })}
                      className="w-full text-xs font-serif font-bold bg-[#FAF8F5] border border-[#D8C7B0] rounded-md px-2 py-1 outline-none text-[#122315]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#7A6F66] uppercase">Bajada / Rubro</label>
                    <input
                      type="text"
                      value={config.subtitle}
                      onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                      className="w-full text-xs bg-[#FAF8F5] border border-[#D8C7B0] rounded-md px-2 py-1 outline-none text-[#1A1412]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Encabezado en todas las páginas */}
              <div className="bg-white p-3 rounded-xl border border-[#D8C7B0] shadow-xs space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#122315]">
                  <Printer className="w-4 h-4 text-[#8C6239]" />
                  <span>Paginación Editorial</span>
                </div>
                <p className="text-[11px] text-[#6E645D] leading-tight">
                  Repite el membrete institucional francés en cada hoja A4 al imprimir o exportar.
                </p>
                <label className="flex items-start gap-2 text-xs text-[#1A1412] cursor-pointer pt-1 bg-[#FAF8F5] p-2 rounded-lg border border-[#D8C7B0]">
                  <input
                    type="checkbox"
                    checked={config.repeatHeaderOnAllPages}
                    onChange={(e) => setConfig({ ...config, repeatHeaderOnAllPages: e.target.checked })}
                    className="mt-0.5 rounded text-[#8C6239] focus:ring-[#8C6239]"
                  />
                  <div>
                    <span className="font-bold block text-[11px] text-[#122315]">Repetir membrete en cada hoja</span>
                    <span className="text-[10px] text-[#7A6F66]">
                      {config.repeatHeaderOnAllPages ? 'Activo en todas las páginas A4' : 'Solo en la primera página'}
                    </span>
                  </div>
                </label>
              </div>

              {/* 4. Orden de Categorías */}
              <div className="bg-white p-3 rounded-xl border border-[#D8C7B0] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#122315]">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#8C6239]" />
                    <span>Orden de Secciones</span>
                  </span>
                  <span className="text-[10px] text-[#7A6F66]">▲ / ▼</span>
                </div>

                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {config.categoryOrder.map((catId, index) => {
                    const cat = categories.find((c) => c.id === catId);
                    if (!cat) return null;
                    const isHidden = config.hiddenCategoryIds.includes(catId);

                    return (
                      <div
                        key={cat.id}
                        className={`flex items-center justify-between gap-1 p-1.5 rounded-lg border text-xs transition-colors ${
                          isHidden
                            ? 'bg-stone-100 border-stone-200 text-stone-400'
                            : 'bg-[#FAF8F5] border-[#D8C7B0] text-[#122315]'
                        }`}
                      >
                        <span className="font-bold truncate max-w-[100px] font-serif">
                          {toRoman(index + 1)}. {cat.name}
                        </span>

                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => toggleCategoryVisibility(cat.id)}
                            className="p-1 hover:bg-white rounded text-[#7A6F66]"
                            title={isHidden ? 'Mostrar categoría' : 'Ocultar categoría'}
                          >
                            {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveCategory(index, 'up')}
                            className="p-1 hover:bg-white disabled:opacity-30 rounded text-[#8C6239]"
                            title="Subir"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === config.categoryOrder.length - 1}
                            onClick={() => moveCategory(index, 'down')}
                            className="p-1 hover:bg-white disabled:opacity-30 rounded text-[#8C6239]"
                            title="Bajar"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Modal Body (Haute Pâtisserie Visual Preview) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#EFEAE2] print:overflow-visible print:p-0 print:block print:bg-transparent">
          {/* Subtle indicator of repeating header */}
          {config.repeatHeaderOnAllPages && (
            <div className="max-w-[820px] mx-auto mb-3 flex items-center justify-center gap-2 bg-[#F5EFE6] border border-[#C5A880]/40 py-1.5 px-3 rounded-full text-xs text-[#8C6239] font-medium shadow-2xs print:hidden">
              <span className="text-xs">✦</span>
              <span>
                Membrete institucional editorial configurado para repetirse en todas las hojas A4 (impresión y Word)
              </span>
            </div>
          )}

          {/* Luxury Sheet Container */}
          <div
            id="printable-menu-area"
            ref={printRef}
            className="bg-[#FAF8F5] text-[#1A1412] font-serif p-6 sm:p-10 rounded-sm shadow-xl border border-[#D8C7B0] w-full max-w-[820px] mx-auto space-y-6"
            style={{
              boxShadow: '0 4px 20px -2px rgba(40, 30, 20, 0.08), 0 2px 6px -1px rgba(40, 30, 20, 0.04)',
            }}
          >
            {/* Editorial Header Section */}
            <div className="text-center space-y-2 border-b border-[#C5A880] pb-4">
              <div className="text-[9px] font-sans font-bold tracking-[0.3em] uppercase text-[#A07844]">
                ✦ &nbsp; MAISON DE CAFÉ & HAUTE PÂTISSERIE &nbsp; ✦
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-[0.18em] uppercase text-[#122315] font-serif">
                {config.title}
              </h1>

              <p className="text-[10px] font-sans font-medium tracking-[0.22em] uppercase text-[#7A6F66]">
                {config.subtitle}
              </p>

              {/* French Double Rule */}
              <div className="flex items-center justify-center gap-3 w-4/5 mx-auto py-1">
                <div className="h-[1px] flex-1 bg-[#C5A880]" />
                <span className="text-[10px] text-[#A07844]">✦</span>
                <div className="h-[1px] flex-1 bg-[#C5A880]" />
              </div>

              {/* Attributes line */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-[9px] font-sans font-semibold tracking-[0.14em] uppercase text-[#5C524A]">
                <span>Granos 100% Arábica de Altura</span>
                <span className="text-[#C5A880]">•</span>
                <span>Cocina Artesanal Libre de Gluten</span>
                <span className="text-[#C5A880]">•</span>
                <span>San Juan, Argentina</span>
              </div>

              {config.experienceText && (
                <p className="text-xs italic text-[#6E645D] font-serif max-w-lg mx-auto pt-1 leading-relaxed">
                  « {config.experienceText} »
                </p>
              )}
            </div>

            {/* Helper to render Combos / Maridajes Section */}
            {(() => {
              const renderCombosPreview = () => {
                if (
                  allCombos.length === 0 ||
                  config.comboPosition === 'hidden' ||
                  config.comboPosition === 'inline'
                ) {
                  return null;
                }

                return (
                  <section className="border border-[#C5A880] p-1 bg-[#FBF8F2] rounded-xs shadow-2xs">
                    <div className="border border-[#D8C3A5] p-4 text-center space-y-3">
                      <div>
                        <span className="text-[9px] font-sans font-bold tracking-[0.25em] text-[#A07844] uppercase block">
                          ✦ SELECCIÓN DE LA CASA ✦
                        </span>
                        <h2 className="text-base sm:text-lg font-bold uppercase tracking-[0.12em] text-[#122315] font-serif">
                          Maridajes & Experiencias de Salón
                        </h2>
                        <p className="text-[9px] font-sans text-[#7A6F66] tracking-wide">
                          Combinaciones sugeridas por nuestro barista y maestro pastelero
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-left pt-1">
                        {allCombos.map((item) => (
                          <div key={item.id} className="space-y-0.5 border-b sm:border-b-0 border-[#EFE5D7] pb-2 sm:pb-0">
                            <div className="flex items-baseline justify-between gap-1 w-full">
                              <span className="font-bold text-xs text-[#1A1412] font-serif truncate flex items-center gap-1.5">
                                <span className="text-[8px] font-sans font-bold bg-[#F3EBDD] border border-[#D8C3A5] text-[#8A5E2E] px-1 py-0.2 rounded-2xs">
                                  DÚO
                                </span>
                                {item.name}
                                {item.isFeatured && <span className="text-[#A07844] text-[10px]">✦</span>}
                              </span>
                              <span className="flex-1 border-b border-dotted border-[#CBBFB0] mx-1.5 mb-1 hidden sm:block" />
                              <span className="font-bold text-xs text-[#8C6239] font-serif shrink-0">
                                {formatCurrency(item.price)}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-[10px] text-[#6E645D] font-sans leading-tight">
                                {item.description}
                              </p>
                            )}
                            {item.compositeItems && item.compositeItems.length > 0 && (
                              <div className="text-[9px] font-sans text-[#4A423D] bg-[#F4EFE6] border-l-2 border-[#C5A880] px-2 py-0.5 mt-1 leading-snug">
                                <strong className="text-[#8C6239] uppercase text-[8px] tracking-wider">Maridaje:</strong>{' '}
                                {item.compositeItems
                                  .map((ci) => `${ci.quantity > 1 ? ci.quantity + 'x ' : ''}${ci.productName}`)
                                  .join(' + ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                );
              };

              // Helper to render Category preview
              const renderCategoryPreview = (cat: Category, index: number) => {
                const catProducts = getProductsForCategory(cat.id);
                if (catProducts.length === 0) return null;

                return (
                  <section key={cat.id} className="space-y-2.5">
                    {/* Refined Category Divider Header */}
                    <div className="flex items-center gap-3 py-1">
                      <div className="h-[0.75px] flex-1 bg-[#C5A880] opacity-70" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-[#122315] font-serif whitespace-nowrap">
                        {toRoman(index + 1)}. &nbsp; {cat.name}
                      </h2>
                      <div className="h-[0.75px] flex-1 bg-[#C5A880] opacity-70" />
                    </div>

                    {/* Products Grid (Dotted leaders restaurant list) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                      {catProducts.map((item) => (
                        <div key={item.id} className="space-y-0.5">
                          <div className="flex items-baseline justify-between gap-1 w-full">
                            <span className="font-bold text-xs text-[#1A1412] font-serif truncate">
                              {item.name}
                              {item.isFeatured && <span className="text-[#A07844] text-[10px] ml-1">✦</span>}
                            </span>
                            <span className="flex-1 border-b border-dotted border-[#CBBFB0] mx-1.5 mb-1" />
                            <span className="font-bold text-xs text-[#8C6239] font-serif shrink-0">
                              {formatCurrency(item.price)}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-[10px] text-[#6E645D] font-sans leading-tight">
                              {item.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              };

              const cafeteriaCat = orderedCategories.find(
                (c) =>
                  c.slug === 'cafeteria' ||
                  c.name.toLowerCase().includes('café') ||
                  c.name.toLowerCase().includes('cafeter')
              );

              return (
                <div className="space-y-6">
                  {config.comboPosition === 'top' && renderCombosPreview()}

                  {orderedCategories.map((cat, index) => (
                    <React.Fragment key={cat.id}>
                      {renderCategoryPreview(cat, index)}
                      {config.comboPosition === 'after-cafeteria' &&
                        cafeteriaCat &&
                        cat.id === cafeteriaCat.id &&
                        renderCombosPreview()}
                    </React.Fragment>
                  ))}

                  {config.comboPosition === 'bottom' && renderCombosPreview()}
                </div>
              );
            })()}

            {/* Haute Pâtisserie Editorial Footer */}
            <div className="pt-4 border-t border-[#C5A880] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-sans text-[#7A6F66]">
              <div className="font-serif font-bold text-xs text-[#122315] tracking-wider uppercase">
                {config.title} &bull; Carta Oficial de Salón
              </div>
              <div className="text-right text-[10px] text-[#8C6239] font-medium">
                {config.footerNote}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#FAF8F5] border-t border-[#D8C7B0] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A6F66] print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#8C6239] bg-[#F4EFE6] px-2 py-0.5 rounded border border-[#C5A880]/50 font-serif">
              ✦ Haute Édition
            </span>
            <span>
              Maquetación clásica con guías punteadas, tipografía editorial y membrete institucional en todas las hojas.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportWord}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                wordExportSuccess
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#244128] hover:bg-[#122315] text-[#FFFDF8] border border-[#C5A880]/40'
              }`}
            >
              {wordExportSuccess ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4 text-[#E6D4B8]" />}
              <span>{wordExportSuccess ? '¡Word Descargado!' : 'Descargar en Word (.doc)'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#8C6239] hover:bg-[#A07042] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" /> Imprimir / PDF
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#D8C7B0] text-[#1A1412] font-bold hover:bg-[#F4EFE6] transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
