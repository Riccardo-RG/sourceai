import Link from 'next/link'

export const metadata = {
  title: 'Terms of Use — SourceAI',
  description: 'Termini di utilizzo di SourceAI.',
}

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 space-y-8">
      <div className="space-y-2">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Back to SourceAI</Link>
        <h1 className="text-2xl font-bold text-foreground">Terms of Use</h1>
        <p className="text-xs text-muted-foreground">Ultimo aggiornamento: Aprile 2026</p>
      </div>

      <Section title="1. Descrizione del servizio">
        <p>SourceAI è una piattaforma AI per la ricerca e validazione di prodotti e fornitori per seller e-commerce. Il servizio combina dati reali (Google Trends via DataForSEO, prezzi Amazon via Tavily) con analisi AI (Claude di Anthropic).</p>
      </Section>

      <Section title="2. Accuratezza dei dati">
        <p className="font-medium text-foreground">I dati mostrati da SourceAI hanno natura informativa e non costituiscono consulenza commerciale o finanziaria.</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li><strong className="text-foreground">Dati reali</strong> (Google Trends, prezzi Amazon): provengono da API terze e possono avere ritardi o imprecisioni</li>
          <li><strong className="text-foreground">Stime AI</strong> (score, verdict, analisi): generate da Claude di Anthropic sulla base dei dati disponibili — non sono garanzie di risultato</li>
          <li>Verifica sempre i dati prima di prendere decisioni di acquisto o investimento</li>
        </ul>
      </Section>

      <Section title="3. Uso accettabile">
        <p>Accetti di non utilizzare SourceAI per:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li>Attività illegali o fraudolente</li>
          <li>Tentare di estrarre in modo massiccio i dati tramite automazione (scraping)</li>
          <li>Aggirare i limiti di utilizzo (rate limiting)</li>
          <li>Trasmettere dati personali di terzi senza consenso</li>
        </ul>
      </Section>

      <Section title="4. Limiti di utilizzo">
        <p>Il servizio applica limiti di ricerca per garantire la qualità del servizio a tutti gli utenti:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li>Utenti anonimi: 5 ricerche ogni 60 secondi</li>
          <li>Utenti registrati: 20 ricerche ogni 60 secondi</li>
        </ul>
      </Section>

      <Section title="5. Proprietà intellettuale">
        <p>Il codice, il design e i contenuti originali di SourceAI sono di proprietà dei suoi creatori. I dati restituiti dalle API terze sono soggetti alle rispettive licenze.</p>
      </Section>

      <Section title="6. Limitazione di responsabilità">
        <p>SourceAI &egrave; fornito &quot;cos&igrave; com&apos;&egrave;&quot;. Non ci assumiamo responsabilit&agrave; per:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li>Decisioni di acquisto o investimento basate sui dati mostrati</li>
          <li>Interruzioni del servizio dovute a manutenzione o guasti delle API terze</li>
          <li>Imprecisioni nei dati provenienti da fonti esterne (DataForSEO, Tavily, Amazon)</li>
        </ul>
      </Section>

      <Section title="7. Modifiche al servizio">
        <p>Ci riserviamo il diritto di modificare o interrompere il servizio in qualsiasi momento. In caso di modifiche significative ai termini, aggiorneremo la data in cima a questa pagina.</p>
      </Section>

      <Section title="8. Legge applicabile">
        <p>I presenti termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente il Foro di Milano.</p>
      </Section>

      <Section title="9. Contatti">
        <p>Per una pubblicazione reale, configura qui il tuo indirizzo legale o di supporto.</p>
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
