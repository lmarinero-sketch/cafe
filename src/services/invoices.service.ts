import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DeveloperInvoice, InvoiceStatus, InvoiceCategory } from '../types';
import { AuthUser } from '../context/AuthContext';

const STORAGE_KEY = 'hilos_developer_invoices';

export const DEVELOPER_BANK_DETAILS = {
  alias: 'GROWLABS.PAGOS',
  cbu: '0000003100049283748291',
  titular: 'Lucas Marinero',
  cuit: '20-38491823-9',
  banco: 'Banco Santander Argentina / Mercado Pago',
  emailContacto: 'lmarinero@growlabs.lat',
};

// ============================================================
// PERMISSION CHECK
// Only 'lmarinero' or 'lucasmmarinero' can create/edit/delete
// ============================================================
export function canManageInvoices(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  const name = (user.name || '').toLowerCase().trim();

  const isMatch = (str: string) =>
    str.includes('lmarinero') ||
    str.includes('lucasmmarinero') ||
    str.includes('lucasmarinero') ||
    str.includes('lucas marinero');

  return (
    isMatch(email) ||
    isMatch(name) ||
    email === 'lmarinero@growlabs.lat' ||
    email.startsWith('lmarinero') ||
    email.startsWith('lucasmmarinero')
  );
}

// Initial seed data for invoices (Grow Labs -> Hilos de Amor)
export const INITIAL_INVOICES_SEED: DeveloperInvoice[] = [
  {
    id: 'inv-2026-001',
    invoiceNumber: 'FAC-2026-0001',
    title: 'Abono Mensual Plataforma & Soporte — Enero 2026',
    category: 'abono_mensual',
    amount: 150000,
    issueDate: '2026-01-02',
    dueDate: '2026-01-10',
    status: 'paid',
    notes: 'Abonado mediante transferencia bancaria. Plan Gestión.',
    paidAt: '2026-01-08T14:30:00Z',
    uploadedBy: 'Lucas Marinero',
    createdAt: '2026-01-02T10:00:00Z',
  },
  {
    id: 'inv-2026-002',
    invoiceNumber: 'FAC-2026-0002',
    title: 'Abono Mensual Plataforma & Soporte — Febrero 2026',
    category: 'abono_mensual',
    amount: 150000,
    issueDate: '2026-02-01',
    dueDate: '2026-02-10',
    status: 'paid',
    notes: 'Abonado vía transferencia Santander. Plan Gestión con bonificación.',
    paidAt: '2026-02-05T11:15:00Z',
    uploadedBy: 'Lucas Marinero',
    createdAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'inv-2026-003',
    invoiceNumber: 'FAC-2026-0003',
    title: 'Abono Mensual Plataforma — Marzo 2026',
    category: 'abono_mensual',
    amount: 150000,
    issueDate: '2026-03-01',
    dueDate: '2026-03-10',
    status: 'pending',
    notes: 'Período corriente. Incluye hosting, infraestructura Supabase y mantenimiento activo.',
    uploadedBy: 'Lucas Marinero',
    createdAt: '2026-03-01T08:30:00Z',
  },
  {
    id: 'inv-2026-004',
    invoiceNumber: 'FAC-2026-0004',
    title: 'Desarrollo e Implementación: Módulo Gift Cards & Historial',
    category: 'desarrollo',
    amount: 85000,
    issueDate: '2026-03-02',
    dueDate: '2026-03-20',
    status: 'pending',
    notes: 'Entrega e integración de módulo de Gift Cards Virtuales con themes personalizables y trazabilidad de saldo.',
    uploadedBy: 'Lucas Marinero',
    createdAt: '2026-03-02T15:00:00Z',
  },
];

