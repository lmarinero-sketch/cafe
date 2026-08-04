import React, { useState, useEffect } from 'react';
import {
  Globe, Save, Loader2, Sparkles, RefreshCw, Smartphone, Tablet, Monitor,
  ExternalLink, CheckCircle2, Home, Info, Star, Gift, Share2, Layers, Pencil, ArrowLeft
} from 'lucide-react';
import { SiteContent, SiteSection } from '../types';
import * as siteContentService from '../services/siteContent.service';
import { useToast } from '../context/ToastContext';
import { PromotionalWebsitePage } from './PromotionalWebsitePage';
import { useNavigate } from 'react-router-dom';

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

interface SectionTab {
  id: SiteSection;
  label: string;
  icon: React.ReactNode;
}

const SECTION_TABS: SectionTab[] = [
  { id: 'hero', label: 'Hero Principal', icon: <Home className="w-4 h-4" /> },
  { id: 'about', label: 'Sobre Nosotros', icon: <Info className="w-4 h-4" /> },
  { id: 'product_star', label: 'Producto Estrella', icon: <Star className="w-4 h-4" /> },
  { id: 'club', label: 'Club Fidelización', icon: <Gift className="w-4 h-4" /> },
  { id: 'social', label: 'Contacto & Redes', icon: <Share2 className="w-4 h-4" /> },
  { id: 'footer', label: 'Pie de Página', icon: <Layers className="w-4 h-4" /> },
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

  const handleSaveAll = async () => {
    setIsSaving(true);
    const itemsToSave = Object.entries(editedValues).map(([key, value]) => ({ key, value }));
    const ok = await siteContentService.upsertMultipleContent(itemsToSave);
    if (ok) {
      setInitialValues({ ...editedValues });
      showToast('¡Cambios guardados!', 'El sitio web público se ha actualizado correctamente.', 'success');
    } else {
      showToast('Error', 'No se pudieron guardar los cambios en Supabase.', 'error');
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
      {/* TOP WIX-STYLE EDITOR TOOLBAR */}
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
                Wix Live Preview
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Modificá textos y contenidos. Los cambios se reflejan en tiempo real en la vista previa.
            </p>
          </div>
        </div>

        {/* Viewport controls */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewport('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewport === 'desktop' ? 'bg-[#2F5233] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewport === 'tablet' ? 'bg-[#2F5233] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" /> Tablet
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewport === 'mobile' ? 'bg-[#2F5233] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
            title="Restablecer prederminados"
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
      {/* MAIN SPLIT CONTENT AREA */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: CONTROLS & FORM FIELDS */}
        <div className="w-full md:w-[420px] lg:w-[460px] bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 overflow-hidden">
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
                <Sparkles className="w-3.5 h-3.5" /> Textos de {SECTION_TABS.find((t) => t.id === activeTab)?.label}
              </span>
              <span className="text-[10px] text-slate-500">Edición en directo</span>
            </div>

            {currentTabItems.map((item) => (
              <div key={item.key} className="space-y-1.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>{item.label}</span>
                  <span className="text-[10px] font-mono text-slate-500">{item.key}</span>
                </label>

                {item.key.includes('desc') || item.key.includes('subtitle') || item.key.includes('pillar') ? (
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

        {/* RIGHT PANEL: LIVE INTERACTIVE PREVIEW FRAME */}
        <div className="hidden md:flex flex-1 bg-slate-950 flex-col items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-radial from-slate-900/50 to-slate-950 pointer-events-none" />

          {/* Viewport Frame Container */}
          <div
            className={`h-full transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border border-slate-800 bg-white flex flex-col ${
              viewport === 'desktop'
                ? 'w-full max-w-full'
                : viewport === 'tablet'
                ? 'w-[768px]'
                : 'w-[380px]'
            }`}
          >
            {/* Fake Browser Top Bar */}
            <div className="h-8 bg-slate-100 border-b border-slate-200 px-3 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="bg-white px-3 py-0.5 rounded-md border border-slate-200 text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-600" /> hilosdeamor.com.ar/sitio-promocional
              </div>
              <div className="text-[10px] font-bold text-slate-400">Live Preview</div>
            </div>

            {/* Rendered Live Page Component */}
            <div className="flex-1 overflow-y-auto">
              <PromotionalWebsitePage customContent={editedValues} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
