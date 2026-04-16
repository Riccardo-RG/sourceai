'use client'

import { useState } from 'react'
import { useMarginStore } from '@/store/marginStore'
import { InfoTooltip } from '@/components/ui/info-tooltip'

interface DvsInputs {
  drop_unit_cost: number
  stock_unit_cost: number
  stock_moq: number
  monthly_units: number
}

interface DvsResult {
  breakeven_months: number | null
  drop_monthly_cost: number
  stock_monthly_cost: number
  drop_net_monthly: number
  stock_net_monthly: number
  recommendation: string
}

function compute(inputs: DvsInputs, selling_price: number, other_costs: number): DvsResult {
  const { drop_unit_cost, stock_unit_cost, stock_moq, monthly_units } = inputs

  if (monthly_units <= 0) {
    return {
      breakeven_months: null,
      drop_monthly_cost: 0,
      stock_monthly_cost: 0,
      drop_net_monthly: 0,
      stock_net_monthly: 0,
      recommendation: 'Inserisci le unità mensili attese.',
    }
  }

  const drop_monthly_cost = monthly_units * drop_unit_cost
  const stock_upfront = stock_moq * stock_unit_cost
  const months_per_batch = stock_moq / monthly_units

  const stock_monthly_cost =
    months_per_batch > 0
      ? stock_upfront / months_per_batch
      : stock_upfront

  const drop_net_monthly =
    (selling_price - drop_unit_cost - other_costs) * monthly_units
  const stock_net_monthly =
    (selling_price - stock_unit_cost - other_costs) * monthly_units - stock_upfront / months_per_batch

  const savings_per_unit = drop_unit_cost - stock_unit_cost
  const breakeven_months =
    savings_per_unit > 0
      ? Math.ceil(stock_upfront / (savings_per_unit * monthly_units))
      : null

  let recommendation = ''
  if (savings_per_unit <= 0) {
    recommendation = 'Il dropshipping costa meno. Lo stock non è conveniente con questi prezzi.'
  } else if (breakeven_months !== null && breakeven_months <= 2) {
    recommendation = `Passa allo stock subito. Break-even in ${breakeven_months} ${breakeven_months === 1 ? 'mese' : 'mesi'} — il risparmio è immediato.`
  } else if (breakeven_months !== null && breakeven_months <= 4) {
    recommendation = `Lo stock conviene a medio termine. Break-even in ${breakeven_months} mesi. Valuta quando sei sicuro del volume.`
  } else {
    recommendation = `Break-even in ${breakeven_months ?? '—'} mesi. Continua con il dropshipping finché il volume non è stabile.`
  }

  return {
    breakeven_months,
    drop_monthly_cost: Math.round(drop_monthly_cost * 100) / 100,
    stock_monthly_cost: Math.round(stock_monthly_cost * 100) / 100,
    drop_net_monthly: Math.round(drop_net_monthly * 100) / 100,
    stock_net_monthly: Math.round(stock_net_monthly * 100) / 100,
    recommendation,
  }
}

function NumInput({
  label,
  tooltip,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
}: {
  label: string
  tooltip: string
  value: number
  onChange: (v: number) => void
  prefix?: string
  suffix?: string
  step?: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <p className="text-base font-medium text-muted-foreground">{label}</p>
        <InfoTooltip text={tooltip} />
      </div>
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3.5 text-base text-muted-foreground select-none">{prefix}</span>}
        <input type="number" value={value} min={0} step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={`w-full h-11 text-base border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-foreground/10 ${prefix ? 'pl-8' : 'pl-3.5'} ${suffix ? 'pr-8' : 'pr-3.5'}`} />
        {suffix && <span className="absolute right-3.5 text-base text-muted-foreground select-none">{suffix}</span>}
      </div>
    </div>
  )
}

export default function DropVsStock() {
  const { inputs } = useMarginStore()

  const otherCosts =
    (inputs.platform_fee_pct / 100) * inputs.selling_price +
    inputs.shipping_cost +
    inputs.ads_cost_per_unit +
    (inputs.return_rate_pct / 100) * inputs.selling_price

  const [dvs, setDvs] = useState<DvsInputs>({
    drop_unit_cost: inputs.unit_cost,
    stock_unit_cost: Math.max(inputs.unit_cost * 0.75, 1),
    stock_moq: 100,
    monthly_units: 30,
  })

  const setField = (key: keyof DvsInputs) => (v: number) =>
    setDvs((prev) => ({ ...prev, [key]: v }))

  const result = compute(dvs, inputs.selling_price, otherCosts)

  const stockIsBetter = result.stock_net_monthly > result.drop_net_monthly

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <p className="text-base font-semibold text-muted-foreground">Confronto convenienza</p>
        <InfoTooltip text="Calcola a quante vendite mensili conviene passare al stock. Il punto di svolta dipende dalla differenza di costo per unità e dall'investimento iniziale." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <NumInput label="Costo drop/unità" tooltip="Prezzo per unità in dropshipping. Più alto perché non c'è MOQ minimo." value={dvs.drop_unit_cost} onChange={setField('drop_unit_cost')} prefix="€" step={0.1} />
        <NumInput label="Costo stock/unità" tooltip="Prezzo per unità in stock. Più basso grazie al volume, ma richiede investimento iniziale." value={dvs.stock_unit_cost} onChange={setField('stock_unit_cost')} prefix="€" step={0.1} />
        <NumInput label="MOQ stock" tooltip="Quantità minima da acquistare. Determina l'investimento iniziale (MOQ × costo stock)." value={dvs.stock_moq} onChange={setField('stock_moq')} suffix="u" />
        <NumInput label="Vendite attese/mese" tooltip="Stima mensile delle unità vendute. Più alto = stock si ripaga prima." value={dvs.monthly_units} onChange={setField('monthly_units')} suffix="u" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { title: 'Dropshipping', active: !stockIsBetter, costLabel: 'Costo mensile', cost: result.drop_monthly_cost, profit: result.drop_net_monthly },
          { title: 'Stock', active: stockIsBetter, costLabel: 'Investimento iniziale', cost: dvs.stock_moq * dvs.stock_unit_cost, profit: result.stock_net_monthly },
        ].map((card) => (
          <div key={card.title} className={`rounded-xl border p-5 space-y-4 ${card.active ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30' : ''}`}>
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold">{card.title}</p>
              {card.active && <span className="text-sm font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800">Consigliato</span>}
            </div>
            <div>
              <p className="metric-label mb-1">{card.costLabel}</p>
              <p className="text-2xl font-bold tabular-nums">€{card.cost.toFixed(2)}</p>
            </div>
            <div>
              <p className="metric-label mb-1">Profitto netto/mese</p>
              <p className={`text-xl font-bold tabular-nums ${card.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {card.profit >= 0 ? '+' : ''}€{card.profit.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-muted/50 px-5 py-4 space-y-2">
        {result.breakeven_months !== null && (
          <div className="flex items-center gap-2">
            <span className="text-base text-muted-foreground">Break-even stock:</span>
            <span className="text-base font-bold">{result.breakeven_months} {result.breakeven_months === 1 ? 'mese' : 'mesi'}</span>
          </div>
        )}
        <p className="text-base text-muted-foreground leading-relaxed">{result.recommendation}</p>
      </div>
    </div>
  )
}
