import React, { useState } from 'react';
import { Plus, Search, Eye, EyeOff, Edit, Tag, Image, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, Channel } from '../types';
import { formatCurrency } from '../utils/currency';
import { ModuleOnboardingBanner } from '../components/common/ModuleOnboardingBanner';

export const ProductsPage: React.FC = () => {
  const { products, categories, addProduct, updateProduct, toggleProductStatus } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: categories[0]?.id || 'cat-1',
    description: '',
    price: 3000,
    image: '/products/espresso.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro', 'delivery'] as Channel[],
  });

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id || 'cat-1',
      description: '',
      price: 3000,
      image: '/products/espresso.svg',
      isAvailable: true,
      isFeatured: false,
      channels: ['salon', 'retiro', 'delivery'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.categoryId,
      description: product.description,
      price: product.price,
      image: product.image,
      isAvailable: product.isAvailable,
      isFeatured: product.isFeatured,
      channels: product.channels,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setIsModalOpen(false);
  };

  const toggleChannel = (channel: Channel) => {
    setFormData((prev) => {
      const exists = prev.channels.includes(channel);
      return {
        ...prev,
        channels: exists ? prev.channels.filter((c) => c !== channel) : [...prev.channels, channel],
      };
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Module Onboarding Banner */}
      <ModuleOnboardingBanner
        title="Gestión de Productos"
        subtitle="Administración de la carta digital, precios, fotos y estado de stock"
        requiredPlan="esencial"
        steps={[
          'Hacé clic en "+ Nuevo producto" para dar de alta ítems con fotos, categorías y precios.',
          'Marcá productos como "Disponibles" o "Agotados" para actualizar la carta en tiempo real.',
          'Seleccioná los canales habilitados para cada producto (Salón, Retiro o Delivery).',
        ]}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-dark">Administración de Productos</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Gestión de carta, precios, categorías e imágenes ({products.length} productos)
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-all duration-200 shadow-soft flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-brand-yellow" />
          Nuevo producto
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-brand-brown text-brand-card shadow-soft'
                : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40'
            }`}
          >
            Todas ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === c.id
                  ? 'bg-brand-brown text-brand-card shadow-soft'
                  : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-brand-brown/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className={`bg-brand-card rounded-2xl border p-4 shadow-soft flex flex-col justify-between transition-all ${
              p.isAvailable ? 'border-brand-secondary' : 'border-brand-red/60 bg-brand-bg/40 opacity-75'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-16 h-16 rounded-xl object-cover bg-brand-bg border border-brand-secondary shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown/80 bg-brand-secondary/40 px-2 py-0.5 rounded">
                      {p.categoryName || 'General'}
                    </span>
                    <button
                      onClick={() => toggleProductStatus(p.id)}
                      className={`p-1 rounded-lg transition-colors ${
                        p.isAvailable
                          ? 'text-emerald-700 bg-brand-green/30 hover:bg-brand-green/50'
                          : 'text-rose-700 bg-brand-red/30 hover:bg-brand-red/50'
                      }`}
                      title={p.isAvailable ? 'Desactivar producto' : 'Activar producto'}
                    >
                      {p.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-brand-dark mt-1 truncate">{p.name}</h4>
                  <p className="text-xs font-extrabold text-brand-brown mt-0.5">
                    {formatCurrency(p.price)}
                  </p>
                </div>
              </div>

              <p className="text-xs text-brand-brown/80 line-clamp-2 leading-relaxed">
                {p.description}
              </p>

              <div className="flex flex-wrap gap-1 pt-1">
                {p.channels.map((ch) => (
                  <span
                    key={ch}
                    className="text-[10px] bg-brand-cream border border-brand-secondary/60 text-brand-dark px-2 py-0.5 rounded-full font-medium"
                  >
                    {ch === 'salon' ? 'Salón' : ch === 'retiro' ? 'Retiro' : 'Delivery'}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-3 border-t border-brand-secondary/60">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  p.isAvailable ? 'bg-brand-green/30 text-emerald-800' : 'bg-brand-red/30 text-rose-800'
                }`}
              >
                {p.isAvailable ? 'Disponible' : 'No disponible'}
              </span>

              <button
                onClick={() => handleOpenEditModal(p)}
                className="py-1 px-3 rounded-lg bg-brand-bg hover:bg-brand-secondary/40 text-brand-dark text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Edit className="w-3.5 h-3.5 text-brand-brown" /> Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 max-w-md w-full shadow-soft-lg space-y-4">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <h3 className="text-base font-bold text-brand-dark">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-brand-dark mb-1">Nombre del producto</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Capuchino Especial"
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Categoría</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Precio ($ ARS)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles del producto..."
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Imagen del Producto (Preset / URL / Subir Foto)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://ejemplo.com/foto.jpg o /products/..."
                      className="flex-1 px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs font-mono focus:outline-none"
                    />
                    <label className="px-3 py-2 rounded-xl bg-brand-brown hover:bg-brand-dark text-brand-card font-bold text-xs cursor-pointer transition-colors flex items-center gap-1 shrink-0">
                      <Image className="w-4 h-4 text-brand-yellow" />
                      <span>Subir foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setFormData({ ...formData, image: reader.result });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-3 bg-brand-cream p-2.5 rounded-xl border border-brand-secondary/60">
                    <div className="w-12 h-12 rounded-lg bg-white border border-brand-secondary flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      <img src={formData.image} alt="Vista previa" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-brand-brown/80 uppercase block">O elegir ícono preset:</span>
                      <select
                        value={formData.image.startsWith('/products/') ? formData.image : ''}
                        onChange={(e) => {
                          if (e.target.value) setFormData({ ...formData, image: e.target.value });
                        }}
                        className="w-full mt-0.5 px-2 py-1 rounded-lg border border-brand-secondary/80 bg-white text-xs"
                      >
                        <option value="">-- Usar URL / Foto Personalizada --</option>
                        <option value="/products/espresso.svg">Café Espresso</option>
                        <option value="/products/cafe-con-leche.svg">Café con Leche</option>
                        <option value="/products/capuchino.svg">Capuchino</option>
                        <option value="/products/te.svg">Té Orgánico</option>
                        <option value="/products/medialunas.svg">Medialunas</option>
                        <option value="/products/tostadas.svg">Tostadas</option>
                        <option value="/products/sandwich.svg">Sándwich Jamón/Queso</option>
                        <option value="/products/cheesecake.svg">Cheesecake</option>
                        <option value="/products/brownie.svg">Brownie</option>
                        <option value="/products/torta-chocolate.svg">Torta Fudge</option>
                        <option value="/products/jugo-naranja.svg">Jugo de Naranja</option>
                        <option value="/products/limonada.svg">Limonada</option>
                        <option value="/products/combo-desayuno.svg">Combo Desayuno</option>
                        <option value="/products/combo-merienda.svg">Combo Merienda</option>
                        <option value="/products/ensalada.svg">Ensalada</option>
                        <option value="/products/hamburguesa.svg">Hamburguesa</option>
                        <option value="/products/pizza.svg">Pizza Margherita</option>
                        <option value="/products/empanadas.svg">Empanadas</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Canales disponibles</label>
                <div className="flex gap-2">
                  {(['salon', 'retiro', 'delivery'] as Channel[]).map((ch) => {
                    const active = formData.channels.includes(ch);
                    return (
                      <button
                        type="button"
                        key={ch}
                        onClick={() => toggleChannel(ch)}
                        className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                          active
                            ? 'bg-brand-brown text-brand-card'
                            : 'bg-brand-bg text-brand-dark border border-brand-secondary'
                        }`}
                      >
                        {ch === 'salon' ? 'Salón' : ch === 'retiro' ? 'Retiro' : 'Delivery'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="accent-brand-brown"
                  />
                  <span>Disponible</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="accent-brand-brown"
                  />
                  <span>Destacado</span>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold hover:bg-brand-dark transition-colors"
                >
                  Guardar producto
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-brand-secondary font-bold text-brand-dark hover:bg-brand-secondary/30"
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
