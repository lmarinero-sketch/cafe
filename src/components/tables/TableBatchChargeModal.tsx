import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  CheckSquare,
  Square,
  Banknote,
  AlertCircle,
  Clock,
  Receipt,
} from 'lucide-react';
import { Table, Order } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface TableBatchChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
  pendingOrders: Order[];
  onProceed: (selectedOrders: Order[]) => void;
}

export const TableBatchChargeModal: React.FC<TableBatchChargeModalProps> = ({
  isOpen,
  onClose,
  table,
  pendingOrders,
  onProceed,
}) => {
  // Array de IDs de órdenes seleccionadas
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Al abrir el modal o cambiar las órdenes, por defecto seleccionamos todas
  useEffect(() => {
    if (isOpen && pendingOrders.length > 0) {
      setSelectedIds(pendingOrders.map((o) => o.id));
    }
  }, [isOpen, pendingOrders]);

  if (!isOpen || !table) return null;

  const toggleSelectOrder = (orderId: string) => {
    setSelectedIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(pendingOrders.map((o) => o.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const selectedOrders = pendingOrders.filter((o) => selectedIds.includes(o.id));
  const selectedTotal = selectedOrders.reduce((sum, o) => sum + o.total, 0);
  const unselectedCount = pendingOrders.length - selectedOrders.length;

  const handleContinue = () => {
    if (selectedOrders.length === 0) return;
    onProceed(selectedOrders);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-brand-dark/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-brand-card rounded-2xl border-2 border-brand-brown max-w-lg w-full shadow-soft-lg flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-brand-secondary/80 bg-brand-cream/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-brown text-brand-card flex items-center justify-center shadow-xs">
              <Receipt className="w-5 h-5 text-brand-yellow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-brand-dark font-serif">
                  Cobrar Mesa: {table.number}
                </h3>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-brand-secondary text-brand-dark uppercase">
                  {table.sector}
                </span>
              </div>
              <p className="text-xs text-brand-brown/80 mt-0.5">
                Seleccioná las comandas que vas a cobrar juntas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-brown hover:bg-brand-secondary/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Acciones de selección rápida */}
        <div className="px-4 py-2.5 bg-brand-bg border-b border-brand-secondary/60 flex items-center justify-between text-xs shrink-0">
          <span className="font-bold text-brand-dark">
            {selectedOrders.length} de {pendingOrders.length} comandas seleccionadas
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Seleccionar todas
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-[11px] font-bold text-rose-700 hover:underline flex items-center gap-1"
            >
              <Square className="w-3.5 h-3.5" /> Desmarcar todas
            </button>
          </div>
        </div>

        {/* Lista de Comandas con Checklist */}
        <div className="overflow-y-auto p-4 space-y-2.5 flex-1">
          {pendingOrders.length === 0 ? (
            <div className="text-center py-8 text-brand-brown/70 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-brand-brown/40" />
              <p className="text-sm font-semibold">No hay comandas pendientes en esta mesa.</p>
            </div>
          ) : (
            pendingOrders.map((ord) => {
              const isSelected = selectedIds.includes(ord.id);
              const orderTime = new Date(ord.createdAt).toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={ord.id}
                  onClick={() => toggleSelectOrder(ord.id)}
                  className={`cursor-pointer rounded-xl border p-3 transition-all flex items-start gap-3 select-none ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                      : 'bg-white border-brand-secondary hover:border-brand-brown/40 opacity-75'
                  }`}
                >
                  {/* Checkbox */}
                  <div className="pt-0.5 shrink-0">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'border-2 border-brand-secondary bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Detalle de la comanda */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-xs text-brand-dark">
                          #{ord.code}
                        </span>
                        <span className="text-[10px] text-brand-brown/70 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {orderTime}
                        </span>
                        {ord.customerName && ord.customerName !== 'Cliente de Mesa' && (
                          <span className="text-[10px] bg-brand-cream text-brand-dark px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]">
                            {ord.customerName}
                          </span>
                        )}
                      </div>
                      <span className="font-extrabold text-xs text-brand-dark">
                        {formatCurrency(ord.total)}
                      </span>
                    </div>

                    {/* Resumen de ítems */}
                    <div className="mt-1.5 space-y-0.5">
                      {ord.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="text-[11px] text-brand-brown/90 flex items-center justify-between"
                        >
                          <span className="truncate pr-2">
                            <strong className="text-brand-dark font-bold">{it.quantity}x</strong>{' '}
                            {it.productName}
                          </span>
                          <span className="shrink-0 text-brand-brown/70 font-medium">
                            {formatCurrency(it.unitPrice * it.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Aviso sobre comandas no seleccionadas */}
          {unselectedCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">
                  {unselectedCount} comanda(s) no seleccionada(s)
                </span>
                <p className="text-[11px] text-amber-800/90 leading-tight mt-0.5">
                  Las comandas desmarcadas permanecerán abiertas en la mesa para ser cobradas más tarde.
                  La mesa seguirá en estado "Ocupada".
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer con Total y Botones */}
        <div className="p-4 border-t border-brand-secondary bg-brand-cream/70 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-brown uppercase tracking-wider">
              Total Seleccionado:
            </span>
            <span className="text-lg sm:text-xl font-black text-brand-dark font-mono">
              {formatCurrency(selectedTotal)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl border border-brand-secondary text-brand-dark font-bold text-xs hover:bg-brand-secondary/30 transition text-center"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={selectedOrders.length === 0}
              onClick={handleContinue}
              className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs shadow-soft flex items-center justify-center gap-2 transition-all ${
                selectedOrders.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20'
              }`}
            >
              <Banknote className="w-4 h-4 text-brand-yellow" />
              <span>Continuar al Cobro ({formatCurrency(selectedTotal)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
