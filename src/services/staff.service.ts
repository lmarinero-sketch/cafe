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

  const emailClean = user.email.trim().toLowerCase();
  const passClean = user.password?.trim() || '123456';

  // 1. Register in Supabase Auth
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailClean,
      password: passClean,
      options: {
        data: {
          name: user.name,
          role: user.role,
        },
      },
    });
    if (authError) {
      console.warn('Supabase Auth signUp note:', authError.message);
    }
  } catch (err) {
    console.warn('Supabase Auth signUp exception:', err);
  }

  // 2. Save in public.staff_users table
  const { data, error } = await supabase
    .from('staff_users')
    .upsert(
      [
        {
          name: user.name,
          email: emailClean,
          password: passClean,
          role: user.role,
          status: user.status || 'active',
        },
      ],
      { onConflict: 'email' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error saving staff_user in Supabase DB:', error);
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
  if (user.email !== undefined) updatePayload.email = user.email.trim().toLowerCase();
  if (user.password !== undefined) updatePayload.password = user.password.trim();
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
