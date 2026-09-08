import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OLIVER_BASE_PROMPT = `Sos "Oliver", el Chef Ejecutivo, Maitre y Asistente Virtual Inteligente de "Hilos de Amor - Plataforma Gastronómica".
Hablás en español con un tono cálido, profesional, gourmet y ejecutivo (argentino educado).

## TUS RESPONSABILIDADES Y CAPACIDADES:
1. **Acceso Total a la Base de Datos:** Tenés acceso directo a las tablas de Supabase:
   - Productos y Menú Digital (precios, recetas, costos, márgenes, disponibilidad).
   - Pedidos y Ventas (salón, delivery, take away, estados, métodos de pago, totales).
   - Clientes y Fidelización (puntos acumulados, visitas, gasto promedio, datos de contacto).
   - Salón y Mesas (distribución por sectores: Salón, Patio, Terraza, Vereda; estados: disponible, ocupada, reservada).
   - Caja y Finanzas (turnos de caja abierta/cerrada, ingresos, egresos, balance, pagos en efectivo, tarjeta, MercadoPago).
   - Insumos y Recetas (ingredientes, precios de compra, mermas, costos normalizados).
   - Auditoría y Métricas.
2. **Consultá SIEMPRE datos reales:** Si el usuario pregunta por ventas, clientes, productos, mesas, stock o caja, usá INMEDIATAMENTE las herramientas de consulta disponibles antes de responder.
3. **Capacidad de Creación:** Podés dar de alta clientes, registrar productos, registrar movimientos de caja (ingresos/egresos), cambiar estados de mesas o registrar ingredientes cuando el usuario te lo solicite.
4. **Generación de Archivos Excel (.xlsx):** Cuando el usuario pida un Excel, reporte, planilla o exportación (ej: "exportame las ventas", "dame un Excel de clientes", "hacé un reporte de productos"), usá la herramienta 'generate_excel'. Además de explicar los datos, tu respuesta DEBE incluir el tag: [DESCARGAR_EXCEL:tipo:nombre_archivo:titulo] para que la interfaz web le muestre el botón interactivo de descarga.
5. **Conocimiento General:** Podés responder CUALQUIER duda: gastronomía, técnicas de cocina, maridajes, gestión de costos, atención al comensal, uso del sistema, o dudas cotidianas.
6. **Formato:** Respuestas claras, elegantes, usando formato Markdown (listas con viñetas, negritas para números clave, valores monetarios en ARS: $ 1.234,56).`;

