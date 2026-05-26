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

export interface SourcingLink {
  platform: string
  url: string
  label: string
  description: string
}

export interface SupplierCard {
  platform: string
  url: string
  description: string
}

export interface RealSupplier {
  name: string
  platform: string
  url: string
  description: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  suppliers?: SupplierCard[]
}

export interface SearchContext {
  refined_query: string
  positioning: 'mass_market' | 'artisanal' | 'premium' | 'dropshipping' | 'unknown'
  market: string
  channel: 'online' | 'store' | 'dropshipping'
  target_customer: string
  supplier_context: string
}

export interface SearchOptionsChoice {
  value: string
  label: string
  desc?: string
}

export interface SearchOptionsGroup {
  id: string
  label: string
  choices: SearchOptionsChoice[]
}

export interface SearchOptions {
  intro: string
  refined_query: string
  groups: SearchOptionsGroup[]
}

export interface SearchProfile {
  selling_channels: string[]
  business_model: string
  price_tier: string
  target_customer: string[]
  moq_tolerance: string
  private_label: string
  certifications: string[]
  lead_time: string
  initial_budget: string
  target_margin: string
  product_specs: string
  special_requirements: string
}
