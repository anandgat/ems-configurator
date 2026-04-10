const BASE_URL = process.env.BACKEND_API_URL || "http://localhost:5000";
const DEV = process.env.NODE_ENV === "development";

function logRequest(method, url, body) {
  if (!DEV) return;
  console.log(JSON.stringify({ type: "api_request", method, url, body: body ?? null }, null, 2));
}

function logResponse(method, url, status, data) {
  if (!DEV) return;
  console.log(JSON.stringify({ type: "api_response", method, url, status, data }, null, 2));
}

export async function fetchPlans() {
  const url = `${BASE_URL}/api/daily-cycle/plans`;
  logRequest("GET", url);
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) throw new Error(`Backend plans API returned ${res.status}`);
  const data = await res.json();
  logResponse("GET", url, res.status, data);
  return data.result;
}

export async function fetchProducts() {
  const url = `${BASE_URL}/api/daily-cycle/products`;
  logRequest("GET", url);
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) throw new Error(`Backend products API returned ${res.status}`);
  const data = await res.json();
  logResponse("GET", url, res.status, data);
  return data.result;
}

export async function runSimulation({
  planId,
  implementationId,
  zipCode,
  annualConsumption,
  numberOfStories = 1,
  systemPower = 0,
  baselineAnnualCost,
}) {
  const url = `${BASE_URL}/api/daily-cycle/simulate`;
  const body = { planId, implementationId, zipCode, annualConsumption, numberOfStories, systemPower, baselineAnnualCost };
  logRequest("POST", url, body);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Backend simulate API returned ${res.status}`);
  const data = await res.json();
  logResponse("POST", url, res.status, data);
  return data.result;
}

/**
 * Map a backend product to the shape Gemini expects for reasoning.
 */
export function mapProductForGemini(product) {
  return {
    implementationId: product.implementationId,
    name: product.productName,
    description: product.description,
    battery: `${product.batteryBrand} ${product.batteryModel} x${product.numberOfBatteries}`,
    batteryCapacityKWh: product.batteryCapacityKWh,
    totalStorageKWh: product.totalStorageKWh,
    inverter: `${product.inverterBrand} ${product.inverterModel}`,
    inverterPowerKW: product.inverterPowerW / 1000,
    maxDischargePowerKW: product.maxDischargePowerKW,
    totalSystemCost: product.totalSystemCost,
    hasSolarPanels: product.hasSolarPanels,
    hasSurgeProtection: product.hasSurgeProtection,
    depthOfDischarge: product.depthOfDischarge,
  };
}

/**
 * Map a backend product to the shape the results page expects for display.
 */
export function mapProductForDisplay(product, systemPower = 0) {
  const features = [];
  if (product.hasSurgeProtection) features.push("Surge Protection");
  if (product.hasSolarPanels && systemPower > 0) features.push("Solar Panels Included");
  features.push(`${product.numberOfBatteries}x ${product.batteryBrand} ${product.batteryModel} Batteries`);
  features.push(`${product.inverterBrand} ${product.inverterModel} Inverter`);
  if (product.maxDischargePowerKW) features.push(`${product.maxDischargePowerKW} kW Max Discharge`);

  return {
    implementationId: product.implementationId,
    name: product.productName,
    description: product.description,
    capacity_kw: product.inverterPowerW / 1000,
    storage_kwh: product.totalStorageKWh,
    cost_usd: product.totalSystemCost,
    battery_voltage: product.batteryVoltage,
    depth_of_discharge: product.depthOfDischarge,
    features,
  };
}
