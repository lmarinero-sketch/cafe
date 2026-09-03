import React, { useState } from 'react';
import {
  Gift,
  Plus,
  Search,
  Share2,
  Copy,
  Printer,
  Calendar,
  DollarSign,
  Sparkles,
  CheckCircle2,
  X,
  CreditCard,
  History,
  AlertCircle,
  Clock,
  ArrowDownRight,
  TrendingUp,
  User,
  Phone,
  Mail,
  QrCode,
  Tag,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/currency';
import { GiftCard, GiftCardTheme, GiftCardStatus } from '../../types';

export const GiftCardsManager: React.FC = () => {
  const { giftCards, createGiftCard, redeemGiftCard } = useApp();
  const { showToast } = useToast();

  // Selected card for preview / inspection
  const [selectedCardId, setSelectedCardId] = useState<string>(giftCards[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activa' | 'canjeada_parcial' | 'agotada'>('todos');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // New Gift Card Form State
  const [newCardForm, setNewCardForm] = useState<{
    initialAmount: number;
    purchaserName: string;
    purchaserPhone: string;
    purchaserEmail: string;
    recipientName: string;
    recipientPhone: string;
    recipientEmail: string;
    message: string;
    theme: GiftCardTheme;
    validityMonths: number;
  }>({
    initialAmount: 15000,
    purchaserName: '',
    purchaserPhone: '',
    purchaserEmail: '',
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    message: '¡Que disfrutes una experiencia deliciosa en Café Magnolia!',
    theme: 'cumpleanos',
    validityMonths: 12,
  });

  // Manual Redeem Form State
  const [redeemForm, setRedeemForm] = useState<{
    code: string;
    amountToUse: number;
    location: string;
    notes: string;
  }>({
    code: '',
    amountToUse: 5000,
    location: 'Salón Principal / Mostrador',
    notes: 'Canje manual de saldo en caja',
  });

  // Selected Card Resolution
  const activeCard = giftCards.find((c) => c.id === selectedCardId) || giftCards[0];

  // Filtering
  const filteredCards = giftCards.filter((card) => {
    const matchesSearch =
      card.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.purchaserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (card.recipientPhone && card.recipientPhone.includes(searchQuery));

    if (!matchesSearch) return false;
    if (statusFilter === 'todos') return true;
    return card.status === statusFilter;
  });

  // Metrics
  const totalIssuedAmount = giftCards.reduce((sum, c) => sum + c.initialAmount, 0);
  const totalAvailableBalance = giftCards.reduce((sum, c) => sum + c.currentBalance, 0);
  const totalRedeemedAmount = totalIssuedAmount - totalAvailableBalance;
  const activeCardsCount = giftCards.filter((c) => c.status === 'activa' || c.status === 'canjeada_parcial').length;

  // Preset Amounts
  const PRESET_AMOUNTS = [5000, 10000, 15000, 20000, 30000, 50000];

  // Card Theme Designs
  const getThemeStyles = (theme: GiftCardTheme) => {
    switch (theme) {
      case 'dorada':
        return {
          cardBg: 'bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-950 text-amber-50 shadow-amber-900/30',
          accent: 'text-amber-200',
          badge: 'bg-amber-400 text-amber-950 border-amber-300',
          border: 'border-amber-400/40',
        };
      case 'cumpleanos':
        return {
          cardBg: 'bg-gradient-to-br from-rose-900 via-purple-900 to-indigo-950 text-rose-50 shadow-purple-900/30',
          accent: 'text-rose-300',
          badge: 'bg-rose-400 text-rose-950 border-rose-300',
          border: 'border-rose-400/40',
        };
      case 'especial':
        return {
          cardBg: 'bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-950 text-emerald-50 shadow-teal-900/30',
          accent: 'text-emerald-300',
          badge: 'bg-emerald-400 text-emerald-950 border-emerald-300',
          border: 'border-emerald-400/40',
        };
      case 'clasica':
      default:
        return {
          cardBg: 'bg-gradient-to-br from-[#2b1810] via-[#3d2317] to-[#1a0f0a] text-white shadow-brand-dark/40',
          accent: 'text-brand-yellow',
          badge: 'bg-brand-yellow text-brand-dark border-amber-300',
          border: 'border-amber-400/30',
        };
    }
  };

  const getStatusBadge = (status: GiftCardStatus) => {
    switch (status) {
      case 'activa':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
            ● Activa (100% Saldo)
          </span>
        );
      case 'canjeada_parcial':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
            ◐ Saldo Parcial
          </span>
        );
      case 'agotada':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-300">
            ○ Agotada ($0)
          </span>
        );
      case 'vencida':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300">
            ✕ Expirada
          </span>
        );
      case 'cancelada':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-gray-100 text-gray-500 border border-gray-300">
            Cancelada
          </span>
        );
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast('Código copiado', `El código ${code} fue copiado al portapapeles.`, 'info');
  };

  const handleShareWhatsApp = (card: GiftCard) => {
    const text = `🎁 *¡Tenés una Tarjeta de Regalo Virtual de Café Magnolia!* ☕✨\n\nHola *${card.recipientName}*, recibiste una Gift Card con saldo de *${formatCurrency(card.currentBalance)}*.\n\n🔑 *Código de Canje:* \`${card.code}\`\n💬 *Mensaje:* "${card.message || 'Que disfrutes una experiencia deliciosa'}"\n\nPodés presentar este código o canjearlo directo desde la mesa o takeaway.\n¡Te esperamos!`;
    const cleanPhone = (card.recipientPhone || '').replace(/\D/g, '');
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardForm.recipientName.trim()) {
      showToast('Error', 'Ingresá el nombre de la persona agasajada.', 'error');
      return;
    }
    if (newCardForm.initialAmount < 1000) {
      showToast('Error', 'El monto mínimo para una Gift Card es de $1.000.', 'error');
      return;
    }

    const expiresAt = new Date(Date.now() + newCardForm.validityMonths * 30 * 86400000).toISOString();

    const created = createGiftCard({
      initialAmount: newCardForm.initialAmount,
      purchaserName: newCardForm.purchaserName.trim() || 'Atención en Local / Club',
      purchaserPhone: newCardForm.purchaserPhone.trim(),
      purchaserEmail: newCardForm.purchaserEmail.trim(),
      recipientName: newCardForm.recipientName.trim(),
      recipientPhone: newCardForm.recipientPhone.trim(),
      recipientEmail: newCardForm.recipientEmail.trim(),
      message: newCardForm.message.trim(),
      theme: newCardForm.theme,
      expiresAt,
    });

    setSelectedCardId(created.id);
    setIsCreateModalOpen(false);

    // Reset form
    setNewCardForm({
      initialAmount: 15000,
      purchaserName: '',
      purchaserPhone: '',
      purchaserEmail: '',
      recipientName: '',
      recipientPhone: '',
      recipientEmail: '',
      message: '¡Que disfrutes una experiencia deliciosa en Café Magnolia!',
      theme: 'cumpleanos',
      validityMonths: 12,
    });
  };

  const handleRedeemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemForm.code.trim()) {
      showToast('Error', 'Ingresá el código de la Gift Card.', 'error');
      return;
    }
    if (redeemForm.amountToUse <= 0) {
      showToast('Error', 'Ingresá un monto válido a descontar.', 'error');
      return;
    }

    const result = redeemGiftCard(
      redeemForm.code,
      redeemForm.amountToUse,
      undefined,
      'Canje Directo en Caja',
      redeemForm.location,
      redeemForm.notes
    );

    if (result.success) {
      setIsRedeemModalOpen(false);
      setRedeemForm({
        code: '',
        amountToUse: 5000,
        location: 'Salón Principal / Mostrador',
        notes: 'Canje manual de saldo en caja',
      });
    } else {
      showToast('No se pudo canjear', result.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-card p-5 rounded-2xl border border-brand-secondary shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-brand-brown uppercase tracking-wider">Total Emitido</p>
            <h4 className="text-xl font-extrabold text-brand-dark mt-0.5">{formatCurrency(totalIssuedAmount)}</h4>
            <span className="text-[10px] text-brand-brown/80">{giftCards.length} tarjetas generadas</span>
          </div>
        </div>

        <div className="bg-brand-card p-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-brand-card shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-300">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Saldo en Circulación</p>
            <h4 className="text-xl font-extrabold text-emerald-950 mt-0.5">{formatCurrency(totalAvailableBalance)}</h4>
            <span className="text-[10px] font-bold text-emerald-700">{activeCardsCount} tarjetas con saldo</span>
          </div>
        </div>

        <div className="bg-brand-card p-5 rounded-2xl border border-brand-secondary shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 border border-purple-300">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-brand-brown uppercase tracking-wider">Dinero Canjeado</p>
            <h4 className="text-xl font-extrabold text-purple-950 mt-0.5">{formatCurrency(totalRedeemedAmount)}</h4>
            <span className="text-[10px] text-brand-brown/80">
              {totalIssuedAmount > 0 ? Math.round((totalRedeemedAmount / totalIssuedAmount) * 100) : 0}% tasa de consumo
            </span>
          </div>
        </div>

        <div className="bg-brand-card p-5 rounded-2xl border border-brand-secondary shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 border border-blue-300">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-brand-brown uppercase tracking-wider">Ticket Promedio</p>
            <h4 className="text-xl font-extrabold text-brand-dark mt-0.5">
              {giftCards.length > 0 ? formatCurrency(Math.round(totalIssuedAmount / giftCards.length)) : '$0'}
            </h4>
            <span className="text-[10px] text-brand-brown/80">Valor de regalo habitual</span>
          </div>
        </div>
      </div>

      {/* ── ACTION BAR & BUTTONS ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-brown/60" />
            <input
              type="text"
              placeholder="Buscar por código, agasajado o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 bg-brand-cream border border-brand-secondary rounded-xl text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-brown/30 font-medium"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-brand-cream border border-brand-secondary rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
          >
            <option value="todos">Todos los Estados</option>
            <option value="activa">Activas (100% Saldo)</option>
            <option value="canjeada_parcial">Saldo Parcial</option>
            <option value="agotada">Agotadas ($0)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activeCard) {
                setRedeemForm((prev) => ({ ...prev, code: activeCard.code }));
              }
              setIsRedeemModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl border border-brand-brown text-brand-brown hover:bg-brand-secondary/40 font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
          >
            <DollarSign className="w-4 h-4 text-emerald-700" />
            Canjear en Caja
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-extrabold text-xs shadow-soft flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4 text-brand-yellow" />
            Emitir Nueva Gift Card
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID: PREVIEW (LEFT) + LIST (RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: INTERACTIVE VIRTUAL CARD PREVIEW */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-brand-dark uppercase tracking-wider flex items-center gap-2 font-serif">
              <Sparkles className="w-4 h-4 text-amber-700" />
              Previsualización de Tarjeta Virtual
            </h3>
            {activeCard && getStatusBadge(activeCard.status)}
          </div>

          {activeCard ? (
            (() => {
              const themeStyles = getThemeStyles(activeCard.theme);
              const percentRemaining =
                activeCard.initialAmount > 0 ? Math.round((activeCard.currentBalance / activeCard.initialAmount) * 100) : 0;

              return (
                <div className="space-y-4">
                  {/* Virtual Card Canvas */}
                  <div
                    className={`${themeStyles.cardBg} rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-soft-lg border-2 ${themeStyles.border} transition-all duration-300 transform hover:scale-[1.01]`}
                  >
                    {/* Background Texture & Watermark */}
                    <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/5 blur-xl pointer-events-none" />
                    <div className="absolute top-4 right-4 opacity-15">
                      <Gift className="w-28 h-28" />
                    </div>

                    {/* Card Top Header */}
                    <div className="flex items-start justify-between relative z-10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${themeStyles.accent}`}>
                            CAFÉ MAGNOLIA
                          </span>
                          <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                            GIFT CARD VIRTUAL
                          </span>
                        </div>
                        <p className="text-xs text-white/80 font-medium mt-0.5">Tarjeta de Dinero a Gastar</p>
                      </div>

                      {/* EMV Chip & Contactless */}
                      <div className="w-11 h-8 rounded-md bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300 border border-amber-100/50 shadow-inner flex items-center justify-center">
                        <div className="w-7 h-5 border border-amber-900/30 rounded-xs grid grid-cols-2 gap-0.5 opacity-60">
                          <div className="border-r border-amber-900/30" />
                          <div />
                        </div>
                      </div>
                    </div>

                    {/* Recipient & Balance Display */}
                    <div className="my-6 relative z-10 space-y-1">
                      <span className="text-[11px] text-white/80 font-medium block">Para:</span>
                      <h3 className="text-2xl font-black font-serif tracking-wide text-white drop-shadow-xs">
                        {activeCard.recipientName}
                      </h3>
                      {activeCard.message && (
                        <p className="text-xs text-white/90 italic bg-black/20 p-2.5 rounded-xl border border-white/10 mt-2 leading-relaxed">
                          "{activeCard.message}"
                        </p>
                      )}
                    </div>

                    {/* Balance & QR Code */}
                    <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center justify-between relative z-10">
                      <div>
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider ${themeStyles.accent}`}>
                          Saldo Disponible
                        </span>
                        <div className="text-3xl font-black font-serif text-white mt-0.5">
                          {formatCurrency(activeCard.currentBalance)}
                        </div>
                        <span className="text-[10px] text-white/70 block mt-0.5">
                          Monto inicial: {formatCurrency(activeCard.initialAmount)}
                        </span>
                      </div>

                      {/* QR for fast table checkout */}
                      <div className="w-16 h-16 bg-white p-1 rounded-xl shadow-md shrink-0 flex items-center justify-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                            `MAGNOLIA-GIFT:${activeCard.code}:${activeCard.currentBalance}`
                          )}`}
                          alt="QR Canje"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Progress Bar for consumed balance */}
                    <div className="mt-4 space-y-1 relative z-10">
                      <div className="flex justify-between text-[10px] font-bold text-white/80">
                        <span>Saldo disponible restante</span>
                        <span className={themeStyles.accent}>{percentRemaining}%</span>
                      </div>
                      <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-400 to-amber-300 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentRemaining}%` }}
                        />
                      </div>
                    </div>

                    {/* Card Footer: Code & Expiry */}
                    <div className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] relative z-10">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-white/70 block">Código Único</span>
                        <span className="font-mono font-extrabold tracking-wider text-white bg-black/30 px-2 py-0.5 rounded-md border border-white/20">
                          {activeCard.code}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-wider text-white/70 block">Válida Hasta</span>
                        <span className="font-bold text-white/90">
                          {activeCard.expiresAt
                            ? new Date(activeCard.expiresAt).toLocaleDateString('es-AR')
                            : 'Sin Vencimiento'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(activeCard.code)}
                      className="py-2.5 px-3 rounded-xl bg-brand-card border border-brand-secondary hover:bg-brand-secondary/40 text-brand-dark font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                      title="Copiar código de voucher"
                    >
                      <Copy className="w-3.5 h-3.5 text-brand-brown" />
                      Copiar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp(activeCard)}
                      className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                      title="Enviar tarjeta por WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5 text-brand-yellow" />
                      WhatsApp
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsHistoryModalOpen(true)}
                      className="py-2.5 px-3 rounded-xl bg-brand-card border border-brand-secondary hover:bg-brand-secondary/40 text-brand-dark font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                      title="Ver historial de consumos de la tarjeta"
                    >
                      <History className="w-3.5 h-3.5 text-purple-700" />
                      Historial
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPrintModalOpen(true)}
                      className="py-2.5 px-3 rounded-xl bg-brand-card border border-brand-secondary hover:bg-brand-secondary/40 text-brand-dark font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                      title="Imprimir comprobante o voucher físico"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-700" />
                      Imprimir
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="bg-brand-card p-8 rounded-3xl border border-dashed border-brand-secondary text-center space-y-3">
              <Gift className="w-12 h-12 text-brand-brown/40 mx-auto" />
              <p className="text-sm font-bold text-brand-dark">No hay ninguna Gift Card seleccionada</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-emerald-700 text-white font-extrabold text-xs rounded-xl"
              >
                Emitir la primera Gift Card
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: GIFT CARDS DIRECTORY TABLE / LIST */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-brand-dark uppercase tracking-wider flex items-center gap-2 font-serif">
              <CreditCard className="w-4 h-4 text-brand-brown" />
              Directorio de Gift Cards ({filteredCards.length})
            </h3>
            <span className="text-xs text-brand-brown/80 font-medium">Haz clic para previsualizar</span>
          </div>

          <div className="bg-brand-card rounded-2xl border border-brand-secondary shadow-soft overflow-hidden">
            {filteredCards.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-brand-brown/40 mx-auto" />
                <p className="text-sm font-bold text-brand-dark">No se encontraron Gift Cards con ese criterio</p>
                <p className="text-xs text-brand-brown/80">Probá modificando la búsqueda o el filtro de estado.</p>
              </div>
            ) : (
              <div className="divide-y divide-brand-secondary/60 max-h-[620px] overflow-y-auto">
                {filteredCards.map((card) => {
                  const isSelected = card.id === selectedCardId;
                  const percent =
                    card.initialAmount > 0 ? Math.round((card.currentBalance / card.initialAmount) * 100) : 0;

                  return (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-brand-cream/80 border-l-4 border-l-amber-600 shadow-xs'
                          : 'hover:bg-brand-secondary/20'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-xs bg-brand-secondary/60 text-brand-dark px-2 py-0.5 rounded-md border border-brand-secondary">
                            {card.code}
                          </span>
                          {getStatusBadge(card.status)}
                        </div>
                        <h4 className="text-sm font-extrabold text-brand-dark font-serif">{card.recipientName}</h4>
                        <div className="flex items-center gap-3 text-[11px] text-brand-brown/80">
                          <span>Comprador: <strong>{card.purchaserName || 'Anónimo'}</strong></span>
                          {card.recipientPhone && <span>📱 {card.recipientPhone}</span>}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-brand-secondary/40">
                        <div className="text-right">
                          <span className="text-[10px] text-brand-brown font-bold uppercase tracking-wider block">
                            Saldo Disponible
                          </span>
                          <span className="text-base font-black text-brand-dark font-serif">
                            {formatCurrency(card.currentBalance)}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-brand-brown/70 mt-0.5">
                          De {formatCurrency(card.initialAmount)} ({percent}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL 1: EMITIR NUEVA GIFT CARD ── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-3xl border border-brand-secondary w-full max-w-xl shadow-soft-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-brand-secondary flex items-center justify-between bg-gradient-to-r from-brand-card to-brand-cream shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-dark font-serif">Emitir Nueva Gift Card</h3>
                  <p className="text-xs text-brand-brown/80">Genera una tarjeta virtual equivalente a dinero para regalar</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-brand-secondary text-brand-brown transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {/* Monto de la Gift Card */}
              <div className="space-y-2">
                <label className="block font-extrabold text-brand-dark uppercase tracking-wider text-[11px]">
                  1. Monto en Dinero a Regalar ($ ARS) *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setNewCardForm({ ...newCardForm, initialAmount: amt })}
                      className={`py-2 px-1 rounded-xl font-extrabold text-xs transition border ${
                        newCardForm.initialAmount === amt
                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                          : 'bg-brand-cream text-brand-dark border-brand-secondary hover:bg-brand-secondary/40'
                      }`}
                    >
                      ${(amt / 1000).toLocaleString('es-AR')}k
                    </button>
                  ))}
                </div>
                <div className="relative mt-2">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-brown">$</span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={newCardForm.initialAmount}
                    onChange={(e) => setNewCardForm({ ...newCardForm, initialAmount: Number(e.target.value) })}
                    placeholder="O ingresá otro monto..."
                    className="w-full pl-8 pr-4 py-2.5 bg-brand-cream border border-brand-secondary rounded-xl text-sm font-extrabold text-brand-dark focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>
              </div>

              {/* Tema visual de la tarjeta */}
              <div className="space-y-2">
                <label className="block font-extrabold text-brand-dark uppercase tracking-wider text-[11px]">
                  2. Diseño de la Tarjeta Virtual
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'cumpleanos', label: '🎂 Cumpleaños', desc: 'Celebración' },
                    { id: 'dorada', label: '👑 Golden VIP', desc: 'Luxury Oro' },
                    { id: 'especial', label: '✨ Especial', desc: 'Esmeralda' },
                    { id: 'clasica', label: '☕ Clásica', desc: 'Café & Tostado' },
                  ].map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setNewCardForm({ ...newCardForm, theme: th.id as any })}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        newCardForm.theme === th.id
                          ? 'bg-brand-brown text-white border-brand-dark shadow-xs'
                          : 'bg-brand-cream text-brand-dark border-brand-secondary hover:bg-brand-secondary/40'
                      }`}
                    >
                      <span className="font-extrabold block">{th.label}</span>
                      <span className="text-[10px] opacity-80">{th.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Datos del Beneficiario */}
              <div className="space-y-3 bg-brand-cream p-4 rounded-2xl border border-brand-secondary">
                <span className="font-extrabold text-brand-dark uppercase tracking-wider text-[11px] block">
                  3. Datos de la Persona Agasajada (Destinatario)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-brand-dark mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Sofía Valenzuela"
                      value={newCardForm.recipientName}
                      onChange={(e) => setNewCardForm({ ...newCardForm, recipientName: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-card border border-brand-secondary rounded-xl text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-dark mb-1">WhatsApp / Teléfono (opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej: 11 5432-1980"
                      value={newCardForm.recipientPhone}
                      onChange={(e) => setNewCardForm({ ...newCardForm, recipientPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-card border border-brand-secondary rounded-xl text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-brand-dark mb-1">Mensaje de Dedicatoria</label>
                  <textarea
                    rows={2}
                    placeholder="Escribí unas palabras lindas para el agasajado..."
                    value={newCardForm.message}
                    onChange={(e) => setNewCardForm({ ...newCardForm, message: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-card border border-brand-secondary rounded-xl text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-brown/30 resize-none"
                  />
                </div>
              </div>

              {/* Datos del Comprador (Opcional) */}
              <div className="space-y-3 bg-brand-cream p-4 rounded-2xl border border-brand-secondary">
                <span className="font-extrabold text-brand-dark uppercase tracking-wider text-[11px] block">
                  4. Datos del Comprador / Emisor (opcional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-brand-dark mb-1">Comprador / Empresa</label>
                    <input
                      type="text"
                      placeholder="Ej: Lucas Marinero"
                      value={newCardForm.purchaserName}
                      onChange={(e) => setNewCardForm({ ...newCardForm, purchaserName: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-card border border-brand-secondary rounded-xl text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-dark mb-1">Teléfono Comprador</label>
                    <input
                      type="text"
                      placeholder="Ej: 11 9876-5432"
                      value={newCardForm.purchaserPhone}
                      onChange={(e) => setNewCardForm({ ...newCardForm, purchaserPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-card border border-brand-secondary rounded-xl text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark hover:bg-brand-secondary/30 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-soft transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-brand-yellow" />
                  Emitir Gift Card ({formatCurrency(newCardForm.initialAmount)})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: CANJEAR SALDO EN MOSTRADOR / CAJA ── */}
      {isRedeemModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-3xl border border-brand-secondary w-full max-w-md shadow-soft-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center border border-purple-300">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-dark font-serif">Canjear Saldo de Gift Card</h3>
                  <p className="text-xs text-brand-brown/80">Descuenta dinero del saldo virtual de la tarjeta</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRedeemModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-brand-secondary text-brand-brown transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRedeemSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-brand-dark mb-1">Código de la Gift Card *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: GIFT-8921-CAF"
                  value={redeemForm.code}
                  onChange={(e) => setRedeemForm({ ...redeemForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2.5 bg-brand-cream border border-brand-secondary rounded-xl text-xs font-mono font-extrabold text-brand-dark uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Monto a Descontar ($ ARS) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={redeemForm.amountToUse}
                  onChange={(e) => setRedeemForm({ ...redeemForm, amountToUse: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-brand-cream border border-brand-secondary rounded-xl text-sm font-extrabold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Ubicación / Punto de Canje</label>
                <input
                  type="text"
                  value={redeemForm.location}
                  onChange={(e) => setRedeemForm({ ...redeemForm, location: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-cream border border-brand-secondary rounded-xl text-xs text-brand-dark"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Notas / Motivo (opcional)</label>
                <input
                  type="text"
                  value={redeemForm.notes}
                  onChange={(e) => setRedeemForm({ ...redeemForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-cream border border-brand-secondary rounded-xl text-xs text-brand-dark"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRedeemModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark hover:bg-brand-secondary/30 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs shadow-soft transition"
                >
                  Confirmar Débito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: HISTORIAL DE CONSUMOS / USOS DE LA TARJETA ── */}
      {isHistoryModalOpen && activeCard && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-3xl border border-brand-secondary w-full max-w-lg shadow-soft-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-dark font-serif">
                    Historial de Canjes: {activeCard.code}
                  </h3>
                  <p className="text-xs text-brand-brown/80">Titular: {activeCard.recipientName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-brand-secondary text-brand-brown transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between bg-brand-cream p-3 rounded-xl border border-brand-secondary text-xs">
                <div>
                  <span className="text-brand-brown font-bold block text-[10px] uppercase">Monto Inicial</span>
                  <span className="font-extrabold text-brand-dark">{formatCurrency(activeCard.initialAmount)}</span>
                </div>
                <div>
                  <span className="text-brand-brown font-bold block text-[10px] uppercase">Saldo Actual</span>
                  <span className="font-extrabold text-emerald-800">{formatCurrency(activeCard.currentBalance)}</span>
                </div>
                <div>
                  <span className="text-brand-brown font-bold block text-[10px] uppercase">Consumido</span>
                  <span className="font-extrabold text-purple-900">
                    {formatCurrency(activeCard.initialAmount - activeCard.currentBalance)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(!activeCard.usageHistory || activeCard.usageHistory.length === 0) ? (
                  <p className="text-center text-xs text-brand-brown/80 py-6">
                    Esta tarjeta todavía no tiene consumos registrados. (100% de saldo intacto)
                  </p>
                ) : (
                  activeCard.usageHistory.map((usage) => (
                    <div
                      key={usage.id}
                      className="p-3 bg-brand-cream/60 rounded-xl border border-brand-secondary/60 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <ArrowDownRight className="w-3.5 h-3.5 text-rose-700" />
                          <span className="font-extrabold text-brand-dark">-{formatCurrency(usage.amountUsed)}</span>
                          <span className="text-[10px] text-brand-brown/80">({usage.location || 'Salón'})</span>
                        </div>
                        <p className="text-[11px] text-brand-brown/80">{usage.notes || usage.orderCode}</p>
                      </div>
                      <div className="text-right text-[10px] text-brand-brown font-medium">
                        <span>{new Date(usage.date).toLocaleString('es-AR')}</span>
                        <span className="block font-bold text-brand-dark">
                          Saldo remanente: {formatCurrency(usage.remainingBalance)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-brand-secondary/60 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-brand-brown text-white font-bold text-xs hover:bg-brand-dark transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: VOUCHER IMPRIMIBLE / TICKET ── */}
      {isPrintModalOpen && activeCard && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-brand-dark border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2">
                <Gift className="w-6 h-6 text-amber-600" />
                <div>
                  <h3 className="text-lg font-black font-serif tracking-wide text-gray-900">Café Magnolia</h3>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700">
                    VOUCHER DE REGALO OFICIAL
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200 text-center space-y-3">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-widest block">
                Tarjeta de Regalo para
              </span>
              <h2 className="text-2xl font-black font-serif text-gray-900">{activeCard.recipientName}</h2>
              <div className="text-4xl font-black font-serif text-amber-700 py-1">
                {formatCurrency(activeCard.currentBalance)}
              </div>
              {activeCard.message && (
                <p className="text-xs text-gray-700 italic border-t border-amber-200/80 pt-2">
                  "{activeCard.message}"
                </p>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Código de Canje</span>
                <span className="font-mono font-black text-sm text-gray-900 bg-white px-2.5 py-1 rounded-md border border-gray-300">
                  {activeCard.code}
                </span>
                <span className="text-[10px] text-gray-500 block">
                  Vence: {activeCard.expiresAt ? new Date(activeCard.expiresAt).toLocaleDateString('es-AR') : 'Sin Vto.'}
                </span>
              </div>

              <div className="w-16 h-16 bg-white p-1 rounded-lg border border-gray-200 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    `MAGNOLIA-GIFT:${activeCard.code}`
                  )}`}
                  alt="QR"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <p className="text-[10px] text-gray-500 text-center leading-relaxed">
              Voucher canjeable en salón, take away o carta digital. No reembolsable en efectivo.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-extrabold text-xs hover:bg-black transition flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                Imprimir Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
