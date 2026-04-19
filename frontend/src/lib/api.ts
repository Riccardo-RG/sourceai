import { createClient } from '@/lib/supabase'
import type { ChatMessage } from '@/types'

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

// ── Search ───────────────────────────────────────────────────────────────────

export async function searchProduct(
  query: string,
  category?: string,
  market = 'GLOBAL',
  context?: object,
): Promise<{
  viability: object
  sourcing_links: Array<{ platform: string; url: string; label: string; description: string }>
}> {
  const userId = await getUserId()
  const res = await fetch(`${API_URL}/api/search`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ query, category, session_id: userId, market, context }),
  })
  if (!res.ok) throw new Error(`Search failed: ${res.status}`)
  return res.json()
}

// ── Miriam Chat (SSE streaming) ──────────────────────────────────────────────

export async function* streamMiriam(
  messages: ChatMessage[],
  userMessage: string,
): AsyncGenerator<{ text?: string; signal?: string; done?: boolean }> {
  const headers = await authHeaders()
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ messages, user_message: userMessage }),
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
