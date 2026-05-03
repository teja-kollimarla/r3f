import { useState } from 'react'
import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import './App.css'
import { geometries } from './lib/geometrics'
import Shape from './components/geomentrics'

function App() {
  const [selectedGeometry, setSelectedGeometry] = useState(null)
  const [transformMode, setTransformMode] = useState('translate')

  return (
    <div className="w-full h-screen bg-gray-300 flex items-center justify-center">
      <div className="w-[90%] h-[90%] bg-white rounded-xl shadow-xl flex overflow-hidden">

        {/* Sidebar */}
        <div className="flex-[0_0_25%] min-w-[200px] max-w-[250px] border-r border-gray-300 p-3 overflow-y-auto overflow-x-hidden flex flex-col gap-4">
          
          {/* Transform Mode Buttons */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2 tracking-wide">Transform</p>
            <div className="flex gap-1">
              {['translate', 'rotate', 'scale'].map((m) => (
                <button
                  key={m}
                  onClick={() => setTransformMode(m)}
                  className={`flex-1 text-xs py-1 px-1 rounded capitalize font-medium transition-colors
                    ${transformMode === m ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {m === 'translate' ? '↔ Move' : m === 'rotate' ? '↻ Rot' : '⤡ Scale'}
                </button>
              ))}
            </div>
          </div>

          {/* Geometry List */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2 tracking-wide">Geometries</p>
            <div className="grid grid-cols-3 gap-2 w-full">
              {Object.entries(geometries).map(([key, item]) => {
                const Icon = item.icon
                const isSelected = selectedGeometry === key
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedGeometry(key)}
                    className={`flex flex-col items-center justify-start gap-1 p-2 rounded cursor-pointer transition-colors
                      ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <div className="icon-wrapper">
                      <Icon />
                    </div>
                    <span className="text-[10px] text-center w-full truncate leading-tight">{item.name}</span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <Canvas camera={{ position: [5, 3, 5], fov: 45, near: 0.1, far: 10000 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <OrbitControls makeDefault />
            <axesHelper args={[5]} />
            <gridHelper args={[20, 20, 'red', 'blue']} />
            {selectedGeometry && <Shape type={selectedGeometry} mode={transformMode} />}
          </Canvas>

          {!selectedGeometry && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-gray-400 text-sm">Select a geometry from the panel</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default App