// Adelanta nombre/marca/presentación al dar de alta un producto por un
// código de barras que no está en el catálogo — en varios pasos, del más al
// menos confiable:
//
// 1. El archivo base local (public/data/barcode-seed-pe.json, ~300 productos
//    reales de galletas, bebidas y golosinas que se venden en Perú — Costa,
//    Arcor, Ambrosoli, Nabisco, Nestlé, aguas Cielo/San Luis, etc. — sacado
//    una sola vez de Open Food Facts filtrado por país y esas categorías).
// 2. Paquetes de categorías adicionales que el admin activó desde
//    /admin/configuracion (public/data/barcode-categories/*.json — mismo
//    origen y método, un paquete por rubro: lácteos, panadería, snacks
//    salados, etc.). Ver loadCategoryManifest más abajo.
// 3. Si no está en ninguno de los locales, se consulta Open Food Facts en
//    vivo (base colaborativa y gratuita, sin API key, CORS habilitado) como
//    último respaldo — cubre mucho más, pero no es específico de Perú y
//    necesita internet en ese momento.
//
// Ninguna de las tres trae precio — eso es siempre propio de cada tienda.
export interface BarcodeLookupResult {
  name: string;
  brand?: string;
  presentation?: string;
  imageUrl?: string;
  source: "local" | "online";
}

export interface CategoryPackInfo {
  id: string;
  label: string;
  count: number;
}

interface SeedEntry {
  code: string;
  name: string;
  brand?: string;
  presentation?: string;
  imageUrl?: string;
}

function toIndex(entries: SeedEntry[]): Map<string, SeedEntry> {
  return new Map(entries.map((e) => [e.code, e]));
}

function fetchJson<T>(path: string, fallback: T): Promise<T> {
  return fetch(`${import.meta.env.BASE_URL}${path}`)
    .then((res) => (res.ok ? res.json() : fallback))
    .catch(() => fallback);
}

let baseIndexPromise: Promise<Map<string, SeedEntry>> | null = null;
function loadBaseIndex(): Promise<Map<string, SeedEntry>> {
  if (!baseIndexPromise) {
    baseIndexPromise = fetchJson<SeedEntry[]>("data/barcode-seed-pe.json", []).then(toIndex);
  }
  return baseIndexPromise;
}

const categoryIndexCache = new Map<string, Promise<Map<string, SeedEntry>>>();
/** Descarga (o reutiliza si ya se pidió antes en esta sesión) un paquete de categoría por su id. */
export function loadCategoryIndex(id: string): Promise<Map<string, SeedEntry>> {
  if (!categoryIndexCache.has(id)) {
    categoryIndexCache.set(id, fetchJson<SeedEntry[]>(`data/barcode-categories/${id}.json`, []).then(toIndex));
  }
  return categoryIndexCache.get(id)!;
}

let manifestPromise: Promise<CategoryPackInfo[]> | null = null;
/** Lista de paquetes de categoría disponibles para activar (ver /admin/configuracion). */
export function loadCategoryManifest(): Promise<CategoryPackInfo[]> {
  if (!manifestPromise) {
    manifestPromise = fetchJson<CategoryPackInfo[]>("data/barcode-categories/manifest.json", []);
  }
  return manifestPromise;
}

const OFF_FIELDS = "product_name,product_name_es,brands,quantity,image_front_url,image_url";
const TIMEOUT_MS = 6000;

async function lookupOnline(code: string): Promise<BarcodeLookupResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${OFF_FIELDS}`,
      { signal: controller.signal },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.status !== 1 || !data.product) return null;

    const p = data.product;
    const name: string | undefined = p.product_name_es || p.product_name;
    if (!name) return null;

    return {
      name,
      brand: typeof p.brands === "string" && p.brands.trim() ? p.brands.split(",")[0].trim() : undefined,
      presentation: typeof p.quantity === "string" && p.quantity.trim() ? p.quantity.trim() : undefined,
      imageUrl: p.image_front_url || p.image_url || undefined,
      source: "online",
    };
  } catch {
    // Sin internet, tardó demasiado, o el servicio no respondió — se sigue
    // con el alta manual de siempre, sin interrumpir al usuario con un error.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function toResult(entry: SeedEntry): BarcodeLookupResult {
  return { name: entry.name, brand: entry.brand, presentation: entry.presentation, imageUrl: entry.imageUrl, source: "local" };
}

export async function lookupBarcode(code: string, activeCategoryIds: string[] = []): Promise<BarcodeLookupResult | null> {
  const base = (await loadBaseIndex()).get(code);
  if (base) return toResult(base);

  if (activeCategoryIds.length > 0) {
    const indexes = await Promise.all(activeCategoryIds.map((id) => loadCategoryIndex(id)));
    for (const index of indexes) {
      const hit = index.get(code);
      if (hit) return toResult(hit);
    }
  }

  return lookupOnline(code);
}
