"""
In-memory rate limiter: max 5 search requests per user per 60 seconds.
Single-instance safe (Railway runs one container per service).
"""
from collections import defaultdict, deque
from datetime import datetime, timezone
from fastapi import HTTPException

_buckets: dict[str, deque] = defaultdict(deque)

MAX_REQUESTS = 5
WINDOW_SECONDS = 60


def check_rate_limit(user_id: str) -> None:
    now = datetime.now(timezone.utc).timestamp()
    bucket = _buckets[user_id]

    # Drop timestamps outside the window
    while bucket and now - bucket[0] > WINDOW_SECONDS:
        bucket.popleft()

    if len(bucket) >= MAX_REQUESTS:
        raise HTTPException(
            status_code=429,
            detail="Troppe richieste. Attendi qualche secondo prima di cercare di nuovo.",
        )

    bucket.append(now)
