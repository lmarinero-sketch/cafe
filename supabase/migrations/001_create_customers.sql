-- Migration: Create customers table for Plan Fidelización
-- Café Magnolia - Plataforma Gastronómica

-- Create customer_level enum type
CREATE TYPE customer_level AS ENUM ('Inicial', 'Frecuente', 'Preferencial', 'VIP');

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  birth_date TEXT DEFAULT '',
  registration_date TIMESTAMPTZ DEFAULT now(),
  purchase_count INTEGER DEFAULT 0,
  total_spent NUMERIC(12,2) DEFAULT 0,
  average_ticket NUMERIC(10,2) DEFAULT 0,
  last_purchase_date TIMESTAMPTZ DEFAULT now(),
  points INTEGER DEFAULT 150,
  level customer_level DEFAULT 'Inicial',
  used_promotions_count INTEGER DEFAULT 0,
  marketing_consent BOOLEAN DEFAULT true,
  favorite_product TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Public policies for demo (anon access)
CREATE POLICY "Allow anonymous read customers"
  ON customers FOR SELECT
  TO anon USING (true);

CREATE POLICY "Allow anonymous insert customers"
  ON customers FOR INSERT
  TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous update customers"
  ON customers FOR UPDATE
  TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous delete customers"
  ON customers FOR DELETE
  TO anon USING (true);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
