// Adelanta nombre/marca/presentación al dar de alta un producto por un
// código de barras que no está en el catálogo — en dos pasos:
//
// 1. Un archivo local (public/data/barcode-seed-pe.json, ~1500 productos
//    reales de marcas que se venden en Perú — Gloria, Laive, Alicorp,
//    Altomayo, Quaker, etc. — sacado una sola vez de Open Food Facts filtrado
//    por país) se consulta primero: no necesita internet ni tiene límite de
//    uso, y cubre lo que más se repite en una bodega peruana.
// 2. Si no está ahí, se consulta Open Food Facts en vivo (base colaborativa
//    y gratuita, sin API key, CORS habilitado) como respaldo — cubre mucho
//    más, pero no es específico de Perú (bastantes productos peruanos ahí
//    están etiquetados con otro país, o simplemente no están) y si no hay
//    internet en ese momento, no hay resultado.
//
// Ninguna de las dos trae precio — eso es siempre propio de cada tienda.
export interface BarcodeLookupResult {
  name: string;
  brand?: string;
  presentation?: string;
  imageUrl?: string;
  source: "local" | "online";
}

interface SeedEntry {
  code: string;
  name: string;
  brand?: string;
  presentation?: string;
  imageUrl?: string;
}

let localIndexPromise: Promise<Map<string, SeedEntry>> | null = null;

function loadLocalIndex(): Promise<Map<string, SeedEntry>> {
  if (!localIndexPromise) {
    localIndexPromise = fetch(`${import.meta.env.BASE_URL}data/barcode-seed-pe.json`)
      .then((res) => (res.ok ? res.json() : []))
      .then((entries: SeedEntry[]) => new Map(entries.map((e) => [e.code, e])))
      .catch(() => new Map<string, SeedEntry>());
  }
  return localIndexPromise;
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

export async function lookupBarcode(code: string): Promise<BarcodeLookupResult | null> {
  const local = (await loadLocalIndex()).get(code);
  if (local) {
    return { name: local.name, brand: local.brand, presentation: local.presentation, imageUrl: local.imageUrl, source: "local" };
  }
  return lookupOnline(code);
}
