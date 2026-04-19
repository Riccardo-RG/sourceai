export type Lang = 'en' | 'it' | 'es'

export interface T {
  // Navbar
  nav_tagline: string
  nav_login: string
  nav_signup: string
  nav_logout: string

  // Hero
  hero_badge: string
  hero_title: [string, string]
  hero_subtitle: string

  // How it works
  how_title: string
  how_steps: Array<{ label: string; desc: string }>

  // Page steps & errors
  step_01: string
  step_02: string
  step_03: string
  step_04: string
  step_loading: string  // use {query} placeholder
  step_sourcing: string
  step_error: string

  // ProductInput
  input_placeholder: string  // use {market} placeholder
  input_try: string
  input_analyze: string
  input_analyzing: string
  categories: string[]
  examples: string[]

  // ViabilityScore
  vs_title_tooltip: string
  vs_good: string
  vs_fair: string
  vs_risky: string
  vs_demand: string
  vs_demand_tooltip: string
  vs_competition: string
  vs_competition_tooltip: string
  vs_margin: string
  vs_margin_tooltip: string
  vs_sourcing: string
  vs_sourcing_tooltip: string
  vs_price_range: string
  vs_price_range_tooltip: string
  vs_channel: string
  vs_channel_tooltip: string
  vs_trend: string
  vs_trend_tooltip: string

  // SourcingLinks
  sl_title: string
  sl_subtitle: string
  sl_footer: string  // use {query} placeholder
  sl_platforms: Record<string, string>

  // MarginCalculator
  mc_title: string
  mc_title_tooltip: string
  mc_tab_calc: string
  mc_tab_drop: string
  mc_gross: string
  mc_gross_tooltip: string
  mc_net: string
  mc_net_tooltip: string
  mc_total_cost: string
  mc_total_cost_tooltip: string
  mc_breakeven: string
  mc_breakeven_tooltip: string
  mc_breakeven_unit: string
  mc_selling_price: string
  mc_selling_price_tooltip: string
  mc_unit_cost: string
  mc_unit_cost_tooltip: string
  mc_shipping: string
  mc_shipping_tooltip: string
  mc_ads: string
  mc_ads_tooltip: string
  mc_platform: string
  mc_platform_tooltip: string
  mc_platform_fee: string   // use {platform} placeholder
  mc_platform_fee_tooltip: string
  mc_return_rate: string
  mc_return_rate_tooltip: string
  mc_fixed_costs: string
  mc_fixed_costs_tooltip: string
  mc_save: string
  mc_cancel: string
  mc_save_scenario: string
  mc_save_placeholder: string
  mc_saved_scenarios: string
  mc_saved_scenarios_tooltip: string
  mc_load: string
  mc_delete: string
  mc_net_short: string

  // DropVsStock
  dvs_title: string
  dvs_title_tooltip: string
  dvs_drop_cost: string
  dvs_drop_cost_tooltip: string
  dvs_stock_cost: string
  dvs_stock_cost_tooltip: string
  dvs_moq: string
  dvs_moq_tooltip: string
  dvs_monthly_units: string
  dvs_monthly_units_tooltip: string
  dvs_monthly_cost_label: string
  dvs_initial_investment: string
  dvs_monthly_profit: string
  dvs_recommended: string
  dvs_breakeven_label: string
  dvs_month_s: string
  dvs_month_p: string
  dvs_rec_no_units: string
  dvs_rec_drop_cheaper: string
  dvs_rec_immediate: string   // use {n} and {months} placeholders
  dvs_rec_medium: string
  dvs_rec_long: string

  // OutreachTracker
  ot_title: string
  ot_title_tooltip: string
  ot_contacts: string          // use {n} placeholder
  ot_add_note: string
  ot_save: string
  ot_remove: string
  ot_sent_prefix: string
  ot_updated_prefix: string
  ot_status_tooltip: string
  ot_status_sent: string
  ot_status_waiting: string
  ot_status_replied: string
  ot_status_negotiation: string
  ot_status_closed: string
  ot_just_now: string
  ot_mins_ago: string    // use {n} placeholder
  ot_hours_ago: string
  ot_days_ago: string

  // Auth
  auth_login_title: string
  auth_login_subtitle: string
  auth_continue_google: string
  auth_or: string
  auth_email_placeholder: string
  auth_forgot: string
  auth_submit_login: string
  auth_loading_login: string
  auth_no_account: string
  auth_signup_link: string
  auth_reset_sent: string
  auth_enter_email: string
  auth_signup_title: string
  auth_signup_subtitle: string
  auth_signup_google: string
  auth_confirm_password: string
  auth_submit_signup: string
  auth_loading_signup: string
  auth_has_account: string
  auth_login_link: string
  auth_password_min: string
  auth_password_mismatch: string
  auth_check_email_title: string
  auth_check_email_body: string   // use {email} placeholder
  auth_back_login: string
  auth_reset_title: string
  auth_reset_subtitle: string
  auth_new_password: string
  auth_confirm: string
  auth_submit_reset: string
  auth_loading_reset: string
  auth_reset_success: string
  auth_redirect: string
  auth_password_short: string

  // Page — hardcoded strings now translated
  loading_steps: string[]
  score_demand: string
  score_competition: string
  score_margin: string
  score_sourcing: string
  verdict_label: string
  price_detected: string
  miriam_cta_sub: string
  rate_limit_title: string
  rate_limit_body: string

  // Positioning & channel labels (used in context pills)
  pos_mass_market: string
  pos_artisanal: string
  pos_premium: string
  pos_dropshipping: string
  pos_unknown: string
  ch_online: string
  ch_store: string
  ch_dropshipping: string

  // RealSuppliers
  rs_no_suppliers: string
  rs_refine: string
  rs_found: string       // use {n} placeholder
  rs_indicative: string
  rs_tracked: string
  rs_outreach_add: string
  rs_copied: string
  rs_email: string
  rs_open_site: string

  // SavedSuppliers
  ss_title: string
  ss_for: string         // use {query} placeholder
  ss_remove: string

