import asyncio
import json
import re
import urllib.parse

from app.config import settings
from app.services.db_service import (
    _normalize_query,
    get_cached_search,
    save_search_cache,
    log_search,
    upsert_suppliers,
)
from app.services.trends_service import MARKET_CONFIG

SYSTEM_PROMPT = """You are an international e-commerce analyst.
You receive real research data (prices from the target Amazon marketplace, market articles, supplier availability).
Produce a structured assessment BASED EXCLUSIVELY on the data received.

CORE RULES:
- Extract prices directly from Amazon search results — do not invent them
- If data is missing for an aspect, say so explicitly in the note
- Scores must reflect the data found, not random estimates
- Notes must cite the source ("On Amazon.{tld} we found...", "From industry articles...")
- competition 100 = open/easy market, 0 = very saturated
- All monetary values in the market's local currency
- Return ONLY valid JSON, zero additional text
"""

USER_PROMPT = """\
Analyze for an e-commerce seller:

**Product:** {query}
**Category:** {category}
**Target market:** {market_name} ({market_code}) — currency: {currency}

**Google Trends data for {market_name} (REAL — use for demand and trend_yoy):**
{trends_summary}

**Prices and competitors on Amazon.{amazon_tld}:**
{amazon_results}

**Market trends and demand:**
{market_results}

**Supplier availability (Alibaba/wholesale):**
{supplier_results}

Return EXACTLY this JSON (no other text):
{{
  "viability": {{
    "score": <int 0-100, weighted average of the other 4 scores>,
    "demand": <int 0-100, use interest_avg from Google Trends if available, otherwise estimate>,
    "demand_note": "<1-2 sentences citing Google Trends if available, e.g. 'Interest 68/100 on Google Trends {market_name}'>",
    "competition": <int 0-100, based on number of competitors on Amazon.{amazon_tld}>,
    "competition_note": "<1-2 sentences with real data found on Amazon.{amazon_tld}>",
    "margin_potential": <int 0-100, based on real Amazon prices vs estimated sourcing costs>,
    "margin_note": "<1-2 sentences with real price ranges found>",
    "sourcing_ease": <int 0-100, based on supplier availability found>,
    "sourcing_note": "<1-2 sentences on availability found>",
    "price_range_min": <float {currency}, minimum real price found on Amazon.{amazon_tld}, 0 if not found>,
    "price_range_max": <float {currency}, maximum real price found on Amazon.{amazon_tld}, 0 if not found>,
    "recommended_channels": ["<channel1>", "<channel2>"],
    "trend_yoy": <float percentage estimated from articles, 0 if not found>,
    "verdict": "<2-3 concrete sentences based on the real data found>"
  }}
}}
"""


