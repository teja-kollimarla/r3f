import { useRef, useState } from 'react'
import { TransformControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import { geometries } from '../lib/geometrics'
import useStore from '../store/useStore'

function Shape() {
  const meshRef = useRef()
  const [ready, setReady] = useState(false)

  const selectedGeometry = useStore((s) => s.selectedGeometry)
  const transformMode    = useStore((s) => s.transformMode)
  const showTransform    = useStore((s) => s.showTransform)
  const geoArgs          = useStore((s) => s.geoArgs)
  const { color, scale, wireframe, rotation } = useStore((s) => s.objectProps)

  const item = geometries[selectedGeometry]

  const geometry = useMemo(() => {
    if (!item) return null
    return new item.geometry(...geoArgs)
  }, [selectedGeometry, geoArgs])

  useFrame((_, delta) => {
    if (!meshRef.current || !rotation.enabled) return
    if (rotation.x) meshRef.current.rotation.x += rotation.speed * delta
    if (rotation.y) meshRef.current.rotation.y += rotation.speed * delta
    if (rotation.z) meshRef.current.rotation.z += rotation.speed * delta
  })

  if (!item || !geometry) return null

  return (
    <>
      {ready && <TransformControls enabled={showTransform} object={meshRef} mode={transformMode} />}
      <mesh
        ref={(el) => {
          meshRef.current = el
          if (el && !ready) setReady(true)
        }}
        scale={[scale, scale, scale]}
      >
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial color={color} wireframe={wireframe} />
      </mesh>
    </>
  )
}

export default Shape