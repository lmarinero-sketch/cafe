import React, { useState } from 'react';
import { Plus, Grid, Edit, Eye, EyeOff, Tag, Coffee, Utensils, Check, X, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Category } from '../types';
import { ModuleOnboardingBanner } from '../components/common/ModuleOnboardingBanner';

export const CategoriesPage: React.FC = () => {
  const { categories, products } = useApp();

  const [categoryList, setCategoryList] = useState<Category[]>(categories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: 'Coffee',
  });

  const getProductCountForCategory = (catId: string) => {
    return products.filter((p) => p.categoryId === catId).length;
  };

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', icon: 'Coffee' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || 'Coffee',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCategory) {
      setCategoryList((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: formData.name, slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-') }
            : c
        )
      );
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        icon: formData.icon,
      };
      setCategoryList((prev) => [...prev, newCat]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Onboarding Banner */}
      <ModuleOnboardingBanner
        title="Gestión de Categorías"
        subtitle="Organización del menú digital y carta tradicional por familias de productos"
        requiredPlan="esencial"
        steps={[
          'Creá y editá las familias de productos (ej. Pastelería Artesanal, Encordados, Cafetería).',
          'Organizá el orden visual que se mostrará en el Menú Digital QR de Hilos de Amor.',
          'Revisá la cantidad de productos activos asignados a cada categoría.',
        ]}
      />

      {/* Header Banner */}
      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown bg-brand-cream px-2 py-0.5 rounded border border-brand-secondary">
              Menú & Carta Digital
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-brand-dark font-serif">Categorías del Menú ({categoryList.length})</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Estructura organizativa para la carta física y el catálogo QR en celular
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-all shadow-soft flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 text-brand-yellow" />
          Nueva Categoría
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryList.map((cat) => {
          const productCount = getProductCountForCategory(cat.id);

          return (
            <div
              key={cat.id}
              className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft space-y-4 flex flex-col justify-between hover:border-brand-brown/40 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-brand-cream text-brand-brown flex items-center justify-center border border-brand-secondary font-bold text-lg shadow-xs">
                    🧁
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300">
                    Visible en QR
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-brand-dark font-serif">{cat.name}</h3>
                  <p className="text-xs text-brand-brown/70 font-mono mt-0.5">Slug: /{cat.slug}</p>
                </div>

                <div className="pt-2 border-t border-brand-secondary/60 flex items-center justify-between text-xs text-brand-brown">
                  <span className="font-bold">{productCount} productos asociados</span>
                  <span className="text-[11px] bg-brand-bg px-2 py-0.5 rounded font-mono">ID: {cat.id}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(cat)}
                  className="flex-1 py-2 px-3 rounded-xl border border-brand-secondary text-brand-dark font-bold text-xs hover:bg-brand-secondary/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5 text-brand-brown" /> Editar Categoría
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Create / Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-brand-dark/50 backdrop-blur-xs">
          <div className="bg-brand-card rounded-2xl border-2 border-brand-brown p-6 max-w-md w-full shadow-soft-lg space-y-4 relative">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <h3 className="text-base font-extrabold text-brand-dark font-serif">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-brand-dark mb-1">Nombre de la Categoría</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej. Pastelería Artesanal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark font-bold focus:outline-none focus:ring-1 focus:ring-brand-brown"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Slug URL (opcional)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="ej. pasteleria-artesanal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark font-mono focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors shadow-soft"
                >
                  {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-brand-secondary text-brand-dark font-semibold text-xs hover:bg-brand-secondary/30"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
