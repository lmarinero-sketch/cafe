import React, { useState } from 'react';
import { Plus, Grid, Edit, Eye, EyeOff, Tag, Coffee, Utensils, Check, X, Layers, List, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Category, Product } from '../types';
import { initialProducts } from '../data/seeds/products.seed';
import { ModuleOnboardingBanner } from '../components/common/ModuleOnboardingBanner';
import { formatCurrency } from '../utils/currency';
import { uploadImage } from '../services/storage.service';
import { useToast } from '../context/ToastContext';

export const CategoriesPage: React.FC = () => {
  const { categories, products, updateProduct } = useApp();
  const { showToast } = useToast();

  const [categoryList, setCategoryList] = useState<Category[]>(categories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: 'Coffee',
    image: '',
  });

  const getProductCountForCategory = (catId: string) => {
    return products.filter((p) => p.categoryId === catId).length;
  };

  const handleSyncCategories = () => {
    initialProducts.forEach((sp) => {
      updateProduct(sp.id, { categoryId: sp.categoryId, categoryName: sp.categoryName });
    });
    showToast('Categorías Sincronizadas', 'Los productos fueron organizados en sus categorías correspondientes.', 'success');
  };

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', icon: 'Coffee', image: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || 'Coffee',
      image: cat.image || '',
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showToast('Formato no soportado', 'Por favor sube una imagen en formato JPG, PNG o WEBP para evitar errores.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Archivo muy grande', 'La imagen supera los 5MB. Te recomendamos usar imágenes optimizadas (JPG, PNG o WEBP de menos de 2MB).', 'error');
      return;
    }
    setIsUploading(true);
    const url = await uploadImage('website-images', file);
    if (url) {
      setFormData(prev => ({ ...prev, image: url }));
      showToast('Imagen subida', 'La imagen de la categoría se cargó correctamente.', 'success');
    } else {
      showToast('Error al subir imagen', 'No se pudo procesar la imagen. Asegúrate de usar un formato válido (JPG, PNG, WEBP).', 'error');
    }
    setIsUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCategory) {
      setCategoryList((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: formData.name, slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'), image: formData.image }
            : c
        )
      );
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        icon: formData.icon,
        image: formData.image,
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

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSyncCategories}
            title="Asignar automáticamente cada producto a su categoría oficial"
            className="py-2.5 px-4 rounded-xl border-2 border-brand-brown text-brand-brown font-bold text-xs hover:bg-brand-brown/10 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-brand-brown" />
            Sincronizar Categorías
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-all shadow-soft flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-brand-yellow" />
            Nueva Categoría
          </button>
        </div>
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
                  <div className="w-14 h-14 rounded-xl bg-brand-cream border border-brand-secondary/80 overflow-hidden flex items-center justify-center shadow-soft shrink-0">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🧁</span>
                    )}
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
                  <Edit className="w-3.5 h-3.5 text-brand-brown" /> Editar
                </button>
                <button
                  onClick={() => setViewingCategory(cat)}
                  className="flex-1 py-2 px-3 rounded-xl bg-brand-bg text-brand-dark border border-brand-secondary font-bold text-xs hover:bg-brand-secondary/40 transition-colors flex items-center justify-center gap-1.5"
                >
                  <List className="w-3.5 h-3.5 text-brand-brown" /> Ver Productos
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

              <div>
                <label className="block font-bold text-brand-dark mb-1">Imagen de la Categoría</label>
                <div className="flex items-center gap-3">
                  {formData.image && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-brand-secondary shrink-0">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer bg-brand-bg hover:bg-brand-secondary/40 text-brand-dark px-3 py-2 rounded-lg border border-brand-secondary text-xs font-semibold text-center transition-colors">
                    {isUploading ? 'Subiendo...' : 'Subir Imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload(e.target.files[0]);
                        }
                      }}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                <p className="text-[10px] text-brand-brown/70 mt-1.5 italic">
                  * Formatos recomendados: .jpg, .png o .webp (máximo 2MB)
                </p>
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

      {/* Modal View Category Products */}
      {viewingCategory && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-brand-dark/50 backdrop-blur-xs">
          <div className="bg-brand-card rounded-2xl border-2 border-brand-brown p-6 max-w-lg w-full shadow-soft-lg space-y-4 max-h-[80vh] flex flex-col relative">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3 shrink-0">
              <h3 className="text-base font-extrabold text-brand-dark font-serif flex items-center gap-2">
                <List className="w-5 h-5 text-brand-brown" />
                Productos: {viewingCategory.name}
              </h3>
              <button
                onClick={() => setViewingCategory(null)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {/* Selector para asociar producto */}
              <div className="bg-brand-bg p-3 rounded-xl border border-brand-secondary/60 mb-4 flex items-center gap-2">
                <select
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-bold border border-brand-secondary bg-brand-card focus:outline-none focus:ring-1 focus:ring-brand-brown"
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    if (selectedId) {
                      updateProduct(selectedId, { categoryId: viewingCategory.id, categoryName: viewingCategory.name });
                      showToast('Producto Asociado', 'El producto se agregó a la categoría.', 'success');
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">+ Asociar producto existente...</option>
                  {products.filter(p => p.categoryId !== viewingCategory.id).map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Actual: {p.categoryName || 'Ninguna'})</option>
                  ))}
                </select>
              </div>

              {products.filter(p => p.categoryId === viewingCategory.id).length === 0 ? (
                <p className="text-center text-brand-brown/60 text-xs py-4">No hay productos en esta categoría.</p>
              ) : (
                products.filter(p => p.categoryId === viewingCategory.id).map(prod => (
                  <div key={prod.id} className="flex items-center justify-between p-3 rounded-xl border border-brand-secondary bg-brand-bg">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-brand-dark">{prod.name}</span>
                      <span className="text-xs text-brand-brown/80">{formatCurrency(prod.price)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${prod.isAvailable ? 'bg-brand-green/20 text-emerald-900' : 'bg-red-100 text-red-900'}`}>
                        {prod.isAvailable ? 'Disponible' : 'Agotado'}
                      </span>
                      <button
                        onClick={() => updateProduct(prod.id, { categoryId: 'uncategorized', categoryName: 'Sin Categoría' })}
                        className="text-[10px] text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                        title="Quitar de categoría"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
