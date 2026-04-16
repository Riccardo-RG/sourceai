'use client'

import { InfoTooltip } from '@/components/ui/info-tooltip'

interface SubScore { label: string; value: number; note: string; tooltip: string }
interface ViabilityData { score: number; sub: SubScore[]; verdict: string }

function getMockData(query: string): ViabilityData {
  return {
    score: 72,
    sub: [
      { label: 'Domanda', value: 80, note: 'Interesse in crescita costante negli ultimi 12 mesi', tooltip: 'Misura quanto le persone cercano attivamente questo prodotto (Google Trends, segnali social). Alto = mercato già attivo.' },
      { label: 'Competizione', value: 58, note: 'Mercato affollato ma con spazio per differenziarsi', tooltip: 'Stima quanti seller stanno già vendendo questo prodotto. Più è basso, più è facile entrare nel mercato.' },
      { label: 'Margine potenziale', value: 74, note: 'Range prezzi €12–38 con costi supplier da €4–9', tooltip: 'Calcolato sui prezzi di mercato rilevati e i costi medi dei supplier trovati. Indica se il prodotto è vendibile con margine sostenibile.' },
      { label: 'Facilità sourcing', value: 76, note: '40+ supplier attivi su Alibaba, MOQ accessibili', tooltip: 'Quanti supplier attivi esistono, con MOQ e prezzi accessibili. Alto = puoi iniziare subito senza grandi investimenti.' },
    ],
    verdict: `"${query}" è un prodotto con buone prospettive. La domanda è solida e il sourcing è accessibile. La competizione è media — differenziarsi su packaging o posizionamento è la chiave.`,
  }
}

const SIGNAL_TOOLTIPS: Record<string, string> = {
  'Range prezzi mercato': 'Prezzi rilevati su marketplace attivi (Amazon, Shopify store, ecc.). Utile per scegliere il tuo prezzo di vendita.',
  'Canale consigliato': 'Piattaforme dove questo tipo di prodotto ottiene più trazione organica e a pagamento.',
  'Trend': "Variazione della domanda rispetto all'anno precedente. Positivo = il mercato sta crescendo.",
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444'
  const label = score >= 70 ? 'Buono' : score >= 45 ? 'Discreto' : 'Rischioso'
  const r = 38; const circ = 2 * Math.PI * r; const dash = (score / 100) * circ
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 96 96" className="w-full h-full -rotate-90">
          <circle cx="48" cy="48" r={r} fill="none" stroke="currentColor" strokeWidth="7" className="text-muted/40" />
          <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`} className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tabular-nums leading-none" style={{ color }}>{score}</span>
          <span className="text-sm text-muted-foreground mt-1">/100</span>
        </div>
      </div>
      <span className="text-base font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}

function SubScoreBar({ sub }: { sub: SubScore }) {
  const color = sub.value >= 70 ? 'bg-emerald-500' : sub.value >= 45 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold">{sub.label}</span>
          <InfoTooltip text={sub.tooltip} />
        </div>
        <span className="text-base font-bold tabular-nums text-muted-foreground">{sub.value}</span>
      </div>
      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${sub.value}%` }} />
      </div>
      <p className="text-base text-muted-foreground">{sub.note}</p>
    </div>
  )
}

export default function ViabilityScore({ query }: { query: string }) {
  const data = getMockData(query)
  return (
    <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Viability Score</h3>
          <InfoTooltip text="Punteggio 0–100 che combina domanda, competizione, margine potenziale e facilità di sourcing. Sopra 70 = vale la pena procedere." />
        </div>

        {/* Score + sub scores */}
        <div className="flex gap-8 items-start">
          <div className="shrink-0">
            <ScoreRing score={data.score} />
          </div>
          <div className="flex-1 space-y-5">
            {data.sub.map((s) => <SubScoreBar key={s.label} sub={s} />)}
          </div>
        </div>

        {/* Verdict */}
        <div className="rounded-xl bg-muted/50 px-5 py-4">
          <p className="text-base text-muted-foreground leading-relaxed">{data.verdict}</p>
        </div>
      </div>

      {/* Signals footer */}
      <div className="grid grid-cols-3 border-t border-border/60">
        {[
          { label: 'Range prezzi mercato', value: '€12 – €38' },
          { label: 'Canale consigliato', value: 'Shopify · TikTok' },
          { label: 'Trend annuale', value: '↑ +18% YoY' },
        ].map((s, i) => (
          <div key={s.label} className={`px-5 py-5 space-y-1.5 ${i < 2 ? 'border-r border-border/60' : ''}`}>
            <div className="flex items-center gap-1.5">
              <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
              <InfoTooltip text={SIGNAL_TOOLTIPS[s.label]} />
            </div>
            <p className="text-base font-semibold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
