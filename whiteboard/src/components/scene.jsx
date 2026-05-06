import { useRef, useState, useMemo, useEffect } from 'react'  // add useEffect
import * as THREE from 'three'
import { TransformControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { geometries } from '../lib/geometrics'
import { geoConfigs } from '../lib/geoConfigs'
import OrbitPath from '../lib/oribitpath'
import useStore from '../store/useStore'
import CameraObject from './CameraObject'
import HotspotObject from './HotspotObject'
import HotspotPathMarkers from './HotspotPathMarkers'
import objectPositions from '../lib/objectPositions'

const DEG = Math.PI / 180
const RAD = 180 / Math.PI

function SceneObject({ obj }) {
  const meshRef      = useRef()
  const groupRef     = useRef()
  const transformRef = useRef()   // ← ref for TransformControls
  const angleRef     = useRef(0)
  const [ready, setReady] = useState(false)

  const selectedId        = useStore((s) => s.selectedId)
  const selectObject      = useStore((s) => s.selectObject)
  const transformMode     = useStore((s) => s.transformMode)
  const showTransform     = useStore((s) => s.showTransform)
  const setIsTransforming = useStore((s) => s.setIsTransforming)
  const setObjectProp     = useStore((s) => s.setObjectProp)

  const { id, geometryKey, geoArgs, objectProps } = obj
  const { color, scale, wireframe, opacity, doubleSide, meshRotation, rotation, revolve } = objectProps
  const isSelected = selectedId === id

  const item   = geometries[geometryKey]
  const config = geoConfigs[geometryKey]
  const defaultMeshRot = config?.defaultMeshRotation ?? [0, 0, 0]

  const geometry = useMemo(() => {
    if (!item) return null
    return new item.geometry(...geoArgs)
  }, [geometryKey, geoArgs])

  const totalRotX = defaultMeshRot[0] + meshRotation.x * DEG
  const totalRotY = defaultMeshRot[1] + meshRotation.y * DEG
  const totalRotZ = defaultMeshRot[2] + meshRotation.z * DEG

  const side = doubleSide ? THREE.DoubleSide : THREE.FrontSide

  // ── Wire up dragging-changed on the THREE.js level ───────────────────────
  useEffect(() => {
    const tc = transformRef.current
    if (!tc) return
    const onDragChange = (e) => setIsTransforming(e.value)
    tc.addEventListener('dragging-changed', onDragChange)
    return () => {
      tc.removeEventListener('dragging-changed', onDragChange)
      setIsTransforming(false)  // cleanup on unmount
    }
  }, [ready, isSelected, showTransform])

  // ── Sync rotate back to store ─────────────────────────────────────────────
  const handleObjectChange = () => {
    if (!meshRef.current || transformMode !== 'rotate') return
    const r = meshRef.current.rotation
    setObjectProp(id, 'meshRotation', {
      x: (r.x - defaultMeshRot[0]) * RAD,
      y: (r.y - defaultMeshRot[1]) * RAD,
      z: (r.z - defaultMeshRot[2]) * RAD,
    })
  }

  useFrame((_, delta) => {
    // Publish world position so cameras can track this object
    if (meshRef.current) {
      const wp = new THREE.Vector3()
      meshRef.current.getWorldPosition(wp)
      objectPositions.set(id, wp)
    }

    if (meshRef.current && !rotation.enabled) {
      meshRef.current.rotation.set(totalRotX, totalRotY, totalRotZ)
    }

    if (meshRef.current && rotation.enabled) {
      if (rotation.x) meshRef.current.rotation.x += rotation.speed * delta
      if (rotation.y) meshRef.current.rotation.y += rotation.speed * delta
      if (rotation.z) meshRef.current.rotation.z += rotation.speed * delta
    }

    if (revolve.enabled && groupRef.current) {
      angleRef.current += revolve.speed * delta
      groupRef.current.position.x = revolve.radiusX * Math.cos(angleRef.current)
      groupRef.current.position.z = revolve.radiusZ * Math.sin(angleRef.current)
      groupRef.current.position.y = revolve.y
    } else if (!revolve.enabled && groupRef.current) {
      groupRef.current.position.set(0, 0, 0)
    }
  })

  if (!item || !geometry) return null

  return (
    <>
      {revolve.enabled && (
        <OrbitPath radiusX={revolve.radiusX} radiusZ={revolve.radiusZ} />
      )}

      <group ref={groupRef}>
        {ready && isSelected && showTransform && (
          <TransformControls
            ref={transformRef}        // ← attach ref
            object={meshRef}
            mode={transformMode}
            onChange={handleObjectChange}
            // Remove onMouseDown/onMouseUp — dragging-changed handles it
          />
        )}

        <mesh
          ref={(el) => {
            meshRef.current = el
            if (el) {
              el.userData.labelTargetId = id
              el.rotation.set(totalRotX, totalRotY, totalRotZ)
              if (!ready) setReady(true)
            }
          }}
          scale={[scale, scale, scale]}
          onClick={(e) => { e.stopPropagation(); selectObject(id) }}
        >
          <primitive object={geometry} attach="geometry" />
          {wireframe ? (
            <meshStandardMaterial color={color} wireframe side={side} transparent={opacity < 1} opacity={opacity} />
          ) : (
            <meshStandardMaterial color={color} side={side} transparent={opacity < 1} opacity={opacity} emissive={isSelected ? '#222222' : '#000000'} />
          )}
        </mesh>
      </group>
    </>
  )
}

function Scene() {
  const objects         = useStore((s) => s.objects)
  const cameras         = useStore((s) => s.cameras)
  const hotspots        = useStore((s) => s.hotspots)
  const selectObject    = useStore((s) => s.selectObject)
  const selectCamera    = useStore((s) => s.selectCamera)
  const selectHotspot   = useStore((s) => s.selectHotspot)

  return (
    <>
      <mesh
        scale={[1000, 1000, 1000]}
        onClick={() => { selectObject(null); selectCamera(null); selectHotspot(null) }}
        visible={false}
      >
        <planeGeometry />
      </mesh>
      {objects.map((obj) => (
        <SceneObject key={obj.id} obj={obj} />
      ))}
      {cameras.map((cam) => (
        <CameraObject key={cam.id} camera={cam} />
      ))}
      {hotspots.map((hs) => (
        <HotspotObject key={hs.id} hotspot={hs} />
      ))}
      <HotspotPathMarkers />
    </>
  )
}

export default Scene