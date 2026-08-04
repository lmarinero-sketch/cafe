-- Migration: Create redemptions table for Plan Fidelización
-- Café Magnolia - Plataforma Gastronómica

CREATE TABLE IF NOT EXISTS redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL DEFAULT 0,
  redeemed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

-- Public policies for demo
CREATE POLICY "Allow anonymous read redemptions"
  ON redemptions FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous insert redemptions"
  ON redemptions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous delete redemptions"
  ON redemptions FOR DELETE TO anon USING (true);
