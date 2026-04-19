'use client'

import { useState, useCallback, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import ProductInput from '@/components/sections/ProductInput'
import MarginCalculator from '@/components/sections/MarginCalculator'
import SourcingLinks from '@/components/sections/SourcingLinks'
import RealSuppliers from '@/components/sections/RealSuppliers'
import OutreachTracker from '@/components/sections/OutreachTracker'
import MiriamChat from '@/components/sections/MiriamChat'
import SavedSuppliers from '@/components/sections/SavedSuppliers'
import { searchProduct } from '@/lib/api'
import { useT } from '@/hooks/useT'
import { useMiriamStore } from '@/store/miriamStore'
import { useMarginStore } from '@/store/marginStore'
import { SourcingLink, SearchContext, RealSupplier } from '@/types'

type Step = 'idle' | 'validating' | 'sourcing' | 'done' | 'error' | 'rate_limited'

const POSITIONING_LABELS: Record<string, string> = {
  mass_market: 'Mass market',
  artisanal: 'Artigianale',
  premium: 'Premium',
  dropshipping: 'Dropshipping',
  unknown: '—',
}

const CHANNEL_LABELS: Record<string, string> = {
  online: 'Online',
  store: 'Negozio fisico',
  dropshipping: 'Dropshipping',
}

export default function Home() {
  const t = useT()
  const [step, setStep] = useState<Step>('idle')
  const [query, setQuery] = useState('')
  const [currentMarket, setCurrentMarket] = useState('GLOBAL')
  const [viabilityData, setViabilityData] = useState<Record<string, unknown> | null>(null)
  const [sourcingLinks, setSourcingLinks] = useState<SourcingLink[]>([])
  const [realSuppliers, setRealSuppliers] = useState<RealSupplier[]>([])

  const { context, triggerAdvice, isStreaming, setMinimized, setFoundSuppliers, setViabilitySummary } = useMiriamStore()
  const { setInput: setMarginInput, setPrefillNote } = useMarginStore()

  const handleSearch = async (q: string, category?: string, market = 'GLOBAL', ctx?: SearchContext) => {
    setQuery(q)
    setCurrentMarket(market)
    setStep('validating')

    const timer = setTimeout(
      () => setStep((s) => (s === 'validating' ? 'sourcing' : s)),
      2500,
    )

    try {
      const data = await searchProduct(q, category, market, ctx ?? undefined)
      setViabilityData(data.viability as Record<string, unknown>)
      setSourcingLinks(data.sourcing_links)
      const rs = data.real_suppliers ?? []
      setRealSuppliers(rs)
      setFoundSuppliers(rs.map((s) => s.name))

      // Build a compact viability summary for Miriam's context
      const vib = data.viability as Record<string, unknown>
      const summaryParts: string[] = []
      if (typeof vib.demand === 'number') summaryParts.push(`demand ${vib.demand}/100`)
      if (typeof vib.competition === 'number') summaryParts.push(`competition ${vib.competition}/100`)
      if (typeof vib.margin_potential === 'number') summaryParts.push(`margin potential ${vib.margin_potential}/100`)
      if (typeof vib.price_range_min === 'number' && vib.price_range_min > 0) {
        summaryParts.push(`Amazon price range ${vib.price_range_min}–${vib.price_range_max}`)
      }
      if (typeof vib.trends_interest === 'number') summaryParts.push(`Google Trends interest ${vib.trends_interest}/100`)
      if (typeof vib.verdict === 'string') summaryParts.push(`verdict: "${vib.verdict}"`)
      setViabilitySummary(summaryParts.length > 0 ? summaryParts.join(', ') : null)

      // Pre-fill margin calculator with Amazon price range if available
      const v = data.viability as Record<string, unknown>
      const priceMin = typeof v?.price_range_min === 'number' ? v.price_range_min : 0
      const priceMax = typeof v?.price_range_max === 'number' ? v.price_range_max : 0
      if (priceMin > 0 || priceMax > 0) {
        const avg = priceMin > 0 && priceMax > 0
          ? (priceMin + priceMax) / 2
          : priceMin || priceMax
        const rounded = Math.round(avg * 100) / 100
        setMarginInput('selling_price', rounded)
        setPrefillNote(`Pre-compilato dai prezzi Amazon (${priceMin > 0 ? priceMin.toFixed(0) : '?'}–${priceMax > 0 ? priceMax.toFixed(0) : '?'})`)
      }

      setStep('done')
    } catch (err) {
      if (err instanceof Error && err.message.includes('429')) {
        setStep('rate_limited')
      } else {
        setStep('error')
      }
    } finally {
      clearTimeout(timer)
    }
  }

  const [verdictOpen, setVerdictOpen] = useState(true)

  const handleAdviceCta = useCallback(() => {
    if (!viabilityData) return
    triggerAdvice(query, viabilityData)
  }, [viabilityData, query, triggerAdvice])

  const isLoading = step === 'validating' || step === 'sourcing'
  const isRateLimited = step === 'rate_limited'

  return (
    <>
      <Navbar />
      <main>

        {/* ── Hero ─────────────────────────────── */}
        <section className="border-b border-border/60 bg-card">
          <div className="max-w-5xl mx-auto px-8 py-20 sm:py-24">
            <div className="max-w-2xl space-y-8">
              <div className="space-y-4">
                <span className="inline-block text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                  {t.hero_badge}
                </span>
                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.08] text-foreground">
                  {t.hero_title[0]}<br />
                  {t.hero_title[1]}
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-md">
                  {t.hero_subtitle}
                </p>
              </div>
              <ProductInput onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </div>
        </section>

        {/* ── Results ──────────────────────────── */}
        <div className="max-w-5xl mx-auto px-8 py-12 space-y-14">

          {/* Error */}
          {step === 'error' && (
            <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 px-6 py-5 text-base text-red-700 dark:text-red-400">
              {t.step_error}
            </div>
          )}

          {/* Rate limit */}
          {isRateLimited && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 px-6 py-5 flex items-start gap-3">
              <span className="text-xl shrink-0">⏱️</span>
              <div>
                <p className="text-base font-semibold text-amber-800 dark:text-amber-300">Troppe ricerche in poco tempo</p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">Attendi qualche secondo prima di lanciare una nuova ricerca.</p>
              </div>
            </div>
          )}

          {/* Search context banner — always shown when results are ready */}
          {step === 'done' && (
            <div className="animate-in fade-in duration-500">
              {context ? (
                /* Guided search — show Miriam's parameters + refine CTA */
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase shrink-0">
                    {t.miriam_context_label}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <ContextPill label={t.miriam_positioning} value={POSITIONING_LABELS[context.positioning] ?? context.positioning} />
                    {context.market !== 'global' && (
                      <ContextPill label={t.miriam_market} value={context.market} />
                    )}
                    <ContextPill label={t.miriam_channel} value={CHANNEL_LABELS[context.channel] ?? context.channel} />
                  </div>
                  <span className="text-xs text-muted-foreground">{t.miriam_context_hint}</span>
                  <button
                    onClick={() => setMinimized(false)}
                    className="text-xs font-medium text-primary hover:underline shrink-0"
                  >
                    {t.miriam_context_refine}
                  </button>
                </div>
              ) : (
                /* Generic search — suggest Miriam for refinement */
                <p className="text-xs text-muted-foreground">
                  {t.miriam_generic_hint}{' '}
                  <button
                    onClick={() => setMinimized(false)}
                    className="font-medium text-primary hover:underline"
                  >
                    {t.miriam_generic_cta}
                  </button>
                </p>
              )}
            </div>
          )}

          {/* Step 01 */}
          {step !== 'idle' && step !== 'error' && step !== 'rate_limited' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <StepHeader number="01" label={t.step_01}
                isLoading={step === 'validating'} loadingText={t.step_loading.replace('{query}', query)} />
              {step === 'validating' && <LoadingSteps />}
              {step !== 'validating' && viabilityData && (
                <>
                  <ScoresRow data={viabilityData} />

                  <div className="flex flex-wrap gap-2">
                    <TrendsCard data={viabilityData} />
                    <PriceRangeCard data={viabilityData} />
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Miriam advice CTA */}
                    <button
                      onClick={handleAdviceCta}
                      disabled={isStreaming}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-primary/25 bg-primary/5 hover:bg-primary/10 transition-colors disabled:opacity-50 w-fit group"
                    >
                      <span className="text-primary text-base leading-none">✦</span>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-foreground">{t.miriam_advice_cta}</p>
                        <p className="text-xs text-muted-foreground">Chiedilo a Miriam →</p>
                      </div>
                    </button>

                    {/* Claude verdict — expandable, temporary for testing */}
                    <VerdictCard viabilityData={viabilityData} open={verdictOpen} onToggle={() => setVerdictOpen((v) => !v)} />
                  </div>
                </>
              )}
            </section>
          )}

          {/* Step 02 */}
          {(step === 'sourcing' || step === 'done') && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <StepHeader number="02" label={t.step_02}
                isLoading={step === 'sourcing'} loadingText={t.step_sourcing} />
              {step === 'done' && (
                <>
                  <SourcingLinks links={sourcingLinks} query={query} />
                  <RealSuppliers suppliers={realSuppliers} query={query} market={currentMarket} />
                </>
              )}
            </section>
          )}

          {/* Step 03 */}
          {step === 'done' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <StepHeader number="03" label={t.step_03} />
              <MarginCalculator />
            </section>
          )}

          {/* Step 04 */}
          {step === 'done' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-32">
              <StepHeader number="04" label={t.step_04} />
              <OutreachTracker />
            </section>
          )}

          {/* How it works — idle */}
          {step === 'idle' && (
            <section className="py-4 animate-in fade-in duration-500">
              <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase mb-8">
                {t.how_title}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {t.how_steps.map((s, i) => (
                  <div key={i} className="p-6 rounded-2xl border bg-card shadow-card space-y-3">
                    <span className="text-sm tabular-nums font-bold text-muted-foreground/40">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="space-y-1.5">
                      <p className="text-base font-semibold leading-snug text-foreground">{s.label}</p>
                      <p className="text-base text-muted-foreground leading-snug">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      {/* Miriam chat panel — fixed bottom-right */}
      <MiriamChat onSearch={handleSearch} />

      {/* Saved suppliers panel — fixed bottom-left, hidden when empty */}
      <SavedSuppliers />
    </>
  )
}

const LOADING_STEPS = [
  'Ricerca prezzi su Amazon...',
  'Analisi trend di mercato...',
  'Ricerca supplier B2B...',
  'Analisi con AI in corso...',
  'Quasi pronto...',
]

function LoadingSteps() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => Math.min(i + 1, LOADING_STEPS.length - 1)), 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in duration-300">
      <svg className="animate-spin h-3.5 w-3.5 shrink-0 text-primary/60" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      <span key={idx} className="animate-in fade-in duration-500">{LOADING_STEPS[idx]}</span>
    </div>
  )
}

