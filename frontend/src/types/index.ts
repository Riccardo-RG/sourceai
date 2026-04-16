export interface MarginInputs {
  selling_price: number
  unit_cost: number
  shipping_cost: number
  platform_fee_pct: number
  ads_cost_per_unit: number
  return_rate_pct: number
  monthly_fixed_costs: number
}

export interface MarginResult {
  gross_margin_abs: number
  gross_margin_pct: number
  net_margin_abs: number
  net_margin_pct: number
  breakeven_units: number | null
  total_cost_per_unit: number
}

export interface MarginScenario {
  id: string
  name: string
  supplier_name?: string
  inputs: MarginInputs
  result: MarginResult
  created_at: Date
}

export type SupplierType = 'dropshipping' | 'stock' | 'both'

export interface Supplier {
  id: string
  name: string
  source: string
  url: string
  type: SupplierType
  moq: number
  price_min: number
  price_max: number
  shipping_days_min: number
  shipping_days_max: number
  certifications: string[]
  score: number
  verified: boolean
  years_on_platform: number | null
  response_rate: number
  description: string
}
