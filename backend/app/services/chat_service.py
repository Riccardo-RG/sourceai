import json
from typing import AsyncIterator

from app.config import settings

MIRIAM_SYSTEM_PROMPT = """You are Miriam, a technical advisor for e-commerce sellers, specializing in product sourcing and market validation.

━━━ CORE BEHAVIOR ━━━
- Be direct, concise, practical. No small talk or fluff.
- Write in the same language the user writes in (IT/EN/ES/FR/DE/PT → else EN).
- NEVER ask a series of questions. If you need one clarification, ask max 1 question and explain why.
- Give concrete answers with numbers and platform names — never "it depends" without a follow-up recommendation.
- You are a tool, not a chatbot. Prioritize useful information over conversation.

━━━ PRE-SEARCH (no search results in context yet) ━━━
- Welcome briefly and explain you can help interpret search results once a search is done.
- Suggest how to get better results: be specific in the query.
  Examples of good queries: "thermal water bottle 500ml BPA-free", "premium leather wallet slim Italy", "RGB gaming keyboard TKL dropshipping EU".
  What to include: product name + material/variant/spec + target market + business model (dropshipping/stock).
- If the user asks a direct question (about a platform, a product, margins), answer it and suggest a relevant search.
- If the user sends a product idea, briefly assess it and suggest the refined query they should search for.
  If the product is not a physical sellable product, say so clearly.

━━━ POST-SEARCH (search results available in context) ━━━
Activated when the conversation history contains a hidden message starting with "[Confirmed search context".
- Interpret the data: what do the scores actually mean for this specific product?
- Reference real numbers: "Demand at 72/100 means...", "Competition at 45 suggests..."
- Give actionable advice based on margin and sourcing data.
- If dropshipping vs stock question: use the margin data to give a concrete recommendation.
- If user wants to pivot to a new product, emit SEARCH_READY for the new search.
- Reference specific suppliers found in the results when relevant.

━━━ SIGNALS ━━━
Emit at END of message, after your text. JSON on a single line, never split.

Search signal (when user wants to launch a new search):
<SEARCH_READY>{"refined_query": "...", "positioning": "mass_market|artisanal|premium|dropshipping|unknown", "market": "GLOBAL|EUROPE|GB|IT|DE|FR|ES|JP|AU|CA|MX|BR|IN|AE|NORTH_AMERICA|LATAM|ASIA_PACIFIC|MIDDLE_EAST", "channel": "online|store|dropshipping", "target_customer": "...", "supplier_context": "..."}</SEARCH_READY>

CRITICAL: refined_query MUST be in English (supplier platforms index in English).
  "borraccia termica" → "thermal water bottle 500ml"
  "cartera cuero artesanal" → "artisan leather wallet"

Invalid product signal:
<INVALID_QUERY>{"reason": "..."}</INVALID_QUERY>

Supplier recommendations (when user asks about sourcing without launching a full search):
<SUPPLIERS>{"query": "...", "market": "GLOBAL|EUROPE|...", "platforms": ["Platform1", "Platform2"]}</SUPPLIERS>
Available: Alibaba, AliExpress, Europages, Ankorstore, Faire, DHgate, Made-in-China, Spocket, Mercado Libre
Do NOT combine SUPPLIERS with SEARCH_READY.
"""


async def stream_miriam_response(
    messages: list[dict],
    user_message: str,
) -> AsyncIterator[str]:
    import anthropic

    if not settings.anthropic_api_key:
        yield "data: " + json.dumps({"text": "Miriam is not configured (missing API key)."}) + "\n\n"
        yield "data: [DONE]\n\n"
        return

    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    history = [{"role": m["role"], "content": m["content"]} for m in messages]
    history.append({"role": "user", "content": user_message})

    buffer = ""
    signal_buffer = ""
    capturing_signal = False
    active_closing_tag = ""

    async with client.messages.stream(
        model="claude-haiku-4-5-20251001",
        max_tokens=512,
        system=MIRIAM_SYSTEM_PROMPT,
        messages=history,
    ) as stream:
        async for text in stream.text_stream:
            if capturing_signal:
                signal_buffer += text
                if active_closing_tag in signal_buffer:
                    end_idx = signal_buffer.find(active_closing_tag) + len(active_closing_tag)
                    full_signal = signal_buffer[:end_idx]
                    remaining = signal_buffer[end_idx:]
                    yield "data: " + json.dumps({"signal": full_signal}) + "\n\n"
                    capturing_signal = False
                    signal_buffer = ""
                    active_closing_tag = ""
                    if remaining.strip():
                        yield "data: " + json.dumps({"text": remaining}) + "\n\n"
            else:
                buffer += text
                # Check if a signal tag is starting
                if "<SEARCH_READY>" in buffer or "<INVALID_QUERY>" in buffer or "<SUPPLIERS>" in buffer:
                    tag = (
                        "<SEARCH_READY>" if "<SEARCH_READY>" in buffer
                        else "<INVALID_QUERY>" if "<INVALID_QUERY>" in buffer
                        else "<SUPPLIERS>"
                    )
                    idx = buffer.find(tag)
                    before = buffer[:idx]
                    if before:
                        yield "data: " + json.dumps({"text": before}) + "\n\n"
                    signal_buffer = buffer[idx:]
                    buffer = ""
                    # Check if entire signal is already in buffer
                    closing_tag = tag.replace("<", "</")
                    if closing_tag in signal_buffer:
                        end_idx = signal_buffer.find(closing_tag) + len(closing_tag)
                        full_signal = signal_buffer[:end_idx]
                        remaining = signal_buffer[end_idx:]
                        yield "data: " + json.dumps({"signal": full_signal}) + "\n\n"
                        if remaining.strip():
                            yield "data: " + json.dumps({"text": remaining}) + "\n\n"
                        signal_buffer = ""
                    else:
                        capturing_signal = True
                        active_closing_tag = closing_tag
                elif "<" in buffer:
                    # Might be start of a tag — hold the partial
                    last_lt = buffer.rfind("<")
                    safe = buffer[:last_lt]
                    if safe:
                        yield "data: " + json.dumps({"text": safe}) + "\n\n"
                    buffer = buffer[last_lt:]
                else:
                    if buffer:
                        yield "data: " + json.dumps({"text": buffer}) + "\n\n"
                    buffer = ""

    # Flush any remaining buffer
    if buffer.strip():
        yield "data: " + json.dumps({"text": buffer}) + "\n\n"
    if signal_buffer.strip():
        yield "data: " + json.dumps({"signal": signal_buffer}) + "\n\n"

    yield "data: [DONE]\n\n"
