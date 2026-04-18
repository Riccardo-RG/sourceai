"""
Sync DB helpers — called via asyncio.to_thread() from async ai_service.
All functions are safe to call even when Supabase is not configured:
they silently no-op and return empty results.
"""
import re
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional


def _normalize_query(query: str) -> str:
    return re.sub(r"\s+", " ", query.lower().strip())


def _get_sb():
    try:
        from app.db.client import get_supabase
        return get_supabase()
    except Exception:
        return None


# ── Supplier helpers ─────────────────────────────────────────────────────────

def _db_row_to_supplier(row: dict) -> dict:
    """Map DB columns → Supplier model fields."""
    return {
        "id":                 str(row["id"]),
        "name":               row.get("name", ""),
        "source":             row.get("source", ""),
        "url":                row.get("url", ""),
        "type":               row.get("type", "both"),
        "moq":                row.get("moq") or 1,
        "price_min":          row.get("price_min") or 0.0,
        "price_max":          row.get("price_max") or 0.0,
        "shipping_days_min":  row.get("shipping_days_min") or 7,
        "shipping_days_max":  row.get("shipping_days_max") or 21,
        "certifications":     row.get("certifications") or [],
        "score":              row.get("ai_score") or 3.0,   # ai_score → score
        "verified":           row.get("verified") or False,
        "years_on_platform":  row.get("years_on_platform"),
        "response_rate":      row.get("response_rate") or 80,
        "description":        row.get("description") or "",
    }


def upsert_suppliers(suppliers: list[dict]) -> list[str]:
    """
    Insert new suppliers or increment search_count for existing ones.
    Returns the DB UUIDs for all suppliers (used to populate search_cache).
    """
    sb = _get_sb()
    if not sb:
        return []

    ids: list[str] = []
    now = datetime.now(timezone.utc).isoformat()

    for s in suppliers:
        try:
            existing = (
                sb.table("suppliers")
                .select("id, search_count")
                .eq("name", s["name"])
                .eq("source", s.get("source", ""))
                .limit(1)
                .execute()
            )

            if existing.data:
                row = existing.data[0]
                sb.table("suppliers").update({
                    "search_count": row["search_count"] + 1,
                    "last_seen":    now,
                    # Refresh fields that may improve over time
                    "price_min":    s.get("price_min"),
                    "price_max":    s.get("price_max"),
                    "ai_score":     s.get("score"),
                    "url":          s.get("url"),
                    "description":  s.get("description"),
                }).eq("id", row["id"]).execute()
                ids.append(str(row["id"]))

            else:
                new_id = str(uuid.uuid4())
                sb.table("suppliers").insert({
                    "id":                 new_id,
                    "name":               s["name"],
                    "source":             s.get("source", ""),
                    "url":                s.get("url", ""),
                    "type":               s.get("type", "both"),
                    "moq":                s.get("moq", 1),
                    "price_min":          s.get("price_min", 0),
                    "price_max":          s.get("price_max", 0),
                    "shipping_days_min":  s.get("shipping_days_min", 7),
                    "shipping_days_max":  s.get("shipping_days_max", 21),
                    "certifications":     s.get("certifications", []),
                    "ai_score":           s.get("score", 3.0),
                    "verified":           s.get("verified", False),
                    "years_on_platform":  s.get("years_on_platform"),
                    "response_rate":      s.get("response_rate", 80),
                    "description":        s.get("description", ""),
                    "search_count":       1,
                    "last_seen":          now,
                    "created_at":         now,
                }).execute()
                ids.append(new_id)

        except Exception:
            continue

    return ids


# ── Cache helpers ────────────────────────────────────────────────────────────

def get_cached_search(query_normalized: str) -> Optional[dict]:
    """Return cached result if it exists and hasn't expired, else None."""
    sb = _get_sb()
    if not sb:
        return None

    try:
        now = datetime.now(timezone.utc).isoformat()
        rows = (
            sb.table("search_cache")
            .select("*")
            .eq("query_normalized", query_normalized)
            .gt("expires_at", now)
            .limit(1)
            .execute()
        )
        if not rows.data:
            return None

        cached = rows.data[0]
        supplier_ids = cached.get("supplier_ids") or []

        suppliers: list[dict] = []
        if supplier_ids:
            sup_rows = (
                sb.table("suppliers")
                .select("*")
                .in_("id", supplier_ids)
                .execute()
            )
            suppliers = [_db_row_to_supplier(r) for r in sup_rows.data]

        return {"viability": cached["viability"], "suppliers": suppliers}

    except Exception:
        return None


def save_search_cache(
    query_normalized: str,
    category: Optional[str],
    viability: dict,
    supplier_ids: list[str],
) -> None:
    sb = _get_sb()
    if not sb:
        return
    try:
        now = datetime.now(timezone.utc)
        sb.table("search_cache").upsert(
            {
                "query_normalized": query_normalized,
                "category":         category,
                "viability":        viability,
                "supplier_ids":     supplier_ids,
                "created_at":       now.isoformat(),
                "expires_at":       (now + timedelta(hours=24)).isoformat(),
            },
            on_conflict="query_normalized",
        ).execute()
    except Exception:
        pass


# ── Analytics helpers ────────────────────────────────────────────────────────

def log_search(
    query: str,
    category: Optional[str],
    session_id: str,
    cache_hit: bool,
) -> None:
    sb = _get_sb()
    if not sb:
        return
    try:
        sb.table("search_history").insert({
            "id":         str(uuid.uuid4()),
            "query":      query,
            "category":   category,
            "session_id": session_id,
            "cache_hit":  cache_hit,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
    except Exception:
        pass
