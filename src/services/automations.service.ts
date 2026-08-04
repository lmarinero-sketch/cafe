import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Automation } from '../types';

function mapRowToAutomation(row: any): Automation {
  return {
    id: row.id,
    name: row.name,
    condition: row.condition || '',
    segment: row.segment || '',
    message: row.message || '',
    status: row.status || 'activa',
    nextRun: row.next_run || '',
    estimatedRecipients: row.estimated_recipients || 0,
    executedCount: row.executed_count || 0,
  };
}

export async function getAutomations(): Promise<Automation[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('automations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching automations:', error);
    return [];
  }
  return (data || []).map(mapRowToAutomation);
}

export async function createAutomation(
  automationData: Omit<Automation, 'id'>
): Promise<Automation | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('automations')
    .insert({
      name: automationData.name,
      condition: automationData.condition,
      segment: automationData.segment,
      message: automationData.message,
      status: automationData.status || 'activa',
      next_run: automationData.nextRun,
      estimated_recipients: automationData.estimatedRecipients,
      executed_count: automationData.executedCount || 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating automation:', error);
    return null;
  }
  return mapRowToAutomation(data);
}

export async function updateAutomation(id: string, updates: Partial<Automation>): Promise<Automation | null> {
  if (!isSupabaseConfigured) return null;

  const row: Record<string, any> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.condition !== undefined) row.condition = updates.condition;
  if (updates.segment !== undefined) row.segment = updates.segment;
  if (updates.message !== undefined) row.message = updates.message;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.nextRun !== undefined) row.next_run = updates.nextRun;
  if (updates.estimatedRecipients !== undefined) row.estimated_recipients = updates.estimatedRecipients;
  if (updates.executedCount !== undefined) row.executed_count = updates.executedCount;

  const { data, error } = await supabase
    .from('automations')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating automation:', error);
    return null;
  }
  return mapRowToAutomation(data);
}

export async function toggleAutomationStatus(id: string, currentStatus: string): Promise<Automation | null> {
  const newStatus = currentStatus === 'activa' ? 'pausada' : 'activa';
  return updateAutomation(id, { status: newStatus as Automation['status'] });
}

export async function deleteAutomation(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase
    .from('automations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting automation:', error);
    return false;
  }
  return true;
}
