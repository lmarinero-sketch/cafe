import React, { useState } from 'react';
import { Plus, Search, Eye, EyeOff, Edit, Tag, Image, Check, X, Package, Layers, Trash2, Percent, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, Channel, CompositeItem } from '../types';
import { formatCurrency } from '../utils/currency';
import { ModuleOnboardingBanner } from '../components/common/ModuleOnboardingBanner';

export const ProductsPage: React.FC = () => {
  const { products, categories, addProduct, updateProduct, toggleProductStatus } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'simple' | 'composite'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Composite builder state
  const [selectedCompProdId, setSelectedCompProdId] = useState<string>('');
  const [compProdQty, setCompProdQty] = useState<number>(1);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    categoryId: string;
    description: string;
    price: number;
    image: string;
    isAvailable: boolean;
    isFeatured: boolean;
    channels: Channel[];
    isComposite: boolean;
    compositeItems: CompositeItem[];
  }>({
    name: '',
    categoryId: categories[0]?.id || 'cat-1',
    description: '',
    price: 3000,
    image: '/products/espresso.svg',
    isAvailable: true,
    isFeatured: false,
    channels: ['salon', 'retiro', 'delivery'] as Channel[],
    isComposite: false,
    compositeItems: [],
  });

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === 'all'
        ? true
        : filterType === 'composite'
        ? Boolean(p.isComposite)
        : !p.isComposite;
    return matchesCat && matchesSearch && matchesType;
  });

  const handleOpenCreateModal = (asComposite = false) => {
    setEditingProduct(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id || 'cat-1',
      description: '',
      price: 3000,
      image: asComposite ? '/products/combo-desayuno.svg' : '/products/espresso.svg',
      isAvailable: true,
      isFeatured: false,
      channels: ['salon', 'retiro', 'delivery'],
      isComposite: asComposite,
      compositeItems: [],
    });
    setSelectedCompProdId('');
    setCompProdQty(1);
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
      isComposite: Boolean(product.isComposite),
      compositeItems: product.compositeItems || [],
    });
    setSelectedCompProdId('');
    setCompProdQty(1);
    setIsModalOpen(true);
  };

  const handleAddCompositeItem = () => {
    if (!selectedCompProdId) return;
    const targetProduct = products.find((p) => p.id === selectedCompProdId);
    if (!targetProduct) return;

    setFormData((prev) => {
      const existingIndex = prev.compositeItems.findIndex((item) => item.productId === targetProduct.id);
      if (existingIndex >= 0) {
        const updated = [...prev.compositeItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + compProdQty,
          unitPrice: targetProduct.price,
        };
        return { ...prev, compositeItems: updated };
      } else {
        return {
          ...prev,
          compositeItems: [
            ...prev.compositeItems,
            {
              productId: targetProduct.id,
              productName: targetProduct.name,
              quantity: compProdQty,
              unitPrice: targetProduct.price,
            },
          ],
        };
      }
    });

    setCompProdQty(1);
  };

  const handleUpdateCompositeItemQty = (productId: string, delta: number) => {
    setFormData((prev) => {
      const updated = prev.compositeItems
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CompositeItem[];
      return { ...prev, compositeItems: updated };
    });
  };

  const handleRemoveCompositeItem = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      compositeItems: prev.compositeItems.filter((i) => i.productId !== productId),
    }));
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
            Gestión de carta, promociones, precios y recetas ({products.length} ítems en catálogo)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenCreateModal(false)}
            className="py-2.5 px-4 rounded-xl bg-brand-bg hover:bg-brand-secondary/40 text-brand-dark border border-brand-secondary font-bold text-xs transition-all duration-200 shadow-soft flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-brand-brown" />
            Producto Simple
          </button>
          <button
            onClick={() => handleOpenCreateModal(true)}
            className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs transition-all duration-200 shadow-soft flex items-center gap-2"
          >
            <Package className="w-4 h-4 text-amber-200" />
            Nuevo Combo / Promo
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft space-y-3">
        {/* Type Selector (All, Simples, Combos) */}
        <div className="flex items-center gap-2 border-b border-brand-secondary/60 pb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-brown/70 mr-1">
            Tipo de Producto:
          </span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-brand-brown text-brand-card shadow-xs'
                : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40'
            }`}
          >
            Todos ({products.length})
          </button>
          <button
            onClick={() => setFilterType('simple')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              filterType === 'simple'
                ? 'bg-brand-brown text-brand-card shadow-xs'
                : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40'
            }`}
          >
            <span>☕ Simples ({products.filter((p) => !p.isComposite).length})</span>
          </button>
          <button
            onClick={() => setFilterType('composite')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              filterType === 'composite'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-100/70 text-amber-950 border border-amber-300 hover:bg-amber-200/60'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-amber-700" />
            <span>Combos & Promos ({products.filter((p) => p.isComposite).length})</span>
          </button>
        </div>

        {/* Category & Search Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-brand-brown text-brand-card shadow-soft'
                  : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40'
              }`}
            >
              Todas las Categorías
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
                  <div className="flex items-center justify-between gap-1">
                    {p.isComposite ? (
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1">
                        <Package className="w-3 h-3 text-amber-700" /> Combo / Promo
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown/80 bg-brand-secondary/40 px-2 py-0.5 rounded">
                        {p.categoryName || 'General'}
                      </span>
                    )}
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
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs font-extrabold text-brand-brown">
                      {formatCurrency(p.price)}
                    </p>
                    {p.isComposite && p.compositeItems && p.compositeItems.length > 0 && (() => {
                      const totalSeparado = p.compositeItems.reduce((acc, it) => acc + (it.unitPrice || 0) * it.quantity, 0);
                      const ahorro = totalSeparado > p.price ? totalSeparado - p.price : 0;
                      return ahorro > 0 ? (
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded-full">
                          {Math.round((ahorro / totalSeparado) * 100)}% OFF
                        </span>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>

              <p className="text-xs text-brand-brown/80 line-clamp-2 leading-relaxed">
                {p.description}
              </p>

              {/* Box de Contenido si es Producto Compuesto */}
              {p.isComposite && p.compositeItems && p.compositeItems.length > 0 && (
                <div className="bg-amber-50/90 p-2.5 rounded-xl border border-amber-200/90 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-amber-950 uppercase tracking-wider">
                    <span>Incluye {p.compositeItems.reduce((s, i) => s + i.quantity, 0)} productos:</span>
                    {(() => {
                      const totalSeparado = p.compositeItems.reduce((acc, it) => acc + (it.unitPrice || 0) * it.quantity, 0);
                      const ahorro = totalSeparado > p.price ? totalSeparado - p.price : 0;
                      return ahorro > 0 ? (
                        <span className="text-emerald-800 font-bold">
                          Ahorra {formatCurrency(ahorro)}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.compositeItems.map((item, idx) => (
                      <span key={idx} className="bg-white px-2 py-0.5 rounded-md border border-amber-200 text-[11px] font-bold text-amber-950 shadow-2xs">
                        <strong className="text-amber-800">{item.quantity}x</strong> {item.productName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-soft-lg space-y-4">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <div className="flex items-center gap-2">
                {formData.isComposite && <Package className="w-5 h-5 text-amber-600" />}
                <h3 className="text-base font-bold text-brand-dark">
                  {editingProduct
                    ? formData.isComposite
                      ? 'Editar Combo / Promoción'
                      : 'Editar Producto Simple'
                    : formData.isComposite
                    ? 'Crear Nuevo Combo / Promoción'
                    : 'Crear Nuevo Producto Simple'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de Tipo de Producto */}
            <div className="grid grid-cols-2 gap-2 bg-brand-bg p-1.5 rounded-xl border border-brand-secondary">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isComposite: false })}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  !formData.isComposite
                    ? 'bg-brand-brown text-brand-card shadow-xs'
                    : 'text-brand-dark hover:bg-brand-secondary/40'
                }`}
              >
                <span>☕ Producto Simple</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    isComposite: true,
                    image: formData.image === '/products/espresso.svg' ? '/products/combo-desayuno.svg' : formData.image,
                  })
                }
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  formData.isComposite
                    ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-400'
                    : 'text-brand-dark hover:bg-brand-secondary/40'
                }`}
              >
                <Package className="w-4 h-4 text-amber-200" />
                <span>📦 Producto Compuesto (Combo)</span>
              </button>
            </div>

            {/* Constructor Visual de Combo / Promoción si isComposite está activo */}
            {formData.isComposite && (
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-700" />
                      <span>Composición del Combo</span>
                    </h4>
                    <p className="text-[11px] text-amber-900/80">
                      Seleccioná los productos que integran esta promoción y sus cantidades.
                    </p>
                  </div>
                  {formData.compositeItems.length > 0 && (
                    <span className="text-[10px] font-black bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full border border-amber-300">
                      {formData.compositeItems.reduce((s, i) => s + i.quantity, 0)} ítems incluidos
                    </span>
                  )}
                </div>

                {/* Fila para seleccionar producto y agregar */}
                <div className="flex flex-col sm:flex-row items-end gap-2 pt-1">
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] font-bold text-amber-950 mb-1 uppercase tracking-wider">
                      Agregar Producto al Combo:
                    </label>
                    <select
                      value={selectedCompProdId}
                      onChange={(e) => setSelectedCompProdId(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-amber-300 bg-white text-xs font-bold text-brand-dark focus:outline-none"
                    >
                      <option value="">-- Seleccionar producto del catálogo --</option>
                      {products
                        .filter((p) => p.id !== editingProduct?.id && !p.isComposite)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({formatCurrency(p.price)})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex items-end gap-2 w-full sm:w-auto">
                    <div className="w-24">
                      <label className="block text-[10px] font-bold text-amber-950 mb-1 uppercase tracking-wider">
                        Cantidad:
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={compProdQty}
                        onChange={(e) => setCompProdQty(Math.max(1, Number(e.target.value)))}
                        className="w-full px-2 py-2 rounded-xl border border-amber-300 bg-white text-xs font-bold text-center focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={!selectedCompProdId}
                      onClick={handleAddCompositeItem}
                      className="py-2 px-3.5 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white font-extrabold text-xs flex items-center gap-1 shadow-xs transition-colors shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Incluir</span>
                    </button>
                  </div>
                </div>

                {/* Lista de productos incluidos en el Combo */}
                {formData.compositeItems.length === 0 ? (
                  <div className="p-3.5 bg-white/70 rounded-xl border border-dashed border-amber-300 text-center text-xs text-amber-900/80 font-medium">
                    Aún no incluiste productos en este combo. Elegí un producto arriba y presioná <strong>"Incluir"</strong>.
                  </div>
                ) : (
                  <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-amber-200 divide-y divide-amber-100">
                    {formData.compositeItems.map((item) => {
                      const prodRef = products.find((p) => p.id === item.productId);
                      const unitPrice = item.unitPrice || prodRef?.price || 0;
                      const subtotal = unitPrice * item.quantity;
                      return (
                        <div key={item.productId} className="pt-2 first:pt-0 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {prodRef?.image && (
                              <img
                                src={prodRef.image}
                                alt={item.productName}
                                className="w-9 h-9 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0"
                              />
                            )}
                            <div className="truncate">
                              <span className="font-bold text-gray-900 block truncate">{item.productName}</span>
                              <span className="text-[10px] text-gray-500 font-medium">
                                {formatCurrency(unitPrice)} unitario
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => handleUpdateCompositeItemQty(item.productId, -1)}
                                className="px-2 py-0.5 text-gray-700 hover:bg-gray-200 font-bold"
                              >
                                -
                              </button>
                              <span className="px-2 font-mono font-extrabold text-xs">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateCompositeItemQty(item.productId, 1)}
                                className="px-2 py-0.5 text-gray-700 hover:bg-gray-200 font-bold"
                              >
                                +
                              </button>
                            </div>

                            <span className="font-mono font-extrabold text-gray-900 w-16 text-right text-xs">
                              {formatCurrency(subtotal)}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleRemoveCompositeItem(item.productId)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Quitar del combo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Comparador de Precios y Descuento en Vivo */}
                {formData.compositeItems.length > 0 && (() => {
                  const totalIndividual = formData.compositeItems.reduce((acc, it) => {
                    const pRef = products.find((p) => p.id === it.productId);
                    return acc + (it.unitPrice || pRef?.price || 0) * it.quantity;
                  }, 0);
                  const ahorro = totalIndividual > formData.price ? totalIndividual - formData.price : 0;
                  const porcentaje = totalIndividual > 0 ? Math.round((ahorro / totalIndividual) * 100) : 0;

                  return (
                    <div className="bg-amber-100/80 p-3 rounded-xl border border-amber-300 text-xs space-y-1.5">
                      <div className="flex justify-between text-amber-900">
                        <span>Suma de productos comprados por separado:</span>
                        <span className="font-mono font-bold line-through text-gray-500">
                          {formatCurrency(totalIndividual)}
                        </span>
                      </div>
                      <div className="flex justify-between font-black text-amber-950 text-sm">
                        <span>Precio de Venta Promocional:</span>
                        <span className="font-mono text-emerald-900">{formatCurrency(formData.price)}</span>
                      </div>
                      {ahorro > 0 ? (
                        <div className="flex justify-between text-emerald-800 font-black text-xs pt-1 border-t border-amber-300/60">
                          <span>Beneficio / Ahorro para el Cliente:</span>
                          <span className="bg-emerald-200 text-emerald-950 px-2.5 py-0.5 rounded-full shadow-2xs">
                            Ahorra {formatCurrency(ahorro)} ({porcentaje}% OFF)
                          </span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-amber-800 italic pt-0.5">
                          Tip: Fijá el precio del combo por debajo de {formatCurrency(totalIndividual)} para ofrecer un descuento atractivo al cliente.
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-brand-dark mb-1">
                  {formData.isComposite ? 'Nombre de la Promoción / Combo' : 'Nombre del producto'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={formData.isComposite ? 'Ej. Promo Desayuno (Café + 2 Medialunas)' : 'Ej. Capuchino Especial'}
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
                  <label className="block font-bold text-brand-dark mb-1">
                    {formData.isComposite ? 'Precio Promo ($ ARS)' : 'Precio ($ ARS)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none font-bold"
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
