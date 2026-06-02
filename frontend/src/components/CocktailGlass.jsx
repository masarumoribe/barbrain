import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Stage } from '@react-three/drei'

function Model() {
  const ref = useRef()
  const { scene } = useGLTF('/purple_orchid.glb')

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    ref.current.rotation.y = t * 0.2
    ref.current.position.y = Math.sin(t * 0.8) * 0.03
  })

  return <primitive ref={ref} object={scene} scale={0.4}/>
}

export default function CocktailGlass() {
  return (
    <div style={{
      width: '100%',
      height: '320px',
      willChange: 'transform',
      transform: 'translateZ(0)',
    }}>
      <Canvas
        camera={{ position: [0, 0.5, 3.5], fov: 40 }}
        style={{ background: 'transparent' }}
        frameloop="always"
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Stage environment="night" intensity={0.6}>
          <Model />
        </Stage>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/glass.glb')