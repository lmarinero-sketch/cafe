import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Ingredient } from '../types';

function mapRowToIngredient(row: any): Ingredient {
  return {
    id: row.id,
    name: row.name,
    category: row.category || 'Insumos Generales',
    purchasePrice: Number(row.purchase_price) || 0,
    purchaseQty: Number(row.purchase_qty) || 1,
    purchaseUnit: row.purchase_unit || 'kilogramo',
    usageUnit: row.usage_unit || 'gramo',
    wastePercentage: Number(row.waste_percent) || 0,
    normalizedCost: Number(row.normalized_cost) || 0,
    supplier: row.supplier || '',
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function mapIngredientToRow(ing: Partial<Ingredient>): Record<string, any> {
  const row: Record<string, any> = {};
  if (ing.name !== undefined) row.name = ing.name;
  if (ing.purchasePrice !== undefined) row.purchase_price = ing.purchasePrice;
  if (ing.purchaseQty !== undefined) row.purchase_qty = ing.purchaseQty;
  if (ing.purchaseUnit !== undefined) row.purchase_unit = ing.purchaseUnit;
  if (ing.usageUnit !== undefined) row.usage_unit = ing.usageUnit;
  if (ing.wastePercentage !== undefined) row.waste_percent = ing.wastePercentage;
  if (ing.normalizedCost !== undefined) row.normalized_cost = ing.normalizedCost;
  if (ing.supplier !== undefined) row.supplier = ing.supplier;
  return row;
}

export async function getIngredients(): Promise<Ingredient[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching ingredients from Supabase:', error);
    return [];
  }
  return (data || []).map(mapRowToIngredient);
}

export async function createIngredient(ingData: Omit<Ingredient, 'id' | 'updatedAt'>): Promise<Ingredient | null> {
  if (!isSupabaseConfigured) return null;
  const row = mapIngredientToRow(ingData);
  const { data, error } = await supabase.from('ingredients').insert(row).select().single();
  if (error) {
    console.error('Error creating ingredient in Supabase:', error);
    return null;
  }
  return mapRowToIngredient(data);
}

export async function updateIngredient(id: string, updates: Partial<Ingredient>): Promise<Ingredient | null> {
  if (!isSupabaseConfigured) return null;
  const row = mapIngredientToRow(updates);
  const { data, error } = await supabase.from('ingredients').update(row).eq('id', id).select().single();
  if (error) {
    console.error('Error updating ingredient in Supabase:', error);
    return null;
  }
  return mapRowToIngredient(data);
}
