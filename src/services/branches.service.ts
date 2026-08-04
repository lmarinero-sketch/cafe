import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Branch } from '../types';

function mapDbToBranch(row: any): Branch {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    zone: row.zone || '',
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    instagram: row.instagram || '',
    hours: row.hours || '',
    badge: row.badge || '',
    features: row.features || [],
    mapQuery: row.map_query || '',
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
  };
}

function mapBranchToDb(data: Partial<Branch>): Record<string, any> {
  const result: Record<string, any> = {};
  if (data.name !== undefined) result.name = data.name;
  if (data.address !== undefined) result.address = data.address;
  if (data.zone !== undefined) result.zone = data.zone;
  if (data.phone !== undefined) result.phone = data.phone;
  if (data.whatsapp !== undefined) result.whatsapp = data.whatsapp;
  if (data.instagram !== undefined) result.instagram = data.instagram;
  if (data.hours !== undefined) result.hours = data.hours;
  if (data.badge !== undefined) result.badge = data.badge;
  if (data.features !== undefined) result.features = data.features;
  if (data.mapQuery !== undefined) result.map_query = data.mapQuery;
  if (data.isActive !== undefined) result.is_active = data.isActive;
  return result;
}

export async function getBranches(): Promise<Branch[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('branches').select('*').order('created_at', { ascending: true });
  if (error) { console.error('Error fetching branches:', error); return []; }
  return (data || []).map(mapDbToBranch);
}

export async function getActiveBranches(): Promise<Branch[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('branches').select('*').eq('is_active', true).order('created_at', { ascending: true });
  if (error) { console.error('Error fetching active branches:', error); return []; }
  return (data || []).map(mapDbToBranch);
}

export async function createBranch(branchData: Omit<Branch, 'id' | 'createdAt'>): Promise<Branch | null> {
  if (!isSupabaseConfigured) return null;
  const dbData = mapBranchToDb(branchData);
  const { data, error } = await supabase.from('branches').insert(dbData).select().single();
  if (error) { console.error('Error creating branch:', error); return null; }
  return mapDbToBranch(data);
}

export async function updateBranch(id: string, updates: Partial<Branch>): Promise<Branch | null> {
  if (!isSupabaseConfigured) return null;
  const dbData = mapBranchToDb(updates);
  const { data, error } = await supabase.from('branches').update(dbData).eq('id', id).select().single();
  if (error) { console.error('Error updating branch:', error); return null; }
  return mapDbToBranch(data);
}

export async function deleteBranch(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase.from('branches').delete().eq('id', id);
  if (error) { console.error('Error deleting branch:', error); return false; }
  return true;
}
