import { Canvas, useLoader } from "@react-three/fiber";
import { TextureLoader, BackSide } from "three";

function SpaceSphere() {
  const texture = useLoader(TextureLoader, '/space.jpg'); // ✅ simple loader, works with any jpg

  return (
    <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial
        map={texture}
        side={BackSide} // ✅ renders texture on inside of sphere
      />
    </mesh>
  );
}

export default SpaceSphere