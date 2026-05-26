# SourceAI

SourceAI is a sourcing and market-validation assistant for e-commerce sellers.
It combines real market signals, indicative web research, and AI reasoning in a single workflow:

- validate demand before sourcing a product
- compare market attractiveness across regions
- surface supplier platforms based on seller positioning
- estimate margins from observed marketplace prices
- keep supplier outreach and margin scenarios in one place

The product is opinionated about data reliability: uncertain data should be labeled, not presented as fact.

## Portfolio Blurb

SourceAI is an AI-native sourcing and market-validation tool for e-commerce sellers. I built it as a full-stack system that combines structured market data, web research, and LLM reasoning while explicitly separating verified signals from indicative data and AI estimates. The project showcases product thinking, multi-source backend orchestration, streaming AI UX, and data-reliability constraints applied end to end.

## Why This Project Matters

Most AI product-research tools blur together three very different things:

- structured data from APIs
- scraped web results
- AI-generated estimates

SourceAI treats those as separate reliability tiers in both product logic and UI. That constraint is the core product decision behind the codebase.

See [DATA_SOURCES.md](./DATA_SOURCES.md) for the detailed mapping between each UI field and its real source.

## Core Features

- Miriam chat assistant to refine vague product ideas before running costly analysis
- Google Trends integration through DataForSEO for real demand signals
- Tavily-powered web search for Amazon pricing and supplier discovery
- supplier link recommendations based on business model and market context
- margin calculator with saved scenarios
- supplier outreach tracker
- Supabase authentication and persistence
- multilingual UI with custom Zustand-based i18n (`EN`, `IT`, `ES`)

## Tech Stack

- Frontend: Next.js App Router, React 19, TypeScript, Tailwind CSS 4, Zustand
- Backend: FastAPI, Pydantic, httpx
- Auth and persistence: Supabase
- AI: Anthropic models
- External data: DataForSEO, Tavily
- Deployment config: Vercel + Railway-oriented files already present in the repo

## Repository Structure

```text
.
|- backend/
|  |- app/
|  |  |- dependencies/
|  |  |- models/
|  |  |- routers/
|  |  `- services/
|  |- .env.example
|  |- main.py
|  `- requirements.txt
|- frontend/
|  |- src/
|  |  |- app/
|  |  |- components/
|  |  |- hooks/
|  |  |- lib/
|  |  |- store/
|  |  `- types/
|  |- .env.example
|  `- package.json
|- DATA_SOURCES.md
`- vercel.json
```

## Data Reliability Model

SourceAI intentionally separates data into three categories:

- Verified: structured API data such as Google Trends via DataForSEO
- Indicative: web scraping/search results, mainly via Tavily
- AI estimate: model-generated judgments such as margin potential or sourcing ease

That distinction is reflected in the product and should stay visible in future changes.

## Local Setup

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

Required backend environment variables:

- `ANTHROPIC_API_KEY`
- `TAVILY_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `DATAFORSEO_LOGIN`
- `DATAFORSEO_PASSWORD`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Required frontend environment variables:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The frontend runs on [http://localhost:3000](http://localhost:3000) and expects the backend on `http://localhost:8000` by default.

## Current State

This repository is a working product prototype, not a finished SaaS.

What is already solid:

- clear frontend/backend separation
- explicit data-source policy
- coherent service/router/model organization in the backend
- product flows that connect search, sourcing, margin analysis, and outreach

What still deserves follow-up:

- stronger end-to-end typing between backend responses and frontend state
- automated tests
- more decomposition of large orchestrator components and services

## Notes For Reviewers

- The app includes internal product copy in Italian because the original target audience is Italian sellers.
- Some scores are intentionally AI-derived and should not be read as verified metrics.
- Supplier links are deterministic search links, while supplier cards discovered from Tavily remain indicative.

## Commands

```bash
cd frontend && npm run lint
```

```bash
cd backend && uvicorn main:app --reload --port 8000
```
