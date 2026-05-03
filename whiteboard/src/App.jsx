import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import './App.css'
import useStore from './store/useStore'
import LeftPanel from './components/Leftpannel'
import RightPanel from './components/RightPannel'
import SceneLights from './components/SceneLighting'
import Shape from './components/Shape'

function App() {
  const selectedGeometry = useStore((s) => s.selectedGeometry)
  const geoArgs          = useStore((s) => s.geoArgs)

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
            {selectedGeometry && geoArgs.length > 0 && <Shape />}
          </Canvas>

          {!selectedGeometry && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-gray-400 text-sm">Select a geometry from the panel</p>
            </div>
          )}
        </div>

        {selectedGeometry && <RightPanel />}
      </div>
    </div>
  )
}

function SceneBackground() {
  const backgroundColor = useStore((s) => s.backgroundColor)
  return <color attach="background" args={[backgroundColor]} />
}

export default App