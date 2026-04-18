'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import ProductInput from '@/components/sections/ProductInput'
import MarginCalculator from '@/components/sections/MarginCalculator'
import SupplierList from '@/components/sections/SupplierList'
import ViabilityScore from '@/components/sections/ViabilityScore'
import OutreachTracker from '@/components/sections/OutreachTracker'
import { searchProduct } from '@/lib/api'
import { Supplier } from '@/types'

type Step = 'idle' | 'validating' | 'sourcing' | 'done' | 'error'

const HOW_IT_WORKS = [
  { n: '01', label: 'Valida il mercato', desc: 'Analisi domanda, competizione e potenziale di margine.' },
  { n: '02', label: 'Trova i supplier', desc: 'Dropshipping e stock, confrontati fianco a fianco.' },
  { n: '03', label: 'Calcola i margini', desc: 'Interattivo, salvabile, con confronto drop vs stock.' },
  { n: '04', label: 'Gestisci l\'outreach', desc: 'Bozze email precompilate e tracker delle trattative.' },
]

export default function Home() {
  const [step, setStep] = useState<Step>('idle')
  const [query, setQuery] = useState('')
  const [viabilityData, setViabilityData] = useState<object | null>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  const handleSearch = async (q: string, category?: string) => {
    setQuery(q)
    setStep('validating')

    // Switch to 'sourcing' after 2.5s to show progressive UX while API runs
    const timer = setTimeout(
      () => setStep((s) => (s === 'validating' ? 'sourcing' : s)),
      2500,
    )

    try {
      const data = await searchProduct(q, category)
      setViabilityData(data.viability)
      setSuppliers(data.suppliers)
      setStep('done')
    } catch {
      setStep('error')
    } finally {
      clearTimeout(timer)
    }
  }

  const isLoading = step === 'validating' || step === 'sourcing'

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
                  AI Sourcing Platform
                </span>
                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.08] text-foreground">
                  Dal prodotto<br />
                  al supplier giusto.
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-md">
                  Valida la domanda, trova i migliori fornitori, confronta margini e gestisci l&apos;outreach — tutto in un unico flusso.
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
              Qualcosa è andato storto. Assicurati che il backend sia attivo e riprova.
            </div>
          )}

          {/* Step 01 */}
          {step !== 'idle' && step !== 'error' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <StepHeader number="01" label="Validazione mercato"
                isLoading={step === 'validating'} loadingText={`Analizzo "${query}"…`} />
              {step !== 'validating' && viabilityData && (
                <ViabilityScore data={viabilityData} query={query} />
              )}
            </section>
          )}

          {/* Step 02 */}
          {(step === 'sourcing' || step === 'done') && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <StepHeader number="02" label="Supplier trovati"
                isLoading={step === 'sourcing'} loadingText="Cerco i migliori supplier…" />
              {step === 'done' && <SupplierList suppliers={suppliers} query={query} />}
            </section>
          )}

          {/* Step 03 */}
          {step === 'done' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <StepHeader number="03" label="Analisi margini" />
              <MarginCalculator />
            </section>
          )}

          {/* Step 04 */}
          {step === 'done' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-16">
              <StepHeader number="04" label="Outreach tracker" />
              <OutreachTracker />
            </section>
          )}

          {/* How it works — idle */}
          {step === 'idle' && (
            <section className="py-4 animate-in fade-in duration-500">
              <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase mb-8">
                Come funziona
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {HOW_IT_WORKS.map((s) => (
                  <div key={s.n} className="p-6 rounded-2xl border bg-card shadow-card space-y-3">
                    <span className="text-sm font-mono font-bold text-muted-foreground/40">{s.n}</span>
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
    </>
  )
}

function StepHeader({ number, label, isLoading = false, loadingText = '' }: {
  number: string; label: string; isLoading?: boolean; loadingText?: string
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-mono font-bold text-muted-foreground/35 shrink-0">{number}</span>
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
