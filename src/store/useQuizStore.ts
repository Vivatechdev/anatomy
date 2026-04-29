import { create } from 'zustand'
import anatomyNamesData from '../anatomy-names.json'
const anatomyNames: Record<string, string> = anatomyNamesData as Record<string, string>

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

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface Question {
  targetUuid: string
  targetSystem: string
  correctAnswer: string
  options: string[]
}

export interface AnsweredQuestion {
  questionNumber: number
  targetSystem: string
  correctAnswer: string
  userAnswer: string
  isCorrect: boolean
}

export interface QuizSettings {
  systems: string[]
  questionCount: number
  difficulty: Difficulty
}

interface QuizState {
  quizActive: boolean
  quizSettings: QuizSettings
  questionBank: Question[]
  currentQuestionIndex: number
  currentQuestion: Question | null
  selectedAnswer: string | null
  isAnswerRevealed: boolean
  timeRemaining: number
  scores: { correct: number; wrong: number; skipped: number }
  answeredQuestions: AnsweredQuestion[]
  quizComplete: boolean
  quizError: string | null

  // Actions
  clearQuizError: () => void
  startQuizSetup: () => void
  setSettings: (settings: Partial<QuizSettings>) => void
  generateQuestionBank: (allMeshes: { uuid: string, name: string, system: string, cleanName: string }[]) => void
  answerQuestion: (answer: string | null) => void // null means timeout
  tickTimer: () => void
  nextQuestion: () => void
  restartQuiz: () => void
  exitQuiz: () => void
}

export const useQuizStore = create<QuizState>((set, get) => ({
  quizActive: false,
  quizSettings: {
    systems: [...SYSTEMS],
    questionCount: 10,
    difficulty: 'Medium'
  },
  questionBank: [],
  currentQuestionIndex: 0,
  currentQuestion: null,
  selectedAnswer: null,
  isAnswerRevealed: false,
  timeRemaining: 30,
  scores: { correct: 0, wrong: 0, skipped: 0 },
  answeredQuestions: [],
  quizComplete: false,
  quizError: null,

  clearQuizError: () => set({ quizError: null }),

  startQuizSetup: () => {
    set({
      quizActive: true,
      quizComplete: false,
      quizError: null,
      questionBank: [],
      currentQuestionIndex: 0,
      currentQuestion: null,
      scores: { correct: 0, wrong: 0, skipped: 0 },
      answeredQuestions: []
    })
  },

  setSettings: (settings) => set((state) => ({ quizSettings: { ...state.quizSettings, ...settings } })),

  generateQuestionBank: (allMeshes) => {
    const { quizSettings } = get()
    
    // 1. Clean names and filter
    const validMeshes: { uuid: string, system: string, cleanName: string }[] = []
    for (const m of allMeshes) {
       if (!quizSettings.systems.includes(m.system)) continue

       let clean = "";
       // Try map first
       if (anatomyNames[m.name] && anatomyNames[m.name] !== "Scene Collection") {
         clean = anatomyNames[m.name];
       } else if (m.cleanName) {
         clean = m.cleanName;
       } else {
         // Soft cleanup
         clean = m.name.replace(/^Fj/i, '').replace(/_/g, ' ').trim()
         
         // Capitalize
         clean = clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ').trim()
       }
       
       // Accept any mesh >= 1 char
       if (clean.length < 1) continue
       
       validMeshes.push({
         uuid: m.uuid,
         system: m.system,
         cleanName: clean
       })
    }
    
    // Ensure uniqueness by cleanName (so we don't have dupes)
    const uniqueMeshes = Array.from(new Map(validMeshes.map(m => [m.cleanName, m])).values())

    if (uniqueMeshes.length < 4) {
      set({ quizError: "Please select more systems" });
      return
    }

    // Determine target amount
    const numQ = Math.min(quizSettings.questionCount, uniqueMeshes.length)

    // Shuffle pool for targets
    const shuffledTargets = [...uniqueMeshes].sort(() => 0.5 - Math.random())

    const questions: Question[] = []

    for (let i = 0; i < numQ; i++) {
       const target = shuffledTargets[i]
       
       // Build distractors
       const numOptions = quizSettings.difficulty === 'Hard' ? 6 : 4
       let pool = uniqueMeshes
       
       if (quizSettings.difficulty === 'Easy') {
         // Parts from same system
         pool = uniqueMeshes.filter(m => m.system === target.system)
         if (pool.length < numOptions) {
           // fallback to all if a system is too tiny
           pool = uniqueMeshes
         }
       }

       const distractors = new Set<string>()
       // Filter out the target clean name
       const distractorPool = pool.map(m => m.cleanName).filter(name => name !== target.cleanName)
       const shuffledDistractors = distractorPool.sort(() => 0.5 - Math.random())
       
       for (const name of shuffledDistractors) {
          if (distractors.size === numOptions - 1) break;
          distractors.add(name)
       }

       const options = [target.cleanName, ...Array.from(distractors)]
       // Shuffle options
       options.sort(() => 0.5 - Math.random())
       
       questions.push({
         targetUuid: target.uuid,
         targetSystem: target.system,
         correctAnswer: target.cleanName,
         options
       })
    }

    set({ 
      questionBank: questions,
      currentQuestionIndex: 0,
      currentQuestion: questions[0],
      timeRemaining: 30,
      isAnswerRevealed: false,
      selectedAnswer: null,
      quizComplete: false,
      quizError: null
    })
  },

  answerQuestion: (answer) => {
    const state = get()
    if (state.isAnswerRevealed || !state.currentQuestion) return

    const { currentQuestion, currentQuestionIndex } = state
    const isTimeout = answer === null
    const isCorrect = answer === currentQuestion.correctAnswer

    let newCorrect = state.scores.correct
    let newWrong = state.scores.wrong
    let newSkipped = state.scores.skipped

    if (isTimeout) {
       newSkipped += 1
    } else if (isCorrect) {
       newCorrect += 1
    } else {
       newWrong += 1
    }

    const answeredQ: AnsweredQuestion = {
      questionNumber: currentQuestionIndex + 1,
      targetSystem: currentQuestion.targetSystem,
      correctAnswer: currentQuestion.correctAnswer,
      userAnswer: answer || "Time's up",
      isCorrect
    }

    set({
      isAnswerRevealed: true,
      selectedAnswer: answer,
      scores: { correct: newCorrect, wrong: newWrong, skipped: newSkipped },
      answeredQuestions: [...state.answeredQuestions, answeredQ]
    })
  },

  tickTimer: () => {
    set(state => {
      if (state.isAnswerRevealed || state.timeRemaining <= 0 || !state.currentQuestion) return state
      return { timeRemaining: Math.max(0, state.timeRemaining - 1) }
    })
  },

  nextQuestion: () => {
    const state = get()
    const nextIdx = state.currentQuestionIndex + 1
    if (nextIdx >= state.questionBank.length) {
      set({ quizComplete: true, currentQuestion: null })
      // Notice: quizActive remains true until exit
    } else {
      set({
        currentQuestionIndex: nextIdx,
        currentQuestion: state.questionBank[nextIdx],
        isAnswerRevealed: false,
        selectedAnswer: null,
        timeRemaining: 30
      })
    }
  },

  restartQuiz: () => {
    set(() => ({
      quizComplete: false,
      questionBank: [],
      currentQuestionIndex: 0,
      currentQuestion: null,
      scores: { correct: 0, wrong: 0, skipped: 0 },
      answeredQuestions: []
    }))
  },

  exitQuiz: () => {
    set({
      quizActive: false,
      quizComplete: false,
      questionBank: [],
      currentQuestion: null
    })
  }
}))