// Mapper between Supabase DB row and DeveloperInvoice
function mapDbToInvoice(row: any): DeveloperInvoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    title: row.title,
    category: (row.category || 'abono_mensual') as InvoiceCategory,
    amount: Number(row.amount || 0),
    issueDate: row.issue_date,
    dueDate: row.due_date || undefined,
    status: (row.status || 'pending') as InvoiceStatus,
    fileUrl: row.file_url || undefined,
    fileName: row.file_name || undefined,
    fileType: (row.file_type || 'pdf') as 'pdf' | 'image',
    notes: row.notes || '',
    paidAt: row.paid_at || undefined,
    uploadedBy: row.uploaded_by || 'Lucas Marinero',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || undefined,
  };
}

function mapInvoiceToDb(inv: Partial<DeveloperInvoice>): Record<string, any> {
  const row: Record<string, any> = {};
  if (inv.id !== undefined) row.id = inv.id;
  if (inv.invoiceNumber !== undefined) row.invoice_number = inv.invoiceNumber;
  if (inv.title !== undefined) row.title = inv.title;
  if (inv.category !== undefined) row.category = inv.category;
  if (inv.amount !== undefined) row.amount = inv.amount;
  if (inv.issueDate !== undefined) row.issue_date = inv.issueDate;
  if (inv.dueDate !== undefined) row.due_date = inv.dueDate;
  if (inv.status !== undefined) row.status = inv.status;
  if (inv.fileUrl !== undefined) row.file_url = inv.fileUrl;
  if (inv.fileName !== undefined) row.file_name = inv.fileName;
  if (inv.fileType !== undefined) row.file_type = inv.fileType;
  if (inv.notes !== undefined) row.notes = inv.notes;
  if (inv.paidAt !== undefined) row.paid_at = inv.paidAt;
  if (inv.uploadedBy !== undefined) row.uploaded_by = inv.uploadedBy;
  row.updated_at = new Date().toISOString();
  return row;
}

// LocalStorage helpers
function getLocalInvoices(): DeveloperInvoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INVOICES_SEED));
      return INITIAL_INVOICES_SEED;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_INVOICES_SEED;
  }
}

function saveLocalInvoices(invoices: DeveloperInvoice[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  } catch (err) {
    console.error('Error saving invoices to LocalStorage:', err);
  }
}

// ============================================================
// CRUD API
// ============================================================

export async function getDeveloperInvoices(): Promise<DeveloperInvoice[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('developer_invoices')
        .select('*')
        .order('issue_date', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map(mapDbToInvoice);
        saveLocalInvoices(mapped);
        return mapped;
      }

      // If DB is empty, seed it with initial invoices
      if (!error && data && data.length === 0) {
        for (const seed of INITIAL_INVOICES_SEED) {
          const dbData = mapInvoiceToDb(seed);
          await supabase.from('developer_invoices').insert(dbData);
        }
        return INITIAL_INVOICES_SEED;
      }
    } catch (err) {
      console.warn('Error fetching developer_invoices from Supabase, fallback to local:', err);
    }
  }

  return getLocalInvoices();
}

export async function createDeveloperInvoice(
  data: Omit<DeveloperInvoice, 'id' | 'createdAt'>
): Promise<DeveloperInvoice> {
  const newInvoice: DeveloperInvoice = {
    ...data,
    id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const dbRow = mapInvoiceToDb(newInvoice);
      const { data: created, error } = await supabase
        .from('developer_invoices')
        .insert(dbRow)
        .select()
        .single();

      if (!error && created) {
        const mapped = mapDbToInvoice(created);
        const current = getLocalInvoices();
        saveLocalInvoices([mapped, ...current]);
        return mapped;
      }
    } catch (err) {
      console.warn('Error inserting invoice in Supabase:', err);
    }
  }

  // Local fallback
  const current = getLocalInvoices();
  const updated = [newInvoice, ...current];
  saveLocalInvoices(updated);
  return newInvoice;
}

