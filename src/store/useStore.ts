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

export type AppMode = 'explorer' | 'quiz_settings' | 'quiz_active' | 'quiz_summary'

export interface MeshInfo {
  uuid: string
  name: string
  cleanName: string
  system: string
}

export interface QuizQuestion {
  targetUuid: string
  targetSystem: string
  correctAnswer: string
  options: string[]
}

interface StoreState {
  // Common
  mode: AppMode
  setMode: (mode: AppMode) => void
  availableMeshes: MeshInfo[]
  setAvailableMeshes: (meshes: MeshInfo[]) => void
  
  // Explorer Status
  activeSystems: Set<string>
  toggleSystem: (sys: string) => void
  systemColors: Record<string, string>
  setSystemColors: (colors: Record<string, string>) => void
  lastClickedSystem: string | null
  setLastClickedSystem: (sys: string | null) => void

  // Quiz Status
  quizSettings: { systems: Set<string>; numQuestions: number }
  setQuizSettings: (settings: Partial<{ systems: Set<string>; numQuestions: number }>) => void
  quizState: {
    questions: QuizQuestion[]
    currentIndex: number
    score: number
    struggles: Record<string, number>
    feedback: 'pending' | 'correct' | 'incorrect'
  }
  startQuiz: () => void
  submitAnswer: (answer: string) => void
  nextQuestion: () => void
  exitQuiz: () => void
}

export const useStore = create<StoreState>((set, get) => ({
  mode: 'explorer',
  setMode: (mode) => set({ mode }),
  
  availableMeshes: [],
  setAvailableMeshes: (meshes) => set({ availableMeshes: meshes }),

  activeSystems: new Set(['Integumentary']),
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

  // Quiz defaults
  quizSettings: { systems: new Set([...SYSTEMS]), numQuestions: 10 },
  setQuizSettings: (settings) => set((state) => ({ 
    quizSettings: { ...state.quizSettings, ...settings } 
  })),

  quizState: {
    questions: [],
    currentIndex: 0,
    score: 0,
    struggles: {},
    feedback: 'pending'
  },

  startQuiz: () => {
    const { availableMeshes, quizSettings } = get()
    
    // Filter accessible meshes by those belonging to the systems selected in quiz settings
    const validMeshes = availableMeshes.filter(m => quizSettings.systems.has(m.system) && m.cleanName && m.cleanName !== "Anatomical Structure")
    
    // De-duplicate valid meshes by clean name to avoid a question where multiple meshes have same valid name
    const uniqueMeshes = Array.from(new Map(validMeshes.map(m => [m.cleanName, m])).values())

    // If there aren't enough unique meshes (need at least 4 for options), abort cleanly
    if (uniqueMeshes.length < 4) {
      alert("Not enough valid parts found in selected systems to build a quiz.")
      return
    }

    const newQuestions: QuizQuestion[] = []
    const numQ = Math.min(quizSettings.numQuestions, uniqueMeshes.length * 2)

    for (let i = 0; i < numQ; i++) {
      // Pick a random target
      const targetMesh = uniqueMeshes[Math.floor(Math.random() * uniqueMeshes.length)]
      
      // Pick 3 random wrong distractors
      const distractors = new Set<string>()
      while (distractors.size < 3) {
        const randomMesh = uniqueMeshes[Math.floor(Math.random() * uniqueMeshes.length)]
        if (randomMesh.cleanName !== targetMesh.cleanName) {
          distractors.add(randomMesh.cleanName)
        }
      }

      // Shuffle options
      const options = [targetMesh.cleanName, ...Array.from(distractors)]
      for (let j = options.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [options[j], options[k]] = [options[k], options[j]]
      }

      newQuestions.push({
        targetUuid: targetMesh.uuid,
        targetSystem: targetMesh.system,
        correctAnswer: targetMesh.cleanName,
        options
      })
    }

    set({ 
      mode: 'quiz_active', 
      quizState: {
        questions: newQuestions,
        currentIndex: 0,
        score: 0,
        struggles: {},
        feedback: 'pending'
      }
    })
  },

  submitAnswer: (answer) => {
    const state = get()
    const currentQ = state.quizState.questions[state.quizState.currentIndex]
    if (!currentQ) return

    const isCorrect = answer === currentQ.correctAnswer
    const newStruggles = { ...state.quizState.struggles }
    
    if (!isCorrect) {
      newStruggles[currentQ.targetSystem] = (newStruggles[currentQ.targetSystem] || 0) + 1
    }

    set({
      quizState: {
        ...state.quizState,
        score: isCorrect ? state.quizState.score + 1 : state.quizState.score,
        struggles: newStruggles,
        feedback: isCorrect ? 'correct' : 'incorrect'
      }
    })
  },

  nextQuestion: () => {
    const state = get()
    const nextIdx = state.quizState.currentIndex + 1
    
    if (nextIdx >= state.quizState.questions.length) {
      set({ mode: 'quiz_summary', quizState: { ...state.quizState, feedback: 'pending' } })
    } else {
      set({ quizState: { ...state.quizState, currentIndex: nextIdx, feedback: 'pending' } })
    }
  },

  exitQuiz: () => {
    set({ mode: 'explorer' })
  }
}))
