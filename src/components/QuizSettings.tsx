import { useStore, SYSTEMS } from '../store/useStore'

const SYSTEM_EMOJIS: Record<string, string> = {
  'Skeletal': '🦴',
  'Muscular': '💪',
  'Cardiovascular': '❤️',
  'Respiratory': '🫁',
  'Digestive': '🫃',
  'Nervous': '🧠',
  'Urinary': '🫘',
  'Reproductive': '🧬',
  'Endocrine': '💊',
  'Lymphatic': '🟢',
  'Integumentary': '🧴',
  'Special Senses': '👁️'
}

export default function QuizSettings() {
  const quizSettings = useStore(state => state.quizSettings)
  const setQuizSettings = useStore(state => state.setQuizSettings)
  const startQuiz = useStore(state => state.startQuiz)
  const exitQuiz = useStore(state => state.exitQuiz)

  const toggleSys = (sys: string) => {
    const newSys = new Set(quizSettings.systems)
    if (newSys.has(sys)) newSys.delete(sys)
    else newSys.add(sys)
    setQuizSettings({ systems: newSys })
  }

  return (
    <div className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300 p-4">
      <div className="bg-[#111] border border-zinc-800 rounded-2xl shadow-2xl p-5 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Configure Quiz</h2>
        <p className="text-sm md:text-base text-zinc-400 mb-6 md:mb-8">Select the anatomical systems and length of your quiz.</p>

        <h3 className="text-xs md:text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3 md:mb-4">Include Systems</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-6 md:mb-8">
          {SYSTEMS.map(sys => {
            const isSelected = quizSettings.systems.has(sys)
            return (
              <button
                key={sys}
                onClick={() => toggleSys(sys)}
                className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${
                  isSelected 
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-500' 
                    : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'border-amber-500 bg-amber-500' : 'border-zinc-600'}`}>
                  {isSelected && <span className="text-black text-xs font-bold leading-none">✓</span>}
                </div>
                <span>{SYSTEM_EMOJIS[sys]}</span>
                <span className="font-medium truncate">{sys}</span>
              </button>
            )
          })}
        </div>

        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Number of Questions</h3>
        <div className="flex gap-4 mb-10">
          {[10, 20, 30].map(num => (
            <button
              key={num}
              onClick={() => setQuizSettings({ numQuestions: num })}
              className={`flex-1 py-3 rounded-lg border font-medium transition-all ${
                quizSettings.numQuestions === num
                  ? 'border-amber-500 bg-amber-500 text-black'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              {num} Questions
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={exitQuiz}
            className="px-6 py-3 rounded-lg font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={startQuiz}
            disabled={quizSettings.systems.size === 0}
            className="px-8 py-3 rounded-lg font-bold bg-amber-500 hover:bg-amber-400 text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  )
}
