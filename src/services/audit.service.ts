import { supabase } from '../lib/supabase';
import { AuditLogEntry } from '../types';

export const fetchAuditLogs = async (limit: number = 500): Promise<AuditLogEntry[]> => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    timestamp: row.timestamp,
    userId: row.user_id,
    userName: row.user_name,
    module: row.module,
    action: row.action,
    details: row.details || '',
  }));
};

export const insertAuditLog = async (
  userId: string,
  userName: string,
  module: string,
  action: string,
  details: string = ''
): Promise<void> => {
  const { error } = await supabase
    .from('audit_logs')
    .insert([
      {
        user_id: userId,
        user_name: userName,
        module,
        action,
        details,
      },
    ]);

  if (error) {
    console.error('Error inserting audit log:', error);
  }
};
