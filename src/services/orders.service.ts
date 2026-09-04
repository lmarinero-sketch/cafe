import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order } from '../types';

export function mapRowToOrder(row: any): Order {
  return {
    id: row.id,
    code: row.code,
    type: row.type || 'salon',
    status: row.status || 'nuevo',
    items: row.items || [],
    subtotal: Number(row.subtotal) || 0,
    deliveryFee: Number(row.delivery_fee) || 0,
    total: Number(row.total) || 0,
    paymentMethod: row.payment_method || 'efectivo',
    tableId: row.table_id || undefined,
    tableName: row.table_name || undefined,
    customerId: row.customer_id || undefined,
    customerName: row.customer_name || 'Cliente de Salón',
    customerPhone: row.customer_phone || '',
    address: row.address || undefined,
    addressRef: row.address_ref || undefined,
    notes: row.notes || '',
    waiterName: row.waiter_name || undefined,
    registerId: row.register_id || undefined,
    createdAt: row.created_at,
    pointsEarned: row.points_earned || 0,
    tipAmount: Number(row.tip_amount) || 0,
    tipPercentage: Number(row.tip_percentage) || 0,
    tipRegisteredBy: row.tip_registered_by || undefined,
    tipRegisteredAt: row.tip_registered_at || undefined,
  };
}

function mapOrderToRow(order: Partial<Order>): Record<string, any> {
  const row: Record<string, any> = {};
  if (order.id !== undefined) row.id = order.id;
  if (order.code !== undefined) row.code = order.code;
  if (order.type !== undefined) row.type = order.type;
  if (order.status !== undefined) row.status = order.status;
  if (order.items !== undefined) row.items = order.items;
  if (order.subtotal !== undefined) row.subtotal = order.subtotal;
  if (order.deliveryFee !== undefined) row.delivery_fee = order.deliveryFee;
  if (order.total !== undefined) row.total = order.total;
  if (order.paymentMethod !== undefined) row.payment_method = order.paymentMethod;
  if (order.tableId !== undefined) row.table_id = order.tableId;
  if (order.tableName !== undefined) row.table_name = order.tableName;
  if (order.customerId !== undefined) row.customer_id = order.customerId;
  if (order.customerName !== undefined) row.customer_name = order.customerName;
  if (order.customerPhone !== undefined) row.customer_phone = order.customerPhone;
  if (order.address !== undefined) row.address = order.address;
  if (order.addressRef !== undefined) row.address_ref = order.addressRef;
  if (order.notes !== undefined) row.notes = order.notes;
  if (order.waiterName !== undefined) row.waiter_name = order.waiterName;
  if (order.registerId !== undefined) row.register_id = order.registerId;
  if (order.pointsEarned !== undefined) row.points_earned = order.pointsEarned;
  if (order.tipAmount !== undefined) row.tip_amount = order.tipAmount;
  if (order.tipPercentage !== undefined) row.tip_percentage = order.tipPercentage;
  if (order.tipRegisteredBy !== undefined) row.tip_registered_by = order.tipRegisteredBy;
  if (order.tipRegisteredAt !== undefined) row.tip_registered_at = order.tipRegisteredAt;
  return row;
}

export async function getOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders from Supabase:', error);
    return [];
  }
  return (data || []).map(mapRowToOrder);
}

export async function createOrderDB(orderData: Partial<Order>): Promise<Order | null> {
  if (!isSupabaseConfigured) return null;
  const row = mapOrderToRow(orderData);
  const { data, error } = await supabase.from('orders').insert(row).select().single();
  if (error) {
    console.error('Error creating order in Supabase:', error);
    return null;
  }
  return mapRowToOrder(data);
}

export async function updateOrderStatusDB(id: string, status: Order['status']): Promise<Order | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status in Supabase:', error);
    return null;
  }
  return mapRowToOrder(data);
}

export async function getOrderByCode(code: string): Promise<Order | null> {
  if (!isSupabaseConfigured) return null;
  const cleanCode = code.trim().toUpperCase();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .ilike('code', cleanCode)
    .single();

  if (error || !data) {
    return null;
  }
  return mapRowToOrder(data);
}

export async function updateOrderTipDB(
  orderId: string,
  tipAmount: number,
  tipPercentage: number,
  registeredBy: string
): Promise<Order | null> {
  if (!isSupabaseConfigured) return null;
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('orders')
    .update({
      tip_amount: tipAmount,
      tip_percentage: tipPercentage,
      tip_registered_by: registeredBy,
      tip_registered_at: now,
      updated_at: now,
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order tip in Supabase:', error);
    return null;
  }
  return mapRowToOrder(data);
}
