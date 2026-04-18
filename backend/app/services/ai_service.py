import asyncio
import json
import re

from app.config import settings
from app.services.db_service import (
    _normalize_query,
    get_cached_search,
    upsert_suppliers,
    save_search_cache,
    log_search,
)

SYSTEM_PROMPT = """Sei un esperto analista di sourcing per l'e-commerce europeo, specializzato nel mercato italiano.
Analizza un prodotto e i risultati di ricerca web, poi restituisci un JSON strutturato.

Regole:
- Tutti i prezzi in EUR
- Tempi di spedizione verso Italia/UE
- Punteggi sono interi 0-100
- competition 100 = mercato aperto/facile, 0 = molto saturo
- supplier score è float 0-5
- verdict e note SEMPRE in italiano
- Restituisci SOLO JSON valido, zero testo aggiuntivo
"""

USER_PROMPT = """\
Analizza per un seller italiano e-commerce:

**Prodotto:** {query}
**Categoria:** {category}

**Ricerca supplier (Alibaba/wholesale):**
{supplier_results}

**Ricerca mercato (domanda/trend):**
{market_results}

Restituisci ESATTAMENTE questo JSON (nessun altro testo):
{{
  "viability": {{
    "score": <int 0-100>,
    "demand": <int 0-100>,
    "demand_note": "<1 frase in italiano>",
    "competition": <int 0-100>,
    "competition_note": "<1 frase in italiano>",
    "margin_potential": <int 0-100>,
    "margin_note": "<1 frase in italiano>",
    "sourcing_ease": <int 0-100>,
    "sourcing_note": "<1 frase in italiano>",
    "price_range_min": <float EUR>,
    "price_range_max": <float EUR>,
    "recommended_channels": ["<canale1>", "<canale2>"],
    "trend_yoy": <float percentuale es. 18.0>,
    "verdict": "<2-3 frasi in italiano con consiglio concreto>"
  }},
  "suppliers": [
    {{
      "id": "<slug-univoco>",
      "name": "<nome supplier>",
      "source": "<Alibaba|AliExpress|Web>",
      "url": "<url>",
      "type": "<dropshipping|stock|both>",
      "moq": <int>,
      "price_min": <float EUR>,
      "price_max": <float EUR>,
      "shipping_days_min": <int>,
      "shipping_days_max": <int>,
      "certifications": ["CE"],
      "score": <float 0-5>,
      "verified": <bool>,
      "years_on_platform": <int o null>,
      "response_rate": <int 0-100>,
      "description": "<1-2 frasi in italiano>"
    }}
  ]
}}

Includi 3-5 supplier reali o realistici. Prima i più affidabili per il mercato europeo.
"""


