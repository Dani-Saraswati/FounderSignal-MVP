# FounderSignal

FounderSignal is an AI-powered startup opportunity intelligence and validation platform built for founders, builders, and entrepreneurs. It monitors real-world market signals—including hiring trends, regulatory updates, developer activity, and public discussions—to synthesize viable startup opportunities in the Indian market.

## Key Features

- **📡 Opportunity Radar**: Visualizes active market opportunities grouped by vertical and sector, backed by real-time signal growth trackers and momentum indicators.
- **🎯 Builder Match**: Diagnostic system that evaluates personal domain expertise, capital limits, risk appetite, and time commitments to match builders with suitable startup opportunities.
- **🧬 Career Signal**: Parses profile details to calculate a Market Demand Score and identify high-demand skill areas based on current hiring data.
- **💡 Idea Validator**: Sandbox tool where builders can test custom startup ideas. The platform analyzes the concepts against real-world economic indicators and competition gaps.
- **⚙️ Ingestion & Enrichment Pipeline**: Aggregates signals from Reddit, GitHub, RBI announcements, and job boards. Uses a model-agnostic LLM caller to enrich raw clusters into structured startup briefs.
- **📊 Admin Dashboard**: Monitors cost, system health, and model performance parameters (token rates, API governance, active developer keys).

---

## Tech Stack

- **Front-end**: React 18, TypeScript, Vite, TailwindCSS
- **Charts & Icons**: Recharts, Lucide React
- **Ingestion Pipeline**: Node.js, `node-fetch`, HTTPS Streams
- **LLM Integrations**: Google Gemini API (`gemini-3.5-flash`), OpenAI API (`gpt-4o-mini`), Perplexity API (`llama-3.1-sonar-large-128k-online`)

---

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Install Dependencies

In the project root, run:
```bash
npm install
```

### 2. Run the Development Server

Start the Vite web application:
```bash
npm run dev
```
The application will default to running on **[http://localhost:3000](http://localhost:3000)**.

### 3. Run the Ingestion Pipeline

To fetch new market signals and update the opportunity feed:
```bash
node scripts/ingest_pipeline.cjs
```
- **Interactive Prompts**: If you do not have environment variables configured, the CLI will ask you to paste your API Key.
- **Auto-Detection**: The pipeline dynamically detects the API provider based on the key's prefix:
  - Keys starting with `sk-` will run on **ChatGPT/OpenAI**.
  - Keys starting with `pplx-` will run on **Perplexity**.
  - Other valid keys default to **Google Gemini**.

To bypass the prompt, define any of the following environment keys:
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `PERPLEXITY_API_KEY`

---

## Folder Structure

```text
├── db/                     # Ingested feed databases
├── dist/                   # Production build outputs
├── scripts/                # Ingestion & AI enrichment pipeline scripts
│   ├── ingest_pipeline.js  # ES Ingestion script
│   └── ingest_pipeline.cjs # CommonJS Ingestion script (preferred for CLI execution)
└── src/
    ├── components/         # Reusable UI components (OpportunityCards, Navigation)
    ├── context/            # Global AppContext and State Managers
    ├── data/               # Ingested opportunity JSONs and Mock datasets
    └── pages/              # Main sub-pages (Radar, Validator, Career, Builder, Admin)
```

## Contributing & Updates

When updating the opportunity feed, ensure your generated opportunities follow the TypeScript definitions outlined in the pipeline schemas. Generated opportunity data is stored in [`src/data/opportunities.json`](file:///c:/Users/ankur/Downloads/Antigravity%20Projects/FounderSignal/src/data/opportunities.json).
