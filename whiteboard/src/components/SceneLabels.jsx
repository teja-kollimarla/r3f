import { useRef, useState } from 'react'
import { Html, Line } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import useStore from '../store/useStore'

const PLANE     = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
const raycaster = new THREE.Raycaster()

function getWorldFromMouse(clientX, clientY, camera, domElement) {
  const rect = domElement.getBoundingClientRect()
  const ndc  = new THREE.Vector2(
     ((clientX - rect.left) / rect.width)  * 2 - 1,
    -((clientY - rect.top)  / rect.height) * 2 + 1,
  )
  raycaster.setFromCamera(ndc, camera)
  const target = new THREE.Vector3()
  const hit = raycaster.ray.intersectPlane(PLANE, target)
  return hit ? target : null
}

function SceneLabel({ label }) {
  const { camera, gl, scene } = useThree()

  const objects            = useStore((s) => s.objects)
  const updateLabel        = useStore((s) => s.updateLabel)
  const removeLabel        = useStore((s) => s.removeLabel)
  const selectedLabelId    = useStore((s) => s.selectedLabelId)
  const selectLabel        = useStore((s) => s.selectLabel)
  const setIsDraggingLabel = useStore((s) => s.setIsDraggingLabel)

  const posRef  = useRef(new THREE.Vector3(...label.position))
  const prevRef = useRef(null)
  const [pos, setPos] = useState(label.position)

  const isSelected = selectedLabelId === label.id
  const targetObj  = label.targetId != null ? objects.find((o) => o.id === label.targetId) : null

  const getTargetWorldPos = () => {
    if (!targetObj) return null
    const found = scene.getObjectByProperty('uuid', undefined)
    const wp = new THREE.Vector3()
    scene.traverse((child) => {
      if (child.isMesh && child.userData.labelTargetId === targetObj.id) {
        child.getWorldPosition(wp)
      }
    })
    if (wp.lengthSq() === 0) return new THREE.Vector3(0, 0, 0)
    return wp
  }

  const [lineStart, setLineStart] = useState([0, 0, 0])

  const onMouseDown = (e) => {
    e.stopPropagation()
    e.preventDefault()
    selectLabel(label.id)
    setIsDraggingLabel(true)

    const startWorld = getWorldFromMouse(e.clientX, e.clientY, camera, gl.domElement)
    if (!startWorld) { setIsDraggingLabel(false); return }
    prevRef.current = startWorld.clone()

    const onMove = (ev) => {
      const curr = getWorldFromMouse(ev.clientX, ev.clientY, camera, gl.domElement)
      if (!curr || !prevRef.current) return
      const delta = curr.clone().sub(prevRef.current)
      prevRef.current = curr.clone()
      posRef.current.add(delta)
      setPos([posRef.current.x, posRef.current.y, posRef.current.z])
    }

    const onUp = () => {
      setIsDraggingLabel(false)
      prevRef.current = null
      updateLabel(label.id, 'position', [posRef.current.x, posRef.current.y, posRef.current.z])
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
  }

  return (
    <>
      {targetObj && (
        <Line
          points={[[0, 0, 0], pos]}
          color={label.lineColor}
          lineWidth={2}
        />
      )}

      <Html position={pos} zIndexRange={[10, 0]} occlude={false}>
        <div
          onMouseDown={onMouseDown}
          onClick={(e) => { e.stopPropagation(); selectLabel(label.id) }}
          style={{
            background:   label.bgColor,
            color:        label.textColor,
            fontSize:     `${label.fontSize}px`,
            padding:      '4px 8px',
            borderRadius: '4px',
            cursor:       'grab',
            userSelect:   'none',
            whiteSpace:   'nowrap',
            border:       isSelected ? '1px solid #60a5fa' : '1px solid transparent',
            boxShadow:    '0 2px 6px rgba(0,0,0,0.3)',
            minWidth:     '40px',
            textAlign:    'center',
          }}
        >
          <span>{label.text}</span>
          {isSelected && (
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); removeLabel(label.id) }}
              style={{
                marginLeft: '6px',
                background: 'none',
                border:     'none',
                color:      '#f87171',
                cursor:     'pointer',
                fontSize:   '10px',
                fontWeight: 'bold',
                padding:    0,
              }}
            >
              ✕
            </button>
          )}
        </div>
      </Html>
    </>
  )
}

function SceneLabels() {
  const labels = useStore((s) => s.labels)
  return (
    <>
      {labels.map((label) => (
        <SceneLabel key={label.id} label={label} />
      ))}
    </>
  )
}

export default SceneLabels