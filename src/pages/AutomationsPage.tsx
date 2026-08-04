import React, { useState } from 'react';
import { Zap, Play, Pause, ArrowRight, CheckCircle2, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Automation } from '../types';

export const AutomationsPage: React.FC = () => {
  const { automations, toggleAutomation, addAutomation, updateAutomationData, deleteAutomationData, isLoadingAutomations } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    condition: '',
    segment: '',
    message: '',
    status: 'activa' as Automation['status'],
    nextRun: 'En tiempo real',
    estimatedRecipients: 10,
    executedCount: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingAutomation) {
      await updateAutomationData(editingAutomation.id, formData);
      setEditingAutomation(null);
    } else {
      await addAutomation(formData);
    }
    setIsModalOpen(false);
    setFormData({ name: '', condition: '', segment: '', message: '', status: 'activa', nextRun: 'En tiempo real', estimatedRecipients: 10, executedCount: 0 });
  };

  const handleEdit = (automation: Automation) => {
    setEditingAutomation(automation);
    setFormData({
      name: automation.name,
      condition: automation.condition,
      segment: automation.segment,
      message: automation.message,
      status: automation.status,
      nextRun: automation.nextRun,
      estimatedRecipients: automation.estimatedRecipients,
      executedCount: automation.executedCount,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteAutomationData(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Banner */}
      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-brand-green/30 px-2 py-0.5 rounded">
              Plan Fidelización
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-brand-dark">Automatizaciones de Marketing</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Flujos automáticos activados por eventos (Registro, Cumpleaños, Inactividad, Saldo de Puntos)
          </p>
        </div>

        <button
          onClick={() => {
            setEditingAutomation(null);
            setFormData({ name: '', condition: '', segment: '', message: '', status: 'activa', nextRun: 'En tiempo real', estimatedRecipients: 10, executedCount: 0 });
            setIsModalOpen(true);
          }}
          className="py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-all duration-200 shadow-soft flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-brand-yellow" />
          Nueva automatización
        </button>
      </div>

      {/* Loading State */}
      {isLoadingAutomations && (
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-8 shadow-soft text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-brand-secondary/40 rounded w-1/3 mx-auto"></div>
            <div className="h-3 bg-brand-secondary/30 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-xs text-brand-brown/70 mt-3">Cargando automatizaciones...</p>
        </div>
      )}

      {/* Automations Grid */}
      {!isLoadingAutomations && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automations.map((aut) => (
            <div
              key={aut.id}
              className="bg-brand-card rounded-2xl border border-brand-secondary p-5 shadow-soft space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown bg-brand-cream px-2 py-0.5 rounded border border-brand-secondary/60">
                    {aut.segment}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                      aut.status === 'activa'
                        ? 'bg-brand-green/30 text-emerald-950 border-brand-green'
                        : 'bg-brand-yellow/40 text-brand-dark border-brand-yellow'
                    }`}
                  >
                    {aut.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-brand-dark">{aut.name}</h3>
                <p className="text-[11px] text-brand-brown/80">⚡ Disparador: {aut.condition}</p>

                <div className="p-3 bg-brand-bg rounded-xl border border-brand-secondary/60 text-brand-dark leading-relaxed">
                  "{aut.message}"
                </div>
              </div>

              <div className="pt-3 border-t border-brand-secondary/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] text-brand-brown font-bold">
                    Ejecutados: {aut.executedCount} envíos
                  </span>

                  <button
                    onClick={() => toggleAutomation(aut.id)}
                    className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors ${
                      aut.status === 'activa'
                        ? 'bg-brand-bg text-brand-dark hover:bg-brand-secondary/40 border border-brand-secondary'
                        : 'bg-brand-brown text-brand-card hover:bg-brand-dark'
                    }`}
                  >
                    {aut.status === 'activa' ? (
                      <>
                        <Pause className="w-3.5 h-3.5" /> Pausar
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-brand-yellow" /> Activar
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleEdit(aut)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-brand-bg border border-brand-secondary text-brand-dark font-bold text-[11px] hover:bg-brand-secondary/40 transition-colors flex items-center justify-center gap-1"
                  >
                    <Pencil className="w-3 h-3" /> Editar
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(aut.id)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-red-50 border border-red-200 text-red-700 font-bold text-[11px] hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create/Edit Automation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 max-w-md w-full shadow-soft-lg space-y-4">
            <div className="flex items-center justify-between border-b border-brand-secondary pb-3">
              <h3 className="text-base font-bold text-brand-dark">
                {editingAutomation ? 'Editar Automatización' : 'Nueva Automatización'}
              </h3>
              <button
                onClick={() => { setIsModalOpen(false); setEditingAutomation(null); }}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-brand-dark mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Bienvenida tras el Registro"
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Condición / Disparador</label>
                <input
                  type="text"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="Ej. Cliente se registra en el menú digital"
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Segmento</label>
                  <input
                    type="text"
                    value={formData.segment}
                    onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                    placeholder="Ej. Nuevos Clientes"
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Próxima ejecución</label>
                  <input
                    type="text"
                    value={formData.nextRun}
                    onChange={(e) => setFormData({ ...formData, nextRun: e.target.value })}
                    placeholder="Ej. En tiempo real"
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Mensaje</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Mensaje de la automatización..."
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-brown text-brand-card font-bold hover:bg-brand-dark transition-colors"
                >
                  {editingAutomation ? 'Guardar cambios' : 'Crear automatización'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingAutomation(null); }}
                  className="py-2.5 px-4 rounded-xl border border-brand-secondary font-bold text-brand-dark hover:bg-brand-secondary/30"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 max-w-sm w-full shadow-soft-lg space-y-4">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <h3 className="text-base font-bold text-brand-dark">¿Eliminar automatización?</h3>
            </div>
            <p className="text-xs text-brand-brown">
              Esta acción eliminará el flujo automático permanentemente.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors text-xs"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-brand-secondary font-bold text-brand-dark hover:bg-brand-secondary/30 text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
