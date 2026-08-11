-- Migration: Seed initial data for Plan Fidelización demo
-- Hilos de Amor - Plataforma Gastronómica

-- ============================================================
-- REWARDS SEED DATA
-- ============================================================
INSERT INTO rewards (name, description, points_cost, category, is_available) VALUES
  ('Café Espresso o Cortado Gratis', 'Canjeá tus puntos por un café espresso clásico de cortesía en tu próxima visita.', 350, 'Cafetería', true),
  ('Medialuna de Manteca Adicional', 'Sumá una medialuna de manteca recién horneada a tu desayuno.', 250, 'Pastelería', true),
  ('20% Off en Pastelería', 'Descuento del 20% aplicable sobre cualquier porción de torta o cheesecake.', 500, 'Descuentos', true),
  ('Porción de Cheesecake de Frutos Rojos', 'Disfrutá una porción entera de nuestro emblemático cheesecake.', 800, 'Pastelería', true),
  ('Envío sin Cargo en Delivery', 'Envío completamente gratis para tus pedidos con entrega a domicilio.', 300, 'Delivery', true),
  ('Combo Desayuno Hilos de Amor Gratis', 'Canjeá un combo completo: café con leche + 2 medialunas + jugo exprimido.', 1200, 'Promociones', true),
  ('Upgrade a Taza Extra Grande', 'Agrandá el tamaño de tu café o capuchino al tamaño XL sin costo.', 150, 'Cafetería', true),
  ('Voucher $5.000 para Almuerzos', 'Voucher de $5.000 de descuento en cualquier opción de nuestro menú de almuerzos.', 1500, 'Descuentos', true);

-- ============================================================
-- CUSTOMERS SEED DATA (50 customers)
-- ============================================================
DO $$
DECLARE
  first_names TEXT[] := ARRAY['Sofía', 'Martín', 'Lucía', 'Gonzalo', 'Camila', 'Mateo', 'Valentina', 'Joaquín', 'Isabella', 'Tomas'];
  last_names TEXT[] := ARRAY['Martínez', 'Gómez', 'Benítez', 'Rossi', 'Torres', 'Fernández', 'López', 'Díaz', 'Álvarez', 'Romero'];
  i INTEGER;
  fn TEXT;
  ln TEXT;
  purchases INTEGER;
  total NUMERIC;
  pts INTEGER;
  lvl customer_level;
BEGIN
  FOR i IN 0..49 LOOP
    fn := first_names[(i % 10) + 1];
    IF i >= 10 THEN
      fn := fn || ' ' || (i + 1)::TEXT;
    END IF;
    ln := last_names[(i % 10) + 1];
    purchases := 2 + ((i * 7) % 35);
    total := purchases * (4500 + (i * 850) % 12000);
    pts := ROUND(total * 0.05);

    IF pts > 3000 THEN lvl := 'VIP';
    ELSIF pts > 1500 THEN lvl := 'Preferencial';
    ELSIF pts > 500 THEN lvl := 'Frecuente';
    ELSE lvl := 'Inicial';
    END IF;

    INSERT INTO customers (
      first_name, last_name, phone, email, birth_date,
      registration_date, purchase_count, total_spent, average_ticket,
      last_purchase_date, points, level, used_promotions_count,
      marketing_consent, favorite_product
    ) VALUES (
      fn, ln,
      '+54911' || (50000000 + i * 1111)::TEXT,
      LOWER(first_names[(i % 10) + 1]) || '.' || LOWER(last_names[(i % 10) + 1]) || (i + 1)::TEXT || '@gmail.com',
      '19' || (85 + (i % 20))::TEXT || '-0' || ((i % 9) + 1)::TEXT || '-15',
      '2025-11-10T10:00:00Z'::TIMESTAMPTZ,
      purchases,
      total,
      ROUND(total / purchases),
      now() - ((i % 15) || ' days')::INTERVAL,
      pts,
      lvl,
      i % 4,
      true,
      CASE WHEN i % 2 = 0 THEN 'Café con Leche' ELSE 'Cheesecake de Frutos Rojos' END
    );
  END LOOP;
END $$;

