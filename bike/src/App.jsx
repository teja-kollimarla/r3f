import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  Line,
  useGLTF,
  Environment,
  Edges,
} from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";

/* ---------------- LIGHTS ---------------- */

function OmniLights() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[ 5,  5,  5]} intensity={1.5} />
      <directionalLight position={[-5,  5,  5]} intensity={1.5} />
      <directionalLight position={[ 5, -5,  5]} intensity={1.0} />
      <directionalLight position={[ 5,  5, -5]} intensity={1.0} />
      <directionalLight position={[-5, -5, -5]} intensity={0.8} />
    </>
  );
}

/* ---------------- BIKE ---------------- */

function Bike({ transparent, onReady }) {
  const { scene } = useGLTF("/models/bike/scene.gltf");
  const cloned = useMemo(() => clone(scene), [scene]);
  const initialized = useRef(false);

  useEffect(() => {
    // Center and scale bike to fill scene nicely
    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    box.getCenter(center);
    cloned.position.sub(center);

    const size = new THREE.Vector3();
    box.getSize(size);
    const scale = 3 / Math.max(size.x, size.y, size.z);
    cloned.scale.setScalar(scale);

    // Tell App the bike is ready and share its bounding box
    if (onReady) onReady(cloned);
  }, [cloned]);

  useFrame(() => {
    cloned.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        if (!initialized.current) {
          obj.material.transparent = true;
          obj.material.depthWrite = true; // keep depthWrite ON
          obj.material.opacity = 1;
        } else {
          const target = transparent ? 0.15 : 1;
          obj.material.opacity += (target - obj.material.opacity) * 0.1;
          // Only disable depthWrite when actually fading
          obj.material.depthWrite = obj.material.opacity > 0.9;
        }
      }
    });
    initialized.current = true;
  });

  return <primitive object={cloned} />;
}

/* ---------------- ENGINE ---------------- */

function Engine({ exploded, selected, setSelected, bikeObject }) {
  const { scene } = useGLTF("/models/engine/scene.gltf");
  const cloned = useMemo(() => clone(scene), [scene]);
  const groupRef = useRef();

  useEffect(() => {
    if (!cloned || !bikeObject) return;

    // 1. Center engine
    const engineBox = new THREE.Box3().setFromObject(cloned);
    const engineCenter = new THREE.Vector3();
    engineBox.getCenter(engineCenter);
    cloned.position.sub(engineCenter);

    // 2. Scale engine to ~25% of bike size
    const bikeBox = new THREE.Box3().setFromObject(bikeObject);
    const bikeSize = new THREE.Vector3();
    const engineSize = new THREE.Vector3();
    bikeBox.getSize(bikeSize);
    engineBox.getSize(engineSize);

    const scale = (bikeSize.length() / engineSize.length()) * 0.25;
    if (groupRef.current) {
      groupRef.current.scale.setScalar(scale);

      // 3. Place at bike center
      const bikeCenter = new THREE.Vector3();
      bikeBox.getCenter(bikeCenter);
      groupRef.current.position.copy(bikeCenter);
      groupRef.current.position.y -= 0.1; // slight downward nudge
    }
  }, [cloned, bikeObject]);

  const parts = useMemo(() => {
    const arr = [];
    cloned.traverse((obj) => {
      if (obj.isMesh) arr.push(obj);
    });
    return arr.slice(0, 8);
  }, [cloned]);

  const directions = useMemo(
    () =>
      parts.map((_, i) =>
        new THREE.Vector3(
          Math.sin(i),
          Math.cos(i),
          Math.sin(i * 2)
        ).normalize()
      ),
    [parts]
  );

  const labelGroupRefs = useRef([]);

  useFrame(() => {
    parts.forEach((p, i) => {
      const target = exploded
        ? directions[i].clone().multiplyScalar(1.5)
        : new THREE.Vector3(0, 0, 0);
      p.position.lerp(target, 0.08);

      // Keep label synced to part's current (animated) position
      if (labelGroupRefs.current[i]) {
        const labelPos = p.position
          .clone()
          .add(new THREE.Vector3(0.8, 0.8, 0));
        labelGroupRefs.current[i].position.copy(labelPos);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {parts.map((p, i) => (
        <group key={i}>
          <primitive
            object={p}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(p);
            }}
          />

          {selected === p && (
            <Edges
              geometry={p.geometry}
              scale={1.02}
              color="yellow"
              position={p.position}
            />
          )}

          {exploded && (
            <group ref={(el) => (labelGroupRefs.current[i] = el)}>
              <Line
                points={[[0, 0, 0], [0.8, 0.8, 0]]}
                color="white"
                lineWidth={1}
              />
              <Html distanceFactor={6} position={[0.8, 0.8, 0]}>
                <div style={labelStyle}>{p.name || `Part ${i + 1}`}</div>
              </Html>
            </group>
          )}
        </group>
      ))}
    </group>
  );
}

/* ---------------- CAMERA WATCHER ---------------- */

function CameraWatcher({ setZoom }) {
  const { camera } = useThree();
  useFrame(() => {
    const d = camera.position.length();
    if (d < 3) setZoom(true);
    else if (d > 3.5) setZoom(false);
  });
  return null;
}

/* ---------------- APP ---------------- */

export default function App() {
  const [zoomed, setZoomed] = useState(false);
  const [selected, setSelected] = useState(null);
  const [bikeObject, setBikeObject] = useState(null); // set after bike loads

  return (
    <div style={{ height: "100vh", background: "black" }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 35, near: 0.01 }}
        gl={{ alpha: false }}
      >
        <color attach="background" args={["black"]} />
        <OrbitControls minDistance={1} maxDistance={20} />
        <OmniLights />
        <Environment preset="city" />
        <CameraWatcher setZoom={setZoomed} />

        <Suspense fallback={null}>
          {/* onReady fires after bike is loaded + centered */}
          <Bike
            transparent={zoomed}
            onReady={(obj) => setBikeObject(obj)}
          />

          {/* Engine only mounts after bike is ready so sizing is accurate */}
          {bikeObject && (
            <group visible={zoomed}>
              <Engine
                exploded={zoomed}
                selected={selected}
                setSelected={setSelected}
                bikeObject={bikeObject}
              />
            </group>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

const labelStyle = {
  background: "rgba(0,0,0,0.8)",
  color: "white",
  padding: "4px 6px",
  borderRadius: "4px",
  fontSize: "12px",
  whiteSpace: "nowrap",
};