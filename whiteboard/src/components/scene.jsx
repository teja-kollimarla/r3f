import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { TransformControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { geometries } from '../lib/geometrics'
import { geoConfigs } from '../lib/geoConfigs'
import OrbitPath from '../lib/oribitpath'
import useStore from '../store/useStore'

const DEG = Math.PI / 180

function SceneObject({ obj }) {
  const meshRef  = useRef()
  const groupRef = useRef()
  const angleRef = useRef(0)
  const [ready, setReady] = useState(false)

  const selectedId    = useStore((s) => s.selectedId)
  const selectObject  = useStore((s) => s.selectObject)
  const transformMode = useStore((s) => s.transformMode)
  const showTransform = useStore((s) => s.showTransform)

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

  useFrame((_, delta) => {
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
          <TransformControls object={meshRef} mode={transformMode} />
        )}

        <mesh
          ref={(el) => {
            meshRef.current = el
            if (el) {
              el.rotation.set(totalRotX, totalRotY, totalRotZ)
              if (!ready) setReady(true)
            }
          }}
          scale={[scale, scale, scale]}
          onClick={(e) => { e.stopPropagation(); selectObject(id) }}
        >
          <primitive object={geometry} attach="geometry" />
          {wireframe ? (
            <meshStandardMaterial
              color={color}
              wireframe
              side={side}
              transparent={opacity < 1}
              opacity={opacity}
            />
          ) : (
            <meshStandardMaterial
              color={color}
              side={side}
              transparent={opacity < 1}
              opacity={opacity}
              emissive={isSelected ? '#222222' : '#000000'}
            />
          )}
        </mesh>
      </group>
    </>
  )
}

function Scene() {
  const objects      = useStore((s) => s.objects)
  const selectObject = useStore((s) => s.selectObject)

  return (
    <>
      <mesh scale={[1000, 1000, 1000]} onClick={() => selectObject(null)} visible={false}>
        <planeGeometry />
      </mesh>
      {objects.map((obj) => (
        <SceneObject key={obj.id} obj={obj} />
      ))}
    </>
  )
}

export default Scene