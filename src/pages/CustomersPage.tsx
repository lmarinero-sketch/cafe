import React, { useState } from 'react';
import { Users, Plus, Search, Award, Phone, Mail, Calendar, ShieldCheck, X, Sparkles, TrendingUp, Gift, MessageCircle, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer, CustomerLevel } from '../types';
import { formatCurrency, formatShortDate } from '../utils/currency';
import { ModuleOnboardingBanner } from '../components/common/ModuleOnboardingBanner';

export const CustomersPage: React.FC = () => {
  const { customers, addCustomer } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    birthDate: '1992-05-20',
    marketingConsent: true,
  });

  const filteredCustomers = customers.filter((c) => {
    const matchesLevel = filterLevel === 'all' || c.level === filterLevel;
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
    return matchesLevel && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.phone) return;
    addCustomer(formData);
    setIsModalOpen(false);
  };

  const getLevelBadge = (level: CustomerLevel) => {
    switch (level) {
      case 'VIP':
        return 'bg-purple-100 text-purple-950 border-purple-300';
      case 'Preferencial':
        return 'bg-brand-green/30 text-emerald-950 border-brand-green';
      case 'Frecuente':
        return 'bg-brand-yellow/40 text-brand-dark border-brand-yellow';
      default:
        return 'bg-brand-cream text-brand-dark border-brand-secondary';
    }
  };

  const [selectedActionCustomer, setSelectedActionCustomer] = useState<{ customer: Customer; actionType: string } | null>(null);

  // Compute Top Spenders (Sorted by totalSpent descending)
  const topSpenders = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Module Onboarding Banner */}
      <ModuleOnboardingBanner
        title="CRM & Métricas de Clientes"
        subtitle="Analizá el consumo de tus socios, premiá a los de mayor facturación y ofrecié atenciones exclusivas"
        requiredPlan="fidelizacion"
        steps={[
          'Identificá a los clientes Top Spenders de mayor facturación acumulada.',
          'Hacé clic en "Enviar Atención / Descuento" para fidelizar a tus clientes VIP.',
          'Revisá los puntos acumulados y canjes realizados por cada socio registrado.',
        ]}
      />

      {/* Header Banner */}
      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-brand-green/30 px-2 py-0.5 rounded">
              Plan Fidelización
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-brand-dark">CRM de Clientes & Top Spenders</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Base de miembros registrados, historial de compras y niveles de fidelización ({customers.length} socios)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-all duration-200 shadow-soft flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-brand-yellow" />
          Registrar cliente
        </button>
      </div>

      {/* Top Spenders & VIP Opportunities Insights Banner */}
      <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-900" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-brand-dark">
                Ranking de Clientes con Mayor Facturación (Top Spenders)
              </h3>
              <p className="text-xs text-brand-brown/80">
                Oportunidades de fidelización directa, descuentos y atenciones personalizadas
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topSpenders.map((c, idx) => (
            <div
              key={c.id}
              className="bg-brand-bg rounded-xl p-4 border border-brand-secondary/80 space-y-3 flex flex-col justify-between hover:border-brand-brown/40 transition-all shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-brand-brown text-brand-card font-extrabold text-[10px] flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-950 border border-purple-300">
                    {c.level}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-brand-dark">{c.firstName} {c.lastName}</h4>
                  <p className="text-[11px] text-brand-brown font-mono">{c.phone}</p>
                </div>

                <div className="bg-brand-card p-2 rounded-lg border border-brand-secondary/60 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-brand-brown/80">Gastado:</span>
                    <span className="font-extrabold text-brand-dark">{formatCurrency(c.totalSpent)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-brand-brown/80">Ticket Prom:</span>
                    <span className="font-bold text-brand-brown">{formatCurrency(c.averageTicket)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedActionCustomer({ customer: c, actionType: 'Voucher 20% Desc.' })}
                className="w-full py-1.5 px-3 rounded-lg bg-brand-brown text-brand-card font-bold text-[11px] hover:bg-brand-dark transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Gift className="w-3.5 h-3.5 text-brand-yellow" /> Ofrecer Atención
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-brand-card p-4 rounded-2xl border border-brand-secondary shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'Inicial', 'Frecuente', 'Preferencial', 'VIP'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterLevel === lvl
                  ? 'bg-brand-brown text-brand-card shadow-soft'
                  : 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40'
              }`}
            >
              {lvl === 'all' ? 'Todos los niveles' : `Nivel ${lvl}`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-brand-brown/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o teléfono..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-brand-card rounded-2xl border border-brand-secondary shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-brand-cream border-b border-brand-secondary/80 text-brand-dark uppercase tracking-wider text-[10px] font-extrabold">
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Teléfono / Email</th>
                <th className="p-3.5">Nivel</th>
                <th className="p-3.5">Puntos</th>
                <th className="p-3.5">Compras</th>
                <th className="p-3.5">Total Gastado</th>
                <th className="p-3.5">Ticket Promedio</th>
                <th className="p-3.5 text-right">Última Compra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-secondary/60">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-brand-bg/50 transition-colors">
                  <td className="p-3.5">
                    <p className="font-bold text-brand-dark">
                      {c.firstName} {c.lastName}
                    </p>
                    <span className="text-[10px] text-brand-brown/70">Socio #{c.id}</span>
                  </td>
                  <td className="p-3.5 text-brand-brown/80 space-y-0.5">
                    <p className="font-mono text-brand-dark">{c.phone}</p>
                    <p className="text-[10px]">{c.email}</p>
                  </td>
                  <td className="p-3.5">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getLevelBadge(c.level)}`}>
                      Nivel {c.level}
                    </span>
                  </td>
                  <td className="p-3.5 font-extrabold text-brand-brown bg-brand-yellow/20 rounded">
                    ⭐ {c.points} pts
                  </td>
                  <td className="p-3.5 font-bold text-brand-dark">{c.purchaseCount}</td>
                  <td className="p-3.5 font-bold text-brand-dark">{formatCurrency(c.totalSpent)}</td>
                  <td className="p-3.5 text-brand-brown">{formatCurrency(c.averageTicket)}</td>
                  <td className="p-3.5 text-right text-brand-brown/80">
                    {formatShortDate(c.lastPurchaseDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registration */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 max-w-md w-full shadow-soft-lg space-y-4">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <h3 className="text-base font-bold text-brand-dark">Registrar Nuevo Cliente</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Ej. Sofía"
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Ej. Martínez"
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Teléfono (WhatsApp)</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+54911..."
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sofia@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Fecha de cumpleaños</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                />
              </div>

              <div className="bg-brand-cream p-2.5 rounded-xl border border-brand-secondary/60 text-[11px] text-brand-brown">
                🎉 Al registrarse se le acreditarán automáticamente 150 puntos de bienvenida.
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold hover:bg-brand-dark transition-colors"
                >
                  Registrar socio
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

      {/* Modal Attention Offer */}
      {selectedActionCustomer && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 max-w-md w-full shadow-soft-lg space-y-4">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-brown" />
                <h3 className="text-base font-bold text-brand-dark">Enviar Atención / Descuento VIP</h3>
              </div>
              <button
                onClick={() => setSelectedActionCustomer(null)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-brand-cream p-3 rounded-xl border border-brand-secondary/80">
                <p className="font-extrabold text-brand-dark">
                  Socio: {selectedActionCustomer.customer.firstName} {selectedActionCustomer.customer.lastName} ({selectedActionCustomer.customer.level})
                </p>
                <p className="text-[11px] text-brand-brown">Facturación Total: {formatCurrency(selectedActionCustomer.customer.totalSpent)} • {selectedActionCustomer.customer.points} pts acumulados</p>
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Beneficio / Atención a ofrecer:</label>
                <select className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg font-bold text-brand-dark">
                  <option>🎁 Voucher 20% Desc. en próximo consumo</option>
                  <option>☕ Café Espresso + Medialuna Gratis de Bienvenida</option>
                  <option>⭐ Reserva Prioritaria de Mesa en Terraza</option>
                  <option>🎂 Regalo Especial de Cumpleaños (2x1 en Tortas)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Mensaje borrador (WhatsApp):</label>
                <textarea
                  rows={3}
                  readOnly
                  value={`¡Hola ${selectedActionCustomer.customer.firstName}! Por ser uno de nuestros clientes más valiosos en Café Magnolia, te regalamos un Voucher del 20% OFF para tu próxima visita. ¡Te esperamos! ☕✨`}
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    alert(`¡Atención enviada con éxito a ${selectedActionCustomer.customer.firstName}!`);
                    setSelectedActionCustomer(null);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold hover:bg-brand-dark transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" /> Enviar por WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedActionCustomer(null)}
                  className="py-2.5 px-4 rounded-xl border border-brand-secondary font-bold text-brand-dark hover:bg-brand-secondary/30"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
