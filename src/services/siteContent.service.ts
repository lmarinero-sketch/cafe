import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SiteContent, SiteSection } from '../types';

export const DEFAULT_SITE_CONTENT: SiteContent[] = [
  // Hero
  { id: '1', section: 'hero', key: 'hero_badge', value: '✨ Pastelería de Autor & Encordado Artesanal', type: 'text', label: 'Badge Superior', sortOrder: 1 },
  { id: '2', section: 'hero', key: 'hero_title', value: 'Cada bocado, un hilo de amor que conecta lo artesanal con vos', type: 'text', label: 'Título Principal', sortOrder: 2 },
  { id: '3', section: 'hero', key: 'hero_subtitle', value: 'Pastelería artesanal, café de especialidad y talleres de encordado en San Juan, Argentina. Viví la experiencia de lo hecho con cariño.', type: 'text', label: 'Subtítulo', sortOrder: 3 },
  { id: '4', section: 'hero', key: 'hero_cta_primary', value: 'Sumate al Club', type: 'text', label: 'Texto Botón Principal', sortOrder: 4 },
  { id: '5', section: 'hero', key: 'hero_cta_secondary', value: 'Ver Productos', type: 'text', label: 'Texto Botón Secundario', sortOrder: 5 },
  { id: '6', section: 'hero', key: 'hero_image', value: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80', type: 'image_url', label: 'Imagen de Banner Principal', sortOrder: 6 },
  
  // About
  { id: '7', section: 'about', key: 'about_title', value: 'Dos pasiones, un solo lugar', type: 'text', label: 'Título de Sección', sortOrder: 1 },
  { id: '8', section: 'about', key: 'about_pillar1_title', value: 'Pastelería de Autor', type: 'text', label: 'Título Pilar Pastelería', sortOrder: 2 },
  { id: '9', section: 'about', key: 'about_pillar1_desc', value: 'Medialunas de manteca pura horneadas cada mañana, cheesecakes artesanales, tortas de chocolate belga y café de especialidad 100% arábica. Todo hecho en casa, sin conservantes.', type: 'text', label: 'Descripción Pastelería', sortOrder: 3 },
  { id: '10', section: 'about', key: 'about_pillar2_title', value: 'Encordado Artesanal', type: 'text', label: 'Título Pilar Encordado', sortOrder: 4 },
  { id: '11', section: 'about', key: 'about_pillar2_desc', value: 'Talleres presenciales de macramé, pulseras tejidas y accesorios con hilos de algodón egipcio. Aprendé una nueva técnica mientras disfrutás un café.', type: 'text', label: 'Descripción Encordado', sortOrder: 5 },
  
  // Product Star
  { id: '12', section: 'product_star', key: 'star_name', value: 'Nano Banana Coffee ☕🍌', type: 'text', label: 'Nombre Producto Estrella', sortOrder: 1 },
  { id: '13', section: 'product_star', key: 'star_desc', value: 'Doble espresso 100% arábica emulsionado con crema aterciopelada de banana orgánica, terminado con canela y cacao amargo. Una experiencia única.', type: 'text', label: 'Descripción Producto Estrella', sortOrder: 2 },
  { id: '14', section: 'product_star', key: 'star_price', value: '4500', type: 'text', label: 'Precio ($)', sortOrder: 3 },
  { id: '15', section: 'product_star', key: 'star_image', value: '/nano_banana_coffee.png', type: 'image_url', label: 'Imagen Producto Estrella', sortOrder: 4 },
  { id: '16', section: 'product_star', key: 'star_badge', value: '🍌 Lanzamiento 2026', type: 'text', label: 'Badge Producto Estrella', sortOrder: 5 },
  
  // Club
  { id: '17', section: 'club', key: 'club_title', value: 'Sumate a nuestro Club de Fidelidad', type: 'text', label: 'Título Sección Club', sortOrder: 1 },
  { id: '18', section: 'club', key: 'club_subtitle', value: 'Acumulá puntos en cada consumo, accedé a beneficios exclusivos en tu cumpleaños y disfrutá de refill ilimitado en café de filtro.', type: 'text', label: 'Subtítulo Club', sortOrder: 2 },

  // Social & Contact
  { id: '19', section: 'social', key: 'social_whatsapp', value: '5492644228900', type: 'text', label: 'WhatsApp de Contacto', sortOrder: 1 },
  { id: '20', section: 'social', key: 'social_instagram', value: 'hilosdeamor.sj', type: 'text', label: 'Instagram Handle', sortOrder: 2 },
  { id: '21', section: 'social', key: 'social_facebook', value: 'hilosdeamor.sj', type: 'text', label: 'Facebook / Web', sortOrder: 3 },

  // Footer
  { id: '22', section: 'footer', key: 'footer_desc', value: 'Pastelería artesanal, café de especialidad y talleres de encordado en San Juan, Argentina.', type: 'text', label: 'Descripción Footer', sortOrder: 1 },
  { id: '23', section: 'footer', key: 'footer_copyright', value: '© 2026 Hilos de Amor • Pastelería & Encordado • San Juan, Argentina', type: 'text', label: 'Texto Copyright', sortOrder: 2 },
];

const LOCAL_STORAGE_KEY = 'hilos_site_content_v1';

function mapDbToContent(row: any): SiteContent {
  return {
    id: row.id || row.key,
    section: row.section,
    key: row.key,
    value: row.value || '',
    type: row.type || 'text',
    label: row.label || '',
    sortOrder: row.sort_order || 0,
  };
}

export async function getAllContent(): Promise<SiteContent[]> {
  let loaded: SiteContent[] = [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('site_content').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        loaded = data.map(mapDbToContent);
      }
    } catch (e) {
      console.warn('Could not fetch site_content from Supabase, falling back to local/default', e);
    }
  }

  // Fallback to localStorage if Supabase returned empty
  if (loaded.length === 0) {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        loaded = JSON.parse(saved);
      }
    } catch {
      // ignore
    }
  }

  // Merge with default content to guarantee all keys exist
  const keyMap = new Map<string, SiteContent>();
  DEFAULT_SITE_CONTENT.forEach((item) => keyMap.set(item.key, item));
  loaded.forEach((item) => keyMap.set(item.key, item));

  const result = Array.from(keyMap.values());
  return result;
}

export async function getContentMap(): Promise<Record<string, string>> {
  const list = await getAllContent();
  const map: Record<string, string> = {};
  list.forEach((item) => {
    map[item.key] = item.value;
  });
  return map;
}

export async function upsertMultipleContent(items: { key: string; value: string }[]): Promise<boolean> {
  // Update localStorage first for immediate local reactivity
  try {
    const current = await getAllContent();
    const updated = current.map((c) => {
      const found = items.find((it) => it.key === c.key);
      return found ? { ...c, value: found.value } : c;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving site content to localStorage:', e);
  }

  if (!isSupabaseConfigured) return true;

  try {
    for (const item of items) {
      const { error } = await supabase
        .from('site_content')
        .update({ value: item.value })
        .eq('key', item.key);
      if (error) {
        console.warn(`Error updating ${item.key} in Supabase:`, error);
      }
    }
    return true;
  } catch (e) {
    console.error('Supabase update failed, saved to local storage:', e);
    return true;
  }
}

export function contentToMap(content: SiteContent[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of content) {
    map[item.key] = item.value;
  }
  return map;
}
