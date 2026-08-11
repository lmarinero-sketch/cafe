# ☕ Hilos de Amor - Plataforma Comercial & Demo Gastronómica

Plataforma gastronómica moderna desarrollada con **Vite + React + TypeScript + Tailwind CSS** para la demostración comercial de tres planes de software (**Plan Esencial**, **Plan Gestión** y **Plan Fidelización**).

---

## 🚀 Instrucciones de Inicio Rápido

Para instalar las dependencias e iniciar el servidor de desarrollo:

```bash
npm install
npm run dev
```

La aplicación se abrirá en `http://localhost:3000`.

---

## 📐 Arquitectura del Sistema

El proyecto sigue una arquitectura modular mantenible en React + TypeScript:

```text
src/
├── components/          # Componentes de UI, Modales de Bloqueo, Header y Asesor Virtual
├── context/             # AppContext (Estado global + LocalStorage) y ToastContext
├── data/                # Seeds centralizadas (Productos, Insumos, Pedidos, Clientes, Manuales)
├── layouts/             # Layout principal con Sidebar y Topbar Switcher
├── pages/               # Páginas para los 3 planes comerciales y menú público
├── router/              # Configuración de rutas de React Router 6
├── types/               # Definiciones e interfaces TypeScript estrictas
└── utils/               # Motor de cálculo de costos, precios sugeridos y formateadores
```

---

## 💎 Planes Comerciales & Funciones Bloqueadas

1. **Plan Esencial**: Productos, Categorías, Mesas con QR, Menú Digital, Panel de Pedidos y Delivery.
2. **Plan Gestión**: Insumos, Recetas, Escandallos, Precios Sugeridos, Recálculo Automático por Aumento de Ingredientes, Métricas KPI (Recharts), Matriz de Rotación e Insights.
3. **Plan Fidelización**: CRM Clientes, Puntos & Recompensas, Tarjeta Virtual Digital QR, Simulador de WhatsApp, Automatizaciones de Marketing.

---

## 🧪 Lista de Simulaciones Obligatorias Probadables

1. **Creación de Producto**: Dar de alta un producto y verificarlo instantáneamente en la carta digital pública.
2. **Mesas & Códigos QR**: Crear mesas en sectores (Salón, Patio, Terraza, Vereda) y abrir su comanda pre-vinculada.
3. **Pedido desde Mesa**: Realizar un pedido desde la carta digital y recibirlo en el Kanban de cocina.
4. **Pedido de Delivery**: Simular pedido a domicilio con dirección, referencia, método de pago y costo de envío.
5. **Avanzar Estado de Pedidos**: Mover órdenes de *Nuevo* -> *En preparación* -> *Listo* -> *En camino* -> *Entregado*.
6. **Modificar Costo de Ingrediente**: Cambiar precio de "Café en grano" ($24.000 -> $30.000/kg).
7. **Alerta de Productos Afectados**: Notificación de impacto sobre Café Espresso, Capuchino, etc.
8. **Recálculo de Precio Sugerido**: Actualización automática de precios de venta para mantener margen del 60%.
9. **Simular Venta**: Completar un pedido y ver actualización del KPI de facturación.
10. **Acreditar Puntos**: Acumular puntos automáticamente al socio al concretar la venta.
11. **Canjear Recompensa**: Redimir beneficio de puntos por café o porción de torta.
12. **Tarjeta Virtual Digital**: Visualizar credencial móvil con código QR de socio y botones de billetera.
13. **Campaña de WhatsApp**: Programar envío de mensajes masivos con plantillas segmentadas.
14. **Simular Envío de WhatsApp**: Visualizar la línea de tiempo en vivo (*Programado* -> *Enviado* -> *Entregado* -> *Leído*).
15. **Asesor Virtual**: Consultar dudas frecuentes, leer los 11 manuales interactivos y crear tickets de soporte.
16. **Ticket de Soporte**: Generar consulta con número de seguimiento único (`#TICK-xxxx`).
17. **Reiniciar Demo**: Un clic en "Reiniciar demo" para restablecer toda la información inicial en LocalStorage.

---

## 🔗 Integraciones Pendientes para Producción Backend

- **Supabase / PostgreSQL**: Persistencia relacional de base de datos y autenticación de usuarios.
- **API de WhatsApp (BuilderBot / Meta API)**: Conexión real para envíos de mensajes al teléfono del cliente.
- **Mercado Pago / Pasarela de Pagos**: Cobro electrónico en línea durante el checkout del menú digital.
- **Modelo de Inteligencia Artificial (OpenAI / Gemini)**: Motor conversacional para el Asesor Virtual.
- **Facturación Electrónica AFIP**: Generación de comprobantes fiscales A y B.
