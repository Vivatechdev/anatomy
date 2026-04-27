import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, N8AO } from '@react-three/postprocessing'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import AnatomyModel from './components/AnatomyModel'
import LoadingScreen from './components/LoadingScreen'
import { useStore, SYSTEMS } from './store/useStore'

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

const SYSTEM_INFO: Record<string, {course: string, description: string}> = {
  'Skeletal': { course: 'CHE 104', description: 'Bones, cartilage, ligaments and joints supporting the body' },
  'Muscular': { course: 'CHE 104', description: 'Muscles enabling movement and posture' },
  'Cardiovascular': { course: 'CHE 103', description: 'Heart and blood vessels circulating blood' },
  'Respiratory': { course: 'CHE 104', description: 'Airways and lungs enabling breathing' },
  'Digestive': { course: 'CHE 104', description: 'Organs breaking down food from mouth to anus' },
  'Nervous': { course: 'CHE 104 + CHE 202', description: 'Brain, spinal cord and nerves controlling body functions' },
  'Urinary': { course: 'CHE 104', description: 'Kidneys and bladder filtering and excreting waste' },
  'Reproductive': { course: 'CHE 104 + CHE 201', description: 'Male and female organs of reproduction' },
  'Endocrine': { course: 'CHE 104', description: 'Glands secreting hormones regulating body functions' },
  'Lymphatic': { course: 'CHE 103', description: 'Lymph nodes and vessels supporting immunity' },
  'Integumentary': { course: 'CHE 104', description: 'Skin, hair and nails protecting the body' },
  'Special Senses': { course: 'CHE 104 + CHE 202', description: 'Eyes, ears, nose and tongue for sensory perception' }
}

import QuizSettings from './components/QuizSettings'
import QuizPanel from './components/QuizPanel'
import QuizSummary from './components/QuizSummary'

