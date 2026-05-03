import { useRef } from 'react'
import { TransformControls } from '@react-three/drei'
import { geometries } from '../lib/geometrics'

const defaultArgs = {
  box: [1, 1, 1],
  sphere: [1, 32, 32],
  plane: [2, 2],
  circle: [1, 32],
  cylinder: [1, 1, 2, 32],
  cone: [1, 2, 32],
  torus: [1, 0.4, 16, 100],
  torusKnot: [1, 0.4, 100, 16],
  dodecahedron: [1, 0],
  icosahedron: [1, 0],
  octahedron: [1, 0],
  tetrahedron: [1, 0],
}

function Shape({ type, mode }) {
  const meshRef = useRef()
  const item = geometries[type]
  if (!item) return null

  const Geometry = item.geometry

  return (
    <TransformControls object={meshRef} mode={mode}>
      <mesh ref={meshRef}>
        <Geometry args={defaultArgs[type] || [1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </TransformControls>
  )
}

export default Shape