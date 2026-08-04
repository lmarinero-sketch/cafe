import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Redemption } from '../types';

export async function createRedemption(
  customerId: string,
  rewardId: string,
  pointsSpent: number
): Promise<Redemption | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('redemptions')
    .insert({
      customer_id: customerId,
      reward_id: rewardId,
      points_spent: pointsSpent,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating redemption:', error);
    return null;
  }

  return {
    id: data.id,
    customerId: data.customer_id,
    rewardId: data.reward_id,
    pointsSpent: data.points_spent,
    redeemedAt: data.redeemed_at,
  };
}

export async function getRedemptionsByCustomer(customerId: string): Promise<Redemption[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('redemptions')
    .select('*')
    .eq('customer_id', customerId)
    .order('redeemed_at', { ascending: false });

  if (error) {
    console.error('Error fetching redemptions:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    customerId: row.customer_id,
    rewardId: row.reward_id,
    pointsSpent: row.points_spent,
    redeemedAt: row.redeemed_at,
  }));
}
