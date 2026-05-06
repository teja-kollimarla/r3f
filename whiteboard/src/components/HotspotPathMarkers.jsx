import { useRef, useState } from 'react'
import { Html, TransformControls, Line } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore from '../store/useStore'

function PathMarker({ position, label, color, onDragEnd }) {
  const meshRef = useRef()
  const [ready, setReady] = useState(false)
  const { camera } = useThree()
  const setIsTransforming = useStore((s) => s.setIsTransforming)

  // Scale marker by camera distance so it stays usable at any zoom level
  useFrame(() => {
    if (!meshRef.current) return
    const dist = camera.position.distanceTo(meshRef.current.position)
    const s = THREE.MathUtils.clamp(dist * 0.04, 0.05, 2)
    meshRef.current.scale.setScalar(s)
  })

  return (
    <group>
      {ready && (
        <TransformControls
          object={meshRef}
          mode="translate"
          onMouseDown={() => setIsTransforming(true)}
          onMouseUp={() => {
            setIsTransforming(false)
            if (meshRef.current) {
              const p = meshRef.current.position
              onDragEnd([p.x, p.y, p.z])
            }
          }}
        />
      )}
      <mesh
        renderOrder={999}
        ref={(el) => { meshRef.current = el; if (el && !ready) setReady(true) }}
        position={position}
      >
        <sphereGeometry args={[0.12, 14, 14]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          depthTest={false}
        />
      </mesh>
      <Html position={[position[0], position[1] + 0.22, position[2]]} center distanceFactor={6}>
        <div style={{
          background:   color,
          color:        '#fff',
          padding:      '1px 6px',
          borderRadius: 3,
          fontSize:     9,
          fontWeight:   700,
          whiteSpace:   'nowrap',
          pointerEvents: 'none',
          userSelect:   'none',
        }}>
          {label}
        </div>
      </Html>
    </group>
  )
}

function HotspotPathMarkers() {
  const selectedHotspotId     = useStore((s) => s.selectedHotspotId)
  const hotspots              = useStore((s) => s.hotspots)
  const updateHotspotAction   = useStore((s) => s.updateHotspotAction)
  const updateHotspotWaypoint = useStore((s) => s.updateHotspotWaypoint)

  const hotspot = hotspots.find((h) => h.id === selectedHotspotId)
  if (!hotspot) return null

  const { action } = hotspot
  const hid = hotspot.id
  const HAS_END = ['move-to', 'zoom-in', 'zoom-out'].includes(action.type)

  // Build ordered list of world positions for the connecting line
  const linePoints = []
  if (action.useDefinedStart) {
    linePoints.push(action.startPosition ?? [0, 3, 5])
  }
  for (const wp of (action.waypoints ?? [])) {
    linePoints.push(wp.position)
  }
  if (HAS_END) {
    linePoints.push(action.toPosition ?? [5, 3, 5])
  }

  return (
    <>
      {action.useDefinedStart && (
        <PathMarker
          position={action.startPosition ?? [0, 3, 5]}
          label="Start"
          color="#22c55e"
          onDragEnd={(p) => updateHotspotAction(hid, 'startPosition', p)}
        />
      )}

      {(action.waypoints ?? []).map((wp, i) => (
        <PathMarker
          key={i}
          position={wp.position}
          label={`WP ${i + 1}`}
          color="#f59e0b"
          onDragEnd={(p) => updateHotspotWaypoint(hid, i, 'position', p)}
        />
      ))}

      {HAS_END && (
        <PathMarker
          position={action.toPosition ?? [5, 3, 5]}
          label="End"
          color="#ef4444"
          onDragEnd={(p) => updateHotspotAction(hid, 'toPosition', p)}
        />
      )}

      {linePoints.length >= 2 && (
        <Line
          points={linePoints}
          color="#94a3b8"
          lineWidth={1.5}
          dashed
          dashScale={3}
        />
      )}
    </>
  )
}

export default HotspotPathMarkers
