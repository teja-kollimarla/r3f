import { OrbitControls, Html } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import './App.css'
import { geometries } from './lib/geometrics'

function App() {
  return (
    <div className="w-screen h-screen bg-gray-300 flex items-center justify-center">
      <div className="w-[90%] h-[90%] bg-white rounded-xl shadow-xl flex overflow-hidden">

        <div className="flex-[0_0_30%] bg-green-200 border-r border-black p-4 overflow-y-auto">
          <div className="flex flex-col gap-2">
  {Object.entries(geometries).map(([key, item]) => {
    const Icon = item.icon
    return (
      <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
  <Icon size={22} />
</div>
    )
  })}
</div>
        </div>

        <div className="flex-[0_0_70%] relative overflow-hidden">
          <Canvas
            className="w-full h-full"
            camera={{
              position: [100, 50, -5],
              fov: 45,
              near: 0.1,
              far: 10000
            }}
          >
            <OrbitControls minDistance={10} maxDistance={1000} />
            <axesHelper args={[1000]} />
            <gridHelper args={[1000, 100, 'red', 'blue']} />

            <Html position={[100, 0, -5]}>
              <div className="bg-black text-white px-4 py-2 rounded-full">
                inside canvas
              </div>
            </Html>
          </Canvas>
        </div>

      </div>
    </div>
  )
}

export default App