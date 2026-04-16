'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import ProductInput from '@/components/sections/ProductInput'
import MarginCalculator from '@/components/sections/MarginCalculator'
import SupplierList from '@/components/sections/SupplierList'
import ViabilityScore from '@/components/sections/ViabilityScore'
import OutreachTracker from '@/components/sections/OutreachTracker'
import { MOCK_SUPPLIERS } from '@/lib/mockSuppliers'

type Step = 'idle' | 'validating' | 'sourcing' | 'done'

const HOW_IT_WORKS = [
  { n: '01', label: 'Valida il mercato', desc: 'Analisi domanda, competizione e potenziale di margine.' },
  { n: '02', label: 'Trova i supplier', desc: 'Dropshipping e stock, confrontati fianco a fianco.' },
  { n: '03', label: 'Calcola i margini', desc: 'Interattivo, salvabile, con confronto drop vs stock.' },
  { n: '04', label: 'Gestisci l\'outreach', desc: 'Bozze email precompilate e tracker delle trattative.' },
]

export default function Home() {
  const [step, setStep] = useState<Step>('idle')
  const [query, setQuery] = useState('')

  const handleSearch = async (q: string) => {
    setQuery(q)
    setStep('validating')
    await new Promise((r) => setTimeout(r, 1400))
    setStep('sourcing')
    await new Promise((r) => setTimeout(r, 1200))
    setStep('done')
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

          {/* Step 01 */}
          {step !== 'idle' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <StepHeader number="01" label="Validazione mercato"
                isLoading={step === 'validating'} loadingText={`Analizzo "${query}"…`} />
              {step !== 'validating' && <ViabilityScore query={query} />}
            </section>
          )}

          {/* Step 02 */}
          {(step === 'sourcing' || step === 'done') && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <StepHeader number="02" label="Supplier trovati"
                isLoading={step === 'sourcing'} loadingText="Cerco i migliori supplier…" />
              {step === 'done' && <SupplierList suppliers={MOCK_SUPPLIERS} query={query} />}
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
