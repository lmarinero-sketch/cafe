-- Migration 017: Add tip support to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tip_amount NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tip_percentage NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tip_registered_by TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS tip_registered_at TIMESTAMPTZ;
