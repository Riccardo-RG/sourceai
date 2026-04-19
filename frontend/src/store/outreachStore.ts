import { create } from 'zustand'
import {
  fetchOutreach,
  createOutreach,
  updateOutreach,
  deleteOutreach,
} from '@/lib/api'

export type OutreachStatus = 'inviato' | 'in_attesa' | 'risposto' | 'trattativa' | 'chiuso'

export interface OutreachEntry {
  id: string
  supplier_id: string
  supplier_name: string
  product_query: string
  status: OutreachStatus
  sent_at: Date
  last_update: Date
  note?: string
}

function parseEntry(raw: unknown): OutreachEntry {
  const r = raw as Record<string, unknown>
  return {
    ...(raw as OutreachEntry),
    sent_at: new Date(r.sent_at as string),
    last_update: new Date(r.last_update as string),
  }
}

interface OutreachStore {
  entries: OutreachEntry[]
  hydrated: boolean
  hydrate: () => Promise<void>
  reset: () => void
  addEntry: (supplier_id: string, supplier_name: string, product_query: string) => Promise<void>
  updateStatus: (id: string, status: OutreachStatus) => Promise<void>
  addNote: (id: string, note: string) => Promise<void>
  removeEntry: (id: string) => Promise<void>
}

export const useOutreachStore = create<OutreachStore>((set, get) => ({
  entries: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return
    try {
      const raw = await fetchOutreach()
      set({ entries: raw.map(parseEntry), hydrated: true })
    } catch {
      set({ hydrated: true })
    }
  },

  reset: () => set({ entries: [], hydrated: false }),

  addEntry: async (supplier_id, supplier_name, product_query) => {
    const exists = get().entries.find(
      (e) => e.supplier_id === supplier_id && e.product_query === product_query,
    )
    if (exists) return

    const tempId = crypto.randomUUID()
    const now = new Date()
    const entry: OutreachEntry = {
      id: tempId,
      supplier_id,
      supplier_name,
      product_query,
      status: 'inviato',
      sent_at: now,
      last_update: now,
    }
    set((s) => ({ entries: [entry, ...s.entries] }))

    try {
      const saved = await createOutreach({ supplier_id, supplier_name, product_query })
      set((s) => ({
        entries: s.entries.map((e) => (e.id === tempId ? parseEntry(saved) : e)),
      }))
    } catch { /* keep local entry */ }
  },

  updateStatus: async (id, status) => {
    set((s) => ({
      entries: s.entries.map((e) =>
        e.id === id ? { ...e, status, last_update: new Date() } : e,
      ),
    }))
    try {
      await updateOutreach(id, { status })
    } catch { /* UI already updated */ }
  },

  addNote: async (id, note) => {
    set((s) => ({
      entries: s.entries.map((e) =>
        e.id === id ? { ...e, note, last_update: new Date() } : e,
      ),
    }))
    try {
      await updateOutreach(id, { note })
    } catch { /* UI already updated */ }
  },

  removeEntry: async (id) => {
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }))
    try {
      await deleteOutreach(id)
    } catch { /* UI already updated */ }
  },
}))
