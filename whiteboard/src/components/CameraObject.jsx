import { useRef, useState, useEffect } from 'react'
import { TransformControls, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore from '../store/useStore'
import { computeBoundingSphere, lookAtSafe, autoFrameFOV } from '../lib/cameraFrame'

function CameraObject({ camera }) {
  const groupRef   = useRef()
  const angleRef   = useRef(0)
  const [ready, setReady] = useState(false)
  const isDragging = useRef(false)

  const helperCam  = useRef(new THREE.PerspectiveCamera())
  const helperRef  = useRef(null)

  const selectedCameraId  = useStore((s) => s.selectedCameraId)
  const previewCameraId   = useStore((s) => s.previewCameraId)
  const selectCamera      = useStore((s) => s.selectCamera)
  const transformMode     = useStore((s) => s.transformMode)
  const showTransform     = useStore((s) => s.showTransform)
  const setCameraPosition = useStore((s) => s.setCameraPosition)
  const setCameraProp     = useStore((s) => s.setCameraProp)
  const setIsTransforming = useStore((s) => s.setIsTransforming)

  const { id, position, cameraProps, name } = camera
  const isSelected   = selectedCameraId === id
  const isPreviewing = previewCameraId === id
  const { fov, near, far, showHelper, rotation, revolve, lookAtObjectIds, autoFrame, euler } = cameraProps
  const boundIds  = lookAtObjectIds ?? []
  const hasTarget = boundIds.length > 0
  const safeFar   = Math.min(far, 50)
  const [ex, ey, ez] = euler ?? [0, 0, 0]

  useEffect(() => {
    if (!groupRef.current) return
    groupRef.current.add(helperCam.current)
    return () => groupRef.current?.remove(helperCam.current)
  }, [ready])

  useEffect(() => {
    const cam = helperCam.current
    cam.fov    = fov
    cam.near   = near
    cam.far    = safeFar
    cam.aspect = 1.5
    cam.updateProjectionMatrix()
    helperRef.current?.update()
  }, [fov, near, safeFar])

  useEffect(() => {
    if (helperRef.current) helperRef.current.visible = !isPreviewing
  }, [isPreviewing])

  useEffect(() => {
    if (!groupRef.current) return
    const scene = groupRef.current.parent
    if (!scene) return

    if (showHelper) {
      const h = new THREE.CameraHelper(helperCam.current)
      helperRef.current = h
      let root = groupRef.current
      while (root.parent && !(root.parent instanceof THREE.Scene)) root = root.parent
      root.parent?.add(h)
      return () => { root.parent?.remove(h); h.dispose(); helperRef.current = null }
    }
  }, [showHelper, ready])

  // Sync store position → group
  useEffect(() => {
    if (!groupRef.current || isDragging.current) return
    groupRef.current.position.set(position[0], position[1], position[2])
  }, [position[0], position[1], position[2]])  // eslint-disable-line

  // Sync store euler → group rotation (free mode only)
  useEffect(() => {
    if (!groupRef.current || isDragging.current || hasTarget) return
    groupRef.current.rotation.set(ex, ey, ez)
  }, [ex, ey, ez, hasTarget])  // eslint-disable-line

  useFrame((_, delta) => {
    if (!groupRef.current || !ready) return

    const sphere = hasTarget ? computeBoundingSphere(boundIds) : null

    // ── 1. Update position FIRST so orientation is computed from new position ──
    if (revolve?.enabled) {
      angleRef.current += delta * (revolve.speed ?? 1)
      // Revolve around bound-object centroid when framing, else world origin
      const cx = sphere ? sphere.center.x : 0
      const cz = sphere ? sphere.center.z : 0
      const cy = sphere ? sphere.center.y : 0
      const x = cx + Math.cos(angleRef.current) * (revolve.radiusX ?? 5)
      const z = cz + Math.sin(angleRef.current) * (revolve.radiusZ ?? 5)
      const y = sphere ? cy + (revolve.y ?? 0) : (revolve.y ?? position[1])
      groupRef.current.position.set(x, y, z)
      setCameraPosition(id, [x, y, z])
    } else if (rotation?.enabled) {
      const speed = (rotation.speed ?? 1) * delta
      if (sphere) {
        // Framing mode: orbit the POSITION around the bounding sphere center
        const gp   = groupRef.current.position
        const cx   = sphere.center.x
        const cy   = sphere.center.y
        const cz   = sphere.center.z
        if (rotation.y) {
          // Horizontal orbit around Y axis of the centroid
          const dx    = gp.x - cx
          const dz    = gp.z - cz
          const r     = Math.sqrt(dx * dx + dz * dz) || 5
          const angle = Math.atan2(dz, dx) + speed
          gp.x = cx + Math.cos(angle) * r
          gp.z = cz + Math.sin(angle) * r
        }
        if (rotation.x) {
          // Vertical arc: raise/lower camera while keeping horizontal distance
          const dx   = gp.x - cx
          const dz   = gp.z - cz
          const hDist = Math.sqrt(dx * dx + dz * dz) || 5
          const vAngle = Math.atan2(gp.y - cy, hDist) + speed * 0.5
          const clamp  = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, vAngle))
          gp.y = cy + Math.tan(clamp) * hDist
        }
        setCameraPosition(id, [gp.x, gp.y, gp.z])
      } else {
        // Free mode: spin the camera body in place
        if (rotation.x) groupRef.current.rotation.x += speed
        if (rotation.y) groupRef.current.rotation.y += speed
        if (rotation.z) groupRef.current.rotation.z += speed
      }
    }

    if (sphere) {
      lookAtSafe(helperCam.current, sphere.center)
      if (autoFrame) {
        const gWP = new THREE.Vector3()
        groupRef.current.getWorldPosition(gWP)
        const dist = gWP.distanceTo(sphere.center)
        if (dist > 0.001) {
          const newFOV = 2 * Math.atan2(sphere.radius * 1.2, dist) * (180 / Math.PI)
          helperCam.current.fov = Math.min(Math.max(newFOV, 1), 170)
          helperCam.current.updateProjectionMatrix()
        }
      }
    } else {
      helperCam.current.rotation.set(0, 0, 0)
      helperCam.current.up.set(0, 1, 0)
    }

    if (helperRef.current) {
      helperCam.current.updateMatrixWorld(true)
      helperRef.current.update()
    }
  })

  function handleTransformChange() {
    if (!groupRef.current) return
    if (transformMode === 'rotate') {
      const r = groupRef.current.rotation
      setCameraProp(id, 'euler', [r.x, r.y, r.z])
    } else {
      const p = groupRef.current.position
      setCameraPosition(id, [p.x, p.y, p.z])
    }
  }
  function handleDragStart() { isDragging.current = true;  setIsTransforming?.(true)  }
  function handleDragEnd()   { isDragging.current = false; setIsTransforming?.(false) }

  return (
    <group
      ref={(el) => { groupRef.current = el; if (el && !ready) setReady(true) }}
      onClick={(e) => { e.stopPropagation(); selectCamera(id) }}
      visible={!isPreviewing}
    >
      <mesh visible={!isPreviewing}>
        <boxGeometry args={[0.35, 0.25, 0.45]} />
        <meshStandardMaterial color={isSelected ? '#8b5cf6' : '#4f46e5'} />
      </mesh>
      <mesh position={[0, 0, -0.25]} rotation={[Math.PI / 2, 0, 0]} visible={!isPreviewing}>
        <cylinderGeometry args={[0.09, 0.09, 0.18, 16]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>
      <mesh position={[0, 0, -0.36]} rotation={[Math.PI, 0, 0]} visible={!isPreviewing}>
        <circleGeometry args={[0.07, 16]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 0.15, 0.05]} visible={!isPreviewing}>
        <boxGeometry args={[0.12, 0.08, 0.12]} />
        <meshStandardMaterial color={isSelected ? '#7c3aed' : '#3730a3'} />
      </mesh>

      <Html position={[0, 0.55, 0]} center distanceFactor={10}>
        <div style={{
          background: isSelected ? '#8b5cf6' : 'rgba(15,10,40,0.75)',
          color: '#fff', padding: '2px 8px', borderRadius: 4,
          fontSize: 11, fontFamily: 'sans-serif', fontWeight: 600,
          whiteSpace: 'nowrap', pointerEvents: 'none',
          border: isSelected ? '1px solid #c4b5fd' : '1px solid rgba(255,255,255,0.15)',
          display: isPreviewing ? 'none' : 'block',
        }}>
          {name}
        </div>
      </Html>

      {ready && isSelected && showTransform && (
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

export default CameraObject
