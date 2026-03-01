# EMS Configurator — AI-Powered Energy Management System Selector

A Next.js POC that uses **Gemini 3.1 Pro** to recommend the optimal EMS configuration based on a user's energy profile and ROI expectations.

---

## 🚀 Quick Start (3 Steps)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up your Gemini API key
```bash
cp .env.local.example .env.local
```
Then open `.env.local` and replace `your_gemini_api_key_here` with your actual key.

Get your key here: https://aistudio.google.com/app/apikey

### 3. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
ems-configurator/
├── app/
│   ├── page.js                  ← Input form (home page)
│   ├── results/page.js          ← AI recommendation results
│   ├── api/recommend/route.js   ← Gemini API call (server-side)
│   ├── layout.js
│   └── globals.css
├── components/
│   └── ROIChart.js              ← Chart.js ROI visualization
├── data/
│   └── ems-configs.json         ← EMS configuration database (mock)
├── .env.local.example           ← API key template
└── README.md
```

---

## 🔧 Customizing EMS Configurations

Edit `data/ems-configs.json` to add real EMS products. Each entry needs:

```json
{
  "id": "EMS-001",
  "name": "Product Name",
  "capacity_kw": 10,
  "storage_kwh": 15,
  "cost_usd": 18000,
  "efficiency_pct": 94,
  "payback_years": 6.5,
  "annual_savings_usd": 2769,
  "best_for": "Description of ideal use case",
  "features": ["Feature 1", "Feature 2"],
  "warranty_years": 10
}
```

---

## ☁️ Deploy to Vercel (Free)

```bash
npm install -g vercel
vercel
```

When prompted, add `GEMINI_API_KEY` as an environment variable in the Vercel dashboard.

---

## 🤖 AI Model

Uses **Gemini 3.1 Pro Preview** (`gemini-3.1-pro-preview`)

> Note: Gemini 3 Pro Preview is discontinued March 9, 2026. This project uses 3.1 Pro directly.

---

## 📋 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| AI | Google Gemini 3.1 Pro |
| Styling | Tailwind CSS |
| Charts | Chart.js + react-chartjs-2 |
| Deployment | Vercel |
