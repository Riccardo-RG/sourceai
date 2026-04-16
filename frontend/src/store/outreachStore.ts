import { create } from 'zustand'

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

interface OutreachStore {
  entries: OutreachEntry[]
  addEntry: (supplier_id: string, supplier_name: string, product_query: string) => void
  updateStatus: (id: string, status: OutreachStatus) => void
  addNote: (id: string, note: string) => void
  removeEntry: (id: string) => void
}

// Mock entries so the tracker non è vuoto al primo caricamento
const MOCK_ENTRIES: OutreachEntry[] = [
  {
    id: 'mock-1',
    supplier_id: '3',
    supplier_name: 'GreenDrink Wholesale — IT',
    product_query: 'borraccia termica',
    status: 'risposto',
    sent_at: new Date(Date.now() - 1000 * 60 * 60 * 48),
    last_update: new Date(Date.now() - 1000 * 60 * 60 * 12),
    note: 'Disponibili 200 unità a magazzino, prezzo €7.80/u per ordini > 100.',
  },
]

export const useOutreachStore = create<OutreachStore>((set, get) => ({
  entries: MOCK_ENTRIES,

  addEntry: (supplier_id, supplier_name, product_query) => {
    const exists = get().entries.find((e) => e.supplier_id === supplier_id && e.product_query === product_query)
    if (exists) return
    const entry: OutreachEntry = {
      id: crypto.randomUUID(),
      supplier_id,
      supplier_name,
      product_query,
      status: 'inviato',
      sent_at: new Date(),
      last_update: new Date(),
    }
    set((state) => ({ entries: [entry, ...state.entries] }))
  },

  updateStatus: (id, status) => {
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === id ? { ...e, status, last_update: new Date() } : e
      ),
    }))
  },

  addNote: (id, note) => {
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === id ? { ...e, note, last_update: new Date() } : e
      ),
    }))
  },

  removeEntry: (id) => {
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }))
  },
}))
