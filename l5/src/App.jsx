import { Canvas, useFrame } from '@react-three/fiber';
// Canvas → creates scene, camera, renderer

import { useRef } from 'react';

import {
  OrbitControls,
  GizmoHelper,
  GizmoViewport,
  useHelper
} from '@react-three/drei';
// OrbitControls → mouse interaction (rotate, zoom, pan)
// GizmoHelper → wrapper to position gizmo UI
// GizmoViewport → axis cube (top-left)
// useHelper → attaches visual debugging helpers

import { useControls, Leva } from 'leva';
// Leva → UI panel
// useControls → create sliders, toggles, color pickers

import * as THREE from 'three';
// Needed for helper classes


// ---------------- DIRECTIONAL LIGHT ----------------
function DirectionalLightWithHelper() {
  const light = useRef();

  // useHelper(ref, HelperClass, size, color)
  // DirectionalLightHelper needs size + optional color
  useHelper(light, THREE.DirectionalLightHelper, 3, 'purple');

  return (
    <directionalLight
      ref={light}

      // position → [x, y, z]
      // defines direction of light (like sun)
      position={[2, 5, 5]}

      // intensity → brightness (default = 1)
      intensity={0.8}

      // color → light color
      color="white"

      // OTHER POSSIBLE PROPS:
      // castShadow={true} → enables shadows
      // target={object3D} → direction target
      // visible={true}
    />
  );
}


// ---------------- SPOT LIGHT ----------------
const SpotLightWithHelper = () => {
  const spotlight = useRef();

  // SpotLightHelper → shows cone of light
  // NOTE: SpotLightHelper only takes (light, color)
  useHelper(spotlight, THREE.SpotLightHelper, "orange");

  // Leva control for angle
 const { angle } = useControls({
  angle: {
    value: Math.PI / 10,   // default value
    min: 0.01,             // minimum angle
    max: Math.PI / 2,      // maximum angle
    step: 0.01             // slider precision
  }
});

  return (
    <spotLight
      ref={spotlight}

      // position → light position
      position={[2, 5, 1]}

      // intensity → brightness
      intensity={18}

      // angle → spread of light cone (radians)
      // smaller = narrow beam, larger = wide beam
      angle={angle}

      // penumbra → softness of edges (0 to 1)
      penumbra={0.5}

      // distance → how far light reaches
      distance={20}

      // decay → how light fades (physically correct = 2)
      decay={2}

      // color="white"

      // OTHER POSSIBLE PROPS:
      // castShadow={true}
      // target={object}
      // visible={true}
    />
  );
};


// ---------------- ANIMATED BOX ----------------
function AnimateBox() {
  const boxref = useRef();

  const { colour, speed, wireframe } = useControls({
    colour: 'red',

    speed: {
      value: 0.005,
      min: 0.001,
      max: 1,
      step: 0.001,
    },

    wireframe: false
  });

  // runs every frame
  useFrame(() => {
    if (boxref.current) {
      boxref.current.rotation.x += speed;
      boxref.current.rotation.y += speed;
      boxref.current.rotation.z += speed;
    }
  });

  return (
    <mesh
      ref={boxref}

      // COMMON PROPS:
      // position={[x,y,z]}
      // rotation={[x,y,z]}
      // scale={[x,y,z]}
      // visible
      // castShadow
      // receiveShadow
    >
      <boxGeometry
        // args → [width, height, depth]
        args={[1, 1, 1]}

        // OTHER:
        // args=[w, h, d, widthSegments, heightSegments, depthSegments]
      />

      <meshStandardMaterial
        color={colour}
        wireframe={wireframe}

        // OTHER PROPS:
        // metalness={0.5}
        // roughness={0.5}
        // emissive="blue"
        // opacity={0.5}
        // transparent={true}
        // side={THREE.DoubleSide}
      />
    </mesh>
  );
}


// ---------------- MAIN APP ----------------
function App() {
  return (
    <div style={{ height: '100vh' }}>

      {/* Leva Panel */}
    <Leva  />
      <Canvas
        camera={{
          position: [3, 3, 3],
          fov: 75,
          near: 0.1,
          far: 1000
        }}

        // OTHER PROPS:
        // shadows
        // dpr
        // gl={{ antialias: true }}
      >

        {/* Gizmo */}
        <GizmoHelper alignment="top-left" margin={[80, 80]}>
          <GizmoViewport />
        </GizmoHelper>

        {/* Grid */}
        <gridHelper
          args={[10, 20, 'red', 'blue']}
          // size, divisions, centerLineColor, gridColor
        />

        {/* Axes */}
        <axesHelper args={[10]} />

        {/* Object */}
        <AnimateBox />

        {/* Controls */}
        <OrbitControls
          // enableZoom
          // enablePan
          // enableRotate
          // autoRotate
        />

        {/* Lights */}
        <ambientLight intensity={0.7} />

        <DirectionalLightWithHelper />
        <SpotLightWithHelper />

      </Canvas>
    </div>
  );
}

export default App;