  // Miriam chat
  miriam_title: string
  miriam_placeholder: string
  miriam_send: string
  miriam_typing: string
  miriam_invalid_query: string
  miriam_search_launching: string
  miriam_welcome: string
  miriam_advice_cta: string
  miriam_advice_loading: string
  miriam_context_label: string
  miriam_positioning: string
  miriam_market: string
  miriam_channel: string
  miriam_generic_hint: string      // shown when search was done without Miriam context
  miriam_generic_cta: string       // "ask Miriam" link in the hint
  miriam_context_hint: string      // shown when search WAS guided by Miriam (invite to refine)
  miriam_context_refine: string    // "ask Miriam to refine" link
}

const en: T = {
  nav_tagline: 'AI Sourcing for online sellers',
  nav_login: 'Log in',
  nav_signup: 'Sign up',
  nav_logout: 'Log out',

  hero_badge: 'AI Sourcing Platform',
  hero_title: ['From product idea', 'to the right supplier.'],
  hero_subtitle: 'Validate demand in any market, find the best suppliers, compare margins and manage outreach — all in one flow.',

  how_title: 'How it works',
  how_steps: [
    { label: 'Validate the market', desc: 'Demand analysis, competition, and margin potential.' },
    { label: 'Find suppliers', desc: 'Direct links to Alibaba, AliExpress, Europages and more.' },
    { label: 'Calculate margins', desc: 'Interactive, saveable, with dropship vs stock comparison.' },
    { label: 'Manage outreach', desc: 'Pre-filled email drafts and negotiation tracker.' },
  ],

  step_01: 'Market validation',
  step_02: 'Find suppliers',
  step_03: 'Margin analysis',
  step_04: 'Outreach tracker',
  step_loading: 'Analyzing "{query}"…',
  step_sourcing: 'Preparing sourcing links…',
  step_error: 'Something went wrong. Make sure the backend is running and try again.',

  input_placeholder: 'Product to analyze in {market}…',
  input_try: 'Try:',
  input_analyze: 'Analyze →',
  input_analyzing: 'Analyzing…',
  categories: ['Home & Kitchen', 'Sports & Outdoor', 'Electronics', 'Fashion', 'Beauty', 'Pet', 'Other'],
  examples: ['Thermal water bottle 500ml', 'Minimalist leather wallet', 'Ergonomic travel pillow', 'LED desk lamp with USB'],

  vs_title_tooltip: 'Score 0–100 combining demand, competition, margin potential and sourcing ease. Above 70 = worth proceeding.',
  vs_good: 'Good',
  vs_fair: 'Fair',
  vs_risky: 'Risky',
  vs_demand: 'Demand',
  vs_demand_tooltip: 'Measures how actively people search for this product. High = already active market.',
  vs_competition: 'Competition',
  vs_competition_tooltip: 'Ease of market entry. 100 = open market, 0 = very saturated.',
  vs_margin: 'Margin potential',
  vs_margin_tooltip: 'Whether the product can be sold with a sustainable margin net of costs.',
  vs_sourcing: 'Sourcing ease',
  vs_sourcing_tooltip: 'How many active suppliers exist with accessible MOQ and prices.',
  vs_price_range: 'Market price range',
  vs_price_range_tooltip: 'Prices detected on active marketplaces. Useful for setting your selling price.',
  vs_channel: 'Recommended channel',
  vs_channel_tooltip: 'Platforms where this type of product gets the most traction.',
  vs_trend: 'Annual trend',
  vs_trend_tooltip: 'Change in demand compared to the previous year.',

  sl_title: 'Direct links to sourcing platforms',
  sl_subtitle: 'Prices and demand shown above are based on real data. Use these links to find specific suppliers for your product.',
  sl_footer: 'Pre-filled search for "{query}" on each platform',
  sl_platforms: {
    'Alibaba': 'Manufacturers and wholesalers, negotiable MOQ',
    'AliExpress': 'Dropshipping with no minimum order',
    'Made-in-China': 'Verified Chinese manufacturers',
    'Europages': 'European suppliers, fast EU shipping',
  },

  mc_title: 'Margin Calculator',
  mc_title_tooltip: 'Calculates in real time how much you earn per unit sold, accounting for all costs.',
  mc_tab_calc: 'Calculator',
  mc_tab_drop: 'Drop vs Stock',
  mc_gross: 'Gross margin',
  mc_gross_tooltip: 'Selling price minus only product cost. Does not include shipping, fees or other costs.',
  mc_net: 'Net margin',
  mc_net_tooltip: 'What you actually earn per unit, after all costs: product, shipping, fees, ads and returns.',
  mc_total_cost: 'Total cost/unit',
  mc_total_cost_tooltip: 'Sum of all per-unit costs. Subtracted from the selling price gives the net margin.',
  mc_breakeven: 'Monthly break-even',
  mc_breakeven_tooltip: 'How many units you need to sell each month to cover monthly fixed costs.',
  mc_breakeven_unit: 'units',
  mc_selling_price: 'Selling price',
  mc_selling_price_tooltip: 'The price at which you will sell the product to the end customer.',
  mc_unit_cost: 'Supplier unit cost',
  mc_unit_cost_tooltip: 'How much you pay the supplier per unit.',
  mc_shipping: 'Shipping to customer',
  mc_shipping_tooltip: 'Average shipping cost per unit. If you offer free shipping, enter the courier cost you pay.',
  mc_ads: 'Ads cost per unit',
  mc_ads_tooltip: 'Average ad spend per unit. E.g. €300 in ads on 100 units = €3/unit.',
  mc_platform: 'Platform',
  mc_platform_tooltip: 'Select the platform to preset the transaction fee. Manually adjustable.',
  mc_platform_fee: '{platform} fee',
  mc_platform_fee_tooltip: 'Percentage retained by the platform on each sale. Shopify ~2%, Amazon ~15%.',
  mc_return_rate: 'Return rate',
  mc_return_rate_tooltip: 'Estimated percentage of returned orders. Typically 1–5% for physical products.',
  mc_fixed_costs: 'Monthly fixed costs',
  mc_fixed_costs_tooltip: 'Monthly fixed costs (subscriptions, warehouse, tools). Enables break-even calculation.',
  mc_save: 'Save',
  mc_cancel: 'Cancel',
  mc_save_scenario: '+ Save scenario',
  mc_save_placeholder: 'Scenario name (e.g. Bottle – Supplier A)',
  mc_saved_scenarios: 'Saved scenarios',
  mc_saved_scenarios_tooltip: 'Save multiple margin configurations to compare them — same product with different suppliers or platforms.',
  mc_load: 'Load',
  mc_delete: 'Delete',
  mc_net_short: 'Net',

  dvs_title: 'Profitability comparison',
  dvs_title_tooltip: 'Calculates at how many monthly sales it makes sense to switch to stock. The tipping point depends on the per-unit cost difference and the initial investment.',
  dvs_drop_cost: 'Drop cost/unit',
  dvs_drop_cost_tooltip: 'Price per unit in dropshipping. Higher because there is no minimum MOQ.',
  dvs_stock_cost: 'Stock cost/unit',
  dvs_stock_cost_tooltip: 'Price per unit in stock. Lower thanks to volume, but requires initial investment.',
  dvs_moq: 'Stock MOQ',
  dvs_moq_tooltip: 'Minimum quantity to purchase. Determines the initial investment (MOQ × stock cost).',
  dvs_monthly_units: 'Expected sales/month',
  dvs_monthly_units_tooltip: 'Monthly unit sales estimate. Higher = stock pays off faster.',
  dvs_monthly_cost_label: 'Monthly cost',
  dvs_initial_investment: 'Initial investment',
  dvs_monthly_profit: 'Net monthly profit',
  dvs_recommended: 'Recommended',
  dvs_breakeven_label: 'Stock break-even:',
  dvs_month_s: 'month',
  dvs_month_p: 'months',
  dvs_rec_no_units: 'Enter expected monthly units.',
  dvs_rec_drop_cheaper: 'Dropshipping costs less. Stock is not profitable at these prices.',
  dvs_rec_immediate: 'Switch to stock now. Break-even in {n} {months} — savings are immediate.',
  dvs_rec_medium: 'Stock pays off in the medium term. Break-even in {n} {months}. Consider it when you are confident about volume.',
  dvs_rec_long: 'Break-even in {n} {months}. Keep dropshipping until volume is stable.',

  ot_title: 'Outreach tracker',
  ot_title_tooltip: 'Track contacted suppliers. Update the status as the negotiation progresses.',
  ot_contacts: '{n} contacts',
  ot_add_note: 'Add a note…',
  ot_save: 'Save',
  ot_remove: 'Remove',
  ot_sent_prefix: 'Sent',
  ot_updated_prefix: 'updated',
  ot_status_tooltip: 'Update status: Sent → Waiting → Replied → Negotiation → Closed.',
  ot_status_sent: 'Sent',
  ot_status_waiting: 'Waiting',
  ot_status_replied: 'Replied',
  ot_status_negotiation: 'Negotiation',
  ot_status_closed: 'Closed',
  ot_just_now: 'just now',
  ot_mins_ago: '{n}m ago',
  ot_hours_ago: '{n}h ago',
  ot_days_ago: '{n}d ago',

  auth_login_title: 'Log in to SourceAI',
  auth_login_subtitle: 'Welcome back',
  auth_continue_google: 'Continue with Google',
  auth_or: 'or',
  auth_email_placeholder: 'you@example.com',
  auth_forgot: 'Forgot password?',
  auth_submit_login: 'Log in',
  auth_loading_login: 'Logging in…',
  auth_no_account: "Don't have an account?",
  auth_signup_link: 'Sign up',
  auth_reset_sent: 'Email sent! Check your inbox.',
  auth_enter_email: 'Enter your email first',
  auth_signup_title: 'Create your account',
  auth_signup_subtitle: 'Start sourcing smarter',
  auth_signup_google: 'Sign up with Google',
  auth_confirm_password: 'Confirm password',
  auth_submit_signup: 'Create account',
  auth_loading_signup: 'Creating account…',
  auth_has_account: 'Already have an account?',
  auth_login_link: 'Log in',
  auth_password_min: 'Password must be at least 6 characters',
  auth_password_mismatch: 'Passwords do not match',
  auth_check_email_title: 'Check your email',
  auth_check_email_body: 'We sent a confirmation link to {email}. Click the link to activate your account.',
  auth_back_login: 'Back to login',
  auth_reset_title: 'New password',
  auth_reset_subtitle: 'Choose a secure password',
  auth_new_password: 'New password',
  auth_confirm: 'Confirm',
  auth_submit_reset: 'Update password',
  auth_loading_reset: 'Saving…',
  auth_reset_success: 'Password updated!',
  auth_redirect: 'Redirecting…',
  auth_password_short: 'Minimum 6 characters',

  loading_steps: [
    'Searching prices on Amazon…',
    'Analyzing market trends…',
    'Searching B2B suppliers…',
    'AI analysis in progress…',
    'Almost ready…',
  ],
  score_demand: 'Demand',
  score_competition: 'Competition',
  score_margin: 'Margin',
  score_sourcing: 'Sourcing',
  verdict_label: 'Claude analysis',
  price_detected: 'Prices detected',
  miriam_cta_sub: 'Ask Miriam →',
  rate_limit_title: 'Too many searches in a short time',
  rate_limit_body: 'Wait a few seconds before launching a new search.',

  pos_mass_market: 'Mass market',
  pos_artisanal: 'Artisanal',
  pos_premium: 'Premium',
  pos_dropshipping: 'Dropshipping',
  pos_unknown: '—',
  ch_online: 'Online',
  ch_store: 'Physical store',
  ch_dropshipping: 'Dropshipping',

  rs_no_suppliers: 'No suppliers found.',
  rs_refine: 'Refine the query with Miriam',
  rs_found: '{n} suppliers found',
  rs_indicative: 'Indicative data',
  rs_tracked: '✓ Tracked',
  rs_outreach_add: '+ Outreach',
  rs_copied: '✓ Copied!',
  rs_email: '↗ Email',
  rs_open_site: 'Open site',

  ss_title: 'Saved suppliers',
  ss_for: 'for: {query}',
  ss_remove: 'Remove',

  miriam_title: 'Miriam · AI Research',
  miriam_placeholder: 'Tell me what you want to sell…',
  miriam_send: 'Send',
  miriam_typing: 'Miriam is thinking…',
  miriam_invalid_query: 'This doesn\'t look like a sellable product. Try being more specific.',
  miriam_search_launching: 'Launching market research…',
  miriam_welcome: 'Hi! I\'m Miriam, your sourcing assistant. Tell me what product you\'d like to sell, and I\'ll help you refine the search before we dig into the data. By default I\'ll look for global online opportunities (including dropshipping) — unless you tell me otherwise.',
  miriam_advice_cta: 'Miriam\'s take on this →',
  miriam_advice_loading: 'Miriam is analyzing the results…',
  miriam_context_label: 'Search configured by Miriam',
  miriam_positioning: 'Positioning',
  miriam_market: 'Market',
  miriam_channel: 'Channel',
  miriam_generic_hint: 'Results based on default parameters (global online market). For a more targeted search by positioning, channel and market —',
  miriam_generic_cta: 'ask Miriam',
  miriam_context_hint: 'Suppliers filtered based on your search context. Want to change something?',
  miriam_context_refine: 'Ask Miriam to refine',
}

