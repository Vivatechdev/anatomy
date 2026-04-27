import { Html, useProgress } from '@react-three/drei'

export default function LoadingScreen() {
  const { progress } = useProgress()
  
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/90 rounded-2xl border border-zinc-700 shadow-2xl backdrop-blur-md min-w-[300px]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold text-white mb-2 tracking-wide">Loading Anatomy Model...</h2>
        <div className="w-full bg-zinc-800 rounded-full h-3 mb-2 overflow-hidden relative">
          <div 
            className="bg-emerald-500 h-3 rounded-full transition-all duration-300 ease-out absolute left-0 top-0" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-zinc-400 font-mono text-sm">{progress.toFixed(1)}%</p>
      </div>
    </Html>
  )
}
