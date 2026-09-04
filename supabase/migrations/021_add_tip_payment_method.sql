-- Migration 021: Add tip payment method to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tip_payment_method TEXT DEFAULT 'efectivo';
