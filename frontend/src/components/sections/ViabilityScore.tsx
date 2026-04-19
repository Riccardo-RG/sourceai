'use client'

import { InfoTooltip } from '@/components/ui/info-tooltip'
import { useT } from '@/hooks/useT'

interface SubScore {
  label: string
  value: number
  note: string
  tooltip: string
}

interface ViabilityData {
  score: number
  demand: number
  demand_note: string
  competition: number
  competition_note: string
  margin_potential: number
  margin_note: string
  sourcing_ease: number
  sourcing_note: string
  price_range_min: number
  price_range_max: number
  recommended_channels: string[]
  trend_yoy: number
  verdict: string
}

function ScoreRing({ score, good, fair, risky }: { score: number; good: string; fair: string; risky: string }) {
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444'
  const label = score >= 70 ? good : score >= 45 ? fair : risky
  const r = 38
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
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

export default function ViabilityScore({ data }: { data: object; query: string }) {
  const t = useT()
  const d = data as ViabilityData

  const subScores: SubScore[] = [
    { label: t.vs_demand,      value: d.demand,          note: d.demand_note,      tooltip: t.vs_demand_tooltip },
    { label: t.vs_competition, value: d.competition,     note: d.competition_note, tooltip: t.vs_competition_tooltip },
    { label: t.vs_margin,      value: d.margin_potential, note: d.margin_note,      tooltip: t.vs_margin_tooltip },
    { label: t.vs_sourcing,    value: d.sourcing_ease,   note: d.sourcing_note,    tooltip: t.vs_sourcing_tooltip },
  ]

  const trendSign = d.trend_yoy >= 0 ? '↑' : '↓'
  const trendStr = `${trendSign} ${Math.abs(d.trend_yoy).toFixed(0)}% YoY`

  const signals = [
    { label: t.vs_price_range, value: `${d.price_range_min} – ${d.price_range_max}`, tooltip: t.vs_price_range_tooltip },
    { label: t.vs_channel,     value: d.recommended_channels.slice(0, 2).join(' · '),  tooltip: t.vs_channel_tooltip },
    { label: t.vs_trend,       value: trendStr,                                        tooltip: t.vs_trend_tooltip },
  ]

  return (
    <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
      <div className="p-6 space-y-6">

        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Viability Score</h3>
          <InfoTooltip text={t.vs_title_tooltip} />
        </div>

        <div className="flex gap-8 items-start">
          <div className="shrink-0">
            <ScoreRing score={d.score} good={t.vs_good} fair={t.vs_fair} risky={t.vs_risky} />
          </div>
          <div className="flex-1 space-y-5">
            {subScores.map((s) => <SubScoreBar key={s.label} sub={s} />)}
          </div>
        </div>

        <div className="rounded-xl bg-muted/50 px-5 py-4">
          <p className="text-base text-muted-foreground leading-relaxed">{d.verdict}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-border/60">
        {signals.map((s, i) => (
          <div key={s.label} className={`px-5 py-5 space-y-1.5 ${i < 2 ? 'border-r border-border/60' : ''}`}>
            <div className="flex items-center gap-1.5">
              <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
              <InfoTooltip text={s.tooltip} />
            </div>
            <p className="text-base font-semibold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
