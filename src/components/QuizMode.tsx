import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { useQuizStore, SYSTEMS } from '../store/useQuizStore'
import type { Difficulty } from '../store/useQuizStore'

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

const SYSTEM_COURSES: Record<string, string> = {
  'Skeletal': 'CHE 104',
  'Muscular': 'CHE 104',
  'Cardiovascular': 'CHE 103',
  'Respiratory': 'CHE 104',
  'Digestive': 'CHE 104',
  'Nervous': 'CHE 104 + CHE 202',
  'Urinary': 'CHE 104',
  'Reproductive': 'CHE 104 + CHE 201',
  'Endocrine': 'CHE 104',
  'Lymphatic': 'CHE 103',
  'Integumentary': 'CHE 104',
  'Special Senses': 'CHE 104 + CHE 202'
}

export default function QuizMode() {
  const quizActive = useQuizStore(s => s.quizActive)
  const quizSettings = useQuizStore(s => s.quizSettings)
  const currentQuestion = useQuizStore(s => s.currentQuestion)
  const quizComplete = useQuizStore(s => s.quizComplete)
  const quizError = useQuizStore(s => s.quizError)
  
  const setSettings = useQuizStore(s => s.setSettings)
  const clearQuizError = useQuizStore(s => s.clearQuizError)
  const generateQuestionBank = useQuizStore(s => s.generateQuestionBank)
  const exitQuiz = useQuizStore(s => s.exitQuiz)

  const availableMeshes = useStore(s => s.availableMeshes)

  if (!quizActive) return null

  if (!currentQuestion && !quizComplete) {
    // Phase 1: Settings
    return (
      <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300 p-4">
        <div className="bg-[#111] border border-zinc-800 rounded-2xl shadow-2xl p-6 md:p-10 w-full max-w-3xl max-h-[95vh] overflow-y-auto scrollbar-hide">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2 text-center tracking-tight">Quiz Settings</h1>
          <p className="text-zinc-400 text-center mb-8">Configure your anatomy test parameters.</p>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Select Body Systems</h3>
            <button 
              onClick={() => {
                const sys = quizSettings.systems.length === SYSTEMS.length ? [] : [...SYSTEMS]
                setSettings({ systems: sys })
                clearQuizError()
              }}
              className="text-xs text-amber-500 hover:text-amber-400 font-medium bg-amber-500/10 px-3 py-1 rounded"
            >
              {quizSettings.systems.length === SYSTEMS.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {SYSTEMS.map(sys => {
              const isSelected = quizSettings.systems.includes(sys)
              return (
                <button
                  key={sys}
                  onClick={() => {
                    const newSys = isSelected 
                      ? quizSettings.systems.filter(s => s !== sys)
                      : [...quizSettings.systems, sys]
                    setSettings({ systems: newSys })
                    clearQuizError()
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-sm transition-all focus:outline-none ${
                    isSelected 
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-500 shadow-sm' 
                      : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'border-amber-500 bg-amber-500' : 'border-zinc-600 bg-[#111]'}`}>
                    {isSelected && <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-lg leading-none">{SYSTEM_EMOJIS[sys]}</span>
                  <span className="font-semibold truncate">{sys}</span>
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">Number of Questions</h3>
              <div className="flex gap-3">
                {[10, 20, 30].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      setSettings({ questionCount: num })
                      clearQuizError()
                    }}
                    className={`flex-1 py-3 rounded-xl border font-bold transition-all focus:outline-none ${
                      quizSettings.questionCount === num
                        ? 'border-amber-500 bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">Difficulty</h3>
              <div className="flex gap-3">
                {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(diff => (
                  <button
                    key={diff}
                    onClick={() => {
                      setSettings({ difficulty: diff })
                      clearQuizError()
                    }}
                    className={`flex-1 py-3 rounded-xl border font-bold transition-all focus:outline-none ${
                      quizSettings.difficulty === diff
                        ? 'border-amber-500 bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-2 text-center h-4">
                {quizSettings.difficulty === 'Easy' && "Options are from same system (4 total)"}
                {quizSettings.difficulty === 'Medium' && "Options are from any system (4 total)"}
                {quizSettings.difficulty === 'Hard' && "Options are from any system (6 total)"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-1">
              {quizError && (
                <div className="text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg text-sm font-semibold animate-in fade-in slide-in-from-bottom-2">
                  ⚠️ {quizError}
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={exitQuiz}
                className="px-8 py-4 rounded-xl font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button 
                onClick={() => generateQuestionBank(availableMeshes)}
                disabled={quizSettings.systems.length === 0}
                className="px-10 py-4 rounded-xl font-black bg-amber-500 hover:bg-amber-400 text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98] focus:outline-none text-lg"
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (quizComplete) {
    // Phase 3: Results
    return <QuizSummaryView />
  }

  // Phase 2: Active Quiz
  return <ActiveQuizView />
}

function ActiveQuizView() {
  const currentQuestionIndex = useQuizStore(s => s.currentQuestionIndex)
  const questionBank = useQuizStore(s => s.questionBank)
  const currentQuestion = useQuizStore(s => s.currentQuestion)
  const scores = useQuizStore(s => s.scores)
  const timeRemaining = useQuizStore(s => s.timeRemaining)
  const selectedAnswer = useQuizStore(s => s.selectedAnswer)
  const isAnswerRevealed = useQuizStore(s => s.isAnswerRevealed)
  
  const tickTimer = useQuizStore(s => s.tickTimer)
  const answerQuestion = useQuizStore(s => s.answerQuestion)
  const nextQuestion = useQuizStore(s => s.nextQuestion)

  const [transitioning, setTransitioning] = useState(false)

  // Timer tick
  useEffect(() => {
    if (isAnswerRevealed || transitioning) return
    const interval = setInterval(() => tickTimer(), 1000)
    return () => clearInterval(interval)
  }, [isAnswerRevealed, transitioning, tickTimer])

  // Timer expiration trigger
  useEffect(() => {
    if (timeRemaining === 0 && !isAnswerRevealed && !transitioning) {
      answerQuestion(null)
    }
  }, [timeRemaining, isAnswerRevealed, transitioning, answerQuestion])

  // Auto-advance logic
  useEffect(() => {
    if (isAnswerRevealed && !transitioning) {
      const waitTime = selectedAnswer === currentQuestion?.correctAnswer ? 2000 : 2500
      
      const timer = setTimeout(() => {
        setTransitioning(true)
        setTimeout(() => {
          nextQuestion()
          setTransitioning(false)
        }, 1000) // 1 second blank transition
      }, waitTime)
      
      return () => clearTimeout(timer)
    }
  }, [isAnswerRevealed, selectedAnswer, currentQuestion, nextQuestion, transitioning])

  if (transitioning) {
    const isLastQuestion = currentQuestionIndex === questionBank.length - 1
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
        <h2 className="text-3xl md:text-5xl font-black text-white bg-black/80 px-8 py-4 rounded-3xl backdrop-blur-md animate-pulse">
          {isLastQuestion ? 'Calculating Results...' : 'Next Question...'}
        </h2>
      </div>
    )
  }

  if (!currentQuestion) return null

  const progress = ((currentQuestionIndex) / questionBank.length) * 100
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between">
      {/* Top HUD */}
      <div>
        <div className="w-full bg-zinc-900/80 backdrop-blur border-b border-zinc-800 flex items-center justify-between px-6 py-4 shadow-lg shrink-0 pointer-events-auto">
          <div className="flex flex-col gap-1 w-1/3">
            <span className="text-zinc-400 font-bold text-sm tracking-wider uppercase">Question {currentQuestionIndex + 1} of {questionBank.length}</span>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          
          <div className="flex justify-center items-center pointer-events-auto">
             <div className="relative w-16 h-16 flex items-center justify-center bg-[#0a0a0a] rounded-full border border-zinc-800 shadow-inner">
               <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="46" fill="transparent" strokeWidth="8" className="stroke-zinc-800" />
                 <circle 
                   cx="50" cy="50" r="46" 
                   fill="transparent" 
                   strokeWidth="8" 
                   className={`stroke-amber-500 transition-all duration-1000 ease-linear`}
                   strokeDasharray={289}
                   strokeDashoffset={isAnswerRevealed ? 289 : 289 - (289 * timeRemaining) / 30}
                   strokeLinecap="round"
                 />
               </svg>
               <span className={`text-xl font-black ${timeRemaining <= 5 && !isAnswerRevealed ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                 {timeRemaining}
               </span>
             </div>
          </div>

          <div className="flex bg-[#111] border border-zinc-800 rounded-xl p-1 shadow-inner items-center pointer-events-auto w-1/3 justify-end gap-4 ml-auto px-4 max-w-fit">
            <div className="flex items-center gap-2"><span className="text-xl">✅</span><span className="font-bold text-green-500">{scores.correct}</span></div>
            <div className="w-px h-6 bg-zinc-800" />
            <div className="flex items-center gap-2"><span className="text-xl">❌</span><span className="font-bold text-red-500">{scores.wrong}</span></div>
          </div>
        </div>
      </div>

      {/* Center Toast */}
      {isAnswerRevealed && (
         <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto w-full px-4 flex justify-center z-50">
           <div className={`px-8 py-5 rounded-2xl backdrop-blur-md border shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 fade-in duration-300 max-w-xl ${
             selectedAnswer === null 
               ? 'bg-zinc-900/90 border-red-500/50 shadow-[#ef444433]' 
               : isCorrect 
                 ? 'bg-green-900/90 border-green-500/50 shadow-[#22c55e33]' 
                 : 'bg-zinc-900/90 border-red-500/50 shadow-[#ef444433]'
           }`}>
             <div className="text-3xl mb-2">
               {selectedAnswer === null ? '⏰' : isCorrect ? '🎉' : '❌'}
             </div>
             <h2 className={`text-2xl font-black mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
               {selectedAnswer === null ? "Time's up!" : isCorrect ? "Correct!" : "Incorrect"}
             </h2>
             {isCorrect ? (
               <p className="text-zinc-200 text-lg">
                 This is the <strong className="text-white">{currentQuestion.correctAnswer}</strong> — part of the <strong className="text-amber-400">{currentQuestion.targetSystem}</strong> system — covered in <strong className="font-mono bg-black/30 px-2 py-0.5 rounded">{SYSTEM_COURSES[currentQuestion.targetSystem] || 'General'}</strong>.
               </p>
             ) : (
               <p className="text-zinc-200 text-lg">
                 The correct answer was <strong className="text-white bg-black/30 px-3 py-1 rounded ml-1">{currentQuestion.correctAnswer}</strong>.
               </p>
             )}
           </div>
         </div>
      )}

      {/* Bottom Panel */}
      <div className="pb-6 px-4 md:px-12 flex flex-col items-center shrink-0 pointer-events-auto w-full max-w-5xl mx-auto">
        <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl w-full">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-6 text-center shadow-black drop-shadow-md">What is this highlighted structure?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
             {currentQuestion.options.map(opt => {
                const isSelected = selectedAnswer === opt
                const isActualCorrect = opt === currentQuestion.correctAnswer
                
                let baseStyle = "border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 hover:text-white hover:scale-[1.01]"
                
                if (isAnswerRevealed) {
                  if (isSelected && isActualCorrect) {
                     baseStyle = "border-green-500 bg-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                  } else if (isSelected && !isActualCorrect) {
                     baseStyle = "border-red-500 bg-red-500/20 text-red-400 opacity-60"
                  } else if (isActualCorrect) {
                     baseStyle = "border-green-500 bg-green-500/20 text-green-400 animate-pulse border-2"
                  } else {
                     baseStyle = "border-zinc-900 bg-black/40 text-zinc-700 opacity-30"
                  }
                }

                return (
                  <button
                    key={opt}
                    onClick={() => answerQuestion(opt)}
                    disabled={isAnswerRevealed}
                    className={`p-4 md:p-5 rounded-2xl border-2 text-center text-lg md:text-xl font-bold transition-all active:scale-[0.98] focus:outline-none ${baseStyle} ${isAnswerRevealed ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-center gap-3">
                       <span className="truncate">{opt}</span>
                       {isAnswerRevealed && isSelected && isActualCorrect && <span>✅</span>}
                       {isAnswerRevealed && isSelected && !isActualCorrect && <span>❌</span>}
                    </div>
                  </button>
                )
             })}
          </div>
        </div>
      </div>
    </div>
  )
}

function QuizSummaryView() {
  const scores = useQuizStore(s => s.scores)
  const questionBank = useQuizStore(s => s.questionBank)
  const answeredQuestions = useQuizStore(s => s.answeredQuestions)
  const restartQuiz = useQuizStore(s => s.restartQuiz)
  const exitQuiz = useQuizStore(s => s.exitQuiz)
  const startQuizSetup = useQuizStore(s => s.startQuizSetup)

  const total = questionBank.length
  const percentage = Math.round((scores.correct / total) * 100) || 0

  let title = "Needs more study"
  let color = "text-red-500"
  let strokeColor = "stroke-red-500"
  
  if (percentage >= 80) { title = "Excellent! 🎉"; color = "text-green-500"; strokeColor = "stroke-green-500" }
  else if (percentage >= 60) { title = "Good effort! 👍"; color = "text-amber-500"; strokeColor = "stroke-amber-500" }
  else if (percentage >= 40) { title = "Keep practicing! 💪"; color = "text-orange-500"; strokeColor = "stroke-orange-500" }

  // Calculate weak systems
  const sysStats: Record<string, { correct: number, wrong: number }> = {}
  answeredQuestions.forEach(q => {
     if (!sysStats[q.targetSystem]) sysStats[q.targetSystem] = { correct: 0, wrong: 0 }
     if (q.isCorrect) sysStats[q.targetSystem].correct += 1
     else sysStats[q.targetSystem].wrong += 1
  })

  const sortedSys = Object.entries(sysStats).map(([sys, stat]) => {
     const totalSys = stat.correct + stat.wrong
     const pct = stat.correct / totalSys
     return { sys, stat, pct }
  }).sort((a, b) => a.pct - b.pct)

  const weakest = sortedSys.length > 0 ? sortedSys[0] : null
  const showWeakest = weakest && weakest.stat.wrong > 0

  return (
    <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl z-50 overflow-y-auto scrollbar-hide py-12 px-4 animate-in zoom-in-95 duration-500 flex justify-center">
       <div className="w-full max-w-4xl bg-[#111] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-max relative">
          
          {/* Header */}
          <div className="p-10 border-b border-zinc-800 bg-zinc-900/30 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="flex flex-col text-center md:text-left gap-2">
               <h2 className="text-sm font-bold tracking-widest uppercase text-zinc-500">Quiz Complete! 🎉</h2>
               <h1 className={`text-5xl font-black ${color}`}>{title}</h1>
               <div className="text-2xl font-bold bg-zinc-800 inline-block px-4 py-2 rounded-xl text-zinc-300 self-center md:self-start mt-2 border border-zinc-700 shadow-inner">
                 Score: {scores.correct} / {total}
               </div>
             </div>

             <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center bg-[#0a0a0a] rounded-full border-[8px] border-zinc-800 shadow-inner">
               <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="46" fill="transparent" strokeWidth="8" className="stroke-zinc-800" />
                 <circle 
                   cx="50" cy="50" r="46" 
                   fill="transparent" 
                   strokeWidth="8" 
                   className={`${strokeColor} transition-all duration-1000 ease-out delay-500`}
                   strokeDasharray={289}
                   strokeDashoffset={289 - (289 * percentage) / 100}
                   strokeLinecap="round"
                 />
               </svg>
               <span className="text-4xl font-black text-white">{percentage}%</span>
             </div>
          </div>

          <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Systems Analysis */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <h3 className="text-xl font-bold text-white mb-2">Systems Performance</h3>
              <div className="flex flex-col gap-3">
                 {sortedSys.map(({sys, stat, pct}) => (
                    <div key={sys} className="flex justify-between items-center text-sm border-b border-zinc-800/50 pb-2">
                       <span className="text-zinc-300 font-medium">{sys}</span>
                       <span className={`${pct >= 0.8 ? 'text-green-400' : pct >= 0.5 ? 'text-amber-400' : 'text-red-400'} font-bold font-mono`}>
                         {stat.correct}/{stat.correct + stat.wrong}
                       </span>
                    </div>
                 ))}
                 {showWeakest && (
                    <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                       <p className="text-red-400 text-sm font-bold text-center">Focus more on {weakest.sys}</p>
                    </div>
                 )}
              </div>
            </div>

            {/* Right Col: Question Breakdown */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold text-white mb-4">Breakdown</h3>
              <div className="overflow-x-auto rounded-xl border border-zinc-800 shadow-inner max-h-[400px] overflow-y-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="bg-[#0a0a0a] text-zinc-500 uppercase font-semibold sticky top-0 z-10 text-xs border-b border-zinc-800">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3 min-w-[120px]">Target</th>
                      <th className="px-4 py-3 min-w-[120px]">Your Answer</th>
                      <th className="px-4 py-3 text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 bg-[#111]">
                    {answeredQuestions.map(q => (
                       <tr key={q.questionNumber} className="hover:bg-zinc-900/50 transition-colors">
                          <td className="px-4 py-4 font-mono">{q.questionNumber}</td>
                          <td className="px-4 py-4 font-medium text-white">{q.correctAnswer} <span className="block text-[10px] text-amber-500 uppercase tracking-widest mt-0.5">{q.targetSystem}</span></td>
                          <td className={`px-4 py-4 font-bold ${q.isCorrect ? 'text-green-400' : 'text-red-400'}`}>{q.userAnswer}</td>
                          <td className="px-4 py-4 text-center text-lg">{q.isCorrect ? '✅' : '❌'}</td>
                       </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-zinc-800 bg-[#0a0a0a] flex flex-col sm:flex-row justify-end gap-4 mt-auto">
             <button 
                onClick={exitQuiz}
                className="px-8 py-3 rounded-xl font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors focus:outline-none"
             >
                Exit to Explorer
             </button>
             <button 
                onClick={() => {
                   restartQuiz()
                   startQuizSetup()
                }}
                className="px-10 py-3 rounded-xl font-black bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-colors focus:outline-none"
             >
                Try Again
             </button>
          </div>
       </div>
    </div>
  )
}
