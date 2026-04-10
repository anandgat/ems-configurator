import { fetchProducts, mapProductForDisplay } from "@/lib/api";
import emsConfigsFallback from "@/data/ems-configs.json";

export async function GET() {
  try {
    const backendProducts = await fetchProducts();
    const products = backendProducts.map(mapProductForDisplay);
    return Response.json({ products, source: "backend" });
  } catch (error) {
    console.warn("Backend unavailable, using fallback product catalog:", error.message);
    // Fallback to hardcoded configs when backend is down
    const products = emsConfigsFallback.map((cfg) => ({
      ...cfg,
      implementationId: null,
      description: cfg.best_for,
    }));
    return Response.json({ products, source: "fallback" });
  }
}
