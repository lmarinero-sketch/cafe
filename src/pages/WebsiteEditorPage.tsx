import React, { useState, useEffect } from 'react';
import {
  Globe, Save, Loader2, Sparkles, RefreshCw, Smartphone, Tablet, Monitor,
  ExternalLink, Home, Info, Star, Gift, Share2, Layers, Pencil, ArrowLeft,
  Flame, Award, Tag, ShoppingBag, Image as ImageIcon, CheckCircle2
} from 'lucide-react';
import { SiteContent, SiteSection } from '../types';
import * as siteContentService from '../services/siteContent.service';
import { initialProducts } from '../data/seeds/products.seed';
import { useToast } from '../context/ToastContext';
import { PromotionalWebsitePage } from './PromotionalWebsitePage';
import { useNavigate } from 'react-router-dom';
import { uploadImage } from '../services/storage.service';

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

interface SectionTab {
  id: SiteSection;
  label: string;
  icon: React.ReactNode;
}

const SECTION_TABS: SectionTab[] = [
  { id: 'hero', label: 'Hero Principal', icon: <Home className="w-4 h-4" /> },
  { id: 'about', label: 'Sobre Nosotros', icon: <Info className="w-4 h-4" /> },
  { id: 'offers', label: 'Ofertas del Día', icon: <Flame className="w-4 h-4 text-amber-400" /> },
  { id: 'recommended', label: 'Recomendados', icon: <Award className="w-4 h-4 text-amber-300" /> },
  { id: 'promos', label: 'Promociones', icon: <Tag className="w-4 h-4 text-emerald-400" /> },
  { id: 'product_star', label: 'Producto Estrella', icon: <Star className="w-4 h-4 text-amber-300" /> },
  { id: 'club', label: 'Club Fidelización', icon: <Gift className="w-4 h-4 text-rose-400" /> },
  { id: 'social', label: 'Contacto & Redes', icon: <Share2 className="w-4 h-4" /> },
  { id: 'footer', label: 'Pie de Página', icon: <Layers className="w-4 h-4" /> },
];

