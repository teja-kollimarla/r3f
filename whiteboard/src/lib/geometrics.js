import {
  Box,
  Sphere,
  Plane,
  Circle,
  Cylinder,
  Cone,
  Torus,
  TorusKnot,
  Dodecahedron,
  Icosahedron,
  Octahedron,
  Tetrahedron
} from '@react-three/drei'

import {
  FaCube,
  FaCircle,
  FaSquare,
  FaDrawPolygon
} from 'react-icons/fa'

export const geometries = {
  box: {
    name: 'Box',
    geometry: Box,
    icon: FaCube,
  },

  sphere: {
    name: 'Sphere',
    geometry: Sphere,
    icon: FaCircle,
  },

  plane: {
    name: 'Plane',
    geometry: Plane,
    icon: FaSquare,
  },

  circle: {
    name: 'Circle',
    geometry: Circle,
    icon: FaCircle,
  },

  cylinder: {
    name: 'Cylinder',
    geometry: Cylinder,
    icon: FaDrawPolygon,
  },

  cone: {
    name: 'Cone',
    geometry: Cone,
    icon: FaDrawPolygon,
  },

  torus: {
    name: 'Torus',
    geometry: Torus,
    icon: FaCircle,
  },

  torusKnot: {
    name: 'Torus Knot',
    geometry: TorusKnot,
    icon: FaDrawPolygon,
  },

  dodecahedron: {
    name: 'Dodecahedron',
    geometry: Dodecahedron,
    icon: FaDrawPolygon,
  },

  icosahedron: {
    name: 'Icosahedron',
    geometry: Icosahedron,
    icon: FaDrawPolygon,
  },

  octahedron: {
    name: 'Octahedron',
    geometry: Octahedron,
    icon: FaDrawPolygon,
  },

  tetrahedron: {
    name: 'Tetrahedron',
    geometry: Tetrahedron,
    icon: FaDrawPolygon,
  },
}