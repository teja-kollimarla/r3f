import "./App.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import Sun from "./components/Sun";
import { Leva } from "leva";
import SpaceSphere from "./components/backgroundd";

function App() {
  return (
    <div style={{ height: "100vh", position: "relative" }}>
      {/* Leva Panel */}
      <Leva
        collapsed={false}
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          zIndex: 9999,
        }}
      />

      <Canvas camera={{ position: [100, 20, 80] }}>
        <Suspense fallback={null}>
          <SpaceSphere/>
        </Suspense>

        <OrbitControls maxDistance={500} minDistance={1} enableRotate={true} rotateSpeed={0.5} />

        <gridHelper args={[600, 50]} />
        <axesHelper args={[500]} />
        <Sun/>
      </Canvas>
    </div>
  );
}

export default App;