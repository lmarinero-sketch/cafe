import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  Sparkles,
  Coffee,
  BookOpen,
  FileText,
  Settings2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  RotateCcw,
  Package,
  Check,
  Layers,
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
      subtitle: 'Carta Oficial de Salón • San Juan, Argentina',
      experienceText:
        'Todos nuestros productos son elaborados artesanalmente en el día con ingredientes de primera calidad.',
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
      subtitle: 'Carta Oficial de Salón • San Juan, Argentina',
      experienceText:
        'Todos nuestros productos son elaborados artesanalmente en el día con ingredientes de primera calidad.',
      footerNote: 'Precios expresados en Pesos Argentinos (ARS) • IVA Incluido',
      repeatHeaderOnAllPages: true,
    };
    setConfig(defaultConfig);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Helper to generate full-bleed HTML for window.print() (PDF) with repeated header across pages
  const generateMenuPrintHTML = () => {
    // Render Combos HTML Block
    const renderCombosHTML = () => {
      if (allCombos.length === 0 || config.comboPosition === 'hidden' || config.comboPosition === 'inline') {
        return '';
      }

      return `
        <div class="combos-section">
          <div class="combos-header">
            <div class="combos-title-badge">
              <span class="combos-icon">🏷️</span>
              <h2 class="combos-title">Combos & Promociones Especiales</h2>
            </div>
            <span class="combos-sub">Ahorro y combinaciones sugeridas</span>
          </div>

          <div class="products-grid">
            ${allCombos
              .map(
                (item) => `
              <div class="product-card combo-card">
                <div>
                  <div class="product-header">
                    <span class="product-name">
                      <span class="combo-pill">COMBO</span>
                      ${item.name}
                      ${item.isFeatured ? '<span class="product-star">★</span>' : ''}
                    </span>
                    <span class="product-price">$ ${item.price.toLocaleString('es-AR')}</span>
                  </div>
                  ${item.description ? `<p class="product-desc">${item.description}</p>` : ''}
                  ${
                    item.compositeItems && item.compositeItems.length > 0
                      ? `
                    <div class="combo-includes">
                      <strong>Incluye:</strong> ${item.compositeItems
                        .map((ci) => `${ci.quantity > 1 ? ci.quantity + 'x ' : ''}${ci.productName}`)
                        .join(' + ')}
                    </div>
                  `
                      : ''
                  }
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    };

    // Render Category HTML Block
    const renderCategoryHTML = (cat: Category) => {
      const catProds = getProductsForCategory(cat.id);
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
    };

    // Build the categories content respecting combo placement
    let bodyCategoriesHTML = '';
    const cafeteriaCat = orderedCategories.find(
      (c) => c.slug === 'cafeteria' || c.name.toLowerCase().includes('café') || c.name.toLowerCase().includes('cafeter')
    );

    if (config.comboPosition === 'top') {
      bodyCategoriesHTML += renderCombosHTML();
      bodyCategoriesHTML += orderedCategories.map((c) => renderCategoryHTML(c)).join('');
    } else if (config.comboPosition === 'after-cafeteria' && cafeteriaCat) {
      orderedCategories.forEach((cat) => {
        bodyCategoriesHTML += renderCategoryHTML(cat);
        if (cat.id === cafeteriaCat.id) {
          bodyCategoriesHTML += renderCombosHTML();
        }
      });
    } else if (config.comboPosition === 'bottom') {
      bodyCategoriesHTML += orderedCategories.map((c) => renderCategoryHTML(c)).join('');
      bodyCategoriesHTML += renderCombosHTML();
    } else {
      // inline or hidden
      bodyCategoriesHTML += orderedCategories.map((c) => renderCategoryHTML(c)).join('');
    }

    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Carta Menú - ${config.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap');
            
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }

            @page {
              size: A4 portrait;
              margin: 6mm 6mm 6mm 6mm;
            }

            html, body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
              background-color: #FAF7F2;
              color: #2C221E;
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
              background: #FAF7F2;
            }

            /* Main Print Page Table (Enables repeated thead across pages) */
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
              padding: 10px 0 0 0;
              border: none;
              vertical-align: bottom;
            }

            /* Header */
            .header-banner {
              background: linear-gradient(135deg, #122315 0%, #244128 100%);
              color: #FFFDF8;
              border-radius: 12px;
              padding: 14px 20px;
              text-align: center;
              margin-bottom: 8px;
              border: 2px solid #D8E4C3;
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .badge {
              display: inline-block;
              font-size: 9px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #244128;
              background-color: #D8E4C3;
              padding: 3px 12px;
              border-radius: 20px;
              margin-bottom: 3px;
            }

            .title {
              font-family: 'Playfair Display', Georgia, serif;
              font-size: 26px;
              font-weight: 800;
              color: #FFFDF8;
              letter-spacing: -0.5px;
              margin-bottom: 2px;
            }

            .subtitle {
              font-size: 11px;
              color: #E2EAD2;
              font-weight: 600;
              letter-spacing: 0.5px;
            }

            .sub-info-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1.5px solid #2F5233;
              border-bottom: 1.5px solid #2F5233;
              padding: 5px 12px;
              margin-bottom: 8px;
              font-size: 10px;
              font-weight: 700;
              color: #2F5233;
              background-color: #EBF1EA;
              border-radius: 6px;
              break-inside: avoid;
              page-break-inside: avoid;
            }

            /* Highlight Showcase */
            .showcase-box {
              background-color: #F3EBDD;
              border: 1px solid #D8CBB6;
              border-left: 4px solid #765747;
              border-radius: 8px;
              padding: 7px 12px;
              margin-bottom: 10px;
              font-size: 10px;
              color: #4A352C;
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .showcase-box strong {
              color: #1A2E1E;
              font-size: 10.5px;
            }

            /* Special Combos Section */
            .combos-section {
              background: #FDF9F0;
              border: 1.5px solid #D4A373;
              border-radius: 10px;
              padding: 10px 12px;
              margin-bottom: 14px;
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .combos-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 8px;
              border-bottom: 1.5px solid #E5CCA7;
              padding-bottom: 5px;
            }

            .combos-title-badge {
              display: flex;
              align-items: center;
              gap: 6px;
            }

            .combos-icon {
              font-size: 13px;
            }

            .combos-title {
              font-family: 'Playfair Display', Georgia, serif;
              font-size: 13px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #8C4B18;
            }

            .combos-sub {
              font-size: 9.5px;
              font-weight: 700;
              color: #A06428;
            }

            .combo-card {
              border-color: #E5CCA7 !important;
              background-color: #FFFDF8 !important;
            }

            .combo-pill {
              font-size: 8px;
              background-color: #FDE68A;
              color: #92400E;
              padding: 1px 4px;
              border-radius: 3px;
              font-weight: 800;
              margin-right: 4px;
              border: 1px solid #F59E0B;
            }

            .combo-includes {
              font-size: 8.5px;
              color: #2F5233;
              background-color: #EBF1EA;
              padding: 3px 6px;
              border-radius: 4px;
              margin-top: 4px;
              font-weight: 600;
            }

            /* Categories */
            .category-section {
              margin-bottom: 14px;
              break-inside: auto;
              page-break-inside: auto;
            }

            .category-header {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-top: 10px;
              margin-bottom: 8px;
              break-inside: avoid;
              page-break-inside: avoid;
              break-after: avoid;
              page-break-after: avoid;
            }

            .category-header .line {
              flex: 1;
              height: 1.5px;
              background: #2F5233;
              opacity: 0.35;
            }

            .category-title {
              font-family: 'Playfair Display', Georgia, serif;
              font-size: 12.5px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #FFF;
              background-color: #2F5233;
              padding: 2.5px 14px;
              border-radius: 20px;
            }

            /* Products Grid */
            .products-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 5px 10px;
              width: 100%;
            }

            .product-card {
              background-color: #FFFFFF;
              border: 1px solid #D8CEBA;
              border-radius: 7px;
              padding: 6px 10px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              break-inside: avoid;
              page-break-inside: avoid;
              box-shadow: 0 1px 2px rgba(0,0,0,0.02);
            }

            .product-header {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              gap: 6px;
              margin-bottom: 1px;
            }

            .product-name {
              font-size: 11px;
              font-weight: 700;
              color: #1A2E1E;
            }

            .product-star {
              color: #D97706;
              font-size: 9px;
              font-weight: 800;
            }

            .product-price {
              font-family: monospace;
              font-size: 11.5px;
              font-weight: 800;
              color: #2F5233;
              white-space: nowrap;
            }

            .product-desc {
              font-size: 9.5px;
              color: #6B5B52;
              line-height: 1.2;
            }

            /* Footer */
            .menu-footer {
              margin-top: 10px;
              padding-top: 8px;
              border-top: 1.5px solid #2F5233;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 9.5px;
              color: #2F5233;
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .footer-left strong {
              color: #1A2E1E;
            }

            .footer-right {
              text-align: right;
              font-weight: 600;
              color: #765747;
            }

            @media print {
              @page {
                size: A4 portrait;
                margin: 6mm 6mm 6mm 6mm;
              }
              html, body {
                background: #FAF7F2 !important;
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
              .category-section, .combos-section {
                break-inside: auto !important;
                page-break-inside: auto !important;
              }
              .category-header, .combos-header {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                break-after: avoid !important;
                page-break-after: avoid !important;
              }
              .product-card, .header-banner, .menu-footer {
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
                    <!-- Header Banner -->
                    <div class="header-banner">
                      <div class="badge">Pastelería & Cafetería de Especialidad</div>
                      <h1 class="title">${config.title}</h1>
                      <p class="subtitle">${config.subtitle}</p>
                    </div>

                    <!-- Sub Header -->
                    <div class="sub-info-bar">
                      <span>☕ Granos 100% Arábica Seleccionados</span>
                      <span>•</span>
                      <span>🥐 Elaboración 100% Artesanal y Libre de Gluten</span>
                      <span>•</span>
                      <span>✨ Sabores de Tradición</span>
                    </div>

                    <!-- Showcase -->
                    ${
                      config.experienceText
                        ? `
                      <div class="showcase-box">
                        <strong>✨ Experiencia ${config.title}:</strong> ${config.experienceText}
                      </div>
                    `
                        : ''
                    }
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
                    <div class="menu-footer">
                      <div class="footer-left">
                        <p><strong>${config.title}</strong> • Pastelería Artesanal & Cafetería de Especialidad</p>
                      </div>
                      <div class="footer-right">
                        <p>${config.footerNote}</p>
                      </div>
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

  // Helper to generate a fully editable Microsoft Word (.doc) HTML Document with repeated headers
  const handleExportWord = () => {
    // Helper to generate a 2-column Word table for products
    const generateWordProductsTable = (items: Product[], isComboGroup = false) => {
      let rows = '';
      for (let i = 0; i < items.length; i += 2) {
        const item1 = items[i];
        const item2 = items[i + 1];

        const renderCell = (it?: Product) => {
          if (!it) {
            return `<td style="width: 50%; padding: 6pt; border: none;"></td>`;
          }

          const includesHTML =
            it.compositeItems && it.compositeItems.length > 0
              ? `<div style="font-size: 8.5pt; color: #2F5233; background-color: #EBF1EA; padding: 2pt 4pt; margin-top: 3pt; border-radius: 3pt;">
                   <strong>Incluye:</strong> ${it.compositeItems
                     .map((ci) => `${ci.quantity > 1 ? ci.quantity + 'x ' : ''}${ci.productName}`)
                     .join(' + ')}
                 </div>`
              : '';

          return `
            <td style="width: 50%; padding: 6pt 8pt; vertical-align: top; border: 1pt solid ${
              isComboGroup ? '#D4A373' : '#D8CEBA'
            }; background-color: ${isComboGroup ? '#FFFDF8' : '#FFFFFF'};">
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 2pt;">
                <tr>
                  <td style="font-family: 'Century Gothic', Arial, sans-serif; font-size: 10.5pt; font-weight: bold; color: #1A2E1E; text-align: left;">
                    ${isComboGroup ? '<span style="color: #92400E; background-color: #FEF3C7; padding: 1pt 3pt; font-size: 8pt; border: 1pt solid #F59E0B;">COMBO</span> ' : ''}
                    ${it.name}
                    ${it.isFeatured ? '<span style="color: #D97706; font-size: 9pt;"> ★</span>' : ''}
                  </td>
                  <td style="font-family: 'Courier New', monospace; font-size: 11pt; font-weight: bold; color: #2F5233; text-align: right; white-space: nowrap;">
                    $ ${it.price.toLocaleString('es-AR')}
                  </td>
                </tr>
              </table>
              ${
                it.description
                  ? `<div style="font-family: Georgia, serif; font-size: 8.5pt; color: #6B5B52; line-height: 1.2;">${it.description}</div>`
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
        <table style="width: 100%; border-collapse: separate; border-spacing: 5pt; margin-bottom: 12pt;">
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
        <table style="width: 100%; background-color: #FDF9F0; border: 1.5pt solid #D4A373; margin-bottom: 14pt; padding: 8pt; border-collapse: collapse;">
          <tr>
            <td style="padding: 6pt; border-bottom: 1.5pt solid #E5CCA7;">
              <table style="width: 100%;">
                <tr>
                  <td style="font-family: Georgia, serif; font-size: 12pt; font-weight: bold; color: #8C4B18; text-transform: uppercase;">
                    🏷️ COMBOS & PROMOCIONES ESPECIALES
                  </td>
                  <td style="font-family: Arial, sans-serif; font-size: 9pt; font-weight: bold; color: #A06428; text-align: right;">
                    Ahorro y combinaciones sugeridas
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 6pt;">
              ${generateWordProductsTable(allCombos, true)}
            </td>
          </tr>
        </table>
      `;
    };

    // Render category section for Word
    const renderCategoryWord = (cat: Category) => {
      const catProds = getProductsForCategory(cat.id);
      if (catProds.length === 0) return '';

      return `
        <div style="margin-top: 10pt; margin-bottom: 6pt; text-align: center;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 6pt;">
            <tr>
              <td style="border-bottom: 1.5pt solid #2F5233; width: 35%;"></td>
              <td style="font-family: Georgia, serif; font-size: 11pt; font-weight: bold; text-transform: uppercase; color: #FFFFFF; background-color: #2F5233; text-align: center; padding: 3pt 14pt; width: 30%;">
                ${cat.name}
              </td>
              <td style="border-bottom: 1.5pt solid #2F5233; width: 35%;"></td>
            </tr>
          </table>
          ${generateWordProductsTable(catProds, false)}
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
      wordSectionsHTML += orderedCategories.map((c) => renderCategoryWord(c)).join('');
    } else if (config.comboPosition === 'after-cafeteria' && cafeteriaCat) {
      orderedCategories.forEach((cat) => {
        wordSectionsHTML += renderCategoryWord(cat);
        if (cat.id === cafeteriaCat.id) {
          wordSectionsHTML += renderCombosWord();
        }
      });
    } else if (config.comboPosition === 'bottom') {
      wordSectionsHTML += orderedCategories.map((c) => renderCategoryWord(c)).join('');
      wordSectionsHTML += renderCombosWord();
    } else {
      wordSectionsHTML += orderedCategories.map((c) => renderCategoryWord(c)).join('');
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
              font-family: 'Century Gothic', Arial, sans-serif;
              color: #2C221E;
              background-color: #FAF7F2;
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body style="background-color: #FAF7F2; margin: 0; padding: 10pt;">
          <div class="WordSection1">
            <table style="width: 100%; border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0;">
              <thead>
                <tr style="${config.repeatHeaderOnAllPages ? 'mso-table-header: yes;' : ''} page-break-inside: avoid;">
                  <td style="padding-bottom: 8pt;">
                    <!-- Header Banner -->
                    <table style="width: 100%; background-color: #1A2E1E; border-collapse: collapse; margin-bottom: 6pt; border: 2pt solid #D8E4C3; text-align: center;">
                      <tr>
                        <td style="padding: 10pt 14pt; text-align: center;">
                          <div style="font-family: Arial, sans-serif; font-size: 8.5pt; font-weight: bold; text-transform: uppercase; color: #244128; background-color: #D8E4C3; padding: 2pt 8pt; display: inline-block; margin-bottom: 3pt;">
                            Pastelería & Cafetería de Especialidad
                          </div>
                          <div style="font-family: Georgia, serif; font-size: 22pt; font-weight: bold; color: #FFFDF8; margin: 1pt 0;">
                            ${config.title}
                          </div>
                          <div style="font-family: Arial, sans-serif; font-size: 9.5pt; color: #E2EAD2;">
                            ${config.subtitle}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Sub Header Bar -->
                    <table style="width: 100%; background-color: #EBF1EA; border-top: 1.5pt solid #2F5233; border-bottom: 1.5pt solid #2F5233; margin-bottom: 8pt; font-size: 9pt; font-weight: bold; color: #2F5233; text-align: center;">
                      <tr>
                        <td style="padding: 4pt 6pt;">☕ Granos 100% Arábica</td>
                        <td style="padding: 4pt 6pt;">•</td>
                        <td style="padding: 4pt 6pt;">🥐 Elaboración Artesanal Libre de Gluten</td>
                        <td style="padding: 4pt 6pt;">•</td>
                        <td style="padding: 4pt 6pt;">✨ Sabores de Tradición</td>
                      </tr>
                    </table>

                    <!-- Showcase Box -->
                    ${
                      config.experienceText
                        ? `
                      <table style="width: 100%; background-color: #F3EBDD; border-left: 4pt solid #765747; border: 1pt solid #D8CBB6; margin-bottom: 8pt; font-size: 8.5pt; color: #4A352C;">
                        <tr>
                          <td style="padding: 5pt 8pt;">
                            <strong>✨ Experiencia ${config.title}:</strong> ${config.experienceText}
                          </td>
                        </tr>
                      </table>
                    `
                        : ''
                    }
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
                    <table style="width: 100%; border-top: 1.5pt solid #2F5233; margin-top: 8pt; padding-top: 5pt; font-size: 8.5pt; color: #2F5233;">
                      <tr>
                        <td style="text-align: left;">
                          <strong>${config.title}</strong> • Pastelería Artesanal & Cafetería de Especialidad
                        </td>
                        <td style="text-align: right; color: #765747; font-weight: bold;">
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
    link.download = `Carta_Menu_${cleanTitle}_${new Date().toISOString().slice(0, 10)}.doc`;
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in print:static print:block print:inset-auto print:overflow-visible print:bg-white print:p-0">
      {/* Container Dialog */}
      <div className="bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#E5DEC9] w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden text-[#2C221E] print:max-h-none print:w-full print:block print:overflow-visible print:border-none print:shadow-none print:bg-transparent">
        {/* Modal Toolbar (Hidden during print) */}
        <div className="bg-[#1A2E1E] text-white p-4 flex flex-wrap items-center justify-between gap-3 shadow-md print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2F5233] rounded-xl">
              <BookOpen className="w-5 h-5 text-[#D8E4C3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-[#FFFDF8] font-serif">Carta de Salón para Imprimir & Editar</h2>
                <span className="text-[10px] bg-[#D8E4C3] text-[#1A2E1E] font-black px-2 py-0.5 rounded-full">
                  A4
                </span>
              </div>
              <p className="text-xs text-[#D8E4C3]/80">
                {products.filter((p) => p.isAvailable).length} productos disponibles • {allCombos.length} combos
                detectados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle Configurator Button */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                showConfig
                  ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold ring-2 ring-amber-300'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Ajustar orden de categorías, ubicación de combos y textos"
            >
              <Settings2 className="w-4 h-4" />
              <span>{showConfig ? 'Cerrar Ajustes' : 'Personalizar Orden & Combos'}</span>
            </button>

            {/* Word Export Button */}
            <button
              onClick={handleExportWord}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95 ${
                wordExportSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title="Descargar documento Word (.doc) editable en Microsoft Word o Google Docs"
            >
              {wordExportSuccess ? <Check className="w-4 h-4 text-emerald-200" /> : <FileText className="w-4 h-4" />}
              <span>{wordExportSuccess ? '¡Descargado en Word!' : 'Descargar Word (.doc)'}</span>
            </button>

            {/* Print / PDF Button */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95"
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
          <div className="bg-[#EFE8D6] border-b border-[#D8CBB6] p-4 text-[#2C221E] space-y-4 print:hidden animate-fade-in shadow-inner max-h-[38vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#D8CBB6]/80 pb-2">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-[#2F5233]" />
                <h3 className="font-extrabold text-sm text-[#1A2E1E]">
                  Configuración de Maquetación de la Carta Física
                </h3>
              </div>
              <button
                onClick={resetConfig}
                className="text-xs text-[#765747] hover:text-[#1A2E1E] flex items-center gap-1 font-semibold underline underline-offset-2"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restablecer a valores por defecto
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 1. Ubicación de Combos */}
              <div className="bg-white p-3 rounded-xl border border-[#D8CBB6] shadow-xs space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C4B18]">
                  <Package className="w-4 h-4 text-[#D97706]" />
                  <span>Ubicación de Combos & Promos</span>
                </div>
                <p className="text-[11px] text-[#6B5B52] leading-tight">
                  Evita que aparezcan mezclados en Pastelería mostrándolos en una sección destacada propia.
                </p>
                <select
                  value={config.comboPosition}
                  onChange={(e) => setConfig({ ...config, comboPosition: e.target.value as ComboPosition })}
                  className="w-full text-xs font-bold bg-[#FAF7F2] border border-[#D8CBB6] rounded-lg p-2 focus:ring-2 focus:ring-[#2F5233] outline-none text-[#1A2E1E]"
                >
                  <option value="top">⭐ Al inicio de la carta (Recomendado)</option>
                  <option value="after-cafeteria">☕ Después de Cafetería</option>
                  <option value="bottom">📌 Al final de la carta</option>
                  <option value="inline">🔀 Dentro de su categoría original</option>
                  <option value="hidden">🚫 No incluir combos en la carta física</option>
                </select>
              </div>

              {/* 2. Textos de Encabezado */}
              <div className="bg-white p-3 rounded-xl border border-[#D8CBB6] shadow-xs space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A2E1E]">
                  <FileText className="w-4 h-4 text-[#2F5233]" />
                  <span>Textos de Encabezado</span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[10px] font-bold text-[#765747] uppercase">Título del Local</label>
                    <input
                      type="text"
                      value={config.title}
                      onChange={(e) => setConfig({ ...config, title: e.target.value })}
                      className="w-full text-xs bg-[#FAF7F2] border border-[#D8CBB6] rounded-md px-2 py-1 outline-none text-[#1A2E1E]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#765747] uppercase">Subtítulo / Ciudad</label>
                    <input
                      type="text"
                      value={config.subtitle}
                      onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                      className="w-full text-xs bg-[#FAF7F2] border border-[#D8CBB6] rounded-md px-2 py-1 outline-none text-[#1A2E1E]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Encabezado en todas las páginas (Nuevo) */}
              <div className="bg-white p-3 rounded-xl border border-[#D8CBB6] shadow-xs space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A2E1E]">
                  <Printer className="w-4 h-4 text-[#2F5233]" />
                  <span>Encabezado en cada página</span>
                </div>
                <p className="text-[11px] text-[#6B5B52] leading-tight">
                  Hace que el membrete institucional verde se repita automáticamente en cada hoja A4.
                </p>
                <label className="flex items-start gap-2 text-xs text-[#2C221E] cursor-pointer pt-1 bg-[#FAF7F2] p-2 rounded-lg border border-[#D8CBB6]">
                  <input
                    type="checkbox"
                    checked={config.repeatHeaderOnAllPages}
                    onChange={(e) => setConfig({ ...config, repeatHeaderOnAllPages: e.target.checked })}
                    className="mt-0.5 rounded text-[#2F5233] focus:ring-[#2F5233]"
                  />
                  <div>
                    <span className="font-bold block text-[11px] text-[#1A2E1E]">Repetir en todas las páginas</span>
                    <span className="text-[10px] text-[#765747]">
                      {config.repeatHeaderOnAllPages ? 'Activo (Recomendado para salón)' : 'Solo en la página 1'}
                    </span>
                  </div>
                </label>
              </div>

              {/* 4. Orden de Categorías */}
              <div className="bg-white p-3 rounded-xl border border-[#D8CBB6] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#1A2E1E]">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#2F5233]" />
                    <span>Orden Categorías</span>
                  </span>
                  <span className="text-[10px] text-[#765747]">▲ / ▼</span>
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
                            : 'bg-[#FAF7F2] border-[#D8CBB6] text-[#1A2E1E]'
                        }`}
                      >
                        <span className="font-bold truncate max-w-[100px]">
                          {index + 1}. {cat.name}
                        </span>

                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => toggleCategoryVisibility(cat.id)}
                            className="p-1 hover:bg-white rounded text-[#765747]"
                            title={isHidden ? 'Mostrar categoría' : 'Ocultar categoría'}
                          >
                            {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveCategory(index, 'up')}
                            className="p-1 hover:bg-white disabled:opacity-30 rounded text-[#2F5233]"
                            title="Subir"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === config.categoryOrder.length - 1}
                            onClick={() => moveCategory(index, 'down')}
                            className="p-1 hover:bg-white disabled:opacity-30 rounded text-[#2F5233]"
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

        {/* Scrollable Modal Body (On-screen visual preview) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F4EFDF]/40 print:overflow-visible print:p-0 print:block print:bg-transparent">
          {/* Notice indicating repeating header */}
          {config.repeatHeaderOnAllPages && (
            <div className="max-w-[840px] mx-auto mb-3 flex items-center justify-center gap-2 bg-[#EBF1EA] border border-[#2F5233]/20 py-1.5 px-3 rounded-xl text-xs text-[#2F5233] font-bold shadow-2xs print:hidden">
              <Check className="w-3.5 h-3.5 text-[#2F5233]" />
              <span>
                Encabezado institucional configurado para repetirse en todas las hojas A4 (impresión y Word).
              </span>
            </div>
          )}

          {/* Printable Document Sheet */}
          <div
            id="printable-menu-area"
            ref={printRef}
            className="bg-[#FAF7F2] text-[#2C221E] font-sans p-4 sm:p-8 rounded-xl shadow-lg border border-[#E0D8C3] w-full max-w-[840px] mx-auto space-y-6"
          >
            {/* Header section */}
            <div className="space-y-3 text-center">
              <div className="bg-gradient-to-br from-[#122315] via-[#244128] to-[#122315] rounded-2xl p-6 text-white text-center shadow-sm border-2 border-[#D8E4C3]">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#244128] bg-[#D8E4C3] px-3 py-1 rounded-full inline-block mb-1.5">
                  Pastelería Artesanal & Cafetería de Especialidad
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-[#FFFDF8] drop-shadow-sm">
                  {config.title}
                </h1>
                <p className="text-xs text-[#E2EAD2] font-semibold mt-0.5">{config.subtitle}</p>
              </div>

              {/* Sub-header info bar */}
              <div className="flex flex-wrap items-center justify-between border-y-2 border-[#2F5233]/20 py-2 px-3 text-xs text-[#2F5233] font-bold bg-[#EBF1EA] rounded-lg">
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
                  <span>Elaboración Libre de Gluten</span>
                </div>
              </div>
            </div>

            {/* Showcase */}
            {config.experienceText && (
              <div className="bg-[#F3EBDD] border border-[#D8CBB6] border-l-4 border-l-[#765747] rounded-lg p-2.5 text-xs text-[#4A352C]">
                <strong className="text-[#1A2E1E]">✨ Experiencia {config.title}:</strong> {config.experienceText}
              </div>
            )}

            {/* Helper to render Combos Section in Visual Preview */}
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
                  <section className="bg-[#FDF9F0] border-2 border-[#D4A373] rounded-2xl p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-[#E5CCA7] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏷️</span>
                        <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#8C4B18] font-serif">
                          Combos & Promociones Especiales
                        </h2>
                      </div>
                      <span className="text-[10px] font-bold text-[#A06428] bg-[#FDE68A]/60 border border-[#F59E0B]/40 px-2 py-0.5 rounded-full">
                        {allCombos.length} Combos Disponibles
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {allCombos.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white p-3 rounded-xl border border-[#E5CCA7] flex flex-col justify-between hover:border-[#8C4B18]/50 transition-colors shadow-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="font-bold text-xs text-[#1A2E1E] flex items-center gap-1">
                                <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-1 rounded">
                                  COMBO
                                </span>
                                {item.name}
                                {item.isFeatured && <span className="text-amber-500 text-xs">★</span>}
                              </span>
                              <span className="font-mono font-extrabold text-xs text-[#2F5233] shrink-0">
                                {formatCurrency(item.price)}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-[11px] text-[#554740] font-serif leading-snug">{item.description}</p>
                            )}
                            {item.compositeItems && item.compositeItems.length > 0 && (
                              <div className="text-[10px] text-[#2F5233] bg-[#EBF1EA] p-1.5 rounded-md font-semibold mt-1">
                                <strong className="text-[#1A2E1E]">Incluye:</strong>{' '}
                                {item.compositeItems
                                  .map((ci) => `${ci.quantity > 1 ? ci.quantity + 'x ' : ''}${ci.productName}`)
                                  .join(' + ')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              };

              // Helper to render Category preview
              const renderCategoryPreview = (cat: Category) => {
                const catProducts = getProductsForCategory(cat.id);
                if (catProducts.length === 0) return null;

                return (
                  <section key={cat.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#2F5233]/40" />
                      <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-white font-serif px-4 py-1 bg-[#2F5233] rounded-full shadow-xs">
                        {cat.name}
                      </h2>
                      <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#2F5233]/40" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {catProducts.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white p-3 rounded-xl border border-[#E0D8C3] flex flex-col justify-between hover:border-[#2F5233]/40 transition-colors shadow-xs"
                        >
                          <div className="space-y-0.5">
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

                  {orderedCategories.map((cat) => (
                    <React.Fragment key={cat.id}>
                      {renderCategoryPreview(cat)}
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

            {/* Footer Tradicional */}
            <div className="pt-4 border-t-2 border-[#2F5233]/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#2F5233]">
              <div className="font-serif">
                <strong className="text-[#1A2E1E]">{config.title}</strong> • Pastelería Artesanal & Cafetería de
                Especialidad
              </div>
              <div className="text-right text-[11px] text-[#765747] font-semibold">{config.footerNote}</div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#FAF7F2] border-t border-[#E5DEC9] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#765747] print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
              💡 Tip
            </span>
            <span>
              La cabecera saldrá al inicio de cada hoja A4 impresa o en Word para mantener la identidad institucional.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportWord}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                wordExportSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {wordExportSuccess ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              <span>{wordExportSuccess ? '¡Word Descargado!' : 'Descargar en Word (.doc)'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" /> Imprimir / PDF
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#D2C5A5] text-[#2C221E] font-bold hover:bg-[#EBF1EA] transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
