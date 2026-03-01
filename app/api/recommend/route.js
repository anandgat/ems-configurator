import { GoogleGenerativeAI } from "@google/generative-ai";
import emsConfigs from "@/data/ems-configs.json";

export async function POST(req) {
  try {
    const userInput = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY is not set in .env.local" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are an expert Energy Management System (EMS) consultant.
Analyze the user's energy profile and ROI expectations, then recommend the best EMS configuration.

USER PROFILE:
- Daily energy consumption: ${userInput.daily_kwh} kWh
- Peak usage period: ${userInput.peak_hours}
- Grid electricity tariff: $${userInput.tariff}/kWh
- ROI target: ${userInput.roi_pct}% return within ${userInput.roi_years} years
- Property type: ${userInput.property_type}
- Primary goal: ${userInput.primary_goal}

AVAILABLE EMS CONFIGURATIONS:
${JSON.stringify(emsConfigs, null, 2)}

TASK:
Select the single BEST matching EMS configuration for this user. Consider:
1. Whether the payback period fits their ROI timeline
2. Whether storage capacity matches their daily consumption
3. Whether the system suits their property type and primary goal
4. Cost-effectiveness relative to their tariff rate

Return ONLY a valid JSON object (no markdown, no code blocks) with exactly this structure:
{
  "recommended_config": {
    "id": "",
    "name": "",
    "capacity_kw": 0,
    "storage_kwh": 0,
    "cost_usd": 0,
    "efficiency_pct": 0,
    "payback_years": 0,
    "annual_savings_usd": 0,
    "best_for": "",
    "features": [],
    "warranty_years": 0
  },
  "reason": "2-3 sentence plain English explanation of why this is the best match",
  "projected_annual_savings_usd": 0,
  "actual_payback_years": 0,
  "roi_achieved_pct": 0,
  "roi_meets_target": true,
  "alternative_note": "One sentence about the next best option if ROI target cannot be fully met, or empty string if target is met"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Strip any markdown code fences Gemini might add
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return Response.json(parsed);
  } catch (error) {
    console.error("Gemini API error:", error);
    return Response.json(
      { error: error.message || "Failed to get recommendation" },
      { status: 500 }
    );
  }
}
