-- Migration: Create branches table for configurable store locations
-- Hilos de Amor — Plataforma Gastronómica

CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  zone TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  hours TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  features TEXT[] DEFAULT '{}',
  map_query TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- Public policies for anon access
CREATE POLICY "Allow anon read branches" ON branches FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert branches" ON branches FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update branches" ON branches FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete branches" ON branches FOR DELETE TO anon USING (true);

-- Seed default branches
INSERT INTO branches (name, address, zone, phone, whatsapp, instagram, hours, badge, features, map_query, is_active) VALUES
  ('Sucursal Peatonal Tucumán', 'Tucumán 145 Sur (frente a Plaza 25 de Mayo)', 'Capital, San Juan', '(264) 422-8900', '5492644228900', 'hilosdeamor.sj', 'Lun-Sáb 07:00 a 22:00', 'Casa Central', '{"Terraza Climatizada","WiFi 300MB","Take Away Rápido"}', 'Hilos de Amor Tucumán 145 San Juan Argentina', true),
  ('Sucursal Del Bono Shopping', 'Av. Ignacio de la Roza 1840 Oeste (Paseo Del Bono)', 'Rivadavia, San Juan', '(264) 433-1200', '5492644331200', 'hilosdeamor.sj', 'Todos los días 08:00 a 00:00', 'Coworking', '{"Estacionamiento Gratuito","Espacio Coworking","Pet Friendly"}', 'Paseo Del Bono Shopping San Juan Argentina', true),
  ('Sucursal Paseo San Juan', 'Av. Libertador San Martín 3200 Oeste', 'Desamparados, San Juan', '(264) 441-7500', '5492644417500', 'hilosdeamor.sj', 'Lun-Dom 08:00 a 23:00', 'Drive-Thru', '{"Auto-Café","Jardín al aire libre","Pastelería en vivo"}', 'Paseo San Juan Desamparados Argentina', true);
