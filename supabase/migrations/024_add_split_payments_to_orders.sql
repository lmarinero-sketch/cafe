-- Migration 024: Add split payments and tip payments support to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tip_payments JSONB DEFAULT '[]'::jsonb;
