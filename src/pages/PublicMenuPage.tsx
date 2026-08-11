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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, OrderItem, PaymentMethod, OrderType } from '../types';
import { formatCurrency } from '../utils/currency';

export const PublicMenuPage: React.FC = () => {
  const { products, categories, tables, createOrder, customers } = useApp();
  const [searchParams] = useSearchParams();

  // URL table param (e.g. /menu?table=tbl-2)
  const tableIdFromUrl = searchParams.get('table');
  const selectedTableObj = tables.find((t) => t.id === tableIdFromUrl);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productQty, setProductQty] = useState(1);
  const [productNotes, setProductNotes] = useState('');

  // Cart Drawer & Checkout Form state
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>(selectedTableObj ? 'salon' : 'salon');
  const [selectedTableId, setSelectedTableId] = useState<string>(selectedTableObj ? selectedTableObj.id : tables[0]?.id || 'tbl-1');

  // Checkout Form fields
  const [customerName, setCustomerName] = useState('Sofía Martínez');
  const [customerPhone, setCustomerPhone] = useState('+5491133445566');
  const [address, setAddress] = useState('Av. Corrientes 1450, 4B');
  const [addressRef, setAddressRef] = useState('Frente al banco');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');

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

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

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

    setCart([]);
    setIsCartOpen(false);
    setOrderSuccessCode(newOrder.code);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark pb-24 max-w-6xl mx-auto relative border-x border-brand-secondary/60 shadow-soft-lg">
      {/* Top Header Banner */}
      <div className="bg-brand-card p-4 sm:p-6 border-b border-brand-secondary sticky top-0 z-30 shadow-xs">
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

        {/* Autogestión & Cash Impact Callout Banner */}
        <div className="bg-brand-yellow/30 border border-brand-yellow/80 rounded-xl p-3 text-xs text-brand-dark flex items-start gap-2.5 shadow-xs">
          <span className="text-base shrink-0">📱</span>
          <div>
            <h4 className="font-extrabold text-brand-dark text-[11px] sm:text-xs leading-tight">
              Experiencia de Autogestión del Cliente
            </h4>
            <p className="text-[10px] sm:text-xs text-brand-brown/90 mt-0.5 leading-relaxed">
              El cliente realiza todo el pedido de forma autónoma desde su celular o PC. Al confirmar, <span className="font-bold text-brand-dark">impacta directamente en la caja</span> del comercio y en la comanda de cocina en tiempo real.
            </p>
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
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-28 rounded-xl object-cover bg-brand-bg mb-2"
                />
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

      {/* Products Grid / List */}
      <div className="p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-brown/80">
          Nuestra Carta ({filteredProducts.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => {
            const isOutOfStock = !p.isAvailable;
            return (
              <div
                key={p.id}
                onClick={() => {
                  if (isOutOfStock) return;
                  setSelectedProduct(p);
                  setProductQty(1);
                  setProductNotes('');
                }}
                className={`bg-brand-card rounded-2xl border p-3 shadow-xs transition-all flex items-center gap-3.5 ${
                  isOutOfStock
                    ? 'border-brand-red/50 bg-brand-bg/60 opacity-80 cursor-not-allowed'
                    : 'border-brand-secondary hover:border-brand-brown/40 cursor-pointer'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className={`w-20 h-20 rounded-xl object-cover bg-brand-bg border border-brand-secondary/60 ${
                      isOutOfStock ? 'grayscale opacity-75' : ''
                    }`}
                  />
                  {isOutOfStock && (
                    <span className="absolute inset-0 m-auto w-max h-max bg-brand-red/90 text-rose-950 font-extrabold text-[9px] uppercase px-1.5 py-0.5 rounded shadow-xs">
                      Agotado
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-brand-dark truncate">{p.name}</h4>
                    {p.isFeatured && !isOutOfStock && (
                      <span className="text-[9px] bg-brand-yellow/50 text-brand-brown font-bold px-1.5 py-0.2 rounded shrink-0">
                        ★ Destacado
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className="text-[9px] bg-brand-red/30 text-rose-900 font-extrabold px-1.5 py-0.2 rounded shrink-0">
                        Sin Stock
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-brand-brown/80 line-clamp-2 mt-0.5 leading-relaxed">
                    {p.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-extrabold text-brand-brown">
                      {formatCurrency(p.price)}
                    </span>
                    {isOutOfStock ? (
                      <span className="py-1 px-2.5 rounded-lg bg-brand-secondary/50 text-brand-brown/70 text-[11px] font-bold">
                        Sin stock
                      </span>
                    ) : (
                      <button className="py-1 px-2.5 rounded-lg bg-brand-brown text-brand-card text-[11px] font-bold hover:bg-brand-dark transition-colors flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Agregar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
                    <label className="block font-bold text-brand-dark mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-brand-dark mb-1">Teléfono</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                    />
                  </div>

                  {orderType === 'delivery' && (
                    <>
                      <div>
                        <label className="block font-bold text-brand-dark mb-1">Dirección de entrega</label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-brand-dark mb-1">Referencia</label>
                        <input
                          type="text"
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
                      className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                    >
                      <option value="efectivo">Efectivo en entrega</option>
                      <option value="transferencia">Transferencia bancaria</option>
                      <option value="tarjeta">Tarjeta de débito/crédito</option>
                    </select>
                  </div>
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

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors shadow-soft"
                >
                  Confirmar pedido • {formatCurrency(total)}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {orderSuccessCode && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 max-w-sm w-full text-center space-y-4 shadow-soft-lg">
            <CheckCircle2 className="w-12 h-12 text-emerald-800 mx-auto" />
            <h3 className="text-lg font-extrabold text-brand-dark">¡Pedido Recibido!</h3>
            <p className="text-xs text-brand-brown/90">
              Tu pedido ha sido enviado a la cocina de Hilos de Amor.
            </p>
            <div className="p-3 bg-brand-cream rounded-xl border border-brand-secondary font-mono font-extrabold text-sm text-brand-brown">
              Código: #{orderSuccessCode}
            </div>
            <button
              onClick={() => setOrderSuccessCode(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