const it: T = {
  nav_tagline: 'AI Sourcing per seller online',
  nav_login: 'Accedi',
  nav_signup: 'Registrati',
  nav_logout: 'Esci',

  hero_badge: 'AI Sourcing Platform',
  hero_title: ['Dal prodotto', 'al supplier giusto.'],
  hero_subtitle: 'Valida la domanda in qualsiasi mercato, trova i migliori fornitori, confronta margini e gestisci l\'outreach — tutto in un unico flusso.',

  how_title: 'Come funziona',
  how_steps: [
    { label: 'Valida il mercato', desc: 'Analisi domanda, competizione e potenziale di margine.' },
    { label: 'Trova i supplier', desc: 'Link diretti ad Alibaba, AliExpress, Europages e altri.' },
    { label: 'Calcola i margini', desc: 'Interattivo, salvabile, con confronto drop vs stock.' },
    { label: 'Gestisci l\'outreach', desc: 'Bozze email precompilate e tracker delle trattative.' },
  ],

  step_01: 'Validazione mercato',
  step_02: 'Trova fornitori',
  step_03: 'Analisi margini',
  step_04: 'Outreach tracker',
  step_loading: 'Analizzo "{query}"…',
  step_sourcing: 'Preparo i link di sourcing…',
  step_error: 'Qualcosa è andato storto. Assicurati che il backend sia attivo e riprova.',

  input_placeholder: 'Prodotto da analizzare in {market}…',
  input_try: 'Prova con:',
  input_analyze: 'Analizza →',
  input_analyzing: 'Analisi…',
  categories: ['Casa e cucina', 'Sport e outdoor', 'Elettronica', 'Moda', 'Beauty', 'Pet', 'Altro'],
  examples: ['Borraccia termica 500ml', 'Portafoglio minimalista in pelle', 'Cuscino ergonomico da viaggio', 'Lampada LED da scrivania USB'],

  vs_title_tooltip: 'Punteggio 0–100 che combina domanda, competizione, margine potenziale e facilità di sourcing. Sopra 70 = vale la pena procedere.',
  vs_good: 'Buono',
  vs_fair: 'Discreto',
  vs_risky: 'Rischioso',
  vs_demand: 'Domanda',
  vs_demand_tooltip: 'Misura quanto le persone cercano attivamente questo prodotto. Alto = mercato già attivo.',
  vs_competition: 'Competizione',
  vs_competition_tooltip: 'Facilità di entrata nel mercato. 100 = mercato aperto, 0 = molto saturo.',
  vs_margin: 'Margine potenziale',
  vs_margin_tooltip: 'Indica se il prodotto è vendibile con margine sostenibile al netto dei costi.',
  vs_sourcing: 'Facilità sourcing',
  vs_sourcing_tooltip: 'Quanti supplier attivi esistono con MOQ e prezzi accessibili.',
  vs_price_range: 'Range prezzi mercato',
  vs_price_range_tooltip: 'Prezzi rilevati su marketplace attivi. Utile per scegliere il tuo prezzo di vendita.',
  vs_channel: 'Canale consigliato',
  vs_channel_tooltip: 'Piattaforme dove questo tipo di prodotto ottiene più trazione.',
  vs_trend: 'Trend annuale',
  vs_trend_tooltip: 'Variazione della domanda rispetto all\'anno precedente.',

  sl_title: 'Link diretti alle piattaforme di sourcing',
  sl_subtitle: 'I prezzi e la domanda mostrati sopra sono basati su dati reali. Usa questi link per trovare i fornitori specifici adatti al tuo prodotto.',
  sl_footer: 'Ricerca pre-impostata per "{query}" su ogni piattaforma',
  sl_platforms: {
    'Alibaba': 'Produttori e grossisti, MOQ negoziabile',
    'AliExpress': 'Dropshipping senza MOQ minimo',
    'Made-in-China': 'Produttori cinesi verificati',
    'Europages': 'Grossisti europei, spedizioni rapide in UE',
  },

  mc_title: 'Margin Calculator',
  mc_title_tooltip: 'Calcola in tempo reale quanto guadagni per ogni unità venduta, tenendo conto di tutti i costi.',
  mc_tab_calc: 'Calcolatore',
  mc_tab_drop: 'Drop vs Stock',
  mc_gross: 'Margine lordo',
  mc_gross_tooltip: 'Prezzo di vendita meno solo il costo del prodotto. Non include spedizione, fee o altri costi.',
  mc_net: 'Margine netto',
  mc_net_tooltip: 'Quello che guadagni davvero per ogni unità, dopo tutti i costi: prodotto, spedizione, fee, ads e resi.',
  mc_total_cost: 'Costo totale/unità',
  mc_total_cost_tooltip: 'Somma di tutti i costi per unità. Sottratto al prezzo di vendita dà il margine netto.',
  mc_breakeven: 'Break-even mensile',
  mc_breakeven_tooltip: 'Quante unità devi vendere ogni mese per coprire i costi fissi mensili.',
  mc_breakeven_unit: 'unità',
  mc_selling_price: 'Prezzo di vendita',
  mc_selling_price_tooltip: 'Il prezzo a cui venderai il prodotto al cliente finale.',
  mc_unit_cost: 'Costo unitario supplier',
  mc_unit_cost_tooltip: 'Quanto paghi al supplier per ogni unità.',
  mc_shipping: 'Spedizione al cliente',
  mc_shipping_tooltip: 'Costo medio di spedizione per unità. Se offri spedizione gratuita, inserisci il costo che paghi al corriere.',
  mc_ads: 'Costo ads per unità',
  mc_ads_tooltip: 'Spesa pubblicitaria media per unità. Es: €300 di ads su 100 unità = €3/unità.',
  mc_platform: 'Piattaforma',
  mc_platform_tooltip: 'Seleziona la piattaforma per preimpostare la fee di transazione. Modificabile manualmente.',
  mc_platform_fee: 'Fee {platform}',
  mc_platform_fee_tooltip: 'Percentuale trattenuta dalla piattaforma su ogni vendita. Shopify ~2%, Amazon ~15%.',
  mc_return_rate: 'Tasso di reso',
  mc_return_rate_tooltip: 'Percentuale stimata di ordini restituiti. Tipicamente 1–5% per prodotti fisici.',
  mc_fixed_costs: 'Costi fissi mensili',
  mc_fixed_costs_tooltip: 'Costi mensili fissi (abbonamenti, magazzino, tool). Attiva il calcolo del break-even.',
  mc_save: 'Salva',
  mc_cancel: 'Annulla',
  mc_save_scenario: '+ Salva scenario',
  mc_save_placeholder: 'Nome scenario (es. Borraccia – Supplier A)',
  mc_saved_scenarios: 'Scenari salvati',
  mc_saved_scenarios_tooltip: 'Salva più configurazioni di margine per confrontarle — stesso prodotto con supplier diversi o piattaforme diverse.',
  mc_load: 'Carica',
  mc_delete: 'Elimina',
  mc_net_short: 'Netto',

  dvs_title: 'Confronto convenienza',
  dvs_title_tooltip: 'Calcola a quante vendite mensili conviene passare al stock. Il punto di svolta dipende dalla differenza di costo per unità e dall\'investimento iniziale.',
  dvs_drop_cost: 'Costo drop/unità',
  dvs_drop_cost_tooltip: 'Prezzo per unità in dropshipping. Più alto perché non c\'è MOQ minimo.',
  dvs_stock_cost: 'Costo stock/unità',
  dvs_stock_cost_tooltip: 'Prezzo per unità in stock. Più basso grazie al volume, ma richiede investimento iniziale.',
  dvs_moq: 'MOQ stock',
  dvs_moq_tooltip: 'Quantità minima da acquistare. Determina l\'investimento iniziale (MOQ × costo stock).',
  dvs_monthly_units: 'Vendite attese/mese',
  dvs_monthly_units_tooltip: 'Stima mensile delle unità vendute. Più alto = stock si ripaga prima.',
  dvs_monthly_cost_label: 'Costo mensile',
  dvs_initial_investment: 'Investimento iniziale',
  dvs_monthly_profit: 'Profitto netto/mese',
  dvs_recommended: 'Consigliato',
  dvs_breakeven_label: 'Break-even stock:',
  dvs_month_s: 'mese',
  dvs_month_p: 'mesi',
  dvs_rec_no_units: 'Inserisci le unità mensili attese.',
  dvs_rec_drop_cheaper: 'Il dropshipping costa meno. Lo stock non è conveniente con questi prezzi.',
  dvs_rec_immediate: 'Passa allo stock subito. Break-even in {n} {months} — il risparmio è immediato.',
  dvs_rec_medium: 'Lo stock conviene a medio termine. Break-even in {n} {months}. Valuta quando sei sicuro del volume.',
  dvs_rec_long: 'Break-even in {n} {months}. Continua con il dropshipping finché il volume non è stabile.',

  ot_title: 'Outreach tracker',
  ot_title_tooltip: 'Tieni traccia dei supplier contattati. Aggiorna lo stato man mano che la trattativa avanza.',
  ot_contacts: '{n} contatti',
  ot_add_note: 'Aggiungi una nota…',
  ot_save: 'Salva',
  ot_remove: 'Rimuovi',
  ot_sent_prefix: 'Inviato',
  ot_updated_prefix: 'aggiornato',
  ot_status_tooltip: 'Aggiorna lo stato: Inviato → In attesa → Risposto → Trattativa → Chiuso.',
  ot_status_sent: 'Inviato',
  ot_status_waiting: 'In attesa',
  ot_status_replied: 'Risposto',
  ot_status_negotiation: 'Trattativa',
  ot_status_closed: 'Chiuso',
  ot_just_now: 'ora',
  ot_mins_ago: '{n}m fa',
  ot_hours_ago: '{n}h fa',
  ot_days_ago: '{n}g fa',

  auth_login_title: 'Accedi a SourceAI',
  auth_login_subtitle: 'Bentornato',
  auth_continue_google: 'Continua con Google',
  auth_or: 'oppure',
  auth_email_placeholder: 'tu@esempio.com',
  auth_forgot: 'Password dimenticata?',
  auth_submit_login: 'Accedi',
  auth_loading_login: 'Accesso…',
  auth_no_account: 'Non hai un account?',
  auth_signup_link: 'Registrati',
  auth_reset_sent: 'Email inviata! Controlla la tua casella.',
  auth_enter_email: 'Inserisci prima la tua email',
  auth_signup_title: 'Crea il tuo account',
  auth_signup_subtitle: 'Inizia a fare sourcing in modo intelligente',
  auth_signup_google: 'Registrati con Google',
  auth_confirm_password: 'Conferma password',
  auth_submit_signup: 'Crea account',
  auth_loading_signup: 'Registrazione…',
  auth_has_account: 'Hai già un account?',
  auth_login_link: 'Accedi',
  auth_password_min: 'La password deve essere di almeno 6 caratteri',
  auth_password_mismatch: 'Le password non coincidono',
  auth_check_email_title: 'Controlla la tua email',
  auth_check_email_body: 'Ti abbiamo inviato un link di conferma a {email}. Clicca sul link per attivare l\'account.',
  auth_back_login: 'Torna al login',
  auth_reset_title: 'Nuova password',
  auth_reset_subtitle: 'Scegli una password sicura',
  auth_new_password: 'Nuova password',
  auth_confirm: 'Conferma',
  auth_submit_reset: 'Aggiorna password',
  auth_loading_reset: 'Salvataggio…',
  auth_reset_success: 'Password aggiornata!',
  auth_redirect: 'Reindirizzamento in corso…',
  auth_password_short: 'Minimo 6 caratteri',

  loading_steps: [
    'Ricerca prezzi su Amazon…',
    'Analisi trend di mercato…',
    'Ricerca supplier B2B…',
    'Analisi con AI in corso…',
    'Quasi pronto…',
  ],
  score_demand: 'Domanda',
  score_competition: 'Concorrenza',
  score_margin: 'Margine',
  score_sourcing: 'Sourcing',
  verdict_label: 'Analisi Claude',
  price_detected: 'Prezzi rilevati',
  miriam_cta_sub: 'Chiedilo a Miriam →',
  rate_limit_title: 'Troppe ricerche in poco tempo',
  rate_limit_body: 'Attendi qualche secondo prima di lanciare una nuova ricerca.',

  pos_mass_market: 'Mass market',
  pos_artisanal: 'Artigianale',
  pos_premium: 'Premium',
  pos_dropshipping: 'Dropshipping',
  pos_unknown: '—',
  ch_online: 'Online',
  ch_store: 'Negozio fisico',
  ch_dropshipping: 'Dropshipping',

  rs_no_suppliers: 'Nessun fornitore trovato.',
  rs_refine: 'Raffina la query con Miriam',
  rs_found: '{n} fornitori trovati',
  rs_indicative: 'Dato indicativo',
  rs_tracked: '✓ Tracciato',
  rs_outreach_add: '+ Outreach',
  rs_copied: '✓ Copiata!',
  rs_email: '↗ Email',
  rs_open_site: 'Apri sito',

  ss_title: 'Supplier salvati',
  ss_for: 'per: {query}',
  ss_remove: 'Rimuovi',

  miriam_title: 'Miriam · Ricerca AI',
  miriam_placeholder: 'Dimmi cosa vuoi vendere…',
  miriam_send: 'Invia',
  miriam_typing: 'Miriam sta pensando…',
  miriam_invalid_query: 'Questo non sembra un prodotto vendibile. Prova a essere più specifico.',
  miriam_search_launching: 'Avvio ricerca di mercato…',
  miriam_welcome: 'Ciao! Sono Miriam, la tua assistente al sourcing. Dimmi che prodotto vuoi vendere e ti aiuto a definire la ricerca prima di analizzare i dati. Di default cerco opportunità di vendita online a livello globale (incluso dropshipping) — a meno che tu non mi dica altro.',
  miriam_advice_cta: 'Il parere di Miriam →',
  miriam_advice_loading: 'Miriam sta analizzando i risultati…',
  miriam_context_label: 'Ricerca configurata da Miriam',
  miriam_positioning: 'Posizionamento',
  miriam_market: 'Mercato',
  miriam_channel: 'Canale',
  miriam_generic_hint: 'Risultati basati su parametri standard (mercato online globale). Per una ricerca più mirata per posizionamento, canale e mercato —',
  miriam_generic_cta: 'chiedi a Miriam',
  miriam_context_hint: 'Fornitori filtrati in base al contesto della tua ricerca. Vuoi cambiare qualcosa?',
  miriam_context_refine: 'Chiedi a Miriam di raffinare',
}

