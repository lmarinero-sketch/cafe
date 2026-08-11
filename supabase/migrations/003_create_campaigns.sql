-- Migration: Create campaigns table for Plan Fidelización
-- Hilos de Amor - Plataforma Gastronómica

-- Create campaign_status enum type
CREATE TYPE campaign_status AS ENUM ('programado', 'enviado', 'entregado', 'leido');

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_name TEXT DEFAULT '',
  scheduled_at TIMESTAMPTZ DEFAULT now(),
  status campaign_status DEFAULT 'programado',
  recipients_count INTEGER DEFAULT 0,
  segment TEXT DEFAULT '',
  message TEXT DEFAULT '',
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Public policies for demo
CREATE POLICY "Allow anonymous read campaigns"
  ON campaigns FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous insert campaigns"
  ON campaigns FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous update campaigns"
  ON campaigns FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous delete campaigns"
  ON campaigns FOR DELETE TO anon USING (true);

-- Auto-update updated_at trigger
CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
