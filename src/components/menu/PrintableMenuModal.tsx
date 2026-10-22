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
  Edit3,
  CheckCircle2,
  Palette,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/currency';
import { Category, Product } from '../../types';
import { MENU_TEMPLATES, MenuTemplateId, getMenuTemplate } from './menuTemplates';

interface PrintableMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ComboPosition = 'top' | 'after-cafeteria' | 'bottom' | 'inline' | 'hidden';

interface MenuPrintConfig {
  templateId: MenuTemplateId;
  comboPosition: ComboPosition;
  categoryOrder: string[];
  hiddenCategoryIds: string[];
  title: string;
  subtitle: string;
  experienceText: string;
  footerNote: string;
  repeatHeaderOnAllPages: boolean;
}

interface ItemOverride {
  name?: string;
  price?: number;
  description?: string;
  isExcluded?: boolean;
}

interface MenuEdits {
  itemOverrides: Record<string, ItemOverride>;
  productOrderPerCategory: Record<string, string[]>;
  comboOrder: string[];
}

type PrintableProduct = Product & { isExcluded?: boolean };

const CONFIG_STORAGE_KEY = 'hilos_de_amor_printable_menu_config';
const EDITS_STORAGE_KEY = 'hilos_de_amor_printable_menu_edits';

export const PrintableMenuModal: React.FC<PrintableMenuModalProps> = ({ isOpen, onClose }) => {
  const { categories, products } = useApp();
  const printRef = useRef<HTMLDivElement>(null);

  const [showConfig, setShowConfig] = useState(false);
  const [configTab, setConfigTab] = useState<'templates' | 'combos' | 'header' | 'pagination' | 'sections'>('templates');
  const [isEditMode, setIsEditMode] = useState(false);
  const [wordExportSuccess, setWordExportSuccess] = useState(false);

  // Configuration state
  const [config, setConfig] = useState<MenuPrintConfig>(() => {
    const defaultConfig: MenuPrintConfig = {
      templateId: 'haute-patisserie',
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
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
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
          templateId: parsed.templateId || 'haute-patisserie',
          repeatHeaderOnAllPages: parsed.repeatHeaderOnAllPages !== undefined ? parsed.repeatHeaderOnAllPages : true,
          categoryOrder: mergedOrder.length > 0 ? mergedOrder : defaultConfig.categoryOrder,
        };
      }
    } catch {
      // fallback to default
    }
    return defaultConfig;
  });

  // Inline edits state (names, prices, descriptions, exclusions, custom order)
  const [edits, setEdits] = useState<MenuEdits>(() => {
    const defaultEdits: MenuEdits = {
      itemOverrides: {},
      productOrderPerCategory: {},
      comboOrder: [],
    };
    try {
      const saved = localStorage.getItem(EDITS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          itemOverrides: parsed.itemOverrides || {},
          productOrderPerCategory: parsed.productOrderPerCategory || {},
          comboOrder: parsed.comboOrder || [],
        };
      }
    } catch {
      // fallback
    }
    return defaultEdits;
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
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('Could not save menu print config', e);
    }
  }, [config]);

  // Persist edits in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(EDITS_STORAGE_KEY, JSON.stringify(edits));
    } catch (e) {
      console.warn('Could not save menu print edits', e);
    }
  }, [edits]);

  if (!isOpen) return null;

  const activeTemplate = getMenuTemplate(config.templateId);

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

  // Helper to get effective item data merged with custom edits
  const getEffectiveItem = (p: Product) => {
    const override = edits.itemOverrides[p.id];
    return {
      ...p,
      name: override?.name !== undefined ? override.name : p.name,
      price: override?.price !== undefined ? override.price : p.price,
      description: override?.description !== undefined ? override.description : (p.description || ''),
      isExcluded: Boolean(override?.isExcluded),
    };
  };

  // Extract combos & sorted categories
  const rawCombos = products.filter((p) => p.isAvailable && isProductCombo(p)).map(getEffectiveItem);

  // Apply custom combo ordering
  const allCombos = [...rawCombos].sort((a, b) => {
    const order = edits.comboOrder;
    if (order.length === 0) return 0;
    const idxA = order.indexOf(a.id);
    const idxB = order.indexOf(b.id);
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  // Ordered categories based on config
  const orderedCategories = config.categoryOrder
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is Category => c !== undefined && !config.hiddenCategoryIds.includes(c.id));

  // Category products helper: merges custom overrides and user ordering
  const getProductsForCategory = (catId: string, forPrint = false) => {
    const rawProds = products
      .filter((p) => {
        if (!p.isAvailable || p.categoryId !== catId) return false;
        if (config.comboPosition !== 'inline' && isProductCombo(p)) return false;
        return true;
      })
      .map(getEffectiveItem);

    // Apply custom product order within this category
    const catOrder = edits.productOrderPerCategory[catId] || [];
    const sorted = [...rawProds].sort((a, b) => {
      if (catOrder.length === 0) return 0;
      const idxA = catOrder.indexOf(a.id);
      const idxB = catOrder.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    if (forPrint) {
      // In print/Word mode, omit excluded products completely
      return sorted.filter((p) => !p.isExcluded);
    }
    return sorted;
  };

  // Inline Edits Handlers
  const handleUpdateItemName = (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setEdits((prev) => ({
      ...prev,
      itemOverrides: {
        ...prev.itemOverrides,
        [id]: {
          ...prev.itemOverrides[id],
          name: trimmed,
        },
      },
    }));
  };

  const handleUpdateItemPrice = (id: string, price: number) => {
    if (isNaN(price) || price < 0) return;
    setEdits((prev) => ({
      ...prev,
      itemOverrides: {
        ...prev.itemOverrides,
        [id]: {
          ...prev.itemOverrides[id],
          price,
        },
      },
    }));
  };

  const handleUpdateItemDesc = (id: string, description: string) => {
    setEdits((prev) => ({
      ...prev,
      itemOverrides: {
        ...prev.itemOverrides,
        [id]: {
          ...prev.itemOverrides[id],
          description: description.trim(),
        },
      },
    }));
  };

  const handleToggleItemExclusion = (id: string) => {
    setEdits((prev) => {
      const current = Boolean(prev.itemOverrides[id]?.isExcluded);
      return {
        ...prev,
        itemOverrides: {
          ...prev.itemOverrides,
          [id]: {
            ...prev.itemOverrides[id],
            isExcluded: !current,
          },
        },
      };
    });
  };

  const handleMoveProduct = (catId: string, currentIndex: number, direction: 'up' | 'down') => {
    const prods = getProductsForCategory(catId, false);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= prods.length) return;

    const currentOrder = prods.map((p) => p.id);
    const temp = currentOrder[currentIndex];
    currentOrder[currentIndex] = currentOrder[targetIndex];
    currentOrder[targetIndex] = temp;

    setEdits((prev) => ({
      ...prev,
      productOrderPerCategory: {
        ...prev.productOrderPerCategory,
        [catId]: currentOrder,
      },
    }));
  };

  const handleMoveCombo = (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= allCombos.length) return;

    const currentOrder = allCombos.map((c) => c.id);
    const temp = currentOrder[currentIndex];
    currentOrder[currentIndex] = currentOrder[targetIndex];
    currentOrder[targetIndex] = temp;

    setEdits((prev) => ({
      ...prev,
      comboOrder: currentOrder,
    }));
  };

  const handleResetAllEdits = () => {
    if (window.confirm('¿Restablecer todos los nombres, precios y orden editados a sus valores originales del sistema?')) {
      setEdits({
        itemOverrides: {},
        productOrderPerCategory: {},
        comboOrder: [],
      });
      localStorage.removeItem(EDITS_STORAGE_KEY);
    }
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
      templateId: 'haute-patisserie',
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
    localStorage.removeItem(CONFIG_STORAGE_KEY);
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
    const ts = activeTemplate.styles;

    const formatCatNum = (index: number) => {
      if (ts.categoryHeader.numeralFormat === 'roman') return `${toRoman(index + 1)}. &nbsp; `;
      if (ts.categoryHeader.numeralFormat === 'decimal') return `${String(index + 1).padStart(2, '0')}. &nbsp; `;
      return '';
    };

    // Render Combos / Maridajes HTML Block
    const renderCombosHTML = () => {
      const printableCombos = allCombos.filter((c) => !c.isExcluded);
      if (printableCombos.length === 0 || config.comboPosition === 'hidden' || config.comboPosition === 'inline') {
        return '';
      }

      return `
        <div class="combos-curated-box">
          <div class="combos-box-inner">
            <div class="combos-crest">${ts.headerDividerSymbol} &nbsp; SELECCIÓN DE LA CASA &nbsp; ${ts.headerDividerSymbol}</div>
            <h2 class="combos-title">Combos y Promociones</h2>
            <div class="combos-desc-bar">Combinaciones sugeridas por nuestro barista y maestro pastelero</div>

            <div class="products-grid-curated">
              ${printableCombos
                .map(
                  (item) => `
                <div class="product-item-curated">
                  <div class="product-header-line">
                    <span class="product-name-curated">
                      <span class="duo-tag">COMBO</span> ${item.name}
                      ${item.isFeatured ? `<span class="star-accent">${ts.headerDividerSymbol}</span>` : ''}
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
      const catProds = getProductsForCategory(cat.id, true);
      if (catProds.length === 0) return '';

      return `
        <div class="category-block">
          <div class="category-header-curated">
            <div class="hairline"></div>
            <h2 class="category-heading">${formatCatNum(index)}${cat.name.toUpperCase()}</h2>
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
                    ${item.isFeatured ? `<span class="star-accent">${ts.headerDividerSymbol}</span>` : ''}
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
      bodyCategoriesHTML += orderedCategories.map((c, i) => renderCategoryHTML(c, i)).join('');
    }

    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Carta Menú - ${config.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,600&display=swap');
            
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
              font-family: ${ts.fontFamily};
              background-color: ${ts.sheetBg};
              color: ${ts.textColor};
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
              background: ${ts.sheetBg};
            }

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

            .editorial-header {
              text-align: center;
              padding: 8px 0 6px 0;
              border-bottom: 1.5px solid ${ts.accentColor};
              margin-bottom: 12px;
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .brand-title {
              font-family: ${ts.headingFontFamily};
              font-size: 30px;
              font-weight: 700;
              letter-spacing: 0.20em;
              color: ${ts.headingColor};
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
              color: ${ts.subheadingColor};
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
              background-color: ${ts.accentColor};
            }

            .rule-diamond {
              font-size: 9px;
              color: ${ts.accentColor};
            }

            .editorial-attributes {
              font-family: 'Montserrat', sans-serif;
              font-size: 8px;
              font-weight: 600;
              letter-spacing: 0.16em;
              text-transform: uppercase;
              color: ${ts.subheadingColor};
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 14px;
              margin-top: 5px;
            }

            .editorial-attributes span.bullet {
              color: ${ts.accentColor};
              font-size: 9px;
            }

            .experience-quote {
              font-family: ${ts.headingFontFamily};
              font-style: italic;
              font-size: 11px;
              color: ${ts.descColor};
              text-align: center;
              margin: 6px auto 2px auto;
              max-width: 90%;
              line-height: 1.3;
            }

            .combos-curated-box {
              border: 1px solid ${ts.combos.border};
              padding: 2.5px;
              margin-bottom: 14px;
              background-color: ${ts.combos.bg};
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .combos-box-inner {
              border: 0.5px solid ${ts.combos.innerBorder};
              padding: 9px 12px;
              text-align: center;
            }

            .combos-crest {
              font-family: 'Montserrat', sans-serif;
              font-size: 7.5px;
              font-weight: 700;
              letter-spacing: 0.28em;
              color: ${ts.combos.crestColor};
              text-transform: uppercase;
              margin-bottom: 1px;
            }

            .combos-title {
              font-family: ${ts.headingFontFamily};
              font-size: 14px;
              font-weight: 700;
              letter-spacing: 0.12em;
              text-transform: uppercase;
              color: ${ts.combos.titleColor};
              margin-bottom: 1px;
            }

            .combos-desc-bar {
              font-family: 'Montserrat', sans-serif;
              font-size: 7.5px;
              letter-spacing: 0.08em;
              color: ${ts.combos.descColor};
              margin-bottom: 8px;
            }

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
              background-color: ${ts.accentColor};
              opacity: 0.7;
            }

            .category-heading {
              font-family: ${ts.headingFontFamily};
              font-size: 13px;
              font-weight: 700;
              letter-spacing: 0.24em;
              text-transform: uppercase;
              color: ${ts.headingColor};
              white-space: nowrap;
            }

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
              font-family: ${ts.headingFontFamily};
              font-size: 12px;
              font-weight: 700;
              color: ${ts.textColor};
              white-space: nowrap;
            }

            .star-accent {
              color: ${ts.accentColor};
              font-size: 9px;
              margin-left: 2px;
            }

            .duo-tag {
              font-family: 'Montserrat', sans-serif;
              font-size: 7px;
              font-weight: 800;
              letter-spacing: 0.1em;
              color: ${ts.combos.tagColor};
              background: ${ts.combos.tagBg};
              border: 0.5px solid ${ts.combos.tagBorder};
              padding: 0.5px 3px;
              border-radius: 2px;
              vertical-align: middle;
              margin-right: 3px;
            }

            .dot-leader {
              flex: 1;
              border-bottom: 1px ${ts.dotLeaderStyle} ${ts.dotLeaderColor};
              height: 1px;
              min-width: 10px;
              margin-bottom: 2px;
            }

            .product-price-curated {
              font-family: ${ts.headingFontFamily};
              font-size: 12.5px;
              font-weight: 700;
              color: ${ts.priceColor};
              white-space: nowrap;
            }

            .product-desc-curated {
              font-family: 'Montserrat', sans-serif;
              font-size: 8px;
              font-weight: 400;
              color: ${ts.descColor};
              line-height: 1.25;
              margin-top: 1px;
              padding-right: 6px;
            }

            .combo-composition {
              font-family: 'Montserrat', sans-serif;
              font-size: 7.5px;
              color: ${ts.combos.maridajeText};
              background: ${ts.combos.maridajeBg};
              border-left: 2px solid ${ts.combos.maridajeBorder};
              padding: 2px 5px;
              margin-top: 2px;
              line-height: 1.2;
            }

            .composition-label {
              font-weight: 700;
              color: ${ts.accentColor};
              text-transform: uppercase;
              font-size: 7px;
              letter-spacing: 0.05em;
            }

            .editorial-footer {
              border-top: 1px solid ${ts.accentColor};
              padding-top: 6px;
              margin-top: 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-family: 'Montserrat', sans-serif;
              font-size: 8px;
              letter-spacing: 0.08em;
              color: ${ts.subheadingColor};
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .footer-brand {
              font-family: ${ts.headingFontFamily};
              font-weight: 700;
              font-size: 10px;
              letter-spacing: 0.14em;
              text-transform: uppercase;
              color: ${ts.headingColor};
            }

            @media print {
              @page {
                size: A4 portrait;
                margin: 8mm 9mm 8mm 9mm;
              }
              html, body {
                background: ${ts.sheetBg} !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
              }
              .sheet {
                background: ${ts.sheetBg} !important;
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
                    <!-- Editorial Header -->
                    <div class="editorial-header">
                      <h1 class="brand-title">${config.title}</h1>
                      <div class="brand-subtitle">${config.subtitle}</div>

                      <div class="double-french-rule">
                        <div class="rule-line"></div>
                        <div class="rule-diamond">${ts.headerDividerSymbol}</div>
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
    const wt = activeTemplate.wordStyles;
    const ts = activeTemplate.styles;

    const formatCatNum = (index: number) => {
      if (ts.categoryHeader.numeralFormat === 'roman') return `${toRoman(index + 1)}. &nbsp; `;
      if (ts.categoryHeader.numeralFormat === 'decimal') return `${String(index + 1).padStart(2, '0')}. &nbsp; `;
      return '';
    };

    const generateWordProductsTable = (items: PrintableProduct[]) => {
      const printableItems = items.filter((p) => !p.isExcluded);
      let rows = '';
      for (let i = 0; i < printableItems.length; i += 2) {
        const item1 = printableItems[i];
        const item2 = printableItems[i + 1];

        const renderCell = (it?: PrintableProduct) => {
          if (!it) {
            return `<td style="width: 50%; padding: 4pt 8pt; border: none;"></td>`;
          }

          const includesHTML =
            it.compositeItems && it.compositeItems.length > 0
              ? `<div style="font-family: ${wt.fontBody}; font-size: 7.5pt; color: ${ts.combos.maridajeText}; background-color: ${ts.combos.maridajeBg}; border-left: 2pt solid ${ts.combos.maridajeBorder}; padding: 2pt 5pt; margin-top: 2pt;">
                   <strong style="color: ${ts.accentColor};">MARIDAJE:</strong> ${it.compositeItems
                     .map((ci) => `${ci.quantity > 1 ? ci.quantity + 'x ' : ''}${ci.productName}`)
                     .join(' + ')}
                 </div>`
              : '';

          return `
            <td style="width: 50%; padding: 4pt 8pt; vertical-align: top; border: none;">
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 1pt;">
                <tr>
                  <td style="font-family: ${wt.fontHeading}; font-size: 11pt; font-weight: bold; color: ${wt.textColor}; text-align: left; padding: 0;">
                    ${it.name} ${it.isFeatured ? `<span style="color: ${ts.accentColor};">${ts.headerDividerSymbol}</span>` : ''}
                  </td>
                  <td style="border-bottom: 1pt ${ts.dotLeaderStyle} ${ts.dotLeaderColor}; width: 30%; padding: 0 4pt;"></td>
                  <td style="font-family: ${wt.fontHeading}; font-size: 11pt; font-weight: bold; color: ${wt.priceColor}; text-align: right; white-space: nowrap; padding: 0;">
                    $ ${it.price.toLocaleString('es-AR')}
                  </td>
                </tr>
              </table>
              ${
                it.description
                  ? `<div style="font-family: ${wt.fontBody}; font-size: 8pt; color: ${wt.descColor}; line-height: 1.25; margin-top: 1pt;">${it.description}</div>`
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

    const renderCombosWord = () => {
      const printableCombos = allCombos.filter((c) => !c.isExcluded);
      if (printableCombos.length === 0 || config.comboPosition === 'hidden' || config.comboPosition === 'inline') {
        return '';
      }

      return `
        <div style="border: 1pt solid ${wt.comboBorder}; background-color: ${wt.comboBg}; padding: 3pt; margin-bottom: 12pt;">
          <table style="width: 100%; border: 0.5pt solid ${ts.combos.innerBorder}; border-collapse: collapse; padding: 6pt;">
            <tr>
              <td style="text-align: center; padding: 6pt 4pt 4pt 4pt;">
                <div style="font-family: ${wt.fontBody}; font-size: 7.5pt; font-weight: bold; letter-spacing: 2pt; color: ${ts.combos.crestColor};">
                  ${ts.headerDividerSymbol} &nbsp; SELECCIÓN DE LA CASA &nbsp; ${ts.headerDividerSymbol}
                </div>
                <div style="font-family: ${wt.fontHeading}; font-size: 13pt; font-weight: bold; color: ${ts.combos.titleColor}; text-transform: uppercase;">
                  Combos y Promociones
                </div>
                <div style="font-family: ${wt.fontBody}; font-size: 7.5pt; color: ${ts.combos.descColor}; margin-bottom: 6pt;">
                  Combinaciones sugeridas por nuestro barista y maestro pastelero
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 2pt 4pt 6pt 4pt;">
                ${generateWordProductsTable(printableCombos)}
              </td>
            </tr>
          </table>
        </div>
      `;
    };

    const renderCategoryWord = (cat: Category, index: number) => {
      const catProds = getProductsForCategory(cat.id, true);
      if (catProds.length === 0) return '';

      return `
        <div style="margin-top: 8pt; margin-bottom: 4pt;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 6pt;">
            <tr>
              <td style="border-bottom: 1pt solid ${wt.accentColor}; width: 25%;"></td>
              <td style="font-family: ${wt.fontHeading}; font-size: 11.5pt; font-weight: bold; text-transform: uppercase; color: ${wt.headingColor}; text-align: center; padding: 2pt 12pt; width: 50%;">
                ${formatCatNum(index)}${cat.name.toUpperCase()}
              </td>
              <td style="border-bottom: 1pt solid ${wt.accentColor}; width: 25%;"></td>
            </tr>
          </table>
          ${generateWordProductsTable(catProds)}
        </div>
      `;
    };

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
              font-family: ${wt.fontBody};
              color: ${wt.textColor};
              background-color: ${wt.bgColor};
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body style="background-color: ${wt.bgColor}; margin: 0; padding: 10pt;">
          <div class="WordSection1">
            <table style="width: 100%; border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0;">
              <thead>
                <tr style="${config.repeatHeaderOnAllPages ? 'mso-table-header: yes;' : ''} page-break-inside: avoid;">
                  <td style="padding-bottom: 8pt;">
                    <!-- Editorial Header -->
                    <table style="width: 100%; border-bottom: 1.5pt solid ${wt.accentColor}; border-collapse: collapse; margin-bottom: 8pt; text-align: center;">
                      <tr>
                        <td style="padding: 6pt 10pt 8pt 10pt; text-align: center;">
                          <div style="font-family: ${wt.fontHeading}; font-size: 26pt; font-weight: bold; letter-spacing: 4pt; color: ${wt.titleColor}; text-transform: uppercase; margin: 2pt 0;">
                            ${config.title}
                          </div>
                          <div style="font-family: ${wt.fontBody}; font-size: 8pt; letter-spacing: 2pt; text-transform: uppercase; color: ${wt.subtitleColor}; margin-bottom: 6pt;">
                            ${config.subtitle}
                          </div>
                          <div style="font-family: ${wt.fontBody}; font-size: 7.5pt; letter-spacing: 1.5pt; text-transform: uppercase; color: ${wt.subtitleColor};">
                            Granos 100% Arábica de Altura &nbsp;•&nbsp; Cocina Libre de Gluten &nbsp;•&nbsp; San Juan, Argentina
                          </div>
                          ${
                            config.experienceText
                              ? `
                            <div style="font-family: ${wt.fontHeading}; font-style: italic; font-size: 10pt; color: ${wt.descColor}; margin-top: 5pt;">
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
                    <table style="width: 100%; border-top: 1pt solid ${wt.accentColor}; margin-top: 6pt; padding-top: 4pt; font-family: ${wt.fontBody}; font-size: 7.5pt; color: ${wt.subtitleColor};">
                      <tr>
                        <td style="text-align: left; font-family: ${wt.fontHeading}; font-weight: bold; font-size: 9pt; color: ${wt.headingColor};">
                          ${config.title} • Carta Oficial de Salón
                        </td>
                        <td style="text-align: right; color: ${wt.subtitleColor};">
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in print:static print:block print:inset-auto print:overflow-visible print:bg-white print:p-0">
      {/* Container Dialog */}
      <div className="bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#D8C7B0] w-full max-w-5xl h-[92vh] max-h-[92vh] flex flex-col overflow-hidden text-[#1A1412] print:h-auto print:max-h-none print:w-full print:block print:overflow-visible print:border-none print:shadow-none print:bg-transparent">
        {/* Modal Toolbar (Hidden during print) */}
        <div className="shrink-0 bg-[#122315] text-[#FAF8F5] p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5 shadow-md print:hidden border-b border-[#C5A880]/30">
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
                {products.filter((p) => p.isAvailable).length} productos disponibles &bull; {allCombos.length} combos detectados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Inline WYSIWYG Editing Toggle Button */}
            <button
              onClick={() => {
                const nextEdit = !isEditMode;
                setIsEditMode(nextEdit);
                if (nextEdit) {
                  setShowConfig(false); // Close config drawer when editing so user has full view
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                isEditMode
                  ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 font-black ring-2 ring-amber-200'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
              title="Permite hacer clic directamente en cualquier texto o precio de la carta para editarlo"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditMode ? 'Guardar / Salir de Edición' : '✏️ Editar Textos y Precios'}</span>
            </button>

            {/* Template Selector Button */}
            <button
              onClick={() => {
                if (showConfig && configTab === 'templates') {
                  setShowConfig(false);
                } else {
                  setShowConfig(true);
                  setConfigTab('templates');
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                showConfig && configTab === 'templates'
                  ? 'bg-amber-400 text-stone-950 font-black ring-2 ring-amber-200'
                  : 'bg-white/10 hover:bg-white/20 text-[#FAF8F5] border border-[#C5A880]/30'
              }`}
              title="Elegir entre 10 estilos de cartas de salón"
            >
              <Palette className="w-4 h-4 text-[#E6D4B8]" />
              <span className="hidden sm:inline">Diseño:</span>
              <span className="font-serif underline underline-offset-2">{activeTemplate.name}</span>
            </button>

            {/* General Settings Drawer Button */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                showConfig && configTab !== 'templates'
                  ? 'bg-[#C5A880] text-[#122315] shadow-md font-extrabold ring-2 ring-[#E6D4B8]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Ajustar paginación, ubicación de combos y orden de secciones"
            >
              <Settings2 className="w-4 h-4" />
              <span>{showConfig ? 'Cerrar Ajustes' : 'Ajustes Generales'}</span>
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

        {/* Collapsible Customizer Drawer (Fixed height & no clipping) */}
        {showConfig && (
          <div className="shrink-0 bg-[#F4EFE6] border-b border-[#D8C7B0] p-4 text-[#1A1412] space-y-3.5 print:hidden animate-fade-in shadow-inner max-h-[42vh] overflow-y-auto">
            {/* Drawer Top Row: Tabs & Reset */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#D8C7B0]/80 pb-2.5">
              {/* Tab Navigation */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setConfigTab('templates')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    configTab === 'templates'
                      ? 'bg-[#8C6239] text-white shadow-xs'
                      : 'text-[#6E645D] hover:text-[#122315] hover:bg-white/60'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>10 Diseños de Carta</span>
                  <span className="text-[10px] bg-amber-400 text-stone-950 font-black px-1.5 py-0.2 rounded-full ml-0.5">10</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfigTab('combos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    configTab === 'combos'
                      ? 'bg-[#8C6239] text-white shadow-xs'
                      : 'text-[#6E645D] hover:text-[#122315] hover:bg-white/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Combos y Promos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfigTab('header')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    configTab === 'header'
                      ? 'bg-[#8C6239] text-white shadow-xs'
                      : 'text-[#6E645D] hover:text-[#122315] hover:bg-white/60'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Membrete de Salón</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfigTab('pagination')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    configTab === 'pagination'
                      ? 'bg-[#8C6239] text-white shadow-xs'
                      : 'text-[#6E645D] hover:text-[#122315] hover:bg-white/60'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Paginación Editorial</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfigTab('sections')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    configTab === 'sections'
                      ? 'bg-[#8C6239] text-white shadow-xs'
                      : 'text-[#6E645D] hover:text-[#122315] hover:bg-white/60'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Orden de Secciones</span>
                </button>
              </div>

              {/* Reset to defaults */}
              <button
                onClick={resetConfig}
                className="text-xs text-[#7A6F66] hover:text-[#122315] flex items-center gap-1 font-semibold underline underline-offset-2 shrink-0 ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restablecer opciones
              </button>
            </div>

            {/* TAB 1: 10 Diseños de Carta */}
            {configTab === 'templates' && (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#6E645D] gap-1">
                  <span>
                    Elige el estilo visual de tu carta. Cambia automáticamente colores, tipografías, filetes y estilo tanto en pantalla como al imprimir y descargar en Word.
                  </span>
                  <span className="font-bold text-[#8C6239] shrink-0">
                    Estilo actual: <u>{activeTemplate.name}</u>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
                  {MENU_TEMPLATES.map((tmpl) => {
                    const isSelected = config.templateId === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => setConfig((prev) => ({ ...prev, templateId: tmpl.id }))}
                        className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between group relative cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/90 border-[#8C6239] shadow-md ring-2 ring-[#8C6239]'
                            : 'bg-white hover:bg-stone-50 border-[#D8C7B0] hover:border-[#8C6239]/50 shadow-xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span
                              className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider ${
                                isSelected
                                  ? 'bg-[#8C6239] text-white'
                                  : 'bg-stone-100 text-stone-600 group-hover:bg-amber-100/70'
                              }`}
                            >
                              {tmpl.badge}
                            </span>
                            {isSelected && (
                              <span className="flex items-center gap-1 text-[10px] font-black text-[#8C6239]">
                                <Check className="w-3 h-3 text-[#8C6239]" /> Activo
                              </span>
                            )}
                          </div>

                          {/* 4-Color Swatch */}
                          <div className="flex h-3 rounded-md overflow-hidden border border-black/10 mb-2 shadow-2xs">
                            {tmpl.palettePreview.map((col, idx) => (
                              <div key={idx} className="flex-1 h-full" style={{ backgroundColor: col }} />
                            ))}
                          </div>

                          <h4 className="font-bold text-xs text-[#122315] font-serif leading-tight">
                            {tmpl.name}
                          </h4>
                          <p className="text-[10px] text-[#7A6F66] mt-1 line-clamp-2 leading-tight">
                            {tmpl.description}
                          </p>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-stone-200/80 flex items-center justify-between text-[10px] font-bold text-[#8C6239]">
                          <span>{isSelected ? '✓ En uso' : 'Usar este estilo'}</span>
                          <span className="text-xs group-hover:translate-x-0.5 transition-transform">→</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Combos y Promociones */}
            {configTab === 'combos' && (
              <div className="max-w-xl bg-white p-4 rounded-xl border border-[#D8C7B0] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8C6239]">
                  <Sparkles className="w-4 h-4 text-[#A07844]" />
                  <span>Ubicación de Combos y Promociones</span>
                </div>
                <p className="text-xs text-[#6E645D] leading-relaxed">
                  Para no mezclar combos con productos individuales (como medialunas o tartas sueltas), los combos se agrupan en una sección destacada con filete de autor.
                </p>
                <div className="pt-1">
                  <label className="text-[11px] font-bold text-[#7A6F66] uppercase block mb-1">
                    Posición en la Carta Física y Word:
                  </label>
                  <select
                    value={config.comboPosition}
                    onChange={(e) => setConfig({ ...config, comboPosition: e.target.value as ComboPosition })}
                    className="w-full text-xs font-serif font-bold bg-[#FAF8F5] border border-[#D8C7B0] rounded-lg p-2.5 focus:ring-2 focus:ring-[#8C6239] outline-none text-[#1A1412]"
                  >
                    <option value="top">✦ Al inicio de la carta (Portada destacada de autor)</option>
                    <option value="after-cafeteria">☕ Justo después de Cafetería</option>
                    <option value="bottom">📌 Al final de la carta</option>
                    <option value="inline">🔀 Mezclados dentro de su categoría original</option>
                    <option value="hidden">🚫 Ocultar combos en la carta física</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB 3: Membrete de Salón */}
            {configTab === 'header' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-[#D8C7B0] shadow-xs space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#122315]">
                    <FileText className="w-4 h-4 text-[#8C6239]" />
                    <span>Datos Institucionales del Salón</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#7A6F66] uppercase">Título de la Casa</label>
                      <input
                        type="text"
                        value={config.title}
                        onChange={(e) => setConfig({ ...config, title: e.target.value })}
                        className="w-full text-xs font-serif font-bold bg-[#FAF8F5] border border-[#D8C7B0] rounded-md px-2.5 py-1.5 outline-none text-[#122315]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#7A6F66] uppercase">Bajada / Rubro</label>
                      <input
                        type="text"
                        value={config.subtitle}
                        onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                        className="w-full text-xs bg-[#FAF8F5] border border-[#D8C7B0] rounded-md px-2.5 py-1.5 outline-none text-[#1A1412]"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#D8C7B0] shadow-xs space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#122315]">
                    <FileText className="w-4 h-4 text-[#8C6239]" />
                    <span>Manifiesto y Pie de Página</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#7A6F66] uppercase">Cita / Manifiesto de Calidad</label>
                      <input
                        type="text"
                        value={config.experienceText}
                        onChange={(e) => setConfig({ ...config, experienceText: e.target.value })}
                        className="w-full text-xs font-serif italic bg-[#FAF8F5] border border-[#D8C7B0] rounded-md px-2.5 py-1.5 outline-none text-[#122315]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#7A6F66] uppercase">Nota Legal / Pie de Hoja</label>
                      <input
                        type="text"
                        value={config.footerNote}
                        onChange={(e) => setConfig({ ...config, footerNote: e.target.value })}
                        className="w-full text-xs bg-[#FAF8F5] border border-[#D8C7B0] rounded-md px-2.5 py-1.5 outline-none text-[#1A1412]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Paginación Editorial */}
            {configTab === 'pagination' && (
              <div className="max-w-xl bg-white p-4 rounded-xl border border-[#D8C7B0] shadow-xs space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#122315]">
                  <Printer className="w-4 h-4 text-[#8C6239]" />
                  <span>Paginación Editorial y Repetición de Membrete</span>
                </div>
                <p className="text-xs text-[#6E645D] leading-relaxed">
                  Configura si el título del restaurante y el membrete institucional deben repetirse automáticamente en la parte superior de cada hoja A4 al imprimir o exportar a Word.
                </p>
                <label className="flex items-start gap-3 text-xs text-[#1A1412] cursor-pointer pt-1 bg-[#FAF8F5] p-3 rounded-lg border border-[#D8C7B0]">
                  <input
                    type="checkbox"
                    checked={config.repeatHeaderOnAllPages}
                    onChange={(e) => setConfig({ ...config, repeatHeaderOnAllPages: e.target.checked })}
                    className="mt-0.5 rounded text-[#8C6239] focus:ring-[#8C6239]"
                  />
                  <div>
                    <span className="font-bold block text-xs text-[#122315]">
                      Repetir membrete institucional en todas las hojas A4
                    </span>
                    <span className="text-[11px] text-[#7A6F66]">
                      {config.repeatHeaderOnAllPages
                        ? 'Activado: cada página que salga de la impresora o en Word tendrá el membrete de la casa.'
                        : 'Desactivado: solo se mostrará en la primera página.'}
                    </span>
                  </div>
                </label>
              </div>
            )}

            {/* TAB 5: Orden de Secciones */}
            {configTab === 'sections' && (
              <div className="max-w-xl bg-white p-4 rounded-xl border border-[#D8C7B0] shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#122315]">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#8C6239]" />
                    <span>Orden y Visibilidad de Secciones</span>
                  </span>
                  <span className="text-[11px] text-[#7A6F66]">Usa ▲ / ▼ para ordenar</span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {config.categoryOrder.map((catId, index) => {
                    const cat = categories.find((c) => c.id === catId);
                    if (!cat) return null;
                    const isHidden = config.hiddenCategoryIds.includes(catId);

                    return (
                      <div
                        key={cat.id}
                        className={`flex items-center justify-between gap-2 p-2 rounded-lg border text-xs transition-colors ${
                          isHidden
                            ? 'bg-stone-100 border-stone-200 text-stone-400'
                            : 'bg-[#FAF8F5] border-[#D8CBB6] text-[#122315]'
                        }`}
                      >
                        <span className="font-bold truncate font-serif">
                          {toRoman(index + 1)}. {cat.name}
                        </span>

                        <div className="flex items-center gap-1">
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
            )}
          </div>
        )}

        {/* Informational Notification Banner when Inline Edit Mode is Active */}
        {isEditMode && (
          <div className="shrink-0 bg-amber-100 border-b border-amber-300 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-950 print:hidden animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-amber-500 text-white rounded-md">
                <Edit3 className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong>Modo Edición Directo Activado:</strong> Haz clic directamente sobre cualquier <u>nombre</u>, <u>precio</u>, <u>descripción</u> o <u>título</u> en la carta para escribir. Usa <strong>[👁️]</strong> para no imprimir un producto y <strong>[▲/▼]</strong> para reordenarlo.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetAllEdits}
                className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-amber-300 rounded-lg text-[11px] font-bold text-amber-900 transition-colors flex items-center gap-1 shadow-2xs"
              >
                <RotateCcw className="w-3 h-3" /> Restablecer al Original
              </button>
              <button
                onClick={() => setIsEditMode(false)}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Finalizar Edición
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Modal Body (Haute Pâtisserie Visual Preview with Inline Editing) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 bg-[#EFEAE2] print:overflow-visible print:p-0 print:block print:bg-transparent">
          {/* Subtle indicator of repeating header */}
          {!isEditMode && config.repeatHeaderOnAllPages && (
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
            className="p-6 sm:p-10 rounded-sm shadow-xl border w-full max-w-[820px] mx-auto space-y-6 transition-all duration-300"
            style={{
              backgroundColor: activeTemplate.styles.sheetBg,
              borderColor: activeTemplate.styles.sheetBorder,
              color: activeTemplate.styles.textColor,
              fontFamily: activeTemplate.styles.fontFamily,
              boxShadow: '0 4px 20px -2px rgba(40, 30, 20, 0.08), 0 2px 6px -1px rgba(40, 30, 20, 0.04)',
            }}
          >
            {/* Editorial Header Section */}
            <div
              className="text-center space-y-2 pb-4"
              style={{ borderBottom: `1.5px solid ${activeTemplate.styles.accentColor}` }}
            >
              <h1
                contentEditable={isEditMode}
                suppressContentEditableWarning={true}
                onBlur={(e) => setConfig((prev) => ({ ...prev, title: e.currentTarget.textContent || prev.title }))}
                className={`text-3xl sm:text-4xl font-bold tracking-[0.18em] uppercase ${
                  isEditMode ? 'cursor-text hover:bg-amber-100/60 focus:bg-amber-100/90 focus:outline-none focus:ring-1 focus:ring-[#8C6239] rounded px-1.5' : ''
                }`}
                style={{
                  color: activeTemplate.styles.headingColor,
                  fontFamily: activeTemplate.styles.headingFontFamily,
                }}
                title={isEditMode ? 'Haz clic para editar el título' : undefined}
              >
                {config.title}
              </h1>

              <p
                contentEditable={isEditMode}
                suppressContentEditableWarning={true}
                onBlur={(e) => setConfig((prev) => ({ ...prev, subtitle: e.currentTarget.textContent || prev.subtitle }))}
                className={`text-[10px] font-medium tracking-[0.22em] uppercase ${
                  isEditMode ? 'cursor-text hover:bg-amber-100/60 focus:bg-amber-100/90 focus:outline-none focus:ring-1 focus:ring-[#8C6239] rounded px-1.5' : ''
                }`}
                style={{ color: activeTemplate.styles.subheadingColor }}
                title={isEditMode ? 'Haz clic para editar la bajada' : undefined}
              >
                {config.subtitle}
              </p>

              {/* French Double Rule / Style Rule */}
              <div className="flex items-center justify-center gap-3 w-4/5 mx-auto py-1">
                <div className="h-[1px] flex-1" style={{ backgroundColor: activeTemplate.styles.accentColor }} />
                <span className="text-[10px]" style={{ color: activeTemplate.styles.accentColor }}>
                  {activeTemplate.styles.headerDividerSymbol}
                </span>
                <div className="h-[1px] flex-1" style={{ backgroundColor: activeTemplate.styles.accentColor }} />
              </div>

              {/* Attributes line */}
              <div
                className="flex flex-wrap items-center justify-center gap-3 text-[9px] font-semibold tracking-[0.14em] uppercase"
                style={{ color: activeTemplate.styles.subheadingColor }}
              >
                <span>Granos 100% Arábica de Altura</span>
                <span style={{ color: activeTemplate.styles.accentColor }}>•</span>
                <span>Cocina Artesanal Libre de Gluten</span>
                <span style={{ color: activeTemplate.styles.accentColor }}>•</span>
                <span>San Juan, Argentina</span>
              </div>

              {config.experienceText && (
                <p
                  contentEditable={isEditMode}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => setConfig((prev) => ({ ...prev, experienceText: e.currentTarget.textContent?.replace(/[«»]/g, '').trim() || prev.experienceText }))}
                  className={`text-xs italic max-w-lg mx-auto pt-1 leading-relaxed ${
                    isEditMode ? 'cursor-text hover:bg-amber-100/60 focus:bg-amber-100/90 focus:outline-none focus:ring-1 focus:ring-[#8C6239] rounded px-1.5' : ''
                  }`}
                  style={{ color: activeTemplate.styles.descColor }}
                  title={isEditMode ? 'Haz clic para editar el manifiesto de la casa' : undefined}
                >
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
                  <section
                    className="border p-1 rounded-xs shadow-2xs transition-colors"
                    style={{
                      backgroundColor: activeTemplate.styles.combos.bg,
                      borderColor: activeTemplate.styles.combos.border,
                    }}
                  >
                    <div
                      className="border p-4 text-center space-y-3"
                      style={{ borderColor: activeTemplate.styles.combos.innerBorder }}
                    >
                      <div>
                        <span
                          className="text-[9px] font-bold tracking-[0.25em] uppercase block"
                          style={{ color: activeTemplate.styles.combos.crestColor }}
                        >
                          {activeTemplate.styles.headerDividerSymbol} SELECCIÓN DE LA CASA {activeTemplate.styles.headerDividerSymbol}
                        </span>
                        <h2
                          className="text-base sm:text-lg font-bold uppercase tracking-[0.12em]"
                          style={{
                            color: activeTemplate.styles.combos.titleColor,
                            fontFamily: activeTemplate.styles.headingFontFamily,
                          }}
                        >
                          Combos y Promociones
                        </h2>
                        <p
                          className="text-[9px] tracking-wide"
                          style={{ color: activeTemplate.styles.combos.descColor }}
                        >
                          Combinaciones sugeridas por nuestro barista y maestro pastelero
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-left pt-1">
                        {allCombos.map((item, itemIdx) => (
                          <div
                            key={item.id}
                            className={`space-y-0.5 border-b sm:border-b-0 border-black/5 pb-2 sm:pb-0 transition-opacity ${
                              item.isExcluded ? 'opacity-40 line-through' : ''
                            }`}
                          >
                            <div className="flex items-baseline justify-between gap-1 w-full">
                              <span className="font-bold text-xs flex items-center gap-1.5 flex-1 min-w-0">
                                <span
                                  className="text-[8px] font-bold px-1 py-0.2 rounded-2xs shrink-0"
                                  style={{
                                    backgroundColor: activeTemplate.styles.combos.tagBg,
                                    color: activeTemplate.styles.combos.tagColor,
                                    border: `0.5px solid ${activeTemplate.styles.combos.tagBorder}`,
                                  }}
                                >
                                  COMBO
                                </span>
                                <span
                                  contentEditable={isEditMode}
                                  suppressContentEditableWarning={true}
                                  onBlur={(e) => handleUpdateItemName(item.id, e.currentTarget.textContent || item.name)}
                                  className={`truncate ${
                                    isEditMode
                                      ? 'cursor-text hover:bg-amber-100/70 focus:bg-amber-100 focus:outline-none focus:ring-1 focus:ring-[#8C6239] rounded px-1'
                                      : ''
                                  }`}
                                  style={{
                                    color: activeTemplate.styles.textColor,
                                    fontFamily: activeTemplate.styles.headingFontFamily,
                                  }}
                                  title={isEditMode ? 'Haz clic para editar el nombre' : undefined}
                                >
                                  {item.name}
                                </span>
                                {item.isFeatured && (
                                  <span className="text-[10px] shrink-0" style={{ color: activeTemplate.styles.accentColor }}>
                                    {activeTemplate.styles.headerDividerSymbol}
                                  </span>
                                )}
                              </span>

                              <span
                                className="flex-1 border-b mx-1.5 mb-1 hidden sm:block"
                                style={{
                                  borderColor: activeTemplate.styles.dotLeaderColor,
                                  borderStyle: activeTemplate.styles.dotLeaderStyle,
                                }}
                              />

                              <span
                                contentEditable={isEditMode}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => {
                                  const raw = e.currentTarget.textContent || '';
                                  const num = parseFloat(raw.replace(/[^0-9]/g, ''));
                                  if (!isNaN(num)) handleUpdateItemPrice(item.id, num);
                                }}
                                className={`font-bold text-xs shrink-0 ${
                                  isEditMode
                                    ? 'cursor-text hover:bg-amber-100/70 focus:bg-amber-100 focus:outline-none focus:ring-1 focus:ring-[#8C6239] rounded px-1'
                                    : ''
                                }`}
                                style={{
                                  color: activeTemplate.styles.priceColor,
                                  fontFamily: activeTemplate.styles.headingFontFamily,
                                }}
                                title={isEditMode ? 'Haz clic para editar el precio' : undefined}
                              >
                                {formatCurrency(item.price)}
                              </span>

                              {/* Edit Mode Buttons */}
                              {isEditMode && (
                                <div className="flex items-center gap-0.5 shrink-0 ml-1">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleItemExclusion(item.id)}
                                    className={`p-1 rounded text-xs transition-colors ${
                                      item.isExcluded
                                        ? 'bg-rose-100 text-rose-700'
                                        : 'text-stone-400 hover:text-rose-600 hover:bg-stone-200'
                                    }`}
                                    title={item.isExcluded ? 'Restaurar en la carta' : 'Ocultar de la carta'}
                                  >
                                    {item.isExcluded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={itemIdx === 0}
                                    onClick={() => handleMoveCombo(itemIdx, 'up')}
                                    className="p-1 text-stone-400 hover:text-[#8C6239] disabled:opacity-20 rounded"
                                    title="Subir"
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={itemIdx === allCombos.length - 1}
                                    onClick={() => handleMoveCombo(itemIdx, 'down')}
                                    className="p-1 text-stone-400 hover:text-[#8C6239] disabled:opacity-20 rounded"
                                    title="Bajar"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            <p
                              contentEditable={isEditMode}
                              suppressContentEditableWarning={true}
                              onBlur={(e) => handleUpdateItemDesc(item.id, e.currentTarget.textContent || '')}
                              className={`text-[10px] leading-tight ${
                                isEditMode
                                  ? 'cursor-text hover:bg-amber-100/70 focus:bg-amber-100 focus:outline-none focus:ring-1 focus:ring-[#8C6239] rounded px-1'
                                  : ''
                              }`}
                              style={{ color: activeTemplate.styles.descColor }}
                              title={isEditMode ? 'Haz clic para editar la descripción' : undefined}
                            >
                              {item.description || (isEditMode ? '(Sin descripción, haz clic para agregar)' : '')}
                            </p>

                            {item.compositeItems && item.compositeItems.length > 0 && (
                              <div
                                className="text-[9px] px-2 py-0.5 mt-1 leading-snug"
                                style={{
                                  backgroundColor: activeTemplate.styles.combos.maridajeBg,
                                  borderLeft: `2px solid ${activeTemplate.styles.combos.maridajeBorder}`,
                                  color: activeTemplate.styles.combos.maridajeText,
                                }}
                              >
                                <strong className="uppercase text-[8px] tracking-wider" style={{ color: activeTemplate.styles.accentColor }}>
                                  Maridaje:
                                </strong>{' '}
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
                const catProds = getProductsForCategory(cat.id, false);
                if (catProds.length === 0) return null;

                const catPrefix =
                  activeTemplate.styles.categoryHeader.numeralFormat === 'roman'
                    ? `${toRoman(index + 1)}.  `
                    : activeTemplate.styles.categoryHeader.numeralFormat === 'decimal'
                    ? `${String(index + 1).padStart(2, '0')}.  `
                    : '';

                return (
                  <section key={cat.id} className="space-y-2.5">
                    {/* Refined Category Divider Header */}
                    <div className="flex items-center gap-3 py-1">
                      <div className="h-[0.75px] flex-1 opacity-70" style={{ backgroundColor: activeTemplate.styles.accentColor }} />
                      <h2
                        className="text-xs sm:text-sm font-bold uppercase tracking-[0.22em] whitespace-nowrap"
                        style={{
                          color: activeTemplate.styles.headingColor,
                          fontFamily: activeTemplate.styles.headingFontFamily,
                        }}
                      >
                        {catPrefix}{cat.name}
                      </h2>
                      <div className="h-[0.75px] flex-1 opacity-70" style={{ backgroundColor: activeTemplate.styles.accentColor }} />
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                      {catProds.map((item, itemIdx) => (
                        <div
                          key={item.id}
                          className={`space-y-0.5 transition-opacity ${
                            item.isExcluded ? 'opacity-40 line-through' : ''
                          }`}
                        >
                          <div className="flex items-baseline justify-between gap-1 w-full">
                            <span className="font-bold text-xs truncate flex items-center gap-1 flex-1 min-w-0">
                              <span
                                contentEditable={isEditMode}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleUpdateItemName(item.id, e.currentTarget.textContent || item.name)}
                                className={`truncate ${
                                  isEditMode
                                    ? 'cursor-text hover:bg-amber-100/70 focus:bg-amber-100 focus:outline-none focus:ring-1 focus:ring-[#8C6239] rounded px-1'
                                    : ''
                                }`}
                                style={{
                                  color: activeTemplate.styles.textColor,
                                  fontFamily: activeTemplate.styles.headingFontFamily,
                                }}
                                title={isEditMode ? 'Haz clic para editar el nombre' : undefined}
                              >
                                {item.name}
                              </span>
                              {item.isFeatured && (
                                <span className="text-[10px] ml-1 shrink-0" style={{ color: activeTemplate.styles.accentColor }}>
                                  {activeTemplate.styles.headerDividerSymbol}
                                </span>
                              )}
                            </span>

                            <span
                              className="flex-1 border-b mx-1.5 mb-1"
                              style={{
                                borderColor: activeTemplate.styles.dotLeaderColor,
                                borderStyle: activeTemplate.styles.dotLeaderStyle,
                              }}
                            />

                            <span
                              contentEditable={isEditMode}
                              suppressContentEditableWarning={true}
                              onBlur={(e) => {
                                const raw = e.currentTarget.textContent || '';
                                const num = parseFloat(raw.replace(/[^0-9]/g, ''));
                                if (!isNaN(num)) handleUpdateItemPrice(item.id, num);
                              }}
                              className={`font-bold text-xs shrink-0 ${
                                isEditMode
                                  ? 'cursor-text hover:bg-amber-100/70 focus:bg-amber-100 focus:outline-none focus:ring-1 focus:ring-[#8C6239] rounded px-1'
                                  : ''
                              }`}
                              style={{
                                color: activeTemplate.styles.priceColor,
                                fontFamily: activeTemplate.styles.headingFontFamily,
                              }}
                              title={isEditMode ? 'Haz clic para editar el precio' : undefined}
                            >
                              {formatCurrency(item.price)}
                            </span>

                            {/* Edit Mode Buttons */}
                            {isEditMode && (
                              <div className="flex items-center gap-0.5 shrink-0 ml-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleItemExclusion(item.id)}
                                  className={`p-1 rounded text-xs transition-colors ${
                                    item.isExcluded
                                      ? 'bg-rose-100 text-rose-700'
                                      : 'text-stone-400 hover:text-rose-600 hover:bg-stone-200'
                                  }`}
                                  title={item.isExcluded ? 'Restaurar en la carta' : 'Ocultar de la carta'}
                                >
                                  {item.isExcluded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                                <button
                                  type="button"
                                  disabled={itemIdx === 0}
                                  onClick={() => handleMoveProduct(cat.id, itemIdx, 'up')}
                                  className="p-1 text-stone-400 hover:text-[#8C6239] disabled:opacity-20 rounded"
                                  title="Subir"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={itemIdx === catProds.length - 1}
                                  onClick={() => handleMoveProduct(cat.id, itemIdx, 'down')}
                                  className="p-1 text-stone-400 hover:text-[#8C6239] disabled:opacity-20 rounded"
                                  title="Bajar"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          <p
                            contentEditable={isEditMode}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleUpdateItemDesc(item.id, e.currentTarget.textContent || '')}
                            className={`text-[10px] leading-tight ${
                              isEditMode
                                ? 'cursor-text hover:bg-amber-100/70 focus:bg-amber-100 focus:outline-none focus:ring-1 focus:ring-[#8C6239] rounded px-1'
                                : ''
                            }`}
                            style={{ color: activeTemplate.styles.descColor }}
                            title={isEditMode ? 'Haz clic para editar la descripción' : undefined}
                          >
                            {item.description || (isEditMode ? '(Sin descripción, haz clic para agregar)' : '')}
                          </p>
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

            {/* Editorial Footer */}
            <div
              className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px]"
              style={{
                borderTop: `1px solid ${activeTemplate.styles.accentColor}`,
                color: activeTemplate.styles.subheadingColor,
              }}
            >
              <div
                className="font-bold text-xs tracking-wider uppercase"
                style={{
                  color: activeTemplate.styles.headingColor,
                  fontFamily: activeTemplate.styles.headingFontFamily,
                }}
              >
                {config.title} &bull; Carta Oficial de Salón
              </div>
              <div className="text-right text-[10px] font-medium" style={{ color: activeTemplate.styles.priceColor }}>
                {config.footerNote}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="shrink-0 bg-[#FAF8F5] border-t border-[#D8C7B0] p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A6F66] print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#8C6239] bg-[#F4EFE6] px-2 py-0.5 rounded border border-[#C5A880]/50 font-serif">
              ✦ {activeTemplate.name}
            </span>
            <span>
              {isEditMode
                ? 'Modo edición activo. Haz clic sobre cualquier elemento de la carta para modificarlo.'
                : 'Haz clic en "✏️ Editar Textos y Precios" para modificar nombres, valores o descripciones directamente.'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                isEditMode
                  ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 ring-2 ring-amber-200'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditMode ? 'Listo / Guardar' : 'Editar en Pantalla'}</span>
            </button>

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
