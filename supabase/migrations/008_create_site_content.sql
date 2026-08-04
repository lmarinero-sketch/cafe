-- Migration: Create site_content table for mini-CMS
-- Hilos de Amor — Plataforma Gastronómica

CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  value TEXT DEFAULT '',
  type TEXT DEFAULT 'text',
  label TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read site_content" ON site_content FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert site_content" ON site_content FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update site_content" ON site_content FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete site_content" ON site_content FOR DELETE TO anon USING (true);

-- Trigger for updated_at
CREATE TRIGGER site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed default site content
INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
  -- Hero
  ('hero', 'hero_badge', '✨ Pastelería de Autor & Encordado Artesanal', 'text', 'Badge del Hero', 1),
  ('hero', 'hero_title', 'Cada bocado, un hilo de amor que conecta lo artesanal con vos', 'text', 'Título Principal', 2),
  ('hero', 'hero_subtitle', 'Pastelería artesanal, café de especialidad y talleres de encordado en San Juan, Argentina. Viví la experiencia de lo hecho con cariño.', 'text', 'Subtítulo', 3),
  ('hero', 'hero_cta_primary', 'Sumate al Club', 'text', 'Texto botón principal', 4),
  ('hero', 'hero_cta_secondary', 'Ver Productos', 'text', 'Texto botón secundario', 5),
  -- About
  ('about', 'about_title', 'Dos pasiones, un solo lugar', 'text', 'Título sección', 1),
  ('about', 'about_pillar1_title', 'Pastelería de Autor', 'text', 'Título Pilar 1', 2),
  ('about', 'about_pillar1_desc', 'Medialunas de manteca pura horneadas cada mañana, cheesecakes artesanales, tortas de chocolate belga y café de especialidad 100% arábica. Todo hecho en casa, sin conservantes, con ingredientes seleccionados de San Juan.', 'text', 'Descripción Pilar 1', 3),
  ('about', 'about_pillar2_title', 'Encordado Artesanal', 'text', 'Título Pilar 2', 4),
  ('about', 'about_pillar2_desc', 'Talleres presenciales de macramé, pulseras tejidas y accesorios con hilos de algodón egipcio. Aprendé una nueva técnica mientras disfrutás un café. Ideales para grupos, cumpleaños y después del trabajo.', 'text', 'Descripción Pilar 2', 5),
  -- Product Star
  ('product_star', 'star_name', 'Nano Banana Coffee ☕🍌', 'text', 'Nombre del producto estrella', 1),
  ('product_star', 'star_desc', 'Doble espresso 100% arábica emulsionado con crema aterciopelada de banana orgánica, terminado con canela y cacao amargo. Una experiencia única.', 'text', 'Descripción', 2),
  ('product_star', 'star_price', '4500', 'text', 'Precio', 3),
  ('product_star', 'star_image', '/nano_banana_coffee.png', 'image_url', 'Imagen del producto', 4),
  ('product_star', 'star_badge', '🍌 Lanzamiento 2026', 'text', 'Badge', 5),
  -- Social
  ('social', 'social_whatsapp', '5492644228900', 'text', 'WhatsApp principal', 1),
  ('social', 'social_instagram', 'hilosdeamor.sj', 'text', 'Instagram handle', 2),
  ('social', 'social_facebook', '', 'text', 'Facebook URL', 3),
  -- Footer
  ('footer', 'footer_desc', 'Pastelería artesanal, café de especialidad y talleres de encordado en San Juan, Argentina.', 'text', 'Descripción del footer', 1),
  ('footer', 'footer_copyright', '© 2026 Hilos de Amor • Pastelería & Encordado • San Juan, Argentina', 'text', 'Copyright', 2);
