import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { StaffUser } from '../types';

export async function getStaffUsers(): Promise<StaffUser[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from('staff_users')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching staff_users from Supabase:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role,
    status: row.status,
  }));
}

export async function createStaffUser(user: Omit<StaffUser, 'id'>): Promise<StaffUser | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase
    .from('staff_users')
    .insert([
      {
        name: user.name,
        email: user.email,
        password: user.password || '123456',
        role: user.role,
        status: user.status || 'active',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating staff_user in Supabase:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role,
    status: data.status,
  };
}

export async function updateStaffUserInDb(id: string, user: Partial<StaffUser>): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  const updatePayload: Record<string, any> = {};
  if (user.name !== undefined) updatePayload.name = user.name;
  if (user.email !== undefined) updatePayload.email = user.email;
  if (user.password !== undefined) updatePayload.password = user.password;
  if (user.role !== undefined) updatePayload.role = user.role;
  if (user.status !== undefined) updatePayload.status = user.status;

  const { error } = await supabase.from('staff_users').update(updatePayload).eq('id', id);

  if (error) {
    console.error('Error updating staff_user in Supabase:', error);
    return false;
  }

  return true;
}

export async function deleteStaffUserFromDb(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  const { error } = await supabase.from('staff_users').delete().eq('id', id);

  if (error) {
    console.error('Error deleting staff_user in Supabase:', error);
    return false;
  }

  return true;
}
