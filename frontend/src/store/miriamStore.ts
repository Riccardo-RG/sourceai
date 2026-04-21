'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage, SearchContext } from '@/types'

interface PendingAdvice {
  query: string
  viability: Record<string, unknown>
}

export interface Thread {
  id: string
  title: string
  messages: ChatMessage[]
  context: SearchContext | null
  foundSuppliers: string[]
  viabilitySummary: string | null
  createdAt: number
}

function makeId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function makeThread(): Thread {
  return {
    id: makeId(),
    title: 'New chat',
    messages: [],
    context: null,
    foundSuppliers: [],
    viabilitySummary: null,
    createdAt: Date.now(),
  }
}

interface MiriamStore {
  threads: Thread[]
  activeThreadId: string
  minimized: boolean
  width: number
  height: number
  posX: number | null
  posY: number | null
  isStreaming: boolean
  pendingAdvice: PendingAdvice | null

  createThread: () => string
  deleteThread: (id: string) => void
  switchThread: (id: string) => void
  updateThreadTitle: (id: string, title: string) => void
  addMessage: (msg: ChatMessage) => void
  setContext: (ctx: SearchContext) => void
  setMinimized: (v: boolean) => void
  setWidth: (w: number) => void
  setHeight: (h: number) => void
  setPosition: (x: number | null, y: number | null) => void
  setIsStreaming: (v: boolean) => void
  triggerAdvice: (query: string, viability: Record<string, unknown>) => void
  clearPendingAdvice: () => void
  setFoundSuppliers: (suppliers: string[]) => void
  setViabilitySummary: (summary: string | null) => void
  reset: () => void
}

const first = makeThread()

export const useMiriamStore = create<MiriamStore>()(
  persist(
    (set) => ({
      threads: [first],
      activeThreadId: first.id,
      minimized: false,
      width: 288,
      height: 540,
      posX: null,
      posY: null,
      isStreaming: false,
      pendingAdvice: null,

      createThread: () => {
        const t = makeThread()
        set((s) => ({ threads: [...s.threads, t], activeThreadId: t.id }))
        return t.id
      },

      deleteThread: (id) =>
        set((s) => {
          const remaining = s.threads.filter((t) => t.id !== id)
          if (remaining.length === 0) {
            const t = makeThread()
            return { threads: [t], activeThreadId: t.id }
          }
          const nextId =
            s.activeThreadId === id
              ? remaining[remaining.length - 1].id
              : s.activeThreadId
          return { threads: remaining, activeThreadId: nextId }
        }),

      switchThread: (id) => set({ activeThreadId: id }),

      updateThreadTitle: (id, title) =>
        set((s) => ({
          threads: s.threads.map((t) => (t.id === id ? { ...t, title } : t)),
        })),

      addMessage: (msg) =>
        set((s) => ({
          threads: s.threads.map((t) => {
            if (t.id !== s.activeThreadId) return t
            const messages = [...t.messages, msg]
            // Auto-title from first user message
            const title =
              t.title === 'New chat' && msg.role === 'user'
                ? msg.content.slice(0, 38) + (msg.content.length > 38 ? '…' : '')
                : t.title
            return { ...t, messages, title }
          }),
        })),

      setContext: (ctx) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === s.activeThreadId ? { ...t, context: ctx } : t,
          ),
        })),

      setMinimized: (v) => set({ minimized: v }),
      setWidth: (w) => set({ width: Math.max(240, Math.min(700, w)) }),
      setHeight: (h) => set({ height: Math.max(200, Math.min(900, h)) }),
      setPosition: (x, y) => set({ posX: x, posY: y }),
      setIsStreaming: (v) => set({ isStreaming: v }),

      triggerAdvice: (query, viability) =>
        set({ pendingAdvice: { query, viability }, minimized: false }),
      clearPendingAdvice: () => set({ pendingAdvice: null }),

      setFoundSuppliers: (suppliers) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === s.activeThreadId ? { ...t, foundSuppliers: suppliers } : t,
          ),
        })),

      setViabilitySummary: (summary) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === s.activeThreadId
              ? { ...t, viabilitySummary: summary }
              : t,
          ),
        })),

      reset: () => {
        const t = makeThread()
        set((s) => ({
          threads: s.threads.map((th) =>
            th.id === s.activeThreadId ? t : th,
          ),
          activeThreadId: t.id,
        }))
      },
    }),
    {
      name: 'sourceai_miriam',
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        if (version < 2) {
          const old = persisted as {
            messages?: ChatMessage[]
            context?: SearchContext | null
            minimized?: boolean
            height?: number
          }
          const t = makeThread()
          t.messages = old.messages ?? []
          t.context = old.context ?? null
          if (t.messages.length > 0) {
            const firstUser = t.messages.find((m) => m.role === 'user')
            if (firstUser)
              t.title =
                firstUser.content.slice(0, 38) +
                (firstUser.content.length > 38 ? '…' : '')
          }
          return {
            threads: [t],
            activeThreadId: t.id,
            minimized: old.minimized ?? false,
            width: 288,
            height: old.height ?? 540,
            posX: null,
            posY: null,
          }
        }
        return persisted
      },
      partialize: (s) => ({
        threads: s.threads,
        activeThreadId: s.activeThreadId,
        minimized: s.minimized,
        width: s.width,
        height: s.height,
        posX: s.posX,
        posY: s.posY,
      }),
    },
  ),
)
