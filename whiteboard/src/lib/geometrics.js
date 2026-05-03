import {
  BoxGeometry,
  SphereGeometry,
  PlaneGeometry,
  CircleGeometry,
  CylinderGeometry,
  ConeGeometry,
  TorusGeometry,
  TorusKnotGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  OctahedronGeometry,
  TetrahedronGeometry,
} from 'three'

import { FaCube, FaCircle, FaSquare, FaDrawPolygon } from 'react-icons/fa'

export const geometries = {
  box:          { name: 'Box',          geometry: BoxGeometry,          icon: FaCube        },
  sphere:       { name: 'Sphere',       geometry: SphereGeometry,       icon: FaCircle      },
  plane:        { name: 'Plane',        geometry: PlaneGeometry,        icon: FaSquare      },
  circle:       { name: 'Circle',       geometry: CircleGeometry,       icon: FaCircle      },
  cylinder:     { name: 'Cylinder',     geometry: CylinderGeometry,     icon: FaDrawPolygon },
  cone:         { name: 'Cone',         geometry: ConeGeometry,         icon: FaDrawPolygon },
  torus:        { name: 'Torus',        geometry: TorusGeometry,        icon: FaCircle      },
  torusKnot:    { name: 'Torus Knot',   geometry: TorusKnotGeometry,    icon: FaDrawPolygon },
  dodecahedron: { name: 'Dodecahedron', geometry: DodecahedronGeometry, icon: FaDrawPolygon },
  icosahedron:  { name: 'Icosahedron',  geometry: IcosahedronGeometry,  icon: FaDrawPolygon },
  octahedron:   { name: 'Octahedron',   geometry: OctahedronGeometry,   icon: FaDrawPolygon },
  tetrahedron:  { name: 'Tetrahedron',  geometry: TetrahedronGeometry,  icon: FaDrawPolygon },
}