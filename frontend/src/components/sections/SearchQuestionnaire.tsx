'use client'

import { useState, useCallback } from 'react'
import { useSearchProfileStore } from '@/store/searchProfileStore'
import type { SearchProfile } from '@/types'

const SELLING_CHANNELS = [
  { id: 'amazon_fba', label: 'Amazon FBA' },
  { id: 'shopify', label: 'Shopify' },
  { id: 'tiktok', label: 'TikTok Shop' },
  { id: 'etsy', label: 'Etsy' },
  { id: 'wholesale', label: 'Wholesale B2B' },
  { id: 'physical', label: 'Punto vendita' },
  { id: 'woo', label: 'WooCommerce' },
  { id: 'eu_marketplace', label: 'Marketplace EU' },
]

const BUSINESS_MODELS = [
  { id: 'dropshipping', label: 'Dropshipping', desc: 'Nessun magazzino, spedizione diretta' },
  { id: 'stock', label: 'Stock', desc: 'Acquisto e gestione inventario' },
  { id: 'misto', label: 'Misto', desc: 'Parte stock, parte dropshipping' },
]

const PRICE_TIERS = [
  { id: 'economy', label: 'Economy', desc: '< €20' },
  { id: 'mid', label: 'Medio', desc: '€20 – 80' },
  { id: 'premium', label: 'Premium', desc: '€80 – 200' },
  { id: 'luxury', label: 'Luxury', desc: '> €200' },
]

const TARGET_CUSTOMERS = [
  { id: 'consumer', label: 'Consumatore B2C' },
  { id: 'b2b', label: 'Business B2B' },
  { id: 'young', label: 'Giovani 18-35' },
  { id: 'family', label: 'Famiglie' },
  { id: 'professional', label: 'Professionisti' },
  { id: 'gift', label: 'Regalo / Gift' },
]

const MOQ_OPTIONS = [
  { id: 'under50', label: '< 50 pz' },
  { id: '50to200', label: '50 – 200' },
  { id: '200to500', label: '200 – 500' },
  { id: '500plus', label: '500+' },
  { id: 'any', label: 'Nessun limite' },
]

const PRIVATE_LABEL_OPTIONS = [
  { id: 'yes', label: 'Sì, priorità' },
  { id: 'interested', label: 'Se conveniente' },
  { id: 'no_white', label: 'No — white label' },
  { id: 'no_resell', label: 'No — rivendita' },
]

const LEAD_TIMES = [
  { id: '2w', label: '< 2 settimane' },
  { id: '2to4w', label: '2 – 4 settimane' },
  { id: '1to3m', label: '1 – 3 mesi' },
  { id: '3mplus', label: '3+ mesi ok' },
]

const CERTIFICATIONS = [
  { id: 'CE', label: 'CE / UE' },
  { id: 'FDA', label: 'FDA / FCC' },
  { id: 'BPA-free', label: 'BPA-free' },
  { id: 'organic', label: 'Biologico' },
  { id: 'fair_trade', label: 'Fair Trade' },
  { id: 'cruelty_free', label: 'Cruelty-free' },
  { id: 'iso9001', label: 'ISO 9001' },
  { id: 'rohs', label: 'RoHS' },
]

const BUDGETS = [
  { id: 'under500', label: '< €500' },
  { id: '500to2k', label: '€500 – 2k' },
  { id: '2kto10k', label: '€2k – 10k' },
  { id: '10kto50k', label: '€10k – 50k' },
  { id: '50kplus', label: '€50k+' },
]

const MARGINS = [
  { id: '10to20', label: '10 – 20%' },
  { id: '20to35', label: '20 – 35%' },
  { id: '35to50', label: '35 – 50%' },
  { id: '50plus', label: '50%+' },
]

const EMPTY: SearchProfile = {
  selling_channels: [],
  business_model: '',
  price_tier: '',
  target_customer: [],
  moq_tolerance: '',
  private_label: '',
  certifications: [],
  lead_time: '',
  initial_budget: '',
  target_margin: '',
  product_specs: '',
  special_requirements: '',
}

export default function SearchQuestionnaire() {
  const { profile, isOpen, setOpen, setProfile } = useSearchProfileStore()
  if (!isOpen) return null

  return (
    <SearchQuestionnaireDialog
      profile={profile}
      setOpen={setOpen}
      setProfile={setProfile}
    />
  )
}

