-- SourceAI — Schema iniziale
-- Esegui questo file in DBeaver connettendoti al tuo progetto Supabase
-- Host: db.<project-ref>.supabase.co | Port: 5432 | DB: postgres

-- ── Outreach entries ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS outreach_entries (
    id            UUID PRIMARY KEY,
    supplier_id   TEXT        NOT NULL,
    supplier_name TEXT        NOT NULL,
    product_query TEXT        NOT NULL,
    status        TEXT        NOT NULL DEFAULT 'inviato'
                              CHECK (status IN ('inviato','in_attesa','risposto','trattativa','chiuso')),
    note          TEXT,
    session_id    TEXT        NOT NULL,
    sent_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_update   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outreach_session ON outreach_entries (session_id);

-- ── Margin scenarios ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS margin_scenarios (
    id            UUID PRIMARY KEY,
    name          TEXT        NOT NULL,
    supplier_name TEXT,
    inputs        JSONB       NOT NULL,
    result        JSONB       NOT NULL,
    session_id    TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scenarios_session ON margin_scenarios (session_id);

-- ── Row Level Security (opzionale ma consigliato su Supabase) ────────────────
-- ALTER TABLE outreach_entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE margin_scenarios ENABLE ROW LEVEL SECURITY;
