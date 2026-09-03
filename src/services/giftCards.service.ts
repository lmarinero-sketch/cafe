import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { GiftCard } from '../types';

export function mapRowToGiftCard(row: any): GiftCard {
  return {
    id: row.id,
    code: row.code,
    initialAmount: Number(row.initial_amount) || 0,
    currentBalance: Number(row.current_balance) || 0,
    purchaserName: row.purchaser_name || '',
    purchaserPhone: row.purchaser_phone || '',
    purchaserEmail: row.purchaser_email || '',
    recipientName: row.recipient_name || '',
    recipientPhone: row.recipient_phone || '',
    recipientEmail: row.recipient_email || '',
    message: row.message || '',
    theme: row.theme || 'clasica',
    status: row.status || 'activa',
    createdAt: row.created_at,
    expiresAt: row.expires_at || undefined,
    usageHistory: Array.isArray(row.usage_history) ? row.usage_history : [],
  };
}

export function mapGiftCardToRow(card: Partial<GiftCard>): Record<string, any> {
  const row: Record<string, any> = {};
  if (card.id !== undefined) row.id = card.id;
  if (card.code !== undefined) row.code = card.code;
  if (card.initialAmount !== undefined) row.initial_amount = card.initialAmount;
  if (card.currentBalance !== undefined) row.current_balance = card.currentBalance;
  if (card.purchaserName !== undefined) row.purchaser_name = card.purchaserName;
  if (card.purchaserPhone !== undefined) row.purchaser_phone = card.purchaserPhone;
  if (card.purchaserEmail !== undefined) row.purchaser_email = card.purchaserEmail;
  if (card.recipientName !== undefined) row.recipient_name = card.recipientName;
  if (card.recipientPhone !== undefined) row.recipient_phone = card.recipientPhone;
  if (card.recipientEmail !== undefined) row.recipient_email = card.recipientEmail;
  if (card.message !== undefined) row.message = card.message;
  if (card.theme !== undefined) row.theme = card.theme;
  if (card.status !== undefined) row.status = card.status;
  if (card.expiresAt !== undefined) row.expires_at = card.expiresAt;
  if (card.usageHistory !== undefined) row.usage_history = card.usageHistory;
  return row;
}

export async function getGiftCards(): Promise<GiftCard[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('gift_cards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching gift_cards from Supabase:', error);
    return [];
  }
  return (data || []).map(mapRowToGiftCard);
}

export async function createGiftCardDB(card: GiftCard): Promise<GiftCard | null> {
  if (!isSupabaseConfigured) return null;
  const row = mapGiftCardToRow(card);
  const { data, error } = await supabase.from('gift_cards').insert(row).select().single();
  if (error) {
    console.error('Error creating gift_card in Supabase:', error);
    return null;
  }
  return mapRowToGiftCard(data);
}

export async function updateGiftCardDB(id: string, updates: Partial<GiftCard>): Promise<GiftCard | null> {
  if (!isSupabaseConfigured) return null;
  const row = mapGiftCardToRow(updates);
  const { data, error } = await supabase
    .from('gift_cards')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating gift_card in Supabase:', error);
    return null;
  }
  return mapRowToGiftCard(data);
}
