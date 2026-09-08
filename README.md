# STOKA BODEGA

**Tu tienda, más simple.**

Demo funcional de e-commerce para una bodega peruana: tienda pública (catálogo, carrito,
checkout, pagos manuales, seguimiento de pedido) + panel administrativo (productos,
inventario con escaneo de código de barras, pedidos, validación de pagos, caja, clientes,
proveedores, usuarios y roles, reportes y configuración). Soporta tema claro y oscuro.

## Cómo ejecutar

```bash
npm install
npm run dev
```

Abre la URL que muestra la terminal (por defecto `http://localhost:5173`).

Otros comandos:

```bash
npm run build     # build de producción (tsc -b && vite build)
npm run preview   # sirve el build de producción localmente
npm run lint      # oxlint
```

## Acceso al panel administrativo

Ve a `/admin/login` (o usa el enlace "Panel interno (staff)" en el pie de página).
Credenciales de demostración (también visibles en la propia pantalla de login):

| Rol | Usuario | Contraseña | Acceso |
|---|---|---|---|
| Administrador | `admin` | `admin123` | Todo el panel: productos, inventario, pedidos, validar pagos, caja, clientes, proveedores, **usuarios/roles**, reportes, configuración |
| Cajero | `cajero` | `cajero123` | Dashboard, pedidos, validar pagos, caja, clientes |
| Almacén | `almacen` | `almacen123` | Dashboard, productos, inventario (incluye escaneo de código de barras), proveedores |
| Repartidor | `repartidor` | `reparto123` | Dashboard, pedidos (actualiza estado de entrega) |

Cada rol ve solo las secciones del panel que le corresponden; si intenta entrar por URL
directa a una sección ajena, el panel se lo bloquea con un aviso.

## Tema claro / oscuro

El botón de la cabecera (ícono de sol/luna/monitor) cicla entre **Sistema → Claro → Oscuro**.
La preferencia se guarda en `localStorage` y se aplica antes del primer pintado para evitar
parpadeos. Toda la paleta vive en `src/index.css` como tokens semánticos (`--color-stoka-bg`,
`--color-stoka-surface`, `--color-stoka-ink`, etc.) que cambian de valor según el tema — los
componentes nunca codifican colores claros/oscuros por separado.

## Escaneo de código de barras

En **Inventario** y **Productos** (rol Almacén o Administrador) hay un botón "Escanear código"
que abre la cámara (usando `html5-qrcode`, formatos EAN-13/EAN-8/UPC/Code128/Code39/QR) para
leer el código de barras de un producto físico:

- Si el código coincide con un producto existente, abre el formulario de movimiento de
  inventario con ese producto ya seleccionado (para registrar una entrada de stock rápido).
- Si el código no existe en el catálogo, ofrece crear el producto nuevo con ese código ya
  cargado en el formulario.
- Si no hay cámara disponible o el permiso es denegado, siempre queda la alternativa de
  ingresar el código a mano — el flujo nunca se bloquea por falta de cámara.

## Notas de arquitectura

- **Stack:** React 19 + TypeScript + Vite, Tailwind CSS v4, React Router, Zustand
  (con persistencia en `localStorage`), Sonner (notificaciones), Recharts (dashboard),
  html5-qrcode (escaneo de código de barras).
- **"Backend" simulado:** todo el estado (productos, pedidos, inventario, caja, etc.)
  vive en `src/store/dataStore.ts` sobre `localStorage`, con datos semilla en `src/data/`.
  Las funciones están organizadas para poder reemplazarse por llamadas a una API real
  sin tocar los componentes de UI.
- **Pagos:** Yape, Plin, transferencia bancaria, transferencia interbancaria y efectivo
  están **simulados** — no hay integración real con ninguna pasarela. Los pagos digitales
  quedan "pendientes de validación" hasta que el staff los aprueba manualmente en
  `/admin/pagos`. No se inventó ninguna API de Yape/Plin.
- **Identidad visual:** paleta roja/plata/negro (`#E10613`, `#8E8E93`/`#C5C5C7`, `#0D0D0F`),
  tipografía Rajdhani (títulos) + Plus Jakarta Sans (interfaz) + Raleway (eslogan). El isotipo
  (`BrandMark`, en `src/components/ui/BrandMark.tsx`) es una versión plana aproximada del
  logo original (sin el bisel/cromado 3D) pensada para verse bien también en tamaños chicos
  como favicon — si en algún momento hay archivos SVG/PNG exportados del logo real, ese es
  el único componente a reemplazar.
- **Ilustraciones de producto:** al no contar con fotografías con licencia, cada producto
  usa una ilustración generada (color + ícono) en vez de una foto real; el componente
  `ProductImage` es el único lugar a tocar el día que haya fotos reales.
- **Preparado para conectar después:** capa de datos aislada del backend real, base de
  datos, facturación electrónica, WhatsApp y una pasarela de tarjetas — solo falta
  implementar esas integraciones detrás de las mismas funciones de `dataStore`.
- **PWA-ready:** `manifest.webmanifest`, favicon SVG y metadatos ya configurados como
  base para una futura instalación como PWA.

## Estructura

```
src/
  components/   # UI reutilizable, componentes de tienda y del panel admin
  data/         # datos semilla (productos, pedidos, usuarios, config, etc.)
  lib/          # utilidades (formato, validación, carrito, csv, íconos)
  pages/        # páginas públicas y páginas del panel (pages/admin)
  store/        # estado global: carrito, tema, autenticación, datos
  types/        # tipos de dominio compartidos
```
