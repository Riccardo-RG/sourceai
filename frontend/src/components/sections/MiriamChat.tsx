'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useMiriamStore } from '@/store/miriamStore'
import { streamMiriam, clarifyQuery } from '@/lib/api'
import { useT } from '@/hooks/useT'
import { useLangStore } from '@/store/langStore'
import MiriamOptionsPanel from '@/components/sections/MiriamOptionsPanel'
import type { SearchContext, SupplierCard, SearchOptions } from '@/types'

interface Props {
  onSearch: (query: string, category?: string, market?: string, context?: SearchContext) => void
}

const HEADER_HEIGHT = 44

const SUPPLIER_URLS: Record<string, (q: string) => string> = {
  'Alibaba':       q => `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(q)}`,
  'AliExpress':    q => `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(q)}`,
  'Europages':     q => `https://www.europages.co.uk/companies/${encodeURIComponent(q)}.html`,
  'Ankorstore':    q => `https://www.ankorstore.com/search?query=${encodeURIComponent(q)}`,
  'Faire':         q => `https://www.faire.com/search?q=${encodeURIComponent(q)}`,
  'DHgate':        q => `https://www.dhgate.com/wholesale/search.do?searchkey=${encodeURIComponent(q)}`,
  'Made-in-China': q => `https://www.made-in-china.com/multi-search/${encodeURIComponent(q)}/F1/`,
  'Spocket':       q => `https://www.spocket.co/products?search=${encodeURIComponent(q)}`,
  'Mercado Libre': q => `https://listado.mercadolibre.com.mx/search?as_word=${encodeURIComponent(q)}`,
}

const PLATFORM_ICONS: Record<string, string> = {
  'Alibaba': '🏭', 'AliExpress': '📦', 'Europages': '🇪🇺',
  'Ankorstore': '🎨', 'Faire': '✦', 'DHgate': '🏪',
  'Made-in-China': '🇨🇳', 'Spocket': '🚀', 'Mercado Libre': '🛒',
}

const PLATFORM_DESCRIPTIONS: Record<string, string> = {
  'Alibaba': 'Manufacturers & wholesalers',
  'AliExpress': 'No MOQ, dropshipping-friendly',
  'Europages': 'European manufacturers',
  'Ankorstore': 'European artisan brands',
  'Faire': 'Independent brands, net-60',
  'DHgate': 'Small-batch wholesale',
  'Made-in-China': 'Verified Chinese manufacturers',
  'Spocket': 'EU/US suppliers, fast shipping',
  'Mercado Libre': 'Latin America marketplace',
}

function buildAdviceMessage(query: string, viability: Record<string, unknown>): string {
  const score = viability.score ?? '—'
  const demand = viability.demand ?? '—'
  const competition = viability.competition ?? '—'
  const margin = viability.margin_potential ?? '—'
  const verdict = viability.verdict ?? ''
  return `I just saw the results for "${query}". Here's what came back:\n- Overall score: ${score}/100\n- Demand: ${demand}/100\n- Competition: ${competition}/100\n- Margin potential: ${margin}/100\n- Verdict: ${verdict}\n\nWhat's your take? Any refinements or alternatives I should consider?`
}

