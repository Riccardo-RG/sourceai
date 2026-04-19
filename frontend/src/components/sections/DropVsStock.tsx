'use client'

import { useState } from 'react'
import { useMarginStore } from '@/store/marginStore'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { useT } from '@/hooks/useT'

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
  savings_per_unit: number
}

function compute(inputs: DvsInputs, selling_price: number, other_costs: number): DvsResult {
  const { drop_unit_cost, stock_unit_cost, stock_moq, monthly_units } = inputs

  if (monthly_units <= 0) {
    return { breakeven_months: null, drop_monthly_cost: 0, stock_monthly_cost: 0, drop_net_monthly: 0, stock_net_monthly: 0, savings_per_unit: 0 }
  }

  const drop_monthly_cost = monthly_units * drop_unit_cost
  const stock_upfront = stock_moq * stock_unit_cost
  const months_per_batch = stock_moq / monthly_units
  const stock_monthly_cost = months_per_batch > 0 ? stock_upfront / months_per_batch : stock_upfront

  const drop_net_monthly = (selling_price - drop_unit_cost - other_costs) * monthly_units
  const stock_net_monthly = (selling_price - stock_unit_cost - other_costs) * monthly_units - stock_upfront / months_per_batch

  const savings_per_unit = drop_unit_cost - stock_unit_cost
  const breakeven_months = savings_per_unit > 0 ? Math.ceil(stock_upfront / (savings_per_unit * monthly_units)) : null

  return {
    breakeven_months,
    drop_monthly_cost: Math.round(drop_monthly_cost * 100) / 100,
    stock_monthly_cost: Math.round(stock_monthly_cost * 100) / 100,
    drop_net_monthly: Math.round(drop_net_monthly * 100) / 100,
    stock_net_monthly: Math.round(stock_net_monthly * 100) / 100,
    savings_per_unit,
  }
}

function NumInput({ label, tooltip, value, onChange, prefix, suffix, step = 1 }: {
  label: string; tooltip: string; value: number; onChange: (v: number) => void;
  prefix?: string; suffix?: string; step?: number
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
  const t = useT()
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

  // Build recommendation text with translated strings
  const monthWord = (n: number) => n === 1 ? t.dvs_month_s : t.dvs_month_p
  const recommendation = (() => {
    if (dvs.monthly_units <= 0) return t.dvs_rec_no_units
    if (result.savings_per_unit <= 0) return t.dvs_rec_drop_cheaper
    const n = result.breakeven_months
    if (n !== null && n <= 2) return t.dvs_rec_immediate.replace('{n}', String(n)).replace('{months}', monthWord(n))
    if (n !== null && n <= 4) return t.dvs_rec_medium.replace('{n}', String(n)).replace('{months}', monthWord(n))
    const nStr = n !== null ? String(n) : '—'
    return t.dvs_rec_long.replace('{n}', nStr).replace('{months}', n !== null ? monthWord(n) : t.dvs_month_p)
  })()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <p className="text-base font-semibold text-muted-foreground">{t.dvs_title}</p>
        <InfoTooltip text={t.dvs_title_tooltip} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <NumInput label={t.dvs_drop_cost}    tooltip={t.dvs_drop_cost_tooltip}    value={dvs.drop_unit_cost}  onChange={setField('drop_unit_cost')}  prefix="€" step={0.1} />
        <NumInput label={t.dvs_stock_cost}   tooltip={t.dvs_stock_cost_tooltip}   value={dvs.stock_unit_cost} onChange={setField('stock_unit_cost')} prefix="€" step={0.1} />
        <NumInput label={t.dvs_moq}          tooltip={t.dvs_moq_tooltip}          value={dvs.stock_moq}       onChange={setField('stock_moq')}       suffix="u" />
        <NumInput label={t.dvs_monthly_units} tooltip={t.dvs_monthly_units_tooltip} value={dvs.monthly_units}  onChange={setField('monthly_units')}   suffix="u" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          {
            title: 'Dropshipping',
            active: !stockIsBetter,
            costLabel: t.dvs_monthly_cost_label,
            cost: result.drop_monthly_cost,
            profit: result.drop_net_monthly,
          },
          {
            title: 'Stock',
            active: stockIsBetter,
            costLabel: t.dvs_initial_investment,
            cost: dvs.stock_moq * dvs.stock_unit_cost,
            profit: result.stock_net_monthly,
          },
        ].map((card) => (
          <div key={card.title} className={`rounded-xl border p-5 space-y-4 ${card.active ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30' : ''}`}>
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold">{card.title}</p>
              {card.active && <span className="text-sm font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800">{t.dvs_recommended}</span>}
            </div>
            <div>
              <p className="metric-label mb-1">{card.costLabel}</p>
              <p className="text-2xl font-bold tabular-nums">€{card.cost.toFixed(2)}</p>
            </div>
            <div>
              <p className="metric-label mb-1">{t.dvs_monthly_profit}</p>
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
            <span className="text-base text-muted-foreground">{t.dvs_breakeven_label}</span>
            <span className="text-base font-bold">{result.breakeven_months} {monthWord(result.breakeven_months)}</span>
          </div>
        )}
        <p className="text-base text-muted-foreground leading-relaxed">{recommendation}</p>
      </div>
    </div>
  )
}
