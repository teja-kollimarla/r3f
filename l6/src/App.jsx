import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import {
  OrbitControls,
  GizmoHelper,
  GizmoViewport,
  useHelper
} from '@react-three/drei';
import { useControls, Leva } from 'leva';
import * as THREE from 'three';


// ---------------- SPOT LIGHT WITH HELPER ----------------
function SpotLightWithHelper() {
  const spotlight = useRef();

  // useHelper(ref, HelperClass, ...args)
  // SpotLightHelper → shows cone of light direction
  // args → (light, color?)
  useHelper(spotlight, THREE.SpotLightHelper, 'orange');

  // Leva controls
  const { angle, intensity } = useControls({
    angle: {
      value: Math.PI / 8,
      min: 0.01,
      max: Math.PI / 2,
      step: 0.01
    },
    intensity: {
      value: 2,
      min: 0,
      max: 10,
      step: 0.1
    }
  });

  return (
    <spotLight
      ref={spotlight}

      // ---------------- BASIC LIGHT PROPERTIES ----------------

      position={[3, 5, 3]} 
      // [x, y, z] → position of light in scene

      intensity={intensity}
      // brightness of light
      // default = 1
      // realistic range: 0.5 → 5

      color="white"
      // color of light (string or hex)

      visible={true}
      // show/hide light

      // ---------------- SPOTLIGHT-SPECIFIC ----------------

      angle={angle}
      // cone angle (radians)
      // range: 0 → Math.PI / 2
      // smaller = narrow beam

      penumbra={0.4}
      // softness of edge (0 → 1)
      // 0 = sharp edge
      // 1 = very soft

      distance={20}
      // maximum distance light travels
      // 0 = infinite

      decay={2}
      // light falloff
      // 2 = physically correct

      // ---------------- SHADOW PROPERTIES ----------------

      castShadow={true}
      // enables shadow casting

      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      // resolution of shadow texture
      // higher = sharper shadows (more GPU cost)

      shadow-camera-near={0.5}
      shadow-camera-far={20}
      // range of shadow camera

      shadow-bias={-0.0001}
      // fixes shadow acne (artifacts)

      shadow-normalBias={0.02}
      // helps with surface shadow artifacts

      // ---------------- OTHER POSSIBLE PROPS ----------------

      // target={object3D}
      // → object the spotlight points at

      // power={50}
      // → alternative to intensity (physically correct lighting)

      // anglePower (not common, advanced usage)

    />
  );
}


// ---------------- ANIMATED BOX ----------------
function AnimateBox() {
  const boxref = useRef();

  const { colour, speed, wireframe } = useControls({
    colour: 'red',
    speed: {
      value: 0.005,
      min: 0.001,
      max: 1,
      step: 0.001
    },
    wireframe: false
  });

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

      castShadow
      // object casts shadow

      receiveShadow
      // object receives shadow (optional)

      // OTHER PROPS:
      // position={[x,y,z]}
      // rotation={[x,y,z]}
      // scale={[x,y,z]}
      // visible
    >
      <boxGeometry args={[1, 1, 1]} />
      {/* args → width, height, depth */}

      <meshStandardMaterial
        color={colour}
        wireframe={wireframe}

        roughness={0.6}
        metalness={0.2}

        // OTHER:
        // emissive="blue"
        // opacity={0.5}
        // transparent
        // side={THREE.DoubleSide}
      />
    </mesh>
  );
}


// ---------------- MAIN APP ----------------
function App() {
  return (
    <div style={{ height: '100vh' }}>

      {/* Leva UI Panel */}
      <Leva />

      <Canvas
        shadows
        // enables shadow rendering

        dpr={[1, 2]}
        // device pixel ratio (better quality on high-res screens)

        camera={{
          position: [3, 3, 3],
          fov: 75,
          near: 0.1,
          far: 1000
        }}

        // OTHER Canvas PROPS:
        // gl={{ antialias: true }}
        // frameloop="always" | "demand"
      >

        {/* Gizmo */}
        <GizmoHelper alignment="top-left" margin={[80, 80]}>
          <GizmoViewport />
        </GizmoHelper>

        {/* Grid */}
        <gridHelper args={[10, 20, 'red', 'blue']} />
        {/* size, divisions, center color, grid color */}

        {/* Axes */}
        <axesHelper args={[10]} />

        {/* Object */}
        <AnimateBox />

        {/* Controls */}
        <OrbitControls />
        {/* 
          enableZoom
          enablePan
          enableRotate
          autoRotate
          autoRotateSpeed
        */}

        {/* Lighting */}
        <ambientLight intensity={0.2} />
        {/* soft global light */}

        <SpotLightWithHelper />

        {/* Ground plane (shadow receiver) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#999999" />
        </mesh>

      </Canvas>
    </div>
  );
}

export default App;