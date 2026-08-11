import React, { useState } from 'react';
import { Wallet, Plus, ArrowDownToLine, ArrowUpFromLine, Search, History, Banknote, CreditCard, Send, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/currency';
import { CashRegister, CashTransaction, PaymentMethod } from '../types';

export const CajaPage: React.FC = () => {
  const { cashRegisters, cashTransactions, openRegister, closeRegister, addTransaction } = useApp();

  const [isOpeningModal, setIsOpeningModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [isTxModal, setIsTxModal] = useState(false);

  const [openedBy, setOpenedBy] = useState('');
  const [initialBalance, setInitialBalance] = useState(0);
  const [finalBalance, setFinalBalance] = useState(0);

  const [txType, setTxType] = useState<'ingreso' | 'egreso'>('ingreso');
  const [txAmount, setTxAmount] = useState(0);
  const [txMethod, setTxMethod] = useState<PaymentMethod | 'varios'>('efectivo');
  const [txDesc, setTxDesc] = useState('');

  const activeRegister = cashRegisters.find(r => r.status === 'abierta');

  const activeTransactions = activeRegister 
    ? cashTransactions.filter(tx => tx.registerId === activeRegister.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : [];

  const handleOpenRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!openedBy) return;
    openRegister(openedBy, initialBalance);
    setIsOpeningModal(false);
    setOpenedBy('');
    setInitialBalance(0);
  };

  const handleCloseRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRegister) return;
    closeRegister(activeRegister.id, finalBalance);
    setIsClosingModal(false);
    setFinalBalance(0);
  };

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRegister || txAmount <= 0) return;
    addTransaction({
      registerId: activeRegister.id,
      type: txType,
      amount: txAmount,
      paymentMethod: txMethod,
      description: txDesc || (txType === 'ingreso' ? 'Ingreso manual' : 'Egreso manual'),
    });
    setIsTxModal(false);
    setTxAmount(0);
    setTxDesc('');
  };

  const calcTotals = () => {
    let efectivo = 0, mercadopago = 0, tarjetas = 0, transferencias = 0;
    activeTransactions.forEach(tx => {
      const amt = tx.type === 'ingreso' ? tx.amount : -tx.amount;
      if (tx.paymentMethod === 'efectivo') efectivo += amt;
      else if (tx.paymentMethod === 'mercadopago') mercadopago += amt;
      else if (tx.paymentMethod === 'transferencia') transferencias += amt;
      else if (tx.paymentMethod === 'credito' || tx.paymentMethod === 'debito') tarjetas += amt;
    });
    return { efectivo, mercadopago, tarjetas, transferencias, total: efectivo + mercadopago + tarjetas + transferencias };
  };

  const totals = calcTotals();
  const expectedCash = (activeRegister?.initialBalance || 0) + totals.efectivo;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown bg-brand-yellow/40 px-2 py-0.5 rounded">
              Tesorería
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-brand-dark">Control de Caja</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Gestión de turnos, ingresos, egresos y arqueo de caja
          </p>
        </div>

        {!activeRegister ? (
          <button
            onClick={() => setIsOpeningModal(true)}
            className="py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-all duration-200 shadow-soft flex items-center gap-2"
          >
            <Wallet className="w-4 h-4 text-brand-yellow" />
            Abrir Turno de Caja
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsTxModal(true)}
              className="py-2.5 px-4 rounded-xl border border-brand-secondary text-brand-dark font-bold text-xs hover:bg-brand-secondary/40 transition-all shadow-soft flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Movimiento
            </button>
            <button
              onClick={() => {
                setFinalBalance(expectedCash);
                setIsClosingModal(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-brand-dark text-brand-card font-bold text-xs hover:bg-brand-dark/80 transition-all duration-200 shadow-soft flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-brand-green" />
              Cerrar Turno
            </button>
          </div>
        )}
      </div>

      {activeRegister ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="bg-brand-card p-5 rounded-2xl border border-brand-secondary shadow-soft space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-brown">Efectivo en Caja</p>
              <p className="text-3xl font-extrabold text-brand-dark">{formatCurrency(expectedCash)}</p>
              <p className="text-[10px] text-brand-brown/80">Fondo: {formatCurrency(activeRegister.initialBalance)} • Ingresos: {formatCurrency(totals.efectivo)}</p>
            </div>
            
            <div className="bg-brand-card p-5 rounded-2xl border border-brand-secondary shadow-soft space-y-2">
              <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-brand-brown" /><p className="text-xs font-bold uppercase tracking-wider text-brand-brown">Tarjetas</p></div>
              <p className="text-2xl font-bold text-brand-dark">{formatCurrency(totals.tarjetas)}</p>
            </div>

            <div className="bg-brand-card p-5 rounded-2xl border border-brand-secondary shadow-soft space-y-2">
              <div className="flex items-center gap-2"><Send className="w-4 h-4 text-brand-brown" /><p className="text-xs font-bold uppercase tracking-wider text-brand-brown">Transferencias</p></div>
              <p className="text-2xl font-bold text-brand-dark">{formatCurrency(totals.transferencias)}</p>
            </div>

            <div className="bg-brand-card p-5 rounded-2xl border border-brand-secondary shadow-soft space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-brown">MercadoPago</p>
              <p className="text-2xl font-bold text-brand-dark">{formatCurrency(totals.mercadopago)}</p>
            </div>
          </div>

          <div className="bg-brand-card rounded-2xl border border-brand-secondary shadow-soft overflow-hidden">
            <div className="p-4 border-b border-brand-secondary flex items-center justify-between">
              <h3 className="font-bold text-brand-dark flex items-center gap-2">
                <History className="w-4 h-4" /> Movimientos del Turno
              </h3>
              <span className="text-xs text-brand-brown/80">Total Ventas: <strong className="text-brand-dark">{formatCurrency(totals.total)}</strong></span>
            </div>
            
            <div className="divide-y divide-brand-secondary/40 max-h-[500px] overflow-y-auto">
              {activeTransactions.length === 0 ? (
                <div className="p-8 text-center text-sm text-brand-brown/60">No hay movimientos en este turno.</div>
              ) : (
                activeTransactions.map(tx => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-brand-bg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border ${tx.type === 'ingreso' ? 'bg-brand-green/20 border-brand-green text-emerald-800' : 'bg-red-100 border-red-200 text-red-800'}`}>
                        {tx.type === 'ingreso' ? <ArrowDownToLine className="w-4 h-4" /> : <ArrowUpFromLine className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-brand-dark text-sm">{tx.description}</p>
                        <p className="text-[11px] text-brand-brown/80 capitalize">{formatDate(tx.timestamp)} • {tx.paymentMethod}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-extrabold ${tx.type === 'ingreso' ? 'text-brand-dark' : 'text-red-700'}`}>
                        {tx.type === 'ingreso' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-brand-card p-12 rounded-2xl border border-brand-secondary shadow-soft text-center flex flex-col items-center justify-center space-y-4">
          <Wallet className="w-12 h-12 text-brand-brown/40" />
          <div>
            <h3 className="text-lg font-bold text-brand-dark">Caja Cerrada</h3>
            <p className="text-sm text-brand-brown/80 mt-1 max-w-sm mx-auto">Debes iniciar un nuevo turno de caja para poder registrar ingresos, gastos y procesar los pagos de las mesas.</p>
          </div>
          <button
            onClick={() => setIsOpeningModal(true)}
            className="mt-2 py-3 px-6 rounded-xl bg-brand-brown text-brand-card font-bold hover:bg-brand-dark transition-all duration-200 shadow-soft"
          >
            Abrir Caja Ahora
          </button>
        </div>
      )}

      {/* Modals for Opening, Closing and TX */}
      {isOpeningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 w-full max-w-md shadow-soft-lg space-y-4">
            <h3 className="text-lg font-bold text-brand-dark">Abrir Turno de Caja</h3>
            <form onSubmit={handleOpenRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Cajero / Responsable</label>
                <input required type="text" value={openedBy} onChange={e => setOpenedBy(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none" placeholder="Nombre del empleado" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Fondo de Caja (Efectivo Inicial)</label>
                <input required type="number" min={0} value={initialBalance} onChange={e => setInitialBalance(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsOpeningModal(false)} className="flex-1 py-2.5 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-brown text-brand-card font-bold text-xs">Abrir Caja</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isClosingModal && activeRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 w-full max-w-md shadow-soft-lg space-y-4">
            <h3 className="text-lg font-bold text-brand-dark">Arqueo y Cierre de Caja</h3>
            <div className="bg-brand-cream p-4 rounded-xl border border-brand-secondary text-sm space-y-2">
              <div className="flex justify-between"><span className="text-brand-brown">Efectivo Esperado:</span> <strong className="text-brand-dark">{formatCurrency(expectedCash)}</strong></div>
            </div>
            <form onSubmit={handleCloseRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Efectivo Real en Caja (Conteo)</label>
                <input required type="number" min={0} value={finalBalance} onChange={e => setFinalBalance(Number(e.target.value))} className="w-full px-3 py-2 text-lg font-bold rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsClosingModal(false)} className="flex-1 py-2.5 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-dark text-brand-card font-bold text-xs">Confirmar Cierre</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 w-full max-w-md shadow-soft-lg space-y-4">
            <h3 className="text-lg font-bold text-brand-dark">Nuevo Movimiento</h3>
            <form onSubmit={handleAddTx} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setTxType('ingreso')} className={`py-2 rounded-xl text-xs font-bold border ${txType === 'ingreso' ? 'bg-brand-green/20 border-brand-green text-emerald-900' : 'bg-brand-bg border-brand-secondary text-brand-dark'}`}>Ingreso</button>
                <button type="button" onClick={() => setTxType('egreso')} className={`py-2 rounded-xl text-xs font-bold border ${txType === 'egreso' ? 'bg-red-100 border-red-300 text-red-900' : 'bg-brand-bg border-brand-secondary text-brand-dark'}`}>Egreso</button>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Monto</label>
                <input required type="number" min={1} value={txAmount} onChange={e => setTxAmount(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Método</label>
                <select value={txMethod} onChange={e => setTxMethod(e.target.value as PaymentMethod)} className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none capitalize">
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="mercadopago">MercadoPago</option>
                  <option value="debito">Débito</option>
                  <option value="credito">Crédito</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Descripción</label>
                <input required type="text" value={txDesc} onChange={e => setTxDesc(e.target.value)} placeholder="Ej. Pago a proveedor" className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsTxModal(false)} className="flex-1 py-2.5 rounded-xl border border-brand-secondary font-bold text-xs text-brand-dark">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-brown text-brand-card font-bold text-xs">Guardar Movimiento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
