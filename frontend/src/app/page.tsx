'use client'

import { useState, useCallback, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import ProductInput from '@/components/sections/ProductInput'
import MarginCalculator from '@/components/sections/MarginCalculator'
import SourcingLinks from '@/components/sections/SourcingLinks'
import RealSuppliers from '@/components/sections/RealSuppliers'
import OutreachTracker from '@/components/sections/OutreachTracker'
import MiriamChat from '@/components/sections/MiriamChat'
import MiriamOptionsPanel from '@/components/sections/MiriamOptionsPanel'
import SavedSuppliers from '@/components/sections/SavedSuppliers'
import { searchProduct, clarifyQuery } from '@/lib/api'
import { useT } from '@/hooks/useT'
import { useLangStore } from '@/store/langStore'
import { useMiriamStore } from '@/store/miriamStore'
import { useMarginStore } from '@/store/marginStore'
import { SourcingLink, SearchContext, RealSupplier, SearchOptions } from '@/types'

type Step = 'idle' | 'asking' | 'validating' | 'sourcing' | 'done' | 'error' | 'rate_limited'


export default function Home() {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const [step, setStep] = useState<Step>('idle')
  const [query, setQuery] = useState('')
  const [currentMarket, setCurrentMarket] = useState('GLOBAL')
  const [viabilityData, setViabilityData] = useState<Record<string, unknown> | null>(null)
  const [sourcingLinks, setSourcingLinks] = useState<SourcingLink[]>([])
  const [realSuppliers, setRealSuppliers] = useState<RealSupplier[]>([])

  const { context, setMinimized, setContext, setFoundSuppliers, setViabilitySummary } = useMiriamStore()
  const [searchOptions, setSearchOptions] = useState<SearchOptions | null>(null)
  const [optionsLoading, setOptionsLoading] = useState(false)
  const { setInput: setMarginInput, setPrefillNote } = useMarginStore()

  // Called from ProductInput — shows options panel before launching search
  const handleAnalyze = async (q: string, _category?: string, market = 'GLOBAL') => {
    setQuery(q)
    setCurrentMarket(market)
    setStep('asking')
    setSearchOptions(null)
    setOptionsLoading(true)
    try {
      const opts = await clarifyQuery(q, lang)
      setSearchOptions(opts)
    } catch {
      // API failed — fall back to direct search with no context
      handleSearch(q, undefined, market)
    } finally {
      setOptionsLoading(false)
    }
  }

  // Called when user confirms options, or directly from MiriamChat SEARCH_READY signal
  const handleSearch = async (q: string, category?: string, market = 'GLOBAL', ctx?: SearchContext) => {
    setQuery(q)
    setCurrentMarket(market)
    if (ctx) setContext(ctx)
    setStep('validating')

    const timer = setTimeout(
      () => setStep((s) => (s === 'validating' ? 'sourcing' : s)),
      2500,
    )

    try {
      const data = await searchProduct(q, category, market, ctx ?? undefined, lang)
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

  const handleConfirmOptions = useCallback((refinedQuery: string, market: string, ctx: SearchContext) => {
    handleSearch(refinedQuery, undefined, market, ctx)
  }, []) // eslint-disable-line

  const [verdictOpen, setVerdictOpen] = useState(false)

  const handleAdviceCta = useCallback(() => {
    setMinimized(false)
  }, [setMinimized])

  const isLoading = step === 'validating' || step === 'sourcing'
  const isRateLimited = step === 'rate_limited'

  return (
    <>
      <Navbar />
      <main>

        {/* ── Hero ─────────────────────────────── */}
        <section className="relative border-b border-border/40 overflow-hidden">
          <div className="absolute inset-0 bg-dot-grid pointer-events-none" />
          <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-12">
            <div className="max-w-2xl space-y-6">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
                  <span className="w-1 h-1 rounded-full bg-primary inline-block" />
                  {t.hero_badge}
                </span>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05] text-foreground">
                  {t.hero_title[0]}<br />
                  <span className="text-primary">{t.hero_title[1]}</span>
                </h1>
                <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
                  {t.hero_subtitle}
                </p>
              </div>
              <ProductInput
                onSearch={handleAnalyze}
                onMarketChange={setCurrentMarket}
                market={currentMarket}
                isLoading={isLoading}
              />
            </div>
          </div>
        </section>

        {/* ── Results ──────────────────────────── */}
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">

          {/* Options panel (Miriam clarify) */}
          {step === 'asking' && (
            <section className="animate-in fade-in slide-in-from-bottom-3 duration-400">
              <MiriamOptionsPanel
                options={searchOptions}
                loading={optionsLoading}
                initialMarket={currentMarket}
                onConfirm={handleConfirmOptions}
                onCancel={() => setStep('idle')}
              />
            </section>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="rounded-md border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {t.step_error}
            </div>
          )}

          {/* Rate limit */}
          {isRateLimited && (
            <div className="rounded-md border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 flex items-center gap-3">
              <span className="text-sm shrink-0 text-amber-600">⏱</span>
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{t.rate_limit_title}</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">{t.rate_limit_body}</p>
              </div>
            </div>
          )}

          {/* Search context banner */}
          {step === 'done' && (
            <div className="animate-in fade-in duration-400">
              {context ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase shrink-0">
                    {t.miriam_context_label}
                  </span>
                  <ContextPill label={t.miriam_positioning} value={(t as unknown as Record<string, string>)[`pos_${context.positioning}`] ?? context.positioning} />
                  {context.market !== 'global' && (
                    <ContextPill label={t.miriam_market} value={context.market} />
                  )}
                  <ContextPill label={t.miriam_channel} value={(t as unknown as Record<string, string>)[`ch_${context.channel}`] ?? context.channel} />
                  <button
                    onClick={() => setMinimized(false)}
                    className="text-[10px] font-medium text-primary hover:underline shrink-0"
                  >
                    {t.miriam_context_refine}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/70">
                  {t.miriam_generic_hint}{' '}
                  <button onClick={() => setMinimized(false)} className="font-medium text-primary hover:underline">
                    {t.miriam_generic_cta}
                  </button>
                </p>
              )}
            </div>
          )}

          {/* Step 01 */}
          {step !== 'idle' && step !== 'asking' && step !== 'error' && step !== 'rate_limited' && (
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

                  <div className="flex flex-col gap-2.5">
                    {/* Miriam advice CTA */}
                    <button
                      onClick={handleAdviceCta}
                      className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-md border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors w-fit"
                    >
                      <span className="text-primary text-xs leading-none">✦</span>
                      <div className="text-left">
                        <p className="text-xs font-semibold text-foreground">{t.miriam_advice_cta}</p>
                        <p className="text-[10px] text-muted-foreground">{t.miriam_cta_sub}</p>
                      </div>
                    </button>

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
              {step === 'sourcing' && <SkeletonLinks />}
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

          {/* How it works — idle only */}
          {(step === 'idle') && (
            <section className="animate-in fade-in duration-500">
              <p className="text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase mb-6">
                {t.how_title}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border rounded-md overflow-hidden border border-border">
                {t.how_steps.map((s, i) => (
                  <div key={i} className="p-5 bg-background space-y-3">
                    <span className="text-xs tabular-nums font-bold text-primary/50">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold leading-snug text-foreground">{s.label}</p>
                      <p className="text-xs text-muted-foreground leading-snug">{s.desc}</p>
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

function LoadingSteps() {
  const t = useT()
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => Math.min(i + 1, t.loading_steps.length - 1)), 4000)
    return () => clearInterval(id)
  }, [t.loading_steps.length])
  return (
    <div className="flex items-center gap-2.5 text-xs text-muted-foreground animate-in fade-in duration-300">
      <span className="flex gap-0.5">
        {[0,1,2].map(i => (
          <span key={i} className="w-1 h-1 rounded-full bg-primary/50 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
      <span key={idx} className="animate-in fade-in duration-500">{t.loading_steps[idx]}</span>
    </div>
  )
}

function ScoresRow({ data }: { data: Record<string, unknown> | null }) {
  const t = useT()
  if (!data) return null
  const scores = [
    { label: t.score_demand, key: 'demand', invert: false },
    { label: t.score_competition, key: 'competition', invert: true },
    { label: t.score_margin, key: 'margin_potential', invert: false },
    { label: t.score_sourcing, key: 'sourcing_ease', invert: false },
  ] as const

  const hasAny = scores.some(s => typeof data[s.key] === 'number')
  if (!hasAny) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border rounded-md overflow-hidden border border-border">
      {scores.map(({ label, key, invert }) => {
        const raw = typeof data[key] === 'number' ? (data[key] as number) : null
        if (raw === null) return null
        const goodVal = invert ? 100 - raw : raw
        const numColor = goodVal >= 65
          ? 'text-emerald-600 dark:text-emerald-400'
          : goodVal >= 40
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-red-500 dark:text-red-400'
        const barColor = goodVal >= 65 ? 'bg-emerald-500' : goodVal >= 40 ? 'bg-amber-400' : 'bg-red-400'
        return (
          <div key={key} className="p-4 bg-background space-y-2.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
            <p className={`text-2xl font-bold tabular-nums leading-none ${numColor}`}>
              {raw}
              <span className="text-xs font-normal text-muted-foreground/60 ml-0.5">/100</span>
            </p>
            <div className="h-0.5 w-full bg-muted overflow-hidden">
              <div className={`h-full ${barColor} transition-all duration-700`} style={{ width: `${raw}%` }} />
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
    : trendYoy !== null && trendYoy < -5 ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'

  return (
    <div className="inline-flex items-center gap-2.5 px-3 py-2 rounded-md border border-border bg-card text-xs">
      <span className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        Google Trends
      </span>
      <span className="text-muted-foreground/40">·</span>
      <span className="font-medium text-foreground">{market}</span>
      <span className="text-muted-foreground">Interest <span className="font-semibold text-foreground">{interest}/100</span></span>
      {trendYoy !== null && (
        <span className={`font-semibold ${dirColor}`}>
          {direction} {trendYoy > 0 ? '+' : ''}{trendYoy.toFixed(0)}% YoY
        </span>
      )}
      {peak && <span className="text-muted-foreground/50">Peak: {peak}</span>}
    </div>
  )
}

function PriceRangeCard({ data }: { data: Record<string, unknown> | null }) {
  const t = useT()
  const priceMin = typeof data?.price_range_min === 'number' ? data.price_range_min : 0
  const priceMax = typeof data?.price_range_max === 'number' ? data.price_range_max : 0
  if (priceMin === 0 && priceMax === 0) return null
  const tld = typeof data?.trends_market === 'string' ? `Amazon ${data.trends_market}` : 'Amazon'
  return (
    <div className="inline-flex items-center gap-2.5 px-3 py-2 rounded-md border border-border bg-card text-xs">
      <span className="font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
        {tld}
      </span>
      <span className="text-muted-foreground/40">·</span>
      <span className="text-muted-foreground">
        {t.price_detected}{' '}
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
  const t = useT()
  const verdict = typeof viabilityData?.verdict === 'string' ? viabilityData.verdict : null
  if (!verdict) return null
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors w-fit"
      >
        <span>{open ? '▼' : '▶'}</span>
        <span>{t.verdict_label}</span>
      </button>
      {open && (
        <div className="mt-2 px-3.5 py-2.5 rounded-md border border-border bg-muted/30 text-xs text-muted-foreground leading-relaxed max-w-xl">
          {verdict}
        </div>
      )}
    </div>
  )
}

function ContextPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-border bg-muted/50 text-muted-foreground">
      <span className="text-muted-foreground/50">{label}:</span>
      <span className="font-semibold text-foreground">{value}</span>
    </span>
  )
}

function SkeletonLinks() {
  return (
    <div className="rounded-md border border-border overflow-hidden divide-y divide-border animate-pulse">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 bg-background">
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-2.5 w-48 bg-muted/60 rounded" />
          </div>
          <div className="h-2.5 w-4 bg-muted/40 rounded shrink-0" />
        </div>
      ))}
    </div>
  )
}

function StepHeader({ number, label, isLoading = false, loadingText = '' }: {
  number: string; label: string; isLoading?: boolean; loadingText?: string
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-[10px] tabular-nums font-bold text-primary/40 shrink-0">{number}</span>
      <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground shrink-0">{label}</h2>
      <div className="h-px flex-1 bg-border" />
      {isLoading && (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          <svg className="animate-spin h-3 w-3 shrink-0 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          {loadingText}
        </span>
      )}
    </div>
  )
}
