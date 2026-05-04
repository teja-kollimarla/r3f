import { useRef, useState } from 'react'
import { Html, Line } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import useStore from '../store/useStore'

function SceneLabel({ label }) {
  const { camera, gl } = useThree()
  const objects        = useStore((s) => s.objects)
  const updateLabel    = useStore((s) => s.updateLabel)
  const removeLabel    = useStore((s) => s.removeLabel)
  const selectedLabelId = useStore((s) => s.selectedLabelId)
  const selectLabel    = useStore((s) => s.selectLabel)

  const dragRef     = useRef(false)
  const startRef    = useRef(null)
  const posRef      = useRef(new THREE.Vector3(...label.position))
  const [pos, setPos] = useState(label.position)
  const isSelected  = selectedLabelId === label.id

  const targetObj   = label.targetId != null ? objects.find((o) => o.id === label.targetId) : null
  const lineStart   = targetObj ? [0, 0, 0] : [0, 0, 0]
  const lineEnd     = pos

  const getWorldPos = (e) => {
    const rect   = gl.domElement.getBoundingClientRect()
    const x      =  ((e.clientX - rect.left)  / rect.width)  * 2 - 1
    const y      = -((e.clientY - rect.top)   / rect.height) * 2 + 1
    const vec    = new THREE.Vector3(x, y, 0.5).unproject(camera)
    const dir    = vec.sub(camera.position).normalize()
    const plane  = new THREE.Plane(new THREE.Vector3(0, 1, 0), -posRef.current.y)
    const target = new THREE.Vector3()
    new THREE.Ray(camera.position, dir).intersectPlane(plane, target)
    return target
  }

  const onMouseDown = (e) => {
    e.stopPropagation()
    selectLabel(label.id)
    dragRef.current  = true
    startRef.current = getWorldPos(e)

    const onMove = (ev) => {
      if (!dragRef.current || !startRef.current) return
      const curr   = getWorldPos(ev)
      const delta  = curr.clone().sub(startRef.current)
      startRef.current = curr
      posRef.current.add(delta)
      setPos([posRef.current.x, posRef.current.y, posRef.current.z])
    }

    const onUp = () => {
      dragRef.current = false
      updateLabel(label.id, 'position', [posRef.current.x, posRef.current.y, posRef.current.z])
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <>
      {targetObj && (
        <group position={[0, 0, 0]}>
          <Line
            points={[lineStart, lineEnd]}
            color={label.lineColor}
            lineWidth={1.5}
            dashed={false}
          />
        </group>
      )}

      <Html position={pos} zIndexRange={[10, 0]} occlude={false}>
        <div
          onMouseDown={onMouseDown}
          onClick={(e) => { e.stopPropagation(); selectLabel(label.id) }}
          className="html-label"
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
                marginLeft:  '6px',
                background:  'none',
                border:      'none',
                color:       '#f87171',
                cursor:      'pointer',
                fontSize:    '10px',
                fontWeight:  'bold',
                lineHeight:  1,
                padding:     0,
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