import { create } from "zustand";
import { persist } from "zustand/middleware";
import { brands as seedBrands } from "../data/brands";
import { cashSessions as seedCashSessions } from "../data/cash";
import { categories as seedCategories } from "../data/categories";
import { combos as seedCombos } from "../data/combos";
import { defaultStoreConfig } from "../data/config";
import { customers as seedCustomers } from "../data/customers";
import { inventoryMovements as seedMovements } from "../data/inventory";
import { defaultMaintenanceConfig } from "../data/maintenance";
import { orders as seedOrders } from "../data/orders";
import { products as seedProducts } from "../data/products";
import { defaultSiteContent } from "../data/siteContent";
import { purchases as seedPurchases, suppliers as seedSuppliers } from "../data/suppliers";
import { suggestions as seedSuggestions } from "../data/suggestions";
import { staffUsers as seedUsers } from "../data/users";
import { generateId, nextOrderCode } from "../lib/id";
import type {
  Brand,
  CashMovement,
  CashSession,
  Category,
  Combo,
  Customer,
  InventoryMovement,
  MaintenanceConfig,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  Purchase,
  SiteContent,
  StaffUser,
  StoreConfig,
  Suggestion,
  Supplier,
} from "../types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface DataState {
  products: Product[];
  brands: Brand[];
  categories: Category[];
  combos: Combo[];
  siteContent: SiteContent;
  maintenance: MaintenanceConfig;
  orders: Order[];
  inventoryMovements: InventoryMovement[];
  suppliers: Supplier[];
  purchases: Purchase[];
  customers: Customer[];
  staffUsers: StaffUser[];
  cashSessions: CashSession[];
  suggestions: Suggestion[];
  config: StoreConfig;

  // Productos
  addProduct: (p: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Marcas
  addBrand: (name: string) => void;
  updateBrand: (id: string, name: string) => void;
  deleteBrand: (id: string) => void;

  // Categorías
  addCategory: (c: Omit<Category, "slug" | "order">) => void;
  updateCategory: (slug: string, patch: Partial<Category>) => void;
  deleteCategory: (slug: string) => void;
  reorderCategories: (orderedSlugs: string[]) => void;

  // Combos (promociones entre productos)
  addCombo: (c: Omit<Combo, "id" | "createdAt">) => void;
  updateCombo: (id: string, patch: Partial<Combo>) => void;
  deleteCombo: (id: string) => void;

  // Contenido de la portada
  updateSiteContent: (patch: Partial<SiteContent>) => void;

  // Mantenimiento
  updateMaintenance: (patch: Partial<MaintenanceConfig>) => void;

  // Pedidos
  createOrder: (order: Omit<Order, "id" | "code" | "history" | "createdAt" | "status"> & { status?: OrderStatus }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  reviewPaymentProof: (orderId: string, status: PaymentStatus, note: string, reviewedBy: string) => void;

  // Inventario
  addInventoryMovement: (m: Omit<InventoryMovement, "id" | "createdAt">) => void;

  // Proveedores y compras
  addSupplier: (s: Omit<Supplier, "id">) => void;
  updateSupplier: (id: string, patch: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addPurchase: (p: Omit<Purchase, "id" | "createdAt" | "status">) => void;
  receivePurchase: (purchaseId: string) => void;

  // Clientes
  addCustomer: (c: Omit<Customer, "id" | "ordersCount" | "totalSpent" | "createdAt">) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Usuarios / roles
  addUser: (u: Omit<StaffUser, "id">) => void;
  updateUser: (id: string, patch: Partial<StaffUser>) => void;
  deleteUser: (id: string) => void;

  // Caja
  openCashSession: (openingAmount: number, openedBy: string) => void;
  addCashMovement: (m: Omit<CashMovement, "id" | "createdAt">) => void;
  closeCashSession: (closingAmount: number) => void;

  // Sugerencias de clientes (widget flotante de la tienda)
  addSuggestion: (s: Omit<Suggestion, "id" | "status" | "createdAt">) => void;
  updateSuggestionStatus: (id: string, status: Suggestion["status"]) => void;
  deleteSuggestion: (id: string) => void;

  // Configuración
  updateConfig: (patch: Partial<StoreConfig>) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      products: seedProducts,
      brands: seedBrands,
      categories: seedCategories,
      combos: seedCombos,
      siteContent: defaultSiteContent,
      maintenance: defaultMaintenanceConfig,
      orders: seedOrders,
      inventoryMovements: seedMovements,
      suppliers: seedSuppliers,
      purchases: seedPurchases,
      customers: seedCustomers,
      staffUsers: seedUsers,
      cashSessions: seedCashSessions,
      suggestions: seedSuggestions,
      config: defaultStoreConfig,

      addProduct: (p) =>
        set((state) => ({
          products: [
            { ...p, id: generateId("p"), createdAt: new Date().toISOString() },
            ...state.products,
          ],
        })),
      updateProduct: (id, patch) =>
        set((state) => ({
          products: state.products.map((pr) => (pr.id === id ? { ...pr, ...patch } : pr)),
        })),
      deleteProduct: (id) =>
        set((state) => ({ products: state.products.filter((pr) => pr.id !== id) })),

      addBrand: (name) =>
        set((state) => ({ brands: [...state.brands, { id: generateId("br"), name }] })),
      updateBrand: (id, name) =>
        set((state) => ({ brands: state.brands.map((b) => (b.id === id ? { ...b, name } : b)) })),
      deleteBrand: (id) =>
        set((state) => ({ brands: state.brands.filter((b) => b.id !== id) })),

      addCategory: (c) =>
        set((state) => {
          const baseSlug = slugify(c.name) || generateId("cat");
          let slug = baseSlug;
          let n = 2;
          while (state.categories.some((cat) => cat.slug === slug)) {
            slug = `${baseSlug}-${n++}`;
          }
          const order = state.categories.reduce((max, cat) => Math.max(max, cat.order), 0) + 1;
          return { categories: [...state.categories, { ...c, slug, order }] };
        }),
      updateCategory: (slug, patch) =>
        set((state) => ({
          categories: state.categories.map((c) => (c.slug === slug ? { ...c, ...patch } : c)),
        })),
      deleteCategory: (slug) =>
        set((state) => ({ categories: state.categories.filter((c) => c.slug !== slug) })),
      reorderCategories: (orderedSlugs) =>
        set((state) => ({
          categories: state.categories.map((c) => {
            const idx = orderedSlugs.indexOf(c.slug);
            return idx === -1 ? c : { ...c, order: idx + 1 };
          }),
        })),

      addCombo: (c) =>
        set((state) => ({
          combos: [...state.combos, { ...c, id: generateId("combo"), createdAt: new Date().toISOString() }],
        })),
      updateCombo: (id, patch) =>
        set((state) => ({ combos: state.combos.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCombo: (id) =>
        set((state) => ({ combos: state.combos.filter((c) => c.id !== id) })),

      updateSiteContent: (patch) =>
        set((state) => ({ siteContent: { ...state.siteContent, ...patch } })),

      updateMaintenance: (patch) =>
        set((state) => ({ maintenance: { ...state.maintenance, ...patch } })),

      createOrder: (orderInput) => {
        const state = get();
        const code = nextOrderCode(state.orders.map((o) => o.code));
        const now = new Date().toISOString();
        const status: OrderStatus = orderInput.status ?? "recibido";
        const order: Order = {
          ...orderInput,
          id: generateId("o"),
          code,
          status,
          history: [{ status, at: now }],
          createdAt: now,
        };

        const movements: InventoryMovement[] = order.items.map((item) => ({
          id: generateId("mv"),
          productId: item.productId,
          type: "venta",
          quantity: -item.quantity,
          note: `Pedido ${code}`,
          createdAt: now,
          createdBy: "Tienda online",
        }));

        set((s) => ({
          orders: [order, ...s.orders],
          products: s.products.map((pr) => {
            const item = order.items.find((it) => it.productId === pr.id);
            return item ? { ...pr, stock: Math.max(0, pr.stock - item.quantity) } : pr;
          }),
          inventoryMovements: [...movements, ...s.inventoryMovements],
        }));

        return order;
      },

      updateOrderStatus: (orderId, status, note) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status,
                  history: [...o.history, { status, at: new Date().toISOString(), note }],
                }
              : o,
          ),
        })),

      reviewPaymentProof: (orderId, status, note, reviewedBy) =>
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId || !o.paymentProof) return o;
            const nextOrderStatus: OrderStatus =
              status === "validado" ? "confirmado" : status === "rechazado" ? "cancelado" : o.status;
            return {
              ...o,
              paymentProof: {
                ...o.paymentProof,
                status,
                reviewNote: note,
                reviewedBy,
                reviewedAt: new Date().toISOString(),
              },
              status: nextOrderStatus,
              history: [
                ...o.history,
                { status: nextOrderStatus, at: new Date().toISOString(), note: note || undefined },
              ],
            };
          }),
        })),

      addInventoryMovement: (m) =>
        set((state) => {
          const movement: InventoryMovement = {
            ...m,
            id: generateId("mv"),
            createdAt: new Date().toISOString(),
          };
          return {
            inventoryMovements: [movement, ...state.inventoryMovements],
            products: state.products.map((pr) =>
              pr.id === m.productId
                ? { ...pr, stock: Math.max(0, pr.stock + m.quantity) }
                : pr,
            ),
          };
        }),

      addSupplier: (s) =>
        set((state) => ({ suppliers: [...state.suppliers, { ...s, id: generateId("sup") }] })),
      updateSupplier: (id, patch) =>
        set((state) => ({
          suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),
      deleteSupplier: (id) =>
        set((state) => ({ suppliers: state.suppliers.filter((s) => s.id !== id) })),

      addPurchase: (p) =>
        set((state) => ({
          purchases: [
            { ...p, id: generateId("pur"), status: "pendiente", createdAt: new Date().toISOString() },
            ...state.purchases,
          ],
        })),
      receivePurchase: (purchaseId) =>
        set((state) => {
          const purchase = state.purchases.find((p) => p.id === purchaseId);
          if (!purchase || purchase.status === "recibida") return state;
          const now = new Date().toISOString();
          const movements: InventoryMovement[] = purchase.items.map((it) => ({
            id: generateId("mv"),
            productId: it.productId,
            type: "entrada",
            quantity: it.quantity,
            note: `Compra ${purchase.id}`,
            createdAt: now,
            createdBy: "Almacén",
          }));
          return {
            purchases: state.purchases.map((p) =>
              p.id === purchaseId ? { ...p, status: "recibida" } : p,
            ),
            inventoryMovements: [...movements, ...state.inventoryMovements],
            products: state.products.map((pr) => {
              const item = purchase.items.find((it) => it.productId === pr.id);
              return item ? { ...pr, stock: pr.stock + item.quantity } : pr;
            }),
          };
        }),

      addCustomer: (c) =>
        set((state) => ({
          customers: [
            ...state.customers,
            { ...c, id: generateId("c"), ordersCount: 0, totalSpent: 0, createdAt: new Date().toISOString() },
          ],
        })),
      updateCustomer: (id, patch) =>
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      deleteCustomer: (id) =>
        set((state) => ({ customers: state.customers.filter((c) => c.id !== id) })),

      addUser: (u) =>
        set((state) => ({ staffUsers: [...state.staffUsers, { ...u, id: generateId("u") }] })),
      updateUser: (id, patch) =>
        set((state) => ({
          staffUsers: state.staffUsers.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        })),
      deleteUser: (id) =>
        set((state) => ({ staffUsers: state.staffUsers.filter((u) => u.id !== id) })),

      openCashSession: (openingAmount, openedBy) =>
        set((state) => ({
          cashSessions: [
            {
              id: generateId("cash"),
              openedAt: new Date().toISOString(),
              openingAmount,
              status: "abierta",
              openedBy,
              movements: [],
            },
            ...state.cashSessions,
          ],
        })),
      addCashMovement: (m) =>
        set((state) => {
          const [current, ...rest] = state.cashSessions;
          if (!current || current.status !== "abierta") return state;
          const movement: CashMovement = { ...m, id: generateId("cm"), createdAt: new Date().toISOString() };
          return { cashSessions: [{ ...current, movements: [movement, ...current.movements] }, ...rest] };
        }),
      closeCashSession: (closingAmount) =>
        set((state) => {
          const [current, ...rest] = state.cashSessions;
          if (!current || current.status !== "abierta") return state;
          return {
            cashSessions: [
              { ...current, status: "cerrada", closingAmount, closedAt: new Date().toISOString() },
              ...rest,
            ],
          };
        }),

      addSuggestion: (s) =>
        set((state) => ({
          suggestions: [
            { ...s, id: generateId("sg"), status: "nueva", createdAt: new Date().toISOString() },
            ...state.suggestions,
          ],
        })),
      updateSuggestionStatus: (id, status) =>
        set((state) => ({
          suggestions: state.suggestions.map((s) => (s.id === id ? { ...s, status } : s)),
        })),
      deleteSuggestion: (id) =>
        set((state) => ({ suggestions: state.suggestions.filter((s) => s.id !== id) })),

      updateConfig: (patch) => set((state) => ({ config: { ...state.config, ...patch } })),
    }),
    {
      name: "stoka-data-store",
      version: 5,
      // Zustand solo mezcla claves de nivel superior al rehidratar — "config"
      // (o "maintenance") completo vendría del localStorage viejo sin los
      // campos agregados en versiones posteriores (v2: defaultMargin;
      // v3: deliveryEnabled; v4: personalización de mantenimiento), así que
      // se completa a mano contra los valores por defecto actuales.
      migrate: (persisted, version) => {
        const state = persisted as DataState;
        if (version < 3 && state?.config) {
          state.config = { ...defaultStoreConfig, ...state.config };
        }
        if (version < 4 && state?.maintenance) {
          state.maintenance = { ...defaultMaintenanceConfig, ...state.maintenance };
        }
        // v5: se dejó de hablar de "recojo" en el texto de cara al cliente
        // (todo es directo en el local) — solo se actualiza si nadie tocó
        // ese campo a mano desde /admin/contenido, para no pisar una
        // personalización real.
        if (version < 5 && state?.siteContent?.heroBenefit1 === "Recojo rápido en tienda") {
          state.siteContent = { ...state.siteContent, heroBenefit1: defaultSiteContent.heroBenefit1 };
        }
        return state;
      },
    },
  ),
);
