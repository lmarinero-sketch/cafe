import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Campaign } from '../types';

function mapRowToCampaign(row: any): Campaign {
  return {
    id: row.id,
    name: row.name,
    templateName: row.template_name || '',
    scheduledAt: row.scheduled_at,
    status: row.status || 'programado',
    recipientsCount: row.recipients_count || 0,
    segment: row.segment || '',
    message: row.message || '',
    conversionRate: Number(row.conversion_rate) || 0,
  };
}

export async function getCampaigns(): Promise<Campaign[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
  return (data || []).map(mapRowToCampaign);
}

export async function createCampaign(
  campaignData: Omit<Campaign, 'id' | 'status' | 'conversionRate'>
): Promise<Campaign | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      name: campaignData.name,
      template_name: campaignData.templateName,
      scheduled_at: campaignData.scheduledAt,
      recipients_count: campaignData.recipientsCount,
      segment: campaignData.segment,
      message: campaignData.message,
      status: 'programado',
      conversion_rate: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating campaign:', error);
    return null;
  }
  return mapRowToCampaign(data);
}

export async function updateCampaignStatus(
  id: string,
  status: Campaign['status'],
  conversionRate?: number
): Promise<Campaign | null> {
  if (!isSupabaseConfigured) return null;

  const updates: Record<string, any> = { status };
  if (conversionRate !== undefined) updates.conversion_rate = conversionRate;

  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating campaign status:', error);
    return null;
  }
  return mapRowToCampaign(data);
}

export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
  if (!isSupabaseConfigured) return null;

  const row: Record<string, any> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.templateName !== undefined) row.template_name = updates.templateName;
  if (updates.scheduledAt !== undefined) row.scheduled_at = updates.scheduledAt;
  if (updates.recipientsCount !== undefined) row.recipients_count = updates.recipientsCount;
  if (updates.segment !== undefined) row.segment = updates.segment;
  if (updates.message !== undefined) row.message = updates.message;

  const { data, error } = await supabase
    .from('campaigns')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating campaign:', error);
    return null;
  }
  return mapRowToCampaign(data);
}

export async function deleteCampaign(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting campaign:', error);
    return false;
  }
  return true;
}