const es: T = {
  nav_tagline: 'IA de Sourcing para vendedores online',
  nav_login: 'Iniciar sesión',
  nav_signup: 'Registrarse',
  nav_logout: 'Cerrar sesión',

  hero_badge: 'Plataforma de Sourcing IA',
  hero_title: ['Del producto', 'al proveedor ideal.'],
  hero_subtitle: 'Valida la demanda en cualquier mercado, encuentra los mejores proveedores, compara márgenes y gestiona el outreach — todo en un solo flujo.',

  how_title: 'Cómo funciona',
  how_steps: [
    { label: 'Valida el mercado', desc: 'Análisis de demanda, competencia y potencial de margen.' },
    { label: 'Encuentra proveedores', desc: 'Links directos a Alibaba, AliExpress, Europages y más.' },
    { label: 'Calcula márgenes', desc: 'Interactivo, guardable, con comparación drop vs stock.' },
    { label: 'Gestiona el outreach', desc: 'Borradores de email y seguimiento de negociaciones.' },
  ],

  step_01: 'Validación de mercado',
  step_02: 'Encontrar proveedores',
  step_03: 'Análisis de márgenes',
  step_04: 'Seguimiento outreach',
  step_loading: 'Analizando "{query}"…',
  step_sourcing: 'Preparando links de sourcing…',
  step_error: 'Algo salió mal. Asegúrate de que el backend esté activo e inténtalo de nuevo.',

  input_placeholder: 'Producto a analizar en {market}…',
  input_try: 'Prueba con:',
  input_analyze: 'Analizar →',
  input_analyzing: 'Analizando…',
  categories: ['Hogar y cocina', 'Deporte y exterior', 'Electrónica', 'Moda', 'Belleza', 'Mascotas', 'Otro'],
  examples: ['Botella térmica 500ml', 'Cartera minimalista de cuero', 'Almohada ergonómica de viaje', 'Lámpara LED de escritorio USB'],

  vs_title_tooltip: 'Puntuación 0–100 que combina demanda, competencia, potencial de margen y facilidad de sourcing. Por encima de 70 = vale la pena continuar.',
  vs_good: 'Bueno',
  vs_fair: 'Regular',
  vs_risky: 'Arriesgado',
  vs_demand: 'Demanda',
  vs_demand_tooltip: 'Mide cuánto buscan activamente este producto. Alto = mercado ya activo.',
  vs_competition: 'Competencia',
  vs_competition_tooltip: 'Facilidad de entrada al mercado. 100 = mercado abierto, 0 = muy saturado.',
  vs_margin: 'Potencial de margen',
  vs_margin_tooltip: 'Si el producto es vendible con un margen sostenible neto de costes.',
  vs_sourcing: 'Facilidad de sourcing',
  vs_sourcing_tooltip: 'Cuántos proveedores activos existen con MOQ y precios accesibles.',
  vs_price_range: 'Rango de precios',
  vs_price_range_tooltip: 'Precios detectados en marketplaces activos. Útil para fijar tu precio de venta.',
  vs_channel: 'Canal recomendado',
  vs_channel_tooltip: 'Plataformas donde este tipo de producto obtiene más tracción.',
  vs_trend: 'Tendencia anual',
  vs_trend_tooltip: 'Variación de la demanda respecto al año anterior.',

  sl_title: 'Links directos a plataformas de sourcing',
  sl_subtitle: 'Los precios y la demanda mostrados arriba están basados en datos reales. Usa estos links para encontrar proveedores específicos para tu producto.',
  sl_footer: 'Búsqueda pre-configurada para "{query}" en cada plataforma',
  sl_platforms: {
    'Alibaba': 'Fabricantes y mayoristas, MOQ negociable',
    'AliExpress': 'Dropshipping sin pedido mínimo',
    'Made-in-China': 'Fabricantes chinos verificados',
    'Europages': 'Proveedores europeos, envíos rápidos en la UE',
  },

  mc_title: 'Calculadora de Márgenes',
  mc_title_tooltip: 'Calcula en tiempo real cuánto ganas por cada unidad vendida, teniendo en cuenta todos los costes.',
  mc_tab_calc: 'Calculadora',
  mc_tab_drop: 'Drop vs Stock',
  mc_gross: 'Margen bruto',
  mc_gross_tooltip: 'Precio de venta menos solo el coste del producto. No incluye envío, comisiones u otros costes.',
  mc_net: 'Margen neto',
  mc_net_tooltip: 'Lo que ganas realmente por cada unidad, tras todos los costes: producto, envío, comisiones, ads y devoluciones.',
  mc_total_cost: 'Coste total/unidad',
  mc_total_cost_tooltip: 'Suma de todos los costes por unidad. Restado al precio de venta da el margen neto.',
  mc_breakeven: 'Punto de equilibrio mensual',
  mc_breakeven_tooltip: 'Cuántas unidades debes vender cada mes para cubrir los costes fijos mensuales.',
  mc_breakeven_unit: 'unidades',
  mc_selling_price: 'Precio de venta',
  mc_selling_price_tooltip: 'El precio al que venderás el producto al cliente final.',
  mc_unit_cost: 'Coste unitario proveedor',
  mc_unit_cost_tooltip: 'Cuánto le pagas al proveedor por cada unidad.',
  mc_shipping: 'Envío al cliente',
  mc_shipping_tooltip: 'Coste medio de envío por unidad. Si ofreces envío gratis, ingresa el coste que pagas al courier.',
  mc_ads: 'Coste ads por unidad',
  mc_ads_tooltip: 'Gasto publicitario medio por unidad. Ej: €300 en ads en 100 unidades = €3/unidad.',
  mc_platform: 'Plataforma',
  mc_platform_tooltip: 'Selecciona la plataforma para prefijar la comisión de transacción. Ajustable manualmente.',
  mc_platform_fee: 'Comisión {platform}',
  mc_platform_fee_tooltip: 'Porcentaje retenido por la plataforma en cada venta. Shopify ~2%, Amazon ~15%.',
  mc_return_rate: 'Tasa de devolución',
  mc_return_rate_tooltip: 'Porcentaje estimado de pedidos devueltos. Típicamente 1–5% para productos físicos.',
  mc_fixed_costs: 'Costes fijos mensuales',
  mc_fixed_costs_tooltip: 'Costes mensuales fijos (suscripciones, almacén, herramientas). Activa el cálculo del punto de equilibrio.',
  mc_save: 'Guardar',
  mc_cancel: 'Cancelar',
  mc_save_scenario: '+ Guardar escenario',
  mc_save_placeholder: 'Nombre del escenario (ej. Botella – Proveedor A)',
  mc_saved_scenarios: 'Escenarios guardados',
  mc_saved_scenarios_tooltip: 'Guarda múltiples configuraciones de margen para compararlas — mismo producto con diferentes proveedores o plataformas.',
  mc_load: 'Cargar',
  mc_delete: 'Eliminar',
  mc_net_short: 'Neto',

  dvs_title: 'Comparación de rentabilidad',
  dvs_title_tooltip: 'Calcula a cuántas ventas mensuales conviene pasarse al stock. El punto de inflexión depende de la diferencia de coste por unidad y la inversión inicial.',
  dvs_drop_cost: 'Coste drop/unidad',
  dvs_drop_cost_tooltip: 'Precio por unidad en dropshipping. Más alto porque no hay MOQ mínimo.',
  dvs_stock_cost: 'Coste stock/unidad',
  dvs_stock_cost_tooltip: 'Precio por unidad en stock. Más bajo gracias al volumen, pero requiere inversión inicial.',
  dvs_moq: 'MOQ stock',
  dvs_moq_tooltip: 'Cantidad mínima a comprar. Determina la inversión inicial (MOQ × coste stock).',
  dvs_monthly_units: 'Ventas esperadas/mes',
  dvs_monthly_units_tooltip: 'Estimación mensual de unidades vendidas. Más alto = stock se amortiza antes.',
  dvs_monthly_cost_label: 'Coste mensual',
  dvs_initial_investment: 'Inversión inicial',
  dvs_monthly_profit: 'Beneficio neto/mes',
  dvs_recommended: 'Recomendado',
  dvs_breakeven_label: 'Punto de equilibrio stock:',
  dvs_month_s: 'mes',
  dvs_month_p: 'meses',
  dvs_rec_no_units: 'Ingresa las unidades mensuales esperadas.',
  dvs_rec_drop_cheaper: 'El dropshipping cuesta menos. El stock no es rentable a estos precios.',
  dvs_rec_immediate: 'Pásate al stock ahora. Punto de equilibrio en {n} {months} — el ahorro es inmediato.',
  dvs_rec_medium: 'El stock conviene a medio plazo. Punto de equilibrio en {n} {months}. Considéralo cuando estés seguro del volumen.',
  dvs_rec_long: 'Punto de equilibrio en {n} {months}. Sigue con dropshipping hasta que el volumen sea estable.',

  ot_title: 'Seguimiento outreach',
  ot_title_tooltip: 'Lleva un seguimiento de los proveedores contactados. Actualiza el estado a medida que avanza la negociación.',
  ot_contacts: '{n} contactos',
  ot_add_note: 'Añadir una nota…',
  ot_save: 'Guardar',
  ot_remove: 'Eliminar',
  ot_sent_prefix: 'Enviado',
  ot_updated_prefix: 'actualizado',
  ot_status_tooltip: 'Actualiza el estado: Enviado → En espera → Respondido → Negociación → Cerrado.',
  ot_status_sent: 'Enviado',
  ot_status_waiting: 'En espera',
  ot_status_replied: 'Respondido',
  ot_status_negotiation: 'Negociación',
  ot_status_closed: 'Cerrado',
  ot_just_now: 'ahora',
  ot_mins_ago: 'hace {n}m',
  ot_hours_ago: 'hace {n}h',
  ot_days_ago: 'hace {n}d',

  auth_login_title: 'Acceder a SourceAI',
  auth_login_subtitle: 'Bienvenido de vuelta',
  auth_continue_google: 'Continuar con Google',
  auth_or: 'o',
  auth_email_placeholder: 'tu@ejemplo.com',
  auth_forgot: '¿Olvidaste tu contraseña?',
  auth_submit_login: 'Iniciar sesión',
  auth_loading_login: 'Iniciando sesión…',
  auth_no_account: '¿No tienes cuenta?',
  auth_signup_link: 'Regístrate',
  auth_reset_sent: '¡Email enviado! Revisa tu bandeja de entrada.',
  auth_enter_email: 'Introduce primero tu email',
  auth_signup_title: 'Crea tu cuenta',
  auth_signup_subtitle: 'Empieza a hacer sourcing de forma inteligente',
  auth_signup_google: 'Registrarse con Google',
  auth_confirm_password: 'Confirmar contraseña',
  auth_submit_signup: 'Crear cuenta',
  auth_loading_signup: 'Creando cuenta…',
  auth_has_account: '¿Ya tienes cuenta?',
  auth_login_link: 'Iniciar sesión',
  auth_password_min: 'La contraseña debe tener al menos 6 caracteres',
  auth_password_mismatch: 'Las contraseñas no coinciden',
  auth_check_email_title: 'Revisa tu email',
  auth_check_email_body: 'Te enviamos un link de confirmación a {email}. Haz clic en el link para activar tu cuenta.',
  auth_back_login: 'Volver al inicio de sesión',
  auth_reset_title: 'Nueva contraseña',
  auth_reset_subtitle: 'Elige una contraseña segura',
  auth_new_password: 'Nueva contraseña',
  auth_confirm: 'Confirmar',
  auth_submit_reset: 'Actualizar contraseña',
  auth_loading_reset: 'Guardando…',
  auth_reset_success: '¡Contraseña actualizada!',
  auth_redirect: 'Redirigiendo…',
  auth_password_short: 'Mínimo 6 caracteres',

  loading_steps: [
    'Buscando precios en Amazon…',
    'Analizando tendencias de mercado…',
    'Buscando proveedores B2B…',
    'Análisis con IA en curso…',
    'Casi listo…',
  ],
  score_demand: 'Demanda',
  score_competition: 'Competencia',
  score_margin: 'Margen',
  score_sourcing: 'Sourcing',
  verdict_label: 'Análisis Claude',
  price_detected: 'Precios detectados',
  miriam_cta_sub: 'Pregunta a Miriam →',
  rate_limit_title: 'Demasiadas búsquedas en poco tiempo',
  rate_limit_body: 'Espera unos segundos antes de lanzar una nueva búsqueda.',

  pos_mass_market: 'Mass market',
  pos_artisanal: 'Artesanal',
  pos_premium: 'Premium',
  pos_dropshipping: 'Dropshipping',
  pos_unknown: '—',
  ch_online: 'Online',
  ch_store: 'Tienda física',
  ch_dropshipping: 'Dropshipping',

  rs_no_suppliers: 'No se encontraron proveedores.',
  rs_refine: 'Refina la búsqueda con Miriam',
  rs_found: '{n} proveedores encontrados',
  rs_indicative: 'Dato indicativo',
  rs_tracked: '✓ Registrado',
  rs_outreach_add: '+ Outreach',
  rs_copied: '✓ ¡Copiado!',
  rs_email: '↗ Email',
  rs_open_site: 'Abrir sitio',

  ss_title: 'Proveedores guardados',
  ss_for: 'para: {query}',
  ss_remove: 'Eliminar',

  miriam_title: 'Miriam · Investigación AI',
  miriam_placeholder: 'Dime qué quieres vender…',
  miriam_send: 'Enviar',
  miriam_typing: 'Miriam está pensando…',
  miriam_invalid_query: 'Esto no parece un producto vendible. Intenta ser más específico.',
  miriam_search_launching: 'Lanzando investigación de mercado…',
  miriam_welcome: '¡Hola! Soy Miriam, tu asistente de sourcing. Cuéntame qué producto quieres vender y te ayudo a afinar la búsqueda antes de analizar los datos. Por defecto busco oportunidades de venta online a nivel global (incluyendo dropshipping) — a menos que me indiques lo contrario.',
  miriam_advice_cta: 'La opinión de Miriam →',
  miriam_advice_loading: 'Miriam está analizando los resultados…',
  miriam_context_label: 'Búsqueda configurada por Miriam',
  miriam_positioning: 'Posicionamiento',
  miriam_market: 'Mercado',
  miriam_channel: 'Canal',
  miriam_generic_hint: 'Resultados basados en parámetros estándar (mercado online global). Para una búsqueda más precisa por posicionamiento, canal y mercado —',
  miriam_generic_cta: 'pregunta a Miriam',
  miriam_context_hint: 'Proveedores filtrados según el contexto de tu búsqueda. ¿Quieres cambiar algo?',
  miriam_context_refine: 'Pide a Miriam que afine',
}

export const translations: Record<Lang, T> = { en, it, es }

export function t(lang: Lang): T {
  return translations[lang]
}