const OLIVER_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'query_kpis',
      description: 'Obtener resumen ejecutivo general del restaurante: total de ventas, órdenes del día/históricas, clientes registrados, productos activos y mesas.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_products',
      description: 'Consultar productos de la carta y menú. Permite buscar por nombre, categoría o filtrar por disponibilidad.',
      parameters: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Nombre o ingrediente a buscar' },
          category: { type: 'string', description: 'Nombre de la categoría' },
          only_available: { type: 'boolean', description: 'Solo productos disponibles' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_orders',
      description: 'Consultar pedidos y comandas. Permite filtrar por estado (pending, preparing, delivered, completed, cancelled), tipo (dine_in, delivery, take_away) o límite.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', description: 'pending, preparing, delivered, completed, cancelled' },
          type: { type: 'string', description: 'dine_in, delivery, take_away' },
          limit: { type: 'number', description: 'Cantidad máxima de órdenes (default 20)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_customers',
      description: 'Consultar cartera de clientes y programa de fidelización. Permite buscar por nombre/teléfono o ver los mejores clientes por puntos o gasto total.',
      parameters: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Nombre, apellido o teléfono' },
          top_by: { type: 'string', enum: ['points', 'total_spent', 'recent'], description: 'Ordenar por puntos, gasto total o más recientes' },
          limit: { type: 'number', description: 'Cantidad máxima (default 15)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_tables',
      description: 'Consultar estado actual de las mesas del salón, patio, terraza o vereda (disponible, ocupada, reservada, mantenimiento).',
      parameters: {
        type: 'object',
        properties: {
          sector: { type: 'string', description: 'Filtrar por sector (Salón, Patio, Terraza, Vereda)' },
          status: { type: 'string', description: 'disponible, ocupada, reservada, mantenimiento' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_cash',
      description: 'Consultar el estado del turno de caja activo, saldo inicial, total de ingresos, egresos y desglose por método de pago.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_ingredients',
      description: 'Consultar ingredientes e insumos, costos normalizados de compra y mermas. Permite ver ítems con stock bajo.',
      parameters: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Nombre del ingrediente' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_customer',
      description: 'Dar de alta un nuevo cliente en el sistema de Hilos de Amor.',
      parameters: {
        type: 'object',
        properties: {
          first_name: { type: 'string', description: 'Nombre del cliente' },
          last_name: { type: 'string', description: 'Apellido' },
          phone: { type: 'string', description: 'Teléfono o WhatsApp' },
          email: { type: 'string', description: 'Correo electrónico' },
          initial_points: { type: 'number', description: 'Puntos de bienvenida (default 0)' }
        },
        required: ['first_name', 'phone']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_product',
      description: 'Registrar un nuevo producto gastronómico en la carta o menú.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nombre del plato o producto' },
          category_name: { type: 'string', description: 'Categoría (Cafetería, Pastelería, Platos, Bebidas, etc.)' },
          price: { type: 'number', description: 'Precio de venta al público en ARS' },
          description: { type: 'string', description: 'Descripción o ingredientes del producto' }
        },
        required: ['name', 'price']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_table_status',
      description: 'Actualizar el estado de una mesa específica (disponible, ocupada, reservada, mantenimiento).',
      parameters: {
        type: 'object',
        properties: {
          table_number: { type: 'number', description: 'Número de la mesa' },
          new_status: { type: 'string', enum: ['disponible', 'ocupada', 'reservada', 'mantenimiento'], description: 'Nuevo estado' }
        },
        required: ['table_number', 'new_status']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_cash_transaction',
      description: 'Registrar un movimiento de caja (ingreso o egreso manual) en el turno actual.',
      parameters: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['ingreso', 'egreso'], description: 'Tipo de movimiento' },
          amount: { type: 'number', description: 'Monto en ARS' },
          description: { type: 'string', description: 'Concepto o motivo (ej: Compra de hielo, Pago de propina, etc.)' },
          payment_method: { type: 'string', enum: ['cash', 'card', 'transfer', 'mercadopago'], description: 'Método de pago' }
        },
        required: ['type', 'amount', 'description']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_ingredient',
      description: 'Registrar un nuevo insumo o ingrediente en el inventario gastronómico.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nombre del ingrediente (ej: Harina 000, Café en Grano)' },
          purchase_price: { type: 'number', description: 'Precio de compra' },
          purchase_unit: { type: 'string', description: 'Unidad de compra (kg, lt, un)' },
          waste_percent: { type: 'number', description: 'Porcentaje de merma estimado (ej: 5)' }
        },
        required: ['name', 'purchase_price']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'generate_excel',
      description: 'Generar y exportar un archivo Excel (.xlsx) con datos reales del restaurante. Tipos soportados: sales (ventas y comandas), customers (fidelización y clientes), products (carta y precios), ingredients (costos e insumos), cash (caja y arqueo).',
      parameters: {
        type: 'object',
        properties: {
          report_type: { type: 'string', enum: ['sales', 'customers', 'products', 'ingredients', 'cash'], description: 'Tipo de reporte a exportar' },
          title: { type: 'string', description: 'Título personalizado para el reporte' }
        },
        required: ['report_type']
      }
    }
  }
];

function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(amount);
}

