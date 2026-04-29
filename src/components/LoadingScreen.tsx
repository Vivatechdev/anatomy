import { Html, useProgress } from '@react-three/drei'

export default function LoadingScreen() {
  const { progress, errors } = useProgress()
  
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/90 rounded-2xl border border-zinc-700 shadow-2xl backdrop-blur-md min-w-[300px]">
        {errors.length === 0 ? (
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        ) : (
          <div className="w-12 h-12 border-4 border-red-500 rounded-full mb-6 flex items-center justify-center text-red-500 font-bold">!</div>
        )}
        <h2 className="text-xl font-bold text-white mb-2 tracking-wide">
          {errors.length === 0 ? "Loading Anatomy Model..." : "Error Loading Model"}
        </h2>
        <div className="w-full bg-zinc-800 rounded-full h-3 mb-2 overflow-hidden relative">
          <div 
            className={`${errors.length === 0 ? 'bg-emerald-500' : 'bg-red-500'} h-3 rounded-full transition-all duration-300 ease-out absolute left-0 top-0`} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-zinc-400 font-mono text-sm">{progress.toFixed(1)}%</p>
        
        {errors.length > 0 && (
          <div className="mt-4 p-2 bg-red-500/10 text-red-400 text-xs rounded-md border border-red-500/20 max-w-[250px] text-center">
            {errors.join(", ")}
            <div className="mt-2 text-[10px] text-zinc-500">Please refresh the page to try again.</div>
          </div>
        )}
      </div>
    </Html>
  )
}