function App() {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  
  const [gender, setGender] = useState<'male' | 'female'>('male')

  const mode = useStore((state) => state.mode)
  const setMode = useStore((state) => state.setMode)
  const exitQuiz = useStore((state) => state.exitQuiz)

  const activeSystems = useStore((state) => state.activeSystems)
  const toggleSystem = useStore((state) => state.toggleSystem)
  const systemColors = useStore((state) => state.systemColors)
  const lastClickedSystem = useStore((state) => state.lastClickedSystem)

  const handleRotate = (dir: 'up' | 'down' | 'left' | 'right') => {
    if (!controlsRef.current) return;
    const step = Math.PI / 8;
    if (dir === 'left') {
      controlsRef.current.setAzimuthalAngle(controlsRef.current.getAzimuthalAngle() - step);
    } else if (dir === 'right') {
      controlsRef.current.setAzimuthalAngle(controlsRef.current.getAzimuthalAngle() + step);
    } else if (dir === 'up') {
      controlsRef.current.setPolarAngle(controlsRef.current.getPolarAngle() - step);
    } else if (dir === 'down') {
      controlsRef.current.setPolarAngle(controlsRef.current.getPolarAngle() + step);
    }
    controlsRef.current.update();
  };

  const handleZoom = (dir: 'in' | 'out') => {
    if (!controlsRef.current) return;
    const object = controlsRef.current.object;
    const target = controlsRef.current.target;
    const vec = object.position.clone().sub(target);
    
    const factor = dir === 'in' ? 0.8 : 1.25;
    vec.multiplyScalar(factor);
    
    const dist = vec.length();
    if (dist < controlsRef.current.minDistance) vec.setLength(controlsRef.current.minDistance);
    if (dist > controlsRef.current.maxDistance) vec.setLength(controlsRef.current.maxDistance);
    
    object.position.copy(target).add(vec);
    controlsRef.current.update();
  };

  const handleReset = () => {
    if (!controlsRef.current) return;
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.object.position.set(0, 0, 4);
    controlsRef.current.update();
  };

  useEffect(() => {
    const handleWheelCapture = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      if (controlsRef.current) {
        e.stopPropagation();
        e.preventDefault();
        
        const distance = controlsRef.current.object.position.distanceTo(controlsRef.current.target);
        const panSpeed = distance * 0.001; 
        
        const target = controlsRef.current.target;
        const object = controlsRef.current.object;
        
        target.y -= e.deltaY * panSpeed;
        object.position.y -= e.deltaY * panSpeed;
        
        const minY = -1.2;
        const maxY = 1.0;
        if (target.y < minY) {
          const diff = minY - target.y;
          target.y += diff;
          object.position.y += diff;
        }
        if (target.y > maxY) {
          const diff = target.y - maxY;
          target.y -= diff;
          object.position.y -= diff;
        }

        controlsRef.current.update();
      }
    };

    const container = document.getElementById('canvas-container');
    if (container) {
      container.addEventListener('wheel', handleWheelCapture, { capture: true, passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheelCapture, { capture: true });
      }
    };
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-b from-[#050510] to-[#0a0a1a] overflow-hidden">
      {/* Navigation */}
      <nav className="h-16 flex-none bg-[#0a0a0a]/50 backdrop-blur border-b border-zinc-800/80 px-4 md:px-6 flex items-center justify-between shadow-md z-10 relative">
        <h1 className="text-white font-bold text-xl md:text-2xl tracking-wide">
          Viva Anatomy
        </h1>
        
        <div className={`hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2 bg-zinc-800/50 px-4 py-1.5 rounded-full border text-sm font-medium ${
          mode === 'explorer' 
            ? 'border-zinc-700/50 text-zinc-300' 
            : 'border-amber-500/50 text-amber-500 bg-amber-500/10'
        }`}>
          {mode === 'explorer' ? 'Explorer Mode' : 'Quiz Mode'}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {mode === 'explorer' && (
            <div className="flex bg-[#111] rounded-lg p-1 border border-zinc-800 shadow-inner">
              <button onClick={() => setGender('male')} className={`flex items-center gap-1 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 text-[10px] sm:text-xs md:text-sm font-bold rounded-md transition-colors ${gender === 'male' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <span className="text-blue-400">♂</span> <span className="hidden sm:inline">Male</span>
              </button>
              <button onClick={() => setGender('female')} className={`flex items-center gap-1 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 text-[10px] sm:text-xs md:text-sm font-bold rounded-md transition-colors ${gender === 'female' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <span className="text-pink-400">♀</span> <span className="hidden sm:inline">Female</span>
              </button>
            </div>
          )}

          {mode === 'explorer' ? (
            <button 
              onClick={() => setMode('quiz_settings')}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-medium transition-colors border border-zinc-700 shadow-sm text-xs md:text-sm whitespace-nowrap"
            >
              Quiz Mode
            </button>
          ) : (
            <button 
              onClick={exitQuiz}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-medium transition-colors border border-red-500/20 shadow-sm text-xs md:text-sm whitespace-nowrap"
            >
              Exit Quiz
            </button>
          )}
        </div>
      </nav>

      {/* 3D Viewer Canvas */}
      <main id="canvas-container" className="flex-1 relative w-full h-[calc(100vh-64px)]">
        
        {/* Left Toggle Panel */}
        {mode === 'explorer' && (
          <div className="absolute top-2 left-2 md:top-4 md:left-4 w-[140px] sm:w-[180px] md:w-[280px] max-h-[calc(100%-1rem)] md:max-h-[calc(100%-2rem)] overflow-y-auto bg-[#0a0a0a]/80 backdrop-blur-md border border-zinc-800/80 rounded-xl p-2 md:p-4 shadow-2xl z-10 scrollbar-hide animate-in slide-in-from-left-4 fade-in duration-300">
            <h2 className="text-white font-semibold mb-2 md:mb-4 text-[10px] md:text-xs uppercase tracking-wider text-zinc-500">Body Systems</h2>
            <div className="space-y-1 md:space-y-1.5">
              {SYSTEMS.map(sys => {
                const isActive = activeSystems.has(sys);
                return (
                  <button 
                    key={sys} 
                    onClick={() => toggleSystem(sys)} 
                    className={`w-full flex items-center justify-between px-2 py-1.5 md:px-3 md:py-2 rounded-lg text-[10px] sm:text-xs md:text-sm transition-colors border ${isActive ? 'bg-zinc-800/80 text-white border-zinc-700' : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-900/50'}`}
                  >
                    <div className="flex items-center gap-1.5 md:gap-3">
                      <span className="w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: systemColors[sys] || '#444' }} />
                      <span className="opacity-80 text-xs md:text-base hidden sm:inline">{SYSTEM_EMOJIS[sys]}</span>
                      <span className="font-medium truncate">{sys}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Right UI: Explorer Controls OR Quiz Panel */}
        {mode === 'explorer' ? (
          <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-6 flex flex-col gap-3 md:gap-6 z-10 animate-in slide-in-from-right-4 fade-in duration-300 scale-75 md:scale-100 origin-right">
            <div className="flex flex-col items-center gap-2 bg-[#0a0a0a]/80 backdrop-blur-md border border-zinc-800/80 p-2 rounded-2xl shadow-xl">
              <button onClick={() => handleRotate('up')} className="w-10 h-10 flex items-center justify-center bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded-full transition-colors border border-zinc-700/50">▲</button>
              <div className="flex gap-2">
                <button onClick={() => handleRotate('left')} className="w-10 h-10 flex items-center justify-center bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded-full transition-colors border border-zinc-700/50">◀</button>
                <button onClick={() => handleRotate('right')} className="w-10 h-10 flex items-center justify-center bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded-full transition-colors border border-zinc-700/50">▶</button>
              </div>
              <button onClick={() => handleRotate('down')} className="w-10 h-10 flex items-center justify-center bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded-full transition-colors border border-zinc-700/50">▼</button>
            </div>

            <div className="flex flex-col gap-2 bg-[#0a0a0a]/80 backdrop-blur-md border border-zinc-800/80 p-2 rounded-2xl shadow-xl">
              <button onClick={() => handleZoom('in')} className="w-10 h-10 flex items-center justify-center bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xl font-medium rounded-full transition-colors border border-zinc-700/50">+</button>
              <button onClick={() => handleZoom('out')} className="w-10 h-10 flex items-center justify-center bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-2xl font-medium rounded-full transition-colors border border-zinc-700/50">-</button>
            </div>

            <div className="flex flex-col items-center bg-[#0a0a0a]/80 backdrop-blur-md border border-zinc-800/80 p-2 rounded-2xl shadow-xl">
              <button onClick={handleReset} className="w-10 h-10 flex items-center justify-center bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xl font-medium rounded-full transition-colors border border-zinc-700/50">⟳</button>
            </div>
          </div>
        ) : mode === 'quiz_active' && (
          <QuizPanel />
        )}

        {/* Bottom Info Panel */}
        {mode === 'explorer' && lastClickedSystem && (
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] md:w-[550px] max-w-[90vw] bg-[#0a0a0a]/80 backdrop-blur-md border border-zinc-800/80 rounded-xl p-3 md:p-5 shadow-2xl z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-1 md:mb-2">
              <span className="text-base md:text-xl">{SYSTEM_EMOJIS[lastClickedSystem]}</span>
              <h3 className="text-white font-bold text-sm md:text-lg">{lastClickedSystem}</h3>
              <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] md:text-xs px-2 md:px-2.5 py-0.5 rounded-full font-mono">
                {SYSTEM_INFO[lastClickedSystem]?.course}
              </span>
            </div>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed max-w-md mx-auto line-clamp-2 md:line-clamp-none">
              {SYSTEM_INFO[lastClickedSystem]?.description}
            </p>
          </div>
        )}

        {/* Modal Overlays */}
        {mode === 'quiz_settings' && <QuizSettings />}
        {mode === 'quiz_summary' && <QuizSummary />}

        <Canvas 
          camera={{ position: [0, 0, 4], fov: 45 }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          gl={{ antialias: true, alpha: false }}
        >
          <ambientLight intensity={0.1} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} color="#fff0dd" castShadow />
          <directionalLight position={[-10, 2, 5]} intensity={0.6} color="#dbeeff" />
          <directionalLight position={[0, 5, -10]} intensity={1.2} color="#ffffff" />
          
          <EffectComposer>
             <N8AO distanceFalloff={1} aoRadius={1} intensity={4} />
          </EffectComposer>

          <Suspense fallback={<LoadingScreen />}>
            <AnatomyModel />
          </Suspense>

          <OrbitControls 
            ref={controlsRef}
            makeDefault
            target={[0, 0, 0]}
            minDistance={1}
            maxDistance={20}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
            minAzimuthAngle={-Infinity}
            maxAzimuthAngle={Infinity}
            enableDamping={true}
          />
        </Canvas>
      </main>
    </div>
  )
}

export default App

