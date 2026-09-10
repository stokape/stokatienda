// Consulta Open Food Facts (base colaborativa y gratuita de productos, sin
// necesidad de API key) para adelantar nombre/marca/presentación cuando se
// da de alta un producto por un código de barras que no está en nuestro
// catálogo. Es solo un adelanto: nunca trae precio (eso es siempre propio de
// cada tienda) ni cubre marcas 100% locales — si no aparece, se completa a
// mano como siempre. CORS está habilitado por el propio servicio, así que se
// puede consultar directo desde el navegador, sin backend propio de por medio.
export interface BarcodeLookupResult {
  name: string;
  brand?: string;
  presentation?: string;
  imageUrl?: string;
}

const OFF_FIELDS = "product_name,product_name_es,brands,quantity,image_front_url,image_url";
const TIMEOUT_MS = 6000;

export async function lookupBarcodeOnline(code: string): Promise<BarcodeLookupResult | null> {
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
    };
  } catch {
    // Sin internet, tardó demasiado, o el servicio no respondió — se sigue
    // con el alta manual de siempre, sin interrumpir al usuario con un error.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
