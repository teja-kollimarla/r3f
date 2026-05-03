import { useRef, useState, useMemo } from 'react'
import { TransformControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { geometries } from '../lib/geometrics'
import useStore from '../store/useStore'

function SceneObject({ obj }) {
  const meshRef   = useRef()
  const [ready, setReady] = useState(false)

  const selectedId     = useStore((s) => s.selectedId)
  const selectObject   = useStore((s) => s.selectObject)
  const transformMode  = useStore((s) => s.transformMode)
  const showTransform  = useStore((s) => s.showTransform)

  const { id, geometryKey, geoArgs, objectProps } = obj
  const { color, scale, wireframe, rotation } = objectProps
  const isSelected = selectedId === id

  const item = geometries[geometryKey]
  const geometry = useMemo(() => {
    if (!item) return null
    return new item.geometry(...geoArgs)
  }, [geometryKey, geoArgs])

  useFrame((_, delta) => {
    if (!meshRef.current || !rotation.enabled) return
    if (rotation.x) meshRef.current.rotation.x += rotation.speed * delta
    if (rotation.y) meshRef.current.rotation.y += rotation.speed * delta
    if (rotation.z) meshRef.current.rotation.z += rotation.speed * delta
  })

  if (!item || !geometry) return null

  return (
    <>
      {ready && isSelected && (
        <TransformControls
          enabled={showTransform}
          visible={showTransform}
          object={meshRef}
          mode={transformMode}
        />
      )}
      <mesh
        ref={(el) => {
          meshRef.current = el
          if (el && !ready) setReady(true)
        }}
        scale={[scale, scale, scale]}
        onClick={(e) => { e.stopPropagation(); selectObject(id) }}
      >
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial
          color={color}
          wireframe={wireframe}
          emissive={isSelected ? '#222222' : '#000000'}
        />
      </mesh>
    </>
  )
}

function Scene() {
  const objects = useStore((s) => s.objects)
  const selectObject = useStore((s) => s.selectObject)

  return (
    <>
      {/* Click on empty space to deselect */}
      <mesh
        scale={[1000, 1000, 1000]}
        onClick={() => selectObject(null)}
        visible={false}
      >
        <planeGeometry />
      </mesh>
      {objects.map((obj) => (
        <SceneObject key={obj.id} obj={obj} />
      ))}
    </>
  )
}

export default Scene