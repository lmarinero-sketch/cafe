import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Customer } from '../types';

// Map DB row (snake_case) to frontend type (camelCase)
function mapRowToCustomer(row: any): Customer {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email || '',
    birthDate: row.birth_date || '',
    registrationDate: row.registration_date,
    purchaseCount: row.purchase_count || 0,
    totalSpent: Number(row.total_spent) || 0,
    averageTicket: Number(row.average_ticket) || 0,
    lastPurchaseDate: row.last_purchase_date,
    points: row.points || 0,
    level: row.level || 'Inicial',
    usedPromotionsCount: row.used_promotions_count || 0,
    marketingConsent: row.marketing_consent ?? true,
    favoriteProduct: row.favorite_product || '',
  };
}

// Map frontend type to DB row (camelCase -> snake_case)
function mapCustomerToRow(customer: Partial<Customer>): Record<string, any> {
  const row: Record<string, any> = {};
  if (customer.firstName !== undefined) row.first_name = customer.firstName;
  if (customer.lastName !== undefined) row.last_name = customer.lastName;
  if (customer.phone !== undefined) row.phone = customer.phone;
  if (customer.email !== undefined) row.email = customer.email;
  if (customer.birthDate !== undefined) row.birth_date = customer.birthDate;
  if (customer.registrationDate !== undefined) row.registration_date = customer.registrationDate;
  if (customer.purchaseCount !== undefined) row.purchase_count = customer.purchaseCount;
  if (customer.totalSpent !== undefined) row.total_spent = customer.totalSpent;
  if (customer.averageTicket !== undefined) row.average_ticket = customer.averageTicket;
  if (customer.lastPurchaseDate !== undefined) row.last_purchase_date = customer.lastPurchaseDate;
  if (customer.points !== undefined) row.points = customer.points;
  if (customer.level !== undefined) row.level = customer.level;
  if (customer.usedPromotionsCount !== undefined) row.used_promotions_count = customer.usedPromotionsCount;
  if (customer.marketingConsent !== undefined) row.marketing_consent = customer.marketingConsent;
  if (customer.favoriteProduct !== undefined) row.favorite_product = customer.favoriteProduct;
  return row;
}

export async function getCustomers(): Promise<Customer[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  return (data || []).map(mapRowToCustomer);
}

export async function createCustomer(
  customerData: Omit<Customer, 'id' | 'registrationDate' | 'points' | 'level' | 'purchaseCount' | 'totalSpent' | 'averageTicket' | 'lastPurchaseDate' | 'usedPromotionsCount'>
): Promise<Customer | null> {
  if (!isSupabaseConfigured) return null;

  const row = {
    first_name: customerData.firstName,
    last_name: customerData.lastName,
    phone: customerData.phone,
    email: customerData.email || '',
    birth_date: customerData.birthDate || '',
    marketing_consent: customerData.marketingConsent ?? true,
    points: 150, // Welcome bonus
    level: 'Inicial',
    purchase_count: 0,
    total_spent: 0,
    average_ticket: 0,
    used_promotions_count: 0,
  };

  const { data, error } = await supabase
    .from('customers')
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    return null;
  }
  return mapRowToCustomer(data);
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
  if (!isSupabaseConfigured) return null;

  const row = mapCustomerToRow(updates);
  const { data, error } = await supabase
    .from('customers')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating customer:', error);
    return null;
  }
  return mapRowToCustomer(data);
}

export async function deleteCustomer(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting customer:', error);
    return false;
  }
  return true;
}

export async function addCustomerPoints(id: string, pointsToAdd: number): Promise<Customer | null> {
  if (!isSupabaseConfigured) return null;

  // Fetch current customer to calculate new level
  const { data: current, error: fetchError } = await supabase
    .from('customers')
    .select('points, purchase_count')
    .eq('id', id)
    .single();

  if (fetchError || !current) {
    console.error('Error fetching customer for points update:', fetchError);
    return null;
  }

  const newPoints = (current.points || 0) + pointsToAdd;
  let level: string = 'Inicial';
  if (newPoints > 3000) level = 'VIP';
  else if (newPoints > 1500) level = 'Preferencial';
  else if (newPoints > 500) level = 'Frecuente';

  const { data, error } = await supabase
    .from('customers')
    .update({
      points: newPoints,
      level,
      purchase_count: (current.purchase_count || 0) + 1,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating customer points:', error);
    return null;
  }
  return mapRowToCustomer(data);
}
