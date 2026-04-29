import { create } from 'zustand'

export const SYSTEMS = [
  'Skeletal',
  'Muscular',
  'Cardiovascular',
  'Respiratory',
  'Digestive',
  'Nervous',
  'Urinary',
  'Reproductive',
  'Endocrine',
  'Lymphatic',
  'Integumentary',
  'Special Senses',
]

export interface MeshInfo {
  uuid: string
  name: string
  cleanName: string
  system: string
}

interface StoreState {
  availableMeshes: MeshInfo[]
  setAvailableMeshes: (meshes: MeshInfo[]) => void
  
  // Explorer Status
  activeSystems: Set<string>
  toggleSystem: (sys: string) => void
  systemColors: Record<string, string>
  setSystemColors: (colors: Record<string, string>) => void
  lastClickedSystem: string | null
  setLastClickedSystem: (sys: string | null) => void
}

export const useStore = create<StoreState>((set) => ({
  
  availableMeshes: [],
  setAvailableMeshes: (meshes) => set({ availableMeshes: meshes }),

  activeSystems: new Set(['Skeletal']),
  toggleSystem: (sys) => set((state) => {
    const newActive = new Set(state.activeSystems)
    if (newActive.has(sys)) newActive.delete(sys)
    else newActive.add(sys)
    return { activeSystems: newActive, lastClickedSystem: sys }
  }),
  
  systemColors: {},
  setSystemColors: (colors) => set({ systemColors: colors }),
  
  lastClickedSystem: null,
  setLastClickedSystem: (sys) => set({ lastClickedSystem: sys }),

  // No quiz state here anymore. All quiz state is in useQuizStore.ts
}))
