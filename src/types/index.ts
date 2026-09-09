// Tipos centrales del dominio Bodeguita Stoka.
// La capa de datos (src/data + src/store) implementa estas formas sobre
// localStorage a modo de "backend simulado". Cuando se conecte un backend
// real, solo hace falta reemplazar src/services/* sin tocar los tipos ni la UI.

// Antes era una unión fija de literales; ahora las categorías son
// administrables desde el panel (src/pages/admin/CatalogSettingsPage.tsx),
// así que el slug es una cadena cualquiera generada al crearlas.
export type CategorySlug = string;

// Acentos de color predefinidos para que una categoría nueva siga
// respetando la paleta e temas claro/oscuro en vez de un color libre.
export type CategoryAccentColor = "red" | "silver" | "blue" | "amber";

export interface Category {
  slug: CategorySlug;
  name: string;
  icon: string; // nombre de icono lucide-react (ver src/lib/icon-registry.tsx)
  color: CategoryAccentColor;
  order: number;
  active: boolean; // si está apagada, se oculta de la tienda pero los productos existentes no se borran
}

export interface Brand {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  presentation: string; // "1 kg", "500 ml", "x6 unidades"
  category: CategorySlug;
  brandId: string;
  sku: string;
  barcode: string;
  price: number; // precio de venta actual (soles)
  compareAtPrice?: number; // precio tachado si hay descuento
  costPrice: number;
  stock: number;
  minStock: number;
  unit: "unidad" | "kg" | "litro" | "paquete";
  featured?: boolean;
  tags?: string[];
  description: string;
  imageHue: number; // 0-360, usado para generar la ilustración de producto
  imageIcon: string; // nombre de icono lucide-react para la ilustración
  createdAt: string;
}

export type PaymentMethod =
  | "yape"
  | "plin"
  | "transferencia"
  | "transferencia-interbancaria"
  | "efectivo";

export type PaymentStatus =
  | "pendiente"
  | "en_revision"
  | "validado"
  | "rechazado"
  | "vencido";

export type OrderStatus =
  | "recibido"
  | "pendiente_pago"
  | "pago_en_revision"
  | "confirmado"
  | "preparando"
  | "en_reparto"
  | "entregado"
  | "cancelado";

export type FulfillmentType = "delivery" | "recojo";

export interface OrderItem {
  productId: string;
  name: string;
  presentation: string;
  price: number;
  quantity: number;
}

export interface PaymentProof {
  id: string;
  method: PaymentMethod;
  operationNumber?: string;
  fileName?: string;
  amount: number;
  status: PaymentStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string;
  note?: string;
}

export interface Order {
  id: string;
  code: string; // ej. "STK-10234"
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  fulfillment: FulfillmentType;
  address?: {
    line: string;
    reference?: string;
    district: string;
  };
  scheduledDate?: string;
  scheduledSlot?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentProof?: PaymentProof;
  status: OrderStatus;
  history: OrderStatusEvent[];
  createdAt: string;
}

export type MovementType = "entrada" | "venta" | "ajuste" | "merma" | "devolucion";

export interface InventoryMovement {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number; // positivo = ingresa stock, negativo = sale stock
  note?: string;
  batch?: string;
  expiryDate?: string;
  createdAt: string;
  createdBy: string;
}

export interface Supplier {
  id: string;
  name: string;
  ruc: string;
  phone: string;
  category: string;
}

export interface Purchase {
  id: string;
  supplierId: string;
  items: { productId: string; quantity: number; unitCost: number }[];
  total: number;
  status: "pendiente" | "recibida";
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  district?: string;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
}

// Sugerencia enviada por un cliente desde el widget flotante de la tienda
// pública (qué producto le gustaría encontrar, qué le falta, etc.) — nombre
// y celular son opcionales, así que puede llegar totalmente anónima.
export interface Suggestion {
  id: string;
  message: string;
  name?: string;
  phone?: string;
  status: "nueva" | "revisada";
  createdAt: string;
}

export type UserRole = "administrador" | "cajero" | "almacen" | "repartidor";

export interface StaffUser {
  id: string;
  name: string;
  username: string;
  password: string; // demo-only, texto plano intencional para propósitos de la demo
  role: UserRole;
  active: boolean;
}

export interface CashMovement {
  id: string;
  type: "ingreso" | "gasto" | "retiro";
  concept: string;
  amount: number;
  createdAt: string;
}

export interface CashSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  openingAmount: number;
  closingAmount?: number;
  movements: CashMovement[];
  status: "abierta" | "cerrada";
  openedBy: string;
}

export interface PaymentAccountConfig {
  yape: { phone: string; holder: string };
  plin: { phone: string; holder: string };
  transferencia: { bank: string; accountNumber: string; cci: string; holder: string };
}

export interface DeliveryZone {
  id: string;
  district: string;
  fee: number;
  etaMinutes: number;
}

export interface StoreConfig {
  // El negocio de momento no reparte a domicilio: en falso, el checkout solo
  // ofrece recojo en tienda y se ocultan precios/zonas de delivery en toda
  // la tienda. Queda listo para reactivarse el día que sí hagan envíos.
  deliveryEnabled: boolean;
  freeDeliveryThreshold: number;
  defaultDeliveryFee: number;
  deliveryZones: DeliveryZone[];
  openingHours: string;
  paymentAccounts: PaymentAccountConfig;
  // Margen de ganancia sugerido (%) al registrar una entrada de stock con
  // costo, para calcular un precio de venta propuesto. Cada producto puede
  // terminar con un margen distinto una vez editado a mano.
  defaultMargin: number;
}

// Contenido editable de la portada (hero). Vive en el store para que el
// panel "Contenido" lo pueda editar con vista previa en vivo sin tocar código.
export interface SiteContent {
  heroBadge: string;
  heroTitleLine: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  heroBenefit1: string;
  heroBenefit2: string;
}

// Modo mantenimiento: reemplaza toda la tienda pública (no el panel admin,
// que sigue accesible para poder desactivarlo) por una pantalla de aviso.
// "enabled" es un interruptor inmediato; "scheduled" activa una ventana de
// fecha/hora aparte — cualquiera de los dos que esté vigente activa el modo.
export interface MaintenanceConfig {
  enabled: boolean;
  scheduled: boolean;
  startAt: string; // datetime-local, ej. "2026-09-10T08:00"
  endAt: string;
  message: string;
  // Aviso previo: una franja (no de pantalla completa) que se muestra en
  // toda la tienda pública mientras hay una ventana programada que todavía
  // no empieza, para que el cliente no se sorprenda cuando llegue la hora.
  noticeEnabled: boolean;
  noticeMessage: string;
  // Personalización de la pantalla de mantenimiento en sí:
  backgroundImage: string; // data URL de la imagen subida, "" = sin imagen (fondo liso)
  showLogo: boolean; // mantener el isotipo de la marca visible
  showContactPhone: boolean;
  contactPhone: string;
  showReturnTime: boolean; // mostrar "Volvemos aprox. el..." cuando hay fecha de fin programada
}
