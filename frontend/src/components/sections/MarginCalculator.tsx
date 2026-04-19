'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { useMarginStore, PLATFORM_FEES_LIST } from '@/store/marginStore'
import { useAuthStore } from '@/store/authStore'
import { useT } from '@/hooks/useT'
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
  const t = useT()
  const { inputs, result, selectedPlatform, prefillNote, setInput, setPlatform, saveScenario, scenarios, loadScenario, deleteScenario, hydrateScenarios, resetScenarios } = useMarginStore()
  const { user, initialized } = useAuthStore()
  const [scenarioName, setScenarioName] = useState('')
  const [showSave, setShowSave] = useState(false)

  useEffect(() => {
    if (!initialized) return
    if (user) hydrateScenarios()
    else resetScenarios()
  }, [user, initialized, hydrateScenarios, resetScenarios])

  const f = (key: keyof MarginInputs) => (v: number) => setInput(key, v)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
        <div className="px-6 py-5 border-b border-border/60">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{t.mc_title}</h3>
            <InfoTooltip text={t.mc_title_tooltip} />
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="calculator">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="calculator" className="flex-1 text-base">{t.mc_tab_calc}</TabsTrigger>
              <TabsTrigger value="dropvsstock" className="flex-1 text-base">{t.mc_tab_drop}</TabsTrigger>
            </TabsList>

            <TabsContent value="dropvsstock">
              <DropVsStock />
            </TabsContent>

            <TabsContent value="calculator">
              <div className="space-y-6">

                {/* Output */}
                <div className="grid grid-cols-2 gap-6 p-5 bg-muted/40 rounded-xl">
                  <MetricCard label={t.mc_gross} tooltip={t.mc_gross_tooltip}
                    abs={result.gross_margin_abs} pct={result.gross_margin_pct} />
                  <MetricCard label={t.mc_net} tooltip={t.mc_net_tooltip}
                    abs={result.net_margin_abs} pct={result.net_margin_pct} showBar />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <p className="metric-label">{t.mc_total_cost}</p>
                      <InfoTooltip text={t.mc_total_cost_tooltip} />
                    </div>
                    <p className="text-2xl font-bold tabular-nums">€{result.total_cost_per_unit.toFixed(2)}</p>
                  </div>
                  {result.breakeven_units !== null && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <p className="metric-label">{t.mc_breakeven}</p>
                        <InfoTooltip text={t.mc_breakeven_tooltip} />
                      </div>
                      <p className="text-2xl font-bold tabular-nums">
                        {result.breakeven_units} <span className="text-lg font-normal text-muted-foreground">{t.mc_breakeven_unit}</span>
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Inputs */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <NumberInput label={t.mc_selling_price} tooltip={t.mc_selling_price_tooltip}
                      value={inputs.selling_price} onChange={f('selling_price')} prefix="€" step={0.5} min={0.01} />
                    {prefillNote && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <span>🟡</span> {prefillNote}
                      </p>
                    )}
                  </div>
                  <NumberInput label={t.mc_unit_cost} tooltip={t.mc_unit_cost_tooltip}
                    value={inputs.unit_cost} onChange={f('unit_cost')} prefix="€" step={0.1} min={0.01} />
                  <NumberInput label={t.mc_shipping} tooltip={t.mc_shipping_tooltip}
                    value={inputs.shipping_cost} onChange={f('shipping_cost')} prefix="€" step={0.5} />
                  <NumberInput label={t.mc_ads} tooltip={t.mc_ads_tooltip}
                    value={inputs.ads_cost_per_unit} onChange={f('ads_cost_per_unit')} prefix="€" step={0.1} />

                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <label className="text-base font-medium text-muted-foreground">{t.mc_platform}</label>
                      <InfoTooltip text={t.mc_platform_tooltip} />
                    </div>
                    <Tabs value={selectedPlatform} onValueChange={setPlatform} className="w-full">
                      <TabsList className="w-full h-11 grid grid-cols-3">
                        {PLATFORM_FEES_LIST.slice(0, 6).map((p) => (
                          <TabsTrigger key={p} value={p} className="text-base">{p}</TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                  <NumberInput
                    label={t.mc_platform_fee.replace('{platform}', selectedPlatform)}
                    tooltip={t.mc_platform_fee_tooltip}
                    value={inputs.platform_fee_pct} onChange={f('platform_fee_pct')} suffix="%" step={0.1} />
                  <NumberInput label={t.mc_return_rate} tooltip={t.mc_return_rate_tooltip}
                    value={inputs.return_rate_pct} onChange={f('return_rate_pct')} suffix="%" step={0.5} />
                  <NumberInput label={t.mc_fixed_costs} tooltip={t.mc_fixed_costs_tooltip}
                    value={inputs.monthly_fixed_costs} onChange={f('monthly_fixed_costs')} prefix="€" step={10} />
                </div>

                <Separator />

                {/* Save */}
                <div className="space-y-3">
                  {showSave ? (
                    <div className="flex gap-2">
                      <Input placeholder={t.mc_save_placeholder} value={scenarioName}
                        onChange={(e) => setScenarioName(e.target.value)} className="h-11 text-base" />
                      <button onClick={() => { if (scenarioName.trim()) { saveScenario(scenarioName.trim()); setScenarioName(''); setShowSave(false) } }}
                        className="px-4 h-11 text-base bg-foreground text-background rounded-lg font-semibold hover:opacity-85 transition whitespace-nowrap">
                        {t.mc_save}
                      </button>
                      <button onClick={() => setShowSave(false)}
                        className="px-3 h-11 text-base text-muted-foreground hover:text-foreground transition rounded-lg">
                        {t.mc_cancel}
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setShowSave(true)}
                      className="text-base text-muted-foreground hover:text-foreground transition underline underline-offset-4 decoration-border/60">
                      {t.mc_save_scenario}
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
              <h3 className="text-lg font-semibold">{t.mc_saved_scenarios}</h3>
              <InfoTooltip text={t.mc_saved_scenarios_tooltip} />
            </div>
          </div>
          <div className="divide-y divide-border/60">
            {scenarios.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition">
                <div className="space-y-1">
                  <p className="text-base font-semibold">{s.name}</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-base">{t.mc_net_short} {s.result.net_margin_pct}%</Badge>
                    <Badge variant="secondary" className="text-base">€{s.result.net_margin_abs}/u</Badge>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => loadScenario(s.id)} className="text-base text-muted-foreground hover:text-foreground transition">{t.mc_load}</button>
                  <button onClick={() => deleteScenario(s.id)} className="text-base text-red-400 hover:text-red-600 transition">{t.mc_delete}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
