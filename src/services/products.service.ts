import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product } from '../types';

function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    categoryName: row.category_name || '',
    description: row.description || '',
    price: Number(row.price) || 0,
    cost: Number(row.cost) || 0,
    suggestedPrice: Number(row.suggested_price) || 0,
    image: row.image || '',
    isAvailable: row.is_available ?? true,
    isFeatured: row.is_featured ?? false,
    channels: row.channels || ['salon', 'retiro', 'delivery'],
    recipeItems: row.recipe_items || [],
  };
}

function mapProductToRow(prod: Partial<Product>): Record<string, any> {
  const row: Record<string, any> = {};
  if (prod.name !== undefined) row.name = prod.name;
  if (prod.categoryId !== undefined) row.category_id = prod.categoryId;
  if (prod.categoryName !== undefined) row.category_name = prod.categoryName;
  if (prod.description !== undefined) row.description = prod.description;
  if (prod.price !== undefined) row.price = prod.price;
  if (prod.cost !== undefined) row.cost = prod.cost;
  if (prod.suggestedPrice !== undefined) row.suggested_price = prod.suggestedPrice;
  if (prod.image !== undefined) row.image = prod.image;
  if (prod.isAvailable !== undefined) row.is_available = prod.isAvailable;
  if (prod.isFeatured !== undefined) row.is_featured = prod.isFeatured;
  if (prod.channels !== undefined) row.channels = prod.channels;
  if (prod.recipeItems !== undefined) row.recipe_items = prod.recipeItems;
  return row;
}

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching products from Supabase:', error);
    return [];
  }
  return (data || []).map(mapRowToProduct);
}

export async function createProduct(prodData: Omit<Product, 'id'>): Promise<Product | null> {
  if (!isSupabaseConfigured) return null;
  const row = mapProductToRow(prodData);
  const { data, error } = await supabase.from('products').insert(row).select().single();
  if (error) {
    console.error('Error creating product in Supabase:', error);
    return null;
  }
  return mapRowToProduct(data);
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  if (!isSupabaseConfigured) return null;
  const row = mapProductToRow(updates);
  const { data, error } = await supabase.from('products').update(row).eq('id', id).select().single();
  if (error) {
    console.error('Error updating product in Supabase:', error);
    return null;
  }
  return mapRowToProduct(data);
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    console.error('Error deleting product in Supabase:', error);
    return false;
  }
  return true;
}
