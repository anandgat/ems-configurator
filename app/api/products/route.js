import { fetchProducts, mapProductForDisplay } from "@/lib/api";

export async function GET() {
  try {
    const backendProducts = await fetchProducts();
    const products = backendProducts.map(mapProductForDisplay);
    return Response.json({ products, source: "backend" });
  } catch (error) {
    console.error("Backend /products API failed:", error.message);
    return Response.json(
      { error: "Product catalog unavailable. Backend API is not reachable." },
      { status: 503 }
    );
  }
}
