-- SourceAI — Supplier directory + Search cache + Analytics
-- Esegui in DBeaver dopo 001_initial.sql

-- ── Supplier directory (condiviso, si accumula nel tempo) ────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT        NOT NULL,
    source              TEXT        NOT NULL,
    url                 TEXT,
    type                TEXT        NOT NULL DEFAULT 'both'
                                    CHECK (type IN ('dropshipping', 'stock', 'both')),
    moq                 INT,
    price_min           FLOAT,
    price_max           FLOAT,
    shipping_days_min   INT,
    shipping_days_max   INT,
    certifications      TEXT[]      DEFAULT '{}',
    ai_score            FLOAT,
    verified            BOOLEAN     DEFAULT FALSE,
    years_on_platform   INT,
    response_rate       INT,
    description         TEXT,
    search_count        INT         NOT NULL DEFAULT 1,
    last_seen           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Deduplicazione: stesso nome + stessa fonte = stesso supplier
    UNIQUE (name, source)
);

CREATE INDEX IF NOT EXISTS idx_suppliers_search_count ON suppliers (search_count DESC);
CREATE INDEX IF NOT EXISTS idx_suppliers_source        ON suppliers (source);

-- ── Search cache (TTL 24h, evita rieseguire AI per query ripetute) ────────────
CREATE TABLE IF NOT EXISTS search_cache (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    query_normalized TEXT        NOT NULL UNIQUE,
    category         TEXT,
    viability        JSONB       NOT NULL,
    supplier_ids     UUID[]      NOT NULL DEFAULT '{}',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at       TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_cache_query   ON search_cache (query_normalized);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON search_cache (expires_at);

-- ── Search history (analytics anonime) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS search_history (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    query      TEXT        NOT NULL,
    category   TEXT,
    session_id TEXT        NOT NULL,
    cache_hit  BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_session ON search_history (session_id);
CREATE INDEX IF NOT EXISTS idx_history_created ON search_history (created_at DESC);

-- ── Cleanup automatico cache scaduta (puoi schedulare via pg_cron su Supabase)
-- DELETE FROM search_cache WHERE expires_at < NOW();
