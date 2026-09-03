-- Migration 018: Add composite / combo product fields to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_composite BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS composite_items JSONB DEFAULT '[]'::jsonb;
