import { geometries } from '../lib/geometrics'
// import { meshStandardMaterial } from 'three'

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

function Shape({ type }) {
  const item = geometries[type]
  if (!item) return null

  const Geometry = item.geometry

  return (
    <mesh>
      <Geometry args={defaultArgs[type] || [1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

export default Shape