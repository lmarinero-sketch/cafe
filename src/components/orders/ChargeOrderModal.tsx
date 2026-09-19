import React, { useState, useEffect, useMemo } from 'react';
import {
  Banknote,
  CreditCard,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Gift,
  Coins,
  ArrowRight,
  X,
  Split,
  DollarSign,
} from 'lucide-react';
import { Order, PaymentMethod, PaymentSplit } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ChargeOrderModalProps {
  order?: Order | null;
  orders?: Order[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedOrder: Order) => void;
  onBatchSuccess?: (updatedOrders: Order[]) => void;
}

interface SplitItem {
  id: string;
  method: PaymentMethod;
  amount: number;
  giftCardCode?: string;
}

export const ChargeOrderModal: React.FC<ChargeOrderModalProps> = ({
  order,
  orders,
  isOpen,
  onClose,
  onSuccess,
  onBatchSuccess,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    cashRegisters,
    addTransaction,
    getGiftCardByCode,
    redeemGiftCard,
    updateOrderPaymentAndStatus,
  } = useApp();

  // Resolver lista de órdenes a cobrar
  const targetOrders: Order[] = useMemo(() => {
    if (orders && orders.length > 0) return orders;
    if (order) return [order];
    return [];
  }, [order, orders]);

  const primaryOrder = targetOrders[0] || null;
  const isBatch = targetOrders.length > 1;

  const activeRegister = useMemo(
    () => cashRegisters.find((r) => r.status === 'abierta'),
    [cashRegisters]
  );

  // Modo de cobro: 'simple' (1 solo medio) | 'split' (múltiples medios divididos)
  const [paymentMode, setPaymentMode] = useState<'simple' | 'split'>('simple');
  const [singleMethod, setSingleMethod] = useState<PaymentMethod>('efectivo');
  const [singleGiftCardCode, setSingleGiftCardCode] = useState('');

  // Lista de medios divididos para el pedido
  const [splits, setSplits] = useState<SplitItem[]>([]);

  // Configuración de propina
  const [tipMode, setTipMode] = useState<'none' | '10' | '15' | 'custom'>('10');
  const [customTipAmount, setCustomTipAmount] = useState<number>(0);
  const [tipPaymentMode, setTipPaymentMode] = useState<'single' | 'split'>('single');
  const [singleTipMethod, setSingleTipMethod] = useState<PaymentMethod | 'mismo_medio'>('mismo_medio');
  const [tipSplits, setTipSplits] = useState<SplitItem[]>([]);

  // Total acumulado de las órdenes a cobrar
  const orderTotal = useMemo(
    () => targetOrders.reduce((sum, o) => sum + o.total, 0),
    [targetOrders]
  );

  // Inicializar estado cuando se abren las órdenes
  useEffect(() => {
    if (targetOrders.length === 0) return;
    setPaymentMode('simple');
    setSingleMethod(
      primaryOrder?.paymentMethod && primaryOrder.paymentMethod !== 'varios'
        ? (primaryOrder.paymentMethod as PaymentMethod)
        : 'efectivo'
    );
    setSingleGiftCardCode('');
    setSplits([
      {
        id: 'split-1',
        method:
          primaryOrder?.paymentMethod && primaryOrder.paymentMethod !== 'varios'
            ? (primaryOrder.paymentMethod as PaymentMethod)
            : 'efectivo',
        amount: orderTotal,
      },
    ]);

    setTipMode('10');
    setCustomTipAmount(0);
    setTipPaymentMode('single');
    setSingleTipMethod('mismo_medio');
    const initialTip = Math.round(orderTotal * 0.1);
    setTipSplits([
      {
        id: 'tipsplit-1',
        method: 'efectivo',
        amount: initialTip,
      },
    ]);
  }, [targetOrders, primaryOrder, orderTotal]);

  if (!isOpen || targetOrders.length === 0 || !primaryOrder) return null;

  // Cálculos del cobro
  const totalAssignedOrder = splits.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
  const remainingOrder = Math.max(0, orderTotal - totalAssignedOrder);
  const isOrderFullyCovered = paymentMode === 'simple' || totalAssignedOrder === orderTotal;
  const isOrderOverpaid = paymentMode === 'split' && totalAssignedOrder > orderTotal;

  // Cálculos de la propina
  const suggested10 = Math.round(orderTotal * 0.1);
  const suggested15 = Math.round(orderTotal * 0.15);
  const tipAmount =
    tipMode === '10'
      ? suggested10
      : tipMode === '15'
      ? suggested15
      : tipMode === 'custom'
      ? customTipAmount
      : 0;

  const tipPercentage =
    tipAmount > 0 && orderTotal > 0
      ? tipMode === '10'
        ? 10
        : tipMode === '15'
        ? 15
        : Math.round((tipAmount / orderTotal) * 100)
      : 0;

  const totalAssignedTip = tipSplits.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
  const remainingTip = Math.max(0, tipAmount - totalAssignedTip);
  const isTipFullyCovered =
    tipAmount === 0 || tipPaymentMode === 'single' || totalAssignedTip >= tipAmount;

  // Función para obtener el monto máximo permitido para una fila específica del pedido
  const getMaxAllowedForOrderSplit = (index: number): number => {
    const otherRowsSum = splits
      .filter((_, idx) => idx !== index)
      .reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
    return Math.max(0, orderTotal - otherRowsSum);
  };

  // Función para obtener el monto máximo permitido para una fila de propina
  const getMaxAllowedForTipSplit = (index: number): number => {
    const otherRowsSum = tipSplits
      .filter((_, idx) => idx !== index)
      .reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
    return Math.max(0, tipAmount - otherRowsSum);
  };

  // Manejar cambio de monto en fila del pedido con tope dinámico
  const handleOrderSplitAmountChange = (index: number, rawValue: number) => {
    const max = getMaxAllowedForOrderSplit(index);
    const clamped = Math.max(0, Math.min(rawValue, max));
    setSplits((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], amount: clamped };
      return next;
    });
  };

  // Manejar cambio de método en fila del pedido
  const handleOrderSplitMethodChange = (index: number, method: PaymentMethod) => {
    setSplits((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], method };
      return next;
    });
  };

  // Agregar un nuevo método de pago para el pedido
  const handleAddOrderSplit = () => {
    if (remainingOrder <= 0) {
      showToast(
        'Monto completo',
        'El total de la factura ya está 100% asignado. Para agregar otro medio, reducí el monto de alguno existente.',
        'info'
      );
      return;
    }
    setSplits((prev) => [
      ...prev,
      {
        id: `split-${Date.now()}`,
        method: 'efectivo',
        amount: remainingOrder, // Se inicializa automáticamente con el saldo faltante exacto
      },
    ]);
  };

  // Eliminar fila del pedido
  const handleRemoveOrderSplit = (index: number) => {
    if (splits.length <= 1) return;
    setSplits((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Manejar cambio de monto en propina dividida con tope dinámico
  const handleTipSplitAmountChange = (index: number, rawValue: number) => {
    const max = getMaxAllowedForTipSplit(index);
    const clamped = Math.max(0, Math.min(rawValue, max));
    setTipSplits((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], amount: clamped };
      return next;
    });
  };

  // Manejar cambio de método en propina dividida
  const handleTipSplitMethodChange = (index: number, method: PaymentMethod) => {
    setTipSplits((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], method };
      return next;
    });
  };

  // Agregar fila a propina dividida
  const handleAddTipSplit = () => {
    if (remainingTip <= 0) return;
    setTipSplits((prev) => [
      ...prev,
      {
        id: `tipsplit-${Date.now()}`,
        method: 'efectivo',
        amount: remainingTip,
      },
    ]);
  };

  // Eliminar fila de propina dividida
  const handleRemoveTipSplit = (index: number) => {
    if (tipSplits.length <= 1) return;
    setTipSplits((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Cambio de modo de propina
  const handleTipModeChange = (mode: 'none' | '10' | '15' | 'custom') => {
    setTipMode(mode);
    const newTipAmount =
      mode === '10'
        ? suggested10
        : mode === '15'
        ? suggested15
        : mode === 'custom'
        ? customTipAmount
        : 0;

    setTipSplits([
      {
        id: 'tipsplit-1',
        method: 'efectivo',
        amount: newTipAmount,
      },
    ]);
  };

  const handleCustomTipChange = (val: number) => {
    const clamped = Math.max(0, val);
    setCustomTipAmount(clamped);
    if (tipSplits.length === 1) {
      setTipSplits([{ id: 'tipsplit-1', method: tipSplits[0]?.method || 'efectivo', amount: clamped }]);
    }
  };

  // Procesar Cobro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeRegister) {
      showToast('Caja cerrada', 'No hay ninguna caja abierta para registrar el cobro.', 'error');
      return;
    }

    // 1. Validaciones del pedido
    if (paymentMode === 'simple') {
      if (singleMethod === 'giftcard') {
        if (!singleGiftCardCode.trim()) {
          showToast('Código Requerido', 'Por favor ingresá el código de la Gift Card.', 'error');
          return;
        }
        const card = getGiftCardByCode(singleGiftCardCode);
        if (!card) {
          showToast('Tarjeta No Encontrada', 'No se encontró ninguna Gift Card con el código ingresado.', 'error');
          return;
        }
        if (card.currentBalance < orderTotal) {
          showToast(
            'Saldo Insuficiente en Gift Card',
            `La tarjeta tiene ${formatCurrency(card.currentBalance)} y el pedido es de ${formatCurrency(orderTotal)}.`,
            'error'
          );
          return;
        }
        const redeemRes = redeemGiftCard(
          singleGiftCardCode,
          orderTotal,
          primaryOrder.id,
          isBatch ? targetOrders.map((o) => o.code).join(', ') : primaryOrder.code,
          primaryOrder.tableName || primaryOrder.type,
          `Cobro ${isBatch ? 'comandas mesa' : 'Pedido ' + primaryOrder.code} con Gift Card`
        );
        if (!redeemRes.success) {
          showToast('Error al canjear', redeemRes.message, 'error');
          return;
        }
      }
    } else {
      // Validar que el total esté 100% cubierto
      if (totalAssignedOrder < orderTotal) {
        showToast(
          'Saldo Faltante',
          `Faltan ${formatCurrency(remainingOrder)} para cubrir el total de la boleta.`,
          'error'
        );
        return;
      }
      if (totalAssignedOrder > orderTotal) {
        showToast(
          'Monto Excedido',
          `El total asignado (${formatCurrency(totalAssignedOrder)}) supera el valor de la boleta (${formatCurrency(orderTotal)}).`,
          'error'
        );
        return;
      }

      // Validar y redimir Gift Cards utilizadas en los splits
      for (const split of splits) {
        if (split.method === 'giftcard' && split.amount > 0) {
          if (!split.giftCardCode?.trim()) {
            showToast('Código de Gift Card requerido', 'Ingresá el código para la línea de Gift Card.', 'error');
            return;
          }
          const card = getGiftCardByCode(split.giftCardCode);
          if (!card) {
            showToast('Gift Card inválida', `No existe tarjeta con código ${split.giftCardCode}.`, 'error');
            return;
          }
          if (card.currentBalance < split.amount) {
            showToast(
              'Saldo insuficiente en Gift Card',
              `La tarjeta ${card.code} tiene ${formatCurrency(card.currentBalance)} y se requieren ${formatCurrency(split.amount)}.`,
              'error'
            );
            return;
          }
          const redeemRes = redeemGiftCard(
            split.giftCardCode,
            split.amount,
            primaryOrder.id,
            isBatch ? targetOrders.map((o) => o.code).join(', ') : primaryOrder.code,
            primaryOrder.tableName || primaryOrder.type,
            `Cobro parcial ${isBatch ? 'comandas mesa' : 'Pedido ' + primaryOrder.code} con Gift Card`
          );
          if (!redeemRes.success) {
            showToast('Error al canjear', redeemRes.message, 'error');
            return;
          }
        }
      }
    }

    // 2. Validaciones de propina
    if (tipAmount > 0 && tipPaymentMode === 'split') {
      if (totalAssignedTip < tipAmount) {
        showToast(
          'Propina incompleta',
          `Faltan ${formatCurrency(remainingTip)} para completar la propina asignada.`,
          'error'
        );
        return;
      }
    }

    const staffName = user ? `${user.name} (${user.role || 'mozo'})` : 'Usuario de Turno';
    const methodNames: Record<string, string> = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia',
      mercadopago: 'MercadoPago',
      debito: 'Débito',
      credito: 'Crédito',
      giftcard: 'Gift Card',
    };

    // 3. Registrar transacciones de ingreso en Tesorería / Caja
    const finalOrderSplits: PaymentSplit[] =
      paymentMode === 'simple'
        ? [{ method: singleMethod, amount: orderTotal, reference: singleGiftCardCode.toUpperCase() || undefined }]
        : splits
            .filter((s) => s.amount > 0)
            .map((s) => ({
              method: s.method,
              amount: s.amount,
              reference: s.giftCardCode?.toUpperCase() || undefined,
            }));

    if (!isBatch) {
      for (const split of finalOrderSplits) {
        addTransaction({
          registerId: activeRegister.id,
          orderId: primaryOrder.id,
          type: 'ingreso',
          amount: split.amount,
          paymentMethod: split.method,
          description:
            split.method === 'giftcard' && split.reference
              ? `Cobro Pedido ${primaryOrder.code} con Gift Card ${split.reference}`
              : `Cobro Pedido ${primaryOrder.code} (${methodNames[split.method] || split.method})`,
          registeredBy: staffName,
        });
      }
    } else {
      if (paymentMode === 'simple') {
        for (const ord of targetOrders) {
          addTransaction({
            registerId: activeRegister.id,
            orderId: ord.id,
            type: 'ingreso',
            amount: ord.total,
            paymentMethod: singleMethod,
            description: `Cobro Pedido ${ord.code} (${methodNames[singleMethod] || singleMethod}) - Mesa ${ord.tableName || ''}`,
            registeredBy: staffName,
          });
        }
      } else {
        for (const split of finalOrderSplits) {
          addTransaction({
            registerId: activeRegister.id,
            orderId: primaryOrder.id,
            type: 'ingreso',
            amount: split.amount,
            paymentMethod: split.method,
            description:
              split.method === 'giftcard' && split.reference
                ? `Cobro Comandas (${targetOrders.map((o) => o.code).join(', ')}) con Gift Card ${split.reference}`
                : `Cobro Comandas (${targetOrders.map((o) => o.code).join(', ')}) (${methodNames[split.method] || split.method})`,
            registeredBy: staffName,
          });
        }
      }
    }

    // Registrar transacciones de propina en Caja
    let finalTipMethod: PaymentMethod | 'varios' | undefined = undefined;
    let finalTipSplits: PaymentSplit[] | undefined = undefined;

    if (tipAmount > 0) {
      if (tipPaymentMode === 'single') {
        const resolvedMethod =
          singleTipMethod === 'mismo_medio'
            ? paymentMode === 'simple'
              ? singleMethod
              : 'efectivo'
            : singleTipMethod;

        finalTipMethod = resolvedMethod;
        addTransaction({
          registerId: activeRegister.id,
          orderId: primaryOrder.id,
          type: 'ingreso',
          amount: tipAmount,
          paymentMethod: resolvedMethod,
          description: isBatch
            ? `Propina Comandas (${targetOrders.map((o) => o.code).join(', ')}) (${methodNames[resolvedMethod] || resolvedMethod})`
            : `Propina Pedido ${primaryOrder.code} (${methodNames[resolvedMethod] || resolvedMethod})`,
          registeredBy: staffName,
        });
      } else {
        finalTipMethod = 'varios';
        finalTipSplits = tipSplits
          .filter((s) => s.amount > 0)
          .map((s) => ({ method: s.method, amount: s.amount }));

        for (const split of finalTipSplits) {
          addTransaction({
            registerId: activeRegister.id,
            orderId: primaryOrder.id,
            type: 'ingreso',
            amount: split.amount,
            paymentMethod: split.method,
            description: isBatch
              ? `Propina Comandas (${targetOrders.map((o) => o.code).join(', ')}) (${methodNames[split.method] || split.method})`
              : `Propina Pedido ${primaryOrder.code} (${methodNames[split.method] || split.method})`,
            registeredBy: staffName,
          });
        }
      }
    }

    // 4. Actualizar estado y pagos de cada orden involucrada
    const updatedOrders: Order[] = [];
    for (let i = 0; i < targetOrders.length; i++) {
      const ord = targetOrders[i];
      const ordTip = i === 0 ? tipAmount : 0;
      const ordTipPct = i === 0 ? tipPercentage : 0;
      const orderSplits =
        paymentMode === 'simple'
          ? [{ method: singleMethod, amount: ord.total, reference: singleGiftCardCode.toUpperCase() || undefined }]
          : isBatch
          ? [{ method: 'varios' as PaymentMethod, amount: ord.total }]
          : finalOrderSplits;

      const updated: Order = {
        ...ord,
        status: 'entregado',
        paymentMethod: paymentMode === 'simple' ? singleMethod : 'varios',
        payments: orderSplits,
        tipAmount: ordTip,
        tipPercentage: ordTipPct,
        tipPaymentMethod: ordTip > 0 ? finalTipMethod : undefined,
        tipPayments: ordTip > 0 ? finalTipSplits : undefined,
        tipRegisteredBy: ordTip > 0 ? staffName : undefined,
        tipRegisteredAt: ordTip > 0 ? new Date().toISOString() : undefined,
      };

      await updateOrderPaymentAndStatus(ord.id, {
        status: 'entregado',
        paymentMethod: updated.paymentMethod,
        payments: updated.payments,
        tipAmount: updated.tipAmount,
        tipPercentage: updated.tipPercentage,
        tipPaymentMethod: updated.tipPaymentMethod,
        tipPayments: updated.tipPayments,
        tipRegisteredBy: staffName,
      });
      updatedOrders.push(updated);
    }

    if (isBatch) {
      showToast(
        'Comandas Cobradas',
        `${targetOrders.length} comandas cobradas y entregadas correctamente.`,
        'success'
      );
      onBatchSuccess?.(updatedOrders);
    } else {
      showToast('Pedido Cobrado', `Pedido ${primaryOrder.code} cobrado y entregado correctamente.`, 'success');
      onSuccess?.(updatedOrders[0]);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-brand-dark/50 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg my-auto overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
        {/* Cabecera Modal */}
        <div className="p-3.5 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 via-white to-amber-50/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200 shrink-0">
              <Banknote className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-sm sm:text-lg font-black text-gray-900 truncate">
                  {isBatch ? 'Cobrar Comandas Juntas' : 'Cobrar Pedido'}
                </h3>
                {isBatch ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px] sm:text-xs">
                    {targetOrders.length} comandas
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px] sm:text-xs">
                    #{primaryOrder.code}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium truncate">
                {primaryOrder.tableName ? `Mesa: ${primaryOrder.tableName}` : primaryOrder.type.toUpperCase()}
                {isBatch
                  ? ` • ${targetOrders.map((o) => o.code).join(', ')}`
                  : ` • ${primaryOrder.customerName}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition shrink-0 ml-1.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen de Total */}
        <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Total de la Boleta</span>
          <span className="text-lg sm:text-xl font-black text-gray-900 font-mono">
            {formatCurrency(orderTotal)}
          </span>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {!activeRegister ? (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3.5 rounded-xl font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>No hay una caja abierta en Tesorería. Abrí un turno de caja antes de poder registrar cobros.</span>
            </div>
          ) : (
            <form id="charge-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Selector de Modo: Pago Simple vs Múltiples Medios */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    Medios de Pago del Pedido
                  </label>
                  <div className="inline-flex rounded-lg p-0.5 bg-gray-100 border border-gray-200 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMode('simple');
                        setSplits([
                          {
                            id: 'split-1',
                            method: singleMethod,
                            amount: orderTotal,
                          },
                        ]);
                      }}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        paymentMode === 'simple'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Único Medio
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMode('split');
                        if (splits.length === 0) {
                          setSplits([{ id: 'split-1', method: singleMethod, amount: orderTotal }]);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${
                        paymentMode === 'split'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Split className="w-3 h-3" />
                      Dividir Medios
                    </button>
                  </div>
                </div>

                {/* Vista Pago Simple */}
                {paymentMode === 'simple' ? (
                  <div className="space-y-3 bg-gray-50/60 p-3.5 rounded-xl border border-gray-200">
                    <select
                      value={singleMethod}
                      onChange={(e) => setSingleMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white font-bold text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 capitalize"
                    >
                      <option value="efectivo">💵 Efectivo</option>
                      <option value="transferencia">🏦 Transferencia Bancaria</option>
                      <option value="mercadopago">📲 Mercado Pago</option>
                      <option value="debito">💳 Tarjeta de Débito</option>
                      <option value="credito">💳 Tarjeta de Crédito</option>
                      <option value="giftcard">🎁 Gift Card / Tarjeta de Regalo</option>
                    </select>

                    {singleMethod === 'giftcard' && (
                      <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2 text-xs">
                        <label className="block font-bold text-amber-950 text-[11px] uppercase tracking-wider">
                          Código de Gift Card Virtual
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: GIFT-8921-MAG"
                          value={singleGiftCardCode}
                          onChange={(e) => setSingleGiftCardCode(e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-mono font-extrabold text-xs text-gray-900 tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        />
                        {singleGiftCardCode.trim() && (() => {
                          const matched = getGiftCardByCode(singleGiftCardCode);
                          if (!matched) {
                            return <p className="text-[11px] font-bold text-rose-600">✕ No existe ninguna Gift Card con este código.</p>;
                          }
                          const hasEnough = matched.currentBalance >= orderTotal;
                          return (
                            <div className="pt-1 text-[11px] space-y-0.5">
                              <p className="text-gray-700">
                                <strong>Titular:</strong> {matched.recipientName} • <strong>Saldo:</strong>{' '}
                                <span className="font-mono font-bold text-emerald-700">{formatCurrency(matched.currentBalance)}</span>
                              </p>
                              {!hasEnough ? (
                                <p className="font-bold text-rose-600">
                                  ✕ Saldo insuficiente ({formatCurrency(matched.currentBalance)}). Podés dividir el pago usando "Dividir Medios".
                                </p>
                              ) : (
                                <p className="font-bold text-emerald-700">✓ Saldo suficiente para cubrir el pedido.</p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Vista Dividir Medios (Split Payments) */
                  <div className="space-y-3 bg-blue-50/40 p-3.5 rounded-xl border border-blue-200">
                    <div className="space-y-2.5">
                      {splits.map((split, index) => {
                        const maxForThis = getMaxAllowedForOrderSplit(index);
                        const isGiftCard = split.method === 'giftcard';
                        const matchedCard = isGiftCard && split.giftCardCode ? getGiftCardByCode(split.giftCardCode) : undefined;
                        const effectiveMax = isGiftCard && matchedCard ? Math.min(maxForThis, matchedCard.currentBalance) : maxForThis;

                        return (
                          <div
                            key={split.id}
                            className="bg-white p-3 rounded-xl border border-blue-100 shadow-xs space-y-2 transition-all hover:border-blue-300"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black flex items-center justify-center shrink-0">
                                {index + 1}
                              </span>
                              <div className="flex-1 min-w-[130px]">
                                <select
                                  value={split.method}
                                  onChange={(e) => handleOrderSplitMethodChange(index, e.target.value as PaymentMethod)}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-bold text-gray-800 capitalize focus:outline-none focus:ring-1 focus:ring-blue-400"
                                >
                                  <option value="efectivo">💵 Efectivo</option>
                                  <option value="transferencia">🏦 Transferencia</option>
                                  <option value="mercadopago">📲 Mercado Pago</option>
                                  <option value="debito">💳 Débito</option>
                                  <option value="credito">💳 Crédito</option>
                                  <option value="giftcard">🎁 Gift Card</option>
                                </select>
                              </div>

                              <div className="relative flex-1 min-w-[110px]">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={effectiveMax}
                                  step={10}
                                  value={split.amount === 0 ? '' : split.amount}
                                  placeholder="0"
                                  onChange={(e) => handleOrderSplitAmountChange(index, Number(e.target.value))}
                                  className="w-full pl-6 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400 text-right"
                                />
                              </div>

                              {splits.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOrderSplit(index)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                                  title="Eliminar este medio de pago"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            {/* Sub-información de tope disponible */}
                            <div className="flex items-center justify-between text-[10px] text-gray-500 px-1">
                              <span>Máximo disponible para asignar:</span>
                              <span className="font-mono font-bold text-blue-800">
                                {formatCurrency(effectiveMax)}
                              </span>
                            </div>

                            {/* Campo de Gift Card si corresponde */}
                            {isGiftCard && (
                              <div className="pt-1.5 border-t border-gray-100 space-y-1 text-xs">
                                <input
                                  type="text"
                                  placeholder="CÓDIGO GIFT CARD"
                                  value={split.giftCardCode || ''}
                                  onChange={(e) => {
                                    const code = e.target.value.toUpperCase();
                                    setSplits((prev) => {
                                      const next = [...prev];
                                      next[index] = { ...next[index], giftCardCode: code };
                                      return next;
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-amber-50/50 border border-amber-200 rounded-lg font-mono font-bold text-xs uppercase"
                                />
                                {split.giftCardCode && matchedCard && (
                                  <p className="text-[10px] font-bold text-emerald-700">
                                    ✓ Saldo en tarjeta: {formatCurrency(matchedCard.currentBalance)}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Botón para agregar otro medio si aún queda saldo por asignar */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleAddOrderSplit}
                        disabled={remainingOrder <= 0}
                        className={`w-full py-2 px-3 rounded-xl border border-dashed font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                          remainingOrder > 0
                            ? 'border-blue-400 bg-white text-blue-700 hover:bg-blue-50/80 shadow-xs cursor-pointer'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Otro Medio de Pago</span>
                        {remainingOrder > 0 && (
                          <span className="ml-1 text-[11px] font-mono bg-blue-100 px-1.5 py-0.5 rounded text-blue-800 font-extrabold">
                            (Resta asignar {formatCurrency(remainingOrder)})
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Alerta de Faltante / Validación de Cuadre */}
                    <div className="pt-2">
                      {remainingOrder > 0 ? (
                        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-1 text-amber-950 animate-shake">
                          <div className="flex items-center gap-1.5 font-black text-amber-900">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Faltante por pagar: {formatCurrency(remainingOrder)}</span>
                          </div>
                          <p className="text-[11px] text-amber-800">
                            Total Boleta: <strong>{formatCurrency(orderTotal)}</strong> • Asignado:{' '}
                            <strong className="text-blue-900">{formatCurrency(totalAssignedOrder)}</strong>
                          </p>
                        </div>
                      ) : isOrderOverpaid ? (
                        <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>El total asignado supera el total del pedido por {formatCurrency(totalAssignedOrder - orderTotal)}.</span>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>¡Total de la boleta cubierto al 100%! ({formatCurrency(orderTotal)})</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── PROPINA DEL SERVICIO ── */}
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    Propina del Servicio
                    <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-400">
                      10% Sugerido
                    </span>
                  </label>
                  <span className="text-[10px] text-amber-900 font-bold">
                    Mozo: {user?.name || 'Turno Activo'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleTipModeChange('none')}
                    className={`py-2 px-1 rounded-xl font-bold border transition-all text-center ${
                      tipMode === 'none'
                        ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="block text-[11px]">Sin propina</span>
                    <span className="text-[9px] opacity-70">$0</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTipModeChange('10')}
                    className={`py-2 px-1 rounded-xl font-black border transition-all text-center relative ${
                      tipMode === '10'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-400'
                        : 'bg-white text-amber-950 border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    <span className="block text-[11px]">⭐ 10%</span>
                    <span className="text-[9px] font-mono">{formatCurrency(suggested10)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTipModeChange('15')}
                    className={`py-2 px-1 rounded-xl font-bold border transition-all text-center ${
                      tipMode === '15'
                        ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="block text-[11px]">15%</span>
                    <span className="text-[9px] font-mono">{formatCurrency(suggested15)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTipModeChange('custom')}
                    className={`py-2 px-1 rounded-xl font-bold border transition-all text-center ${
                      tipMode === 'custom'
                        ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="block text-[11px]">Otro $</span>
                    <span className="text-[9px] opacity-70">Libre</span>
                  </button>
                </div>

                {tipMode === 'custom' && (
                  <div>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      placeholder="Monto de propina en $"
                      value={customTipAmount || ''}
                      onChange={(e) => handleCustomTipChange(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                )}

                {/* Selección de Medios de Pago de la Propina */}
                {tipAmount > 0 && (
                  <div className="pt-2 border-t border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-950">Medio de Pago de la Propina:</span>
                      <div className="inline-flex rounded-lg p-0.5 bg-amber-100 border border-amber-300 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setTipPaymentMode('single')}
                          className={`px-2 py-0.5 rounded font-bold transition ${
                            tipPaymentMode === 'single' ? 'bg-white text-amber-950 shadow-xs' : 'text-amber-800'
                          }`}
                        >
                          Único
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTipPaymentMode('split');
                            if (tipSplits.length === 0) {
                              setTipSplits([{ id: 'tipsplit-1', method: 'efectivo', amount: tipAmount }]);
                            }
                          }}
                          className={`px-2 py-0.5 rounded font-bold transition ${
                            tipPaymentMode === 'split' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-800'
                          }`}
                        >
                          Dividir
                        </button>
                      </div>
                    </div>

                    {tipPaymentMode === 'single' ? (
                      <select
                        value={singleTipMethod}
                        onChange={(e) => setSingleTipMethod(e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-bold text-gray-900 focus:outline-none capitalize"
                      >
                        <option value="mismo_medio">Mismo que el Pedido</option>
                        <option value="efectivo">💵 Efectivo</option>
                        <option value="transferencia">🏦 Transferencia</option>
                        <option value="mercadopago">📲 Mercado Pago</option>
                        <option value="debito">💳 Débito</option>
                        <option value="credito">💳 Crédito</option>
                      </select>
                    ) : (
                      /* Propina Dividida */
                      <div className="space-y-2 bg-white/80 p-2.5 rounded-xl border border-amber-200">
                        {tipSplits.map((ts, idx) => {
                          const maxForTip = getMaxAllowedForTipSplit(idx);
                          return (
                            <div key={ts.id} className="flex items-center gap-1.5">
                              <select
                                value={ts.method}
                                onChange={(e) => handleTipSplitMethodChange(idx, e.target.value as PaymentMethod)}
                                className="px-2 py-1 rounded-lg border border-amber-200 bg-white text-xs font-bold text-gray-800 capitalize flex-1"
                              >
                                <option value="efectivo">💵 Efectivo</option>
                                <option value="transferencia">🏦 Transferencia</option>
                                <option value="mercadopago">📲 Mercado Pago</option>
                                <option value="debito">💳 Débito</option>
                                <option value="credito">💳 Crédito</option>
                              </select>
                              <div className="relative w-28">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={maxForTip}
                                  value={ts.amount === 0 ? '' : ts.amount}
                                  placeholder="0"
                                  onChange={(e) => handleTipSplitAmountChange(idx, Number(e.target.value))}
                                  className="w-full pl-5 pr-2 py-1 bg-white border border-amber-200 rounded-lg text-xs font-mono font-bold text-gray-900 text-right"
                                />
                              </div>
                              {tipSplits.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTipSplit(idx)}
                                  className="p-1 text-gray-400 hover:text-rose-600 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          );
                        })}

                        <button
                          type="button"
                          onClick={handleAddTipSplit}
                          disabled={remainingTip <= 0}
                          className={`w-full py-1.5 rounded-lg border border-dashed text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                            remainingTip > 0
                              ? 'border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100'
                              : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>Agregar medio a la propina</span>
                          {remainingTip > 0 && <span>(Resta {formatCurrency(remainingTip)})</span>}
                        </button>

                        {remainingTip > 0 && (
                          <p className="text-[10px] font-bold text-amber-800">
                            ⚠️ Faltan {formatCurrency(remainingTip)} por asignar a la propina.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Resumen Final con Propina */}
                <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs space-y-1 shadow-xs">
                  <div className="flex justify-between text-gray-600 text-[11px]">
                    <span>Consumo Boleta:</span>
                    <span className="font-bold text-gray-800 font-mono">{formatCurrency(orderTotal)}</span>
                  </div>
                  {tipAmount > 0 && (
                    <div className="flex justify-between text-emerald-800 font-bold text-[11px]">
                      <span>Propina ({tipPercentage}%):</span>
                      <span className="font-mono">+{formatCurrency(tipAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm text-gray-900 pt-1.5 border-t border-gray-200">
                    <span>Total Final a Cobrar:</span>
                    <span className="text-emerald-900 font-mono text-base font-black">
                      {formatCurrency(orderTotal + tipAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Acciones Inferiores */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-3.5 sm:px-4 rounded-xl border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-100 transition shrink-0"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="charge-form"
            disabled={!activeRegister || !isOrderFullyCovered || isOrderOverpaid || !isTipFullyCovered}
            className={`flex-1 py-2.5 px-3 sm:px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition truncate ${
              !activeRegister || !isOrderFullyCovered || isOrderOverpaid || !isTipFullyCovered
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 active:scale-98'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {!isOrderFullyCovered
                ? `Falta ${formatCurrency(remainingOrder)}`
                : !isTipFullyCovered
                ? `Falta propina ${formatCurrency(remainingTip)}`
                : 'Confirmar Cobro y Cerrar'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
