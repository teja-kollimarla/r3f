import "./App.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import Sun from "./components/Sun";
import { Leva } from "leva";
import SpaceSphere from "./components/backgroundd";
import useSelected from "./lib/zustand";

function App() {
  const { clearSelected } = useSelected();  // ✅ get clearSelected

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <Leva collapsed={false} />
      <Canvas
        camera={{ position: [100, 20, 80] }}
        onPointerMissed={() => clearSelected()}  // ✅ click empty space = clear
      >
        <Suspense fallback={null}>
          <SpaceSphere />
        </Suspense>
        <OrbitControls maxDistance={500} minDistance={1} rotateSpeed={0.5} />
        <gridHelper args={[600, 50]} />
        <axesHelper args={[500]} />
        <Sun />
      </Canvas>
    </div>
  );
}

export default App;