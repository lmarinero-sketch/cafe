import React, { useState, useEffect, useMemo } from 'react';
import {
  Receipt,
  FileText,
  Download,
  Eye,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  UploadCloud,
  X,
  Calendar,
  DollarSign,
  ShieldCheck,
  Building2,
  Search,
  ArrowUpRight,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/currency';
import {
  DeveloperInvoice,
  InvoiceStatus,
  InvoiceCategory,
} from '../../types';
import {
  canManageInvoices,
  getDeveloperInvoices,
  createDeveloperInvoice,
  updateDeveloperInvoice,
  deleteDeveloperInvoice,
  uploadInvoiceFile,
  DEVELOPER_BANK_DETAILS,
} from '../../services/invoices.service';

interface FormState {
  invoiceNumber: string;
  title: string;
  category: InvoiceCategory;
  amount: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  notes: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'pdf' | 'image';
}

const EMPTY_FORM: FormState = {
  invoiceNumber: '',
  title: '',
  category: 'abono_mensual',
  amount: '',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: 'pending',
  notes: '',
  fileUrl: '',
  fileName: '',
  fileType: 'pdf',
};

export const DeveloperInvoicesTab: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Permission check: only lmarinero / lucasmmarinero can upload or edit
  const isDevAdmin = useMemo(() => canManageInvoices(user), [user]);

  const [invoices, setInvoices] = useState<DeveloperInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | InvoiceStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | InvoiceCategory>('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bank Info Modal
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Preview Modal
  const [previewInvoice, setPreviewInvoice] = useState<DeveloperInvoice | null>(null);

  // Delete Confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load invoices
  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await getDeveloperInvoices();
      setInvoices(data);
    } catch (err) {
      console.error('Error loading invoices:', err);
      showToast('Error', 'No se pudieron cargar las facturas', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          inv.title.toLowerCase().includes(q) ||
          inv.invoiceNumber.toLowerCase().includes(q) ||
          (inv.notes && inv.notes.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && inv.status !== selectedStatus) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && inv.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [invoices, searchQuery, selectedStatus, selectedCategory]);

  // Summary Metrics
  const metrics = useMemo<{
    totalAbonado: number;
    totalPendiente: number;
    nextDue: string | null;
    totalCount: number;
  }>(() => {
    let totalAbonado = 0;
    let totalPendiente = 0;
    let nextDue: string | null = null;

    invoices.forEach((inv) => {
      if (inv.status === 'paid') {
        totalAbonado += inv.amount;
      } else {
        totalPendiente += inv.amount;
        if (inv.dueDate) {
          if (!nextDue || inv.dueDate < nextDue) {
            nextDue = inv.dueDate;
          }
        }
      }
    });

    return {
      totalAbonado,
      totalPendiente,
      nextDue,
      totalCount: invoices.length,
    };
  }, [invoices]);

  // Form Handlers (Developer Only)
  const handleOpenCreate = () => {
    if (!isDevAdmin) {
      showToast('Acceso Denegado', 'Solo el usuario desarrollador (Lucas Marinero) puede subir facturas.', 'error');
      return;
    }
    // Auto-generate invoice number suggestion
    const nextNum = invoices.length + 1;
    const padded = String(nextNum).padStart(4, '0');
    setFormData({
      ...EMPTY_FORM,
      invoiceNumber: `FAC-2026-${padded}`,
    });
    setSelectedFile(null);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (inv: DeveloperInvoice) => {
    if (!isDevAdmin) {
      showToast('Acceso Denegado', 'Solo el usuario desarrollador puede editar facturas.', 'error');
      return;
    }
    setFormData({
      invoiceNumber: inv.invoiceNumber,
      title: inv.title,
      category: inv.category,
      amount: String(inv.amount),
      issueDate: inv.issueDate,
      dueDate: inv.dueDate || '',
      status: inv.status,
      notes: inv.notes || '',
      fileUrl: inv.fileUrl || '',
      fileName: inv.fileName || '',
      fileType: inv.fileType || 'pdf',
    });
    setSelectedFile(null);
    setEditingId(inv.id);
    setIsFormOpen(true);
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDevAdmin) return;

    if (!formData.invoiceNumber.trim() || !formData.title.trim() || !formData.amount.trim()) {
      showToast('Campos requeridos', 'Por favor completá los campos obligatorios (*).', 'error');
      return;
    }

    const numericAmount = parseFloat(formData.amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      showToast('Monto inválido', 'Ingresá un monto numérico válido.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let filePayload: { fileUrl?: string; fileName?: string; fileType?: 'pdf' | 'image' } = {
        fileUrl: formData.fileUrl,
        fileName: formData.fileName,
        fileType: formData.fileType,
      };

      if (selectedFile) {
        const uploadRes = await uploadInvoiceFile(selectedFile);
        filePayload = {
          fileUrl: uploadRes.url,
          fileName: uploadRes.fileName,
          fileType: uploadRes.fileType,
        };
      }

      if (editingId) {
        await updateDeveloperInvoice(editingId, {
          invoiceNumber: formData.invoiceNumber.trim(),
          title: formData.title.trim(),
          category: formData.category,
          amount: numericAmount,
          issueDate: formData.issueDate,
          dueDate: formData.dueDate || undefined,
          status: formData.status,
          notes: formData.notes.trim(),
          ...filePayload,
          paidAt: formData.status === 'paid' ? new Date().toISOString() : undefined,
        });
        showToast('Factura actualizada', 'Los cambios se guardaron correctamente.', 'success');
      } else {
        await createDeveloperInvoice({
          invoiceNumber: formData.invoiceNumber.trim(),
          title: formData.title.trim(),
          category: formData.category,
          amount: numericAmount,
          issueDate: formData.issueDate,
          dueDate: formData.dueDate || undefined,
          status: formData.status,
          notes: formData.notes.trim(),
          ...filePayload,
          paidAt: formData.status === 'paid' ? new Date().toISOString() : undefined,
          uploadedBy: user?.name || 'Lucas Marinero',
        });
        showToast('Factura emitida', 'La nueva factura fue cargada con éxito.', 'success');
      }

      setIsFormOpen(false);
      setEditingId(null);
      setSelectedFile(null);
      await loadInvoices();
    } catch (err) {
      console.error('Error saving invoice:', err);
      showToast('Error', 'No se pudo guardar la factura.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (inv: DeveloperInvoice) => {
    if (!isDevAdmin) {
      showToast('Acceso Denegado', 'Solo el desarrollador puede cambiar el estado de la factura.', 'error');
      return;
    }
    const nextStatus: InvoiceStatus = inv.status === 'paid' ? 'pending' : 'paid';
    try {
      await updateDeveloperInvoice(inv.id, {
        status: nextStatus,
        paidAt: nextStatus === 'paid' ? new Date().toISOString() : undefined,
      });
      showToast(
        'Estado actualizado',
        nextStatus === 'paid' ? 'Marcada como abonada.' : 'Marcada como pendiente.',
        'info'
      );
      await loadInvoices();
    } catch (err) {
      showToast('Error', 'No se pudo cambiar el estado.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!isDevAdmin) return;
    try {
      await deleteDeveloperInvoice(id);
      showToast('Factura eliminada', 'La factura fue retirada del sistema.', 'info');
      setDeleteConfirmId(null);
      await loadInvoices();
    } catch (err) {
      showToast('Error', 'No se pudo eliminar la factura.', 'error');
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast('Copiado', `${fieldName} copiado al portapapeles.`, 'success');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const getCategoryLabel = (cat: InvoiceCategory) => {
    switch (cat) {
      case 'abono_mensual':
        return 'Abono Mensual';
      case 'desarrollo':
        return 'Desarrollo & Módulos';
      case 'soporte':
        return 'Soporte & Mantenimiento';
      case 'infraestructura':
        return 'Infraestructura & Cloud';
      default:
        return 'Otro';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ============================================================ */}
      {/* BANNER INFORMATIVO DE PERMISOS */}
      {/* ============================================================ */}
      {isDevAdmin ? (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-5 border border-blue-800 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm tracking-wide text-white">
                  Modo Administrador Desarrollador Activo
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/30 text-blue-200 border border-blue-400/40">
                  {user?.email || 'Lucas Marinero'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                  ☁️ Bucket: invoices
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-1 max-w-2xl">
                Tenés habilitados los permisos exclusivos para <strong>cargar nuevas facturas</strong>, subir comprobantes en PDF/imagen al bucket de Supabase, ajustar montos, cambiar estados de pago y actualizar detalles para el cliente.
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenCreate}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-white text-blue-950 font-extrabold text-xs flex items-center gap-2 hover:bg-blue-50 shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Subir Nueva Factura
          </button>
        </div>
      ) : (
        <div className="bg-brand-card rounded-2xl p-5 border border-brand-secondary shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-brand-secondary/40 text-brand-brown shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-brand-dark">
                  Facturación del Servicio & Plataforma
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-bg text-brand-brown border border-brand-secondary">
                  Modo Consulta (Solo Lectura)
                </span>
              </div>
              <p className="text-xs text-brand-brown/80 mt-1 max-w-2xl">
                Comprobantes oficiales y abonos emitidos por el equipo de desarrollo (<strong>Grow Labs</strong>). Podés consultar períodos, descargar tus facturas y ver los datos bancarios para realizar transferencias.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBankModalOpen(true)}
            className="shrink-0 px-4 py-2 rounded-xl bg-brand-bg hover:bg-brand-secondary/50 text-brand-dark font-bold text-xs border border-brand-secondary flex items-center gap-1.5 transition-colors"
          >
            <Building2 className="w-4 h-4 text-brand-brown" /> Datos de Transferencia
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* KPIS / RESUMEN */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-brand-card p-4 rounded-xl border border-brand-secondary shadow-soft">
          <span className="text-[10px] font-bold text-brand-brown uppercase tracking-wider">
            Total Abonado Histórico
          </span>
          <p className="text-lg font-extrabold text-emerald-800 mt-1">
            {formatCurrency(metrics.totalAbonado)}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Facturas saldadas
          </p>
        </div>

        <div className="bg-brand-card p-4 rounded-xl border border-brand-secondary shadow-soft">
          <span className="text-[10px] font-bold text-brand-brown uppercase tracking-wider">
            Pendiente de Pago
          </span>
          <p className="text-lg font-extrabold text-amber-800 mt-1">
            {formatCurrency(metrics.totalPendiente)}
          </p>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Saldo a regularizar
          </p>
        </div>

        <div className="bg-brand-card p-4 rounded-xl border border-brand-secondary shadow-soft">
          <span className="text-[10px] font-bold text-brand-brown uppercase tracking-wider">
            Próximo Vencimiento
          </span>
          <p className="text-lg font-extrabold text-brand-dark mt-1">
            {metrics.nextDue ? (metrics.nextDue as string).split('-').reverse().join('/') : 'Al día'}
          </p>
          <p className="text-[11px] text-brand-brown font-medium mt-0.5">
            {metrics.nextDue ? 'Período en curso' : 'Sin pagos pendientes'}
          </p>
        </div>

        <div className="bg-brand-card p-4 rounded-xl border border-brand-secondary shadow-soft">
          <span className="text-[10px] font-bold text-brand-brown uppercase tracking-wider">
            Comprobantes Emitidos
          </span>
          <p className="text-lg font-extrabold text-brand-dark mt-1">
            {metrics.totalCount} {metrics.totalCount === 1 ? 'Factura' : 'Facturas'}
          </p>
          <button
            onClick={() => setIsBankModalOpen(true)}
            className="text-[11px] text-brand-brown hover:text-brand-dark font-bold underline mt-0.5 flex items-center gap-1"
          >
            Ver CBU y datos de pago <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FILTROS Y BÚSQUEDA */}
      {/* ============================================================ */}
      <div className="bg-brand-card rounded-2xl border border-brand-secondary p-4 shadow-soft space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-brand-brown/60 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nro de factura, concepto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Status pills */}
            <div className="flex items-center gap-1 bg-brand-bg p-1 rounded-xl border border-brand-secondary text-xs">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  selectedStatus === 'all'
                    ? 'bg-brand-card text-brand-dark shadow-xs'
                    : 'text-brand-brown hover:text-brand-dark'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setSelectedStatus('pending')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  selectedStatus === 'pending'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'text-brand-brown hover:text-amber-800'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setSelectedStatus('paid')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  selectedStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'text-brand-brown hover:text-emerald-800'
                }`}
              >
                Pagadas
              </button>
            </div>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark font-medium focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
            >
              <option value="all">Todas las categorías</option>
              <option value="abono_mensual">Abono Mensual</option>
              <option value="desarrollo">Desarrollo & Módulos</option>
              <option value="soporte">Soporte & Mant.</option>
              <option value="infraestructura">Infraestructura</option>
            </select>

            <button
              onClick={loadInvoices}
              title="Recargar facturas"
              className="p-2 rounded-xl border border-brand-secondary bg-brand-bg text-brand-brown hover:text-brand-dark hover:bg-brand-secondary/40 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* LISTA DE FACTURAS */}
      {/* ============================================================ */}
      {isLoading ? (
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-12 text-center text-brand-brown text-xs space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-brown/70" />
          <p className="font-bold">Cargando comprobantes...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-brand-card rounded-2xl border border-brand-secondary p-12 text-center text-brand-brown space-y-3">
          <Receipt className="w-10 h-10 mx-auto text-brand-secondary" />
          <h4 className="font-bold text-sm text-brand-dark">No se encontraron facturas</h4>
          <p className="text-xs max-w-sm mx-auto text-brand-brown/80">
            {searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all'
              ? 'Probá ajustando los filtros de búsqueda o estado.'
              : 'Todavía no hay comprobantes cargados en el sistema.'}
          </p>
          {isDevAdmin && (
            <button
              onClick={handleOpenCreate}
              className="mt-2 px-4 py-2 rounded-xl bg-brand-brown text-brand-card text-xs font-bold hover:bg-brand-dark inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Subir la primera factura
            </button>
          )}
        </div>
      ) : (
        <div className="bg-brand-card rounded-2xl border border-brand-secondary shadow-soft overflow-hidden">
          <div className="divide-y divide-brand-secondary/60">
            {filteredInvoices.map((inv) => {
              const isPaid = inv.status === 'paid';
              const isOverdue = inv.status === 'overdue';

              return (
                <div
                  key={inv.id}
                  className="p-5 hover:bg-brand-bg/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isOverdue
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-brand-dark bg-brand-bg px-2 py-0.5 rounded-md border border-brand-secondary">
                          {inv.invoiceNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-secondary/40 text-brand-brown">
                          {getCategoryLabel(inv.category)}
                        </span>
                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : isOverdue
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {isPaid ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Pagada
                            </>
                          ) : isOverdue ? (
                            <>
                              <AlertCircle className="w-3 h-3" /> Vencida
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" /> Pendiente
                            </>
                          )}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-brand-dark truncate">{inv.title}</h4>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-brand-brown">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Emisión: {inv.issueDate.split('-').reverse().join('/')}
                        </span>
                        {inv.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Vence: {inv.dueDate.split('-').reverse().join('/')}
                          </span>
                        )}
                        {inv.paidAt && (
                          <span className="text-emerald-700 font-medium">
                            Abonada el {inv.paidAt.split('T')[0].split('-').reverse().join('/')}
                          </span>
                        )}
                        {inv.fileName && (
                          <span className="text-indigo-700 font-medium flex items-center gap-1">
                            📎 {inv.fileName}
                          </span>
                        )}
                      </div>

                      {inv.notes && (
                        <p className="text-[11px] text-brand-brown/80 italic mt-0.5 line-clamp-1">
                          "{inv.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-brand-secondary/40">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold text-brand-brown uppercase">Total</span>
                      <p className="text-base font-extrabold text-brand-dark">
                        {formatCurrency(inv.amount)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* View / Download File button (Available to ALL users) */}
                      {inv.fileUrl ? (
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          className="p-2 rounded-xl bg-brand-bg hover:bg-brand-secondary/50 text-brand-dark border border-brand-secondary text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Ver o descargar comprobante adjunto"
                        >
                          <Eye className="w-4 h-4 text-brand-brown" />
                          <span className="hidden sm:inline">Comprobante</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          className="p-2 rounded-xl bg-brand-bg hover:bg-brand-secondary/50 text-brand-dark border border-brand-secondary text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Ver detalle del comprobante"
                        >
                          <Eye className="w-4 h-4 text-brand-brown" />
                          <span className="hidden sm:inline">Detalle</span>
                        </button>
                      )}

                      {/* Developer Exclusive Actions */}
                      {isDevAdmin && (
                        <>
                          {/* Quick Toggle Status */}
                          <button
                            onClick={() => handleToggleStatus(inv)}
                            className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                              isPaid
                                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            }`}
                            title={isPaid ? 'Marcar como Pendiente' : 'Marcar como Pagada'}
                          >
                            {isPaid ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEdit(inv)}
                            className="p-2 rounded-xl hover:bg-brand-secondary text-brand-brown hover:text-brand-dark transition-colors border border-transparent hover:border-brand-secondary"
                            title="Editar factura"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          {deleteConfirmId === inv.id ? (
                            <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-200">
                              <button
                                onClick={() => handleDelete(inv.id)}
                                className="px-2 py-1 rounded-lg bg-red-600 text-white text-[10px] font-bold hover:bg-red-700"
                              >
                                Sí, borrar
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 rounded-lg bg-white text-brand-dark text-[10px] font-bold border border-brand-secondary"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(inv.id)}
                              className="p-2 rounded-xl hover:bg-red-50 text-brand-brown hover:text-red-700 transition-colors"
                              title="Eliminar factura"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: SUBIR / EDITAR FACTURA (SOLO DESARROLLADOR) */}
      {/* ============================================================ */}
      {isFormOpen && isDevAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-brand-secondary/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-900">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-brand-dark">
                    {editingId ? 'Editar Factura de Desarrollo' : 'Cargar Nueva Factura'}
                  </h3>
                  <p className="text-[11px] text-brand-brown">
                    Emisión exclusiva para {user?.businessName || 'Hilos de Amor'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-brand-brown hover:bg-brand-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nro de Factura */}
                <div>
                  <label className="block font-bold text-brand-dark mb-1">
                    Número de Comprobante *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    placeholder="Ej: FAC-2026-0005"
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark font-mono font-bold focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Categoría *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark font-bold focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
                  >
                    <option value="abono_mensual">Abono Mensual</option>
                    <option value="desarrollo">Desarrollo & Módulos</option>
                    <option value="soporte">Soporte & Mantenimiento</option>
                    <option value="infraestructura">Infraestructura & Cloud</option>
                    <option value="otro">Otro concepto</option>
                  </select>
                </div>
              </div>

              {/* Título / Concepto */}
              <div>
                <label className="block font-bold text-brand-dark mb-1">
                  Concepto / Detalle del Servicio *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Abono Mensual Plataforma — Abril 2026"
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark font-bold focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Monto */}
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Monto ($ ARS) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 font-bold text-brand-brown">$</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="150000"
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark font-mono font-extrabold focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Fecha Emisión */}
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Fecha Emisión *</label>
                  <input
                    type="date"
                    required
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark font-medium focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
                  />
                </div>

                {/* Fecha Vencimiento */}
                <div>
                  <label className="block font-bold text-brand-dark mb-1">Vencimiento</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark font-medium focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
                  />
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block font-bold text-brand-dark mb-1">Estado de Pago</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'pending' })}
                    className={`py-2 px-3 rounded-xl font-bold border text-xs flex items-center justify-center gap-1.5 transition-colors ${
                      formData.status === 'pending'
                        ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                        : 'bg-brand-bg border-brand-secondary text-brand-brown'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" /> Pendiente
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'paid' })}
                    className={`py-2 px-3 rounded-xl font-bold border text-xs flex items-center justify-center gap-1.5 transition-colors ${
                      formData.status === 'paid'
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900 shadow-xs'
                        : 'bg-brand-bg border-brand-secondary text-brand-brown'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pagada
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'overdue' })}
                    className={`py-2 px-3 rounded-xl font-bold border text-xs flex items-center justify-center gap-1.5 transition-colors ${
                      formData.status === 'overdue'
                        ? 'bg-rose-100 border-rose-300 text-rose-900 shadow-xs'
                        : 'bg-brand-bg border-brand-secondary text-brand-brown'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> Vencida
                  </button>
                </div>
              </div>

              {/* Adjunto File Upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-brand-dark">
                    Adjuntar Factura / Comprobante (PDF o Imagen)
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                    ☁️ Supabase Bucket: invoices
                  </span>
                </div>
                <div className="border-2 border-dashed border-brand-secondary rounded-xl p-4 text-center bg-brand-bg/50 hover:bg-brand-bg transition-colors relative">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1.5 pointer-events-none">
                    <UploadCloud className="w-6 h-6 mx-auto text-brand-brown/70" />
                    {selectedFile ? (
                      <div className="text-center">
                        <p className="font-extrabold text-blue-900 text-xs sm:text-sm">
                          📄 {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-blue-700 font-medium">
                          {(selectedFile.size / 1024).toFixed(1)} KB • Se subirá directamente al bucket cloud
                        </p>
                      </div>
                    ) : formData.fileName ? (
                      <div className="text-center">
                        <p className="font-medium text-brand-brown text-xs sm:text-sm">
                          Archivo en bucket: <span className="font-bold text-brand-dark">{formData.fileName}</span>
                        </p>
                        <p className="text-[11px] text-brand-brown/70">
                          Haz clic o arrastrá para reemplazarlo
                        </p>
                      </div>
                    ) : (
                      <p className="text-brand-brown text-xs sm:text-sm">
                        Haz clic o arrastrá el PDF de la factura emitida
                      </p>
                    )}
                    <p className="text-[10px] text-brand-brown/60">
                      Formatos soportados: PDF, PNG, JPG, WebP (Límite 20 MB en bucket)
                    </p>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block font-bold text-brand-dark mb-1">
                  Notas / Instrucciones de Transferencia
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ej: Transferir a CBU Grow Labs antes del 10. Factura A/B disponible."
                  className="w-full px-3 py-2 rounded-xl border border-brand-secondary bg-brand-bg text-brand-dark font-medium focus:ring-2 focus:ring-brand-brown/30 focus:outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-secondary/60">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-brand-brown hover:bg-brand-secondary/50 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-extrabold bg-blue-950 text-white rounded-xl hover:bg-blue-900 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-soft"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> {editingId ? 'Guardar Cambios' : 'Emitir Factura'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: PREVIEW DE COMPROBANTE O DETALLE */}
      {/* ============================================================ */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-brand-secondary/60 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand-brown" />
                <div>
                  <h3 className="font-extrabold text-sm text-brand-dark">
                    Comprobante {previewInvoice.invoiceNumber}
                  </h3>
                  <p className="text-[11px] text-brand-brown">{previewInvoice.title}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewInvoice(null)}
                className="p-1.5 rounded-lg text-brand-brown hover:bg-brand-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-brand-bg p-2.5 rounded-xl border border-brand-secondary">
                <span className="text-[10px] font-bold text-brand-brown uppercase">Monto</span>
                <p className="font-extrabold text-brand-dark text-sm mt-0.5">
                  {formatCurrency(previewInvoice.amount)}
                </p>
              </div>
              <div className="bg-brand-bg p-2.5 rounded-xl border border-brand-secondary">
                <span className="text-[10px] font-bold text-brand-brown uppercase">Emisión</span>
                <p className="font-bold text-brand-dark text-xs mt-0.5">
                  {previewInvoice.issueDate.split('-').reverse().join('/')}
                </p>
              </div>
              <div className="bg-brand-bg p-2.5 rounded-xl border border-brand-secondary">
                <span className="text-[10px] font-bold text-brand-brown uppercase">Vencimiento</span>
                <p className="font-bold text-brand-dark text-xs mt-0.5">
                  {previewInvoice.dueDate
                    ? previewInvoice.dueDate.split('-').reverse().join('/')
                    : 'Sin fecha'}
                </p>
              </div>
              <div className="bg-brand-bg p-2.5 rounded-xl border border-brand-secondary">
                <span className="text-[10px] font-bold text-brand-brown uppercase">Estado</span>
                <p
                  className={`font-extrabold text-xs mt-0.5 ${
                    previewInvoice.status === 'paid'
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  {previewInvoice.status === 'paid' ? 'Pagada' : 'Pendiente'}
                </p>
              </div>
            </div>

            {/* Notes */}
            {previewInvoice.notes && (
              <div className="bg-brand-bg p-3 rounded-xl border border-brand-secondary text-xs">
                <span className="font-bold text-brand-dark block mb-0.5">Observaciones:</span>
                <p className="text-brand-brown">{previewInvoice.notes}</p>
              </div>
            )}

            {/* File Container */}
            {previewInvoice.fileUrl ? (
              <div className="space-y-2">
                <span className="font-bold text-brand-dark text-xs block">
                  Documento Adjunto ({previewInvoice.fileName || 'Comprobante'}):
                </span>
                <div className="border border-brand-secondary rounded-xl overflow-hidden bg-brand-bg p-2 min-h-[250px] flex items-center justify-center">
                  {previewInvoice.fileType === 'image' || previewInvoice.fileUrl.startsWith('data:image') ? (
                    <img
                      src={previewInvoice.fileUrl}
                      alt="Comprobante"
                      className="max-h-[400px] w-auto mx-auto object-contain rounded-lg"
                    />
                  ) : (
                    <iframe
                      src={previewInvoice.fileUrl}
                      title="Vista previa PDF"
                      className="w-full h-80 rounded-lg border border-brand-secondary"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-brand-bg rounded-xl border border-brand-secondary space-y-2">
                <FileText className="w-8 h-8 mx-auto text-brand-brown/50" />
                <p className="text-xs text-brand-brown">
                  Esta factura no tiene archivo PDF adjunto cargado.
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-brand-secondary/60">
              <button
                onClick={() => setIsBankModalOpen(true)}
                className="text-xs text-brand-brown hover:text-brand-dark font-bold underline flex items-center gap-1"
              >
                <Building2 className="w-3.5 h-3.5" /> Datos bancarios para transferir
              </button>

              <div className="flex items-center gap-2">
                {previewInvoice.fileUrl && (
                  <a
                    href={previewInvoice.fileUrl}
                    download={previewInvoice.fileName || `factura_${previewInvoice.invoiceNumber}.pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-brand-brown text-brand-card font-bold text-xs flex items-center gap-1.5 hover:bg-brand-dark transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Descargar Archivo
                  </a>
                )}
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="px-4 py-2 rounded-xl border border-brand-secondary text-brand-brown font-bold text-xs hover:bg-brand-secondary/40 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: DATOS BANCARIOS DE TRANSFERENCIA */}
      {/* ============================================================ */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-brand-card rounded-2xl border border-brand-secondary max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-brand-secondary/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand-bg border border-brand-secondary text-brand-brown">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-brand-dark">
                    Datos para Transferencia Bancaria
                  </h3>
                  <p className="text-[11px] text-brand-brown">
                    Pago de abonos de software y desarrollo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="p-1.5 rounded-lg text-brand-brown hover:bg-brand-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Alias */}
              <div className="bg-brand-bg p-3 rounded-xl border border-brand-secondary flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand-brown uppercase block">
                    Alias de Pago
                  </span>
                  <span className="font-mono font-extrabold text-brand-dark text-sm">
                    {DEVELOPER_BANK_DETAILS.alias}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(DEVELOPER_BANK_DETAILS.alias, 'Alias')}
                  className="p-2 rounded-lg bg-brand-card hover:bg-brand-secondary/60 text-brand-brown border border-brand-secondary transition-colors"
                  title="Copiar Alias"
                >
                  {copiedField === 'Alias' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* CBU */}
              <div className="bg-brand-bg p-3 rounded-xl border border-brand-secondary flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand-brown uppercase block">
                    CBU / CVU
                  </span>
                  <span className="font-mono font-bold text-brand-dark text-xs break-all">
                    {DEVELOPER_BANK_DETAILS.cbu}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(DEVELOPER_BANK_DETAILS.cbu, 'CBU')}
                  className="p-2 rounded-lg bg-brand-card hover:bg-brand-secondary/60 text-brand-brown border border-brand-secondary transition-colors shrink-0 ml-2"
                  title="Copiar CBU"
                >
                  {copiedField === 'CBU' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Details */}
              <div className="bg-brand-bg p-3 rounded-xl border border-brand-secondary space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-brand-brown">Titular:</span>
                  <span className="font-bold text-brand-dark">{DEVELOPER_BANK_DETAILS.titular}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-brown">CUIT:</span>
                  <span className="font-mono font-bold text-brand-dark">{DEVELOPER_BANK_DETAILS.cuit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-brown">Banco / Entidad:</span>
                  <span className="font-bold text-brand-dark">{DEVELOPER_BANK_DETAILS.banco}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-brown">Contacto / Envío:</span>
                  <span className="font-bold text-indigo-700">{DEVELOPER_BANK_DETAILS.emailContacto}</span>
                </div>
              </div>

              <p className="text-[11px] text-brand-brown/80 italic text-center">
                Una vez realizada la transferencia, podés enviar el comprobante por WhatsApp o al correo de soporte para su registro inmediato.
              </p>
            </div>

            <div className="pt-2 border-t border-brand-secondary/60 text-right">
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-brand-brown text-brand-card font-bold text-xs hover:bg-brand-dark transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
