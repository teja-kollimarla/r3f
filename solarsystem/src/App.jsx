import "./App.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import Sun from "./components/Sun";
import { Leva } from "leva";
import SpaceSphere from "./components/backgroundd";
import useSelected from "./lib/zustand";
import { Fog } from "three";

function App() {
  const { clearSelected,selected } = useSelected();
  const clickedRef = useRef(false);
  useEffect(() => {
    clearSelected();   // 🔥 reset on app load
  }, []);

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <div className="leva-wrapper">
        {selected && <Leva
          theme={{
            sizes: {
              rootWidth: '350px',
              controlWidth: '200px', // 🔥 more space for inputs
            },
          }}
          key={selected}
        />}
      </div>

      <Canvas
        camera={{ position: [100, 20, 80] }}
       onPointerMissed={() => {
    console.log("MISSED");
    clearSelected();
  }}
      >
        <fog attach="fog" args={['white', 100, 2700]} />
        <Suspense fallback={null}>
          <SpaceSphere />
        </Suspense>
        <OrbitControls maxDistance={500} minDistance={1} rotateSpeed={0.5} />
        <gridHelper args={[600, 50]} raycast={() => null} />
        <axesHelper args={[500]} raycast={() => null} />
        <Sun />
      </Canvas>
    </div>
  );
}

export default App;