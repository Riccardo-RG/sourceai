'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useMiriamStore } from '@/store/miriamStore'
import { streamMiriam } from '@/lib/api'
import { useT } from '@/hooks/useT'
import type { SearchContext } from '@/types'

interface Props {
  onSearch: (query: string, category?: string, market?: string, context?: SearchContext) => void
}

const HEADER_HEIGHT = 44

// Builds the advice request message sent to Miriam when CTA is clicked
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
    messages,
    minimized,
    height,
    isStreaming,
    pendingAdvice,
    addMessage,
    setContext,
    setMinimized,
    setHeight,
    setIsStreaming,
    clearPendingAdvice,
  } = useMiriamStore()

  const [input, setInput] = useState('')
  const [streamingText, setStreamingText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startY: number; startH: number } | null>(null)
  const hasInitialized = useRef(false)

  // Send welcome once (only if no persisted messages)
  useEffect(() => {
    if (!hasInitialized.current && messages.length === 0) {
      hasInitialized.current = true
      addMessage({ role: 'assistant', content: t.miriam_welcome })
    } else {
      hasInitialized.current = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  // Handle CTA-triggered advice request
  useEffect(() => {
    if (!pendingAdvice || isStreaming) return
    const msg = buildAdviceMessage(pendingAdvice.query, pendingAdvice.viability)
    clearPendingAdvice()
    sendMessage(msg, true) // silent = don't show as user bubble
  }, [pendingAdvice]) // eslint-disable-line react-hooks/exhaustive-deps

  const parseSignal = useCallback((signal: string): void => {
    if (signal.includes('<SEARCH_READY>')) {
      const match = signal.match(/<SEARCH_READY>([\s\S]*?)<\/SEARCH_READY>/)
      if (match) {
        try {
          const ctx: SearchContext = JSON.parse(match[1])
          setContext(ctx)
          const market = ctx.market === 'global' ? 'US' : ctx.market
          onSearch(ctx.refined_query, undefined, market, ctx)
        } catch { /* malformed json */ }
      }
    } else if (signal.includes('<INVALID_QUERY>')) {
      const match = signal.match(/<INVALID_QUERY>([\s\S]*?)<\/INVALID_QUERY>/)
      let reason = t.miriam_invalid_query
      if (match) {
        try {
          const parsed = JSON.parse(match[1])
          if (parsed.reason) reason = parsed.reason
        } catch { /* use default */ }
      }
      addMessage({ role: 'assistant', content: `⚠️ ${reason}` })
    }
  }, [onSearch, setContext, addMessage, t.miriam_invalid_query])

  // silent=true means don't add a user bubble (used for CTA-triggered messages)
  const sendMessage = useCallback(async (text: string, silent = false) => {
    if (!text.trim() || isStreaming) return
    const userMsg = text.trim()
    setInput('')
    if (!silent) addMessage({ role: 'user', content: userMsg })
    setIsStreaming(true)
    setStreamingText('')

    let accumulated = ''
    let signalAccumulated = ''

    try {
      for await (const chunk of streamMiriam(messages, userMsg)) {
        if (chunk.done) break
        if (chunk.text) {
          accumulated += chunk.text
          setStreamingText(accumulated)
        }
        if (chunk.signal) {
          signalAccumulated += chunk.signal
        }
      }
    } catch {
      accumulated = 'Sorry, something went wrong. Please try again.'
    }

    if (accumulated.trim()) {
      addMessage({ role: 'assistant', content: accumulated.trim() })
    }
    setStreamingText('')
    setIsStreaming(false)

    if (signalAccumulated) {
      parseSignal(signalAccumulated)
    }
  }, [messages, isStreaming, addMessage, setIsStreaming, parseSignal])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

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
      className="fixed bottom-0 right-4 z-50 w-80 flex flex-col rounded-t-xl border border-border bg-background shadow-2xl overflow-hidden"
    >
      {/* Drag handle */}
      {!minimized && (
        <div
          onMouseDown={onDragStart}
          className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize bg-border/40 hover:bg-primary/40 transition-colors z-10"
        />
      )}

      {/* Header */}
      <div
        className="flex items-center justify-between px-3 cursor-pointer select-none border-b border-border bg-muted/40 shrink-0"
        style={{ height: HEADER_HEIGHT }}
        onClick={() => setMinimized(!minimized)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{t.miriam_title}</span>
          {isStreaming && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          )}
        </div>
        <span className="text-muted-foreground text-xs">{minimized ? '▲' : '▼'}</span>
      </div>

      {/* Body */}
      {!minimized && (
        <>
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3 min-h-0">
            {messages.map((msg, i) => (
              <MessageBubble key={i} role={msg.role} content={msg.content} />
            ))}
            {streamingText && (
              <MessageBubble role="assistant" content={streamingText} streaming />
            )}
            {isStreaming && !streamingText && (
              <p className="text-xs text-muted-foreground italic">{t.miriam_typing}</p>
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
              disabled={isStreaming}
              className="flex-1 resize-none text-sm bg-transparent outline-none placeholder:text-muted-foreground text-foreground min-h-[28px] max-h-20"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isStreaming || !input.trim()}
              className="text-xs font-medium px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0"
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
  role,
  content,
  streaming,
}: {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}) {
  const isUser = role === 'user'
  const isWarning = !isUser && content.startsWith('⚠️')
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap
          ${isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : isWarning
              ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-bl-sm'
              : 'bg-muted text-foreground rounded-bl-sm'
          }
          ${streaming ? 'after:content-["▋"] after:animate-pulse after:text-muted-foreground' : ''}
        `}
      >
        {content}
      </div>
    </div>
  )
}
