import { GizmoHelper, GizmoViewport, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import './App.css'
import useStore from './store/useStore'
import LeftPanel from './components/Leftpannel'
import RightPanel from './components/RightPannel'
import SceneLights from './components/SceneLighting'
import SceneLabels from './components/SceneLabels'
import Scene from './components/Scene'
import PreviewCamera from './components/PreviewCamera'

function SceneBackground() {
  const backgroundColor = useStore((s) => s.backgroundColor)
  return <color attach="background" args={[backgroundColor]} />
}

function App() {
  const objects           = useStore((s) => s.objects)
  const cameras           = useStore((s) => s.cameras)
  const selectedId        = useStore((s) => s.selectedId)
  const selectedCameraId  = useStore((s) => s.selectedCameraId)
  const previewCameraId   = useStore((s) => s.previewCameraId)
  const isDraggingLabel   = useStore((s) => s.isDraggingLabel)
  const isTransforming = useStore((s) => s.isTransforming)

  const showRightPanel = selectedId || selectedCameraId

  return (
    <div className="w-full h-screen bg-gray-300 flex items-center justify-center">
      <div className="w-[90%] h-[90%] bg-white rounded-xl shadow-xl flex overflow-hidden">
        <LeftPanel />
        <div className="flex-1 relative overflow-hidden">
          <Canvas camera={{ position: [5, 3, 5], fov: 45, near: 0.1, far: 10000 }}>
            <SceneBackground />
            <SceneLights />
            {previewCameraId ? (
              <>
                <PreviewCamera />
                <OrbitControls enabled={false} />
              </>
            ) : (
              <OrbitControls makeDefault enablePan={true} enabled={!isDraggingLabel && !isTransforming} maxDistance={150} minDistance={1}/>
            )}
            <axesHelper args={[50]} />
            <gridHelper args={[100, 100, 'red', 'blue']} />
            <GizmoHelper alignment="top-right" margin={[80, 80]}><GizmoViewport /></GizmoHelper>
            <Scene />
            <SceneLabels />
          </Canvas>
          {objects.length === 0 && cameras.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-gray-400 text-sm">Add a geometry or camera from the panel</p>
            </div>
          )}
        </div>
        {showRightPanel && <RightPanel />}
      </div>
    </div>
  )
}

export default App