import { createClient } from '@/lib/supabase'
import type { ChatMessage, SearchOptions } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// ── Session (anonymous fallback) ─────────────────────────────────────────────

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr'
  let id = localStorage.getItem('sourceai_session')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('sourceai_session', id)
  }
  return id
}

// ── Auth helpers ─────────────────────────────────────────────────────────────

async function authHeaders(json = true): Promise<HeadersInit> {
  const headers: Record<string, string> = {}
  if (json) headers['Content-Type'] = 'application/json'
  try {
    const sb = createClient()
    const { data: { session } } = await sb.auth.getSession()
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    } else {
      headers['X-Session-Id'] = getSessionId()
    }
  } catch {
    headers['X-Session-Id'] = getSessionId()
  }
  return headers
}

export async function getUserId(): Promise<string> {
  try {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (user) return user.id
  } catch { /* fallthrough */ }
  return getSessionId()
}

// ── Clarify (pre-search options panel) ──────────────────────────────────────

export async function clarifyQuery(query: string, lang = 'en'): Promise<SearchOptions> {
  const res = await fetch(`${API_URL}/api/clarify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, lang }),
  })
  if (!res.ok) throw new Error(`Clarify failed: ${res.status}`)
  return res.json()
}

// ── Search ───────────────────────────────────────────────────────────────────

export async function searchProduct(
  query: string,
  category?: string,
  market = 'GLOBAL',
  context?: object,
  lang = 'en',
  profile?: object,
): Promise<{
  viability: object
  sourcing_links: Array<{ platform: string; url: string; label: string; description: string }>
  real_suppliers: Array<{ name: string; platform: string; url: string; description: string }>
}> {
  const userId = await getUserId()
  const res = await fetch(`${API_URL}/api/search`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ query, category, session_id: userId, market, context, lang, profile }),
  })
  if (!res.ok) throw new Error(`Search failed: ${res.status}`)
  return res.json()
}

// ── Miriam Chat (SSE streaming) ──────────────────────────────────────────────

export async function* streamMiriam(
  messages: ChatMessage[],
  userMessage: string,
  foundSuppliers: string[] = [],
  searchContext?: import('@/types').SearchContext | null,
  viabilitySummary?: string | null,
): AsyncGenerator<{ text?: string; signal?: string; done?: boolean }> {
  const headers = await authHeaders()

  // Build a single rich hidden context note injected at the start of history
  const hiddenParts: string[] = []

  if (searchContext) {
    hiddenParts.push(`SEARCH EXECUTED — do NOT ask about these again:
- Product: "${searchContext.refined_query}"
- Positioning: ${searchContext.positioning}
- Market: ${searchContext.market.toUpperCase()}
- Sales channel: ${searchContext.channel}
- Target customer: ${searchContext.target_customer || 'not specified'}
- Supplier preference: ${searchContext.supplier_context || 'none'}`)
  }

  if (viabilitySummary) {
    hiddenParts.push(`MARKET ANALYSIS RESULTS (use these to answer user questions about the product):
${viabilitySummary}`)
  }

  if (foundSuppliers.length > 0) {
    hiddenParts.push(`SUPPLIERS FOUND (visible to user as cards on screen): ${foundSuppliers.join(', ')}
You can reference these by name when the user asks about sourcing options.`)
  }

  const contextualMessages: ChatMessage[] = hiddenParts.length > 0
    ? [{ role: 'assistant', content: `[${hiddenParts.join('\n\n')}]` }, ...messages]
    : messages

  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ messages: contextualMessages, user_message: userMessage }),
  })
  if (!res.ok || !res.body) throw new Error(`Chat failed: ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') { yield { done: true }; return }
      try {
        yield JSON.parse(data)
      } catch { /* ignore malformed */ }
    }
  }
  yield { done: true }
}

// ── Outreach ─────────────────────────────────────────────────────────────────

export async function fetchOutreach() {
  const res = await fetch(`${API_URL}/api/outreach`, {
    headers: await authHeaders(false),
  })
  if (!res.ok) throw new Error('Failed to load outreach')
  return res.json()
}

export async function createOutreach(data: {
  supplier_id: string
  supplier_name: string
  product_query: string
}) {
  const userId = await getUserId()
  const res = await fetch(`${API_URL}/api/outreach`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ ...data, session_id: userId }),
  })
  if (!res.ok) throw new Error('Failed to create outreach')
  return res.json()
}

export async function updateOutreach(id: string, data: { status?: string; note?: string }) {
  const res = await fetch(`${API_URL}/api/outreach/${id}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update outreach')
  return res.json()
}

export async function deleteOutreach(id: string) {
  await fetch(`${API_URL}/api/outreach/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(false),
  })
}

// ── Scenarios ─────────────────────────────────────────────────────────────────

export async function fetchScenarios() {
  const res = await fetch(`${API_URL}/api/scenarios`, {
    headers: await authHeaders(false),
  })
  if (!res.ok) throw new Error('Failed to load scenarios')
  return res.json()
}

export async function createScenario(data: {
  name: string
  supplier_name?: string
  inputs: object
  result: object
}) {
  const userId = await getUserId()
  const res = await fetch(`${API_URL}/api/scenarios`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ ...data, session_id: userId }),
  })
  if (!res.ok) throw new Error('Failed to save scenario')
  return res.json()
}

export async function deleteScenario(id: string) {
  await fetch(`${API_URL}/api/scenarios/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(false),
  })
}
