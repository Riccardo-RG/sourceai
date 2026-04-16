'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { useMarginStore, PLATFORM_FEES_LIST } from '@/store/marginStore'
import { MarginInputs } from '@/types'
import DropVsStock from './DropVsStock'

function MarginBar({ value, max = 80 }: { value: number; max?: number }) {
  const pct = (Math.max(0, Math.min(value, max)) / max) * 100
  const color = value >= 30 ? 'bg-emerald-500' : value >= 15 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function NumberInput({ label, tooltip, value, onChange, prefix, suffix, step = 0.01, min = 0 }: {
  label: string; tooltip: string; value: number; onChange: (v: number) => void;
  prefix?: string; suffix?: string; step?: number; min?: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <label className="text-base font-medium text-muted-foreground">{label}</label>
        <InfoTooltip text={tooltip} />
      </div>
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3.5 text-base text-muted-foreground select-none">{prefix}</span>}
        <Input type="number" value={value} min={min} step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={`h-11 text-base ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-9' : ''}`} />
        {suffix && <span className="absolute right-3.5 text-base text-muted-foreground select-none">{suffix}</span>}
      </div>
    </div>
  )
}

function MetricCard({ label, tooltip, abs, pct, showBar = false }: {
  label: string; tooltip: string; abs: number; pct: number; showBar?: boolean
}) {
  const pos = abs >= 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <p className="metric-label">{label}</p>
        <InfoTooltip text={tooltip} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`metric-value ${pos ? '' : 'text-red-500'}`}>
          {pos ? '+' : ''}€{abs.toFixed(2)}
        </span>
        <span className={`text-lg font-semibold ${pos ? 'text-emerald-600' : 'text-red-500'}`}>
          {pct.toFixed(1)}%
        </span>
      </div>
      {showBar && <MarginBar value={pct} />}
    </div>
  )
}

