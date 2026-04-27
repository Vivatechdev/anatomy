import { useStore } from '../store/useStore'

export default function QuizSummary() {
  const quizState = useStore(state => state.quizState)
  const exitQuiz = useStore(state => state.exitQuiz)
  const setMode = useStore(state => state.setMode)
  
  const total = quizState.questions.length
  const score = quizState.score
  const percentage = Math.round((score / total) * 100) || 0
  
  // Calculate top struggled systems
  const struggledEntries = Object.entries(quizState.struggles).sort((a, b) => b[1] - a[1])
  const topStruggles = struggledEntries.slice(0, 2)

  let title = "Good Effort!"
  let color = "text-amber-500"
  if (percentage >= 90) { title = "Outstanding!"; color = "text-green-500" }
  else if (percentage >= 70) { title = "Great Job!"; color = "text-blue-500" }
  else if (percentage < 50) { title = "Keep Studying!"; color = "text-red-500" }

  return (
    <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur z-50 flex items-center justify-center animate-in zoom-in-95 duration-500 p-4">
      <div className="bg-[#111] border border-zinc-800 rounded-3xl shadow-2xl p-6 md:p-10 w-full max-w-lg flex flex-col items-center text-center max-h-[95vh] overflow-y-auto scrollbar-hide">
        
        <h2 className="text-xs md:text-sm font-bold tracking-widest uppercase text-zinc-500 mb-2">Quiz Complete</h2>
        <h1 className={`text-3xl md:text-4xl font-black mb-6 md:mb-8 ${color}`}>{title}</h1>

        {/* Circular Score Display */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-8 bg-zinc-900 rounded-full border-[6px] border-zinc-800 shadow-inner">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="transparent" strokeWidth="8" className="stroke-zinc-800" />
            <circle 
              cx="50" cy="50" r="46" 
              fill="transparent" 
              strokeWidth="8" 
              className={`stroke-current ${color}`}
              strokeDasharray={289}
              strokeDashoffset={289 - (289 * percentage) / 100}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-white">{percentage}%</span>
            <span className="text-zinc-500 font-medium">{score} / {total}</span>
          </div>
        </div>

        {/* Struggle Analysis */}
        {topStruggles.length > 0 ? (
          <div className="w-full bg-zinc-900/50 rounded-xl p-5 mb-8 border border-zinc-800/50">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3 flex items-center justify-center gap-2">
              ⚠️ Areas to Review
            </h3>
            <ul className="flex flex-col gap-2">
              {topStruggles.map(([sys, count]) => (
                <li key={sys} className="flex justify-between items-center text-sm">
                  <span className="text-zinc-300 font-medium">{sys}</span>
                  <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded font-mono font-bold">
                    -{count} errors
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="w-full bg-green-500/10 rounded-xl p-5 mb-8 border border-green-500/20 text-green-400 font-medium">
            Flawless run! Excellent mastery of all systems.
          </div>
        )}

        {/* Actions */}
        <div className="w-full flex gap-2 md:gap-3 flex-col sm:flex-row">
          <button 
            onClick={exitQuiz}
            className="flex-1 py-3 rounded-xl font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            Exit Quiz
          </button>
          <button 
            onClick={() => setMode('quiz_settings')}
            className="flex-1 py-3 rounded-xl font-bold text-black bg-amber-500 hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}
