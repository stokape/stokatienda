import type { StaffUser } from "../types";

// Usuarios de demostración. Contraseñas de ejemplo, no son credenciales reales.
export const staffUsers: StaffUser[] = [
  { id: "u-admin", name: "Rosa Quispe", username: "admin", password: "admin123", role: "administrador", active: true },
  { id: "u-cajero", name: "Luis Fernández", username: "cajero", password: "cajero123", role: "cajero", active: true },
  { id: "u-almacen", name: "Milagros Torres", username: "almacen", password: "almacen123", role: "almacen", active: true },
  { id: "u-repartidor", name: "Jhonny Ramos", username: "repartidor", password: "reparto123", role: "repartidor", active: true },
];

export const roleLabels: Record<string, string> = {
  administrador: "Administrador",
  cajero: "Cajero",
  almacen: "Almacén",
  repartidor: "Repartidor",
};

// Qué secciones del panel puede ver cada rol.
export const roleAccess: Record<string, string[]> = {
  administrador: [
    "dashboard", "venta-rapida", "productos", "catalogo", "inventario", "pedidos", "pagos",
    "caja", "clientes", "proveedores", "usuarios", "reportes", "configuracion", "contenido", "mantenimiento",
  ],
  cajero: ["dashboard", "venta-rapida", "pedidos", "pagos", "caja", "clientes"],
  almacen: ["dashboard", "productos", "inventario", "proveedores"],
  repartidor: ["dashboard", "pedidos"],
};
