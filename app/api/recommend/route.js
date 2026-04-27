import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchProducts, mapProductForGemini, mapProductForDisplay, runSimulation } from "@/lib/api";

export async function POST(req) {
  try {
    const body = await req.json();
    const { productsSource, planId, annualConsumption, currentUtilityRate, zipCode } = body;

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY is not set in .env.local" },
        { status: 500 }
      );
    }

    const activePlanId = planId ?? null;
    const baselineAnnualCost = annualConsumption * currentUtilityRate;
    const useBackend = productsSource === "backend";

    // Determine product catalog to send to Gemini
    let productsForGemini;
    let backendProducts = null;

    if (useBackend) {
      backendProducts = await fetchProducts();
      productsForGemini = backendProducts.map(mapProductForGemini);
    } else {
      return Response.json(
        { error: "Product catalog unavailable. The backend API is not reachable — please check the server connection." },
        { status: 503 }
      );
    }

    // Build Gemini prompt
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const MODELS = ["gemini-2.5-flash", "gemini-2.5-pro"];

    async function callGeminiWithFallback(prompt) {
      for (const modelId of MODELS) {
        const model = genAI.getGenerativeModel({ model: modelId });
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            console.log(`Gemini: trying ${modelId} (attempt ${attempt})`);
            const result = await model.generateContent(prompt);
            console.log(`Gemini: success with ${modelId}`);
            return result;
          } catch (err) {
            const isTransient = err.message?.includes("503") || err.status === 503 ||
                                err.message?.includes("403") || err.status === 403;
            if (isTransient && attempt === 1) {
              console.warn(`Gemini ${err.status} on ${modelId}, retrying in 2s…`);
              await new Promise((r) => setTimeout(r, 2000));
            } else if (isTransient) {
              console.warn(`Gemini ${err.status} on ${modelId} after retry, trying next model…`);
              break; // move to next model
            } else {
              throw err; // quota exhausted, bad key etc — don't retry
            }
          }
        }
      }
      throw new Error("All Gemini models are currently unavailable. Please try again in a moment.");
    }

    const prompt = `
You are an expert Energy Management System (EMS) consultant.
Analyze the user's energy profile and recommend the best battery storage configuration.

USER PROFILE:
- Annual energy consumption: ${annualConsumption} kWh
- Grid electricity tariff: $${currentUtilityRate}/kWh
- Baseline annual electricity cost: $${baselineAnnualCost.toFixed(2)}
- Location ZIP code: ${zipCode}

AVAILABLE EMS CONFIGURATIONS:
${JSON.stringify(productsForGemini, null, 2)}

TASK:
Select the single BEST matching EMS configuration that minimizes the user's electricity bill through battery storage and energy arbitrage.
Consider:
1. Whether the system's storage capacity matches their daily consumption needs
2. Cost-effectiveness relative to their tariff rate and energy usage
3. Battery capacity and discharge capability

${useBackend
  ? 'The "implementationId" field uniquely identifies each product. Return the chosen implementationId.'
  : 'The "id" field uniquely identifies each product. Return the chosen id.'}

Return ONLY a valid JSON object (no markdown, no code blocks) with exactly this structure:
{
  "chosen_id": ${useBackend ? '0' : '""'},
  "name": "Product name from the catalog",
  "reason": "2-3 sentence explanation of why this battery system is the best match for the user's consumption and savings potential",
  "estimated_annual_savings_usd": 0,
  "estimated_payback_years": 0,
  "roi_achieved_pct": 0,
  "roi_meets_target": true,
  "alternative_note": ""
}
`;

    const result = await callGeminiWithFallback(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, "").trim();
    const geminiResult = JSON.parse(clean);

    // Build response object
    let response = {
      gemini: geminiResult,
      simulation: null,
      simulationError: null,
    };

    // Find the chosen product and build display data
    let chosenProduct = null;
    if (useBackend && backendProducts) {
      chosenProduct = backendProducts.find(
        (p) => p.implementationId === geminiResult.chosen_id
      );

      if (chosenProduct) {
        const systemPower = 0;
        response.recommended_config = mapProductForDisplay(chosenProduct, systemPower);

        try {
          const simResult = await runSimulation({
            planId: activePlanId,
            implementationId: chosenProduct.implementationId,
            zipCode,
            annualConsumption,
            numberOfStories: 1,
            systemPower,
            baselineAnnualCost,
          });
          response.simulation = simResult;
        } catch (simError) {
          console.error("Simulation API error:", simError.message);
          response.simulationError = simError.message;
        }
      }
    }

    // Fallback if no backend product matched
    if (!chosenProduct) {
      const fallbackCfg = emsConfigsFallback.find(
        (c) => c.id === geminiResult.chosen_id || c.name === geminiResult.name
      ) || emsConfigsFallback[0];

      response.recommended_config = {
        ...fallbackCfg,
        implementationId: null,
        description: fallbackCfg.best_for,
      };
    }

    // Top-level fields for results page
    response.reason = geminiResult.reason;
    response.roi_meets_target = geminiResult.roi_meets_target;
    response.alternative_note = geminiResult.alternative_note || "";
    response.projected_annual_savings_usd =
      response.simulation?.summary?.annualNetBill != null
        ? Math.round(baselineAnnualCost - response.simulation.summary.annualNetBill)
        : geminiResult.estimated_annual_savings_usd;
    response.actual_payback_years =
      response.simulation?.summary?.annualNetBill != null
        ? parseFloat(
            (
              response.recommended_config.cost_usd /
              (baselineAnnualCost - response.simulation.summary.annualNetBill)
            ).toFixed(1)
          )
        : geminiResult.estimated_payback_years;
    response.roi_achieved_pct =
      response.simulation?.summary?.reductionPercent ??
      geminiResult.roi_achieved_pct;
    response.baselineAnnualCost = baselineAnnualCost;

    return Response.json(response);
  } catch (error) {
    console.error("Recommend API error:", error);
    return Response.json(
      { error: error.message || "Failed to get recommendation" },
      { status: 500 }
    );
  }
}
