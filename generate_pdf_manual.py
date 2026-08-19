import os
import base64
import subprocess

def get_base64_image(image_path):
    if not os.path.exists(image_path):
        return ""
    with open(image_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")
    ext = os.path.splitext(image_path)[1].lower()
    mime = "image/jpeg" if ext in [".jpg", ".jpeg"] else "image/png"
    return f"data:{mime};base64,{encoded}"

project_dir = r"c:\Users\Sanatorio Argentino\Desktop\Proyectos\Project"
logo_hilos_path = os.path.join(project_dir, "public", "logo_hilos_de_amor.jpg")
logo_grow_path = os.path.join(project_dir, "public", "logogrow.png")

logo_hilos_b64 = get_base64_image(logo_hilos_path)
logo_grow_b64 = get_base64_image(logo_grow_path)

html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Manual Operativo & Guía de Perfiles — Hilos de Amor</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap');

        @page {{
            size: A4 portrait;
            margin: 10mm 10mm 10mm 10mm;
        }}

        :root {{
            --primary: #2F5233;
            --dark: #243627;
            --bg-light: #F4F7F3;
            --secondary: #CBD8C8;
            --accent: #F4D58D;
            --accent-dark: #D4A359;
            --emerald: #059669;
            --emerald-bg: #ECFDF5;
            --text-main: #1F2937;
            --text-muted: #5E7B60;
        }}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}

        body {{
            font-family: 'Inter', -apple-system, sans-serif;
            color: var(--text-main);
            background-color: #FFFFFF;
            font-size: 10.5px;
            line-height: 1.45;
            -webkit-print-color-adjust: exact;
        }}

        .page {{
            page-break-after: always;
            position: relative;
            padding-bottom: 10px;
        }}

        .page:last-child {{
            page-break-after: avoid;
        }}

        /* PORTADA / COVER PAGE */
        .cover {{
            background: linear-gradient(135deg, #1A2E1E 0%, #2F5233 100%);
            color: #FFFFFF;
            min-height: 270mm;
            padding: 40px 30px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border-radius: 16px;
            page-break-after: always;
        }}

        .cover-header {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            padding-bottom: 20px;
        }}

        .cover-logo-box {{
            width: 100px;
            height: 100px;
            border-radius: 50%;
            overflow: hidden;
            border: 3.5px solid var(--accent);
            background: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.35);
        }}

        .cover-logo-box img {{
            width: 100%;
            height: 100%;
            object-fit: cover;
        }}

        .grow-badge {{
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(255, 255, 255, 0.12);
            padding: 8px 18px;
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.25);
            font-size: 11px;
            font-weight: 700;
        }}

        .grow-badge img {{
            width: 22px;
            height: 22px;
            border-radius: 50%;
        }}

        .cover-body {{
            margin: 40px 0;
        }}

        .cover-tag {{
            display: inline-block;
            background: var(--accent);
            color: var(--dark);
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            padding: 6px 14px;
            border-radius: 8px;
            margin-bottom: 20px;
        }}

        .cover-title {{
            font-family: 'Playfair Display', serif;
            font-size: 34px;
            font-weight: 800;
            line-height: 1.25;
            color: #FFFFFF;
            margin-bottom: 15px;
        }}

        .cover-subtitle {{
            font-size: 13.5px;
            color: var(--secondary);
            font-weight: 400;
            max-width: 520px;
            line-height: 1.6;
        }}

        .cover-highlights {{
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-top: 40px;
        }}

        .highlight-card {{
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 12px;
            padding: 15px;
        }}

        .highlight-card h4 {{
            font-size: 12px;
            font-weight: 800;
            color: var(--accent);
            margin-bottom: 5px;
        }}

        .highlight-card p {{
            font-size: 9.5px;
            color: rgba(255, 255, 255, 0.85);
            line-height: 1.4;
        }}

        .cover-footer {{
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            padding-top: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 10px;
            color: rgba(255, 255, 255, 0.7);
        }}

        /* SECTION HEADERS */
        .section-header {{
            background: linear-gradient(90deg, var(--dark) 0%, var(--primary) 100%);
            color: #FFFFFF;
            padding: 10px 16px;
            border-radius: 10px;
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }}

        .section-header h2 {{
            font-size: 14px;
            font-weight: 800;
            letter-spacing: -0.2px;
        }}

        .section-header .section-num {{
            background: var(--accent);
            color: var(--dark);
            font-weight: 900;
            font-size: 10px;
            padding: 4px 10px;
            border-radius: 6px;
        }}

        /* DIAGRAM BOXES */
        .diagram-container {{
            background: var(--bg-light);
            border: 1.5px solid var(--secondary);
            border-radius: 12px;
            padding: 14px;
            margin: 12px 0;
        }}

        .diagram-title {{
            font-size: 10.5px;
            font-weight: 800;
            color: var(--primary);
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 6px;
        }}

        /* FLEX FLOW DIAGRAM */
        .flow-grid {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 6px;
        }}

        .flow-step {{
            flex: 1;
            background: #FFFFFF;
            border: 1px solid var(--secondary);
            border-top: 3.5px solid var(--primary);
            border-radius: 10px;
            padding: 8px 6px;
            text-align: center;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
        }}

        .flow-step.accent {{
            border-top-color: var(--accent-dark);
            background: #FFFDF7;
        }}

        .flow-step.emerald {{
            border-top-color: var(--emerald);
            background: var(--emerald-bg);
        }}

        .flow-step-icon {{
            font-size: 16px;
            margin-bottom: 3px;
        }}

        .flow-step-title {{
            font-size: 9.5px;
            font-weight: 800;
            color: var(--dark);
            margin-bottom: 2px;
        }}

        .flow-step-desc {{
            font-size: 8px;
            color: var(--text-muted);
            line-height: 1.2;
        }}

        .flow-arrow {{
            font-size: 14px;
            color: var(--primary);
            font-weight: 900;
        }}

        /* TABLES */
        table.matrix-table {{
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid var(--secondary);
            margin: 10px 0;
        }}

        table.matrix-table th {{
            background: var(--dark);
            color: #FFFFFF;
            font-size: 9.5px;
            font-weight: 800;
            padding: 8px 10px;
            text-align: left;
        }}

        table.matrix-table td {{
            padding: 7px 10px;
            font-size: 9px;
            border-bottom: 1px solid var(--secondary);
            background: #FFFFFF;
        }}

        table.matrix-table tr:nth-child(even) td {{
            background: var(--bg-light);
        }}

        table.matrix-table tr:last-child td {{
            border-bottom: none;
        }}

        .badge {{
            display: inline-block;
            padding: 3px 7px;
            border-radius: 6px;
            font-size: 8px;
            font-weight: 800;
            text-transform: uppercase;
        }}

        .badge-admin {{ background: #FEF3C7; color: #92400E; border: 1px solid #FCD34D; }}
        .badge-cajero {{ background: #DBEAFE; color: #1E40AF; border: 1px solid #93C5FD; }}
        .badge-mozo {{ background: #E0E7FF; color: #3730A3; border: 1px solid #A5B4FC; }}
        .badge-cocina {{ background: #FFEDD5; color: #9A3412; border: 1px solid #FDBA74; }}
        .badge-emerald {{ background: #D1FAE5; color: #065F46; border: 1px solid #6EE7B7; }}

        /* ROLE DETAIL CARDS */
        .role-card {{
            background: #FFFFFF;
            border: 1.5px solid var(--secondary);
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 12px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.02);
            page-break-inside: avoid;
        }}

        .role-card-header {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid var(--bg-light);
            padding-bottom: 6px;
            margin-bottom: 8px;
        }}

        .role-card-title {{
            font-size: 12px;
            font-weight: 800;
            color: var(--dark);
            display: flex;
            align-items: center;
            gap: 6px;
        }}

        .role-card-body {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }}

        .role-box {{
            background: var(--bg-light);
            padding: 8px;
            border-radius: 8px;
            border: 1px solid var(--secondary);
        }}

        .role-box h5 {{
            font-size: 9px;
            font-weight: 800;
            color: var(--primary);
            text-transform: uppercase;
            margin-bottom: 4px;
        }}

        .role-box ul {{
            padding-left: 12px;
            font-size: 8.5px;
            color: var(--text-main);
        }}

        .role-box ul li {{
            margin-bottom: 3px;
        }}

        /* MODULE GRID */
        .module-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 12px;
        }}

        .module-card {{
            background: #FFFFFF;
            border: 1px solid var(--secondary);
            border-left: 4px solid var(--primary);
            border-radius: 10px;
            padding: 10px;
            page-break-inside: avoid;
        }}

        .module-card.accent {{ border-left-color: var(--accent-dark); }}
        .module-card.emerald {{ border-left-color: var(--emerald); }}

        .module-card h4 {{
            font-size: 10.5px;
            font-weight: 800;
            color: var(--dark);
            margin-bottom: 3px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }}

        .module-card p {{
            font-size: 8.5px;
            color: var(--text-muted);
            line-height: 1.35;
            margin-bottom: 5px;
        }}

        .module-card .steps-mini {{
            background: var(--bg-light);
            padding: 5px 7px;
            border-radius: 6px;
            font-size: 8px;
            color: var(--text-main);
        }}

        .footer-note {{
            text-align: center;
            font-size: 8.5px;
            color: var(--text-muted);
            margin-top: 15px;
            padding-top: 8px;
            border-top: 1px solid var(--secondary);
        }}
    </style>
</head>
<body>

    <!-- PORTADA / COVER PAGE -->
    <div class="cover">
        <div class="cover-header">
            <div class="cover-logo-box">
                <img src="{logo_hilos_b64}" alt="Hilos de Amor Logo">
            </div>
            <div class="grow-badge">
                <img src="{logo_grow_b64}" alt="Grow Labs Logo">
                <span>Diseñado por Grow Labs</span>
            </div>
        </div>

        <div class="cover-body">
            <span class="cover-tag">Manual Oficial de Operaciones</span>
            <h1 class="cover-title">Guía Gráfica de Perfiles,<br>Módulos y Procesos</h1>
            <p class="cover-subtitle">
                Documentación técnica y operativa completa para la plataforma gastronómica de Hilos de Amor Pastelería & Encordado.
            </p>

            <div class="cover-highlights">
                <div class="highlight-card">
                    <h4>👥 4 Roles Operativos</h4>
                    <p>Funciones y permisos para Administrador, Cajero, Mozo y Cocina.</p>
                </div>
                <div class="highlight-card">
                    <h4>📦 11 Módulos Clave</h4>
                    <p>Guía de uso paso a paso de cada sección del sistema.</p>
                </div>
                <div class="highlight-card">
                    <h4>📊 Diagramas de Flujo</h4>
                    <p>Esquemas visuales interactivos de procesos en vivo.</p>
                </div>
            </div>
        </div>

        <div class="cover-footer">
            <span>Hilos de Amor — Pastelería & Encordado © 2026</span>
            <span>Versión 2.5 • Edición Ilustrada de Alta Precisión</span>
        </div>
    </div>

    <!-- PAGINA 1: ARQUITECTURA GENERAL & ROLES -->
    <div class="page">
        <div class="section-header">
            <h2>1. Mapa del Ecosistema Operativo & Matriz de Roles</h2>
            <span class="section-num">SECCIÓN 01</span>
        </div>

        <div class="diagram-container">
            <div class="diagram-title">🌐 Diagrama de Flujo General del Sistema Gastronómico</div>
            <div class="flow-grid">
                <div class="flow-step">
                    <div class="flow-step-icon">📱</div>
                    <div class="flow-step-title">1. Cliente / Mesas</div>
                    <div class="flow-step-desc">Escaneo QR, Menú Digital y solicitud de comandas.</div>
                </div>
                <div class="flow-arrow">➔</div>
                <div class="flow-step accent">
                    <div class="flow-step-icon">🍽️</div>
                    <div class="flow-step-title">2. Salón & Mozos</div>
                    <div class="flow-step-desc">Toma de comandas, observaciones y estado de mesas.</div>
                </div>
                <div class="flow-arrow">➔</div>
                <div class="flow-step">
                    <div class="flow-step-icon">🍳</div>
                    <div class="flow-step-title">3. Cocina (KDS)</div>
                    <div class="flow-step-desc">Pantalla de elaboración, alérgenos y despacho listo.</div>
                </div>
                <div class="flow-arrow">➔</div>
                <div class="flow-step emerald">
                    <div class="flow-step-icon">💵</div>
                    <div class="flow-step-title">4. Caja & Arqueos</div>
                    <div class="flow-step-desc">Cobro multimedio, arqueo físico y cierres de turno.</div>
                </div>
                <div class="flow-arrow">➔</div>
                <div class="flow-step accent">
                    <div class="flow-step-icon">🛡️</div>
                    <div class="flow-step-title">5. Admin & CRM</div>
                    <div class="flow-step-desc">Escandallos, margen 60%, Métricas y WhatsApp.</div>
                </div>
            </div>
        </div>

        <h3 style="font-size: 11px; font-weight: 800; color: var(--dark); margin: 14px 0 6px 0;">Matriz de Accesos y Permisos por Perfil</h3>
        <table class="matrix-table">
            <thead>
                <tr>
                    <th>Módulo / Funcionalidad</th>
                    <th>🛡️ Administrador</th>
                    <th>💵 Cajero</th>
                    <th>🍽️ Mozo</th>
                    <th>🍳 Cocina</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Apertura, Movimientos y Cierre de Caja</strong></td>
                    <td><span class="badge badge-admin">Total</span></td>
                    <td><span class="badge badge-emerald">Operativo Principal</span></td>
                    <td>❌ Sin Acceso</td>
                    <td>❌ Sin Acceso</td>
                </tr>
                <tr>
                    <td><strong>Mapa de Mesas y Toma de Comandas</strong></td>
                    <td><span class="badge badge-admin">Total</span></td>
                    <td><span class="badge badge-cajero">Lectura / Cobro</span></td>
                    <td><span class="badge badge-emerald">Operativo Principal</span></td>
                    <td>❌ Sin Acceso</td>
                </tr>
                <tr>
                    <td><strong>Pantalla KDS de Producción en Cocina</strong></td>
                    <td><span class="badge badge-admin">Total</span></td>
                    <td><span class="badge badge-cajero">Lectura</span></td>
                    <td><span class="badge badge-mozo">Lectura</span></td>
                    <td><span class="badge badge-emerald">Operativo Principal</span></td>
                </tr>
                <tr>
                    <td><strong>Insumos, Escandallos y Precios Sugeridos</strong></td>
                    <td><span class="badge badge-admin">Total Exclusivo</span></td>
                    <td>❌ Sin Acceso</td>
                    <td>❌ Sin Acceso</td>
                    <td>❌ Sin Acceso</td>
                </tr>
                <tr>
                    <td><strong>CRM de Clientes, WhatsApp y Métricas</strong></td>
                    <td><span class="badge badge-admin">Total Exclusivo</span></td>
                    <td>❌ Sin Acceso</td>
                    <td>❌ Sin Acceso</td>
                    <td>❌ Sin Acceso</td>
                </tr>
                <tr>
                    <td><strong>Configuración de Sucursales y Personal</strong></td>
                    <td><span class="badge badge-admin">Total Exclusivo</span></td>
                    <td>❌ Sin Acceso</td>
                    <td>❌ Sin Acceso</td>
                    <td>❌ Sin Acceso</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- PAGINA 2: GUIA OPERATIVA POR PERFIL -->
    <div class="page">
        <div class="section-header">
            <h2>2. Guía Operativa Detallada por Perfil</h2>
            <span class="section-num">SECCIÓN 02</span>
        </div>

        <!-- PERFIL CAJERO -->
        <div class="role-card">
            <div class="role-card-header">
                <div class="role-card-title">
                    <span>💵 Perfil Cajero</span>
                    <span class="badge badge-cajero">Caja & Cobros</span>
                </div>
                <span style="font-size: 8.5px; font-weight: 700; color: var(--text-muted);">Acceso: cajero@growlabs.lat</span>
            </div>
            <div class="diagram-container" style="padding: 8px; margin: 0 0 8px 0;">
                <div class="diagram-title">Diagrama de Trabajo Diario del Cajero</div>
                <div class="flow-grid">
                    <div class="flow-step"><strong>1. Apertura</strong><br><span style="font-size: 7.5px;">Declarar fondo inicial en efectivo.</span></div>
                    <div class="flow-arrow">➔</div>
                    <div class="flow-step emerald"><strong>2. Cobro</strong><br><span style="font-size: 7.5px;">Efectivo, MP, Transferencia, Tarjeta.</span></div>
                    <div class="flow-arrow">➔</div>
                    <div class="flow-step"><strong>3. Movimientos</strong><br><span style="font-size: 7.5px;">Registrar ingresos y egresos.</span></div>
                    <div class="flow-arrow">➔</div>
                    <div class="flow-step accent"><strong>4. Arqueo/Cierre</strong><br><span style="font-size: 7.5px;">Recuento físico y diferencias.</span></div>
                </div>
            </div>
            <div class="role-card-body">
                <div class="role-box">
                    <h5>Acciones Clave Obligatorias</h5>
                    <ul>
                        <li><strong>Apertura de Caja:</strong> Iniciar el turno ingresando el dinero en efectivo disponible para dar vuelto.</li>
                        <li><strong>Recepción de Cobros:</strong> Imputar cobros vinculados a pedidos de Salón, Retiro o Delivery.</li>
                    </ul>
                </div>
                <div class="role-box">
                    <h5>Controles y Cierre de Turno</h5>
                    <ul>
                        <li><strong>Cierre de Caja:</strong> Ingresar el conteo real de billetes en efectivo.</li>
                        <li><strong>Auditoría de Diferencia:</strong> Verificar si el sistema reporta saldo exacto, sobrante o faltante.</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- PERFIL MOZO -->
        <div class="role-card">
            <div class="role-card-header">
                <div class="role-card-title">
                    <span>🍽️ Perfil Mozo</span>
                    <span class="badge badge-mozo">Salón & Mesas</span>
                </div>
                <span style="font-size: 8.5px; font-weight: 700; color: var(--text-muted);">Acceso: mozo@growlabs.lat</span>
            </div>
            <div class="diagram-container" style="padding: 8px; margin: 0 0 8px 0;">
                <div class="diagram-title">Diagrama de Atención en Salón</div>
                <div class="flow-grid">
                    <div class="flow-step"><strong>1. Ocupar Mesa</strong><br><span style="font-size: 7.5px;">Seleccionar sector y marcar ocupada.</span></div>
                    <div class="flow-arrow">➔</div>
                    <div class="flow-step accent"><strong>2. Toma / QR</strong><br><span style="font-size: 7.5px;">Cargar comanda o desplegar QR.</span></div>
                    <div class="flow-arrow">➔</div>
                    <div class="flow-step emerald"><strong>3. Enviar Cocina</strong><br><span style="font-size: 7.5px;">Notas especiales para KDS.</span></div>
                    <div class="flow-arrow">➔</div>
                    <div class="flow-step"><strong>4. Pedir Cuenta</strong><br><span style="font-size: 7.5px;">Notificar a caja y liberar mesa.</span></div>
                </div>
            </div>
            <div class="role-card-body">
                <div class="role-box">
                    <h5>Atención y Comandas</h5>
                    <ul>
                        <li><strong>Selección de Sector:</strong> Filtrar entre Salón Principal, Patio, Terraza y Vereda.</li>
                        <li><strong>Notas Particulares:</strong> Indicar solicitudes especiales (ej. <em>sin azúcar</em>, <em>sin sal</em>).</li>
                    </ul>
                </div>
                <div class="role-box">
                    <h5>Self-Ordering & Cierre</h5>
                    <ul>
                        <li><strong>Códigos QR:</strong> Presionar "Ver QR" para permitir pedido directo del comensal.</li>
                        <li><strong>Liberación:</strong> Cambiar mesa a "Disponible" tras la salida del cliente.</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- PERFIL COCINA -->
        <div class="role-card">
            <div class="role-card-header">
                <div class="role-card-title">
                    <span>🍳 Perfil Cocina</span>
                    <span class="badge badge-cocina">Comandera KDS</span>
                </div>
                <span style="font-size: 8.5px; font-weight: 700; color: var(--text-muted);">Acceso: KDS Pantalla de Producción</span>
            </div>
            <div class="role-card-body">
                <div class="role-box">
                    <h5>Elaboración y Tiempos</h5>
                    <ul>
                        <li><strong>Recepción:</strong> Monitor de comandas entrantes ordenadas cronológicamente.</li>
                        <li><strong>En Preparación:</strong> Iniciar cronómetro de elaboración para controlar demoras.</li>
                    </ul>
                </div>
                <div class="role-box">
                    <h5>Alérgenos y Despacho</h5>
                    <ul>
                        <li><strong>Atención a Notas:</strong> Inspección rigurosa de alérgenos y cocción.</li>
                        <li><strong>Notificación "Listo":</strong> Avisar inmediatamente al mozo o delivery.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- PAGINA 3: GUIA POR MODULOS (MODULOS 1 AL 6) -->
    <div class="page">
        <div class="section-header">
            <h2>3. Guía de Módulos Operativos (Parte I)</h2>
            <span class="section-num">SECCIÓN 03</span>
        </div>

        <div class="module-grid">
            <div class="module-card">
                <h4>📊 1. Dashboard & Selector de Planes <span class="badge badge-admin">General</span></h4>
                <p>Centro de mando con métricas ejecutivas en vivo y selector de Plan Esencial, Gestión o Fidelización.</p>
                <div class="steps-mini">✔ Cambiar plan en tiempo real • Auditar facturación del día • Acceso rápido a accesos clave.</div>
            </div>

            <div class="module-card">
                <h4>☕ 2. Productos & Carta Digital <span class="badge badge-admin">Carta</span></h4>
                <p>Gestión de catálogo, precios, imágenes, productos destacados y habilitación por canal (Salón/Retiro/Delivery).</p>
                <div class="steps-mini">✔ Alta/Edición de productos • Switch de disponibilidad instantáneo • Productos destacados.</div>
            </div>

            <div class="module-card">
                <h4>🪑 3. Mesas, Sectores & QR <span class="badge badge-mozo">Salón</span></h4>
                <p>Organización espacial del restaurante por sectores y generación de códigos QR de autoservicio.</p>
                <div class="steps-mini">✔ Asignación de capacidad • Estados (Disponible/Ocupada/Reservada) • Simulación de escaneo QR.</div>
            </div>

            <div class="module-card emerald">
                <h4>💵 4. Control de Caja & Arqueos <span class="badge badge-cajero">Finanzas</span></h4>
                <p>Módulo financiero para la apertura de turno, registro de pagos multimedio y arqueo físico final.</p>
                <div class="steps-mini">✔ Fondo inicial de caja • Movimientos de ingresos/egresos • Cierre con audición de sobrante/faltante.</div>
            </div>

            <div class="module-card">
                <h4>🛵 5. Pedidos & Kanban KDS <span class="badge badge-cocina">Operación</span></h4>
                <p>Tablero Kanban visual para avanzar órdenes desde "Nuevo" hasta "Entregado" con notificaciones.</p>
                <div class="steps-mini">✔ Filtrado por canal • Cronómetro de demora • Cambio de estado por arrastre o botón.</div>
            </div>

            <div class="module-card accent">
                <h4>🌾 6. Ingredientes & Mermas <span class="badge badge-admin">Gestión</span></h4>
                <p>Control de materias primas con conversión automática entre unidad de compra y unidad de uso.</p>
                <div class="steps-mini">✔ Carga de precio de compra • Porcentaje de merma • Costo unitario normalizado por gramo/ml.</div>
            </div>
        </div>

        <div class="diagram-container">
            <div class="diagram-title">💡 Diagrama del Motor de Inteligencia de Costos (Plan Gestión)</div>
            <div class="flow-grid">
                <div class="flow-step">
                    <strong>1. Compra de Insumo</strong><br>
                    <span style="font-size: 7.5px;">Café 1 kg = $30.000</span>
                </div>
                <div class="flow-arrow">➔</div>
                <div class="flow-step accent">
                    <strong>2. Factor Merma</strong><br>
                    <span style="font-size: 7.5px;">Descarte 5% molienda</span>
                </div>
                <div class="flow-arrow">➔</div>
                <div class="flow-step">
                    <strong>3. Escandallo Receta</strong><br>
                    <span style="font-size: 7.5px;">18g dosis = $568 costo</span>
                </div>
                <div class="flow-arrow">➔</div>
                <div class="flow-step emerald">
                    <strong>4. Margen Objetivo 60%</strong><br>
                    <span style="font-size: 7.5px;">Precio Sugerido $3.800</span>
                </div>
            </div>
        </div>
    </div>

    <!-- PAGINA 4: GUIA POR MODULOS (MODULOS 7 AL 11) & FIDELIZACION -->
    <div class="page">
        <div class="section-header">
            <h2>4. Guía de Módulos Operativos (Parte II) & Fidelización</h2>
            <span class="section-num">SECCIÓN 04</span>
        </div>

        <div class="module-grid">
            <div class="module-card accent">
                <h4>📐 7. Recetas & Costos Totales <span class="badge badge-admin">Escandallos</span></h4>
                <p>Vinculación de materias primas a productos para calcular costo exacto de producción y precio de venta ideal.</p>
                <div class="steps-mini">✔ Matriz de insumos • Costos de empaque • Alerta de aumento de insumo vinculante.</div>
            </div>

            <div class="module-card">
                <h4>📈 8. Métricas & Rotación IA <span class="badge badge-admin">Executive</span></h4>
                <p>Panel analítico con gráficos de facturación, ticket promedio, matriz de rotación de carta e Insights Inteligentes.</p>
                <div class="steps-mini">✔ Clasificación Alta/Media/Baja rotación • Sugerencias de precio e incentivos.</div>
            </div>

            <div class="module-card emerald">
                <h4>👥 9. CRM Clientes & Tarjeta Virtual <span class="badge badge-emerald">Fidelización</span></h4>
                <p>Gestión de socios, acumulación automática de puntos por consumo y niveles VIP (Inicial, Frecuente, Preferencial, VIP).</p>
                <div class="steps-mini">✔ Tarjeta de socio con QR • Canje de premios • Historial de visitas y consumo acumulado.</div>
            </div>

            <div class="module-card emerald">
                <h4>💬 10. WhatsApp & Automatizaciones <span class="badge badge-emerald">Marketing</span></h4>
                <p>Simulador de envíos masivos por segmento (Cumpleaños, Inactivos, Puntos) y flujos automáticos.</p>
                <div class="steps-mini">✔ Plantillas dinámicas ({{nombre}}, {{puntos}}) • Triggers por eventos • Auditoría de envío.</div>
            </div>
        </div>

        <div class="module-card" style="margin-bottom: 12px;">
            <h4>⚙️ 11. Configuración, Personal & Sucursales <span class="badge badge-admin">Ajustes</span></h4>
            <p>Panel central para administrar datos comerciales, sucursales físicas con mapas Google e integraciones.</p>
            <div class="steps-mini">✔ Gestión de sucursales • Edición de usuarios oficiales • Reinicio de demo seed.</div>
        </div>

        <div class="diagram-container">
            <div class="diagram-title">🎁 Ciclo de Fidelización y Automatización de WhatsApp</div>
            <div class="flow-grid">
                <div class="flow-step">
                    <strong>1. Consumo en Comercio</strong><br>
                    <span style="font-size: 7.5px;">Pedido registrado por $15.000</span>
                </div>
                <div class="flow-arrow">➔</div>
                <div class="flow-step emerald">
                    <strong>2. Acumulación Puntos</strong><br>
                    <span style="font-size: 7.5px;">150 Puntos acreditados</span>
                </div>
                <div class="flow-arrow">➔</div>
                <div class="flow-step">
                    <strong>3. Nivel VIP Promocionado</strong><br>
                    <span style="font-size: 7.5px;">Socio Preferencial</span>
                </div>
                <div class="flow-arrow">➔</div>
                <div class="flow-step accent">
                    <strong>4. WhatsApp Automático</strong><br>
                    <span style="font-size: 7.5px;">"¡Ganaste 150 pts en Hilos de Amor!"</span>
                </div>
            </div>
        </div>

        <div class="footer-note">
            Documentación generada automáticamente por el Agente Senior de Grow Labs • Hilos de Amor © 2026
        </div>
    </div>

</body>
</html>
"""

html_path = os.path.join(project_dir, "Manual_Operativo_Hilos_de_Amor.html")
pdf_path = os.path.join(project_dir, "Manual_Operativo_Hilos_de_Amor.pdf")

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML generado exitosamente en: {html_path}")

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if os.path.exists(edge_path):
    cmd = [
        edge_path,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        html_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"PDF generado exitosamente en: {pdf_path}")
    else:
        print(f"Error generando PDF: {res.stderr}")
else:
    print("Microsoft Edge no encontrado en la ruta esperada.")
