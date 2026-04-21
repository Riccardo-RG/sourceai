-- SourceAI — RLS completo su tutte le tabelle
-- Architettura: il backend FastAPI usa service_role (bypassa RLS).
-- Il frontend usa anon key solo per auth (non accede mai direttamente alle tabelle).
-- Quindi: blocchiamo tutto l'accesso diretto via anon key, il backend ci pensa lui.

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. outreach_entries
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE outreach_entries ENABLE ROW LEVEL SECURITY;

-- Rimuovi policy vecchie se esistono (idempotente)
DROP POLICY IF EXISTS "owner_outreach" ON outreach_entries;
DROP POLICY IF EXISTS "anon_no_access_outreach" ON outreach_entries;

-- Utenti autenticati: solo le proprie righe
CREATE POLICY "auth_own_outreach" ON outreach_entries
  FOR ALL
  TO authenticated
  USING (session_id = auth.uid()::text)
  WITH CHECK (session_id = auth.uid()::text);

-- Utenti anonimi: nessun accesso diretto (il backend usa service_role)
CREATE POLICY "anon_no_access_outreach" ON outreach_entries
  FOR ALL
  TO anon
  USING (false);

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. margin_scenarios
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE margin_scenarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_scenarios" ON margin_scenarios;
DROP POLICY IF EXISTS "anon_no_access_scenarios" ON margin_scenarios;

CREATE POLICY "auth_own_scenarios" ON margin_scenarios
  FOR ALL
  TO authenticated
  USING (session_id = auth.uid()::text)
  WITH CHECK (session_id = auth.uid()::text);

CREATE POLICY "anon_no_access_scenarios" ON margin_scenarios
  FOR ALL
  TO anon
  USING (false);

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. suppliers (directory condivisa — solo il backend scrive)
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_suppliers" ON suppliers;
DROP POLICY IF EXISTS "anon_no_write_suppliers" ON suppliers;

-- Lettura pubblica OK (non contiene dati sensibili)
CREATE POLICY "public_read_suppliers" ON suppliers
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Scrittura: solo service_role (il backend) — anon e authenticated non scrivono
CREATE POLICY "no_client_write_suppliers" ON suppliers
  FOR INSERT TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "no_client_update_suppliers" ON suppliers
  FOR UPDATE TO anon, authenticated
  USING (false);

CREATE POLICY "no_client_delete_suppliers" ON suppliers
  FOR DELETE TO anon, authenticated
  USING (false);

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. search_cache (backend only — dati tecnici interni)
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE search_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_no_access_cache" ON search_cache;

CREATE POLICY "anon_no_access_cache" ON search_cache
  FOR ALL
  TO anon, authenticated
  USING (false);

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. search_history (analytics interne — backend only)
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_no_access_history" ON search_history;

CREATE POLICY "anon_no_access_history" ON search_history
  FOR ALL
  TO anon, authenticated
  USING (false);