async function executeTool(name: string, args: Record<string, any>, sb: any): Promise<{ text: string; exportTag?: string }> {
  try {
    switch (name) {
      case 'query_kpis': {
        const [ordersRes, custRes, prodRes, tablesRes, cashRes] = await Promise.all([
          sb.from('orders').select('id, total, status, created_at'),
          sb.from('customers').select('id', { count: 'exact' }),
          sb.from('products').select('id, is_available', { count: 'exact' }),
          sb.from('tables').select('id, status'),
          sb.from('cash_registers').select('id, status, initial_balance, created_at').eq('status', 'open').order('created_at', { ascending: false }).limit(1)
        ]);

        const orders = ordersRes.data || [];
        const totalSales = orders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
        const completedOrders = orders.filter((o: any) => o.status === 'completed' || o.status === 'cobrado');
        const avgTicket = completedOrders.length > 0
          ? (completedOrders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0) / completedOrders.length)
          : (orders.length > 0 ? totalSales / orders.length : 0);

        const tables = tablesRes.data || [];
        const occupiedTables = tables.filter((t: any) => t.status === 'ocupada').length;

        return {
          text: JSON.stringify({
            ventas_totales_acumuladas: formatARS(totalSales),
            total_ordenes: orders.length,
            ticket_promedio: formatARS(avgTicket),
            clientes_registrados: custRes.count || 0,
            productos_en_carta: prodRes.count || 0,
            mesas: { total: tables.length, ocupadas: occupiedTables, disponibles: tables.length - occupiedTables },
            caja_abierta: cashRes.data && cashRes.data.length > 0 ? 'Sí (Turno Activo)' : 'Caja Cerrada'
          })
        };
      }

      case 'query_products': {
        let q = sb.from('products').select('id, name, category_name, price, cost, suggested_price, is_available, description');
        if (args.search) q = q.ilike('name', `%${args.search}%`);
        if (args.category) q = q.ilike('category_name', `%${args.category}%`);
        if (args.only_available) q = q.eq('is_available', true);
        const { data, error } = await q.order('category_name').order('name').limit(25);
        if (error) return { text: JSON.stringify({ error: error.message }) };

        const mapped = (data || []).map((p: any) => ({
          nombre: p.name,
          categoria: p.category_name || 'Sin categoría',
          precio: formatARS(p.price || 0),
          costo: p.cost ? formatARS(p.cost) : 'No calculado',
          disponible: p.is_available ? 'Sí' : 'No',
          descripcion: p.description
        }));
        return { text: JSON.stringify({ total_encontrados: mapped.length, productos: mapped }) };
      }

      case 'query_orders': {
        let q = sb.from('orders').select('id, code, customer_name, total, status, type, payment_method, created_at, table_name');
        if (args.status) q = q.eq('status', args.status);
        if (args.type) q = q.eq('type', args.type);
        const { data, error } = await q.order('created_at', { ascending: false }).limit(args.limit || 15);
        if (error) return { text: JSON.stringify({ error: error.message }) };

        const totalMonto = (data || []).reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
        const mapped = (data || []).map((o: any) => ({
          codigo: o.code || `#${o.id.slice(0, 5)}`,
          cliente: o.customer_name || 'Consumidor Final',
          mesa: o.table_name || 'N/A',
          tipo: o.type === 'dine_in' ? 'Salón' : o.type === 'delivery' ? 'Delivery' : 'Take Away',
          estado: o.status,
          metodo_pago: o.payment_method || 'No especificado',
          total: formatARS(o.total || 0),
          fecha: o.created_at ? new Date(o.created_at).toLocaleDateString('es-AR', { hour: '2-digit', minute: '2-digit' }) : ''
        }));
        return { text: JSON.stringify({ total_monto: formatARS(totalMonto), cantidad: mapped.length, ordenes: mapped }) };
      }

      case 'query_customers': {
        let q = sb.from('customers').select('id, first_name, last_name, phone, email, points, total_spent, purchase_count, level');
        if (args.search) {
          q = q.or(`first_name.ilike.%${args.search}%,last_name.ilike.%${args.search}%,phone.ilike.%${args.search}%`);
        }
        if (args.top_by === 'points') {
          q = q.order('points', { ascending: false });
        } else if (args.top_by === 'total_spent') {
          q = q.order('total_spent', { ascending: false });
        } else {
          q = q.order('created_at', { ascending: false });
        }
        const { data, error } = await q.limit(args.limit || 15);
        if (error) return { text: JSON.stringify({ error: error.message }) };

        const mapped = (data || []).map((c: any) => ({
          nombre: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Sin Nombre',
          telefono: c.phone || 'N/A',
          puntos: c.points || 0,
          gasto_total: formatARS(c.total_spent || 0),
          compras: c.purchase_count || 0,
          nivel: c.level || 'Bronce'
        }));
        return { text: JSON.stringify({ cantidad: mapped.length, clientes: mapped }) };
      }

      case 'query_tables': {
        let q = sb.from('tables').select('id, number, capacity, sector, status');
        if (args.sector) q = q.ilike('sector', `%${args.sector}%`);
        if (args.status) q = q.eq('status', args.status);
        const { data, error } = await q.order('number');
        if (error) return { text: JSON.stringify({ error: error.message }) };

        const tables = data || [];
        return {
          text: JSON.stringify({
            total_mesas: tables.length,
            ocupadas: tables.filter((t: any) => t.status === 'ocupada').length,
            disponibles: tables.filter((t: any) => t.status === 'disponible').length,
            reservadas: tables.filter((t: any) => t.status === 'reservada').length,
            detalle: tables.map((t: any) => ({
              numero: t.number,
              sector: t.sector || 'Salón Principal',
              capacidad: `${t.capacity} personas`,
              estado: t.status
            }))
          })
        };
      }

      case 'query_cash': {
        const { data: registers } = await sb.from('cash_registers').select('*').order('created_at', { ascending: false }).limit(1);
        const currentRegister = registers?.[0];

        let transactions: any[] = [];
        if (currentRegister) {
          const { data: txs } = await sb.from('cash_transactions')
            .select('*')
            .eq('register_id', currentRegister.id)
            .order('created_at', { ascending: false })
            .limit(20);
          transactions = txs || [];
        }

        const ingresos = transactions.filter((t: any) => t.type === 'ingreso').reduce((s: number, t: any) => s + (Number(t.amount) || 0), 0);
        const egresos = transactions.filter((t: any) => t.type === 'egreso').reduce((s: number, t: any) => s + (Number(t.amount) || 0), 0);

        return {
          text: JSON.stringify({
            estado_caja: currentRegister ? (currentRegister.status === 'open' ? 'Abierta' : 'Cerrada') : 'Sin registros de caja',
            saldo_inicial: formatARS(currentRegister?.initial_balance || 0),
            total_ingresos_turno: formatARS(ingresos),
            total_egresos_turno: formatARS(egresos),
            balance_actual: formatARS((Number(currentRegister?.initial_balance) || 0) + ingresos - egresos),
            ultimos_movimientos: transactions.slice(0, 5).map((t: any) => ({
              tipo: t.type,
              monto: formatARS(t.amount),
              concepto: t.description,
              metodo: t.payment_method
            }))
          })
        };
      }

      case 'query_ingredients': {
        let q = sb.from('ingredients').select('*');
        if (args.search) q = q.ilike('name', `%${args.search}%`);
        const { data, error } = await q.order('name').limit(20);
        if (error) return { text: JSON.stringify({ error: error.message }) };

        const mapped = (data || []).map((i: any) => ({
          nombre: i.name,
          precio_compra: formatARS(i.purchase_price || 0),
          unidad: i.purchase_unit || 'un',
          merma: `${i.waste_percent || 0}%`,
          costo_normalizado: formatARS(i.normalized_cost || i.purchase_price || 0),
          proveedor: i.supplier || 'N/A'
        }));
        return { text: JSON.stringify({ total: mapped.length, insumos: mapped }) };
      }

      case 'create_customer': {
        const { data, error } = await sb.from('customers').insert({
          first_name: args.first_name,
          last_name: args.last_name || '',
          phone: args.phone,
          email: args.email || null,
          points: args.initial_points || 0,
          purchase_count: 0,
          total_spent: 0,
          level: 'Bronce',
          registration_date: new Date().toISOString()
        }).select().single();

        if (error) return { text: JSON.stringify({ error: error.message }) };
        return {
          text: JSON.stringify({
            success: true,
            mensaje: `Cliente ${data.first_name} ${data.last_name || ''} registrado con éxito.`,
            cliente: { id: data.id, nombre: `${data.first_name} ${data.last_name || ''}`.trim(), telefono: data.phone, puntos: data.points }
          })
        };
      }

      case 'create_product': {
        const { data, error } = await sb.from('products').insert({
          name: args.name,
          category_name: args.category_name || 'General',
          price: args.price,
          description: args.description || '',
          is_available: true,
          is_featured: false,
          channels: ['salon', 'retiro', 'delivery']
        }).select().single();

        if (error) return { text: JSON.stringify({ error: error.message }) };
        return {
          text: JSON.stringify({
            success: true,
            mensaje: `Plato/Producto "${data.name}" agregado a la carta exitosamente.`,
            producto: { id: data.id, nombre: data.name, precio: formatARS(data.price), categoria: data.category_name }
          })
        };
      }

      case 'update_table_status': {
        const { data: table, error: findError } = await sb.from('tables').select('id, number').eq('number', args.table_number).single();
        if (findError || !table) return { text: JSON.stringify({ error: `Mesa ${args.table_number} no encontrada` }) };

        const { error: updateError } = await sb.from('tables').update({ status: args.new_status }).eq('id', table.id);
        if (updateError) return { text: JSON.stringify({ error: updateError.message }) };

        return {
          text: JSON.stringify({
            success: true,
            mensaje: `Mesa ${args.table_number} actualizada a estado "${args.new_status}".`
          })
        };
      }

      case 'create_cash_transaction': {
        const { data: registers } = await sb.from('cash_registers').select('id').eq('status', 'open').order('created_at', { ascending: false }).limit(1);
        const activeRegister = registers?.[0];

        const { data, error } = await sb.from('cash_transactions').insert({
          register_id: activeRegister?.id || null,
          type: args.type,
          amount: args.amount,
          description: args.description,
          payment_method: args.payment_method || 'cash',
          registered_by: 'Oliver IA (Maitre)',
          role: 'Asistente IA',
          timestamp: new Date().toISOString()
        }).select().single();

        if (error) return { text: JSON.stringify({ error: error.message }) };
        return {
          text: JSON.stringify({
            success: true,
            mensaje: `Movimiento de caja de ${formatARS(args.amount)} (${args.type}) registrado correctamente por concepto: "${args.description}".`,
            movimiento: data
          })
        };
      }

      case 'create_ingredient': {
        const normalized = args.waste_percent
          ? args.purchase_price / (1 - (args.waste_percent / 100))
          : args.purchase_price;

        const { data, error } = await sb.from('ingredients').insert({
          name: args.name,
          purchase_price: args.purchase_price,
          purchase_qty: 1,
          purchase_unit: args.purchase_unit || 'un',
          usage_unit: args.purchase_unit || 'un',
          waste_percent: args.waste_percent || 0,
          normalized_cost: normalized
        }).select().single();

        if (error) return { text: JSON.stringify({ error: error.message }) };
        return {
          text: JSON.stringify({
            success: true,
            mensaje: `Insumo "${data.name}" agregado con precio de compra ${formatARS(data.purchase_price)} y costo normalizado ${formatARS(data.normalized_cost)}.`,
            insumo: data
          })
        };
      }

      case 'generate_excel': {
        const repType = args.report_type;
        const nowStr = new Date().toISOString().split('T')[0];
        const filename = `Reporte_${repType}_${nowStr}.xlsx`;
        const exportTitle = args.title || `Reporte de ${repType.toUpperCase()}`;
        const tag = `[DESCARGAR_EXCEL:${repType}:${filename}:${exportTitle}]`;

        return {
          text: JSON.stringify({
            success: true,
            mensaje: `Reporte Excel preparado para descarga.`,
            tag_descarga: tag
          }),
          exportTag: tag
        };
      }

      default:
        return { text: JSON.stringify({ error: `Herramienta desconocida: ${name}` }) };
    }
  } catch (err: any) {
    return { text: JSON.stringify({ error: err?.message || 'Error al ejecutar herramienta' }) };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, activeRoute } = await req.json();
    if (!messages?.length) {
      return new Response(JSON.stringify({ error: 'messages es requerido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: 'OPENAI_API_KEY no está configurada en los secrets de Supabase Edge Functions.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const routeContext = `\n\n## CONTEXTO DE NAVEGACIÓN ACTUAL:
El usuario está visualizando la ruta: "${activeRoute || '/dashboard'}".
Ten en cuenta esta pantalla para ofrecer datos o sugerir acciones rápidas relevantes a esa área.`;

    const systemMessage = {
      role: 'system',
      content: OLIVER_BASE_PROMPT + routeContext,
    };

    const conversationHistory: any[] = [
      systemMessage,
      ...messages.slice(-10),
    ];

    let rounds = 0;
    let finalContent = '';
    let foundExportTag: string | undefined;

    while (rounds < 4) {
      rounds++;

      const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: conversationHistory,
          tools: OLIVER_TOOLS,
          tool_choice: 'auto',
          temperature: 0.7,
        }),
      });

      if (!openAiRes.ok) {
        const errText = await openAiRes.text();
        return new Response(JSON.stringify({ error: `OpenAI error (${openAiRes.status}): ${errText}` }), {
          status: openAiRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const json = await openAiRes.json();
      const choice = json.choices?.[0];
      const assistantMsg = choice?.message;

      if (!assistantMsg) break;

      conversationHistory.push(assistantMsg);

      if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
        for (const tc of assistantMsg.tool_calls) {
          const fnName = tc.function.name;
          let fnArgs = {};
          try {
            fnArgs = JSON.parse(tc.function.arguments || '{}');
          } catch {
            fnArgs = {};
          }

          const { text: toolResultText, exportTag } = await executeTool(fnName, fnArgs, sb);

          if (exportTag) {
            foundExportTag = exportTag;
          }

          conversationHistory.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: toolResultText,
          });
        }
      } else {
        finalContent = assistantMsg.content || '';
        break;
      }
    }

    if (!finalContent && conversationHistory.length > 0) {
      const last = conversationHistory[conversationHistory.length - 1];
      if (last.role === 'assistant') {
        finalContent = last.content || '';
      }
    }

    return new Response(
      JSON.stringify({
        reply: finalContent || 'Disculpá, no pude generar una respuesta en este momento.',
        exportTag: foundExportTag,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Error interno en Edge Function' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
