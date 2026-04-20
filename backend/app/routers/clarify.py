import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config import settings

router = APIRouter()

_LANG_NAMES = {
    "en": "English", "it": "Italian", "es": "Spanish",
    "fr": "French", "de": "German", "pt": "Portuguese",
}

_SYSTEM = """You are Miriam, an AI assistant for e-commerce sellers.
Your ONLY task: given a product query, generate a JSON options panel so the seller can clarify their search strategy.

Return ONLY valid JSON — no markdown fences, no extra text, nothing else.

Structure:
{
  "intro": "A short friendly sentence in LANG asking the user to pick their strategy (max 90 chars)",
  "refined_query": "the product in English, specific, ready for B2B supplier searches (e.g. Alibaba, Europages)",
  "groups": [
    {
      "id": "positioning",
      "label": "label in LANG",
      "choices": [
        {"value": "mass_market", "label": "...", "desc": "..."},
        {"value": "premium", "label": "...", "desc": "..."},
        {"value": "artisanal", "label": "...", "desc": "..."},
        {"value": "dropshipping", "label": "...", "desc": "..."}
      ]
    },
    {
      "id": "market",
      "label": "label in LANG",
      "choices": [
        {"value": "GLOBAL", "label": "..."},
        {"value": "EUROPE", "label": "..."},
        ...
      ]
    }
  ]
}

RULES:

1. ALWAYS include "positioning" group — exactly 3-4 choices tailored to this product:
   - Use values: mass_market | premium | artisanal | dropshipping
   - Omit artisanal if product is a commodity/electronic (doesn't make sense)
   - Omit mass_market if product is inherently premium/luxury
   - Labels + desc in LANG. Labels max 28 chars, desc max 55 chars.
   - Desc should hint at which platforms/approach (e.g. "Alibaba, DHgate — costo minimo")

2. ALWAYS include "market" group — 4-5 most relevant markets:
   - Available values: GLOBAL | EUROPE | NORTH_AMERICA | LATAM | ASIA_PACIFIC | MIDDLE_EAST | GB | IT | DE | FR | ES | JP | AU | CA | MX | BR
   - Always include GLOBAL first
   - Pick markets most typical for buyers/sellers of this product type

3. Add "channel" group ONLY if the channel meaningfully changes supplier strategy AND positioning choices don't already imply it:
   - Values: online | store | dropshipping
   - Labels in LANG

4. Add "target_customer" ONLY for products where buyer segment significantly changes sourcing (e.g. professional-grade vs consumer-grade)

REFINED QUERY RULES:
- Must be in English
- Add relevant attributes if obvious from context (material, use-case, capacity)
- "borraccia termica" → "stainless steel thermal water bottle 500ml"
- "candele" → "handmade scented soy wax candles"
- "scarpe da running" → "running shoes athletic footwear"
- Keep under 8 words
"""


class ClarifyRequest(BaseModel):
    query: str
    lang: str = "en"


@router.post("")
async def clarify(req: ClarifyRequest):
    if not settings.anthropic_api_key:
        raise HTTPException(status_code=503, detail="AI not configured")

    import anthropic
    lang_name = _LANG_NAMES.get(req.lang, "English")
    system = _SYSTEM.replace("LANG", lang_name)

    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    msg = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=900,
        system=system,
        messages=[{"role": "user", "content": req.query.strip()}],
    )

    raw = msg.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid options JSON from AI")