const PRESET_IMAGES = [
  { label: 'Medialunas', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80' },
  { label: 'Cheesecake', url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80' },
  { label: 'Café Espresso', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80' },
  { label: 'Capuchino', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80' },
  { label: 'Desayuno Hilos de Amor', url: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=600&q=80' },
  { label: 'Torta Chocolate', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80' },
];

export const WebsiteEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [contentList, setContentList] = useState<SiteContent[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [initialValues, setInitialValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<SiteSection>('hero');
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    const data = await siteContentService.getAllContent();
    setContentList(data);
    const map: Record<string, string> = {};
    data.forEach((item) => {
      map[item.key] = item.value;
    });
    setEditedValues(map);
    setInitialValues(map);
    setIsLoading(false);
  };

  const handleFieldChange = (key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (key: string, file: File) => {
    setIsUploading((prev) => ({ ...prev, [key]: true }));
    const url = await uploadImage('website-images', file);
    if (url) {
      handleFieldChange(key, url);
      showToast('Imagen subida', 'La imagen se subió correctamente a Supabase.', 'success');
    } else {
      showToast('Error', 'Hubo un error al subir la imagen. Verifica que hayas corrido el script SQL y que el archivo sea una imagen válida.', 'error');
    }
    setIsUploading((prev) => ({ ...prev, [key]: false }));
  };

  const handleSelectProductForCurrentSection = (productId: string) => {
    const prod = initialProducts.find((p) => p.id === productId);
    if (!prod) return;

    if (activeTab === 'offers') {
      setEditedValues((prev) => ({
        ...prev,
        offer1_name: prod.name,
        offer1_desc: prod.description,
        offer1_price: prod.price.toString(),
        offer1_image: prod.image.startsWith('http') ? prod.image : 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
      }));
      showToast('Producto cargado', `Se completaron los datos de ${prod.name} en Ofertas.`, 'success');
    } else if (activeTab === 'recommended') {
      setEditedValues((prev) => ({
        ...prev,
        rec1_name: prod.name,
        rec1_desc: prod.description,
        rec1_price: prod.price.toString(),
        rec1_image: prod.image.startsWith('http') ? prod.image : 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
      }));
      showToast('Producto cargado', `Se completaron los datos de ${prod.name} en Recomendados.`, 'success');
    } else if (activeTab === 'promos') {
      setEditedValues((prev) => ({
        ...prev,
        promo1_name: prod.name,
        promo1_desc: prod.description,
        promo1_price: prod.price.toString(),
        promo1_image: prod.image.startsWith('http') ? prod.image : 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
      }));
      showToast('Producto cargado', `Se completaron los datos de ${prod.name} en Promociones.`, 'success');
    } else if (activeTab === 'product_star') {
      setEditedValues((prev) => ({
        ...prev,
        star_name: prod.name,
        star_desc: prod.description,
        star_price: prod.price.toString(),
      }));
      showToast('Producto cargado', `Se completaron los datos de ${prod.name} en Producto Estrella.`, 'success');
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const itemsToSave = Object.entries(editedValues).map(([key, value]) => ({ key, value }));
    const ok = await siteContentService.upsertMultipleContent(itemsToSave);
    if (ok) {
      setInitialValues({ ...editedValues });
      showToast('¡Cambios guardados!', 'El sitio web público se ha actualizado correctamente.', 'success');
    } else {
      showToast('Error', 'No se pudieron guardar los cambios.', 'error');
    }
    setIsSaving(false);
  };

  const handleReset = () => {
    const defaultMap: Record<string, string> = {};
    siteContentService.DEFAULT_SITE_CONTENT.forEach((item) => {
      defaultMap[item.key] = item.value;
    });
    setEditedValues(defaultMap);
    showToast('Valores restablecidos', 'Se han cargado los textos predeterminados en el editor.', 'info');
  };

  const currentTabItems = contentList.filter((item) => item.section === activeTab);
  const hasUnsavedChanges = Object.keys(editedValues).some(
    (key) => editedValues[key] !== initialValues[key]
  );

  const canPickProducts = ['offers', 'recommended', 'promos', 'product_star'].includes(activeTab);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 text-[#2F5233] animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Cargando editor visual del sitio web...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl">
      {/* ============================================================ */}
      {/* TOP EDITOR TOOLBAR */}
      {/* ============================================================ */}
      <div className="h-16 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Volver al Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2 text-white font-serif">
              <Pencil className="w-4 h-4 text-emerald-400" /> Editor Visual de Sitio Web
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Vista Previa en Vivo
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Modificá ofertas, promociones, textos e imágenes. Los cambios se reflejan en vivo.
            </p>
          </div>
        </div>

        {/* Viewport controls (Removed) */}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
            title="Restablecer predeterminados"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Restablecer</span>
          </button>

          <button
            onClick={() => window.open('/sitio-promocional', '_blank')}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Ver Sitio Público</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
              hasUnsavedChanges
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                : 'bg-[#2F5233] hover:bg-[#244227] text-white'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" /> Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-emerald-200" /> Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden">
        {/* FORM FIELDS */}
        <div className="w-full bg-slate-950 flex flex-col overflow-hidden max-w-4xl mx-auto border-x border-slate-800">
          {/* Section Navigation Tabs */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/60 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            {SECTION_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#2F5233] text-white shadow-xs border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Fields List */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 custom-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> {SECTION_TABS.find((t) => t.id === activeTab)?.label}
              </span>
              <span className="text-[10px] text-slate-500">Edición en directo</span>
            </div>

            {/* PRODUCT PICKER DROPDOWN IF APPLICABLE */}
            {canPickProducts && (
              <div className="bg-emerald-950/40 border border-emerald-800/50 p-3.5 rounded-xl space-y-2">
                <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" /> Cargar Producto del Catálogo
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleSelectProductForCurrentSection(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-700/60 text-xs font-medium text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="">-- Seleccionar producto para auto-completar --</option>
                  {initialProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ${p.price} ({p.categoryName || 'Catálogo'})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-emerald-400/80">
                  Completa automáticamente el nombre, descripción, precio e imagen desde tu inventario.
                </p>
              </div>
            )}

            {/* FIELD INPUTS */}
            {currentTabItems.map((item) => (
              <div key={item.key} className="space-y-1.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>{item.label}</span>
                  <span className="text-[10px] font-mono text-slate-500">{item.key}</span>
                </label>

                {item.type === 'image_url' || item.key.includes('image') ? (
                  <div className="space-y-2">
                    {/* Image Preview & Upload */}
                    {editedValues[item.key] && (
                      <div className="w-full h-32 rounded-lg overflow-hidden border border-slate-700 relative">
                        <img src={editedValues[item.key]} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex gap-2 items-center">
                      <label className="flex-1 cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg border border-slate-700 text-xs font-semibold text-center transition-colors">
                        {isUploading[item.key] ? (
                          <span className="flex items-center justify-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo...</span>
                        ) : (
                          <span className="flex items-center justify-center gap-2"><ImageIcon className="w-3.5 h-3.5" /> Subir Nueva Imagen</span>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleImageUpload(item.key, e.target.files[0]);
                            }
                          }}
                          disabled={isUploading[item.key]}
                        />
                      </label>
                      <input
                        type="text"
                        value={editedValues[item.key] ?? item.value}
                        onChange={(e) => handleFieldChange(item.key, e.target.value)}
                        placeholder="O ingresa URL (https://...)"
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                ) : item.key.includes('desc') || item.key.includes('subtitle') || item.key.includes('pillar') ? (
                  <textarea
                    rows={3}
                    value={editedValues[item.key] ?? item.value}
                    onChange={(e) => handleFieldChange(item.key, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                ) : (
                  <input
                    type="text"
                    value={editedValues[item.key] ?? item.value}
                    onChange={(e) => handleFieldChange(item.key, e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
