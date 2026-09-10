# Bodeguita Stoka

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
| Administrador | `admin` | `admin123` | Todo el panel: venta rápida, productos, inventario, pedidos, validar pagos, caja, clientes, proveedores, **usuarios/roles**, reportes, sugerencias, combos, configuración |
| Cajero | `cajero` | `cajero123` | Dashboard, venta rápida, pedidos, validar pagos, caja, clientes |
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
- Funciona desde cualquier dispositivo con cámara y navegador (celular incluido), ya que usa
  la cámara del propio navegador — no requiere una app nativa.

Cuando el código no existe en el catálogo (ya sea por cámara o escribiéndolo a mano en
"Código de barras" dentro del alta de producto y dándole a **Buscar**), antes de dejarte
completar todo a mano se intenta adelantar nombre y presentación en varios pasos:

1. **`public/data/barcode-seed-pe.json`** — ~300 productos reales de **galletas, bebidas y
   golosinas** que se venden en Perú (Costa, Arcor, Ambrosoli, Nabisco, Nestlé, aguas Cielo/San
   Luis, etc.), sacados una sola vez de Open Food Facts filtrado por país y esas categorías. Se
   consulta primero, **sin necesidad de internet** una vez que el navegador lo descargó (53 KB,
   se cachea en memoria durante la sesión) — el resultado dice "Base local".
2. **Paquetes de categoría adicionales**, en `/admin/configuracion` → "Categorías del buscador
   de códigos de barra": lácteos, panadería, snacks salados, conservas, desayuno/cereales,
   salsas/condimentos, café/té y pastas (13 a 70 productos cada uno, mismo origen y método). Se
   activan con un clic — quedan disponibles al instante, también sin internet una vez
   descargados. Se pueden agregar más paquetes así en el futuro sin tocar código: basta con
   sumar un archivo en `public/data/barcode-categories/` y una entrada en su `manifest.json`.
3. Si el código no está en ninguno de los locales activos, se consulta
   [Open Food Facts](https://world.openfoodfacts.org) en vivo (base colaborativa y gratuita, sin
   API key, se llama directo desde el navegador) — el resultado dice "En línea". Esta base es
   mucho más grande, pero no es específica de Perú (para productos peruanos hay bastante
   etiquetado con otro país, o simplemente no están) y necesita internet en el momento.

Ninguna trae precio (eso es siempre propio de la tienda) ni cubre absolutamente todo — si no
aparece en ningún lado, sigue el alta manual de siempre, sin ningún aviso de error.

## Sugerencias de clientes

Un botón flotante ("¿Qué te falta?") visible en toda la tienda pública abre un formulario
corto para que cualquier cliente sugiera un producto que le gustaría encontrar, o cualquier
otra idea — nombre y celular son opcionales, así que puede mandarse anónima. Cada envío queda
guardado en `/admin/sugerencias` (solo Administrador), donde se puede marcar como revisada o
eliminar; el Dashboard muestra cuántas quedan sin revisar.

## Venta rápida (mostrador)

Para una compra que el cliente paga **físicamente en la tienda** (no por el checkout online) hay
dos formas de descontar el stock, según qué más necesites:

- **Inventario → Registrar movimiento → tipo "Venta"** (o escaneando el código de barras): la
  forma más simple, solo descuenta el stock. No genera un pedido, así que no se refleja en
  Dashboard, Reportes ni Caja — útil si solo te interesa que el inventario quede correcto.
- **`/admin/venta-rapida`** (roles Administrador y Cajero): un mini punto de venta — busca o
  escanea productos, arma el carrito, elige el método de pago y cobra. Esto sí crea un pedido
  interno marcado como entregado, así que cuenta en "Ventas de hoy" y utilidad del Dashboard, en
  Reportes, y — si el pago es en efectivo y la caja está abierta — se suma automáticamente como
  ingreso en el arqueo de Caja (si la caja está cerrada, la venta se registra igual, con un aviso
  de que ese efectivo no quedó en el arqueo del día).

## Delivery (apagado por defecto)

El negocio de momento atiende de forma directa en el local (por dentro sigue siendo el
`fulfillment: "recojo"` de siempre, pero de cara al cliente no se usa esa palabra ni
"delivery/envío" — solo "todo directo en tienda") — en Configuración → Delivery general hay
un interruptor **"Delivery habilitado"** (apagado por defecto). Mientras está apagado: el
checkout no ofrece la opción de delivery ni pide dirección/distrito, se ocultan "Zonas de
delivery" y las tarifas, y toda mención a delivery en la tienda (portada, carrito, ficha de
producto) se ajusta sola. Actívalo el día que empiecen a repartir a domicilio — toda la
lógica de zonas, tarifas y delivery gratis ya existe, solo estaba oculta.

Los descuentos por producto son 100% manuales: el admin define el precio de venta y,
opcionalmente, un "precio tachado" (oferta) en Productos — no hay cupones. La otra palanca
de precio son los **combos** (ver siguiente sección), que sí se aplican solos.

## Combos (promociones entre productos)

