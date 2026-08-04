-- Migration: Create automations table for Plan Fidelización
-- Café Magnolia - Plataforma Gastronómica

-- Create automation_status enum type
CREATE TYPE automation_status AS ENUM ('activa', 'pausada');

CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  condition TEXT DEFAULT '',
  segment TEXT DEFAULT '',
  message TEXT DEFAULT '',
  status automation_status DEFAULT 'activa',
  next_run TEXT DEFAULT '',
  estimated_recipients INTEGER DEFAULT 0,
  executed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

-- Public policies for demo
CREATE POLICY "Allow anonymous read automations"
  ON automations FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous insert automations"
  ON automations FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous update automations"
  ON automations FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous delete automations"
  ON automations FOR DELETE TO anon USING (true);

-- Auto-update updated_at trigger
CREATE TRIGGER automations_updated_at
  BEFORE UPDATE ON automations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
