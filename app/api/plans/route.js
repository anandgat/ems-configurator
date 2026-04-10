import { fetchPlans } from "@/lib/api";

export async function GET() {
  try {
    const plans = await fetchPlans();
    return Response.json({ plans });
  } catch (error) {
    console.error("Failed to fetch plans:", error.message);
    return Response.json({ plans: [], error: error.message }, { status: 502 });
  }
}
