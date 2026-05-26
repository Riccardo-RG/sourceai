import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SearchProfile } from '@/types'

const EMPTY: SearchProfile = {
  selling_channels: [],
  business_model: '',
  price_tier: '',
  target_customer: [],
  moq_tolerance: '',
  private_label: '',
  certifications: [],
  lead_time: '',
  initial_budget: '',
  target_margin: '',
  product_specs: '',
  special_requirements: '',
}

function hasData(p: SearchProfile): boolean {
  return (
    p.selling_channels.length > 0 ||
    p.business_model !== '' ||
    p.price_tier !== '' ||
    p.initial_budget !== '' ||
    p.certifications.length > 0
  )
}

interface SearchProfileStore {
  profile: SearchProfile
  isOpen: boolean
  hasProfile: boolean
  setOpen: (v: boolean) => void
  setProfile: (profile: SearchProfile) => void
  resetProfile: () => void
}

export const useSearchProfileStore = create<SearchProfileStore>()(
  persist(
    (set) => ({
      profile: EMPTY,
      isOpen: false,
      hasProfile: false,
      setOpen: (v) => set({ isOpen: v }),
      setProfile: (profile) => set({ profile, hasProfile: hasData(profile) }),
      resetProfile: () => set({ profile: EMPTY, hasProfile: false }),
    }),
    {
      name: 'sourceai-profile',
      partialize: (s) => ({ profile: s.profile, hasProfile: s.hasProfile }),
    },
  ),
)
