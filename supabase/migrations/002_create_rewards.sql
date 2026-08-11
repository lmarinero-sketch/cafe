-- Migration: Create rewards table for Plan Fidelización
-- Hilos de Amor - Plataforma Gastronómica

CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  points_cost INTEGER NOT NULL DEFAULT 0,
  category TEXT DEFAULT '',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Public policies for demo
CREATE POLICY "Allow anonymous read rewards"
  ON rewards FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous insert rewards"
  ON rewards FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous update rewards"
  ON rewards FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous delete rewards"
  ON rewards FOR DELETE TO anon USING (true);

-- Auto-update updated_at trigger
CREATE TRIGGER rewards_updated_at
  BEFORE UPDATE ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
