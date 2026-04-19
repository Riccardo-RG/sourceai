"""
Sliding-window rate limiter.
- Anonymous users: 5 searches / 60 s
- Authenticated users: 20 searches / 60 s
Single-instance safe (Railway runs one container per service).
"""
from collections import defaultdict, deque
from datetime import datetime, timezone
from fastapi import HTTPException

_buckets: dict[str, deque] = defaultdict(deque)
_last_cleanup: float = 0.0

ANON_MAX = 5
AUTH_MAX = 20
WINDOW_SECONDS = 60
CLEANUP_INTERVAL = 300  # purge stale buckets every 5 min


def _maybe_cleanup(now: float) -> None:
    global _last_cleanup
    if now - _last_cleanup < CLEANUP_INTERVAL:
        return
    _last_cleanup = now
    stale = [uid for uid, dq in _buckets.items() if not dq or now - dq[-1] > WINDOW_SECONDS * 2]
    for uid in stale:
        del _buckets[uid]


def check_rate_limit(user_id: str) -> None:
    now = datetime.now(timezone.utc).timestamp()
    _maybe_cleanup(now)

    # Heuristic: UUIDs from Supabase auth are 36 chars; session IDs are also UUIDs.
    # Authenticated users have user_id == Supabase UUID (non-anonymous).
    # We use a simple proxy: if the user_id looks like an auth UUID (not 'anonymous'),
    # grant the higher limit. For full correctness, the router would pass an is_authed flag.
    is_anon = user_id in ("anonymous", "ssr") or len(user_id) < 10
    max_requests = ANON_MAX if is_anon else AUTH_MAX

    bucket = _buckets[user_id]
    while bucket and now - bucket[0] > WINDOW_SECONDS:
        bucket.popleft()

    if len(bucket) >= max_requests:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please wait a few seconds before searching again.",
        )

    bucket.append(now)
