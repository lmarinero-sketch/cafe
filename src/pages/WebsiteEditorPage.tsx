import React, { useState, useEffect } from 'react';
import {
  Globe, Save, Loader2, Type, Image, CheckCircle2,
  ChevronDown, ChevronUp, Sparkles, RefreshCw,
} from 'lucide-react';
import { SiteContent, SiteSection } from '../types';
import * as siteContentService from '../services/siteContent.service';
import { useToast } from '../context/ToastContext';

const SECTION_CONFIG: { id: SiteSection; label: string; emoji: string }[] = [
  { id: 'hero', label: 'Hero Principal', emoji: '🏠' },
  { id: 'about', label: 'Qué Hacemos', emoji: '💡' },
  { id: 'product_star', label: 'Producto Estrella', emoji: '⭐' },
  { id: 'club', label: 'Club de Beneficios', emoji: '🎁' },
  { id: 'social', label: 'Redes Sociales', emoji: '📱' },
  { id: 'footer', label: 'Footer', emoji: '📄' },
];

export const WebsiteEditorPage: React.FC = () => {
  const { showToast } = useToast();
  const [content, setContent] = useState<SiteContent[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<SiteSection>>(new Set(['hero']));
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    const data = await siteContentService.getAllContent();
    setContent(data);
    const initial: Record<string, string> = {};
    data.forEach((c) => { initial[c.key] = c.value; });
    setEditedValues(initial);
    setIsLoading(false);
  };

  const toggleSection = (section: SiteSection) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const handleChange = (key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
    setSavedKeys((prev) => { const n = new Set(prev); n.delete(key); return n; });
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const items = content.map((c) => ({ key: c.key, value: editedValues[c.key] ?? c.value }));
    const ok = await siteContentService.upsertMultipleContent(items);
    if (ok) {
      showToast('Contenido guardado', 'Los cambios se reflejarán en tu sitio web.', 'success');
      setSavedKeys(new Set(content.map((c) => c.key)));
    } else {
      showToast('Error', 'No se pudieron guardar algunos cambios.', 'error');
    }
    setIsSaving(false);
  };

  const getContentForSection = (section: SiteSection) => {
    return content.filter((c) => c.section === section).sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const hasChanges = content.some((c) => editedValues[c.key] !== c.value);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-brown animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-dark flex items-center gap-2">
            <Globe className="w-6 h-6 text-brand-brown" /> Editor del Sitio Web
          </h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Modificá los textos, imágenes y contenido de tu sitio web público.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open('/sitio-promocional', '_blank')}
            className="py-2 px-4 rounded-xl bg-brand-bg text-brand-dark border border-brand-secondary font-bold text-xs hover:bg-brand-secondary/40 transition-colors flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-brand-brown" /> Vista Previa
          </button>
          <button
            onClick={loadContent}
            className="py-2 px-3 rounded-xl bg-brand-bg text-brand-brown border border-brand-secondary font-bold text-xs hover:bg-brand-secondary/40 transition-colors"
            title="Recargar contenido"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleSaveAll}
            disabled={isSaving || !hasChanges}
            className="py-2 px-5 rounded-xl bg-brand-brown text-brand-card font-extrabold text-xs hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-soft flex items-center gap-1.5"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isSaving ? 'Guardando...' : 'Guardar Todo'}
          </button>
        </div>
      </div>

      {content.length === 0 ? (
        <div className="bg-brand-card p-10 rounded-2xl border border-brand-secondary text-center space-y-3">
          <Sparkles className="w-10 h-10 text-brand-yellow mx-auto" />
          <h3 className="text-sm font-bold text-brand-dark">No hay contenido configurado</h3>
          <p className="text-xs text-brand-brown">
            Las migraciones de contenido del sitio aún no se ejecutaron. Verificá la conexión a Supabase.
          </p>
        </div>
      ) : (
        <div className="max-w-3xl space-y-3">
          {SECTION_CONFIG.map((sec) => {
            const items = getContentForSection(sec.id);
            if (items.length === 0) return null;
            const isExpanded = expandedSections.has(sec.id);

            return (
              <div key={sec.id} className="bg-brand-card rounded-2xl border border-brand-secondary shadow-soft overflow-hidden">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(sec.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-brand-bg/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{sec.emoji}</span>
                    <h3 className="text-sm font-extrabold text-brand-dark">{sec.label}</h3>
                    <span className="text-[10px] font-bold text-brand-brown bg-brand-bg px-2 py-0.5 rounded-full">
                      {items.length} campos
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-brand-brown" /> : <ChevronDown className="w-4 h-4 text-brand-brown" />}
                </button>

                {/* Section Fields */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-brand-secondary/60">
                    {items.map((item) => {
                      const currentVal = editedValues[item.key] ?? item.value;
                      const isSaved = savedKeys.has(item.key);
                      const isChanged = currentVal !== item.value;
                      const isImage = item.type === 'image_url';

                      return (
                        <div key={item.id} className="space-y-1 pt-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                              {isImage ? <Image className="w-3 h-3 text-purple-600" /> : <Type className="w-3 h-3 text-blue-600" />}
                              {item.label}
                            </label>
                            <div className="flex items-center gap-1">
                              {isSaved && (
                                <span className="text-[9px] font-bold text-emerald-700 flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3" /> Guardado
                                </span>
                              )}
                              {isChanged && !isSaved && (
                                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                  Sin guardar
                                </span>
                              )}
                            </div>
                          </div>

                          {isImage ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={currentVal}
                                onChange={(e) => handleChange(item.key, e.target.value)}
                                placeholder="URL de la imagen (ej: /nano_banana_coffee.png)"
                                className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs text-brand-dark font-medium focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
                              />
                              {currentVal && (
                                <div className="w-20 h-20 rounded-xl overflow-hidden border border-brand-secondary bg-white">
                                  <img src={currentVal} alt={item.label} className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                          ) : currentVal.length > 80 ? (
                            <textarea
                              value={currentVal}
                              onChange={(e) => handleChange(item.key, e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs text-brand-dark font-medium focus:ring-2 focus:ring-brand-brown/30 focus:outline-none resize-y"
                            />
                          ) : (
                            <input
                              type="text"
                              value={currentVal}
                              onChange={(e) => handleChange(item.key, e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs text-brand-dark font-medium focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
                            />
                          )}

                          <p className="text-[10px] text-brand-brown/60 font-mono">key: {item.key}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
