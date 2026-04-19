'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SavedSupplier {
  id: string
  platform: string
  url: string
  label: string
  description: string
  query: string      // the search query it was saved for
  savedAt: number    // timestamp
}

interface SavedSuppliersStore {
  suppliers: SavedSupplier[]
  save: (supplier: Omit<SavedSupplier, 'id' | 'savedAt'>) => void
  remove: (id: string) => void
  isSaved: (url: string) => boolean
}

export const useSavedSuppliersStore = create<SavedSuppliersStore>()(
  persist(
    (set, get) => ({
      suppliers: [],
      save: (supplier) =>
        set((s) => ({
          suppliers: [
            { ...supplier, id: crypto.randomUUID(), savedAt: Date.now() },
            ...s.suppliers,
          ],
        })),
      remove: (id) =>
        set((s) => ({ suppliers: s.suppliers.filter((x) => x.id !== id) })),
      isSaved: (url) => get().suppliers.some((s) => s.url === url),
    }),
    { name: 'sourceai_saved_suppliers' },
  ),
)
