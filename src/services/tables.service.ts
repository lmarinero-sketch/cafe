import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Table } from '../types';

function mapRowToTable(row: any): Table {
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
