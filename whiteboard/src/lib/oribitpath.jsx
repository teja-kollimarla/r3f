import { useMemo } from 'react'
import * as THREE from 'three'

function OrbitPath({ radiusX, radiusZ }) {
  const geo = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2
      pts.push(radiusX * Math.cos(angle), 0, radiusZ * Math.sin(angle))
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3))
    return g
  }, [radiusX, radiusZ])

  return (
    <lineLoop geometry={geo}>
      <lineBasicMaterial color="#ffffff" opacity={0.2} transparent />
    </lineLoop>
  )
}

export default OrbitPath