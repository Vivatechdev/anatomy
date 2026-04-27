import { useEffect, useState } from 'react'
import { useStore, SYSTEMS } from '../store/useStore'

const SYSTEM_INFO: Record<string, {course: string}> = {
  'Skeletal': { course: 'CHE 104' },
  'Muscular': { course: 'CHE 104' },
  'Cardiovascular': { course: 'CHE 103' },
  'Respiratory': { course: 'CHE 104' },
  'Digestive': { course: 'CHE 104' },
  'Nervous': { course: 'CHE 104 + 202' },
  'Urinary': { course: 'CHE 104' },
  'Reproductive': { course: 'CHE 104 + 201' },
  'Endocrine': { course: 'CHE 104' },
  'Lymphatic': { course: 'CHE 103' },
  'Integumentary': { course: 'CHE 104' },
  'Special Senses': { course: 'CHE 104 + 202' }
}

export default function QuizPanel() {
  const quizState = useStore(state => state.quizState)
  const submitAnswer = useStore(state => state.submitAnswer)
  const nextQuestion = useStore(state => state.nextQuestion)
  
  const currentQ = quizState.questions[quizState.currentIndex]
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  useEffect(() => {
    if (quizState.feedback !== 'pending') {
      const timer = setTimeout(() => {
        setSelectedOption(null)
        nextQuestion()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [quizState.feedback, nextQuestion])

  if (!currentQ) return null

  return (
    <div className="absolute top-auto bottom-4 left-1/2 -translate-x-1/2 md:top-1/2 md:bottom-auto md:translate-x-0 md:-translate-y-1/2 md:left-auto md:right-6 w-[calc(100vw-2rem)] md:w-[340px] z-10 flex flex-col gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-8 md:slide-in-from-right-8 duration-300">
      
      {/* Score Header */}
      <div className="bg-[#0a0a0a]/90 backdrop-blur border border-amber-500/30 rounded-xl p-2 md:p-3 shadow-[0_0_15px_rgba(245,158,11,0.1)] flex justify-between items-center">
        <span className="text-amber-500 font-bold tracking-wide uppercase text-[10px] md:text-xs">Quiz Active</span>
        <span className="bg-amber-500/10 text-amber-500 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-mono font-bold">
          Score: {quizState.score} / {quizState.currentIndex}
        </span>
      </div>

      {/* Question Card */}
      <div className="bg-[#0a0a0a]/90 backdrop-blur border border-zinc-800 rounded-xl p-4 md:p-5 shadow-2xl flex flex-col">
        <div className="flex justify-between items-center mb-1 text-xs md:text-sm font-medium text-zinc-500">
          <span>Question {quizState.currentIndex + 1} of {quizState.questions.length}</span>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 leading-snug">What is the highlighted structure?</h3>

        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
          {currentQ.options.map(opt => {
            const isSelected = selectedOption === opt
            const isCorrectAnswer = opt === currentQ.correctAnswer
            
            let btnClass = "border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-200" // default Default
            
            if (quizState.feedback !== 'pending') {
              if (isCorrectAnswer) {
                btnClass = "border-green-500 bg-green-500/20 text-green-400"
              } else if (isSelected) {
                btnClass = "border-red-500 bg-red-500/20 text-red-400"
              } else {
                btnClass = "border-zinc-800 bg-zinc-900 text-zinc-600" // dim others
              }
            } else if (isSelected) {
              btnClass = "border-amber-500 bg-amber-500/20 text-amber-500" // Just in case, though it evaluates instantly
            }

            return (
              <button
                key={opt}
                disabled={quizState.feedback !== 'pending'}
                onClick={() => {
                  setSelectedOption(opt)
                  submitAnswer(opt)
                }}
                className={`p-2.5 md:p-3 rounded-lg border text-left font-medium transition-all text-xs md:text-base md:text-sm ${btnClass}`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>

      {/* Feedback Banner */}
      {quizState.feedback !== 'pending' && (
        <div className={`p-4 rounded-xl border backdrop-blur animate-in slide-in-from-bottom-2 ${
          quizState.feedback === 'correct' 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {quizState.feedback === 'correct' ? (
            <div>
              <div className="font-bold text-lg mb-1 flex items-center gap-2">
                ✅ Correct!
              </div>
              <div className="text-sm opacity-90 mt-2 flex flex-col gap-1">
                <span>System: <strong className="text-white">{currentQ.targetSystem}</strong></span>
                <span>Course: <strong className="text-white">{SYSTEM_INFO[currentQ.targetSystem]?.course || 'General'}</strong></span>
              </div>
            </div>
          ) : (
            <div>
              <div className="font-bold text-lg mb-1 flex items-center gap-2">
                ❌ Incorrect
              </div>
              <div className="text-sm mt-2 opacity-90">
                The correct answer was <br/><strong className="text-white text-base block mt-1">{currentQ.correctAnswer}</strong>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
