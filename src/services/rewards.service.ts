import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Reward } from '../types';

function mapRowToReward(row: any): Reward {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    pointsCost: row.points_cost || 0,
    category: row.category || '',
    isAvailable: row.is_available ?? true,
  };
}

export async function getRewards(): Promise<Reward[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .order('points_cost', { ascending: true });

  if (error) {
    console.error('Error fetching rewards:', error);
    return [];
  }
  return (data || []).map(mapRowToReward);
}

export async function createReward(
  rewardData: Omit<Reward, 'id'>
): Promise<Reward | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('rewards')
    .insert({
      name: rewardData.name,
      description: rewardData.description,
      points_cost: rewardData.pointsCost,
      category: rewardData.category,
      is_available: rewardData.isAvailable,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating reward:', error);
    return null;
  }
  return mapRowToReward(data);
}

export async function updateReward(id: string, updates: Partial<Reward>): Promise<Reward | null> {
  if (!isSupabaseConfigured) return null;

  const row: Record<string, any> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.pointsCost !== undefined) row.points_cost = updates.pointsCost;
  if (updates.category !== undefined) row.category = updates.category;
  if (updates.isAvailable !== undefined) row.is_available = updates.isAvailable;

  const { data, error } = await supabase
    .from('rewards')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating reward:', error);
    return null;
  }
  return mapRowToReward(data);
}

export async function deleteReward(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase
    .from('rewards')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting reward:', error);
    return false;
  }
  return true;
}