SUPPLIER_PLATFORMS = {
    "dropshipping": [
        {
            "platform": "AliExpress",
            "url": "https://www.aliexpress.com/wholesale?SearchText={q}",
            "label": "Search on AliExpress",
            "description": "Dropshipping with no minimum order",
        },
        {
            "platform": "Spocket",
            "url": "https://www.spocket.co/products?search={q}",
            "label": "Search on Spocket",
            "description": "EU/US suppliers for fast dropshipping",
        },
        {
            "platform": "DHgate",
            "url": "https://www.dhgate.com/wholesale/search.do?searchkey={q}",
            "label": "Search on DHgate",
            "description": "Small-batch wholesale, dropshipping-friendly",
        },
    ],
    "artisanal": [
        {
            "platform": "Europages",
            "url": "https://www.europages.co.uk/companies/{q}.html",
            "label": "Search on Europages",
            "description": "European manufacturers and artisans",
        },
        {
            "platform": "Ankorstore",
            "url": "https://www.ankorstore.com/search?query={q}",
            "label": "Search on Ankorstore",
            "description": "European artisan brands, low MOQ",
        },
        {
            "platform": "Faire",
            "url": "https://www.faire.com/search?q={q}",
            "label": "Search on Faire",
            "description": "Independent artisan brands, net-60 payment",
        },
    ],
    "premium": [
        {
            "platform": "Europages",
            "url": "https://www.europages.co.uk/companies/{q}.html",
            "label": "Search on Europages",
            "description": "Quality European manufacturers",
        },
        {
            "platform": "Alibaba",
            "url": "https://www.alibaba.com/trade/search?SearchText={q}",
            "label": "Search on Alibaba",
            "description": "Verified manufacturers with custom branding",
        },
        {
            "platform": "Ankorstore",
            "url": "https://www.ankorstore.com/search?query={q}",
            "label": "Search on Ankorstore",
            "description": "Curated European brands",
        },
    ],
    "mass_market": [
        {
            "platform": "Alibaba",
            "url": "https://www.alibaba.com/trade/search?SearchText={q}",
            "label": "Search on Alibaba",
            "description": "Manufacturers and wholesalers, negotiable MOQ",
        },
        {
            "platform": "Made-in-China",
            "url": "https://www.made-in-china.com/multi-search/{q}/F1/",
            "label": "Search on Made-in-China",
            "description": "Verified Chinese manufacturers",
        },
        {
            "platform": "DHgate",
            "url": "https://www.dhgate.com/wholesale/search.do?searchkey={q}",
            "label": "Search on DHgate",
            "description": "Small-batch wholesale, fast shipping",
        },
        {
            "platform": "AliExpress",
            "url": "https://www.aliexpress.com/wholesale?SearchText={q}",
            "label": "Search on AliExpress",
            "description": "Test small quantities before scaling",
        },
    ],
    "unknown": [
        {
            "platform": "Alibaba",
            "url": "https://www.alibaba.com/trade/search?SearchText={q}",
            "label": "Search on Alibaba",
            "description": "Manufacturers and wholesalers, negotiable MOQ",
        },
        {
            "platform": "AliExpress",
            "url": "https://www.aliexpress.com/wholesale?SearchText={q}",
            "label": "Search on AliExpress",
            "description": "Dropshipping with no minimum order",
        },
        {
            "platform": "Europages",
            "url": "https://www.europages.co.uk/companies/{q}.html",
            "label": "Search on Europages",
            "description": "European suppliers, fast EU shipping",
        },
    ],
}

# Extra platform added when market context is known (appended after positioning links)
MARKET_EXTRA_PLATFORMS: dict[str, dict] = {
    "EUROPE": {
        "platform": "Ankorstore",
        "url": "https://www.ankorstore.com/search?query={q}",
        "label": "Search on Ankorstore",
        "description": "European brands and artisans, quick EU delivery",
    },
    "LATAM": {
        "platform": "Mercado Libre",
        "url": "https://listado.mercadolibre.com.mx/search?as_word={q}",
        "label": "Search on Mercado Libre",
        "description": "Latin America's largest marketplace — demand + local competitors",
    },
    "ASIA_PACIFIC": {
        "platform": "Made-in-China",
        "url": "https://www.made-in-china.com/multi-search/{q}/F1/",
        "label": "Search on Made-in-China",
        "description": "Verified Chinese manufacturers, Asia-Pacific shipping",
    },
    "MIDDLE_EAST": {
        "platform": "DHgate",
        "url": "https://www.dhgate.com/wholesale/search.do?searchkey={q}",
        "label": "Search on DHgate",
        "description": "Small-batch wholesale, ships to Middle East",
    },
    "NORTH_AMERICA": {
        "platform": "Spocket",
        "url": "https://www.spocket.co/products?search={q}",
        "label": "Search on Spocket",
        "description": "US/EU suppliers, fast North America shipping",
    },
}


