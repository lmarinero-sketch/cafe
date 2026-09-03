import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle2,
  X,
  MapPin,
  Phone,
  User,
  CreditCard,
  Utensils,
  ChevronRight,
  Star,
  Maximize2,
  FileText,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Product, OrderItem, PaymentMethod, OrderType } from '../types';
import { formatCurrency } from '../utils/currency';
import { PrintableMenuModal } from '../components/menu/PrintableMenuModal';

export const PublicMenuPage: React.FC = () => {
  const { products, categories, tables, createOrder, customers, cashRegisters, redeemGiftCard, getGiftCardByCode } = useApp();
  const { showToast } = useToast();
  const activeRegister = cashRegisters.find((r) => r.status === 'abierta');
  const [searchParams] = useSearchParams();

  // URL table param (e.g. /menu?table=tbl-2)
  const tableIdFromUrl = searchParams.get('table');
  const selectedTableObj = tables.find((t) => t.id === tableIdFromUrl);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expandedImageProduct, setExpandedImageProduct] = useState<Product | null>(null);
  const [productQty, setProductQty] = useState(1);
  const [productNotes, setProductNotes] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Cart Drawer & Checkout Form state
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>(selectedTableObj ? 'salon' : 'salon');
  const [selectedTableId, setSelectedTableId] = useState<string>(selectedTableObj ? selectedTableObj.id : tables[0]?.id || 'tbl-1');

  // Checkout Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressRef, setAddressRef] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [giftCardCode, setGiftCardCode] = useState<string>('');

  const [orderSuccessCode, setOrderSuccessCode] = useState<string | null>(null);

  // Filter products (Show available and unavailable items so user sees out-of-stock badges)
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const featuredProducts = products.filter((p) => p.isFeatured);

  const addToCart = () => {
    if (!selectedProduct) return;

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.productId === selectedProduct.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += productQty;
        if (productNotes) updated[existingIdx].notes = productNotes;
        return updated;
      }
      return [
        ...prev,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          unitPrice: selectedProduct.price,
          quantity: productQty,
          notes: productNotes,
          isComposite: selectedProduct.isComposite,
          compositeItems: selectedProduct.compositeItems,
        },
      ];
    });

    setSelectedProduct(null);
    setProductQty(1);
    setProductNotes('');
  };

  const updateCartQty = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, idx) => {
          if (idx === index) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? 1500 : 0;
  const total = subtotal + deliveryFee;

  // ── Componente interno reutilizable para cada tarjeta de producto ──
  const ProductCard = ({ p, onSelect, onExpand }: { p: Product; onSelect: () => void; onExpand: () => void }) => {
    const isOutOfStock = !p.isAvailable;
    return (
      <div
        onClick={() => { if (!isOutOfStock) onSelect(); }}
        className={`bg-brand-card rounded-2xl border p-3 shadow-xs transition-all flex items-center gap-3.5 ${
          isOutOfStock
            ? 'border-brand-red/50 bg-brand-bg/60 opacity-80 cursor-not-allowed'
            : 'border-brand-secondary hover:border-brand-brown/40 cursor-pointer'
        }`}
      >
        <div className="relative shrink-0 group cursor-pointer" onClick={(e) => { e.stopPropagation(); onExpand(); }}>
          <img src={p.image} alt={p.name} className={`w-20 h-20 rounded-xl object-cover bg-brand-bg border border-brand-secondary/60 ${isOutOfStock ? 'grayscale opacity-75' : ''}`} />
          <div className="absolute top-1 right-1 p-1 rounded-full bg-brand-dark/70 text-[#E5C378] opacity-90 group-hover:scale-110 transition-all shadow-xs">
            <Maximize2 className="w-3 h-3" />
          </div>
          {isOutOfStock && (
            <span className="absolute inset-0 m-auto w-max h-max bg-brand-red/90 text-rose-950 font-extrabold text-[9px] uppercase px-1.5 py-0.5 rounded shadow-xs">Agotado</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-xs font-bold text-brand-dark truncate">{p.name}</h4>
            {p.isComposite && (
              <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-1.5 py-0.5 rounded shrink-0">
                📦 Combo
              </span>
            )}
            {p.isFeatured && !isOutOfStock && !p.isComposite && (
              <span className="text-[9px] bg-brand-yellow/50 text-brand-brown font-bold px-1.5 py-0.5 rounded shrink-0">★ Destacado</span>
            )}
            {isOutOfStock && (
              <span className="text-[9px] bg-brand-red/30 text-rose-900 font-extrabold px-1.5 py-0.5 rounded shrink-0">Sin Stock</span>
            )}
          </div>
          <p className="text-[11px] text-brand-brown/80 line-clamp-2 mt-0.5 leading-relaxed">{p.description}</p>
          {p.isComposite && p.compositeItems && p.compositeItems.length > 0 && (
            <p className="text-[10px] text-amber-900 font-semibold truncate mt-1 bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-200">
              Incluye: {p.compositeItems.map((ci) => `${ci.quantity}x ${ci.productName}`).join(' + ')}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-extrabold text-brand-brown">{formatCurrency(p.price)}</span>
            {isOutOfStock ? (
              <span className="py-1 px-2.5 rounded-lg bg-brand-secondary/50 text-brand-brown/70 text-[11px] font-bold">Sin stock</span>
            ) : (
              <button className="py-1 px-2.5 rounded-lg bg-brand-brown text-brand-card text-[11px] font-bold hover:bg-brand-dark transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" /> Agregar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (paymentMethod === 'giftcard') {
      if (!giftCardCode.trim()) {
        showToast('Código Requerido', 'Por favor ingresá el código de tu Gift Card.', 'error');
        return;
      }
      const card = getGiftCardByCode(giftCardCode);
      if (!card) {
        showToast('Gift Card No Encontrada', 'No se encontró ninguna Gift Card con el código ingresado.', 'error');
        return;
      }
      if (card.currentBalance < total) {
        showToast(
          'Saldo Insuficiente',
          `Tu Gift Card tiene ${formatCurrency(card.currentBalance)} y el total es ${formatCurrency(total)}.`,
          'error'
        );
        return;
      }
    }

    // Optional customer link
    const matchedCustomer = customers.find(
      (c) => c.phone.includes(customerPhone.slice(-6)) || c.firstName.toLowerCase() === customerName.toLowerCase()
    );

    const activeTable = selectedTableObj || tables.find((t) => t.id === selectedTableId);

    const newOrder = createOrder({
      tableId: orderType === 'salon' && activeTable ? activeTable.id : undefined,
      tableName: orderType === 'salon' && activeTable ? activeTable.number : undefined,
      type: orderType,
      items: cart,
      subtotal,
      deliveryFee,
      total,
      customerName,
      customerPhone,
      address: orderType === 'delivery' ? address : undefined,
      addressRef: orderType === 'delivery' ? addressRef : undefined,
      paymentMethod,
      customerId: matchedCustomer ? matchedCustomer.id : undefined,
    });

    if (newOrder) {
      if (paymentMethod === 'giftcard') {
        redeemGiftCard(
          giftCardCode,
          total,
          newOrder.id,
          newOrder.code,
          activeTable ? activeTable.number : orderType,
          `Pago de Pedido QR ${newOrder.code}`
        );
      }
      setCart([]);
      setIsCartOpen(false);
      setOrderSuccessCode(newOrder.code);
      setGiftCardCode('');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark pb-24 max-w-6xl mx-auto relative border-x border-brand-secondary/60 shadow-soft-lg">
      {/* Top Header Banner */}
      <div className="bg-brand-card p-4 sm:p-6 border-b border-brand-secondary sticky top-0 z-30 shadow-xs">
        {/* Banner de Estado de Caja Cerrada */}
        {!activeRegister ? (
          <div className="mb-4 bg-rose-50 border-2 border-rose-400 p-3.5 rounded-2xl text-rose-950 flex items-center gap-3 shadow-soft animate-pulse">
            <span className="text-xl shrink-0">🔴</span>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm">El Local se encuentra cerrado</h4>
              <p className="text-[11px] sm:text-xs text-rose-900 mt-0.5">
                No se pueden realizar ni confirmar pedidos en este momento porque la caja está cerrada.
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-brand-brown shadow-soft bg-white shrink-0">
              <img src="/logo_hilos_de_amor.jpg" alt="Hilos de Amor" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-brand-dark leading-tight font-serif">Hilos de Amor</h2>
              {selectedTableObj ? (
                <span className="text-[11px] sm:text-xs font-bold text-brand-brown bg-brand-yellow/40 px-2.5 py-0.5 rounded-full inline-block mt-0.5 border border-brand-yellow/80">
                  📍 {selectedTableObj.number} ({selectedTableObj.sector})
                </span>
              ) : (
                <p className="text-[11px] sm:text-xs text-brand-brown/80 font-semibold">Pastelería y Encordado</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="relative flex-1 sm:w-64 md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-brand-brown/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cafés, medialunas, tartas..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs focus:outline-none focus:ring-2 focus:ring-brand-brown/40"
              />
            </div>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="p-2.5 sm:px-3.5 sm:py-2 rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark hover:bg-brand-secondary/40 transition-colors shadow-xs flex items-center gap-1.5 font-bold text-xs shrink-0"
              title="Descargar o Imprimir Carta en PDF"
            >
              <Download className="w-4 h-4 text-brand-brown" />
              <span className="hidden sm:inline">Carta PDF</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 sm:px-4 sm:py-2 rounded-xl bg-brand-brown text-brand-card hover:bg-brand-dark transition-colors shadow-soft flex items-center gap-2 font-bold text-xs shrink-0"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Ver Pedido</span>
              {cart.length > 0 && (
                <span className="bg-brand-yellow text-brand-dark font-extrabold text-[10px] px-1.5 py-0.5 rounded-full border border-brand-card">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Category Pills Navigation */}
      <div className="overflow-x-auto px-4 py-3 bg-brand-cream border-b border-brand-secondary/60 flex items-center gap-2 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-brand-brown text-brand-card shadow-soft'
              : 'bg-brand-card text-brand-dark hover:bg-brand-secondary/40'
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-brand-brown text-brand-card shadow-soft'
                : 'bg-brand-card text-brand-dark hover:bg-brand-secondary/40'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Featured Items Carousel (if looking at all categories and no search) */}
      {selectedCategory === 'all' && !searchQuery && featuredProducts.length > 0 && (
        <div className="px-4 pt-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-brown flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-brand-yellow text-brand-brown" /> Productos Destacados
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pb-2">
            {featuredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProduct(p);
                  setProductQty(1);
                  setProductNotes('');
                }}
                className="bg-brand-card rounded-2xl border border-brand-secondary p-3 shadow-xs hover:border-brand-brown/50 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="relative group">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-28 rounded-xl object-cover bg-brand-bg mb-2"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedImageProduct(p);
                    }}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-brand-dark/70 text-[#E5C378] hover:bg-brand-dark transition-all shadow-xs"
                    title="Ver imagen completa"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-dark truncate">{p.name}</h4>
                  <p className="text-xs font-extrabold text-brand-brown mt-0.5">
                    {formatCurrency(p.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid / List — agrupado por categoría */}
      <div className="p-4 space-y-8">
        {selectedCategory === 'all' ? (
          // Vista completa: secciones por categoría
          categories.map((cat) => {
            const catProducts = filteredProducts.filter((p) => p.categoryId === cat.id);
            if (catProducts.length === 0) return null;

            const catIcons: Record<string, string> = {
              'cat-1': '☕',
              'cat-2': '🍰',
              'cat-3': '🥐',
              'cat-4': '🍞',
              'cat-5': '🧊',
              'cat-6': '➕',
            };

            return (
              <div key={cat.id} className="space-y-3">
                {/* Category Section Header */}
                <div className="flex items-center gap-2 pb-1 border-b-2 border-brand-secondary">
                  <span className="text-lg">{catIcons[cat.id] ?? '🍽️'}</span>
                  <h3 className="text-sm font-extrabold text-brand-dark tracking-tight">
                    {cat.name}
                  </h3>
                  <span className="ml-auto text-[11px] font-bold text-brand-brown/60 bg-brand-cream px-2 py-0.5 rounded-full border border-brand-secondary/60">
                    {catProducts.length} items
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catProducts.map((p) => <ProductCard key={p.id} p={p} onSelect={() => { setSelectedProduct(p); setProductQty(1); setProductNotes(''); }} onExpand={() => setExpandedImageProduct(p)} />)}
                </div>
              </div>
            );
          })
        ) : (
          // Vista filtrada: grilla plana de la categoría seleccionada
          <>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-brown/80">
              {categories.find(c => c.id === selectedCategory)?.name ?? 'Categoría'} ({filteredProducts.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((p) => <ProductCard key={p.id} p={p} onSelect={() => { setSelectedProduct(p); setProductQty(1); setProductNotes(''); }} onExpand={() => setExpandedImageProduct(p)} />)}
            </div>
          </>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-t-3xl sm:rounded-2xl border border-brand-secondary p-5 max-w-md w-full shadow-soft-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-brand-dark">{selectedProduct.name}</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-44 rounded-xl object-cover bg-brand-bg border border-brand-secondary"
            />

            <p className="text-xs text-brand-brown/90 leading-relaxed">
              {selectedProduct.description}
            </p>

            {selectedProduct.isComposite && selectedProduct.compositeItems && selectedProduct.compositeItems.length > 0 && (
              <div className="bg-amber-50/90 p-3 rounded-xl border border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-950 uppercase tracking-wider">
                  <span>📦 Este Combo Incluye:</span>
                  {(() => {
                    const totalSeparado = selectedProduct.compositeItems.reduce((acc, it) => acc + (it.unitPrice || 0) * it.quantity, 0);
                    const ahorro = totalSeparado > selectedProduct.price ? totalSeparado - selectedProduct.price : 0;
                    return ahorro > 0 ? (
                      <span className="text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                        Ahorras {formatCurrency(ahorro)} ({Math.round((ahorro / totalSeparado) * 100)}% OFF)
                      </span>
                    ) : null;
                  })()}
                </div>
                <div className="space-y-1">
                  {selectedProduct.compositeItems.map((ci, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-amber-950 bg-white/80 p-1.5 rounded-lg border border-amber-200/60">
                      <span className="font-bold">{ci.quantity}x {ci.productName}</span>
                      {ci.unitPrice ? (
                        <span className="text-gray-500 font-mono text-[11px]">{formatCurrency(ci.unitPrice * ci.quantity)}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-base font-extrabold text-brand-brown">
              {formatCurrency(selectedProduct.price * productQty)}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-brand-bg p-2 rounded-xl border border-brand-secondary">
              <span className="text-xs font-bold text-brand-dark">Cantidad:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setProductQty(Math.max(1, productQty - 1))}
                  className="w-8 h-8 rounded-lg bg-brand-card border border-brand-secondary font-bold flex items-center justify-center text-brand-dark"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-brand-dark w-4 text-center">
                  {productQty}
                </span>
                <button
                  onClick={() => setProductQty(productQty + 1)}
                  className="w-8 h-8 rounded-lg bg-brand-brown text-brand-card font-bold flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Observations input */}
            <div>
              <label className="block text-[11px] font-bold text-brand-dark mb-1">
                Observaciones para cocina:
              </label>
              <input
                type="text"
                value={productNotes}
                onChange={(e) => setProductNotes(e.target.value)}
                placeholder="Ej. sin azúcar, con leche tibia..."
                className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs focus:outline-none"
              />
            </div>

            <button
              onClick={addToCart}
              className="w-full py-3 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors shadow-soft flex items-center justify-center gap-2"
            >
              Agregar al pedido • {formatCurrency(selectedProduct.price * productQty)}
            </button>
          </div>
        </div>
      )}

      {/* Public Menu Footer */}
      <footer className="p-4 mt-6 text-center text-xs text-brand-brown/80 border-t border-brand-secondary/60 space-y-1">
        <p>Hilos de Amor • Carta Digital</p>
        <p>
          <a
            href="https://www.growlabs.lat"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-brand-brown hover:text-brand-dark hover:underline inline-flex items-center gap-1"
          >
            Diseñado por <span className="text-emerald-900 font-extrabold">Grow Labs</span> 🚀
          </a>
        </p>
      </footer>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-t-3xl sm:rounded-2xl border border-brand-secondary p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-soft-lg">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-brand-brown" /> Tu Pedido
              </h3>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="text-center text-xs text-brand-brown/70 py-8">
                El carrito está vacío. Agregá productos para continuar.
              </p>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                {/* Cart Items List */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-brand-bg border border-brand-secondary/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-bold text-brand-dark truncate">{item.productName}</h4>
                        {item.notes && <p className="text-[10px] text-brand-brown/80">Nota: {item.notes}</p>}
                        <p className="font-extrabold text-brand-brown mt-0.5">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateCartQty(idx, -1)}
                          className="w-6 h-6 rounded bg-brand-card border border-brand-secondary flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="font-bold text-brand-dark w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(idx, 1)}
                          className="w-6 h-6 rounded bg-brand-brown text-brand-card flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Type Switcher: En el local (Mesa), Delivery, Retiro */}
                <div className="grid grid-cols-3 gap-1.5 bg-brand-bg p-1.5 rounded-xl border border-brand-secondary">
                  <button
                    type="button"
                    onClick={() => setOrderType('salon')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center ${
                      orderType === 'salon'
                        ? 'bg-brand-brown text-brand-card shadow-soft'
                        : 'text-brand-dark/70 hover:bg-brand-secondary/30'
                    }`}
                  >
                    🍽️ En el local
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center ${
                      orderType === 'delivery'
                        ? 'bg-brand-brown text-brand-card shadow-soft'
                        : 'text-brand-dark/70 hover:bg-brand-secondary/30'
                    }`}
                  >
                    🛵 Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('retiro')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center ${
                      orderType === 'retiro'
                        ? 'bg-brand-brown text-brand-card shadow-soft'
                        : 'text-brand-dark/70 hover:bg-brand-secondary/30'
                    }`}
                  >
                    🛍️ Retiro
                  </button>
                </div>

                {/* Table Picker when 'salon' (En el local) is active */}
                {orderType === 'salon' && (
                  <div className="bg-brand-yellow/20 p-3 rounded-xl border border-brand-yellow/60 space-y-2 text-xs">
                    <label className="block font-extrabold text-brand-dark">
                      📍 Selección de Mesa para consumo en el local:
                    </label>
                    {selectedTableObj ? (
                      <div className="font-bold text-brand-brown bg-brand-card p-2 rounded-lg border border-brand-secondary">
                        Mesa vinculada: {selectedTableObj.number} ({selectedTableObj.sector})
                      </div>
                    ) : (
                      <select
                        value={selectedTableId}
                        onChange={(e) => setSelectedTableId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-card font-bold text-brand-dark focus:outline-none"
                      >
                        {tables.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.number} — {t.sector} ({t.capacity} pers) • {t.status}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Customer Info Fields */}
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block font-bold text-brand-dark mb-1">Tu Nombre y Apellido *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Martín Pérez"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-brand-dark mb-1">Tu Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. +54 9 11 1234-5678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-bold focus:outline-none"
                    />
                    <span className="text-[10px] text-brand-brown/80 mt-0.5 block">
                      Vincula automáticamente tus puntos del Club de Socios
                    </span>
                  </div>

                  {orderType === 'delivery' && (
                    <>
                      <div>
                        <label className="block font-bold text-brand-dark mb-1">Dirección de entrega *</label>
                        <input
                          type="text"
                          required
                          placeholder="Calle, altura y piso/depto"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-brand-dark mb-1">Referencia</label>
                        <input
                          type="text"
                          placeholder="Ej. Entre calles o timbre"
                          value={addressRef}
                          onChange={(e) => setAddressRef(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block font-bold text-brand-dark mb-1">Método de pago</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-bold text-brand-dark focus:outline-none"
                    >
                      <option value="efectivo">💵 Efectivo en el local</option>
                      <option value="transferencia">🏦 Transferencia bancaria / QR</option>
                      <option value="mercadopago">📲 Mercado Pago</option>
                      <option value="giftcard">🎁 Gift Card Virtual (Saldo en Dinero)</option>
                      <option value="debito">💳 Tarjeta de débito</option>
                      <option value="credito">💳 Tarjeta de crédito</option>
                    </select>
                  </div>

                  {paymentMethod === 'giftcard' && (
                    <div className="p-3 bg-brand-cream rounded-xl border border-brand-secondary space-y-2 animate-fade-in text-xs">
                      <label className="block font-extrabold text-brand-dark text-[11px] uppercase tracking-wider">
                        Código de tu Gift Card Virtual
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: GIFT-8921-MAG"
                        value={giftCardCode}
                        onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 bg-brand-card border border-brand-secondary rounded-xl font-mono font-extrabold text-xs text-brand-dark tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-amber-600/30"
                      />

                      {giftCardCode.trim() && (() => {
                        const matched = getGiftCardByCode(giftCardCode);
                        if (!matched) {
                          return (
                            <p className="text-[11px] font-bold text-rose-600">
                              ✕ Código no encontrado. Verificá que esté bien escrito.
                            </p>
                          );
                        }
                        const hasEnough = matched.currentBalance >= total;
                        return (
                          <div className="p-2.5 bg-brand-card rounded-lg border border-brand-secondary space-y-1">
                            <div className="flex justify-between font-bold text-[11px]">
                              <span>Titular: <strong>{matched.recipientName}</strong></span>
                              <span className={hasEnough ? 'text-emerald-800' : 'text-rose-600'}>
                                Saldo: {formatCurrency(matched.currentBalance)}
                              </span>
                            </div>
                            {hasEnough ? (
                              <p className="text-[10px] text-emerald-800 font-bold">
                                ✓ Saldo suficiente para abonar este pedido ({formatCurrency(total)}).
                              </p>
                            ) : (
                              <p className="text-[10px] text-rose-600 font-bold">
                                ⚠️ Saldo insuficiente ({formatCurrency(matched.currentBalance)} disponible).
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Club Points Banner in Cart */}
                <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-xs text-emerald-950 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⭐</span>
                    <div>
                      <span className="font-extrabold text-[11px] block">Club de Puntos Hilos de Amor</span>
                      <span className="text-[10px] text-emerald-800">Acumulás 100 pts por cada $1.000 consumidos</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs font-mono">
                    +{Math.floor(total / 10)} pts
                  </span>
                </div>

                {/* Subtotal & Total Breakdown */}
                <div className="bg-brand-cream p-3 rounded-xl border border-brand-secondary space-y-1 text-xs">
                  <div className="flex justify-between text-brand-brown">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {orderType === 'delivery' && (
                    <div className="flex justify-between text-brand-brown">
                      <span>Costo de envío:</span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-brand-dark pt-1 border-t border-brand-secondary/60">
                    <span>Total a pagar:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                {!activeRegister ? (
                  <div className="bg-rose-100 border border-rose-300 text-rose-950 p-3 rounded-xl text-xs font-bold flex flex-col gap-1 text-center">
                    <span>⚠️ Local Cerrado (Caja cerrada)</span>
                    <span className="font-normal text-[11px]">No se pueden procesar ni recibir pedidos en este momento.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] text-brand-brown/80 text-center">
                      🔒 Al confirmar, el pedido se enviará directo a cocina. Anulaciones únicamente por el <strong>mozo</strong>.
                    </p>
                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors shadow-soft"
                    >
                      Confirmar pedido • {formatCurrency(total)}
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {orderSuccessCode && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-brand-dark/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border-2 border-emerald-600 p-6 max-w-sm w-full text-center space-y-4 shadow-soft-lg">
            <CheckCircle2 className="w-12 h-12 text-emerald-800 mx-auto" />
            <div>
              <h3 className="text-lg font-extrabold text-brand-dark font-serif">¡Pedido Recibido con Éxito!</h3>
              <p className="text-xs text-brand-brown/90 mt-1">
                {selectedTableObj ? `Vinculado a ${selectedTableObj.number}` : 'Enviado a la cocina de Hilos de Amor.'}
              </p>
            </div>

            <div className="p-3 bg-brand-cream rounded-xl border border-brand-secondary font-mono font-extrabold text-sm text-brand-brown">
              Código: #{orderSuccessCode}
            </div>

            <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl text-xs text-emerald-950">
              <p className="font-extrabold text-[11px]">⭐ ¡Puntos Acumulados en tu Socio!</p>
              <p className="text-[10px] text-emerald-800 mt-0.5">
                Sumaste <strong>+{Math.floor(total / 10)} puntos</strong> en tu tarjeta digital con tu número {customerPhone}.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-xl text-xs text-amber-950 text-left space-y-0.5">
              <p className="font-extrabold text-[11px] flex items-center gap-1 text-amber-900">
                🔒 Política de Comanda en Mesa
              </p>
              <p className="text-[10px] text-amber-900/90 leading-tight">
                Los pedidos no se pueden cancelar ni eliminar desde este menú digital. Si necesitás modificar o anular tu comanda, por favor solicitalo a tu <strong>mozo</strong>.
              </p>
            </div>

            <button
              onClick={() => setOrderSuccessCode(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors shadow-soft"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
      {/* Modal Visor de Imagen Expandida */}
      {expandedImageProduct && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-md animate-fade-in"
          onClick={() => setExpandedImageProduct(null)}
        >
          <div
            className="bg-brand-card rounded-3xl border-2 border-[#E5C378] p-5 max-w-lg w-full shadow-2xl space-y-4 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setExpandedImageProduct(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-brand-dark/80 text-white flex items-center justify-center hover:bg-brand-dark transition-all shadow-md"
              title="Cerrar visor"
            >
              <X className="w-5 h-5 text-[#E5C378]" />
            </button>

            {/* Main High Res Image View */}
            <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-brand-bg border border-brand-secondary/80 shadow-inner flex items-center justify-center">
              <img
                src={expandedImageProduct.image}
                alt={expandedImageProduct.name}
                className="w-full h-full object-contain p-2"
              />
              <div className="absolute top-3 left-3 bg-brand-dark/90 backdrop-blur-xs text-[#E5C378] px-3 py-1 rounded-full text-xs font-serif font-bold tracking-wider border border-[#E5C378]/40 shadow-xs">
                Hilos de Amor • Visor de Imagen
              </div>
            </div>

            {/* Product Information Footer */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-brand-dark font-serif">{expandedImageProduct.name}</h3>
                <span className="text-base font-extrabold text-brand-brown font-serif">
                  {formatCurrency(expandedImageProduct.price)}
                </span>
              </div>
              {expandedImageProduct.description && (
                <p className="text-xs text-brand-brown/90 leading-relaxed font-medium">
                  {expandedImageProduct.description}
                </p>
              )}

              <div className="pt-3 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedProduct(expandedImageProduct);
                    setProductQty(1);
                    setProductNotes('');
                    setExpandedImageProduct(null);
                  }}
                  className="w-full py-3 rounded-2xl bg-brand-brown hover:bg-brand-dark text-brand-card font-extrabold text-xs shadow-soft transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 text-brand-yellow" /> Pedir este producto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Impresión / PDF de La Carta */}
      <PrintableMenuModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
};
