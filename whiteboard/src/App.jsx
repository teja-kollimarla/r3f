import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import './App.css'
import useStore from './store/useStore'
import LeftPanel from './components/Leftpannel'
import RightPanel from './components/RightPannel'
import SceneLights from './components/SceneLighting'
import Scene from './components/Scene'

function SceneBackground() {
  const backgroundColor = useStore((s) => s.backgroundColor)
  return <color attach="background" args={[backgroundColor]} />
}

function App() {
  const objects   = useStore((s) => s.objects)
  const selectedId = useStore((s) => s.selectedId)

  return (
    <div className="w-full h-screen bg-gray-300 flex items-center justify-center">
      <div className="w-[90%] h-[90%] bg-white rounded-xl shadow-xl flex overflow-hidden">

        <LeftPanel />

        <div className="flex-1 relative overflow-hidden">
          <Canvas camera={{ position: [5, 3, 5], fov: 45, near: 0.1, far: 10000 }}>
            <SceneBackground />
            <SceneLights />
            <OrbitControls makeDefault />
            <axesHelper args={[5]} />
            <gridHelper args={[20, 20, 'red', 'blue']} />
            <Scene />
          </Canvas>

          {objects.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-gray-400 text-sm">Add a geometry from the panel</p>
            </div>
          )}
        </div>

        {selectedId && <RightPanel />}
      </div>
    </div>
  )
}

export default App