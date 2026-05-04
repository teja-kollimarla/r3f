import { useRef, useState, useMemo } from 'react'
import { TransformControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { geometries } from '../lib/geometrics'
import useStore from '../store/useStore'

function ShapeMesh({ obj }) {
  const meshRef = useRef()
  const [ready, setReady] = useState(false)

  const transformMode = useStore((s) => s.transformMode)
  const showTransform = useStore((s) => s.showTransform)

  const { geometryKey, geoArgs, objectProps } = obj
  const { color, scale, wireframe, opacity, rotation } = objectProps

  const item = geometries[geometryKey]

  const geometry = useMemo(() => {
    if (!item) return null
    return new item.ThreeGeometry(...geoArgs)
  }, [geometryKey, geoArgs])

  useFrame((_, delta) => {
    if (!meshRef.current || !rotation.enabled) return
    if (rotation.x) meshRef.current.rotation.x += rotation.speed * delta
    if (rotation.y) meshRef.current.rotation.y += rotation.speed * delta
    if (rotation.z) meshRef.current.rotation.z += rotation.speed * delta
  })

  if (!item || !geometry) return null

  const isTransparent = opacity < 1

  return (
    <>
      {ready && showTransform && (
        <TransformControls object={meshRef} mode={transformMode} />
      )}
      <mesh
        ref={(el) => {
          meshRef.current = el
          if (el && !ready) setReady(true)
        }}
        scale={[scale, scale, scale]}
      >
        <primitive object={geometry} attach="geometry" />
        {wireframe
          ? <meshBasicMaterial key="wireframe" color={color} wireframe />
          : <meshStandardMaterial
              key={`standard-${isTransparent}`}
              color={color}
              transparent={isTransparent}
              opacity={opacity}
              depthWrite={!isTransparent}
            />
        }
      </mesh>
    </>
  )
}

function Shape() {
  const objects      = useStore((s) => s.objects)
  const selectObject = useStore((s) => s.selectObject)

  return (
    <>
      {objects.map((obj) => (
        <group key={obj.id} onClick={() => selectObject(obj.id)}>
          <ShapeMesh obj={obj} />
        </group>
      ))}
    </>
  )
}

export default Shape