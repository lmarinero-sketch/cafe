import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CashRegister, CashTransaction } from '../types';

function mapRowToRegister(row: any): CashRegister {
  return {
    id: row.id,
    openedAt: row.opened_at,
    closedAt: row.closed_at || undefined,
    openedBy: row.opened_by || 'Cajero',
    closedBy: row.closed_by || undefined,
    initialBalance: Number(row.initial_balance) || 0,
    finalBalance: row.final_balance !== null && row.final_balance !== undefined ? Number(row.final_balance) : undefined,
    expectedBalance: row.expected_balance !== null && row.expected_balance !== undefined ? Number(row.expected_balance) : undefined,
    difference: row.difference !== null && row.difference !== undefined ? Number(row.difference) : undefined,
    cashPhysicalCount: row.cash_physical_count !== null && row.cash_physical_count !== undefined ? Number(row.cash_physical_count) : undefined,
    notes: row.notes || '',
    status: row.status || 'abierta',
  };
}

function mapRegisterToRow(reg: Partial<CashRegister>): Record<string, any> {
  const row: Record<string, any> = {};
  if (reg.id !== undefined) row.id = reg.id;
  if (reg.openedAt !== undefined) row.opened_at = reg.openedAt;
  if (reg.closedAt !== undefined) row.closed_at = reg.closedAt;
  if (reg.openedBy !== undefined) row.opened_by = reg.openedBy;
  if (reg.closedBy !== undefined) row.closed_by = reg.closedBy;
  if (reg.initialBalance !== undefined) row.initial_balance = reg.initialBalance;
  if (reg.finalBalance !== undefined) row.final_balance = reg.finalBalance;
  if (reg.expectedBalance !== undefined) row.expected_balance = reg.expectedBalance;
  if (reg.difference !== undefined) row.difference = reg.difference;
  if (reg.cashPhysicalCount !== undefined) row.cash_physical_count = reg.cashPhysicalCount;
  if (reg.notes !== undefined) row.notes = reg.notes;
  if (reg.status !== undefined) row.status = reg.status;
  return row;
}

function mapRowToTransaction(row: any): CashTransaction {
  return {
    id: row.id,
    registerId: row.register_id,
    orderId: row.order_id || undefined,
    type: row.type || 'ingreso',
    amount: Number(row.amount) || 0,
    paymentMethod: row.payment_method || 'efectivo',
    description: row.description || '',
    registeredBy: row.registered_by || '',
    role: row.role || '',
    timestamp: row.timestamp || row.created_at,
  };
}

function mapTransactionToRow(tx: Partial<CashTransaction>): Record<string, any> {
  const row: Record<string, any> = {};
  if (tx.id !== undefined) row.id = tx.id;
  if (tx.registerId !== undefined) row.register_id = tx.registerId;
  if (tx.orderId !== undefined) row.order_id = tx.orderId;
  if (tx.type !== undefined) row.type = tx.type;
  if (tx.amount !== undefined) row.amount = tx.amount;
  if (tx.paymentMethod !== undefined) row.payment_method = tx.paymentMethod;
  if (tx.description !== undefined) row.description = tx.description;
  if (tx.registeredBy !== undefined) row.registered_by = tx.registeredBy;
  if (tx.role !== undefined) row.role = tx.role;
  if (tx.timestamp !== undefined) row.timestamp = tx.timestamp;
  return row;
}

export async function getCashRegisters(): Promise<CashRegister[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('cash_registers')
    .select('*')
    .order('opened_at', { ascending: false });

  if (error) {
    console.error('Error fetching cash_registers from Supabase:', error);
    return [];
  }
  return (data || []).map(mapRowToRegister);
}

export async function createCashRegister(reg: CashRegister): Promise<CashRegister | null> {
  if (!isSupabaseConfigured) return null;
  const row = mapRegisterToRow(reg);
  const { data, error } = await supabase.from('cash_registers').insert(row).select().single();
  if (error) {
    console.error('Error creating cash_register in Supabase:', error);
    return null;
  }
  return mapRowToRegister(data);
}

export async function updateCashRegister(id: string, updates: Partial<CashRegister>): Promise<CashRegister | null> {
  if (!isSupabaseConfigured) return null;
  const row = mapRegisterToRow(updates);
  const { data, error } = await supabase
    .from('cash_registers')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating cash_register in Supabase:', error);
    return null;
  }
  return mapRowToRegister(data);
}

export async function getCashTransactions(): Promise<CashTransaction[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('cash_transactions')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching cash_transactions from Supabase:', error);
    return [];
  }
  return (data || []).map(mapRowToTransaction);
}

export async function createCashTransaction(tx: CashTransaction): Promise<CashTransaction | null> {
  if (!isSupabaseConfigured) return null;
  const row = mapTransactionToRow(tx);
  const { data, error } = await supabase.from('cash_transactions').insert(row).select().single();
  if (error) {
    console.error('Error creating cash_transaction in Supabase:', error);
    return null;
  }
  return mapRowToTransaction(data);
}

export { mapRowToRegister, mapRowToTransaction };
