import { useRef } from 'react'
import { Html, TransformControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import useStore from '../store/useStore'

const ACTION_ICONS = {
  'move-to':      '→',
  'zoom-in':      '🔍',
  'zoom-out':     '🔭',
  'focus-object': '◎',
  'orbit':        '⟳',
  'sequence':     '▶▶',
}

function HotspotObject({ hotspot }) {
  const pulseRef  = useRef()
  const groupRef  = useRef()
  const isDragging = useRef(false)

  const { id, position, color, name, action } = hotspot

  const selectedHotspotId = useStore((s) => s.selectedHotspotId)
  const isAnimating       = useStore((s) => s.isAnimating)
  const showTransform     = useStore((s) => s.showTransform)
  const transformMode     = useStore((s) => s.transformMode)
  const selectHotspot     = useStore((s) => s.selectHotspot)
  const triggerHotspot    = useStore((s) => s.triggerHotspot)
  const updateHotspot     = useStore((s) => s.updateHotspot)
  const setIsTransforming = useStore((s) => s.setIsTransforming)

  const isSelected = selectedHotspotId === id

  // Pulse outer ring
  useFrame(({ clock }) => {
    if (!pulseRef.current) return
    const t = (Math.sin(clock.elapsedTime * 2.5) + 1) / 2
    const s = 0.85 + t * 0.3
    pulseRef.current.scale.setScalar(s)
    pulseRef.current.material.opacity = 0.25 + t * 0.35
  })

  const handleClick = (e) => {
    e.stopPropagation()
    if (isAnimating) return
    if (isSelected) {
      triggerHotspot(id)    // second click = play
    } else {
      selectHotspot(id)     // first click = select
    }
  }

  function handleDragStart() { isDragging.current = true;  setIsTransforming?.(true)  }
  function handleDragEnd()   { isDragging.current = false; setIsTransforming?.(false) }
  function handleTransformChange() {
    if (!groupRef.current) return
    const p = groupRef.current.position
    updateHotspot(id, 'position', [p.x, p.y, p.z])
  }

  return (
    <group ref={groupRef} position={position}>
      {/* Pulsing outer ring */}
      <mesh ref={pulseRef}>
        <torusGeometry args={[0.28, 0.025, 8, 48]} />
        <meshBasicMaterial color={color} transparent />
      </mesh>

      {/* Center clickable sphere */}
      <mesh onClick={handleClick}>
        <sphereGeometry args={[0.13, 20, 20]} />
        <meshStandardMaterial
          color={isSelected ? '#ffffff' : color}
          emissive={color}
          emissiveIntensity={isSelected ? 1 : 0.5}
        />
      </mesh>

      {/* Vertical stem */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.44, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Ground dot */}
      <mesh position={[0, -0.44, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.07, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>

      {/* Label */}
      <Html position={[0, 0.52, 0]} center distanceFactor={10}>
        <div
          onClick={(e) => { e.stopPropagation(); handleClick(e) }}
          style={{
            background:   isSelected ? color : 'rgba(0,0,0,0.72)',
            color:        '#fff',
            padding:      '2px 8px',
            borderRadius: 4,
            fontSize:     10,
            fontFamily:   'sans-serif',
            fontWeight:   700,
            whiteSpace:   'nowrap',
            cursor:       isAnimating ? 'not-allowed' : 'pointer',
            border:       `1px solid ${color}`,
            userSelect:   'none',
            display:      'flex',
            gap:          4,
            alignItems:   'center',
          }}
        >
          <span>{ACTION_ICONS[action?.type] ?? '●'}</span>
          <span>{name}</span>
          {isSelected && <span style={{ opacity: 0.7, fontSize: 9 }}>click to play</span>}
        </div>
      </Html>

      {/* Transform gizmo when selected */}
      {isSelected && showTransform && (
        <TransformControls
          object={groupRef}
          mode={transformMode}
          onChange={handleTransformChange}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
        />
      )}
    </group>
  )
}

export default HotspotObject
