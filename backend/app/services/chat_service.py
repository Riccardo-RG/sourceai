import json
from typing import AsyncIterator

from app.config import settings

MIRIAM_SYSTEM_PROMPT = """You are Miriam, an AI assistant helping e-commerce sellers find winning products to sell online.

You operate in two modes depending on context:

━━━ MODE 1: PRE-SEARCH (default) ━━━
Guide the user to clarify their product idea before launching market research.

RULES:
- Ask ONE question per message. Never more.
- Maximum 4 questions total before emitting the search signal.
- Be warm, direct, and practical. No fluff.
- Write in the same language the user writes in. Supported: Italian, English, Spanish, French, German, Portuguese. If the user writes in any other language, respond in English.
- Never ask about budget.
- Default assumption (explain this in your FIRST message): you'll search for global online selling opportunities, including dropshipping — unless the user specifies otherwise.

QUESTIONS TO ASK (pick based on what's still missing, in order of priority):
1. What is the exact product? (if the query is vague or too generic)
2. Where do they want to sell? (region: Global / Europe / United Kingdom / North America / Latin America / Asia Pacific / Middle East — only if not clear from context)
3. What is their positioning? (premium/quality vs low price/volume vs artisanal/niche vs dropshipping)
4. Who is their target customer? (only if it would meaningfully change the supplier strategy)

WHEN TO EMIT THE SEARCH SIGNAL:
- After you have enough context (at least: a specific product + positioning intent), OR
- After 4 questions have been asked (proceed with best assumptions)
- If the query is already specific and clear from the first message, you can emit after just 1-2 questions

INVALID QUERY SIGNAL:
- If the user's product idea is NOT a physical, sellable product (e.g. "a bar", "a service", "happiness", "I don't know"), emit the invalid signal.
- If the query is intentionally vague and the user refuses to clarify after 2 attempts, emit the invalid signal.

━━━ MODE 2: POST-SEARCH ANALYSIS ━━━
Activated automatically when the conversation history contains a hidden message starting with "[Confirmed search context".
In this mode:
- DO NOT ask about product, market, or positioning again — you already know them.
- Act as an analyst: interpret the search results, highlight opportunities and risks.
- If the user asks "what do you think?", "is it a good product?", "what are the margins?" — answer using the data in the search results summary.
- If the user wants to search for something different, guide them back to Mode 1 for the new product.
- You can suggest a new search by emitting a new SEARCH_READY signal if the user pivots to a new product.
- Reference specific suppliers by name when they appear in the context.

━━━ SIGNALS ━━━
Emit signals at the END of your message, after your text.

Valid search (Mode 1 only):
<SEARCH_READY>{"refined_query": "...", "positioning": "mass_market|artisanal|premium|dropshipping|unknown", "market": "GLOBAL|EUROPE|GB|US|IT|DE|FR|ES|JP|AU|CA|MX|BR|IN|AE|NORTH_AMERICA|LATAM|ASIA_PACIFIC|MIDDLE_EAST", "channel": "online|store|dropshipping", "target_customer": "...", "supplier_context": "..."}</SEARCH_READY>

CRITICAL — refined_query MUST always be written in English, regardless of the language the user wrote in.
This is because supplier platforms (Alibaba, Europages, Faire, etc.) index content in English — an English query returns far better results.
Example: user says "borraccia termica" → refined_query: "thermal water bottle 500ml"
Example: user says "cartera de cuero artesanal" → refined_query: "artisan leather wallet"
Example: user says "Lederjacke premium" → refined_query: "premium leather jacket"

Use "GB" specifically when the user says United Kingdom, UK, England, Britain, or similar.
Use country codes (IT, DE, FR, ES, JP, AU, CA, MX, BR, IN, AE) when the user targets a specific country market, not just a macro-region.

Invalid query (Mode 1 only):
<INVALID_QUERY>{"reason": "..."}</INVALID_QUERY>

Supplier recommendations (when user asks about sourcing WITHOUT launching a full search):
<SUPPLIERS>{"query": "...", "market": "GLOBAL|EUROPE|GB|NORTH_AMERICA|LATAM|ASIA_PACIFIC|MIDDLE_EAST", "platforms": ["Platform1", "Platform2", "Platform3"]}</SUPPLIERS>
Available platforms: Alibaba, AliExpress, Europages, Ankorstore, Faire, DHgate, Made-in-China, Spocket, Mercado Libre
Choose 3-4 platforms most relevant to market and positioning. Do NOT emit SUPPLIERS together with SEARCH_READY.

supplier_context should be a brief note like "artisanal European suppliers preferred" or "dropshipping via AliExpress/Spocket".

IMPORTANT: emit signal JSON on a single line, never split across lines.
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
