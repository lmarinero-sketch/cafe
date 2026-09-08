import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ExcelExportInfo {
  type: string;
  filename: string;
  title: string;
  rowCount: number;
}

export interface PdfReportInfo {
  type: 'sales' | 'customers' | 'products' | 'cash';
  filename: string;
  title: string;
  period: string;
  dateLabel: string;
}

export { openPdfSalesReport } from './reportPdfService';

// Function to generate and trigger browser Excel file download using XLSX (SheetJS)
export async function generateAndTriggerExcel(
  type: string, 
  filename: string, 
  _title: string
): Promise<{ rowCount: number }> {
  const wb = XLSX.utils.book_new();
  let rowCount = 0;

  if (type === 'sales' || type === 'ventas') {
    const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const rows = (orders || []).map((o: any) => ({
      'Código': o.code || `#${o.id.slice(0, 6)}`,
      'Fecha': o.created_at ? new Date(o.created_at).toLocaleString('es-AR') : '',
      'Cliente': o.customer_name || 'Consumidor Final',
      'Teléfono': o.customer_phone || '-',
      'Tipo de Pedido': o.type === 'dine_in' ? 'Salón' : o.type === 'delivery' ? 'Delivery' : 'Take Away',
      'Mesa': o.table_name || '-',
      'Subtotal ($)': o.subtotal || o.total || 0,
      'Propina ($)': o.tip_amount || 0,
      'Total ($)': o.total || 0,
      'Método de Pago': o.payment_method || 'Efectivo',
      'Estado': o.status || 'Completado'
    }));
    rowCount = rows.length;
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');

  } else if (type === 'customers' || type === 'clientes') {
    const { data: customers } = await supabase.from('customers').select('*').order('points', { ascending: false });
    const rows = (customers || []).map((c: any) => ({
      'Nombre': c.first_name || '',
      'Apellido': c.last_name || '',
      'Teléfono': c.phone || '',
      'Email': c.email || '',
      'Puntos Actuales': c.points || 0,
      'Nivel': c.level || 'Bronce',
      'Gasto Acumulado ($)': c.total_spent || 0,
      'Visitas / Compras': c.purchase_count || 0,
      'Ticket Promedio ($)': c.average_ticket || 0,
      'Fecha Registro': c.registration_date ? new Date(c.registration_date).toLocaleDateString('es-AR') : '',
      'Producto Favorito': c.favorite_product || '-'
    }));
    rowCount = rows.length;
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes y Puntos');

  } else if (type === 'products' || type === 'productos') {
    const { data: prods } = await supabase.from('products').select('*').order('category_name').order('name');
    const rows = (prods || []).map((p: any) => ({
      'Nombre del Producto': p.name || '',
      'Categoría': p.category_name || 'General',
      'Precio Venta ($)': p.price || 0,
      'Costo Receta ($)': p.cost || 0,
      'Margen Bruto ($)': (Number(p.price) || 0) - (Number(p.cost) || 0),
      'Margen %': p.price && p.cost ? `${Math.round(((p.price - p.cost) / p.price) * 100)}%` : '-',
      'Disponible': p.is_available ? 'SÍ' : 'NO',
      'Destacado': p.is_featured ? 'SÍ' : 'NO',
      'Descripción': p.description || ''
    }));
    rowCount = rows.length;
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Carta y Precios');

  } else if (type === 'ingredients' || type === 'insumos') {
    const { data: ings } = await supabase.from('ingredients').select('*').order('name');
    const rows = (ings || []).map((i: any) => ({
      'Ingrediente / Insumo': i.name || '',
      'Precio de Compra ($)': i.purchase_price || 0,
      'Unidad de Compra': i.purchase_unit || 'un',
      'Merma Estimada (%)': i.waste_percent || 0,
      'Costo Normalizado ($)': i.normalized_cost || i.purchase_price || 0,
      'Proveedor': i.supplier || '-'
    }));
    rowCount = rows.length;
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Insumos y Costos');

  } else if (type === 'cash' || type === 'caja') {
    const { data: txs } = await supabase.from('cash_transactions').select('*').order('created_at', { ascending: false });
    const rows = (txs || []).map((t: any) => ({
      'Fecha / Hora': t.created_at ? new Date(t.created_at).toLocaleString('es-AR') : '',
      'Tipo': t.type === 'ingreso' ? 'INGRESO' : 'EGRESO',
      'Monto ($)': t.amount || 0,
      'Concepto': t.description || '',
      'Método de Pago': t.payment_method || 'Efectivo',
      'Registrado Por': t.registered_by || 'Sistema'
    }));
    rowCount = rows.length;
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Movimientos de Caja');
  }

  // Trigger file download in browser
  if (typeof window !== 'undefined') {
    XLSX.writeFile(wb, filename);
  }

  return { rowCount };
}

// Invokes the secure Supabase Edge Function 'oliver-chat' (which contains the secret OPENAI_API_KEY)
export async function askOliver(
  messages: ChatMessage[], 
  activeRoute: string = '/dashboard'
): Promise<{ reply: string; exportTag?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('oliver-chat', {
      body: {
        messages: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        activeRoute
      }
    });

    if (error) {
      console.error('Error invoking oliver-chat edge function:', error);
      return {
        reply: `⚠️ Error al conectar con Oliver: ${error.message || 'Error de conexión con la Edge Function'}`
      };
    }

    if (data?.error) {
      return {
        reply: `⚠️ ${data.error}`
      };
    }

    return {
      reply: data?.reply || 'Disculpá, no pude generar una respuesta en este momento.',
      exportTag: data?.exportTag
    };
  } catch (err: any) {
    console.error('Unexpected error in askOliver:', err);
    return {
      reply: `⚠️ Ocurrió un error inesperado al contactar al asistente: ${err.message || 'Error desconocido'}`
    };
  }
}