def _build_sourcing_links(
    query: str,
    market: str = "GLOBAL",
    positioning: str = "unknown",
) -> list[dict]:
    q = urllib.parse.quote_plus(query)
    market_upper = market.upper()
    conf = MARKET_CONFIG.get(market_upper, MARKET_CONFIG["GLOBAL"])
    amazon_tld = conf.get("amazon_tld")
    market_name = conf.get("name", market)

    pos_key = positioning if positioning in SUPPLIER_PLATFORMS else "unknown"
    platform_templates = SUPPLIER_PLATFORMS[pos_key]

    links = [
        {
            "platform": t["platform"],
            "url": t["url"].format(q=q),
            "label": t["label"],
            "description": t["description"],
        }
        for t in platform_templates
    ]

    # Add market-specific extra platform (skip if already in the list)
    extra = MARKET_EXTRA_PLATFORMS.get(market_upper)
    if extra:
        already = {lnk["platform"] for lnk in links}
        if extra["platform"] not in already:
            links.append({
                "platform": extra["platform"],
                "url": extra["url"].format(q=q),
                "label": extra["label"],
                "description": extra["description"],
            })

    if amazon_tld:
        links.append({
            "platform": f"Amazon {market_name}",
            "url": f"https://www.amazon.{amazon_tld}/s?k={q}",
            "label": f"Research on Amazon {market_name}",
            "description": f"Competitor prices and demand signals on Amazon.{amazon_tld}",
        })

    return links


async def _tavily_search(api_key: str, query: str, max_results: int = 5) -> str:
    from tavily import AsyncTavilyClient
    client = AsyncTavilyClient(api_key=api_key)
    try:
        result = await client.search(query, max_results=max_results, search_depth="basic")
        items = result.get("results", [])
        return "\n".join(
            f"- {r.get('title', '')}: {r.get('content', '')[:500]}" for r in items
        )
    except Exception as e:
        return f"[search unavailable: {e}]"


def _detect_local_market(query: str, supplier_context: str) -> str | None:
    """Extract a local country hint from query or supplier_context."""
    text = (query + " " + supplier_context).lower()
    if any(w in text for w in ("italia", "italian", "made in italy", "italiano")):
        return "Italy"
    if any(w in text for w in ("france", "french", "français", "francia")):
        return "France"
    if any(w in text for w in ("spain", "españa", "español", "spanish")):
        return "Spain"
    if any(w in text for w in ("germany", "deutsch", "german", "germania")):
        return "Germany"
    if any(w in text for w in ("uk", "britain", "british", "england")):
        return "UK"
    return None


# Search keywords localized per language code
_WEB_SEARCH_TERMS: dict[str, dict[str, str]] = {
    "it": {"supplier": "produttore fornitore", "artisanal": "artigianale ingrosso", "wholesale": "fornitore ingrosso", "drop": "dropshipping fornitore"},
    "es": {"supplier": "fabricante proveedor", "artisanal": "artesanal mayorista", "wholesale": "proveedor mayorista", "drop": "dropshipping proveedor"},
    "fr": {"supplier": "fabricant fournisseur", "artisanal": "artisanal grossiste", "wholesale": "fournisseur grossiste", "drop": "dropshipping fournisseur"},
    "de": {"supplier": "Hersteller Lieferant", "artisanal": "handwerklich Großhandel", "wholesale": "Lieferant Großhandel", "drop": "Dropshipping Lieferant"},
    "pt": {"supplier": "fabricante fornecedor", "artisanal": "artesanal atacado", "wholesale": "fornecedor atacado", "drop": "dropshipping fornecedor"},
    "ja": {"supplier": "メーカー サプライヤー", "artisanal": "職人 卸売", "wholesale": "卸売 サプライヤー", "drop": "ドロップシッピング"},
    "en": {"supplier": "manufacturer supplier", "artisanal": "artisanal wholesale", "wholesale": "supplier wholesale", "drop": "dropshipping supplier"},
}


def _web_search_terms(market: str, local_market: str | None) -> dict[str, str]:
    """Return localized Tavily keyword dict for the given market."""
    from app.services.trends_service import MARKET_CONFIG
    conf = MARKET_CONFIG.get(market.upper(), MARKET_CONFIG["GLOBAL"])
    lang = conf.get("language_code", "en")
    # Force English for UK regardless of language_code
    if local_market == "UK":
        lang = "en"
    return _WEB_SEARCH_TERMS.get(lang, _WEB_SEARCH_TERMS["en"])


