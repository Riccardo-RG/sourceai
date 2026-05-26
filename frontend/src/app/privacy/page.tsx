import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — SourceAI',
  description: 'Come SourceAI raccoglie e utilizza i tuoi dati.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 space-y-8">
      <div className="space-y-2">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Back to SourceAI</Link>
        <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground">Ultimo aggiornamento: Aprile 2026</p>
      </div>

      <Section title="1. Chi siamo">
        <p>SourceAI è una piattaforma AI di sourcing per seller e-commerce. Il titolare del trattamento è SourceAI (contatto: vedi sezione 7).</p>
      </Section>

      <Section title="2. Dati che raccogliamo">
        <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground">
          <li><strong className="text-foreground">Session ID anonimo</strong> — un UUID generato nel tuo browser e salvato in localStorage. Serve a mantenere la sessione senza richiedere registrazione.</li>
          <li><strong className="text-foreground">Query di ricerca</strong> — le query che invii vengono elaborate dalle nostre API e salvate in cache per 24 ore per migliorare le prestazioni. Non sono associate a dati personali identificabili.</li>
          <li><strong className="text-foreground">Outreach e scenari (solo utenti registrati)</strong> — i contatti fornitori e gli scenari di margine salvati sono associati al tuo account Supabase e sono protetti da Row-Level Security.</li>
          <li><strong className="text-foreground">Email e password (solo utenti registrati)</strong> — gestite da Supabase Auth con hashing sicuro. Non le memorizziamo direttamente.</li>
        </ul>
      </Section>

      <Section title="3. API e servizi terzi">
        <p className="mb-3">Per erogare il servizio utilizziamo:</p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground">
          <li><strong className="text-foreground">Anthropic (Claude AI)</strong> — analisi di mercato e chat Miriam. Le query vengono inviate ai server Anthropic. <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy Anthropic</a></li>
          <li><strong className="text-foreground">DataForSEO</strong> — dati Google Trends. Le query vengono inviate ai server DataForSEO. <a href="https://dataforseo.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy DataForSEO</a></li>
          <li><strong className="text-foreground">Tavily</strong> — ricerca web per prezzi Amazon e supplier. Le query vengono inviate ai server Tavily. <a href="https://tavily.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy Tavily</a></li>
          <li><strong className="text-foreground">Supabase</strong> — autenticazione e database. I dati sono ospitati su Supabase (EU region). <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy Supabase</a></li>
          <li><strong className="text-foreground">Vercel</strong> — hosting del frontend. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy Vercel</a></li>
          <li><strong className="text-foreground">Railway</strong> — hosting del backend. <a href="https://railway.app/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy Railway</a></li>
        </ul>
      </Section>

      <Section title="4. Come usiamo i dati">
        <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground">
          <li>Erogare il servizio di analisi di mercato e ricerca supplier</li>
          <li>Cache delle ricerche per migliorare le prestazioni (24 ore)</li>
          <li>Migliorare la qualità del servizio tramite analytics aggregate e anonime</li>
          <li><strong className="text-foreground">Non vendiamo dati a terzi.</strong></li>
          <li><strong className="text-foreground">Non usiamo i dati per addestrare modelli AI.</strong></li>
        </ul>
      </Section>

      <Section title="5. I tuoi diritti (GDPR)">
        <p className="mb-2">Se sei un utente registrato puoi:</p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground">
          <li><strong className="text-foreground">Accedere</strong> ai tuoi dati: outreach e scenari sono visibili nell&apos;app</li>
          <li><strong className="text-foreground">Cancellare</strong> i tuoi dati: puoi eliminare singoli record dall&apos;app, o richiedere la cancellazione completa dell&apos;account contattandoci</li>
          <li><strong className="text-foreground">Portabilit&agrave;</strong>: i tuoi dati sono esportabili su richiesta</li>
          <li><strong className="text-foreground">Opposizione</strong>: puoi smettere di usare il servizio in qualsiasi momento</li>
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">Per utenti anonimi (senza account): i dati sono legati al Session ID nel tuo browser. Cancellare i dati del browser rimuove il Session ID e dissocia tutti i dati anonimi.</p>
      </Section>

      <Section title="6. Conservazione dei dati">
        <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground">
          <li>Cache ricerche: 24 ore</li>
          <li>Outreach e scenari: fino alla cancellazione da parte dell&apos;utente</li>
          <li>Log tecnici (Railway/Vercel): max 30 giorni</li>
        </ul>
      </Section>

      <Section title="7. Contatti">
        <p>Per domande sulla privacy o per esercitare i tuoi diritti, scrivici a: <strong className="text-foreground">privacy@sourceai.app</strong></p>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </section>
  )
}
