import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SiteContent } from '../types';

function mapDbToContent(row: any): SiteContent {
  return {
    id: row.id,
    section: row.section,
    key: row.key,
    value: row.value || '',
    type: row.type || 'text',
    label: row.label || '',
    sortOrder: row.sort_order || 0,
  };
}

export async function getAllContent(): Promise<SiteContent[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('site_content').select('*').order('sort_order', { ascending: true });
  if (error) { console.error('Error fetching site content:', error); return []; }
  return (data || []).map(mapDbToContent);
}

export async function getContentBySection(section: string): Promise<SiteContent[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('site_content').select('*').eq('section', section).order('sort_order', { ascending: true });
  if (error) { console.error('Error fetching content for section:', error); return []; }
  return (data || []).map(mapDbToContent);
}

export async function getContentValue(key: string): Promise<string> {
  if (!isSupabaseConfigured) return '';
  const { data, error } = await supabase.from('site_content').select('value').eq('key', key).single();
  if (error) return '';
  return data?.value || '';
}

export async function upsertContent(key: string, value: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase
    .from('site_content')
    .update({ value })
    .eq('key', key);
  if (error) { console.error('Error upserting content:', error); return false; }
  return true;
}

export async function upsertMultipleContent(items: { key: string; value: string }[]): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  
  for (const item of items) {
    const { error } = await supabase
      .from('site_content')
      .update({ value: item.value })
      .eq('key', item.key);
    if (error) {
      console.error(`Error updating ${item.key}:`, error);
      return false;
    }
  }
  return true;
}

/**
 * Helper: converts array of SiteContent to a key→value map for easy access
 */
export function contentToMap(content: SiteContent[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of content) {
    map[item.key] = item.value;
  }
  return map;
}