function SearchQuestionnaireDialog({
  profile,
  setOpen,
  setProfile,
}: {
  profile: SearchProfile
  setOpen: (open: boolean) => void
  setProfile: (profile: SearchProfile) => void
}) {
  const [draft, setDraft] = useState<SearchProfile>(profile)

  const toggleMulti = useCallback(
    (key: 'selling_channels' | 'target_customer' | 'certifications', id: string) => {
      setDraft((d) => {
        const arr = d[key] as string[]
        return { ...d, [key]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id] }
      })
    },
    [],
  )

  const setSingle = useCallback((key: keyof SearchProfile, id: string) => {
    setDraft((d) => ({ ...d, [key]: d[key] === id ? '' : id }))
  }, [])

  const handleSave = () => {
    setProfile(draft)
    setOpen(false)
  }

  const handleClose = () => setOpen(false)

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-background/80 backdrop-blur-sm overflow-y-auto py-8 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="w-full max-w-xl bg-card rounded-xl border border-border shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border">
          <div>
            <h2 className="text-sm font-bold text-foreground">Profilo prodotto</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed max-w-xs">
              Ogni campo compilato migliora precisione di supplier, margini e raccomandazioni.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded text-muted-foreground/40 hover:text-foreground hover:bg-muted/40 transition-colors shrink-0 mt-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-7 overflow-y-auto max-h-[calc(100vh-180px)]">

          {/* 01 — Business */}
          <Section label="01 · Modello di business">
            <ChipGroup
              label="Tipo di operazione"
              hint="Selezione singola"
              items={BUSINESS_MODELS}
              selected={[draft.business_model]}
              onToggle={(id) => setSingle('business_model', id)}
              showDesc
            />
            <ChipGroup
              label="Canali di vendita"
              hint="Selezione multipla"
              items={SELLING_CHANNELS}
              selected={draft.selling_channels}
              onToggle={(id) => toggleMulti('selling_channels', id)}
            />
          </Section>

          {/* 02 — Posizionamento */}
          <Section label="02 · Posizionamento">
            <ChipGroup
              label="Fascia prezzo di vendita"
              hint="Selezione singola"
              items={PRICE_TIERS}
              selected={[draft.price_tier]}
              onToggle={(id) => setSingle('price_tier', id)}
              showDesc
            />
            <ChipGroup
              label="Cliente target"
              hint="Selezione multipla"
              items={TARGET_CUSTOMERS}
              selected={draft.target_customer}
              onToggle={(id) => toggleMulti('target_customer', id)}
            />
          </Section>

          {/* 03 — Fornitura */}
          <Section label="03 · Vincoli di fornitura">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <ChipGroup
                label="MOQ tollerato"
                hint="Selezione singola"
                items={MOQ_OPTIONS}
                selected={[draft.moq_tolerance]}
                onToggle={(id) => setSingle('moq_tolerance', id)}
              />
              <ChipGroup
                label="Private label / OEM"
                hint="Selezione singola"
                items={PRIVATE_LABEL_OPTIONS}
                selected={[draft.private_label]}
                onToggle={(id) => setSingle('private_label', id)}
              />
            </div>
            <ChipGroup
              label="Lead time massimo accettabile"
              hint="Selezione singola"
              items={LEAD_TIMES}
              selected={[draft.lead_time]}
              onToggle={(id) => setSingle('lead_time', id)}
            />
          </Section>

          {/* 04 — Certificazioni */}
          <Section label="04 · Certificazioni richieste">
            <ChipGroup
              hint="Selezione multipla — influenza le query di ricerca fornitori"
              items={CERTIFICATIONS}
              selected={draft.certifications}
              onToggle={(id) => toggleMulti('certifications', id)}
            />
          </Section>

          {/* 05 — Finanza */}
          <Section label="05 · Budget e margini">
            <ChipGroup
              label="Budget ordine iniziale"
              hint="Selezione singola"
              items={BUDGETS}
              selected={[draft.initial_budget]}
              onToggle={(id) => setSingle('initial_budget', id)}
            />
            <ChipGroup
              label="Margine netto target"
              hint="Selezione singola — Claude calibra il giudizio sul margine in base a questo"
              items={MARGINS}
              selected={[draft.target_margin]}
              onToggle={(id) => setSingle('target_margin', id)}
            />
          </Section>

          {/* 06 — Testo libero */}
          <Section label="06 · Dettagli prodotto">
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
                  Specifiche prodotto
                </label>
                <textarea
                  rows={3}
                  value={draft.product_specs}
                  onChange={(e) => setDraft((d) => ({ ...d, product_specs: e.target.value }))}
                  placeholder="Materiale, dimensioni, varianti di colore, caratteristiche tecniche..."
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 resize-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
                  Requisiti speciali
                </label>
                <textarea
                  rows={2}
                  value={draft.special_requirements}
                  onChange={(e) => setDraft((d) => ({ ...d, special_requirements: e.target.value }))}
                  placeholder="Packaging personalizzato, sostenibilità, requisiti export, branding specifico..."
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 resize-none transition-colors"
                />
              </div>
            </div>
          </Section>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
          <button
            onClick={() => setDraft(EMPTY)}
            className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          >
            Azzera tutto
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Salva profilo
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-bold text-primary/50 uppercase tracking-widest">{label}</p>
      {children}
    </div>
  )
}

function ChipGroup({
  label,
  hint,
  items,
  selected,
  onToggle,
  showDesc,
}: {
  label?: string
  hint?: string
  items: Array<{ id: string; label: string; desc?: string }>
  selected: string[]
  onToggle: (id: string) => void
  showDesc?: boolean
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const active = selected.includes(item.id)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
              className={`
                text-xs px-2.5 py-1 rounded-full border transition-all
                ${active
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }
              `}
            >
              {item.label}
              {showDesc && item.desc && (
                <span className={`ml-1 text-[10px] ${active ? 'text-primary/60' : 'text-muted-foreground/50'}`}>
                  {item.desc}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {hint && <p className="text-[9px] text-muted-foreground/40">{hint}</p>}
    </div>
  )
}