function ScoresRow({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null
  const scores = [
    { label: 'Domanda', key: 'demand', invert: false },
    { label: 'Concorrenza', key: 'competition', invert: true },
    { label: 'Margine', key: 'margin_potential', invert: false },
    { label: 'Sourcing', key: 'sourcing_ease', invert: false },
  ] as const

  const hasAny = scores.some(s => typeof data[s.key] === 'number')
  if (!hasAny) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {scores.map(({ label, key, invert }) => {
        const raw = typeof data[key] === 'number' ? (data[key] as number) : null
        if (raw === null) return null
        // For competition: high score = easy market = good (green)
        // invert=true means high raw value = bad (saturated)
        const goodVal = invert ? 100 - raw : raw
        const color = goodVal >= 65
          ? 'text-emerald-600 dark:text-emerald-400'
          : goodVal >= 40
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-red-500 dark:text-red-400'
        const barColor = goodVal >= 65
          ? 'bg-emerald-500'
          : goodVal >= 40
            ? 'bg-amber-400'
            : 'bg-red-400'
        return (
          <div key={key} className="p-3 rounded-xl border border-border bg-card space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold tabular-nums ${color}`}>{raw}<span className="text-sm font-normal text-muted-foreground">/100</span></p>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${raw}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TrendsCard({ data }: { data: Record<string, unknown> | null }) {
  const interest = typeof data?.trends_interest === 'number' ? data.trends_interest : null
  const trendYoy = typeof data?.trend_yoy === 'number' ? data.trend_yoy : null
  const market = typeof data?.trends_market === 'string' ? data.trends_market : null
  const peak = typeof data?.trends_peak === 'string' && data.trends_peak ? data.trends_peak : null

  if (interest === null || market === null) return null

  const direction = trendYoy !== null && trendYoy > 5 ? '↑' : trendYoy !== null && trendYoy < -5 ? '↓' : '→'
  const dirColor = trendYoy !== null && trendYoy > 5
    ? 'text-emerald-600 dark:text-emerald-400'
    : trendYoy !== null && trendYoy < -5
      ? 'text-red-500 dark:text-red-400'
      : 'text-muted-foreground'

  return (
    <div className="flex items-center gap-3 flex-wrap px-4 py-3 rounded-xl border border-border bg-muted/30 w-fit">
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
        ✅ Google Trends
      </span>
      <span className="text-sm font-semibold text-foreground">{market}</span>
      <span className="text-sm text-muted-foreground">Interest <span className="font-semibold text-foreground">{interest}/100</span></span>
      {trendYoy !== null && (
        <span className={`text-sm font-medium ${dirColor}`}>
          {direction} {trendYoy > 0 ? '+' : ''}{trendYoy.toFixed(0)}% YoY
        </span>
      )}
      {peak && (
        <span className="text-xs text-muted-foreground/70">Peak: {peak}</span>
      )}
    </div>
  )
}

function PriceRangeCard({ data }: { data: Record<string, unknown> | null }) {
  const priceMin = typeof data?.price_range_min === 'number' ? data.price_range_min : 0
  const priceMax = typeof data?.price_range_max === 'number' ? data.price_range_max : 0
  if (priceMin === 0 && priceMax === 0) return null

  const tld = typeof data?.trends_market === 'string' ? `Amazon ${data.trends_market}` : 'Amazon'
  return (
    <div className="flex items-center gap-3 flex-wrap px-4 py-3 rounded-xl border border-border bg-muted/30 w-fit">
      <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 px-2 py-0.5 rounded-full">
        🟡 {tld}
      </span>
      <span className="text-sm text-muted-foreground">
        Prezzi rilevati:{' '}
        <span className="font-semibold text-foreground">
          {priceMin > 0 ? `${priceMin.toFixed(0)}` : '?'}
          {priceMax > 0 && priceMax !== priceMin ? ` – ${priceMax.toFixed(0)}` : ''}
        </span>
      </span>
    </div>
  )
}

function VerdictCard({ viabilityData, open, onToggle }: {
  viabilityData: Record<string, unknown> | null
  open: boolean
  onToggle: () => void
}) {
  const verdict = typeof viabilityData?.verdict === 'string' ? viabilityData.verdict : null
  if (!verdict) return null
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <span className="text-xs">{open ? '▼' : '▶'}</span>
        <span>Analisi Claude (sperimentale)</span>
      </button>
      {open && (
        <div className="mt-2 px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground leading-relaxed max-w-xl">
          {verdict}
        </div>
      )}
    </div>
  )
}

function ContextPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-border bg-muted/50 text-muted-foreground">
      <span className="text-muted-foreground/60">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </span>
  )
}

function StepHeader({ number, label, isLoading = false, loadingText = '' }: {
  number: string; label: string; isLoading?: boolean; loadingText?: string
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm tabular-nums font-bold text-muted-foreground/35 shrink-0">{number}</span>
      <div className="h-px flex-1 bg-border" />
      <h2 className="text-base font-semibold tracking-widest uppercase text-muted-foreground shrink-0">{label}</h2>
      {isLoading && (
        <span className="flex items-center gap-2 text-base text-muted-foreground">
          <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          {loadingText}
        </span>
      )}
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}
