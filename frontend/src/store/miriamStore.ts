'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage, SearchContext } from '@/types'

interface PendingAdvice {
  query: string
  viability: Record<string, unknown>
}

interface MiriamStore {
  messages: ChatMessage[]
  context: SearchContext | null
  minimized: boolean
  height: number
  isStreaming: boolean
  pendingAdvice: PendingAdvice | null
  addMessage: (msg: ChatMessage) => void
  setContext: (ctx: SearchContext) => void
  setMinimized: (v: boolean) => void
  setHeight: (h: number) => void
  setIsStreaming: (v: boolean) => void
  triggerAdvice: (query: string, viability: Record<string, unknown>) => void
  clearPendingAdvice: () => void
  reset: () => void
}

export const useMiriamStore = create<MiriamStore>()(
  persist(
    (set) => ({
      messages: [],
      context: null,
      minimized: false,
      height: 270,
      isStreaming: false,
      pendingAdvice: null,
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      setContext: (ctx) => set({ context: ctx }),
      setMinimized: (v) => set({ minimized: v }),
      setHeight: (h) => set({ height: Math.max(200, Math.min(640, h)) }),
      setIsStreaming: (v) => set({ isStreaming: v }),
      triggerAdvice: (query, viability) => set({ pendingAdvice: { query, viability }, minimized: false }),
      clearPendingAdvice: () => set({ pendingAdvice: null }),
      reset: () => set({ messages: [], context: null, isStreaming: false, pendingAdvice: null }),
    }),
    {
      name: 'sourceai_miriam',
      // Don't persist transient streaming state
      partialize: (s) => ({
        messages: s.messages,
        context: s.context,
        minimized: s.minimized,
        height: s.height,
      }),
    },
  ),
)
