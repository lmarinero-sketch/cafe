import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?(.*?)["']?\s*$/);
  if (match) env[match[1]] = match[2];
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function seedProducts() {
  const products = [
    { name: 'Espresso Doble Especialidad', category_id: 'cat-cafeteria', category_name: 'Cafetería Especial', description: 'Extracción doble de café arábica 100% de especialidad', price: 2800, cost: 380, suggested_price: 2900, image: '/products/espresso.svg', is_available: true, is_featured: true, channels: ['salon', 'retiro', 'delivery'] },
    { name: 'Capuchino Artesanal Hilos de Amor', category_id: 'cat-cafeteria', category_name: 'Cafetería Especial', description: 'Espresso doble, leche texturizada al vapor y cacao en polvo', price: 3400, cost: 520, suggested_price: 3600, image: '/products/capuchino.svg', is_available: true, is_featured: true, channels: ['salon', 'retiro', 'delivery'] },
    { name: 'Café con Leche Clásico', category_id: 'cat-cafeteria', category_name: 'Cafetería Especial', description: 'Café intenso con abundante leche caliente y espuma cremosa', price: 3100, cost: 450, suggested_price: 3300, image: '/products/cafe-con-leche.svg', is_available: true, is_featured: false, channels: ['salon', 'retiro', 'delivery'] },
    { name: 'Cheesecake de Frutos Rojos', category_id: 'cat-pasteleria', category_name: 'Pastelería & Dulces', description: 'Pastel de queso crema suave con coulis artesanal de frutos del bosque', price: 5200, cost: 1100, suggested_price: 5500, image: '/products/cheesecake.svg', is_available: true, is_featured: true, channels: ['salon', 'retiro', 'delivery'] },
    { name: 'Combo Desayuno Dulce Amor', category_id: 'cat-desayunos', category_name: 'Combos & Desayunos', description: 'Café a elección + 2 medialunas artesanal de manteca + jugo de naranja', price: 6500, cost: 1400, suggested_price: 6800, image: '/products/combo-desayuno.svg', is_available: true, is_featured: true, channels: ['salon', 'retiro'] },
    { name: 'Sándwich Tostado Jamón y Queso', category_id: 'cat-salado', category_name: 'Sándwiches & Salado', description: 'Pan de molde artesanal con manteca, jamón cocido seleccionado y queso tybo', price: 4800, cost: 950, suggested_price: 5000, image: '/products/sandwich.svg', is_available: true, is_featured: false, channels: ['salon', 'retiro', 'delivery'] }
  ];

  for (const prod of products) {
    const { error } = await supabase.from('products').insert(prod);
    if (error) console.error('Error inserting product:', prod.name, error);
    else console.log('✅ Inserted product:', prod.name);
  }
}

seedProducts();
