import React, { useState } from 'react';
import { 
  Store, MapPin, Phone, Clock, Plus, Trash2, Edit3, Save, X, 
  ShieldCheck, Instagram, MessageCircle, CheckCircle2, Tag, Sparkles, User, Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth, getBonificationDaysRemaining, getBonificationProgress } from '../context/AuthContext';
import { Branch, StaffUser } from '../types';
import { formatCurrency } from '../utils/currency';

const EMPTY_BRANCH: Omit<Branch, 'id' | 'createdAt'> = {
  name: '', address: '', zone: '', phone: '', whatsapp: '', instagram: '',
  hours: '', badge: '', features: [], mapQuery: '', mapUrl: '', isActive: true,
};

export const SettingsPage: React.FC = () => {
  const { plan, branches, isLoadingBranches, addBranch, updateBranchData, deleteBranchData, staffUsers, addStaffUser, updateStaffUser, deleteStaffUser } = useApp();
  const { user } = useAuth();
  const sub = user?.subscription;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<Omit<Branch, 'id' | 'createdAt'>>(EMPTY_BRANCH);
  const [newFeature, setNewFeature] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Staff Users State
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState<Omit<StaffUser, 'id'>>({ name: '', role: 'cajero', email: '', status: 'active' });
  const [staffDeleteConfirm, setStaffDeleteConfirm] = useState<string | null>(null);

  // Business Data State
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [businessData, setBusinessData] = useState({
    name: user?.businessName || 'Hilos de Amor',
    currency: 'Peso Argentino ($ ARS)',
    email: user?.email || '',
  });

  const handleSaveBusiness = () => {
    // Here we'd save to backend
    setIsEditingBusiness(false);
  };

  const daysRemaining = sub ? getBonificationDaysRemaining(sub) : 0;
  const progress = sub ? getBonificationProgress(sub) : 0;

  const handleEdit = (branch: Branch) => {
    setEditingId(branch.id);
    setForm({
      name: branch.name, address: branch.address, zone: branch.zone,
      phone: branch.phone, whatsapp: branch.whatsapp, instagram: branch.instagram,
      hours: branch.hours, badge: branch.badge, features: [...branch.features],
      mapQuery: branch.mapQuery, mapUrl: branch.mapUrl || '', isActive: branch.isActive,
    });
    setShowAddForm(false);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim()) return;
    if (editingId) {
      await updateBranchData(editingId, form);
      setEditingId(null);
    } else {
      await addBranch(form);
      setShowAddForm(false);
    }
    setForm(EMPTY_BRANCH);
  };

  const handleDelete = async (id: string) => {
    await deleteBranchData(id);
    setDeleteConfirm(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setForm(EMPTY_BRANCH);
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setForm((f) => ({ ...f, features: [...f.features, newFeature.trim()] }));
    setNewFeature('');
  };

  const removeFeature = (idx: number) => {
    setForm((f) => ({ ...f, features: f.features.filter((_, i) => i !== idx) }));
  };

  const handleStaffSave = () => {
    if (!staffForm.name.trim() || !staffForm.email.trim()) return;
    if (editingStaffId) {
      updateStaffUser(editingStaffId, staffForm);
    } else {
      addStaffUser(staffForm);
    }
    setShowStaffForm(false);
    setEditingStaffId(null);
    setStaffForm({ name: '', role: 'cajero', email: '', password: '', status: 'active' });
  };

  const handleStaffEdit = (u: StaffUser) => {
    setEditingStaffId(u.id);
    setStaffForm({ name: u.name, role: u.role, email: u.email, password: u.password || '', status: u.status });
    setShowStaffForm(true);
  };

  const handleStaffDelete = (id: string) => {
    deleteStaffUser(id);
    setStaffDeleteConfirm(null);
  };

  const isEditing = editingId !== null || showAddForm;
  const isEditingStaff = editingStaffId !== null || showStaffForm;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="bg-brand-card p-6 rounded-2xl border border-brand-secondary shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-dark">Configuración General</h2>
          <p className="text-xs text-brand-brown/80 mt-1">
            Gestión de sucursales, datos del comercio y plan contratado.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> {sub?.planLabel || 'Plan Fidelización'}
          </span>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* ============================================================ */}
        {/* PLAN CONTRATADO */}
        {/* ============================================================ */}
        {sub && (
          <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" /> Plan Contratado
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-brand-bg p-3 rounded-xl border border-brand-secondary">
                <span className="text-[10px] font-bold text-brand-brown uppercase">Plan Activo</span>
                <p className="text-sm font-extrabold text-brand-dark">{sub.planLabel}</p>
                {sub.isBonified && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 mt-1 inline-block">
                    ✨ Bonificado
                  </span>
                )}
              </div>
              <div className="bg-brand-bg p-3 rounded-xl border border-brand-secondary">
                <span className="text-[10px] font-bold text-brand-brown uppercase">Pagás</span>
                <p className="text-sm font-extrabold text-brand-dark">{sub.payingPlanLabel}</p>
                <p className="text-[10px] text-brand-brown font-mono">{formatCurrency(sub.monthlyPrice)}/mes</p>
              </div>
              <div className="bg-brand-bg p-3 rounded-xl border border-brand-secondary">
                <span className="text-[10px] font-bold text-brand-brown uppercase">Bonificación</span>
                <p className="text-sm font-extrabold text-brand-dark">{daysRemaining} días restantes</p>
                <div className="w-full h-1.5 bg-brand-secondary/50 rounded-full overflow-hidden mt-1">
                  <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${100 - progress}%` }} />
                </div>
                <p className="text-[10px] text-brand-brown mt-0.5">Vence: {sub.endDate.split('-').reverse().join('/')}</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* DATOS DEL COMERCIO */}
        {/* ============================================================ */}
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
              <Store className="w-4 h-4 text-brand-brown" /> Datos del Comercio
            </h3>
            {isEditingBusiness ? (
              <button onClick={handleSaveBusiness} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-brown text-brand-card hover:bg-brand-dark flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" /> Guardar
              </button>
            ) : (
              <button onClick={() => setIsEditingBusiness(true)} className="text-xs font-bold px-3 py-1.5 rounded-lg border border-brand-secondary text-brand-dark hover:bg-brand-secondary/40 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> Editar
              </button>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-brand-dark mb-1">Nombre Comercial</label>
              <input
                type="text" disabled={!isEditingBusiness}
                value={businessData.name}
                onChange={e => setBusinessData({ ...businessData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark font-bold disabled:text-brand-brown/70"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-brand-dark mb-1">Moneda del Sistema</label>
                <input type="text" disabled={!isEditingBusiness} value={businessData.currency}
                  onChange={e => setBusinessData({ ...businessData, currency: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark font-bold disabled:text-brand-brown/70"
                />
              </div>
              <div>
                <label className="block font-bold text-brand-dark mb-1">Email de contacto</label>
                <input type="text" disabled={!isEditingBusiness} value={businessData.email}
                  onChange={e => setBusinessData({ ...businessData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark font-bold disabled:text-brand-brown/70"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PERSONAL Y ROLES */}
        {/* ============================================================ */}
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-brown" /> Personal y Roles ({staffUsers.length})
            </h3>
            {!isEditingStaff && (
              <button
                onClick={() => { setShowStaffForm(true); setStaffForm({ name: '', role: 'cajero', email: '', status: 'active' }); setEditingStaffId(null); }}
                className="py-1.5 px-3 rounded-lg bg-brand-brown text-brand-card font-bold text-xs flex items-center gap-1.5 hover:bg-brand-dark transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Usuario
              </button>
            )}
          </div>

          {showStaffForm && (
            <div className="bg-brand-bg rounded-xl border border-brand-secondary p-5 space-y-4 animate-fade-in">
              <h4 className="font-bold text-brand-dark text-sm border-b border-brand-secondary/60 pb-2">
                {editingStaffId ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1">Nombre Completo</label>
                  <input type="text" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} className="w-full px-3 py-2 text-xs rounded-xl border border-brand-secondary bg-brand-card" placeholder="Ej. Juan Pérez" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1">Email (Acceso)</label>
                  <input type="email" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} className="w-full px-3 py-2 text-xs rounded-xl border border-brand-secondary bg-brand-card" placeholder="juan@ejemplo.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1">Contraseña de Acceso</label>
                  <input type="password" value={staffForm.password || ''} onChange={e => setStaffForm({...staffForm, password: e.target.value})} className="w-full px-3 py-2 text-xs rounded-xl border border-brand-secondary bg-brand-card" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1">Rol</label>
                  <select value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value as any})} className="w-full px-3 py-2 text-xs rounded-xl border border-brand-secondary bg-brand-card font-bold">
                    <option value="admin">Administrador</option>
                    <option value="cajero">Cajero</option>
                    <option value="mozo">Mozo</option>
                    <option value="cocina">Cocina</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => { setShowStaffForm(false); setEditingStaffId(null); }} className="px-4 py-2 text-xs font-bold text-brand-brown hover:bg-brand-secondary/50 rounded-xl transition-colors">Cancelar</button>
                <button onClick={handleStaffSave} className="px-4 py-2 text-xs font-bold bg-brand-brown text-brand-card rounded-xl hover:bg-brand-dark transition-colors shadow-xs">Guardar Usuario</button>
              </div>
            </div>
          )}

          {!showStaffForm && (
            <div className="grid grid-cols-1 gap-2">
              {staffUsers.map(u => (
                <div key={u.id} className="bg-brand-bg rounded-xl border border-brand-secondary p-3 flex items-center justify-between hover:border-brand-brown/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-secondary/50 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-brand-brown" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-brand-dark flex items-center gap-2">
                        {u.name}
                        <span className="px-1.5 py-0.5 rounded uppercase text-[9px] font-bold bg-brand-card border border-brand-secondary/50 text-brand-brown">
                          {u.role}
                        </span>
                      </h4>
                      <p className="text-[11px] text-brand-brown/80">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleStaffEdit(u)} className="p-1.5 rounded-lg hover:bg-brand-secondary text-brand-brown transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                    {staffDeleteConfirm === u.id ? (
                       <div className="flex items-center gap-1">
                         <button onClick={() => handleStaffDelete(u.id)} className="p-1.5 rounded-lg bg-red-100 text-red-700 text-[10px] font-bold">Sí</button>
                         <button onClick={() => setStaffDeleteConfirm(null)} className="p-1.5 rounded-lg bg-brand-secondary text-brand-brown text-[10px] font-bold">No</button>
                       </div>
                    ) : (
                      <button onClick={() => setStaffDeleteConfirm(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-brand-brown hover:text-red-700 transition-colors" disabled={u.role === 'admin' && staffUsers.filter(x => x.role === 'admin').length === 1}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* SUCURSALES CRUD */}
        {/* ============================================================ */}
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-brown" /> Sucursales ({branches.length})
            </h3>
            {!isEditing && (
              <button
                onClick={() => { setShowAddForm(true); setForm(EMPTY_BRANCH); }}
                className="py-1.5 px-3 rounded-lg bg-brand-brown text-brand-card font-bold text-xs flex items-center gap-1.5 hover:bg-brand-dark transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Sucursal
              </button>
            )}
          </div>

          {isLoadingBranches ? (
            <div className="text-center py-8 text-brand-brown text-xs">Cargando sucursales...</div>
          ) : (
            <>
              {/* Branch Cards */}
              {branches.map((branch) => {
                const isThisEditing = editingId === branch.id;
                if (isThisEditing) return null; // Show form instead

                return (
                  <div key={branch.id} className="bg-brand-bg rounded-xl border border-brand-secondary p-4 space-y-2 hover:border-brand-brown/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-extrabold text-brand-dark">{branch.name}</h4>
                          {branch.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-brand-yellow text-brand-dark">
                              {branch.badge}
                            </span>
                          )}
                          {!branch.isActive && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                              Inactiva
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-brand-brown flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {branch.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleEdit(branch)}
                          className="p-1.5 rounded-lg hover:bg-brand-secondary text-brand-brown hover:text-brand-dark transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {deleteConfirm === branch.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(branch.id)} className="p-1.5 rounded-lg bg-red-100 text-red-700 text-[10px] font-bold">Sí</button>
                            <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-lg bg-brand-secondary text-brand-brown text-[10px] font-bold">No</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(branch.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-brand-brown hover:text-red-700 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                      <div className="flex items-center gap-1 text-brand-brown">
                        <Phone className="w-3 h-3" /> {branch.phone || '—'}
                      </div>
                      <div className="flex items-center gap-1 text-green-700">
                        <MessageCircle className="w-3 h-3" /> {branch.whatsapp || '—'}
                      </div>
                      <div className="flex items-center gap-1 text-pink-700">
                        <Instagram className="w-3 h-3" /> @{branch.instagram || '—'}
                      </div>
                      <div className="flex items-center gap-1 text-brand-brown">
                        <Clock className="w-3 h-3" /> {branch.hours || '—'}
                      </div>
                    </div>

                    {branch.features.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {branch.features.map((f, i) => (
                          <span key={i} className="text-[9px] font-bold bg-brand-card text-brand-brown px-2 py-0.5 rounded border border-brand-secondary">
                            ✓ {f}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {branch.mapUrl && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-brand-secondary h-32 relative">
                        <iframe 
                          src={branch.mapUrl} 
                          width="100%" 
                          height="100%" 
                          style={{ border: 0 }} 
                          allowFullScreen 
                          loading="lazy" 
                          referrerPolicy="no-referrer-when-downgrade"
                          title={`Mapa de ${branch.name}`}
                          className="absolute inset-0"
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add / Edit Form */}
              {isEditing && (
                <div className="bg-brand-bg rounded-xl border-2 border-brand-brown/30 p-5 space-y-4">
                  <h4 className="text-xs font-extrabold text-brand-dark">
                    {editingId ? '✏️ Editar Sucursal' : '➕ Nueva Sucursal'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-brand-dark mb-1">Nombre *</label>
                      <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Ej: Sucursal Peatonal Tucumán"
                        className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-white text-brand-dark font-medium focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-brand-dark mb-1">Dirección *</label>
                      <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                        placeholder="Ej: Tucumán 145 Sur"
                        className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-white text-brand-dark font-medium focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-brand-dark mb-1">Zona</label>
                      <input value={form.zone} onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))}
                        placeholder="Ej: Capital, San Juan"
                        className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-white text-brand-dark font-medium focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-brand-dark mb-1">Badge / Etiqueta</label>
                      <input value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                        placeholder="Ej: Casa Central, Drive-Thru"
                        className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-white text-brand-dark font-medium focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-brand-dark mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Teléfono</label>
                      <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="(264) 422-8900"
                        className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-white text-brand-dark font-medium focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-brand-dark mb-1 flex items-center gap-1"><MessageCircle className="w-3 h-3 text-green-600" /> WhatsApp</label>
                      <input value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                        placeholder="5492644228900 (sin + ni espacios)"
                        className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-white text-brand-dark font-medium focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-brand-dark mb-1 flex items-center gap-1"><Instagram className="w-3 h-3 text-pink-600" /> Instagram</label>
                      <input value={form.instagram} onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
                        placeholder="hilosdeamor.sj (sin @)"
                        className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-white text-brand-dark font-medium focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-brand-dark mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Horarios</label>
                      <input value={form.hours} onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                        placeholder="Lun-Sáb 07:00 a 22:00"
                        className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-white text-brand-dark font-medium focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-brand-dark mb-1">Consulta Google Maps</label>
                      <input value={form.mapQuery} onChange={(e) => setForm((f) => ({ ...f, mapQuery: e.target.value }))}
                        placeholder="Nombre de la sucursal + ciudad para buscar en Google Maps"
                        className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-white text-brand-dark font-medium focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-brand-dark mb-1">URL Iframe Google Maps (Opcional)</label>
                      <input value={form.mapUrl} onChange={(e) => setForm((f) => ({ ...f, mapUrl: e.target.value }))}
                        placeholder="Pega el src='...' del iframe de Google Maps aquí"
                        className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-white text-brand-dark font-medium focus:ring-2 focus:ring-brand-brown/30 focus:outline-none text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <label className="block font-bold text-brand-dark text-xs flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Características
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {form.features.map((f, i) => (
                        <span key={i} className="text-[10px] font-bold bg-brand-card text-brand-brown px-2 py-1 rounded-lg border border-brand-secondary flex items-center gap-1">
                          {f}
                          <button onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                        placeholder="Ej: WiFi, Pet Friendly, Estacionamiento"
                        className="flex-1 px-3 py-2 rounded-xl border border-brand-secondary bg-white text-xs text-brand-dark font-medium focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
                      />
                      <button onClick={addFeature} className="py-2 px-3 rounded-xl bg-brand-secondary text-brand-dark text-xs font-bold hover:bg-brand-secondary/80">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                      className={`w-9 h-5 rounded-full transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-gray-300'} relative`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition-transform ${form.isActive ? 'left-4' : 'left-0.5'}`} />
                    </button>
                    <span className="text-xs font-bold text-brand-dark">{form.isActive ? 'Activa' : 'Inactiva'}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-brand-secondary/60">
                    <button
                      onClick={handleSave}
                      disabled={!form.name.trim() || !form.address.trim()}
                      className="py-2 px-4 rounded-xl bg-brand-brown text-brand-card font-bold text-xs flex items-center gap-1.5 hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" /> Guardar
                    </button>
                    <button
                      onClick={handleCancel}
                      className="py-2 px-4 rounded-xl border border-brand-secondary text-brand-brown font-bold text-xs hover:bg-brand-secondary/40 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {branches.length === 0 && !isEditing && (
                <div className="text-center py-8 text-brand-brown/60 text-xs space-y-2">
                  <MapPin className="w-8 h-8 mx-auto text-brand-secondary" />
                  <p className="font-bold">No hay sucursales configuradas</p>
                  <p>Agregá tu primera sucursal para que aparezca en el sitio web.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
