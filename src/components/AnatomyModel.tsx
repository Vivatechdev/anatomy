import { useGLTF, Html } from '@react-three/drei'
import { useRef, useLayoutEffect, useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { useStore, SYSTEMS } from '../store/useStore'
import type { MeshInfo } from '../store/useStore'

export default function AnatomyModel() {
  const { scene } = useGLTF('/anatomy_complete.glb')
  const modelRef = useRef<THREE.Group>(null)
  
  const activeSystems = useStore((state) => state.activeSystems)
  const setSystemColors = useStore((state) => state.setSystemColors)
  const setAvailableMeshes = useStore((state) => state.setAvailableMeshes)
  const [label, setLabel] = useState<{name: string, point: THREE.Vector3} | null>(null)

  const mode = useStore(state => state.mode)
  const quizSettings = useStore(state => state.quizSettings)
  const quizState = useStore(state => state.quizState)

  const currentQ = quizState.questions[quizState.currentIndex]

  // Use memo to calculate scale and center exactly once based on the clean native scene
  const { scale, center } = useMemo(() => {
    // Ensure the scene matrices are fully calculated before extracting bounding box
    scene.updateMatrixWorld(true)
    
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1 // Avoid division by zero
    const scale = 3.0 / maxDim
    return { scale, center }
  }, [scene])

  // Generate high-fidelity physical materials just once
  const pbrMaterials = useMemo(() => {
    // Procedural fibrous normal map for muscles
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#8080ff' // neutral normal vector
      ctx.fillRect(0, 0, 512, 512)
      for (let i = 0; i < 3000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000'
        ctx.globalAlpha = Math.random() * 0.15
        const y = Math.random() * 512
        const h = Math.random() * 3 + 1
        ctx.fillRect(0, y, 512, h)
      }
    }
    const muscleNormal = new THREE.CanvasTexture(canvas)
    muscleNormal.wrapS = THREE.RepeatWrapping
    muscleNormal.wrapT = THREE.RepeatWrapping
    muscleNormal.needsUpdate = true

    return {
      'Skeletal': new THREE.MeshPhysicalMaterial({ name: 'Skeletal', color: '#fffff0', roughness: 0.4, metalness: 0.1 }),
      'Muscular': new THREE.MeshPhysicalMaterial({ name: 'Muscular', color: '#7a0000', roughness: 0.7, normalMap: muscleNormal, normalScale: new THREE.Vector2(1.5, 1.5) }),
      'Cardiovascular': new THREE.MeshPhysicalMaterial({ name: 'Cardiovascular', color: '#8b0000', roughness: 0.3, clearcoat: 0.2 }),
      'Respiratory': new THREE.MeshPhysicalMaterial({ name: 'Respiratory', color: '#87ceeb', transparent: true, opacity: 0.85, transmission: 0.3, roughness: 0.2 }),
      'Digestive': new THREE.MeshPhysicalMaterial({ name: 'Digestive', color: '#ffa500', roughness: 0.6 }),
      'Nervous': new THREE.MeshPhysicalMaterial({ name: 'Nervous', color: '#ffff00', emissive: '#ffd700', emissiveIntensity: 0.4 }),
      'Urinary': new THREE.MeshPhysicalMaterial({ name: 'Urinary', color: '#ffbf00', transparent: true, opacity: 0.8 }),
      'Reproductive': new THREE.MeshPhysicalMaterial({ name: 'Reproductive', color: '#ffb6c1', roughness: 0.5 }),
      'Endocrine': new THREE.MeshPhysicalMaterial({ name: 'Endocrine', color: '#800080', roughness: 0.4, clearcoat: 0.4 }),
      'Lymphatic': new THREE.MeshPhysicalMaterial({ name: 'Lymphatic', color: '#00ff00', transparent: true, opacity: 0.8 }),
      'Integumentary': new THREE.MeshPhysicalMaterial({ name: 'Integumentary', color: '#e2cca6', transmission: 0.2, thickness: 1.0, roughness: 0.6 }),
      'Special Senses': new THREE.MeshPhysicalMaterial({ name: 'Special Senses', color: '#008080', metalness: 0.5, roughness: 0.3 }),
    } as Record<string, THREE.MeshPhysicalMaterial>
  }, [])

  // Extract colors and register meshes exactly once
  useEffect(() => {
    const colors: Record<string, string> = {}
    const parsedMeshes: MeshInfo[] = []

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
        if (mat && mat.name) {
          const sysName = mat.name.replace('_', ' ')
          if (SYSTEMS.includes(sysName)) {
            
            // Assign Physical Material
            if (pbrMaterials[sysName]) {
              mesh.material = pbrMaterials[sysName]
            }

            if (!colors[sysName]) {
              if (pbrMaterials[sysName]) {
                colors[sysName] = '#' + pbrMaterials[sysName].color.getHexString()
              } else {
                const stdMat = mat as THREE.MeshStandardMaterial
                if (stdMat.color) colors[sysName] = '#' + stdMat.color.getHexString()
              }
            }
            
            // Clean mesh name for quiz targeting
            let rawName = mesh.name
            let cleanName = rawName.replace(/_?fma\d+/gi, '').replace(/Fj\d+/gi, '').replace(/_/g, ' ').trim()
            if (!cleanName || cleanName.length < 2) {
              cleanName = mat.name.replace(/_/g, ' ').trim()
            }
            if (cleanName && cleanName.length >= 2) {
              cleanName = cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
              parsedMeshes.push({
                uuid: mesh.uuid,
                name: rawName,
                cleanName,
                system: sysName
              })
            }
          }
        }
      }
    })
    setSystemColors(colors)
    setAvailableMeshes(parsedMeshes)
  }, [scene, pbrMaterials, setSystemColors, setAvailableMeshes])

  // Visibility toggle
  useEffect(() => {
    const visibleSet = mode.startsWith('quiz') ? quizSettings.systems : activeSystems
    
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
        if (mat && mat.name) {
          const sysName = mat.name.replace('_', ' ')
          if (SYSTEMS.includes(sysName)) {
            mesh.visible = visibleSet.has(sysName)
          } else {
            mesh.visible = false
          }
        }
      }
    })
  }, [scene, activeSystems, quizSettings.systems, mode])

  // Quiz highlighting
  useEffect(() => {
    // Reset all highlights
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh
        if (m.userData.originalMaterial) {
          m.material = m.userData.originalMaterial
          m.userData.originalMaterial = undefined
        }
      }
    })

    if (mode === 'quiz_active' && currentQ) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh
          if (m.uuid === currentQ.targetUuid) {
             m.userData.originalMaterial = m.material // Save reference
             m.material = m.material.clone()
             const sm = m.material as THREE.MeshStandardMaterial
             
             if (quizState.feedback === 'pending') {
               sm.color.set('#fbbf24') // Amber
               sm.emissive.set('#fbbf24')
             } else if (quizState.feedback === 'correct') {
               sm.color.set('#22c55e') // Green
               sm.emissive.set('#22c55e')
             } else if (quizState.feedback === 'incorrect') {
               sm.color.set('#ef4444') // Red
               sm.emissive.set('#ef4444')
             }
             sm.emissiveIntensity = 0.6
          }
        }
      })
    }
  }, [mode, currentQ?.targetUuid, quizState.feedback, scene])

  // Click handler
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    // Disable standard labeling in quiz mode
    if (mode !== 'explorer') return

    const mesh = e.object as THREE.Mesh
    let name = mesh.name
    name = name.replace(/_?fma\d+/gi, '').replace(/Fj\d+/gi, '').replace(/_/g, ' ').trim()
    
    if (!name || name.length < 2) {
      const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
      if (mat && mat.name) {
        name = mat.name.replace(/_/g, ' ').trim()
      }
    }
    
    if (!name) name = "Anatomical Structure"
    
    name = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    setLabel({ name, point: e.point })
  }

  const handlePointerMissed = () => {
    setLabel(null)
  }

  return (
    <group ref={modelRef} onClick={handleClick} onPointerMissed={handlePointerMissed}>
      {/* Outer group handles scale and the final rotation to stand up and face forward */}
      <group scale={scale} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Inner group perfectly centers the loaded model BEFORE rotation */}
        <group position={[-center.x, -center.y, -center.z]}>
          <primitive object={scene} />
        </group>
      </group>
      {label && mode === 'explorer' && (
        <Html position={label.point} center>
          <div className="bg-black/80 text-white/90 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap pointer-events-none border border-white/10 shadow-lg font-medium">
            {label.name}
          </div>
        </Html>
      )}
    </group>
  )
}

useGLTF.preload('/anatomy_complete.glb')