export default function MarginCalculator() {
  const { inputs, result, selectedPlatform, setInput, setPlatform, saveScenario, scenarios, loadScenario, deleteScenario } = useMarginStore()
  const [scenarioName, setScenarioName] = useState('')
  const [showSave, setShowSave] = useState(false)
  const f = (key: keyof MarginInputs) => (v: number) => setInput(key, v)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
        <div className="px-6 py-5 border-b border-border/60">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Margin Calculator</h3>
            <InfoTooltip text="Calcola in tempo reale quanto guadagni per ogni unità venduta, tenendo conto di tutti i costi." />
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="calculator">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="calculator" className="flex-1 text-base">Calcolatore</TabsTrigger>
              <TabsTrigger value="dropvsstock" className="flex-1 text-base">Drop vs Stock</TabsTrigger>
            </TabsList>

            <TabsContent value="dropvsstock">
              <DropVsStock />
            </TabsContent>

            <TabsContent value="calculator">
              <div className="space-y-6">

                {/* Output */}
                <div className="grid grid-cols-2 gap-6 p-5 bg-muted/40 rounded-xl">
                  <MetricCard label="Margine lordo" tooltip="Prezzo di vendita meno solo il costo del prodotto. Non include spedizione, fee o altri costi."
                    abs={result.gross_margin_abs} pct={result.gross_margin_pct} />
                  <MetricCard label="Margine netto" tooltip="Quello che guadagni davvero per ogni unità, dopo tutti i costi: prodotto, spedizione, fee, ads e resi."
                    abs={result.net_margin_abs} pct={result.net_margin_pct} showBar />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <p className="metric-label">Costo totale/unità</p>
                      <InfoTooltip text="Somma di tutti i costi per unità. Sottratto al prezzo di vendita dà il margine netto." />
                    </div>
                    <p className="text-2xl font-bold tabular-nums">€{result.total_cost_per_unit.toFixed(2)}</p>
                  </div>
                  {result.breakeven_units !== null && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <p className="metric-label">Break-even mensile</p>
                        <InfoTooltip text="Quante unità devi vendere ogni mese per coprire i costi fissi mensili." />
                      </div>
                      <p className="text-2xl font-bold tabular-nums">
                        {result.breakeven_units} <span className="text-lg font-normal text-muted-foreground">unità</span>
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Inputs */}
                <div className="grid grid-cols-2 gap-5">
                  <NumberInput label="Prezzo di vendita" tooltip="Il prezzo a cui venderai il prodotto al cliente finale."
                    value={inputs.selling_price} onChange={f('selling_price')} prefix="€" step={0.5} min={0.01} />
                  <NumberInput label="Costo unitario supplier" tooltip="Quanto paghi al supplier per ogni unità. Clicca 'Usa nel calcolatore' su una scheda supplier per precompilarlo."
                    value={inputs.unit_cost} onChange={f('unit_cost')} prefix="€" step={0.1} min={0.01} />
                  <NumberInput label="Spedizione al cliente" tooltip="Costo medio di spedizione per unità. Se offri spedizione gratuita, inserisci il costo che paghi al corriere."
                    value={inputs.shipping_cost} onChange={f('shipping_cost')} prefix="€" step={0.5} />
                  <NumberInput label="Costo ads per unità" tooltip="Spesa pubblicitaria media per unità. Es: €300 di ads su 100 unità = €3/unità."
                    value={inputs.ads_cost_per_unit} onChange={f('ads_cost_per_unit')} prefix="€" step={0.1} />

                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <label className="text-base font-medium text-muted-foreground">Piattaforma</label>
                      <InfoTooltip text="Seleziona la piattaforma per preimpostare la fee di transazione. Modificabile manualmente." />
                    </div>
                    <Tabs value={selectedPlatform} onValueChange={setPlatform} className="w-full">
                      <TabsList className="w-full h-11 grid grid-cols-3">
                        {PLATFORM_FEES_LIST.slice(0, 6).map((p) => (
                          <TabsTrigger key={p} value={p} className="text-base">{p}</TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                  <NumberInput label={`Fee piattaforma (${selectedPlatform})`} tooltip="Percentuale trattenuta dalla piattaforma su ogni vendita. Shopify ~2%, Amazon ~15%."
                    value={inputs.platform_fee_pct} onChange={f('platform_fee_pct')} suffix="%" step={0.1} />
                  <NumberInput label="Tasso di reso" tooltip="Percentuale stimata di ordini restituiti. Tipicamente 1–5% per prodotti fisici."
                    value={inputs.return_rate_pct} onChange={f('return_rate_pct')} suffix="%" step={0.5} />
                  <NumberInput label="Costi fissi mensili" tooltip="Costi mensili fissi (abbonamenti, magazzino, tool). Attiva il calcolo del break-even."
                    value={inputs.monthly_fixed_costs} onChange={f('monthly_fixed_costs')} prefix="€" step={10} />
                </div>

                <Separator />

                {/* Save */}
                <div className="space-y-3">
                  {showSave ? (
                    <div className="flex gap-2">
                      <Input placeholder="Nome scenario (es. Borraccia – Supplier A)" value={scenarioName}
                        onChange={(e) => setScenarioName(e.target.value)} className="h-11 text-base" />
                      <button onClick={() => { if (scenarioName.trim()) { saveScenario(scenarioName.trim()); setScenarioName(''); setShowSave(false) } }}
                        className="px-4 h-11 text-base bg-foreground text-background rounded-lg font-semibold hover:opacity-85 transition whitespace-nowrap">
                        Salva
                      </button>
                      <button onClick={() => setShowSave(false)}
                        className="px-3 h-11 text-base text-muted-foreground hover:text-foreground transition rounded-lg">
                        Annulla
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setShowSave(true)}
                      className="text-base text-muted-foreground hover:text-foreground transition underline underline-offset-4 decoration-border/60">
                      + Salva scenario
                    </button>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Saved scenarios */}
      {scenarios.length > 0 && (
        <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
          <div className="px-6 py-5 border-b border-border/60">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Scenari salvati</h3>
              <InfoTooltip text="Salva più configurazioni di margine per confrontarle — stesso prodotto con supplier diversi o piattaforme diverse." />
            </div>
          </div>
          <div className="divide-y divide-border/60">
            {scenarios.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition">
                <div className="space-y-1">
                  <p className="text-base font-semibold">{s.name}</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-base">Netto {s.result.net_margin_pct}%</Badge>
                    <Badge variant="secondary" className="text-base">€{s.result.net_margin_abs}/u</Badge>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => loadScenario(s.id)} className="text-base text-muted-foreground hover:text-foreground transition">Carica</button>
                  <button onClick={() => deleteScenario(s.id)} className="text-base text-red-400 hover:text-red-600 transition">Elimina</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