export default function MiriamChat({ onSearch }: Props) {
  const t = useT()
  const {
    messages, minimized, height, isStreaming, pendingAdvice, foundSuppliers, context, viabilitySummary,
    addMessage, setContext, setMinimized, setHeight,
    setIsStreaming, clearPendingAdvice, reset,
  } = useMiriamStore()

  const lang = useLangStore((s) => s.lang)
  const [input, setInput] = useState('')
  const [streamingText, setStreamingText] = useState('')
  const [pendingOptions, setPendingOptions] = useState<SearchOptions | null>(null)
  const [optionsLoading, setOptionsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startY: number; startH: number } | null>(null)
  const hasWelcomed = useRef(false)

  // Welcome on first load
  useEffect(() => {
    if (messages.length === 0) {
      hasWelcomed.current = false
    }
    if (!hasWelcomed.current) {
      hasWelcomed.current = true
      if (messages.length === 0) {
        addMessage({ role: 'assistant', content: t.miriam_welcome })
      }
    }
  }, []) // eslint-disable-line

  // Re-add welcome after clear
  useEffect(() => {
    if (messages.length === 0 && hasWelcomed.current) {
      addMessage({ role: 'assistant', content: t.miriam_welcome })
    }
  }, [messages.length]) // eslint-disable-line

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  // CTA-triggered advice
  useEffect(() => {
    if (!pendingAdvice || isStreaming) return
    const msg = buildAdviceMessage(pendingAdvice.query, pendingAdvice.viability)
    clearPendingAdvice()
    sendMessage(msg, true)
  }, [pendingAdvice]) // eslint-disable-line

  const parseSignal = useCallback((signal: string): void => {
    if (signal.includes('<SEARCH_READY>')) {
      const match = signal.match(/<SEARCH_READY>([\s\S]*?)<\/SEARCH_READY>/)
      if (match) {
        try {
          const ctx: SearchContext = JSON.parse(match[1])
          setContext(ctx)
          onSearch(ctx.refined_query, undefined, ctx.market.toUpperCase(), ctx)
        } catch { /* malformed */ }
      }
    } else if (signal.includes('<INVALID_QUERY>')) {
      const match = signal.match(/<INVALID_QUERY>([\s\S]*?)<\/INVALID_QUERY>/)
      let reason = t.miriam_invalid_query
      if (match) {
        try { const p = JSON.parse(match[1]); if (p.reason) reason = p.reason } catch { /* */ }
      }
      addMessage({ role: 'assistant', content: `⚠️ ${reason}` })
    } else if (signal.includes('<SUPPLIERS>')) {
      const match = signal.match(/<SUPPLIERS>([\s\S]*?)<\/SUPPLIERS>/)
      if (match) {
        try {
          const payload = JSON.parse(match[1])
          const q = payload.query || ''
          const cards: SupplierCard[] = ((payload.platforms as string[]) || [])
            .filter(p => SUPPLIER_URLS[p])
            .map(p => ({
              platform: p,
              url: SUPPLIER_URLS[p](q),
              description: PLATFORM_DESCRIPTIONS[p] || '',
            }))
          if (cards.length > 0) {
            addMessage({ role: 'assistant', content: '', suppliers: cards })
          }
        } catch { /* malformed */ }
      }
    }
  }, [onSearch, setContext, addMessage, t.miriam_invalid_query])

  const sendMessage = useCallback(async (text: string, silent = false) => {
    if (!text.trim() || isStreaming) return
    const userMsg = text.trim()
    setInput('')
    if (!silent) addMessage({ role: 'user', content: userMsg })

    // Pre-search: no context yet → show options panel instead of text Q&A
    if (context === null) {
      setOptionsLoading(true)
      setPendingOptions(null)
      setHeight(Math.max(height, 520))
      setMinimized(false)
      try {
        const opts = await clarifyQuery(userMsg, lang)
        setPendingOptions(opts)
      } catch {
        // Fallback: normal chat flow
        await runChatStream(userMsg)
      } finally {
        setOptionsLoading(false)
      }
      return
    }

    await runChatStream(userMsg)
  }, [messages, isStreaming, context, lang, height, addMessage, setIsStreaming, setHeight, setMinimized, parseSignal]) // eslint-disable-line

  const runChatStream = useCallback(async (userMsg: string) => {
    setIsStreaming(true)
    setStreamingText('')
    let accumulated = ''
    let signalAccumulated = ''
    try {
      for await (const chunk of streamMiriam(messages, userMsg, foundSuppliers, context, viabilitySummary)) {
        if (chunk.done) break
        if (chunk.text) { accumulated += chunk.text; setStreamingText(accumulated) }
        if (chunk.signal) { signalAccumulated += chunk.signal }
      }
    } catch {
      accumulated = 'Sorry, something went wrong. Please try again.'
    }
    if (accumulated.trim()) addMessage({ role: 'assistant', content: accumulated.trim() })
    setStreamingText('')
    setIsStreaming(false)
    if (signalAccumulated) parseSignal(signalAccumulated)
  }, [messages, foundSuppliers, context, viabilitySummary, addMessage, setIsStreaming, parseSignal])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleClear = useCallback(() => {
    reset()
    setPendingOptions(null)
  }, [reset])

  const onDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = { startY: e.clientY, startH: height }
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return
      setHeight(dragRef.current.startH + (dragRef.current.startY - ev.clientY))
    }
    const onUp = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const panelHeight = minimized ? HEADER_HEIGHT : height

  return (
    <div
      style={{ height: panelHeight }}
      className="fixed bottom-0 right-0 sm:right-4 z-50 w-full sm:w-72 flex flex-col rounded-t-lg border border-border bg-background shadow-xl overflow-hidden"
    >
      {/* Drag handle */}
      {!minimized && (
        <div
          onMouseDown={onDragStart}
          className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize bg-border/30 hover:bg-primary/30 transition-colors z-10"
        />
      )}

      {/* Header */}
      <div
        className="flex items-center justify-between px-3 select-none border-b border-border bg-muted/20 shrink-0"
        style={{ height: HEADER_HEIGHT }}
      >
        <div
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={() => setMinimized(!minimized)}
        >
          <span className="text-xs font-semibold text-foreground tracking-wide">{t.miriam_title}</span>
          {isStreaming && <span className="inline-block w-1 h-1 rounded-full bg-primary animate-pulse" />}
        </div>
        <div className="flex items-center gap-0.5">
          {messages.length > 1 && !isStreaming && (
            <button
              onClick={(e) => { e.stopPropagation(); handleClear() }}
              title="Nuova chat"
              className="p-1 rounded text-muted-foreground/30 hover:text-red-500 transition-colors"
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
          <button
            className="text-muted-foreground/40 text-[10px] cursor-pointer px-1 hover:text-muted-foreground transition-colors"
            onClick={() => setMinimized(!minimized)}
          >
            {minimized ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Body */}
      {!minimized && (
        <>
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5 min-h-0">
            {messages.map((msg, i) => (
              <MessageBubble key={i} role={msg.role} content={msg.content} suppliers={msg.suppliers} />
            ))}
            {streamingText && (
              <MessageBubble role="assistant" content={streamingText} streaming />
            )}
            {isStreaming && !streamingText && !optionsLoading && (
              <p className="text-[11px] text-muted-foreground/60 italic">{t.miriam_typing}</p>
            )}
            {/* Options panel — shown inline when pre-search clarification is needed */}
            {(pendingOptions || optionsLoading) && (
              <div className="mt-1">
                <MiriamOptionsPanel
                  options={pendingOptions}
                  loading={optionsLoading}
                  onConfirm={(refinedQuery, market, ctx) => {
                    setPendingOptions(null)
                    setContext(ctx)
                    onSearch(refinedQuery, undefined, market, ctx)
                  }}
                  onCancel={() => setPendingOptions(null)}
                />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border px-3 py-2 flex gap-2 items-end shrink-0">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.miriam_placeholder}
              disabled={isStreaming || optionsLoading || !!pendingOptions}
              className="flex-1 resize-none text-xs bg-transparent outline-none placeholder:text-muted-foreground/50 text-foreground min-h-[24px] max-h-16 disabled:opacity-40"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isStreaming || !input.trim() || optionsLoading || !!pendingOptions}
              className="text-[10px] font-semibold px-2.5 py-1.5 rounded bg-primary text-primary-foreground disabled:opacity-30 hover:bg-primary/90 transition-colors shrink-0"
            >
              {t.miriam_send}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function MessageBubble({
  role, content, suppliers, streaming,
}: {
  role: 'user' | 'assistant'
  content: string
  suppliers?: SupplierCard[]
  streaming?: boolean
}) {
  const isUser = role === 'user'
  const isWarning = !isUser && content.startsWith('⚠️')

  if (suppliers && suppliers.length > 0) {
    return (
      <div className="flex flex-col gap-1">
        {suppliers.map((s) => (
          <a
            key={s.platform}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-border bg-background hover:bg-muted/40 transition-colors group"
          >
            <span className="text-sm shrink-0">{PLATFORM_ICONS[s.platform] ?? '🔗'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{s.platform}</p>
              <p className="text-[10px] text-muted-foreground truncate">{s.description}</p>
            </div>
            <svg className="w-2.5 h-2.5 text-muted-foreground/30 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
          </a>
        ))}
      </div>
    )
  }

  if (!content) return null

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[88%] rounded px-2.5 py-1.5 text-xs leading-relaxed whitespace-pre-wrap
          ${isUser
            ? 'bg-primary text-primary-foreground'
            : isWarning
              ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
              : 'bg-muted text-foreground'
          }
          ${streaming ? 'after:content-["▋"] after:animate-pulse after:text-muted-foreground/50' : ''}
        `}
      >
        {content}
      </div>
    </div>
  )
}