async def _search_real_suppliers(
    api_key: str,
    query: str,
    market: str,
    positioning: str,
    supplier_context: str = "",
) -> tuple[list[dict], str]:
    """
    Dual Tavily search: platform directory + open web in parallel.
    Returns (structured_supplier_cards, raw_text_for_claude_prompt).
    """
    from tavily import AsyncTavilyClient

    client = AsyncTavilyClient(api_key=api_key)
    market_upper = market.upper()
    local_market = _detect_local_market(query, supplier_context)

    # ── Platform-specific query ───────────────────────────────────────────────
    # Europages is the best European B2B directory for small/local manufacturers.
    # Faire/Ankorstore for non-European artisan brand discovery.
    if positioning == "artisanal":
        if market_upper in ("EUROPE", "GB") or local_market:
            loc = local_market or "Europe"
            platform_sq = f"site:europages.co.uk {query} {loc} manufacturer"
        else:
            platform_sq = f"site:faire.com {query} brand"
    elif positioning == "premium":
        if market_upper in ("EUROPE", "GB") or local_market:
            loc = local_market or "Europe"
            platform_sq = f"site:europages.co.uk {query} {loc} manufacturer"
        else:
            platform_sq = f"site:alibaba.com {query} verified supplier"
    elif positioning == "dropshipping":
        platform_sq = f"site:spocket.co {query} supplier"
    elif market_upper == "LATAM":
        platform_sq = f"site:made-in-china.com {query} manufacturer"
    else:
        platform_sq = f"site:alibaba.com {query} supplier manufacturer"

    # ── Open web query ───────────────────────────────────────────────────────
    market_conf = MARKET_CONFIG.get(market_upper, MARKET_CONFIG["GLOBAL"])
    geo = local_market or market_conf.get("name", market)
    ctx_hint = f" {supplier_context}" if supplier_context else ""
    terms = _web_search_terms(market_upper, local_market)
    if positioning in ("artisanal", "premium"):
        web_sq = f"{query} {terms['artisanal']} {geo}{ctx_hint}"
    elif positioning == "dropshipping":
        web_sq = f"{query} {terms['drop']} {geo}"
    else:
        web_sq = f"{query} {terms['wholesale']} manufacturer B2B {geo}"

    # ── Run both searches in parallel ────────────────────────────────────────
    try:
        platform_res, web_res = await asyncio.gather(
            client.search(platform_sq, max_results=4, search_depth="basic"),
            client.search(web_sq, max_results=4, search_depth="basic"),
            return_exceptions=True,
        )
        platform_results = platform_res.get("results", []) if isinstance(platform_res, dict) else []
        web_results = web_res.get("results", []) if isinstance(web_res, dict) else []
    except Exception:
        return [], "[supplier data unavailable]"

    raw_results = platform_results + web_results

    supplier_text = "\n".join(
        f"- {r.get('title', '')}: {r.get('content', '')[:300]}"
        for r in raw_results[:6]
    ) or "[no supplier data found]"

    def _platform_from_url(url: str) -> str:
        if "faire.com" in url:     return "Faire"
        if "ankorstore" in url:    return "Ankorstore"
        if "europages" in url:     return "Europages"
        if "alibaba.com" in url:   return "Alibaba"
        if "made-in-china" in url: return "Made-in-China"
        if "spocket" in url:       return "Spocket"
        if "dhgate" in url:        return "DHgate"
        if "aliexpress" in url:    return "AliExpress"
        return "Web"

    def _clean_name(title: str, platform: str) -> str:
        for suffix in [
            f" - {platform}", f" | {platform}", f" - {platform}.com",
            " - Europages", "| Europages", " - Alibaba.com", "- Alibaba",
            " | Alibaba", " - Made-in-China.com", " – Ankorstore",
            " | Faire", " - Faire",
        ]:
            title = title.replace(suffix, "")
        for sep in [" - ", " | ", " — ", " – "]:
            if sep in title:
                title = title.split(sep)[0]
        return title.strip()[:80]

    skip_patterns = [
        "/search?", "/wholesale?", "SearchText=", "/trade/search",
        "/en/products/", "/catalog/", "page=", "?q=",
        "/product-detail/", "/product/", "?keyword=", "/offers-for-sale",
        "/multi-search/", "showroom", "/p-detail", "offerList",
        "/products?", "/search/", "?search=", "?query=",
        "amazon.", "ebay.", "etsy.", "instagram.", "facebook.", "linkedin.",
        "pinterest.", "twitter.", "youtube.", "tiktok.",
    ]

    suppliers: list[dict] = []
    seen_urls: set[str] = set()

    for r in raw_results:
        url = r.get("url", "")
        title = r.get("title", "")
        content = r.get("content", "")

        if not url or not title:
            continue
        if any(p in url for p in skip_patterns):
            continue
        if url in seen_urls:
            continue
        seen_urls.add(url)

        platform = _platform_from_url(url)
        name = _clean_name(title, platform)
        if not name:
            continue

        suppliers.append({
            "name": name,
            "platform": platform,
            "url": url,
            "description": content[:220].strip() if content else "",
            "source": platform,
            "verified": False,
            "ai_score": 3.0,
        })

        if len(suppliers) >= 6:
            break

    return suppliers, supplier_text


