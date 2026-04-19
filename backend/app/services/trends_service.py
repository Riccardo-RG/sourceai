"""
DataForSEO Google Trends integration.
Returns real interest-over-time data for any supported market.
Falls back gracefully to None if unavailable.
"""
import base64
import logging
from typing import Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

DATAFORSEO_URL = "https://api.dataforseo.com/v3/keywords_data/google_trends/explore/live"

MARKET_CONFIG: dict[str, dict] = {
    # ── Macro-markets ─────────────────────────────────────────────────────────
    "GLOBAL":        {"location_code": None, "language_code": "en", "name": "Global",           "amazon_tld": "com",     "currency": "USD"},
    "EUROPE":        {"location_code": 2276, "language_code": "en", "name": "Europe",            "amazon_tld": "co.uk",   "currency": "EUR"},
    "NORTH_AMERICA": {"location_code": 2840, "language_code": "en", "name": "North America",     "amazon_tld": "com",     "currency": "USD"},
    "LATAM":         {"location_code": 2484, "language_code": "es", "name": "Latin America",     "amazon_tld": "com.mx",  "currency": "USD"},
    "ASIA_PACIFIC":  {"location_code": 2392, "language_code": "en", "name": "Asia Pacific",      "amazon_tld": "co.jp",   "currency": "USD"},
    "MIDDLE_EAST":   {"location_code": 2784, "language_code": "en", "name": "Middle East",       "amazon_tld": "ae",      "currency": "USD"},
    # ── Individual markets ────────────────────────────────────────────────────
    "US": {"location_code": 2840, "language_code": "en", "name": "United States", "amazon_tld": "com",       "currency": "USD"},
    "GB": {"location_code": 2826, "language_code": "en", "name": "United Kingdom","amazon_tld": "co.uk",     "currency": "GBP"},
    "IT": {"location_code": 2380, "language_code": "it", "name": "Italy",         "amazon_tld": "it",        "currency": "EUR"},
    "DE": {"location_code": 2276, "language_code": "de", "name": "Germany",       "amazon_tld": "de",        "currency": "EUR"},
    "FR": {"location_code": 2250, "language_code": "fr", "name": "France",        "amazon_tld": "fr",        "currency": "EUR"},
    "ES": {"location_code": 2724, "language_code": "es", "name": "Spain",         "amazon_tld": "es",        "currency": "EUR"},
    "JP": {"location_code": 2392, "language_code": "ja", "name": "Japan",         "amazon_tld": "co.jp",     "currency": "JPY"},
    "AU": {"location_code": 2036, "language_code": "en", "name": "Australia",     "amazon_tld": "com.au",    "currency": "AUD"},
    "CA": {"location_code": 2124, "language_code": "en", "name": "Canada",        "amazon_tld": "ca",        "currency": "CAD"},
    "MX": {"location_code": 2484, "language_code": "es", "name": "Mexico",        "amazon_tld": "com.mx",    "currency": "MXN"},
    "BR": {"location_code": 2076, "language_code": "pt", "name": "Brazil",        "amazon_tld": "com.br",    "currency": "BRL"},
    "IN": {"location_code": 2356, "language_code": "en", "name": "India",         "amazon_tld": "in",        "currency": "INR"},
    "AE": {"location_code": 2784, "language_code": "ar", "name": "UAE",           "amazon_tld": "ae",        "currency": "AED"},
    "SE": {"location_code": 2752, "language_code": "sv", "name": "Sweden",        "amazon_tld": "se",        "currency": "SEK"},
    "PL": {"location_code": 2616, "language_code": "pl", "name": "Poland",        "amazon_tld": "pl",        "currency": "PLN"},
    "NL": {"location_code": 2528, "language_code": "nl", "name": "Netherlands",   "amazon_tld": "nl",        "currency": "EUR"},
    "TR": {"location_code": 2792, "language_code": "tr", "name": "Turkey",        "amazon_tld": "com.tr",    "currency": "TRY"},
    "SG": {"location_code": 2702, "language_code": "en", "name": "Singapore",     "amazon_tld": None,        "currency": "SGD"},
}


def _auth_header() -> str:
    token = base64.b64encode(
        f"{settings.dataforseo_login}:{settings.dataforseo_password}".encode()
    ).decode()
    return f"Basic {token}"


async def get_trends_data(keyword: str, market: str = "US") -> Optional[dict]:
    """
    Fetch Google Trends data for a keyword in the target market (past 12 months).
    Returns:
        {
            "interest_avg": int (0-100),
            "trend_yoy": float (% change, positive = growing),
            "peak_month": str,
            "summary": str  (human-readable summary),
            "market_name": str,
        }
    or None if unavailable.
    """
    if not settings.dataforseo_login or not settings.dataforseo_password:
        return None

    conf = MARKET_CONFIG.get(market.upper(), MARKET_CONFIG["GLOBAL"])

    task: dict = {
        "keywords": [keyword],
        "language_code": conf["language_code"],
        "time_range": "past_12_months",
        "type": "web_search",
    }
    # GLOBAL has no location_code → worldwide trends
    if conf["location_code"] is not None:
        task["location_code"] = conf["location_code"]

    payload = [task]

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                DATAFORSEO_URL,
                json=payload,
                headers={
                    "Authorization": _auth_header(),
                    "Content-Type": "application/json",
                },
            )
            resp.raise_for_status()
            body = resp.json()
    except Exception as e:
        logger.warning("DataForSEO request failed: %s", e)
        return None

    try:
        task = body["tasks"][0]
        if task.get("status_code") != 20000:
            logger.warning("DataForSEO task error: %s", task.get("status_message"))
            return None

        result = task["result"][0]
        items = result.get("items") or []

        graph = next((i for i in items if i.get("type") == "google_trends_graph"), None)
        if not graph:
            return None

        series = graph.get("data", {}).get(keyword, [])
        if len(series) < 4:
            return None

        values = [p["value"] for p in series if isinstance(p.get("value"), (int, float))]
        if not values:
            return None

        interest_avg = round(sum(values) / len(values))

        first_3 = sum(values[:3]) / 3
        last_3 = sum(values[-3:]) / 3
        if first_3 > 0:
            trend_yoy = round(((last_3 - first_3) / first_3) * 100, 1)
        else:
            trend_yoy = 0.0

        peak_idx = values.index(max(values))
        peak_month = series[peak_idx].get("date_from", "")[:7] if peak_idx < len(series) else ""

        direction = "growing" if trend_yoy > 5 else "declining" if trend_yoy < -5 else "stable"
        summary = (
            f"Google Trends ({conf['name']}): {interest_avg}/100 (12-month avg), "
            f"trend {direction} ({trend_yoy:+.0f}% last vs first 3 months)."
        )
        if peak_month:
            summary += f" Peak at {peak_month}."

        return {
            "interest_avg": interest_avg,
            "trend_yoy": trend_yoy,
            "peak_month": peak_month,
            "summary": summary,
            "market_name": conf["name"],
        }

    except Exception as e:
        logger.warning("DataForSEO parsing failed: %s", e)
        return None
