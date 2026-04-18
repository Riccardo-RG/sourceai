-- SourceAI — Row Level Security
-- Ogni utente vede e modifica solo i propri dati (session_id = auth.uid())

ALTER TABLE outreach_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE margin_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_outreach" ON outreach_entries
  FOR ALL USING (session_id = auth.uid()::text);

CREATE POLICY "owner_scenarios" ON margin_scenarios
  FOR ALL USING (session_id = auth.uid()::text);
