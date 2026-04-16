import { create } from 'zustand'
import { MarginInputs, MarginResult, MarginScenario } from '@/types'

const PLATFORM_FEES: Record<string, number> = {
  Shopify: 2.0,
  Amazon: 15.0,
  Etsy: 6.5,
  WooCommerce: 2.9,
  TikTok: 5.0,
  Custom: 0,
}

function computeMargins(inputs: MarginInputs): MarginResult {
  const sp = inputs.selling_price
  const uc = inputs.unit_cost
  const sc = inputs.shipping_cost
  const pf = (inputs.platform_fee_pct / 100) * sp
  const ac = inputs.ads_cost_per_unit
  const rr = (inputs.return_rate_pct / 100) * sp

  const grossProfit = sp - uc
  const grossMarginPct = sp > 0 ? (grossProfit / sp) * 100 : 0

  const totalCost = uc + sc + pf + ac + rr
  const netProfit = sp - totalCost
  const netMarginPct = sp > 0 ? (netProfit / sp) * 100 : 0

  const breakeven =
    netProfit > 0 && inputs.monthly_fixed_costs > 0
      ? Math.ceil(inputs.monthly_fixed_costs / netProfit)
      : null

  return {
    gross_margin_abs: Math.round(grossProfit * 100) / 100,
    gross_margin_pct: Math.round(grossMarginPct * 10) / 10,
    net_margin_abs: Math.round(netProfit * 100) / 100,
    net_margin_pct: Math.round(netMarginPct * 10) / 10,
    breakeven_units: breakeven,
    total_cost_per_unit: Math.round(totalCost * 100) / 100,
  }
}

const DEFAULT_INPUTS: MarginInputs = {
  selling_price: 29.99,
  unit_cost: 8.0,
  shipping_cost: 0,
  platform_fee_pct: 2.0,
  ads_cost_per_unit: 0,
  return_rate_pct: 2.0,
  monthly_fixed_costs: 0,
}

interface MarginStore {
  inputs: MarginInputs
  result: MarginResult
  scenarios: MarginScenario[]
  selectedPlatform: string

  setInput: (key: keyof MarginInputs, value: number) => void
  setPlatform: (platform: string) => void
  saveScenario: (name: string, supplierName?: string) => void
  loadScenario: (id: string) => void
  deleteScenario: (id: string) => void
}

export const useMarginStore = create<MarginStore>((set, get) => ({
  inputs: DEFAULT_INPUTS,
  result: computeMargins(DEFAULT_INPUTS),
  scenarios: [],
  selectedPlatform: 'Shopify',

  setInput: (key, value) => {
    const newInputs = { ...get().inputs, [key]: value }
    set({ inputs: newInputs, result: computeMargins(newInputs) })
  },

  setPlatform: (platform) => {
    const fee = PLATFORM_FEES[platform] ?? 0
    const newInputs = { ...get().inputs, platform_fee_pct: fee }
    set({
      selectedPlatform: platform,
      inputs: newInputs,
      result: computeMargins(newInputs),
    })
  },

  saveScenario: (name, supplierName) => {
    const { inputs, result } = get()
    const scenario: MarginScenario = {
      id: crypto.randomUUID(),
      name,
      supplier_name: supplierName,
      inputs: { ...inputs },
      result: { ...result },
      created_at: new Date(),
    }
    set((state) => ({ scenarios: [...state.scenarios, scenario] }))
  },

  loadScenario: (id) => {
    const scenario = get().scenarios.find((s) => s.id === id)
    if (scenario) {
      set({ inputs: { ...scenario.inputs }, result: { ...scenario.result } })
    }
  },

  deleteScenario: (id) => {
    set((state) => ({ scenarios: state.scenarios.filter((s) => s.id !== id) }))
  },
}))

export const PLATFORM_FEES_LIST = Object.keys(PLATFORM_FEES)