-- ============================================================
-- CAMPAIGNS SEED DATA
-- ============================================================
INSERT INTO campaigns (name, template_name, scheduled_at, status, recipients_count, segment, message, conversion_rate) VALUES
  ('Bienvenida a Nuevos Socios', 'Bienvenida', '2026-07-28T10:00:00Z', 'leido', 42, 'Nuevos registrados (últimos 7 días)', 'Hola {{nombre}}, ¡bienvenido a Hilos de Amor! Te regalamos 150 puntos de bienvenida para tu primera visita. Presentá este mensaje en caja.', 68),
  ('Especial Cumpleaños del Mes', 'Cumpleaños', '2026-07-29T09:00:00Z', 'enviado', 18, 'Cumpleañeros de Julio', '¡Feliz cumpleaños {{nombre}}! 🎂 En tu mes especial, disfrutá una porción de torta gratis al consumir cualquier café en Hilos de Amor. ¡Te esperamos!', 45),
  ('Recuperación de Clientes Inactivos', 'Cliente inactivo', '2026-07-25T16:00:00Z', 'leido', 35, 'Sin compras > 30 días', 'Hola {{nombre}}, ¡te extrañamos en Hilos de Amor! Volvé esta semana y obtené un 20% de descuento en tu café preferido.', 32),
  ('Notificación de Puntos Acumulados', 'Nuevos puntos', '2026-07-27T11:30:00Z', 'entregado', 85, 'Clientes con > 400 puntos', 'Hola {{nombre}}. Tenés {{puntos}} puntos disponibles. Esta semana podés canjearlos por un café y una medialuna. Te esperamos.', 54),
  ('Promoción Fin de Semana Pastelería', 'Promoción semanal', '2026-08-01T09:30:00Z', 'programado', 120, 'Todos los clientes activos', '¡Hola {{nombre}}! Este fin de semana 2x1 en porciones de Cheesecake y Torta Fudge pidiendo por nuestra app o en salón.', 0),
  ('Lanzamiento Combo Almuerzo Gourmet', 'Combo especial', '2026-08-03T12:00:00Z', 'programado', 95, 'Clientes de Almuerzos', '{{nombre}}, probá nuestro nuevo Combo Hamburguesa Artesanal + Limonada con 15% de descuento exclusivo esta semana.', 0);

-- ============================================================
-- AUTOMATIONS SEED DATA
-- ============================================================
INSERT INTO automations (name, condition, segment, message, status, next_run, estimated_recipients, executed_count) VALUES
  ('Bienvenida tras el Registro', 'Cliente se registra en el menú digital o caja', 'Nuevos Clientes', '¡Hola! Te damos la bienvenida a Hilos de Amor. Acumulás 150 puntos por registrarte.', 'activa', 'En tiempo real', 15, 142),
  ('Saludo y Regalo de Cumpleaños', 'Es la fecha de cumpleaños del cliente', 'Cumpleañeros', '¡Feliz cumpleaños {{nombre}}! Tenés una porción de torta gratis esperándote.', 'activa', 'Todos los días 09:00 hs', 3, 88),
  ('Aviso de Recompensa Disponible', 'Puntos del cliente superan costo de recompensa', 'Clientes con Puntos Canjeables', 'Hola {{nombre}}, alcanzaste {{puntos}} puntos. ¡Ya podés canjear tu beneficio!', 'activa', 'Semanal (Lunes 10:00 hs)', 24, 310),
  ('Recuperación de Cliente Inactivo (30 días)', 'Días desde última compra >= 30', 'Clientes Inactivos', 'Hace tiempo no te vemos por Hilos de Amor. Te regalamos 20% off en tu próxima visita.', 'activa', 'Diario a las 11:00 hs', 8, 165),
  ('Oferta Desayuno para Clientes Matutinos', 'Compra habitual en horario 08:00 - 11:00 hs', 'Compradores Frecuentes de Mañana', 'Empezá tu mañana en Hilos de Amor: 2x1 en Medialunas pidiendo tu café favorito.', 'activa', 'Martes 07:30 hs', 45, 220),
  ('Sugerencia Delivery Nocturno', 'Compra habitual en canal Delivery (19:00 - 22:00 hs)', 'Clientes de Delivery Nocturno', '¿Sin ganas de cocinar hoy? Pedí tu hamburguesa artesanal con envío gratis.', 'activa', 'Viernes 19:00 hs', 38, 190),
  ('Combo Relacionado a Producto Favorito', 'Producto más comprado = Cheesecake de Frutos Rojos', 'Amantes del Cheesecake', 'Hoy acompañá tu Cheesecake favorito con un Capuchino con 30% de descuento.', 'pausada', 'Pausada', 20, 75),
  ('Upgrade a Nivel Preferencial / VIP', 'Cliente asciende de nivel en el programa de puntos', 'Clientes Ascendidos', '¡Felicitaciones {{nombre}}! Ascendiste al Nivel {{nivel}}. Disfrutá de beneficios exclusivos.', 'activa', 'En tiempo real', 5, 42);
