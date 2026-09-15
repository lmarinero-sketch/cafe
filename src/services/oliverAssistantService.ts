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

// Helper: Argentina timezone date handling for periods
function getPeriodDateBounds(period?: string): { from: string | null; to: string | null } {
  if (!period || period === 'all') return { from: null, to: null };
  const now = new Date();
  const argStr = now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' });
  const argNow = new Date(argStr);
  const y = argNow.getFullYear();
  const m = String(argNow.getMonth() + 1).padStart(2, '0');
  const d = String(argNow.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  if (period === 'today' || period === 'hoy') {
    return {
      from: `${todayStr}T00:00:00.000Z`,
      to: `${todayStr}T23:59:59.999Z`
    };
  }
  if (period === 'yesterday' || period === 'ayer') {
    const yest = new Date(argNow.getTime() - 86400000);
    const yStr = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(yest.getDate()).padStart(2, '0')}`;
    return {
      from: `${yStr}T00:00:00.000Z`,
      to: `${yStr}T23:59:59.999Z`
    };
  }
  if (period === 'this_month' || period === 'mes') {
    const lastDay = new Date(y, Number(m), 0).getDate();
    return {
      from: `${y}-${m}-01T00:00:00.000Z`,
      to: `${y}-${m}-${String(lastDay).padStart(2, '0')}T23:59:59.999Z`
    };
  }
  if (period === 'this_week' || period === 'semana') {
    const day = argNow.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(argNow);
    monday.setDate(argNow.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    return {
      from: `${fmt(monday)}T00:00:00.000Z`,
      to: `${fmt(sunday)}T23:59:59.999Z`
    };
  }
  return { from: null, to: null };
}

// Function to generate and trigger browser Excel file download using XLSX (SheetJS)
export async function generateAndTriggerExcel(
  type: string, 
  filename: string, 
  _title: string,
  period?: string
): Promise<{ rowCount: number }> {
  const wb = XLSX.utils.book_new();
  let rowCount = 0;

  if (type === 'sales' || type === 'ventas') {
    const periodToUse = period || (filename.toLowerCase().includes('hoy') || filename.toLowerCase().includes('today') ? 'today' : undefined);
    const { from, to } = getPeriodDateBounds(periodToUse);

    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data: orders } = await query;
    const allOrders = orders || [];
    rowCount = allOrders.length;

    // Sheet 1: Ventas y Pedidos (Resumen de Órdenes)
    const orderRows = allOrders.map((o: any) => {
      const itemsList = (o.items || []).map((it: any) => {
        let name = `${it.quantity || 1}x ${it.productName || it.name || 'Ítem'}`;
        if (it.selectedComboOptions && it.selectedComboOptions.length > 0) {
          const opts = it.selectedComboOptions.map((co: any) => co.productName || co.name).join(', ');
          name += ` [Opciones: ${opts}]`;
        }
        return name;
      }).join(' | ');

      const totalItemsQty = (o.items || []).reduce((acc: number, it: any) => acc + (Number(it.quantity) || 1), 0);

      return {
        'Código': o.code || `#${o.id.slice(0, 6)}`,
        'Fecha y Hora': o.created_at ? new Date(o.created_at).toLocaleString('es-AR') : '',
        'Cliente': o.customer_name || 'Consumidor Final',
        'Teléfono': o.customer_phone || '-',
        'Canal / Tipo': o.type === 'salon' ? 'Salón' : o.type === 'delivery' ? 'Delivery' : 'Para Llevar',
        'Mesa': o.table_name || '-',
        'Productos Vendidos': itemsList || 'Sin detalle',
        'Cantidad Total Ítems': totalItemsQty,
        'Subtotal ($)': o.subtotal || o.total || 0,
        'Propina ($)': o.tip_amount || 0,
        'Total Venta ($)': o.total || 0,
        'Método de Pago': o.payment_method || 'Efectivo',
        'Estado': o.status || 'Completado'
      };
    });

    const wsOrders = XLSX.utils.json_to_sheet(orderRows);
    XLSX.utils.book_append_sheet(wb, wsOrders, 'Ventas y Pedidos');

    // Sheet 2: Detalle de Productos Vendidos (Ítem por Ítem)
    const itemDetailRows: any[] = [];
    const productAggregation: Record<string, { cantidad: number; recaudado: number }> = {};

    allOrders.forEach((o: any) => {
      const orderCode = o.code || `#${o.id.slice(0, 6)}`;
      const orderDate = o.created_at ? new Date(o.created_at).toLocaleString('es-AR') : '';
      const canal = o.type === 'salon' ? 'Salón' : o.type === 'delivery' ? 'Delivery' : 'Para Llevar';
      const medioPago = o.payment_method || 'Efectivo';
      const cliente = o.customer_name || 'Consumidor Final';

      (o.items || []).forEach((it: any) => {
        const prodName = it.productName || it.name || 'Producto';
        const qty = Number(it.quantity) || 1;
        const uPrice = Number(it.unitPrice) || 0;
        const subtotal = uPrice * qty;

        let optionsNotes = it.notes || '';
        if (it.selectedComboOptions && it.selectedComboOptions.length > 0) {
          const opts = it.selectedComboOptions.map((co: any) => co.productName || co.name).join(', ');
          optionsNotes = optionsNotes ? `${optionsNotes} | Opciones: ${opts}` : `Opciones: ${opts}`;
        }

        itemDetailRows.push({
          'Código Pedido': orderCode,
          'Fecha': orderDate,
          'Cliente': cliente,
          'Canal': canal,
          'Producto': prodName,
          'Cantidad': qty,
          'Precio Unitario ($)': uPrice,
          'Subtotal Ítem ($)': subtotal,
          'Opciones Combo / Notas': optionsNotes || '-',
          'Medio de Pago': medioPago,
          'Estado Pedido': o.status || 'Completado'
        });

        if (o.status !== 'cancelado') {
          if (!productAggregation[prodName]) {
            productAggregation[prodName] = { cantidad: 0, recaudado: 0 };
          }
          productAggregation[prodName].cantidad += qty;
          productAggregation[prodName].recaudado += subtotal;
        }
      });
    });

    if (itemDetailRows.length > 0) {
      const wsItems = XLSX.utils.json_to_sheet(itemDetailRows);
      XLSX.utils.book_append_sheet(wb, wsItems, 'Detalle Ítems Vendidos');
    }

    // Sheet 3: Ranking de lo Más Vendido
    const rankingRows = Object.entries(productAggregation)
      .map(([producto, data]) => ({
        'Producto': producto,
        'Unidades Vendidas': data.cantidad,
        'Total Recaudado ($)': data.recaudado
      }))
      .sort((a, b) => b['Unidades Vendidas'] - a['Unidades Vendidas']);

    if (rankingRows.length > 0) {
      const wsRanking = XLSX.utils.json_to_sheet(rankingRows);
      XLSX.utils.book_append_sheet(wb, wsRanking, 'Lo Más Vendido (Ranking)');
    }

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
