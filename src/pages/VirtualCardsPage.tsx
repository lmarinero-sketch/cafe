import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Share2,
  Wallet,
  Gift,
  Award,
  Sparkles,
  Send,
  X,
  Plus,
  TrendingUp,
  History,
  CheckCircle2,
  User,
  Phone,
  Mail,
  Calendar,
  Percent,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/currency';
import { Customer, Reward } from '../types';

export const VirtualCardsPage: React.FC = () => {
  const { customers, rewards, addCustomerPoints, redeemReward, addCustomer } = useApp();
  const { showToast } = useToast();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [isGiftcardModalOpen, setIsGiftcardModalOpen] = useState(false);
  const [isAddPointsModalOpen, setIsAddPointsModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(false);

  // Form states
  const [consumptionAmount, setConsumptionAmount] = useState<number>(10000);
  const [consumptionReason, setConsumptionReason] = useState<string>('Consumo en Salón');
  const [giftcardData, setGiftcardData] = useState({ amount: 5000, recipientEmail: '', message: '' });
  
  const [newMemberForm, setNewMemberForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    birthDate: '',
  });

  const customer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Parity rule: 100 points = $1,000 spent ($10 = 1 point)
  const POINTS_PARITY_RATIO = 10; // $10 spent = 1 point
  const pointsToCashEquivalent = (pts: number) => pts * POINTS_PARITY_RATIO;
  const cashToPointsEquivalent = (amount: number) => Math.floor(amount / POINTS_PARITY_RATIO);

  // Level Progression Logic
  const getNextLevelInfo = (currentPoints: number, currentLevel: string) => {
    if (currentPoints >= 3000 || currentLevel === 'VIP') {
      return { nextLevel: 'Máximo Nivel (VIP Diamond)', target: 3000, remaining: 0, progress: 100 };
    }
    if (currentPoints >= 1500) {
      const remaining = 3000 - currentPoints;
      const progress = Math.min(100, Math.round(((currentPoints - 1500) / 1500) * 100));
      return { nextLevel: 'VIP', target: 3000, remaining, progress };
    }
    if (currentPoints >= 500) {
      const remaining = 1500 - currentPoints;
      const progress = Math.min(100, Math.round(((currentPoints - 500) / 1000) * 100));
      return { nextLevel: 'Preferencial', target: 1500, remaining, progress };
    }
    const remaining = 500 - currentPoints;
    const progress = Math.min(100, Math.round((currentPoints / 500) * 100));
    return { nextLevel: 'Frecuente', target: 500, remaining, progress };
  };

  const nextLevelInfo = customer ? getNextLevelInfo(customer.points, customer.level) : null;

  // Level badge styling
  const getLevelBadgeStyles = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'vip':
        return 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-amber-950 border-amber-200 shadow-md';
      case 'preferencial':
        return 'bg-gradient-to-r from-slate-200 via-gray-300 to-slate-400 text-slate-900 border-slate-300';
      case 'frecuente':
        return 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-amber-50 border-amber-600';
      default:
        return 'bg-brand-cream text-brand-dark border-brand-secondary';
    }
  };

  // Simulated Points History
  const getSimulatedHistory = (c: Customer) => {
    return [
      {
        id: 'tx-1',
        type: 'earn',
        title: 'Consumo en Salón (Mesa)',
        date: 'Ayer, 17:45 hs',
        points: `+${Math.floor(c.averageTicket ? c.averageTicket / 10 : 250)}`,
        detail: `Ticket por ${formatCurrency(c.averageTicket || 2500)}`,
      },
      {
        id: 'tx-2',
        type: 'earn',
        title: 'Bono Especial Fidelización',
        date: '15 Ago 2026',
        points: '+200',
        detail: 'Beneficio exclusivo por nivel ' + c.level,
      },
      {
        id: 'tx-3',
        type: 'spend',
        title: 'Canje de Recompensa en Caja',
        date: '02 Ago 2026',
        points: '-350',
        detail: 'Capuchino Especial con Arte Latte',
      },
      {
        id: 'tx-4',
        type: 'earn',
        title: 'Bono de Bienvenida al Club',
        date: new Date(c.registrationDate).toLocaleDateString('es-AR'),
        points: '+100',
        detail: 'Acreditación inicial ($1.000 consumidos equiv)',
      },
    ];
  };

  const handleManualAddPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    if (consumptionAmount <= 0) {
      showToast('Monto inválido', 'Ingresa un monto mayor a $0.', 'warning');
      return;
    }

    const pointsToAdd = cashToPointsEquivalent(consumptionAmount);
    addCustomerPoints(customer.id, pointsToAdd);

    showToast(
      '¡Puntos Acreditados!',
      `Se sumaron +${pointsToAdd} puntos a ${customer.firstName} por su consumo de ${formatCurrency(consumptionAmount)}.`,
      'success'
    );
    setIsAddPointsModalOpen(false);
    setConsumptionAmount(10000);
  };

  const handleRedeemRewardAction = async (reward: Reward) => {
    if (!customer) return;
    if (customer.points < reward.pointsCost) {
      showToast(
        'Puntos insuficientes',
        `El socio cuenta con ${customer.points} pts y requiere ${reward.pointsCost} pts para este premio.`,
        'warning'
      );
      return;
    }

    const success = await redeemReward(customer.id, reward.id);
    if (success) {
      showToast(
        '¡Canje Exitoso!',
        `Se canjeó "${reward.name}" por ${reward.pointsCost} puntos para ${customer.firstName}.`,
        'success'
      );
      setIsRedeemModalOpen(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.firstName.trim() || !newMemberForm.phone.trim()) {
      showToast('Campos requeridos', 'Ingresa al menos Nombre y Teléfono.', 'warning');
      return;
    }

    const created = await addCustomer({
      firstName: newMemberForm.firstName.trim(),
      lastName: newMemberForm.lastName.trim(),
      phone: newMemberForm.phone.trim(),
      email: newMemberForm.email.trim(),
      birthDate: newMemberForm.birthDate || '',
      marketingConsent: true,
      favoriteProduct: 'Café de Especialidad',
    });

    if (created) {
      setSelectedCustomerId(created.id);
      setIsNewMemberModalOpen(false);
      setNewMemberForm({ firstName: '', lastName: '', phone: '', email: '', birthDate: '' });
    }
  };

  const handleShareWhatsApp = () => {
    if (!customer) return;
    const msg = `¡Hola ${customer.firstName}! ✨ Tu Tarjeta Digital de Socio en Hilos de Amor está activa.\n⭐ Saldo actual: ${customer.points} Puntos (Equivalente a ${formatCurrency(pointsToCashEquivalent(customer.points))} en beneficios).\nNivel: ${customer.level}.\n¡Te esperamos en nuestra cafetería! ☕🍰`;
    const url = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const totalClubPoints = customers.reduce((sum, c) => sum + (c.points || 0), 0);
  const totalValueInPesos = pointsToCashEquivalent(totalClubPoints);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner & Club Parity Rule */}
      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-700" /> Plan Fidelización
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 flex items-center gap-1 shadow-xs">
              <Coins className="w-3 h-3 text-amber-700" /> Paridad: 100 Pts = $1.000 Consumidos
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark font-serif">
            Club de Puntos & Tarjeta Digital de Socio
          </h2>
          <p className="text-xs text-brand-brown/90 max-w-2xl leading-relaxed">
            Programa oficial de lealtad gastronómica. Por cada <strong>$10 de consumo acumulás 1 punto</strong> (100 puntos por cada $1.000). Visualizá credenciales en vivo para Apple Wallet y Google Wallet.
          </p>
        </div>

        {/* Member Selector & Fast Register */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
          <div className="relative flex-1 sm:w-64">
            <select
              value={customer ? customer.id : ''}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-secondary bg-brand-bg font-extrabold text-xs text-brand-dark focus:outline-none shadow-xs"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} ({c.points} pts - Nivel {c.level})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsNewMemberModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-brand-brown hover:bg-brand-dark text-white font-extrabold text-xs transition-colors shadow-soft flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4 text-brand-yellow" />
            <span>Nuevo Socio (+100 pts)</span>
          </button>
        </div>
      </div>

      {/* Quick Club Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-brand-brown uppercase tracking-wider">Socios Activos</p>
            <h3 className="text-xl font-extrabold text-brand-dark mt-0.5">{customers.length} Clientes</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-cream border border-brand-secondary/60 flex items-center justify-center text-brand-brown">
            <User className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-brand-brown uppercase tracking-wider">Puntos en Circulación</p>
            <h3 className="text-xl font-extrabold text-brand-dark mt-0.5">⭐ {totalClubPoints.toLocaleString()} pts</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-brand-brown uppercase tracking-wider">Equivalencia en Consumos</p>
            <h3 className="text-xl font-extrabold text-emerald-900 mt-0.5">{formatCurrency(totalValueInPesos)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Container: Left Card Visualizer + Right Operations & History */}
      {customer ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: DIGITAL CARD VISUALIZER (APPLE / GOOGLE WALLET PASS) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-xs font-bold text-brand-brown flex items-center justify-between px-1">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-brand-brown" /> Credencial Móvil del Socio
              </span>
              <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded">
                ● En Vivo
              </span>
            </div>

            {/* THE LUXURY PASS CARD */}
            <div className="bg-gradient-to-br from-[#122315] via-[#244128] to-[#122315] rounded-[28px] p-6 text-brand-card shadow-soft-lg border-2 border-brand-yellow/50 space-y-6 relative overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
              {/* Background ambient lighting */}
              <div className="absolute -top-24 -right-24 w-52 h-52 bg-brand-yellow/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Top Header */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-yellow shrink-0 bg-white shadow-xs">
                    <img src="/logo_hilos_de_amor.jpg" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold tracking-tight font-serif text-white">Hilos de Amor</h3>
                    <p className="text-[10px] text-brand-yellow font-bold uppercase tracking-wider">
                      Club Gastronómico
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border ${getLevelBadgeStyles(
                    customer.level
                  )}`}
                >
                  Nivel {customer.level}
                </span>
              </div>

              {/* Chip & NFC Simulation */}
              <div className="flex items-center justify-between pt-1 relative z-10">
                <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-400 to-amber-200 border border-amber-500/60 shadow-xs flex items-center justify-center">
                  <div className="w-8 h-5 border border-amber-700/30 rounded-xs grid grid-cols-2 gap-0.5 opacity-60" />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-brand-secondary/80">
                  PASS #{customer.id.toUpperCase()}
                </span>
              </div>

              {/* Member Name */}
              <div className="space-y-0.5 relative z-10">
                <span className="text-[9px] text-brand-secondary uppercase tracking-widest block font-bold">
                  Socio Titular
                </span>
                <h2 className="text-2xl font-extrabold tracking-wide font-serif text-white">
                  {customer.firstName} {customer.lastName}
                </h2>
                <p className="text-[11px] text-brand-secondary font-medium">
                  {customer.phone} {customer.email ? `• ${customer.email}` : ''}
                </p>
              </div>

              {/* Points Display Container */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center justify-between relative z-10">
                <div>
                  <span className="text-[10px] text-brand-yellow font-extrabold uppercase tracking-wider block">
                    Puntos Acumulados
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-3xl font-extrabold text-white font-serif">
                      ⭐ {customer.points}
                    </span>
                    <span className="text-xs font-normal text-brand-secondary">pts</span>
                  </div>
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    <span>Equivale a {formatCurrency(pointsToCashEquivalent(customer.points))}</span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="w-20 h-20 bg-white p-1.5 rounded-xl shadow-md shrink-0 flex flex-col items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      `HILOS-SOCIO:${customer.id}:${customer.phone}`
                    )}`}
                    alt="QR Socio"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Level Progress Bar */}
              {nextLevelInfo && (
                <div className="space-y-1.5 relative z-10 pt-1">
                  <div className="flex justify-between text-[11px] font-bold text-brand-secondary">
                    <span>Progreso a Nivel {nextLevelInfo.nextLevel}</span>
                    <span className="text-brand-yellow font-extrabold">{nextLevelInfo.progress}%</span>
                  </div>
                  <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-yellow to-amber-300 h-full rounded-full transition-all duration-500"
                      style={{ width: `${nextLevelInfo.progress}%` }}
                    />
                  </div>
                  {nextLevelInfo.remaining > 0 ? (
                    <p className="text-[10px] text-brand-secondary/90">
                      Faltan <strong>{nextLevelInfo.remaining} pts</strong> (consumo de{' '}
                      {formatCurrency(pointsToCashEquivalent(nextLevelInfo.remaining))}) para ascender.
                    </p>
                  ) : (
                    <p className="text-[10px] text-brand-yellow font-bold">¡Has alcanzado el estatus máximo VIP Diamond!</p>
                  )}
                </div>
              )}
            </div>

            {/* Fast Action Buttons Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsAddPointsModalOpen(true)}
                className="py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-soft flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4 text-brand-yellow" />
                Cargar Puntos ($)
              </button>

              <button
                onClick={() => setIsRedeemModalOpen(true)}
                className="py-3 px-4 rounded-2xl bg-brand-brown hover:bg-brand-dark text-brand-card font-extrabold text-xs shadow-soft flex items-center justify-center gap-2 transition-all"
              >
                <Gift className="w-4 h-4 text-brand-yellow" />
                Canjear Premio
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="py-3 px-4 rounded-2xl bg-brand-card border border-brand-secondary hover:border-brand-brown/50 text-brand-dark font-bold text-xs shadow-soft flex items-center justify-center gap-2 transition-all"
              >
                <Share2 className="w-4 h-4 text-brand-brown" />
                Enviar por WhatsApp
              </button>

              <button
                onClick={() => setIsGiftcardModalOpen(true)}
                className="py-3 px-4 rounded-2xl bg-brand-card border border-brand-secondary hover:border-brand-brown/50 text-brand-dark font-bold text-xs shadow-soft flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4 text-brand-brown" />
                Regalar Giftcard
              </button>
            </div>
          </div>

          {/* RIGHT: RULES, OPERATIONS & TRANSACTION HISTORY */}
          <div className="lg:col-span-7 space-y-6">
            {/* Parity Rules Card */}
            <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft space-y-4">
              <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
                <div className="flex items-center gap-2.5">
                  <Coins className="w-5 h-5 text-amber-700" />
                  <h3 className="text-base font-extrabold text-brand-dark font-serif">
                    Reglas del Club de Puntos
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full">
                  100 pts = $1.000
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-brand-cream p-3.5 rounded-xl border border-brand-secondary/70 space-y-1">
                  <span className="text-[10px] font-bold text-brand-brown uppercase">Acumulación</span>
                  <p className="font-extrabold text-brand-dark text-sm">$10 = 1 Punto</p>
                  <p className="text-[11px] text-brand-brown/80">
                    Suma en cada ticket de salón, retiro o delivery automáticamente.
                  </p>
                </div>

                <div className="bg-brand-cream p-3.5 rounded-xl border border-brand-secondary/70 space-y-1">
                  <span className="text-[10px] font-bold text-brand-brown uppercase">Bienvenida</span>
                  <p className="font-extrabold text-brand-dark text-sm">+100 Puntos Gratis</p>
                  <p className="text-[11px] text-brand-brown/80">
                    Equivalente a $1.000 consumidos de regalo al registrarse.
                  </p>
                </div>

                <div className="bg-brand-cream p-3.5 rounded-xl border border-brand-secondary/70 space-y-1">
                  <span className="text-[10px] font-bold text-brand-brown uppercase">Nivel VIP (3.000+ pts)</span>
                  <p className="font-extrabold text-emerald-900 text-sm">Beneficios Exclusivos</p>
                  <p className="text-[11px] text-brand-brown/80">
                    Invitaciones a catas privadas y promociones por cumpleaños.
                  </p>
                </div>
              </div>
            </div>

            {/* Member History Log */}
            <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft space-y-4">
              <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-brand-brown" />
                  <h3 className="text-base font-extrabold text-brand-dark font-serif">
                    Historial de Puntos del Socio
                  </h3>
                </div>
                <span className="text-xs font-bold text-brand-brown">
                  {customer.firstName} ({customer.points} pts disponibles)
                </span>
              </div>

              <div className="divide-y divide-brand-secondary/60 space-y-1">
                {getSimulatedHistory(customer).map((item) => (
                  <div key={item.id} className="pt-3 pb-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          item.type === 'earn'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {item.type === 'earn' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-brand-dark">{item.title}</h4>
                        <p className="text-[11px] text-brand-brown/80">
                          {item.detail} • <span className="text-brand-brown/60">{item.date}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-sm font-extrabold font-mono shrink-0 ${
                        item.type === 'earn' ? 'text-emerald-800' : 'text-amber-800'
                      }`}
                    >
                      {item.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-brand-card rounded-2xl border border-brand-secondary p-8 shadow-soft">
          <p className="text-sm font-bold text-brand-brown">Cargando socios del Club de Puntos...</p>
        </div>
      )}

      {/* MODAL 1: CARGAR PUNTOS POR CONSUMO ($) */}
      {isAddPointsModalOpen && customer && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border-2 border-emerald-600 p-6 max-w-md w-full shadow-soft-lg space-y-4">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-extrabold text-brand-dark font-serif">
                  Cargar Puntos por Consumo
                </h3>
              </div>
              <button
                onClick={() => setIsAddPointsModalOpen(false)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-brand-cream p-3.5 rounded-xl border border-brand-secondary/80 text-xs">
              <div className="flex justify-between text-brand-brown">
                <span>Socio:</span>
                <strong>{customer.firstName} {customer.lastName}</strong>
              </div>
              <div className="flex justify-between text-brand-brown mt-1">
                <span>Saldo Actual:</span>
                <span className="font-extrabold text-emerald-900">⭐ {customer.points} pts</span>
              </div>
            </div>

            <form onSubmit={handleManualAddPoints} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-brand-dark mb-1">
                  Monto Consumido en Pesos ($)
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={consumptionAmount}
                  onChange={(e) => setConsumptionAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-secondary bg-brand-bg font-extrabold text-sm text-brand-dark focus:outline-none"
                />
              </div>

              {/* Realtime points calculation indicator */}
              <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl text-emerald-950 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-emerald-800 block">
                    Puntos a Acreditar (100 pts = $1.000)
                  </span>
                  <span className="text-lg font-extrabold text-emerald-900 font-serif">
                    + {cashToPointsEquivalent(consumptionAmount)} Pts
                  </span>
                </div>
                <div className="text-right text-[11px] font-bold text-emerald-800">
                  Nuevo Saldo: {customer.points + cashToPointsEquivalent(consumptionAmount)} pts
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-brand-dark mb-1">Motivo / Concepto</label>
                <input
                  type="text"
                  value={consumptionReason}
                  onChange={(e) => setConsumptionReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs font-bold text-brand-dark"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPointsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark hover:bg-brand-secondary/30 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 text-white font-extrabold text-xs hover:bg-emerald-800 transition shadow-soft flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Acreditar Puntos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CANJE DE RECOMPENSAS DIRECTO */}
      {isRedeemModalOpen && customer && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border-2 border-brand-brown p-6 max-w-lg w-full shadow-soft-lg space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-brand-brown" />
                <h3 className="text-base font-extrabold text-brand-dark font-serif">
                  Canjear Premios para {customer.firstName}
                </h3>
              </div>
              <button
                onClick={() => setIsRedeemModalOpen(false)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-brand-cream p-3 rounded-xl border border-brand-secondary/80 text-xs flex justify-between items-center shrink-0">
              <span>Puntos Disponibles del Socio:</span>
              <span className="text-sm font-extrabold text-brand-dark">⭐ {customer.points} pts</span>
            </div>

            <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
              {rewards.map((r) => {
                const canAfford = customer.points >= r.pointsCost;
                return (
                  <div
                    key={r.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      canAfford
                        ? 'bg-brand-card border-brand-secondary hover:border-brand-brown'
                        : 'bg-brand-bg/50 border-brand-secondary/40 opacity-60'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-brand-cream rounded border border-brand-secondary text-brand-brown">
                          {r.category}
                        </span>
                        <h4 className="font-extrabold text-xs text-brand-dark">{r.name}</h4>
                      </div>
                      <p className="text-[11px] text-brand-brown/80 line-clamp-1">{r.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-brand-dark block mb-1.5">
                        {r.pointsCost} pts
                      </span>
                      <button
                        onClick={() => handleRedeemRewardAction(r)}
                        disabled={!canAfford}
                        className={`py-1 px-3 rounded-lg text-[10px] font-extrabold transition-all shadow-xs ${
                          canAfford
                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Canjear' : `Faltan ${r.pointsCost - customer.points} pts`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTRAR NUEVO SOCIO (+100 PTS BIENVENIDA) */}
      {isNewMemberModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border-2 border-brand-brown p-6 max-w-md w-full shadow-soft-lg space-y-4">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-brand-brown" />
                <h3 className="text-base font-extrabold text-brand-dark font-serif">
                  Registrar Nuevo Socio en el Club
                </h3>
              </div>
              <button
                onClick={() => setIsNewMemberModalOpen(false)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-emerald-950 text-xs flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                ¡Al registrarse se le acreditarán automáticamente <strong>100 Puntos de Bienvenida</strong> ($1.000 consumidos equiv)!
              </span>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-extrabold text-brand-dark mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sofía"
                    value={newMemberForm.firstName}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-brand-dark mb-1">Apellido</label>
                  <input
                    type="text"
                    placeholder="Ej. Morales"
                    value={newMemberForm.lastName}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-brand-dark mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="+54 9 11 1234-5678"
                  value={newMemberForm.phone}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-bold"
                />
              </div>

              <div>
                <label className="block font-extrabold text-brand-dark mb-1">Email</label>
                <input
                  type="email"
                  placeholder="cliente@gmail.com"
                  value={newMemberForm.email}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-bold"
                />
              </div>

              <div>
                <label className="block font-extrabold text-brand-dark mb-1">Fecha de Cumpleaños</label>
                <input
                  type="date"
                  value={newMemberForm.birthDate}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, birthDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewMemberModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark hover:bg-brand-secondary/30 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-brown hover:bg-brand-dark text-white font-extrabold text-xs transition shadow-soft flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-brand-yellow" /> Dar de Alta (+100 pts)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: REGALAR GIFTCARD VIRTUAL */}
      {isGiftcardModalOpen && customer && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 max-w-sm w-full shadow-soft-lg space-y-4">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <h3 className="text-base font-extrabold text-brand-dark flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-600" /> Regalar Giftcard Virtual
              </h3>
              <button
                onClick={() => setIsGiftcardModalOpen(false)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-brand-dark mb-1">Monto de la Giftcard ($)</label>
                <select
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-bold text-brand-dark"
                  value={giftcardData.amount}
                  onChange={(e) => setGiftcardData({ ...giftcardData, amount: Number(e.target.value) })}
                >
                  <option value={5000}>$ 5.000 (Genera 500 pts)</option>
                  <option value={10000}>$ 10.000 (Genera 1.000 pts)</option>
                  <option value={15000}>$ 15.000 (Genera 1.500 pts)</option>
                  <option value={20000}>$ 20.000 (Genera 2.000 pts)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Email o Teléfono del Beneficiario</label>
                <input
                  type="text"
                  placeholder="amigo@email.com o teléfono"
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-bold"
                  value={giftcardData.recipientEmail}
                  onChange={(e) => setGiftcardData({ ...giftcardData, recipientEmail: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Mensaje de Dedicatoria</label>
                <textarea
                  placeholder="¡Feliz cumpleaños! Disfrutá de una rica merienda en Hilos de Amor."
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg resize-none h-16 text-xs"
                  value={giftcardData.message}
                  onChange={(e) => setGiftcardData({ ...giftcardData, message: e.target.value })}
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!giftcardData.recipientEmail) return showToast('Error', 'Ingresa un email o teléfono', 'error');
                setIsGiftcardModalOpen(false);
                setGiftcardData({ amount: 5000, recipientEmail: '', message: '' });
                showToast(
                  'Giftcard Emitida',
                  `Se envió la giftcard por ${formatCurrency(giftcardData.amount)} con éxito.`,
                  'success'
                );
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 text-white font-extrabold text-xs hover:bg-emerald-800 transition-colors shadow-soft flex items-center justify-center gap-2 mt-4"
            >
              <Send className="w-4 h-4 text-emerald-200" />
              Emitir Giftcard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
