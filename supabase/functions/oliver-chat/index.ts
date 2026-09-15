import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper: Argentina timezone date handling
function getArgentinaNow(): Date {
  const now = new Date();
  const argStr = now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' });
  return new Date(argStr);
}

function getDateRange(period?: string, dateFrom?: string, dateTo?: string, month?: string): { from: string | null; to: string | null; label: string } {
  const now = getArgentinaNow();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  if (month) {
    const [my, mm] = month.split('-');
    const lastDay = new Date(Number(my), Number(mm), 0).getDate();
    return {
      from: `${month}-01T00:00:00.000Z`,
      to: `${month}-${String(lastDay).padStart(2, '0')}T23:59:59.999Z`,
      label: `Mes ${month}`
    };
  }

  if (period === 'today' || period === 'hoy') {
    return {
      from: `${todayStr}T00:00:00.000Z`,
      to: `${todayStr}T23:59:59.999Z`,
      label: `Hoy (${todayStr})`
    };
  }

  if (period === 'yesterday' || period === 'ayer') {
    const yest = new Date(now.getTime() - 86400000);
    const yStr = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(yest.getDate()).padStart(2, '0')}`;
    return {
      from: `${yStr}T00:00:00.000Z`,
      to: `${yStr}T23:59:59.999Z`,
      label: `Ayer (${yStr})`
    };
  }

  if (period === 'this_month' || period === 'mes' || period === 'este_mes') {
    const lastDay = new Date(y, Number(m), 0).getDate();
    return {
      from: `${y}-${m}-01T00:00:00.000Z`,
      to: `${y}-${m}-${String(lastDay).padStart(2, '0')}T23:59:59.999Z`,
      label: `Mes en curso (${y}-${m})`
    };
  }

  if (period === 'this_week' || period === 'semana') {
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    return {
      from: `${fmt(monday)}T00:00:00.000Z`,
      to: `${fmt(sunday)}T23:59:59.999Z`,
      label: `Esta semana (${fmt(monday)} a ${fmt(sunday)})`
    };
  }

  if (dateFrom || dateTo) {
    return {
      from: dateFrom ? `${dateFrom}T00:00:00.000Z` : null,
      to: dateTo ? `${dateTo}T23:59:59.999Z` : null,
      label: `${dateFrom || ''} a ${dateTo || ''}`
    };
  }

  return { from: null, to: null, label: 'Histórico Completo' };
}

function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(amount);
}

function formatCompositeDetails(row: any): { itemsFijos: string[]; gruposEleccion: any[] } {
  let items: any[] = [];
  let groups: any[] = [];
  if (Array.isArray(row.composite_items)) {
    items = row.composite_items;
  } else if (row.composite_items && typeof row.composite_items === 'object') {
    items = Array.isArray(row.composite_items.items) ? row.composite_items.items : [];
    groups = Array.isArray(row.composite_items.groups) ? row.composite_items.groups : [];
  }

  const itemsFijos = items.map((it: any) => `${it.quantity || 1}x ${it.productName || it.name || 'Producto'}`);
  const gruposEleccion = groups.map((g: any) => ({
    nombre_grupo: g.name,
    elegir: `${g.maxSelectable || 1} opción(es)`,
    alternativas: (g.options || []).map((o: any) => o.productName || o.name || 'Opción')
  }));

  return { itemsFijos, gruposEleccion };
}

const OLIVER_BASE_PROMPT = `Sos "Oliver", el Chef Ejecutivo, Maitre y Asistente Virtual Inteligente de "Hilos de Amor - Plataforma Gastronómica" (creada y potenciada por Grow Labs • www.growlabs.lat).
Hablás en español con un tono cálido, profesional, gourmet y ejecutivo (español argentino rioplatense educado: tratás de vos con respeto y calidez).

## TU ROL Y CAPACIDADES:
- Asesorar a dueños, administradores, mozos y cajeros sobre el funcionamiento integral del restaurante, cafetería, cocina y salón.
- Consultar en tiempo real y con precisión quirúrgica las ventas, pedidos, combos, carta de productos, clientes, mesas, caja diaria e insumos.
- Explicar y asesorar sobre los combos gastronómicos y promociones, detallando qué incluye de forma fija (Lógica Y) y qué opciones puede elegir el comensal (Lógica O).
- Generar Reportes Ejecutivos en PDF listos para imprimir/guardar con la estética oficial del proyecto (generate_pdf_report).
- Exportar planillas Excel (.xlsx) completas para auditoría o administración (generate_excel).
- Registrar nuevos clientes, productos, movimientos de caja o insumos.

## CONOCIMIENTO CLAVE DEL SISTEMA Y REGLAS DE NEGOCIO:

1. **VENTAS = PEDIDOS (ORDERS):**
   - En este restaurante y sistema, **LAS VENTAS SON LOS PEDIDOS**. No existe una tabla separada de ventas: toda la facturación proviene de la tabla 'orders'.
   - Cada pedido registrado en 'orders' representa una **venta**.
   - Los pedidos válidos/concretados son todos aquellos que **NO están cancelados** (estados: 'entregado', 'en_camino', 'preparando', 'pendiente', 'cobrado', 'confirmado', 'nuevo').
   - Los pedidos con estado 'cancelado' se informan por separado pero no suman a la recaudación.
   - El monto de cada venta es el campo 'total'.

2. **CONSULTAS DE VENTAS Y PERÍODOS TEMPORALES:**
   - Si te preguntan: "¿cómo fueron las ventas de ayer?", "¿cuánto vendimos hoy?", "¿y en el mes?", "¿cuáles son las ventas de la semana?", DEBES USAR la herramienta 'query_kpis' o 'query_orders' pasando el período ('yesterday', 'today', 'this_month', 'this_week') o el mes correspondiente.
   - Mostrá siempre los datos reales con importes concretos en ARS ($) y cantidad de pedidos.

3. **CENTRO DE CONTROL "VENTAS DEL DÍA" (EN DASHBOARD):**
   - En el Dashboard principal del sistema, al hacer clic en la tarjeta / botón "Ventas del Día" se abre un modal interactivo con la lista completa de todos los pedidos de la jornada actual.
   - Permite filtrar por método de pago (Efectivo, Tarjeta, Transferencia, Mercado Pago), auditar importes, ver el estado de cada comanda y abrir/imprimir el ticket digital detallado.
   - La base de datos fue purgada de pedidos de prueba anteriores al 13/09/2026; todos los pedidos y ventas actuales son datos 100% reales.

4. **SISTEMA DE COMBOS Y PROMOCIONES (LÓGICA "Y" y LÓGICA "O"):**
   - El restaurante cuenta con un potente motor de combos en el catálogo de productos ('products' con is_composite = true).
   - **Lógica "Y" (Ítems fijos / obligatorios):** Productos que vienen siempre incluidos por defecto en el combo (ej: 1 Chipanguchito, 4 Chipá, 2 Jugos de Naranja).
   - **Lógica "O" (Grupos de opciones a elección):** Grupos de alternativas donde el cliente o mozo elige una opción (ej: "Bebida caliente a elección: Café con leche O Cortado O Lágrima O Americano"; "Dulce a elección: Tarta individual O Alfajor artesanal"; "Panadería a elección: 2 Medialunas O 2 Tortitas/Semitas").
   - **Combos vigentes en Hilos de Amor:**
     - *Combo Individual 1 ($8.500):* Bebida caliente a elección (1) + Panadería a elección (2 medialunas o 2 tortitas/semitas).
     - *Combo Individual 2 ($15.000):* 1 Chipanguchito (fijo) + Licuado a elección (Banana, Frutilla o Durazno).
     - *Combo Individual 3 ($11.000):* Bebida caliente a elección + Tarta individual a elección (Lemon pie, Pirinea, Crumble, Naranja y chocolate) O Alfajor artesanal.
     - *Combo Individual 4 ($14.000):* 1 Vaso de jugo de naranja (fijo) + Ciabatta a elección (Jamón crudo o Veggie).
     - *Combo para Compartir 1 ($18.000):* 2 Bebidas calientes a elección + 1 Porción de torta a elección (Chajá, Rogel, Cheesecake, Carrot cake, Selva negra, Matilda, Nube de nuez, Semifrío de limón).
     - *Combo para Compartir 2 ($17.000):* 2 Vasos de jugo de naranja (fijos) + 1 Ciabatta a elección (Crudo o Veggie).
     - *Combo para Compartir 3 ($22.000):* 4 Chipá (fijos) + 2 Bebidas calientes a elección + 1 Porción de torta a elección.
     - *Combo para Compartir 4 ($21.000):* 2 Vasos de jugo de naranja + 1 Alfajor (fijos) + 1 Variedad de Tostón a elección (Jamón crudo o De campo).
   - Cuando te consulten sobre combos, DEBES USAR 'query_combos' o 'query_products' para brindar detalles exactos y actualizados.
   - Podés explicar cómo crearlos o modificarlos en el módulo de Productos (marcando "Producto Compuesto / Combo", agregando ítems fijos con el botón "Agregar Producto Fijo (Y)" y creando grupos de opciones con el botón "Crear Grupo de Opciones (O)").

5. **CARTA Y MENÚ DIGITAL QR DE MESAS:**
   - Si un comensal escanea el código QR de una mesa en el salón, el menú se abre en **modo de solo consulta/lectura**.
   - Los comensales pueden explorar libremente los platos, bebidas, combos y precios, pero **NO pueden emitir pedidos directos a cocina sin estar registrados**.
   - Esto evita comandas no deseadas y asegura que la toma de pedidos esté a cargo del personal de sala.
   - La toma de comandas móviles mediante el QR está habilitada exclusivamente para mozos y personal autenticado en el sistema.
   - Al pie del menú QR figura el sello y enlace institucional: "Desarrollado con ❤️ por Grow Labs" (con link a www.growlabs.lat).

6. **GENERACIÓN DE REPORTES (PDF Y EXCEL):**
   - **REPORTES EN PDF:** Si el usuario te pide un **PDF** (ej: "puedes darme un pdf de las ventas?", "generame un reporte en pdf", "exportar en pdf", "descargar pdf"), DEBES USAR OBLIGATORIAMENTE la herramienta 'generate_pdf_report'. ¡NUNCA ofrezcas ni generes un Excel cuando te solicitaron un PDF!
   - **PLANILLAS EXCEL:** Si el usuario te pide explícitamente un **Excel** o planilla (.xlsx), usá la herramienta 'generate_excel'.`;

const OLIVER_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'query_combos',
      description: 'Consultar combos y promociones activos de Hilos de Amor. Devuelve el detalle completo: nombre, precio, descripción, ítems fijos obligatorios (lógica Y) y grupos de opciones a elección del cliente (lógica O) con sus alternativas disponibles.',
      parameters: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Nombre o término a buscar (ej: individual, compartir, licuado, ciabatta)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_kpis',
      description: 'Obtener métricas y KPIs de VENTAS Y PEDIDOS del restaurante para cualquier período (hoy, ayer, esta semana, este mes o histórico). RECUERDA: VENTAS = PEDIDOS.',
      parameters: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['today', 'yesterday', 'this_week', 'this_month', 'all'],
            description: 'Período a consultar: today (hoy), yesterday (ayer), this_week (esta semana), this_month (este mes), all (todo)'
          },
          month: {
            type: 'string',
            description: 'Mes específico en formato YYYY-MM (ej: 2026-09) para ver las ventas de ese mes'
          },
          date_from: { type: 'string', description: 'Fecha inicio YYYY-MM-DD' },
          date_to: { type: 'string', description: 'Fecha fin YYYY-MM-DD' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_orders',
      description: 'Consultar lista detallada de pedidos y comandas (ventas). Permite filtrar por período (ayer, hoy, mes actual), estado (entregado, cancelado, etc.) o tipo.',
      parameters: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['today', 'yesterday', 'this_week', 'this_month', 'all'],
            description: 'Período: today, yesterday, this_week, this_month, all'
          },
          month: { type: 'string', description: 'Mes YYYY-MM (ej: 2026-09)' },
          status: { type: 'string', description: 'entregado, cancelado, en_camino, pendiente, preparando' },
          type: { type: 'string', description: 'salon, delivery, retiro' },
          limit: { type: 'number', description: 'Cantidad máxima de órdenes (default 25)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_products',
      description: 'Consultar productos de la carta, menú o combos. Permite buscar por nombre, categoría o filtrar por disponibilidad o combos compuestos.',
      parameters: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Nombre o ingrediente a buscar' },
          category: { type: 'string', description: 'Nombre de la categoría' },
          only_available: { type: 'boolean', description: 'Solo productos disponibles' },
          only_combos: { type: 'boolean', description: 'Filtrar solo combos y productos compuestos' },
          limit: { type: 'number', description: 'Cantidad máxima de productos a devolver' }
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
  },
  {
    type: 'function',
    function: {
      name: 'generate_pdf_report',
      description: 'Generar y preparar para ver/imprimir/guardar como PDF un reporte oficial formal con toda la estética institucional de Hilos de Amor (A4, encabezado de alta gama, métricas ejecutivas, desglose por medio de pago y tabla detallada de ventas). Soporta ventas (sales), clientes (customers), carta (products) y caja (cash). ¡Usar SIEMPRE que el usuario solicite un PDF!',
      parameters: {
        type: 'object',
        properties: {
          report_type: {
            type: 'string',
            enum: ['sales', 'customers', 'products', 'cash'],
            description: 'Tipo de reporte para el PDF: sales (ventas y comandas), customers (clientes), products (carta), cash (caja)'
          },
          period: {
            type: 'string',
            enum: ['today', 'yesterday', 'this_week', 'this_month', 'all'],
            description: 'Período temporal para filtrar las ventas: today (hoy), yesterday (ayer), this_week (esta semana), this_month (este mes), all (histórico completo)'
          },
          title: {
            type: 'string',
            description: 'Título formal del reporte (ej: Reporte Oficial de Ventas y Comandas)'
          },
          date_label: {
            type: 'string',
            description: 'Descripción legible del período o fecha (ej: Ayer 07/09/2026, Septiembre 2026, etc.)'
          }
        },
        required: ['report_type']
      }
    }
  }
];

async function executeTool(name: string, args: Record<string, any>, sb: any): Promise<{ text: string; exportTag?: string }> {
  try {
    switch (name) {
      case 'query_kpis': {
        const { from, to, label } = getDateRange(args.period, args.date_from, args.date_to, args.month);

        let qOrders = sb.from('orders').select('id, total, subtotal, tip_amount, status, type, payment_method, created_at, customer_name, items');
        if (from) qOrders = qOrders.gte('created_at', from);
        if (to) qOrders = qOrders.lte('created_at', to);

        const [ordersRes, custRes, prodRes, tablesRes, cashRes] = await Promise.all([
          qOrders,
          sb.from('customers').select('id', { count: 'exact' }),
          sb.from('products').select('id, is_available', { count: 'exact' }),
          sb.from('tables').select('id, status'),
          sb.from('cash_registers').select('id, status, initial_balance, created_at').eq('status', 'open').order('created_at', { ascending: false }).limit(1)
        ]);

        const allOrders = ordersRes.data || [];
        // VENTAS = PEDIDOS: Valid sales are orders that are NOT cancelled!
        const validSales = allOrders.filter((o: any) => o.status !== 'cancelado');
        const cancelledOrders = allOrders.filter((o: any) => o.status === 'cancelado');
        const deliveredSales = allOrders.filter((o: any) => o.status === 'entregado');

        const totalVentas = validSales.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
        const totalSubtotal = validSales.reduce((sum: number, o: any) => sum + (Number(o.subtotal) || Number(o.total) || 0), 0);
        const totalPropinas = validSales.reduce((sum: number, o: any) => sum + (Number(o.tip_amount) || 0), 0);
        const avgTicket = validSales.length > 0 ? (totalVentas / validSales.length) : 0;

        // Breakdown by channel / type
        const byChannel: Record<string, { cantidad: number; total: number }> = {};
        validSales.forEach((o: any) => {
          const ch = o.type === 'salon' ? 'Salón' : o.type === 'delivery' ? 'Delivery' : 'Para Llevar';
          if (!byChannel[ch]) byChannel[ch] = { cantidad: 0, total: 0 };
          byChannel[ch].cantidad++;
          byChannel[ch].total += Number(o.total) || 0;
        });

        // Breakdown by payment method
        const byPayment: Record<string, { cantidad: number; total: number }> = {};
        validSales.forEach((o: any) => {
          const pm = o.payment_method || 'Efectivo';
          if (!byPayment[pm]) byPayment[pm] = { cantidad: 0, total: 0 };
          byPayment[pm].cantidad++;
          byPayment[pm].total += Number(o.total) || 0;
        });

        const tables = tablesRes.data || [];
        const occupiedTables = tables.filter((t: any) => t.status === 'ocupada').length;

        return {
          text: JSON.stringify({
            periodo_consultado: label,
            ventas_y_pedidos: {
              total_pedidos_registrados: allOrders.length,
              ventas_efectivas_concretadas: validSales.length,
              pedidos_entregados: deliveredSales.length,
              pedidos_cancelados: cancelledOrders.length,
              recaudacion_total_ventas: formatARS(totalVentas),
              recaudacion_total_numero: totalVentas,
              subtotal_bruto: formatARS(totalSubtotal),
              total_propinas: formatARS(totalPropinas),
              ticket_promedio: formatARS(avgTicket),
              desglose_por_canal: Object.entries(byChannel).map(([canal, d]) => ({ canal, cantidad: d.cantidad, total: formatARS(d.total) })),
              desglose_por_metodo_pago: Object.entries(byPayment).map(([metodo, d]) => ({ metodo, cantidad: d.cantidad, total: formatARS(d.total) })),
              ejemplo_ultimos_pedidos: validSales.slice(0, 5).map((o: any) => ({
                codigo: o.code || `#${o.id.slice(0, 5)}`,
                cliente: o.customer_name || 'Cliente',
                monto: formatARS(o.total),
                estado: o.status
              }))
            },
            contexto_general: {
              clientes_registrados: custRes.count || 0,
              productos_en_carta: prodRes.count || 0,
              mesas: { total: tables.length, ocupadas: occupiedTables, disponibles: tables.length - occupiedTables },
              caja_abierta: cashRes.data && cashRes.data.length > 0 ? 'Sí (Turno Activo)' : 'Caja Cerrada'
            }
          })
        };
      }

      case 'query_orders': {
        const { from, to, label } = getDateRange(args.period, null, null, args.month);
        let q = sb.from('orders').select('id, code, customer_name, total, subtotal, status, type, payment_method, created_at, table_name, items');
        if (from) q = q.gte('created_at', from);
        if (to) q = q.lte('created_at', to);
        if (args.status) q = q.eq('status', args.status);
        if (args.type) q = q.eq('type', args.type);
        const { data, error } = await q.order('created_at', { ascending: false }).limit(args.limit || 25);
        if (error) return { text: JSON.stringify({ error: error.message }) };

        const orders = data || [];
        const validSales = orders.filter((o: any) => o.status !== 'cancelado');
        const totalVentas = validSales.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);

        const mapped = orders.map((o: any) => ({
          codigo: o.code || `#${o.id.slice(0, 5)}`,
          cliente: o.customer_name || 'Consumidor Final',
          mesa: o.table_name || 'N/A',
          tipo: o.type === 'salon' ? 'Salón' : o.type === 'delivery' ? 'Delivery' : 'Para Llevar',
          estado: o.status,
          es_venta_valida: o.status !== 'cancelado' ? 'Sí' : 'No (Cancelado)',
          metodo_pago: o.payment_method || 'No especificado',
          total: formatARS(o.total || 0),
          fecha: o.created_at ? new Date(o.created_at).toLocaleDateString('es-AR', { hour: '2-digit', minute: '2-digit' }) : ''
        }));

        return {
          text: JSON.stringify({
            periodo: label,
            total_pedidos_encontrados: orders.length,
            ventas_validas_concretadas: validSales.length,
            total_recaudado: formatARS(totalVentas),
            pedidos: mapped
          })
        };
      }

      case 'query_combos': {
        let q = sb.from('products').select('id, name, category_name, price, cost, suggested_price, is_available, description, is_composite, composite_items').eq('is_composite', true);
        if (args.search) {
          q = q.or(`name.ilike.%${args.search}%,description.ilike.%${args.search}%`);
        }
        const { data, error } = await q.order('name');
        if (error) return { text: JSON.stringify({ error: error.message }) };

        const combos = (data || []).map((p: any) => {
          const comp = formatCompositeDetails(p);
          return {
            nombre: p.name,
            precio: formatARS(p.price || 0),
            descripcion: p.description || '',
            disponible: p.is_available ? 'Sí' : 'No',
            items_fijos_logica_Y: comp.itemsFijos.length > 0 ? comp.itemsFijos : ['Sin productos fijos individuales'],
            grupos_a_eleccion_logica_O: comp.gruposEleccion.length > 0 ? comp.gruposEleccion : ['Consultar opciones en descripción']
          };
        });

        return {
          text: JSON.stringify({
            total_combos_encontrados: combos.length,
            nota_operativa: 'Cada combo se compone de ítems fijos (Lógica Y) y grupos con alternativas a elección (Lógica O).',
            combos
          })
        };
      }

      case 'query_products': {
        let q = sb.from('products').select('id, name, category_name, price, cost, suggested_price, is_available, description, is_composite, composite_items');
        if (args.search) q = q.ilike('name', `%${args.search}%`);
        if (args.category) q = q.ilike('category_name', `%${args.category}%`);
        if (args.only_available) q = q.eq('is_available', true);
        if (args.only_combos) q = q.eq('is_composite', true);
        const { data, error } = await q.order('category_name').order('name').limit(args.limit || 30);
        if (error) return { text: JSON.stringify({ error: error.message }) };

        const mapped = (data || []).map((p: any) => {
          const itemRes: any = {
            nombre: p.name,
            categoria: p.category_name || 'Sin categoría',
            precio: formatARS(p.price || 0),
            costo: p.cost ? formatARS(p.cost) : 'No calculado',
            disponible: p.is_available ? 'Sí' : 'No',
            descripcion: p.description,
            es_combo: p.is_composite ? 'Sí (Producto Compuesto / Combo)' : 'No'
          };
          if (p.is_composite) {
            const comp = formatCompositeDetails(p);
            itemRes.detalle_combo = {
              items_fijos_Y: comp.itemsFijos,
              grupos_opciones_O: comp.gruposEleccion
            };
          }
          return itemRes;
        });
        return { text: JSON.stringify({ total_encontrados: mapped.length, productos: mapped }) };
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
            mensaje: `Reporte Excel de ${repType} preparado para descarga con datos de pedidos y ventas reales.`,
            tag_descarga: tag
          }),
          exportTag: tag
        };
      }

      case 'generate_pdf_report': {
        const repType = args.report_type || 'sales';
        const period = args.period || 'all';
        const nowStr = new Date().toISOString().split('T')[0];
        const filename = `Reporte_${repType}_${period}_${nowStr}.pdf`;
        const exportTitle = args.title || `Reporte Oficial de ${repType === 'sales' ? 'Ventas' : repType.toUpperCase()}`;
        const dateLabel = args.date_label || (period === 'yesterday' ? 'Ayer' : period === 'today' ? 'Hoy' : period === 'this_month' ? 'Este Mes' : 'Histórico');
        const tag = `[DESCARGAR_PDF:${repType}:${filename}:${exportTitle}:${period}:${encodeURIComponent(dateLabel)}]`;

        return {
          text: JSON.stringify({
            success: true,
            mensaje: `Reporte en formato PDF institucional preparado para "${exportTitle}" (${dateLabel}).`,
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

    // Get current date in Argentina
    const nowArg = getArgentinaNow();
    const yestArg = new Date(nowArg.getTime() - 86400000);
    const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    const dateContext = `\n\n## FECHA Y HORA ACTUAL (ARGENTINA):
- 📅 Hoy es ${dayNames[nowArg.getDay()]} ${nowArg.getDate()} de ${monthNames[nowArg.getMonth()]} de ${nowArg.getFullYear()} (${nowArg.toISOString().split('T')[0]}).
- 📅 Ayer fue: ${dayNames[yestArg.getDay()]} ${yestArg.getDate()} de ${monthNames[yestArg.getMonth()]} de ${yestArg.getFullYear()} (${yestArg.toISOString().split('T')[0]}).
- 📅 Mes actual: ${monthNames[nowArg.getMonth()]} de ${nowArg.getFullYear()} (${nowArg.getFullYear()}-${String(nowArg.getMonth() + 1).padStart(2, '0')}).

## CONTEXTO DE NAVEGACIÓN:
El usuario está en: "${activeRoute || '/dashboard'}".`;

    const systemMessage = {
      role: 'system',
      content: OLIVER_BASE_PROMPT + dateContext,
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
          temperature: 0.6,
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
