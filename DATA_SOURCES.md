# Data Sources — Developer Reference

> Questo file è solo per uso interno sviluppatore.
> Ogni dato mostrato in UI deve avere una fonte tracciabile da questa tabella.

---

## Tabella fonti dati

| Campo UI | Fonte | Affidabilità | Note tecniche |
|---|---|---|---|
| **Demand score** (0-100) | Google Trends via DataForSEO | ✅ Reale | `interest_avg` da `/v3/keywords_data/google_trends/explore/live`. Se DataForSEO non risponde → Claude stima da contesto Tavily |
| **Trend YoY** (%) | Google Trends via DataForSEO | ✅ Reale | Calcolato in `trends_service.py` come delta tra primo e ultimo bucket temporale |
| **Competition score** (0-100) | Tavily scraping Amazon | 🟡 Indicativo | Claude interpreta il numero di risultati/competitor trovati su Amazon.{tld}. Non è un dato strutturato |
| **Margin potential score** (0-100) | Tavily scraping Amazon | 🟡 Indicativo | Claude stima il margine in base ai prezzi trovati su Amazon vs costi wholesale approssimativi |
| **Sourcing ease score** (0-100) | Tavily scraping Alibaba/wholesale | 🟡 Indicativo | Claude valuta la disponibilità di supplier trovati. Non è un dato strutturato |
| **Overall viability score** (0-100) | Claude | ⚪ Stima AI | Media pesata dei 4 score sopra. Completamente derivato |
| **Price range min/max** | Tavily scraping Amazon | 🟡 Indicativo | Claude estrae i prezzi dal testo di scraping. Può essere impreciso se il prodotto è generico |
| **Recommended channels** | Claude | ⚪ Stima AI | Ragionamento qualitativo. Non basato su dati strutturati |
| **Verdict** | Claude | ⚪ Stima AI | Sintesi narrativa dei dati trovati |
| **Demand note / Competition note / etc.** | Claude | ⚪ Stima AI | Testo generato. Citano le fonti Tavily ma non sono dati verificabili |
| **Sourcing links** | Hardcoded + URL building | ✅ Reale | URL costruiti programmaticamente da query + market. Sempre validi come link di ricerca |
| **Supplier platform selection** | Logica in `ai_service.py` | ✅ Reale | Basato su `positioning` da Miriam chat. Deterministic, non AI |

---

## Flusso dati dettagliato

```
Query utente
    │
    ├── Google Trends (DataForSEO API)
    │       └── interest_avg, trend_yoy  ← DATO REALE
    │
    ├── Tavily search #1: "product price amazon.{tld}"
    │       └── testo grezzo con prezzi ← SCRAPING INDICATIVO
    │
    ├── Tavily search #2: "product ecommerce market demand trend"
    │       └── articoli di settore ← SCRAPING INDICATIVO
    │
    ├── Tavily search #3: supplier query (varia per positioning)
    │       └── pagine supplier/wholesale ← SCRAPING INDICATIVO
    │
    └── Claude Sonnet
            ├── Input: tutto quanto sopra
            └── Output: JSON con score + note ← STIMA AI
```

---

## Cosa manca (dato non raggiungibile oggi)

| Dato | Perché manca | Alternativa attuale |
|---|---|---|
| Prezzi supplier reali (MOQ, unità) | Alibaba non ha API pubblica gratuita | Tavily scraping grezzo |
| Volume vendite Amazon | Amazon non lo espone via API (BSR ≠ volume) | Non mostrato |
| Numero recensioni competitor | Richiederebbe Amazon Product API (a pagamento) | Non mostrato |
| Stock availability supplier | Nessuna API accessibile | Non mostrato |
| Storico prezzi Amazon | Richiederebbe Keepa o simili | Non mostrato |

---

## Legenda affidabilità

| Simbolo | Significato | Badge UI (da implementare) |
|---|---|---|
| ✅ Reale | Dato da API strutturata, verificabile | 🟢 Dato verificato |
| 🟡 Indicativo | Scraping web via Tavily, può variare | 🟡 Dato indicativo |
| ⚪ Stima AI | Generato da Claude senza input strutturato | ⚪ Stima AI |

---

## File rilevanti

- `backend/app/services/trends_service.py` — DataForSEO integration + MARKET_CONFIG
- `backend/app/services/ai_service.py` — Tavily queries + Claude prompt + sourcing links
- `backend/app/services/chat_service.py` — Miriam streaming (Claude Haiku)
- `backend/app/models/search.py` — SearchRequest (include `context` da Miriam)
