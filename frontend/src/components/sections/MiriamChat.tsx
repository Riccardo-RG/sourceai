'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
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
const MIN_WIDTH = 260
const MAX_WIDTH = 720
const MIN_HEIGHT = 200
const MAX_HEIGHT = 900

const SUPPLIER_URLS: Record<string, (q: string) => string> = {
  'Alibaba':       (q) => `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(q)}`,
  'AliExpress':    (q) => `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(q)}`,
  'Europages':     (q) => `https://www.europages.co.uk/companies/${encodeURIComponent(q)}.html`,
  'Ankorstore':    (q) => `https://www.ankorstore.com/search?query=${encodeURIComponent(q)}`,
  'Faire':         (q) => `https://www.faire.com/search?q=${encodeURIComponent(q)}`,
  'DHgate':        (q) => `https://www.dhgate.com/wholesale/search.do?searchkey=${encodeURIComponent(q)}`,
  'Made-in-China': (q) => `https://www.made-in-china.com/multi-search/${encodeURIComponent(q)}/F1/`,
  'Spocket':       (q) => `https://www.spocket.co/products?search=${encodeURIComponent(q)}`,
  'Mercado Libre': (q) => `https://listado.mercadolibre.com.mx/search?as_word=${encodeURIComponent(q)}`,
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
    threads, activeThreadId,
    minimized, width, height, posX, posY,
    isStreaming, pendingAdvice,
    createThread, deleteThread, switchThread,
    addMessage, setContext, setMinimized, setWidth, setHeight, setPosition,
    setIsStreaming, clearPendingAdvice, reset,
  } = useMiriamStore()

  const lang = useLangStore((s) => s.lang)

  // Derived: active thread data
  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) ?? threads[0],
    [threads, activeThreadId],
  )
  const messages = activeThread?.messages ?? []
  const context = activeThread?.context ?? null
  const foundSuppliers = activeThread?.foundSuppliers ?? []
  const viabilitySummary = activeThread?.viabilitySummary ?? null

  const [input, setInput] = useState('')
  const [streamingText, setStreamingText] = useState('')
  const [pendingOptions, setPendingOptions] = useState<SearchOptions | null>(null)
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [threadPickerOpen, setThreadPickerOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const wasDragging = useRef(false)
  const hasWelcomed = useRef(false)

  // Reset pending options when switching threads
  useEffect(() => {
    setPendingOptions(null)
    setOptionsLoading(false)
    setThreadPickerOpen(false)
  }, [activeThreadId])

  // Welcome message on first load / after clear
  useEffect(() => {
    if (messages.length === 0) hasWelcomed.current = false
    if (!hasWelcomed.current) {
      hasWelcomed.current = true
      if (messages.length === 0) addMessage({ role: 'assistant', content: t.miriam_welcome })
    }
  }, []) // eslint-disable-line

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

  const parseSignal = useCallback(
    (signal: string): void => {
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
          try {
            const p = JSON.parse(match[1])
            if (p.reason) reason = p.reason
          } catch { /* */ }
        }
        addMessage({ role: 'assistant', content: `⚠️ ${reason}` })
      } else if (signal.includes('<SUPPLIERS>')) {
        const match = signal.match(/<SUPPLIERS>([\s\S]*?)<\/SUPPLIERS>/)
        if (match) {
          try {
            const payload = JSON.parse(match[1])
            const q = payload.query || ''
            const cards: SupplierCard[] = ((payload.platforms as string[]) || [])
              .filter((p) => SUPPLIER_URLS[p])
              .map((p) => ({
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
    },
    [onSearch, setContext, addMessage, t.miriam_invalid_query],
  )

  const runChatStream = useCallback(
    async (userMsg: string) => {
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
    },
    [messages, foundSuppliers, context, viabilitySummary, addMessage, setIsStreaming, parseSignal],
  )

  const sendMessage = useCallback(
    async (text: string, silent = false) => {
      if (!text.trim() || isStreaming) return
      const userMsg = text.trim()
      setInput('')
      if (!silent) addMessage({ role: 'user', content: userMsg })

      // Pre-search: no context yet → show options panel
      if (context === null) {
        setOptionsLoading(true)
        setPendingOptions(null)
        setHeight(Math.max(height, 520))
        setMinimized(false)
        try {
          const opts = await clarifyQuery(userMsg, lang)
          setPendingOptions(opts)
        } catch {
          await runChatStream(userMsg)
        } finally {
          setOptionsLoading(false)
        }
        return
      }

      await runChatStream(userMsg)
    },
    [messages, isStreaming, context, lang, height, addMessage, setIsStreaming, setHeight, setMinimized, runChatStream], // eslint-disable-line
  )

  // ─── Drag to move panel ──────────────────────────────────────────────────
  const startPanelDrag = useCallback(
    (e: React.MouseEvent) => {
      if (typeof window === 'undefined' || window.innerWidth < 640) return
      e.preventDefault()
      wasDragging.current = false

      const rect = panelRef.current?.getBoundingClientRect()
      if (!rect) return

      const startX = e.clientX
      const startY = e.clientY
      const startLeft = rect.left
      const startTop = rect.top

      const onMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY
        if (!wasDragging.current && Math.hypot(dx, dy) < 4) return
        wasDragging.current = true
        const panelW = rect.width
        const panelH = minimized ? HEADER_HEIGHT : height
        const newX = Math.max(0, Math.min(window.innerWidth - panelW, startLeft + dx))
        const newY = Math.max(0, Math.min(window.innerHeight - HEADER_HEIGHT, startTop + dy))
        setPosition(Math.round(newX), Math.round(newY))
      }

      const onUp = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [height, minimized, setPosition],
  )

  // ─── Top edge: resize height ──────────────────────────────────────────────
  const startTopResize = (e: React.MouseEvent) => {
    e.preventDefault()
    const startY = e.clientY
    const startH = height
    const rect = panelRef.current?.getBoundingClientRect()
    const startTop = rect?.top ?? 0

    const onMove = (ev: MouseEvent) => {
      const dy = startY - ev.clientY
      const newH = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startH + dy))
      setHeight(newH)
      if (posX !== null) {
        // Explicit position: keep bottom fixed, adjust top
        const newTop = Math.max(0, startTop - (newH - startH))
        setPosition(posX, Math.round(newTop))
      }
    }

    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ─── Right edge: resize width ─────────────────────────────────────────────
  const startRightResize = (e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = width

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX
      setWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startW + dx)))
    }

    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const panelH = minimized ? HEADER_HEIGHT : height
  const hasMultipleThreads = threads.length > 1

  const posStyle: React.CSSProperties =
    posX !== null && posY !== null
      ? { left: posX, top: posY, right: 'auto', bottom: 'auto' }
      : { right: 24, bottom: 20, left: 'auto', top: 'auto' }

  return (
    <div
      ref={panelRef}
      style={{
        height: panelH,
        width,
        ...posStyle,
        ...(isStreaming && {
          borderColor: 'var(--color-primary)',
          boxShadow: '0 0 0 1px var(--color-primary), 0 8px 40px -8px var(--color-primary)',
        }),
      }}
      className="fixed z-50 flex flex-col rounded-lg border border-border bg-background shadow-2xl transition-[box-shadow,border-color] duration-300"
    >
      {/* Top resize handle */}
      {!minimized && (
        <div
          onMouseDown={startTopResize}
          className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize bg-border/30 hover:bg-primary/30 transition-colors z-20"
        />
      )}

      {/* Right resize handle */}
      <div
        onMouseDown={startRightResize}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize bg-transparent hover:bg-primary/20 transition-colors z-20"
      />

      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest('button, a')) return
          startPanelDrag(e)
        }}
        className="flex items-center px-2 gap-1.5 select-none border-b border-border bg-muted/20 shrink-0 cursor-grab active:cursor-grabbing sm:cursor-grab"
        style={{ height: HEADER_HEIGHT }}
        title="Drag to move"
      >
        {/* Drag grip — visual hint only */}
        <div className="p-1 text-muted-foreground/25 shrink-0 hidden sm:flex pointer-events-none">
          <svg width="7" height="11" viewBox="0 0 7 11" fill="currentColor">
            <circle cx="1.5" cy="1.5" r="1.1" /><circle cx="5.5" cy="1.5" r="1.1" />
            <circle cx="1.5" cy="5.5" r="1.1" /><circle cx="5.5" cy="5.5" r="1.1" />
            <circle cx="1.5" cy="9.5" r="1.1" /><circle cx="5.5" cy="9.5" r="1.1" />
          </svg>
        </div>

        {/* Thread title / picker toggle */}
        <button
          onClick={() => {
            if (hasMultipleThreads || true) setThreadPickerOpen((v) => !v)
          }}
          className="flex items-center gap-1 flex-1 min-w-0 text-left"
        >
          <span className="text-xs font-semibold text-foreground tracking-wide truncate">
            {activeThread?.title === 'New chat' ? t.miriam_title : (activeThread?.title ?? t.miriam_title)}
          </span>
          {isStreaming && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
          )}
          <svg
            className="w-2.5 h-2.5 text-muted-foreground/40 shrink-0 ml-auto"
            fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {/* New thread */}
        <button
          onClick={() => { createThread(); setThreadPickerOpen(false) }}
          title="New conversation"
          className="p-1 rounded text-muted-foreground/40 hover:text-foreground hover:bg-muted/40 transition-colors shrink-0"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>

        {/* Minimize */}
        <button
          onClick={() => setMinimized(!minimized)}
          className="p-1 rounded text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0 text-[9px] leading-none"
        >
          {minimized ? '▲' : '▼'}
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      {!minimized && (
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">

          {/* Thread picker overlay */}
          {threadPickerOpen && (
            <div className="absolute inset-0 bg-background z-10 flex flex-col">
              <div className="px-3 py-2 border-b border-border flex items-center justify-between shrink-0">
                <span className="text-xs font-semibold text-foreground">Conversations</span>
                <button
                  onClick={() => setThreadPickerOpen(false)}
                  className="p-1 rounded text-muted-foreground/50 hover:text-foreground transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-1 min-h-0">
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer group transition-colors ${
                      thread.id === activeThreadId
                        ? 'bg-muted/60'
                        : 'hover:bg-muted/30'
                    }`}
                    onClick={() => { switchThread(thread.id); setThreadPickerOpen(false) }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{thread.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {thread.messages.length} message{thread.messages.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteThread(thread.id) }}
                      title="Delete conversation"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground/40 hover:text-red-500 transition-all shrink-0"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-border p-2 shrink-0">
                <button
                  onClick={() => { createThread(); setThreadPickerOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  New conversation
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
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

          {/* Input */}
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
        </div>
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
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
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
