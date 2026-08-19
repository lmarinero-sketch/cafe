import { Manual } from '../../types';

export const initialManuals: Manual[] = [
  {
    id: 'man-1',
    category: 'Primeros Pasos',
    title: 'Primeros pasos en Hilos de Amor',
    description: 'Guía rápida para comenzar a operar con la plataforma gastronómica Hilos de Amor.',
    steps: [
      'Ingresá al Dashboard general para visualizar las métricas principales del día.',
      'Verificá qué plan tenés activo en la barra superior (Plan Esencial, Gestión o Fidelización).',
      'Accedé al menú digital o creá tus primeras mesas para empezar a tomar pedidos.',
      'Podés administrar el catálogo y mesas directamente desde los módulos de Productos y Mesas en el panel principal.',
    ],
    faqs: [
      {
        question: '¿Puedo cambiar o actualizar de plan en producción?',
        answer: 'Sí, podés alternar o actualizar tu plan contratado según los requerimientos operativos y comerciales de tu comercio.',
      },
      {
        question: '¿Los datos se guardan al cerrar el navegador?',
        answer: 'Sí, la aplicación almacena y sincroniza tus modificaciones continuamente.',
      },
    ],
  },
  {
    id: 'man-2',
    category: 'Productos',
    title: 'Gestión de Productos y Categorías',
    description: 'Cómo dar de alta, editar, ocultar y definir los canales de venta de cada producto.',
    steps: [
      'Navegá al módulo "Productos" en el menú lateral.',
      'Hacé clic en "Nuevo producto" para abrir el formulario de alta.',
      'Completá nombre, categoría, descripción, precio e imagen del producto.',
      'Definí en qué canales estará disponible: Salón, Retiro o Delivery.',
      'Marcá el switch "Disponible" u "Ocultar" según disponibilidad de stock en cocina.',
    ],
    faqs: [
      {
        question: '¿Cómo marco un producto como destacado?',
        answer: 'Al editar el producto, activá la casilla "Producto destacado" para que aparezca en el carrusel superior del Menú Digital.',
      },
      {
        question: '¿Puedo desactivar un producto temporalmente?',
        answer: 'Sí, con apagar el interruptor de disponibilidad el producto desaparecerá inmediatamente del menú digital de los clientes.',
      },
    ],
  },
  {
    id: 'man-3',
    category: 'Mesas',
    title: 'Gestión de Mesas y Códigos QR',
    description: 'Configuración de sectores, mesas, estados y generación de QR para pedidos en salón.',
    steps: [
      'Ingresá al módulo "Mesas".',
      'Hacé clic en "Agregar mesa" para definir el número, capacidad y sector (Salón, Patio, Terraza o Vereda).',
      'Cambiá el estado de la mesa (Disponible, Ocupada o Reservada) con un simple clic sobre la tarjeta.',
      'Presioná "Ver QR" para desplegar el código QR único de la mesa e iniciar una simulación de pedido desde la mesa.',
    ],
    faqs: [
      {
        question: '¿Qué ocurre al escanear o abrir el QR de una mesa?',
        answer: 'El sistema abre el Menú Digital pre-asociado a esa mesa, asignando automáticamente los consumos a su comanda.',
      },
    ],
  },
  {
    id: 'man-4',
    category: 'Menú Digital',
    title: 'Uso del Menú Digital en Celulares',
    description: 'Cómo interactúa el cliente con la carta interactiva en formato móvil.',
    steps: [
      'Accedé al Menú Digital desde el botón flotante del Dashboard o escaneando el QR de una mesa.',
      'Filtrá los productos por categoría o buscá mediante la barra de búsqueda superior.',
      'Seleccioná los productos deseados, agregá observaciones particulares (ej. "sin azúcar", "sin hielo") y elegí la cantidad.',
      'Hacé clic en "Ver carrito" y confirmá el pedido ingresando datos de contacto o seleccionando envío a domicilio.',
    ],
    faqs: [
      {
        question: '¿El menú digital requiere instalar una aplicación?',
        answer: 'No, es una web app 100% responsive que funciona directamente en el navegador del celular.',
      },
    ],
  },
  {
    id: 'man-5',
    category: 'Pedidos',
    title: 'Panel de Pedidos y Kanban de Delivery',
    description: 'Control visual en tiempo real de comanda de cocina y entregas a domicilio.',
    steps: [
      'Abrí el módulo "Pedidos" o "Delivery".',
      'Observá el tablero Kanban organizado por estados: Nuevo, Confirmado, En preparación, Listo, En camino, Entregado y Cancelado.',
      'Arrastrá y soltá las tarjetas de pedido entre las columnas o usá los botones de acción rápida para avanzar el estado.',
      'Verificá el costo de envío, dirección y teléfono del cliente antes de enviar la orden en camino.',
    ],
    faqs: [
      {
        question: '¿Se notifican los cambios de estado?',
        answer: 'En la demo se generan avisos visuales simulados. En producción se integra con la API de WhatsApp para enviar avisos automáticos.',
      },
    ],
  },
  {
    id: 'man-6',
    category: 'Ingredientes',
    title: 'Carga e Ingredientes y Normalización de Costos',
    description: 'Gestión de materias primas, unidades de compra, mermas y costos por unidad de uso (Plan Gestión).',
    steps: [
      'Ingresá al módulo "Ingredientes" (disponible desde el Plan Gestión).',
      'Creá un ingrediente indicando unidad de compra (ej. 1 kg) y unidad de uso (ej. gramos).',
      'Ingresá el precio de compra y el porcentaje de merma esperado.',
      'El sistema calcula automáticamente el costo unitario normalizado (ej. $24 por gramo de café).',
    ],
    faqs: [
      {
        question: '¿Qué es el porcentaje de merma?',
        answer: 'Es la pérdida de materia prima durante el proceso de elaboración (ej. cáscara de naranja o descarte de grasa de carne).',
      },
    ],
  },
  {
    id: 'man-7',
    category: 'Costos',
    title: 'Recetas, Costo Total y Precios Sugeridos',
    description: 'Matriz de escandallos, margen objetivo y actualización automática de precios de venta (Plan Gestión).',
    steps: [
      'Navegá a "Recetas y Costos".',
      'Seleccioná un producto y asociá los ingredientes utilizados con su cantidad exacta.',
      'Ingresá los costos de empaque y costos directos adicionales.',
      'Establecé el margen objetivo del negocio (ej. 60%).',
      'El sistema calculará: Costo Total = Insumos + Merma + Empaque y Precio Sugerido = Costo / (1 - Margen).',
    ],
    faqs: [
      {
        question: '¿Qué sucede si aumenta el precio de un ingrediente?',
        answer: 'El motor recalcula automáticamente los costos y precios sugeridos de todos los productos afectados, enviando una alerta de revisión.',
      },
    ],
  },
  {
    id: 'man-8',
    category: 'Métricas',
    title: 'Dashboard de Métricas, KPI y Rotación',
    description: 'Análisis de ventas, ticket promedio, matriz de rotación e insights inteligentes (Plan Gestión).',
    steps: [
      'Consultá el módulo "Métricas" para visualizar gráficos de ventas diarias, canales más vendidos y margen promedio.',
      'Accedé al tablero de "Rotación de Productos" para identificar productos de alta, media o baja frecuencia.',
      'Revisá la pestaña "Insights" para consultar recomendaciones automáticas sobre precios y promociones.',
    ],
    faqs: [
      {
        question: '¿Cómo se clasifica la rotación de un producto?',
        answer: 'Se calcula combinando las unidades vendidas, días sin venta y cuota sobre la facturación total.',
      },
    ],
  },
  {
    id: 'man-9',
    category: 'Fidelización',
    title: 'CRM de Clientes, Puntos y Tarjeta Virtual',
    description: 'Gestión de miembros, regla de puntos, niveles VIP y tarjetas virtuales (Plan Fidelización).',
    steps: [
      'Ingresá al módulo "Clientes" (disponible en Plan Fidelización).',
      'Verificá el nivel del cliente (Inicial, Frecuente, Preferencial o VIP) y sus puntos acumulados.',
      'Configurá los puntos por peso gastado en "Puntos y Recompensas".',
      'Abrí la "Tarjeta Virtual" de cualquier cliente para simular el escaneo de su código QR de socio.',
    ],
    faqs: [
      {
        question: '¿Cómo se acreditan los puntos?',
        answer: 'Cada vez que se simula o completa un pedido asociado a un cliente, los puntos se calculan e ingresan automáticamente a su cuenta.',
      },
    ],
  },
  {
    id: 'man-10',
    category: 'WhatsApp',
    title: 'Simulador de WhatsApp y Automatizaciones',
    description: 'Programación de mensajes masivos, segmentación y triggers automáticos (Plan Fidelización).',
    steps: [
      'Abrí el módulo "WhatsApp" para simular envíos de plantillas (Bienvenida, Cumpleaños, Cliente Inactivo, etc.).',
      'Seleccioná el segmento destinatario (ej. clientes con > 400 puntos).',
      'Simulá el envío y observá en vivo el estado del mensaje (Programado -> Enviado -> Entregado -> Leído).',
      'En "Automatizaciones", activá o pausá flujos automáticos desencadenados por eventos.',
    ],
    faqs: [
      {
        question: '¿Esta función se conecta con WhatsApp?',
        answer: 'La plataforma integra la API oficial de WhatsApp Cloud para envíos en tiempo real a tus clientes.',
      },
    ],
  },
  {
    id: 'man-11',
    category: 'Configuración',
    title: 'Configuración General y Ajustes del Comercio',
    description: 'Ajustes del comercio, reglas de moneda, personal y sucursales.',
    steps: [
      'Ingresá al módulo "Configuración".',
      'Personalizá el nombre del comercio (ej. Hilos de Amor), teléfono y moneda.',
      'Gestioná tus sucursales físicas con direcciones y mapas interactivos de Google.',
    ],
    faqs: [
      {
        question: '¿Cómo modifico los datos institucionales del local?',
        answer: 'Los cambios realizados en Configuración se aplican inmediatamente en el encabezado, tickets y comunicaciones del comercio.',
      },
    ],
  },
  {
    id: 'man-12',
    category: 'Perfil: Administrador',
    title: 'Guía Operativa para Administradores',
    description: 'Manual completo para el rol Administrador: configuración general, control de personal, escandallos, margen bruto y supervisión ejecutiva.',
    steps: [
      'Ingresá con tu usuario de Administrador (ej. admin@growlabs.lat o hilosdeamor@growlabs.lat).',
      'Configuración de Sucursales y Comercio: Accedé a "Configuración" para gestionar las sucursales del negocio, horarios, redes y datos generales.',
      'Gestión de Personal y Roles: En "Configuración > Personal y Roles", creá o editá usuarios asignando los roles correspondientes (Cajero, Mozo, Cocina, Admin).',
      'Control de Costos e Insumos: Navegá a "Ingredientes" y "Recetas y Costos" para definir materias primas, mermas y asegurar el margen objetivo del negocio (ej. 60%).',
      'Supervisión Ejecutiva: Analizá el Dashboard de "Métricas" para evaluar ventas totales, ticket promedio, matriz de rotación e insights automáticos.',
      'Estrategia de Fidelización: Configurá las reglas de puntos, campañas masivas y automatizaciones en el módulo "Fidelización" y "WhatsApp".',
    ],
    faqs: [
      {
        question: '¿Qué alcance de permisos tiene el perfil Administrador?',
        answer: 'Tiene acceso 100% irrestricto a todas las funcionalidades del sistema, incluyendo analítica financiera y gestión de personal.',
      },
      {
        question: '¿Cómo protejo a los usuarios oficiales del personal?',
        answer: 'Los usuarios institucionales oficiales habilitados en Supabase Auth se encuentran protegidos contra edición o eliminación accidental.',
      },
    ],
  },
  {
    id: 'man-13',
    category: 'Perfil: Cajero',
    title: 'Guía Operativa para Cajeros y Arqueo de Caja',
    description: 'Instrucciones diarias para el rol Cajero: apertura de turno, registro de cobros por múltiples medios de pago y arqueo/cierre de caja.',
    steps: [
      'Iniciar Sesión: Ingresá con credenciales de Cajero (ej. cajero@growlabs.lat).',
      'Apertura de Caja: Dirigite al módulo "Caja", hacé clic en "Abrir Caja" e ingresá el saldo inicial en efectivo (fondo de caja).',
      'Cobro de Pedidos: Los pedidos creados desde Salón, Retiro o Delivery se integran automáticamente en la caja activa.',
      'Registro de Movimientos Manuales: Si ocurren gastos menores o ingresos extraordinarios en efectivo, usá el botón "Nuevo Movimiento" para mantener el balance actualizado.',
      'Monitoreo del Balance en Vivo: Verificá el desglose por medio de pago (Efectivo, Transferencia, Tarjeta o Mercado Pago).',
      'Cierre de Turno y Arqueo: Al finalizar la jornada, presioná "Cerrar Caja", ingresá el recuento físico de billetes y confirmá la diferencia antes de emitir el reporte final.',
    ],
    faqs: [
      {
        question: '¿Qué sucede si hay diferencia entre el saldo esperado y el físico?',
        answer: 'El sistema calcula automáticamente la diferencia (sobrante o faltante) y la registra en el historial auditado del cierre de caja.',
      },
      {
        question: '¿Puedo cobrar un pedido si la caja está cerrada?',
        answer: 'No, el sistema bloquea la creación y cobro de nuevos pedidos hasta que un cajero realice la Apertura de Caja.',
      },
    ],
  },
  {
    id: 'man-14',
    category: 'Perfil: Mozo',
    title: 'Guía Operativa para Mozos y Atención de Salón',
    description: 'Procedimiento para el rol Mozo: mapa de salón, toma de comandas, solicitudes por QR y seguimiento de mesas.',
    steps: [
      'Iniciar Sesión: Accedé con tu usuario de Mozo (ej. mozo@growlabs.lat).',
      'Navegación por Sectores: Ingresá a "Mesas" y seleccioná el sector correspondiente (Salón Principal, Patio, Terraza o Vereda).',
      'Apertura de Mesa: Al sentarse los clientes, hacé clic en la tarjeta de la mesa para cambiar su estado a "Ocupada".',
      'Toma de Pedido / Comanda: Seleccioná los productos solicitados por los clientes, agregá notas particulares (ej. "sin azúcar", "hielo aparte") y confirmá la comanda.',
      'Atención mediante QR: Presioná "Ver QR" en la mesa para mostrar el código interactivo y permitir que el cliente ordene desde su smartphone.',
      'Cierre y Solicitud de Cuenta: Al pedir la cuenta, notificá al Cajero para procesar el pago y cambiá la mesa a "Disponible" una vez desocupada.',
    ],
    faqs: [
      {
        question: '¿Cómo sé si un cliente envió un pedido por QR desde su mesa?',
        answer: 'Los pedidos creados por QR ingresan automáticamente vinculados al número de mesa y notifican en el panel de comanda.',
      },
      {
        question: '¿Puedo mover un pedido entre mesas?',
        answer: 'Sí, podés editar la mesa asignada desde el detalle del pedido antes de que pase al estado final de entregado.',
      },
    ],
  },
  {
    id: 'man-15',
    category: 'Perfil: Cocina',
    title: 'Guía Operativa para Cocina y Comandera KDS',
    description: 'Instrucciones para el rol Cocina: recepción de comandas en tiempo real, gestión de estados de preparación y despacho.',
    steps: [
      'Acceso a Comandera: Ingresá al módulo "Pedidos" (o vista KDS de Cocina).',
      'Recepción de Nuevas Comandas: Revisa la columna "Nuevo" donde ingresan los pedidos ordenados por horario de llegada.',
      'Inicio de Elaboración: Hacé clic en "En preparación" al comenzar a elaborar los productos de la orden.',
      'Revisión de Observaciones: Verificá atentamente las etiquetas y observaciones especiales (ej. "sin TACC", "té bien caliente", "término medio").',
      'Finalización y Notificación: Al completar la elaboración, cambiá el estado a "Listo". Esto notifica inmediatamente al mozo o al repartidor de delivery.',
    ],
    faqs: [
      {
        question: '¿Qué prioridades tienen las comandas de salón vs delivery?',
        answer: 'Cada tarjeta indica claramente el canal de origen (Salón, Retiro o Delivery) para priorizar según la exigencia del servicio.',
      },
      {
        question: '¿Cómo reportar falta de insumo para un plato?',
        answer: 'Podés solicitar al Administrador que apague la disponibilidad del producto desde el módulo "Productos" para que se oculte del menú digital.',
      },
    ],
  },
];

