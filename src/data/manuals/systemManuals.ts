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
      'Para reiniciar los datos ficticios en cualquier momento, utilizá el botón "Reiniciar demo" en la barra superior o en Configuración.',
    ],
    faqs: [
      {
        question: '¿Puedo cambiar de plan durante la demo?',
        answer: 'Sí, podés alternar libremente entre el Plan Esencial, Plan Gestión y Plan Fidelización mediante el selector superior para evaluar las funcionalidades de cada nivel.',
      },
      {
        question: '¿Los datos se guardan al cerrar el navegador?',
        answer: 'Sí, la aplicación utiliza LocalStorage para mantener tus modificaciones durante la navegación.',
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
        question: '¿Esta función envía mensajes reales de WhatsApp?',
        answer: 'En esta versión demo es una simulación visual 100% interactiva. Queda preparada la arquitectura para conectar la API de WhatsApp en producción.',
      },
    ],
  },
  {
    id: 'man-11',
    category: 'Configuración',
    title: 'Configuración General y Restauración de Demo',
    description: 'Ajustes del comercio, reglas de redondeo y restauración de fábrica.',
    steps: [
      'Ingresá al módulo "Configuración".',
      'Personalizá el nombre del comercio (ej. Hilos de Amor), teléfono y moneda.',
      'Utilizá el botón "Reiniciar toda la demo" para restablecer los productos, pedidos y clientes a los datos seed originales.',
    ],
    faqs: [
      {
        question: '¿Se pierden las recetas si reinicio la demo?',
        answer: 'Al reiniciar la demo se vuelven a cargar todos los datos seed predeterminados de la plataforma.',
      },
    ],
  },
];