def _mock_response(query: str) -> dict:
    slug = re.sub(r"[^a-z0-9]+", "-", query.lower())[:24].strip("-")
    short = query[:15]
    return {
        "viability": {
            "score": 72,
            "demand": 78,
            "demand_note": "Interesse stabile con picchi stagionali negli ultimi 12 mesi.",
            "competition": 60,
            "competition_note": "Mercato competitivo ma con spazio per differenziarsi sul posizionamento.",
            "margin_potential": 74,
            "margin_note": "Margini buoni se il costo supplier è sotto il 35% del prezzo di vendita.",
            "sourcing_ease": 80,
            "sourcing_note": "Numerosi supplier verificati su Alibaba con MOQ accessibili.",
            "price_range_min": 19.99,
            "price_range_max": 49.99,
            "recommended_channels": ["Shopify", "TikTok Shop", "Amazon"],
            "trend_yoy": 18.0,
            "verdict": (
                f'"{query}" mostra buone prospettive per un seller early-stage. '
                "Inizia con dropshipping per validare il mercato, "
                "poi valuta lo stock una volta raggiunto un volume mensile stabile."
            ),
        },
        "suppliers": [
            {
                "id": f"{slug}-cn-001",
                "name": f"Ningbo {short} Manufacturing Co.",
                "source": "Alibaba",
                "url": "https://www.alibaba.com",
                "type": "both",
                "moq": 50,
                "price_min": 4.20,
                "price_max": 6.80,
                "shipping_days_min": 12,
                "shipping_days_max": 18,
                "certifications": ["CE", "RoHS"],
                "score": 4.2,
                "verified": True,
                "years_on_platform": 7,
                "response_rate": 94,
                "description": "Produttore verificato con 7 anni di export verso UE. Disponibile sia per dropshipping che acquisto stock.",
            },
            {
                "id": f"{slug}-cn-002",
                "name": f"Shenzhen {short} Factory",
                "source": "Alibaba",
                "url": "https://www.alibaba.com",
                "type": "dropshipping",
                "moq": 1,
                "price_min": 5.90,
                "price_max": 8.50,
                "shipping_days_min": 7,
                "shipping_days_max": 14,
                "certifications": ["CE"],
                "score": 3.7,
                "verified": True,
                "years_on_platform": 3,
                "response_rate": 88,
                "description": "Specializzato in dropshipping con logistica EU-friendly. Nessun MOQ per ordini singoli.",
            },
            {
                "id": f"{slug}-eu-001",
                "name": f"EuroSource {short} Wholesale",
                "source": "Web",
                "url": "https://www.google.com",
                "type": "stock",
                "moq": 100,
                "price_min": 7.50,
                "price_max": 9.20,
                "shipping_days_min": 2,
                "shipping_days_max": 4,
                "certifications": ["CE", "ISO 9001"],
                "score": 4.6,
                "verified": False,
                "years_on_platform": None,
                "response_rate": 79,
                "description": "Grossista europeo con magazzino in Italia/Germania. Spedizioni rapide, ideale per chi acquista stock.",
            },
        ],
    }


async def _tavily_search(api_key: str, query: str) -> str:
    from tavily import AsyncTavilyClient
    client = AsyncTavilyClient(api_key=api_key)
    try:
        result = await client.search(query, max_results=5, search_depth="basic")
        items = result.get("results", [])
        return "\n".join(
            f"- {r.get('title', '')}: {r.get('content', '')[:400]}" for r in items
        )
    except Exception as e:
        return f"[ricerca non disponibile: {e}]"


async def _run_ai(query: str, category: str | None) -> dict:
    """Run Tavily + Claude pipeline. Returns raw dict."""
    supplier_text = "[nessuna ricerca web]"
    market_text = "[nessuna ricerca web]"

    if settings.tavily_api_key:
        supplier_text, market_text = await asyncio.gather(
            _tavily_search(
                settings.tavily_api_key,
                f"{query} supplier wholesale alibaba aliexpress prezzo dropshipping EUR",
            ),
            _tavily_search(
                settings.tavily_api_key,
                f"{query} ecommerce domanda trend mercato italia shopify amazon 2024",
            ),
        )

    import anthropic
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    prompt = USER_PROMPT.format(
        query=query,
        category=category or "non specificata",
        supplier_results=supplier_text[:3000],
        market_results=market_text[:3000],
    )

    response = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.content[0].text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", raw)
    if match:
        raw = match.group(1)

    return json.loads(raw)


async def analyze_product(
    query: str,
    category: str | None = None,
    session_id: str = "anonymous",
) -> dict:
    normalized = _normalize_query(query)

    # ── 1. Cache check ────────────────────────────────────────────────────────
    cached = await asyncio.to_thread(get_cached_search, normalized)
    if cached:
        # Log hit in background, don't wait
        asyncio.ensure_future(asyncio.to_thread(log_search, query, category, session_id, True))
        return cached

    # ── 2. AI pipeline ────────────────────────────────────────────────────────
    if not settings.anthropic_api_key:
        data = _mock_response(query)
    else:
        try:
            data = await _run_ai(query, category)
        except Exception:
            data = _mock_response(query)

    # ── 3. Persist: upsert suppliers → save cache + log (parallel) ───────────
    try:
        supplier_ids = await asyncio.to_thread(upsert_suppliers, data["suppliers"])
        await asyncio.gather(
            asyncio.to_thread(save_search_cache, normalized, category, data["viability"], supplier_ids),
            asyncio.to_thread(log_search, query, category, session_id, False),
        )
    except Exception:
        pass  # Persistence failure must never break the search response

    return data
