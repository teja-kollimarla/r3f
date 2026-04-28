import { useRef } from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import useRotate from "../lib/rotate";
import useLeva from "../lib/leva";
import useSelected from "../lib/zustand";


export default function Sun() {
  const sun = useRef();
  const texture = useLoader(TextureLoader, "/sun.jpg");

  const { selected, setSelected } = useSelected((s) => ({
    selected: s.selected,
    setSelected: s.setSelected,
  }));

  const {
    speed = 0.01,
    size = 1,
    color = "orange",
    rotateX,
    rotateY,
    rotateZ,
  } = useLeva("Sun", {
    speed: { value: 0.01, min: 0, max: 0.1, step: 0.001 },
    size: { value: 1, min: 0.1, max: 10, step: 0.1 },
    color: "orange",
    rotateX: false,
    rotateY: true,
    rotateZ: false,
  });

  useRotate(sun, speed, rotateX, rotateY, rotateZ);

  return (
    <mesh
      ref={sun}
      scale={size}
      onPointerDown={(e) => {
        e.stopPropagation();         // ✅ prevent bubbling
        clickedRef.current = true;   // ✅ mark object click
        setSelected("Sun", e.object); // ✅ store actual mesh
        console.log("Sun clicked");
      }}
    >
      <sphereGeometry args={[10, 32, 32]} />
      <meshBasicMaterial map={texture} color={color} />
    </mesh>
  );
}