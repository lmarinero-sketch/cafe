import React, { useState } from 'react';
import { BookOpen, Search, FileText, ChevronRight, UserCheck, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Manual } from '../types';

export const ManualsPage: React.FC = () => {
  const { manuals } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'profiles' | 'modules'>('all');
  const [selectedManual, setSelectedManual] = useState<Manual | null>(manuals[0] || null);

  const filteredManuals = manuals.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'profiles') return m.category.startsWith('Perfil:');
    if (activeTab === 'modules') return !m.category.startsWith('Perfil:');
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Banner */}
      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-dark">Base de Manuales & Documentación</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Guías interactivas paso a paso para cada perfil y módulo del sistema ({manuals.length} manuales disponibles)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Search, Tabs & Manuals List */}
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft space-y-4">
          {/* Category Filter Tabs */}
          <div className="flex gap-1.5 p-1 bg-brand-bg rounded-xl border border-brand-secondary/80 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                activeTab === 'all'
                  ? 'bg-brand-brown text-brand-card shadow-xs'
                  : 'text-brand-brown hover:bg-brand-secondary/50'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveTab('profiles')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'profiles'
                  ? 'bg-brand-brown text-brand-card shadow-xs'
                  : 'text-brand-brown hover:bg-brand-secondary/50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Perfiles
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'modules'
                  ? 'bg-brand-brown text-brand-card shadow-xs'
                  : 'text-brand-brown hover:bg-brand-secondary/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Módulos
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-brand-brown/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por rol o palabra clave..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {filteredManuals.map((man) => {
              const isActive = selectedManual?.id === man.id;
              const isProfile = man.category.startsWith('Perfil:');
              return (
                <div
                  key={man.id}
                  onClick={() => setSelectedManual(man)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-brand-brown text-brand-card border-brand-brown shadow-soft'
                      : isProfile
                      ? 'bg-emerald-50/50 text-brand-dark border-emerald-300/80 hover:border-emerald-500'
                      : 'bg-brand-bg text-brand-dark border-brand-secondary/60 hover:border-brand-brown/40'
                  }`}
                >
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wider ${
                      isActive ? 'text-brand-yellow' : isProfile ? 'text-emerald-800' : 'text-brand-brown'
                    }`}
                  >
                    {man.category}
                  </span>
                  <h4 className="text-xs font-bold mt-0.5 truncate">{man.title}</h4>
                </div>
              );
            })}
            {filteredManuals.length === 0 && (
              <p className="text-xs text-center py-6 text-brand-brown/60 italic">No se encontraron manuales con ese criterio.</p>
            )}
          </div>
        </div>

        {/* Right Column: Selected Manual Content */}
        {selectedManual && (
          <div className="lg:col-span-2 bg-brand-card rounded-2xl border border-brand-secondary p-6 shadow-soft space-y-6">
            <div>
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded ${
                selectedManual.category.startsWith('Perfil:')
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-brand-yellow/40 text-brand-brown'
              }`}>
                {selectedManual.category}
              </span>
              <h3 className="text-xl font-extrabold text-brand-dark mt-2">{selectedManual.title}</h3>
              <p className="text-xs text-brand-brown/90 mt-1 leading-relaxed">{selectedManual.description}</p>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-brown">
                Pasos de Instrucción:
              </h4>
              <div className="space-y-2.5">
                {selectedManual.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 bg-brand-bg rounded-xl border border-brand-secondary/60">
                    <span className="w-6 h-6 rounded-full bg-brand-brown text-brand-card font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-brand-dark leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedManual.faqs.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-brand-secondary/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-brown">
                  Preguntas Frecuentes Relacionadas:
                </h4>
                <div className="space-y-2">
                  {selectedManual.faqs.map((faq, idx) => (
                    <div key={idx} className="p-3.5 bg-brand-cream rounded-xl border border-brand-secondary/70 text-xs">
                      <p className="font-bold text-brand-dark">Q: {faq.question}</p>
                      <p className="text-brand-brown/90 mt-1">A: {faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

