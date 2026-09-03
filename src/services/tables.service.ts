import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Table } from '../types';

export function mapRowToTable(row: any): Table {
  return {
    id: row.id,
    number: row.number,
    capacity: Number(row.capacity) || 4,
    sector: row.sector || 'salon',
    status: row.status || 'disponible',
    qrCode: row.qr_code || '',
  };
}

export async function getTables(): Promise<Table[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .order('number', { ascending: true });

  if (error) {
    console.error('Error fetching tables from Supabase:', error);
    return [];
  }
  return (data || []).map(mapRowToTable);
}

export async function createTable(tableData: Omit<Table, 'id' | 'qrCode'> & { id?: string; qrCode?: string }): Promise<Table | null> {
  if (!isSupabaseConfigured) return null;
  const id = tableData.id || `tbl-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const { data, error } = await supabase
    .from('tables')
    .insert({
      id,
      number: tableData.number,
      capacity: tableData.capacity,
      sector: tableData.sector,
      status: tableData.status || 'disponible',
      qr_code: tableData.qrCode || `QR-TBL-${tableData.number.replace(/\D/g, '') || id.slice(-4)}`,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating table in Supabase:', error);
    return null;
  }
  return mapRowToTable(data);
}

export async function updateTableInDb(id: string, updates: Partial<Table>): Promise<Table | null> {
  if (!isSupabaseConfigured) return null;
  const payload: any = { updated_at: new Date().toISOString() };
  if (updates.number !== undefined) payload.number = updates.number;
  if (updates.capacity !== undefined) payload.capacity = updates.capacity;
  if (updates.sector !== undefined) payload.sector = updates.sector;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.qrCode !== undefined) payload.qr_code = updates.qrCode;

  const { data, error } = await supabase
    .from('tables')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating table in Supabase:', error);
    return null;
  }
  return mapRowToTable(data);
}

export async function deleteTableFromDb(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase
    .from('tables')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting table from Supabase:', error);
    return false;
  }
  return true;
}

export async function updateTableStatus(id: string, status: Table['status']): Promise<Table | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('tables')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating table status in Supabase:', error);
    return null;
  }
  return mapRowToTable(data);
}