Desde `/admin/combos` (solo Administrador) se arman promociones que combinan **2 o más
productos distintos** a un precio especial — por ejemplo "Pan + Leche + Café por S/18.90" en
vez de comprarlos por separado. El admin elige los productos y el precio combinado; el panel
valida que sea menor a la suma actual y muestra el ahorro resultante.

En la tienda pública aparecen en una sección "Combos especiales" en la portada, con un botón
que agrega todos sus productos al carrito de una vez. El descuento **se detecta solo** en
cuanto el carrito tiene esas unidades — no hace falta ningún código: se ve como una línea
"🎁 Nombre del combo" en el carrito, el checkout y la confirmación del pedido, y se resta del
total real que se cobra (a diferencia del "Ahorro" por precio tachado, que es solo
informativo porque ya está reflejado en el precio de cada producto). Si el mismo producto
está en dos combos activos a la vez, esta primera versión no reparte las unidades entre
ambos — evalúa cada combo por separado contra las cantidades totales del carrito.

## Costo de compra y margen de ganancia

Al **registrar una entrada de stock** (en Inventario, con o sin escaneo previo) se puede
indicar el costo de esa compra en **costo unitario o costo total** — se recalculan entre sí
automáticamente según la cantidad. Con un **margen deseado (%)** (prellenado desde
Configuración → Ganancia, o desde el margen actual del producto si ya tenía costo cargado),
se muestra un **precio de venta sugerido**; con la casilla marcada, al guardar el movimiento
se actualiza tanto el costo como el precio de venta del producto.

## Registro de compras (boletas)

Desde `/admin/proveedores` → pestaña "Compras" → "Nueva compra" se lleva registro de dónde y
cuánto se pagó, para ir comparando proveedores/lugares con el tiempo:

- **Proveedor y lugar son ambos opcionales** — si compraste en un mercado o mayorista que no
  tienes registrado como proveedor formal, solo escribe el lugar en texto libre.
- **Foto de la boleta** (opcional, JPG/PNG/WEBP hasta 1.5 MB, se guarda como data URL) — se
  puede tomar con la cámara del celular o subir una imagen ya tomada; se ve como miniatura en
  la lista y se puede ampliar con un clic.
- **Los productos son opcionales** — si no quieres itemizar en el momento, puedes registrar
  solo el gasto total con su foto; el "Total pagado" es un campo aparte (no forzado a ser la
  suma de los ítems, porque la boleta real puede traer impuestos o redondeos distintos) con un
  botón "Usar suma" para copiar la suma de ítems si prefieres que coincidan.
- Una compra **sin ítems** queda "Recibida" de inmediato (no hay stock que recibir). Una
  compra **con ítems** queda "Pendiente" hasta que le des "Marcar recibida", momento en el que
  sí se suma el stock y se crea el movimiento de inventario tipo "Entrada".

## Qué es administrable sin tocar código

Desde `/admin` (rol Administrador, salvo que se indique otro) se puede editar en caliente:

- **Categorías** (`/admin/catalogo`) — crear, editar, reordenar, ocultar/mostrar y eliminar.
  Ya no son una lista fija: viven en el store y se reflejan al instante en la tienda pública
  (menú, catálogo, filtros). Si se elimina una categoría con productos, esos productos quedan
  sin categoría asignada en vez de perderse.
- **Marcas** (`/admin/catalogo`) — igual, CRUD completo.
- **Contenido de la portada** (`/admin/contenido`) — título, subtítulo, textos de los botones
  y de los beneficios del hero, con **vista previa en vivo** (el mismo componente que se
  renderiza en la tienda, no una aproximación). "Restablecer al original" recupera el texto
  con el que se lanzó el sitio.
- **Mantenimiento** (`/admin/mantenimiento`, solo Administrador) — apaga la tienda pública
  para clientes (todas las rutas de `/`) mostrando una pantalla de aviso con mensaje editable,
  ya sea con un interruptor inmediato o programando una ventana de fecha/hora (se activa y
  desactiva sola, sin recargar). El panel `/admin` **nunca** se bloquea, así siempre se puede
  entrar a apagarlo. Si hay una ventana programada que todavía no empieza, aparece además una
  **franja de aviso previo** (mensaje editable, con la fecha calculada automáticamente) en toda
  la tienda para que el cliente no se sorprenda — se puede cerrar, y se vuelve a mostrar si se
  reprograma la fecha. La pantalla de mantenimiento en sí también es personalizable, con vista
  previa en vivo: **imagen de fondo** (se sube como archivo, máx. 1.5 MB, se guarda como data
  URL), mantener u ocultar el **logo**, mostrar u ocultar el **teléfono de contacto** (editable)
  y mostrar u ocultar la **hora estimada de regreso** cuando hay una fecha "Hasta" programada.
- Todo lo demás documentado en la tabla de roles más abajo (productos, inventario, pedidos,
  pagos, caja, clientes, proveedores, usuarios, reportes, config de delivery/pagos).

**Importante:** por ahora todo esto vive en el `localStorage` del navegador (ver "Backend
simulado" abajo) — los cambios hechos en el panel no se sincronizan todavía entre
dispositivos ni se reflejan para clientes reales en otro navegador. Para que sea así, el
siguiente paso es conectar una base de datos real detrás de `dataStore.ts`.

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