_LANG_NAMES = {
    "it": "Italian", "es": "Spanish", "fr": "French",
    "de": "German", "pt": "Portuguese", "ja": "Japanese", "en": "English",
}


async def _run_ai(
    query: str,
    category: str | None,
    market: str = "GLOBAL",
    context: dict | None = None,
    lang: str = "en",
) -> dict:
    from app.services.trends_service import get_trends_data

    positioning = (context or {}).get("positioning", "unknown")
    supplier_ctx = (context or {}).get("supplier_context", "")
    channel = (context or {}).get("channel", "online")
    target_customer = (context or {}).get("target_customer", "")

    conf = MARKET_CONFIG.get(market.upper(), MARKET_CONFIG["GLOBAL"])
    amazon_tld = conf.get("amazon_tld", "com")
    market_name = conf["name"]
    currency = conf["currency"]

    amazon_text = "[data unavailable]"
    market_text = "[data unavailable]"
    supplier_text = "[data unavailable]"
    trends_data = None

    # 3 Tavily calls total (down from 5):
    #   1. Amazon prices  2. Market trends  3. B2B supplier search (merged with real supplier cards)
    tasks = [get_trends_data(query, market)]
    real_suppliers: list[dict] = []
    if settings.tavily_api_key:
        _mkt_terms = _web_search_terms(market.upper(), None)
        tasks += [
            _tavily_search(
                settings.tavily_api_key,
                f"{query} {_mkt_terms['supplier']} amazon.{amazon_tld} price",
                max_results=7,
            ),
            _tavily_search(
                settings.tavily_api_key,
                f"{query} ecommerce market {market_name} demand trend 2024 2025",
            ),
            _search_real_suppliers(settings.tavily_api_key, query, market, positioning, supplier_ctx),
        ]
        results = await asyncio.gather(*tasks)
        trends_data = results[0]
        amazon_text, market_text = results[1], results[2]
        if len(results) > 3:
            real_suppliers, supplier_text = results[3]
    else:
        trends_data = await get_trends_data(query, market)

    trends_text = trends_data["summary"] if trends_data else "[Google Trends unavailable]"

    import anthropic
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    # Inject seller context into the prompt when available
    context_note = ""
    if context:
        parts = []
        if positioning and positioning != "unknown":
            parts.append(f"positioning: {positioning}")
        if channel:
            parts.append(f"sales channel: {channel}")
        if target_customer:
            parts.append(f"target customer: {target_customer}")
        if supplier_ctx:
            parts.append(f"supplier preference: {supplier_ctx}")
        if parts:
            context_note = "\n**Seller context (from pre-search chat):** " + ", ".join(parts)

    response_lang = _LANG_NAMES.get(lang, "English")
    lang_instruction = (
        f"\n\nLANGUAGE RULE: Write all text fields (verdict, demand_note, competition_note, margin_note, sourcing_note, recommended_channels) in {response_lang}. JSON keys must remain in English."
        if response_lang != "English" else ""
    )

    prompt = USER_PROMPT.format(
        query=query,
        category=category or "unspecified",
        market_name=market_name,
        market_code=market.upper(),
        currency=currency,
        amazon_tld=amazon_tld,
        trends_summary=trends_text,
        amazon_results=amazon_text[:2500],
        market_results=market_text[:2000],
        supplier_results=supplier_text[:2000],
    ) + context_note + lang_instruction

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

    data = json.loads(raw)
    data["sourcing_links"] = _build_sourcing_links(query, market, positioning)

    if trends_data:
        data["viability"]["trend_yoy"] = trends_data["trend_yoy"]
        data["viability"]["trends_interest"] = trends_data["interest_avg"]
        data["viability"]["trends_peak"] = trends_data["peak_month"]
        data["viability"]["trends_market"] = trends_data["market_name"]

    data["real_suppliers"] = real_suppliers

    # Persist real suppliers to DB and capture IDs for cache linking
    supplier_ids: list[str] = []
    if real_suppliers:
        try:
            supplier_ids = await asyncio.to_thread(upsert_suppliers, real_suppliers)
        except Exception:
            pass
    data["_supplier_ids"] = supplier_ids

    return data