export async function updateDeveloperInvoice(
  id: string,
  updates: Partial<DeveloperInvoice>
): Promise<DeveloperInvoice | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const dbRow = mapInvoiceToDb(updates);
      const { data: updated, error } = await supabase
        .from('developer_invoices')
        .update(dbRow)
        .eq('id', id)
        .select()
        .single();

      if (!error && updated) {
        const mapped = mapDbToInvoice(updated);
        const local = getLocalInvoices().map((inv) => (inv.id === id ? mapped : inv));
        saveLocalInvoices(local);
        return mapped;
      }
    } catch (err) {
      console.warn('Error updating invoice in Supabase:', err);
    }
  }

  // Local fallback
  const local = getLocalInvoices();
  let found: DeveloperInvoice | null = null;
  const updated = local.map((inv) => {
    if (inv.id === id) {
      found = { ...inv, ...updates, updatedAt: new Date().toISOString() };
      return found;
    }
    return inv;
  });
  if (found) {
    saveLocalInvoices(updated);
  }
  return found;
}

export const INVOICES_BUCKET = 'invoices';

export async function deleteInvoiceFileFromStorage(fileUrl?: string): Promise<void> {
  if (!fileUrl || !isSupabaseConfigured || !supabase) return;
  try {
    const bucketMarker = `/${INVOICES_BUCKET}/`;
    const idx = fileUrl.indexOf(bucketMarker);
    if (idx !== -1) {
      const filePath = fileUrl.substring(idx + bucketMarker.length).split('?')[0];
      if (filePath) {
        await supabase.storage.from(INVOICES_BUCKET).remove([filePath]);
      }
    }
  } catch (err) {
    console.warn('Error deleting file from invoices bucket:', err);
  }
}

export async function deleteDeveloperInvoice(id: string): Promise<boolean> {
  const currentList = getLocalInvoices();
  const target = currentList.find((inv) => inv.id === id);

  if (isSupabaseConfigured && supabase) {
    try {
      if (target?.fileUrl) {
        await deleteInvoiceFileFromStorage(target.fileUrl);
      }

      const { error } = await supabase
        .from('developer_invoices')
        .delete()
        .eq('id', id);

      if (!error) {
        const local = currentList.filter((inv) => inv.id !== id);
        saveLocalInvoices(local);
        return true;
      }
    } catch (err) {
      console.warn('Error deleting invoice from Supabase:', err);
    }
  }

  const local = currentList.filter((inv) => inv.id !== id);
  saveLocalInvoices(local);
  return true;
}

// Convert uploaded file to base64 or upload to dedicated Supabase 'invoices' storage bucket
export async function uploadInvoiceFile(
  file: File
): Promise<{ url: string; fileName: string; fileType: 'pdf' | 'image' }> {
  const isImage = file.type.startsWith('image/');
  const fileType: 'pdf' | 'image' = isImage ? 'image' : 'pdf';
  const fileName = file.name;

  // 1. Upload to dedicated Supabase 'invoices' bucket
  if (isSupabaseConfigured && supabase) {
    try {
      const ext = fileName.split('.').pop()?.toLowerCase() || (isImage ? 'png' : 'pdf');
      const sanitizedBase = fileName
        .substring(0, fileName.lastIndexOf('.') || fileName.length)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 32);
      const filePath = `${Date.now()}_${sanitizedBase}.${ext}`;
      
      const { data, error } = await supabase.storage
        .from(INVOICES_BUCKET)
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600',
          contentType: file.type || (fileType === 'pdf' ? 'application/pdf' : 'image/png'),
        });

      if (!error && data?.path) {
        const { data: pubData } = supabase.storage
          .from(INVOICES_BUCKET)
          .getPublicUrl(data.path);

        if (pubData?.publicUrl) {
          return { url: pubData.publicUrl, fileName, fileType };
        }
      } else if (error) {
        console.warn('Error uploading to invoices bucket, attempting fallback:', error);
      }
    } catch (storageErr) {
      console.warn('Supabase storage upload failed, falling back to base64 data URI:', storageErr);
    }
  }

  // 2. Base64 fallback (guarantees preview & download anywhere)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        url: reader.result as string,
        fileName,
        fileType,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