async def analyze_product(
    query: str,
    category: str | None = None,
    session_id: str = "anonymous",
    market: str = "US",
    context: dict | None = None,
    lang: str = "en",
) -> dict:
    positioning = (context or {}).get("positioning", "unknown")
    normalized = _normalize_query(f"{query}_{market.upper()}")

    # ── 1. Cache check ────────────────────────────────────────────────────────
    cached = await asyncio.to_thread(get_cached_search, normalized)
    if cached:
        asyncio.ensure_future(asyncio.to_thread(log_search, query, category, session_id, True))
        cached["sourcing_links"] = _build_sourcing_links(query, market, positioning)
        # Rebuild real_suppliers from cached supplier DB rows
        db_suppliers = cached.get("suppliers", [])
        cached["real_suppliers"] = [
            {
                "name": s.get("name", ""),
                "platform": s.get("source", ""),
                "url": s.get("url", ""),
                "description": s.get("description", ""),
            }
            for s in db_suppliers
            if s.get("name") and s.get("url")
        ]
        return cached

    # ── 2. AI pipeline ────────────────────────────────────────────────────────
    if not settings.anthropic_api_key:
        data = _mock_response(query, market, positioning)
    else:
        try:
            data = await _run_ai(query, category, market, context, lang)
        except Exception as e:
            import logging
            logging.getLogger(__name__).error("AI pipeline failed: %s", e)
            data = _mock_response(query, market, positioning)

    supplier_ids = data.pop("_supplier_ids", [])

    # ── 3. Persist ────────────────────────────────────────────────────────────
    try:
        await asyncio.gather(
            asyncio.to_thread(
                save_search_cache, normalized, category, data["viability"], supplier_ids
            ),
            asyncio.to_thread(log_search, query, category, session_id, False),
        )
    except Exception:
        pass

    return data


def _mock_response(query: str, market: str = "US", positioning: str = "unknown") -> dict:
    return {
        "viability": {
            "score": 0,
            "demand": 0,
            "demand_note": "Data unavailable — ANTHROPIC_API_KEY not configured.",
            "competition": 0,
            "competition_note": "Data unavailable.",
            "margin_potential": 0,
            "margin_note": "Data unavailable.",
            "sourcing_ease": 0,
            "sourcing_note": "Data unavailable.",
            "price_range_min": 0,
            "price_range_max": 0,
            "recommended_channels": [],
            "trend_yoy": 0,
            "verdict": "Analysis unavailable: configure ANTHROPIC_API_KEY to enable AI search.",
        },
        "sourcing_links": _build_sourcing_links(query, market, positioning),
    }
